import { ServerState } from '@/app/useAgentOps';

export function StatusBar({ connected, state }: { connected: boolean; state: ServerState }) {
  const dot = connected ? 'bg-[var(--accent-green)]' : 'bg-[var(--accent-red)]';
  const label = connected ? '已连接' : '断开';
  const activeCalls = state.traces.filter(
    t => t.timestamp > Date.now() - 60000 && t.type === 'mcp_call'
  ).length;

  return (
    <div className="flex items-center gap-3 text-sm bg-[var(--bg-card)] border border-[var(--border)] rounded-lg px-3 py-2">
      <span className={`inline-block w-2.5 h-2.5 rounded-full ${dot}`} />
      <span className="text-[var(--text-primary)] font-medium">{label}</span>
      <span className="text-[var(--text-secondary)]">|</span>
      <span className="text-[var(--text-secondary)]">
        总调用 <span className="text-[var(--accent-blue)] font-mono">{state.mcpCallCount}</span>
      </span>
      <span className="text-[var(--text-secondary)]">|</span>
      <span className="text-[var(--text-secondary)]">
        活跃 <span className="text-[var(--accent-yellow)] font-mono">{activeCalls}/min</span>
      </span>
    </div>
  );
}
