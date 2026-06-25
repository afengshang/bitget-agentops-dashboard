export interface AgentTrace {
  id: string;
  timestamp: number;
  type: 'mcp_call' | 'decision' | 'alert' | 'error';
  method?: string;
  params?: Record<string, unknown>;
  response?: unknown;
  rationale?: string;
  duration?: number;
  status: 'success' | 'error' | 'pending';
  action?: string;
  confidence?: number;
}

export interface RiskMetrics {
  drawdown: number;
  sharpeRatio: number;
  winRate: number;
  profitFactor: number;
  totalTrades: number;
  exposure: number;
  currentPnl: number;
  maxDrawdown: number;
}

export interface Alert {
  id: string;
  timestamp: number;
  severity: 'info' | 'warning' | 'critical';
  rule: string;
  message: string;
  acknowledged: boolean;
}

export interface PLPoint {
  timestamp: number;
  value: number;
}

export interface AgentState {
  id: string;
  status: 'running' | 'idle' | 'error';
  connectedAt: number;
  mcpCallCount: number;
  lastActivity: number;
}

export interface ServerState {
  status: string;
  connectedAt: number | null;
  mcpCallCount: number;
  lastActivity: number | null;
  riskMetrics: RiskMetrics;
  traces: AgentTrace[];
  alerts: Alert[];
  plHistory: PLPoint[];
}
