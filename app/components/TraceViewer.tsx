'use client';

import { useEffect, useRef, useState } from 'react';
import { AgentTrace } from '@/lib/types';

const BADGE: Record<string, string> = {
  mcp_call: 'text-[var(--accent-blue)] border-[var(--accent-blue)]',
  decision: 'text-[var(--accent-purple)] border-[var(--accent-purple)]',
  alert: 'text-[var(--accent-yellow)] border-[var(--accent-yellow)]',
  error: 'text-[var(--accent-red)] border-[var(--accent-red)]',
};

const LABEL: Record<string, string> = {
  mcp_call: 'MCP 调用',
  decision: '决策',
  alert: '告警',
  error: '错误',
};

export function TraceViewer({ traces }: { traces: AgentTrace[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [traces, autoScroll]);

  const recent = traces.slice(-50).reverse();

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)]">
        <h2 className="text-sm font-semibold">Trace Viewer</h2>
        <label className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)] cursor-pointer select-none">
          <input type="checkbox" checked={autoScroll} onChange={e => setAutoScroll(e.target.checked)} />
          自动滚动
        </label>
      </div>
      <div ref={scrollRef} className="h-[340px] overflow-y-auto" onScroll={() => {}}>
        {recent.length === 0 ? (
          <div className="flex items-center justify-center h-full text-xs text-[var(--text-secondary)]">
            等待 Agent 连接并产生 trace...
          </div>
        ) : (
          <table className="w-full text-xs font-mono">
            <tbody>
              {recent.map(t => (
                <tr key={t.id} className="border-b border-[var(--border)]/50 hover:bg-white/[0.02]">
                  <td className="px-3 py-2 text-[var(--text-secondary)] w-20 whitespace-nowrap">
                    {new Date(t.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="px-2 py-2 w-20">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${BADGE[t.type] || ''}`}>
                      {LABEL[t.type] || t.type}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-[var(--text-primary)]">
                    {t.method || t.action || '—'}
                  </td>
                  <td className="px-2 py-2 text-[var(--text-secondary)] max-w-[260px] truncate" title={t.rationale || ''}>
                    {t.rationale || (t.response ? JSON.stringify(t.response).slice(0, 60) : '—')}
                  </td>
                  <td className="px-2 py-2 text-right">
                    {t.confidence !== undefined && (
                      <span className="text-[var(--accent-purple)]">
                        {(t.confidence * 100).toFixed(0)}%
                      </span>
                    )}
                  </td>
                  <td className="px-2 py-2 text-right text-[var(--text-secondary)]">
                    {t.duration ? `${t.duration}ms` : ''}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <span className={t.status === 'success' ? 'text-[var(--accent-green)]' : 'text-[var(--accent-red)]'}>
                      {t.status === 'success' ? 'OK' : 'ERR'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="px-3 py-1.5 border-t border-[var(--border)] text-[11px] text-[var(--text-secondary)]">
        {traces.length} 条记录，显示最近 {recent.length} 条
      </div>
    </div>
  );
}
