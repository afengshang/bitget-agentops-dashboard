'use client';

import { useAgentOps } from './useAgentOps';
import { StatusBar } from './components/StatusBar';
import { RiskOverview } from './components/RiskOverview';
import { TraceViewer } from './components/TraceViewer';
import { AlertPanel } from './components/AlertPanel';
import { PLChart } from './components/PLChart';

export default function Home() {
  const { state, connected, acknowledgeAlert } = useAgentOps();

  return (
    <main className="min-h-screen p-4 md:p-6 space-y-4 max-w-[1600px] mx-auto">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            Bitget AgentOps <span className="text-sm font-normal text-[var(--text-secondary)]">Dashboard</span>
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">AI 交易 Agent 实时可观测性面板</p>
        </div>
        <StatusBar connected={connected} state={state} />
      </header>

      <RiskOverview metrics={state.riskMetrics} mcpCallCount={state.mcpCallCount} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <TraceViewer traces={state.traces} />
          <PLChart history={state.plHistory} />
        </div>
        <AlertPanel alerts={state.alerts} onAcknowledge={acknowledgeAlert} />
      </div>
    </main>
  );
}
