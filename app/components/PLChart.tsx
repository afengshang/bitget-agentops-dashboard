'use client';

import { useEffect, useRef } from 'react';
import { PLPoint } from '@/lib/types';

export function PLChart({ history }: { history: PLPoint[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || history.length < 2) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const pad = { top: 10, right: 16, bottom: 22, left: 50 };
    const pw = w - pad.left - pad.right;
    const ph = h - pad.top - pad.bottom;

    const values = history.map(p => p.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    const x = (i: number) => pad.left + (i / (history.length - 1)) * pw;
    const y = (v: number) => pad.top + (1 - (v - min) / range) * ph;

    ctx.clearRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const gy = pad.top + (i / 4) * ph;
      ctx.beginPath(); ctx.moveTo(pad.left, gy); ctx.lineTo(w - pad.right, gy); ctx.stroke();
    }

    // Y axis labels
    ctx.fillStyle = 'var(--text-secondary)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const v = min + (range * (4 - i)) / 4;
      const gy = pad.top + (i / 4) * ph;
      ctx.fillText(`$${v.toFixed(0)}`, pad.left - 6, gy + 3);
    }

    // Zero line
    if (min < 0 && max > 0) {
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.beginPath(); ctx.moveTo(pad.left, y(0)); ctx.lineTo(w - pad.right, y(0)); ctx.stroke();
    }

    // Area fill
    ctx.beginPath();
    ctx.moveTo(x(0), y(0));
    for (let i = 0; i < history.length; i++) ctx.lineTo(x(i), y(history[i].value));
    ctx.lineTo(x(history.length - 1), y(0));
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, pad.top, 0, h - pad.bottom);
    grad.addColorStop(0, 'rgba(63, 185, 80, 0.15)');
    grad.addColorStop(1, 'rgba(63, 185, 80, 0.01)');
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    for (let i = 0; i < history.length; i++) {
      i === 0 ? ctx.moveTo(x(i), y(history[i].value)) : ctx.lineTo(x(i), y(history[i].value));
    }
    ctx.strokeStyle = '#3fb950';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Time labels
    ctx.fillStyle = 'var(--text-secondary)';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    const times = history.map(p => new Date(p.timestamp).toLocaleTimeString());
    ctx.fillText(times[0], x(0), h - 4);
    ctx.fillText(times[times.length - 1], x(history.length - 1), h - 4);

  }, [history]);

  if (history.length < 2) {
    return (
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-3">
        <h2 className="text-sm font-semibold mb-2">P&L 实时</h2>
        <div className="h-[180px] flex items-center justify-center text-xs text-[var(--text-secondary)]">
          等待交易数据...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-3">
      <h2 className="text-sm font-semibold mb-1">P&L 实时</h2>
      <canvas ref={canvasRef} className="w-full h-[180px]" />
    </div>
  );
}
