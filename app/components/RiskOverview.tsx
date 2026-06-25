import { RiskMetrics } from '@/lib/types';

const cardStyle = "bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-3";

export function RiskOverview({ metrics, mcpCallCount }: { metrics: RiskMetrics; mcpCallCount: number }) {
  const items = [
    { label: '当前 PnL', value: `${metrics.currentPnl > 0 ? '+' : ''}$${metrics.currentPnl.toFixed(0)}`, ok: metrics.currentPnl >= 0 },
    { label: 'Drawdown', value: `${metrics.drawdown.toFixed(1)}%`, ok: metrics.drawdown < 10 },
    { label: '最大回撤', value: `${metrics.maxDrawdown.toFixed(1)}%`, ok: metrics.maxDrawdown < 15 },
    { label: 'Sharpe', value: metrics.sharpeRatio.toFixed(2), ok: metrics.sharpeRatio > 0.5 },
    { label: '胜率', value: `${(metrics.winRate * 100).toFixed(0)}%`, ok: metrics.winRate > 0.4 },
    { label: '盈亏比', value: metrics.profitFactor.toFixed(2), ok: metrics.profitFactor > 1 },
    { label: '仓比', value: `${metrics.exposure.toFixed(0)}%`, ok: metrics.exposure < 80 },
    { label: '总交易', value: String(metrics.totalTrades), ok: true },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      {items.map(i => (
        <div key={i.label} className={cardStyle}>
          <div className="text-[11px] text-[var(--text-secondary)] mb-1">{i.label}</div>
          <div className={`font-mono font-semibold text-sm ${i.ok ? 'text-[var(--accent-green)]' : 'text-[var(--accent-red)]'}`}>
            {i.value}
          </div>
        </div>
      ))}
    </div>
  );
}
