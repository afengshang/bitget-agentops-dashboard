const { WebSocketServer } = require('ws');

const PORT = 4001;

const wss = new WebSocketServer({ port: PORT });

console.log(`[AgentOps WS] Listening on ws://localhost:${PORT}`);

function createRiskMetrics() {
  return {
    drawdown: 0,
    sharpeRatio: 0,
    winRate: 0,
    profitFactor: 0,
    totalTrades: 0,
    exposure: 0,
    currentPnl: 0,
    maxDrawdown: 0,
  };
}

let state = {
  status: 'idle',
  connectedAt: null,
  mcpCallCount: 0,
  lastActivity: null,
  riskMetrics: createRiskMetrics(),
  traces: [],
  alerts: [],
  plHistory: [],
  agentId: 'agent-ops-001',
  startedAt: Date.now(),
};

const ALERT_RULES = [
  {
    id: 'drawdown-breaker',
    rule: 'Drawdown > 10%',
    severity: 'critical',
    check: (m) => m.drawdown > 10,
    message: (m) => `Drawdown 超过 10%: ${m.drawdown.toFixed(2)}%`,
  },
  {
    id: 'high-frequency',
    rule: '异常交易频率',
    severity: 'warning',
    check: (_, traces) => {
      const recent = traces.filter(t => t.timestamp > Date.now() - 60000 && t.type === 'mcp_call');
      return recent.length > 20;
    },
    message: () => '过去 1 分钟内 MCP 调用频率异常 (>20 次)',
  },
  {
    id: 'position-limit',
    rule: '单笔仓位超限',
    severity: 'warning',
    check: (m) => m.exposure > 80,
    message: (m) => `仓位占比超过 80%: ${m.exposure.toFixed(1)}%`,
  },
  {
    id: 'max-drawdown-history',
    rule: '历史最大回撤 > 15%',
    severity: 'critical',
    check: (m) => m.maxDrawdown > 15,
    message: (m) => `历史最大回撤超过 15%: ${m.maxDrawdown.toFixed(2)}%`,
  },
];

function runAlertChecks() {
  ALERT_RULES.forEach(rule => {
    const triggered = rule.check(state.riskMetrics, state.traces);
    if (triggered) {
      const recent = state.alerts.find(
        a => a.rule === rule.id && a.timestamp > Date.now() - 30000
      );
      if (!recent) {
        const alert = {
          id: `alert-${Date.now()}-${rule.id}`,
          timestamp: Date.now(),
          severity: rule.severity,
          rule: rule.rule,
          message: rule.message(state.riskMetrics, state.traces),
          acknowledged: false,
        };
        state.alerts.push(alert);
        console.log(`[Alert] ${rule.severity}: ${alert.message}`);
      }
    }
  });
}

function updateRiskMetrics(trace) {
  const m = state.riskMetrics;
  m.totalTrades++;

  const tradePnl = (Math.random() - 0.45) * 100;
  m.currentPnl += tradePnl;
  m.drawdown = m.currentPnl < 0 ? Math.abs(m.currentPnl) / 1000 : 0;
  m.maxDrawdown = Math.max(m.maxDrawdown, m.drawdown);
  m.winRate = m.totalTrades > 0
    ? (m.totalTrades - Math.floor(m.totalTrades * 0.35)) / m.totalTrades
    : 0;
  m.profitFactor = m.winRate > 0 ? 1.2 + Math.random() * 0.3 : 0;
  m.exposure = 30 + (Math.random() - 0.5) * 20;
  m.sharpeRatio = 0.8 + (Math.random() - 0.5) * 0.6;
}

wss.on('connection', (ws) => {
  console.log('[AgentOps] Client connected');
  state.status = 'running';
  state.connectedAt = Date.now();

  ws.send(JSON.stringify({ type: 'state_sync', data: state }));

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);

      if (msg.type === 'trace') {
        const trace = {
          id: `trace-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          timestamp: Date.now(),
          ...msg.data,
        };
        state.traces.push(trace);
        state.mcpCallCount++;
        state.lastActivity = Date.now();

        if (trace.type === 'mcp_call') {
          updateRiskMetrics(trace);
        }

        if (state.plHistory.length === 0 || Date.now() - state.plHistory[state.plHistory.length - 1].timestamp > 5000) {
          state.plHistory.push({
            timestamp: Date.now(),
            value: Math.round(state.riskMetrics.currentPnl * 100) / 100,
          });
          if (state.plHistory.length > 200) state.plHistory.shift();
        }

        runAlertChecks();

        wss.clients.forEach(c => {
          if (c.readyState === 1) {
            c.send(JSON.stringify({ type: 'trace_update', data: trace }));
            c.send(JSON.stringify({ type: 'state_sync', data: state }));
          }
        });
      }
    } catch {
      // ignore malformed messages
    }
  });

  ws.on('close', () => {
    console.log('[AgentOps] Client disconnected');
    state.status = 'idle';
  });
});

process.on('SIGINT', () => { wss.close(); process.exit(); });
process.on('SIGTERM', () => { wss.close(); process.exit(); });
