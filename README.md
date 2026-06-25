# Bitget AgentOps Dashboard

面向 Bitget 生态 AI 交易 Agent 的实时可观测性面板 — Agent 决策追踪、风控告警、MCP 调用审计。

## 快速开始

```bash
# 安装依赖
npm install

# 1) 启动 WebSocket 服务器
npm run ws-server

# 2) 启动 Dashboard（新终端）
npm run dev

# 3) 启动 Mock Agent 生成 Trace（新终端）
npm run mock-agent
```

或一键启动：

```bash
npm run demo
```

访问 http://localhost:3000 查看 Dashboard。

## 功能

| 模块 | 说明 |
| --- | --- |
| **Trace Viewer** | 实时流式展示 Agent 决策链，含 MCP 方法调用、参数、响应、Rationale、置信度、耗时 |
| **Risk Overview** | 8 项风控指标面板：PnL、Drawdown、最大回撤、Sharpe、胜率、盈亏比、仓位占比、交易数 |
| **Alert Panel** | 4 条告警规则：Drawdown > 10%、高频交易检测、仓位超限、历史最大回撤 |
| **P&L 实时图** | Canvas 绘制实时 P&L 曲线，含零线参考和面积填充 |
| **Status Bar** | 连接状态、总 MCP 调用数、活跃调用速率 |

## 风控告警规则

| 规则 | 级别 | 条件 |
| --- | --- | --- |
| Drawdown Breaker | CRIT | 当前回撤 > 10% |
| 高频交易检测 | WARN | 1 分钟内 MCP 调用 > 20 次 |
| 仓位超限 | WARN | 仓位占比 > 80% |
| 历史回撤超限 | CRIT | 历史最大回撤 > 15% |

## Agent 集成契约

Agent 通过 WebSocket（`ws://localhost:4001`）连接并发送 trace 消息：

```json
{
  "type": "trace",
  "data": {
    "type": "mcp_call | decision",
    "method": "spot_get_ticker",
    "params": { "symbol": "BTCUSDT" },
    "response": { "code": 0, "data": { "price": 65000.00 } },
    "rationale": "BTC 突破关键阻力位，RSI 多头确认",
    "confidence": 0.82,
    "duration": 150,
    "status": "success"
  }
}
```

## 技术栈

- **前端**: Next.js 14 + React 18 + Tailwind CSS + Canvas
- **后端**: Node.js WebSocket Server (ws)
- **Mock**: 模拟 Agent 生成多样化的 MCP 调用和决策 trace

## Bitget 集成

本 Dashboard 设计对接 Bitget MCP Server 生态：
- `mcp-read-only`: 通过只读 MCP 获取行情/账户数据展示
- `spot-public` / `futures-public`: 公开行情数据
- `mock-integration-server`: 本地 mock 验证 Agent-Dashboard 集成
- `paper-trading`: 模拟盘隔离

## 安全边界

- 默认只读模式，不执行实盘交易
- 不存储 API Key / Secret / Passphrase
- Mock Agent 使用 paper-trading 标记隔离
- 不请求提现权限
