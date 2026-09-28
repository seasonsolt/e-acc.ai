# 产品 1：国产模型 Coding Plan 选择器 + 配置生成器

> 矩阵里的第一个产品（ADR-0005）。路径：`e-acc.ai/coding-plan`。状态：草案，2026-09-28。
> 标注（待核实）的内容上线前必须对照厂商官网核实。

## 一句话

选择你用的 AI 编程客户端（Claude Code / Codex CLI / opencode）和国产模型厂商，立刻得到可以直接粘贴的配置，同时看到各家 Coding Plan 的价格和额度对比。

## 为什么先做它（需求证据）

以下都是 2026-09-28 实测的 Google / Bing 联想词：

| 需求 | 联想词 |
|---|---|
| Claude Code 接国产模型 | claude code 使用deepseek、claude code 配置 deepseek v4、claude code 接入 deepseek v4、claude code 怎么用 glm / minimax / 国内的模型、claude code 国内模型 |
| Codex 接第三方模型 | codex 使用 deepseek、codex 使用第三方模型、codex 怎么用 第三方api、codex 怎么用ccswitch |
| 选哪家、多少钱 | coding plan 对比（待核实）、glm coding plan 价格（待核实） |

- **受众是现成的**：赢家页读者约 86% 用桌面端，本来就是一批被「怎么用上 AI 编程」卡住的开发者。
- **合规**：读者直接付钱给国产厂商，用的是厂商官方的兼容端点。不涉及地域规避，不转售任何额度，符合 ADR-0001。

## 与 e-accs.com 文章分区的对应

「AI 编程 × 国产模型」文章分区（方案 §4.1）里的每篇文章，只放一个最小配置，文末链到本产品，并带上预选参数，例如 `e-acc.ai/coding-plan?client=claude-code&vendor=deepseek`。

| e-accs.com 文章 | 落到产品的哪一步 |
|---|---|
| /ai-coding/claude-code-deepseek | client=claude-code, vendor=deepseek |
| /ai-coding/claude-code-glm-coding-plan | client=claude-code, vendor=glm |
| /ai-coding/coding-plan-comparison（hub） | 价格对比表（完整版在产品里） |
| /ai-coding/codex-third-party-models | client=codex |
| /ai-coding/cc-switch | 付费包里的 CC Switch 预设 |

## v1 范围（零后端、零登录）

**页面**：`e-acc.ai/coding-plan`，中文（`lang="zh-CN"`）。首屏就是工具，下面放说明内容，按哥飞「内容型工具站」的做法。

1. **选择器**：客户端 × 厂商，还有「按月预算 / 用量」这个可选维度。
2. **输出**：
   - 配置片段：环境变量、`~/.claude/settings.json`、Codex `config.toml`、opencode 配置。
   - 一条验证命令。
   - 这个组合下常见报错的原文和处理办法。
3. **价格与额度对比表**：从 `site/data/coding-plans.json` 生成，每行都带 `source_url` 和 `verified_at`。
4. **说明内容**（≥1,000 字，满足 TDH）：怎么选、各家兼容端点有什么区别、常见问题。
5. **付费入口**：全厂商预设包（见下文）。

**免费与付费的分界**

| 免费 | ¥29 全厂商预设包 |
|---|---|
| 单个客户端 × 单个厂商的配置 | 所有客户端 × 所有厂商的预设：cc-switch profiles、Codex `config.toml`、opencode |
| 价格对比表 | CLAUDE.md / AGENTS.md 与 skill 模板 |
| | 用量与成本统计脚本 |
| | 厂商改价或改额度后 30 天内免费更新 |

付费包不包含任何账号、支付或地域相关内容，标题保持中性。

## 技术实现

- **数据**：新增 `site/data/coding-plans.json`。
  - 字段：vendor、plan、¥月价、额度、Anthropic 兼容端点、OpenAI 兼容端点、支持的客户端、返佣类型（现金 / 额度 / 无）、verified_at、source_url。
  - `verify.mjs` 负责校验 schema，verified_at 超过 35 天发**警告**（不阻断构建）。
- **页面**：新增 `gen/pages/coding-plan.mjs`，并入现有静态生成器。
  - `gen/layout.mjs` 需要支持按页设置 `lang` 和中文导航文案。现在是全站英文，这里是改动点。
  - 选择器逻辑放在一个小 JS 文件里，默认组合（Claude Code + DeepSeek）的结果**预渲染进 HTML**，保证搜索引擎能读到内容。
- **收费**：v1 直接链到小报童或面包多上架的商品，零集成；月 GMV 到 ¥1,000 后再考虑用面包多Pay 在页面上自收款（Pages Function 回调，待核实）。
- **SEO**：URL 上线后永不修改；进 sitemap；从 /pricing、/calculator 和 e-accs.com 各分区链入。

## 上线前要先核实的数据（约 2 小时）

| 厂商 | 需要核实 |
|---|---|
| DeepSeek | 官方定价页已列出 Anthropic 格式的 BASE URL `https://api.deepseek.com/anthropic`（2026-09-28 已见）；模型名 `deepseek-flash` |
| 智谱 GLM | Coding Plan 各档价格和额度、兼容端点（待核实） |
| Kimi | API 价格、Anthropic 兼容端点（待核实） |
| MiniMax | Coding / Token Plan 现状（条款页已 404，待核实） |
| 阿里云百炼 | 是否有 Claude Code / Codex 可用的端点，云大使是否覆盖（待核实） |
| 火山方舟 | Coding Plan 价格、额度、端点（待核实） |

只把**核实过**的厂商放进表格。没核实的不上线，宁缺毋滥。

## 度量与闸门（沿用方案 §6）

- **每周看**：工具页 RUM 访问、各参数组合的使用情况（用 URL 参数计数，不收集个人数据）、付费点击率、订单数。
- **11-12**：¥29 包 ≥3 单，**或**来自 `ai-coding` 标签的订阅 ≥10 且付费点击率 ≥2%。不通过就不写 ¥69 手册。
- **12-15**：累计 ≥500 次访问仍是 0 单，就改价格和付费入口的位置。

## 排期

| 日期 | 事项 |
|---|---|
| 10-02 前 | 数据核实，写好 `coding-plans.json` |
| 10-06 前 | 生成器支持 lang；完成页面和选择器；预渲染默认组合 |
| 10-08 | 与 e-accs.com 的 DeepSeek 文章同日上线（此时付费入口先放订阅表单） |
| 10-21 | 付费包上架，与 hub 文章同日 |

## 红线

- 不收录、不链接、不推荐：中转站、代充、账号、订阅转 API。
- Claude Code 的配置只写「用某厂商自己的 API key 连它的官方兼容端点」这一种，不涉及任何 Anthropic 账号、支付或地域相关步骤。
- 推广链接一律标注。
