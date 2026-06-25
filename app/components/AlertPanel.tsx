import { Alert } from '@/lib/types';

const SEVERITY_STYLE: Record<string, string> = {
  info: 'border-l-[var(--accent-blue)]',
  warning: 'border-l-[var(--accent-yellow)]',
  critical: 'border-l-[var(--accent-red)] bg-[var(--accent-red)]/5',
};

const SEVERITY_LABEL: Record<string, string> = {
  info: 'INFO',
  warning: 'WARN',
  critical: 'CRIT',
};

export function AlertPanel({ alerts, onAcknowledge }: {
  alerts: Alert[];
  onAcknowledge: (id: string) => void;
}) {
  const unacknowledged = alerts.filter(a => !a.acknowledged).reverse();

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg flex flex-col">
      <div className="px-3 py-2 border-b border-[var(--border)] flex items-center justify-between">
        <h2 className="text-sm font-semibold">告警</h2>
        {unacknowledged.length > 0 && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent-red)] text-white font-semibold">
            {unacknowledged.length}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto max-h-[420px]">
        {unacknowledged.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-xs text-[var(--text-secondary)]">
            暂无告警
          </div>
        ) : (
          unacknowledged.map(a => (
            <div
              key={a.id}
              className={`px-3 py-2.5 border-b border-[var(--border)]/50 border-l-2 ${SEVERITY_STYLE[a.severity] || ''}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[10px] font-bold ${
                      a.severity === 'critical' ? 'text-[var(--accent-red)]' :
                      a.severity === 'warning' ? 'text-[var(--accent-yellow)]' :
                      'text-[var(--accent-blue)]'
                    }`}>
                      {SEVERITY_LABEL[a.severity]}
                    </span>
                    <span className="text-[10px] text-[var(--text-secondary)] font-mono">
                      {a.rule}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-primary)]">{a.message}</p>
                </div>
                <button
                  onClick={() => onAcknowledge(a.id)}
                  className="shrink-0 text-[10px] px-2 py-0.5 rounded border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)] transition-colors"
                >
                  确认
                </button>
              </div>
              <div className="text-[10px] text-[var(--text-secondary)] mt-1 font-mono">
                {new Date(a.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="px-3 py-1.5 border-t border-[var(--border)] text-[11px] text-[var(--text-secondary)]">
        共 {alerts.length} 条告警，{unacknowledged.length} 条未确认
      </div>
    </div>
  );
}
