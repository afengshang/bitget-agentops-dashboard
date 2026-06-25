'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { AgentTrace, RiskMetrics, Alert, PLPoint, AgentState } from '@/lib/types';

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

const EMPTY_METRICS: RiskMetrics = {
  drawdown: 0, sharpeRatio: 0, winRate: 0, profitFactor: 0,
  totalTrades: 0, exposure: 0, currentPnl: 0, maxDrawdown: 0,
};

const EMPTY_STATE: ServerState = {
  status: 'disconnected',
  connectedAt: null,
  mcpCallCount: 0,
  lastActivity: null,
  riskMetrics: EMPTY_METRICS,
  traces: [],
  alerts: [],
  plHistory: [],
};

export function useAgentOps() {
  const [state, setState] = useState<ServerState>(EMPTY_STATE);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const tracesRef = useRef<AgentTrace[]>([]);
  const alertsRef = useRef<Alert[]>([]);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:4001');
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === 'state_sync') {
          const s = msg.data as ServerState;
          tracesRef.current = s.traces || [];
          alertsRef.current = s.alerts || [];
          setState(s);
        } else if (msg.type === 'trace_update') {
          setState(prev => ({
            ...prev,
            traces: [...prev.traces, msg.data],
            mcpCallCount: prev.mcpCallCount + 1,
            lastActivity: Date.now(),
          }));
        }
      } catch { /* ignore */ }
    };

    return () => ws.close();
  }, []);

  const acknowledgeAlert = useCallback((alertId: string) => {
    setState(prev => ({
      ...prev,
      alerts: prev.alerts.map(a => a.id === alertId ? { ...a, acknowledged: true } : a),
    }));
  }, []);

  return { state, connected, acknowledgeAlert };
}
