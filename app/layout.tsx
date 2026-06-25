import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bitget AgentOps Dashboard',
  description: 'Real-time observability for Bitget AI trading agents — trace viewer, risk alerts, MCP audit',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
