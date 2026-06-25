const WebSocket = require('ws');

const WS_URL = process.env.WS_URL || 'ws://localhost:4001';
const ws = new WebSocket(WS_URL);

const MCP_METHODS = [
  { method: 'spot_get_ticker', params: { symbol: 'BTCUSDT' } },
  { method: 'spot_get_depth', params: { symbol: 'BTCUSDT', limit: 10 } },
  { method: 'spot_get_kline', params: { symbol: 'BTCUSDT', interval: '1m' } },
  { method: 'futures_get_ticker', params: { symbol: 'BTCUSDT' } },
  { method: 'futures_get_position', params: { symbol: 'BTCUSDT' } },
  { method: 'account_get_balance', params: {} },
  { method: 'futures_place_order', params: { symbol: 'BTCUSDT', side: 'long' } },
  { method: 'spot_place_order', params: { symbol: 'ETHUSDT', side: 'short' } },
  { method: 'futures_get_kline', params: { symbol: 'ETHUSDT', interval: '5m' } },
  { method: 'futures_close_position', params: { symbol: 'BTCUSDT' } },
];

const RATIONALES = [
  'BTCUSDT 突破 15 分钟布林带上轨，RSI 超买区域回落，短线做空信号',
  'ETHUSDT 4 小时 MACD 金叉确认，成交量放大，开多仓',
  '市场情绪指数转正，BTC 资金费率正常，适合轻仓介入',
  'USDT 永续合约基差收敛至合理区间，持仓量无异常',
  '短期均线上穿中期均线，K 线形态呈现看涨吞没',
  '波动率溢价偏高，期权市场暗示下方支撑稳固',
  '宏观经济数据利好风险资产，加密市场联动走强预期',
  '链上数据显示大额转账激增，短期波动可能加剧，减仓观望',
];

const ACTIONS = [
  'OPEN_LONG', 'OPEN_SHORT', 'CLOSE_POSITION', 'ADJUST_STOP_LOSS',
  'INCREASE_LEVERAGE', 'DECREASE_LEVERAGE', 'TAKE_PROFIT', 'NO_ACTION',
];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function genTrace() {
  const m = randomItem(MCP_METHODS);
  const success = Math.random() > 0.1;
  const isDecision = Math.random() > 0.6;

  if (isDecision) {
    return {
      type: 'decision',
      method: m.method,
      params: m.params,
      action: randomItem(ACTIONS),
      rationale: randomItem(RATIONALES),
      confidence: Math.round((0.55 + Math.random() * 0.4) * 100) / 100,
      duration: Math.round(Math.random() * 500 + 100),
      status: 'success',
    };
  }

  return {
    type: 'mcp_call',
    method: m.method,
    params: m.params,
    response: success
      ? { code: 0, data: { price: Math.round((60000 + Math.random() * 10000) * 100) / 100, volume: Math.round(Math.random() * 1000) } }
      : { code: -1, error: 'rate limit exceeded' },
    duration: Math.round(Math.random() * 300 + 50),
    status: success ? 'success' : 'error',
  };
}

async function run() {
  await new Promise(r => ws.on('open', r));
  console.log('[Mock Agent] Connected to AgentOps WS');

  // Send initial agent state
  ws.send(JSON.stringify({
    type: 'agent_state',
    data: {
      id: 'agent-ops-001',
      status: 'running',
      connectedAt: Date.now(),
    },
  }));

  let count = 0;
  while (count < 100) {
    const trace = genTrace();
    ws.send(JSON.stringify({ type: 'trace', data: trace }));
    console.log(`[Mock Agent] Sent ${trace.type}: ${trace.method} → ${trace.status}`);
    count++;
    await sleep(2000 + Math.random() * 4000);
  }

  console.log('[Mock Agent] Done — 100 traces sent');
  ws.close();
}

run().catch(console.error);
