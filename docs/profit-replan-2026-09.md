# e-acc.ai / www.e-accs.com 流量与盈利调整方案（2026-09-28）

> **依据**：Cloudflare GraphQL（RUM 真实浏览器，约 10× 抽样，±10–20）、e-acc.ai 的 GSC 90 天数据、哥飞资料全量研读（184 个来源读了 182 个，提炼出 318 条原则）、Google/Bing 联想词与 SERP 调研，以及三路事实核查（厂商官方定价页/更新日志、返佣条款原文、两站源码与线上 HTML）。另有 4 套竞争方案经 3 位评审打分，综合稿又经过一轮完整性审查。
> 标注 **（待核实）** 的内容未经一手验证。「赢家页」= `www.e-accs.com/notes/claude-subscription-ios-apple-gift-card`。

**今天已完成**
- ✅ `sc-domain:e-accs.com` 已在 GSC 验证（明天起可看到赢家页的真实查询词）。
- ✅ `e-accs.com` 根域名原来不解析，现已 301 到 `https://www.e-accs.com`（保留路径和参数）。
- ✅ `www.e-acc.ai` 原来 NXDOMAIN，现已 301 到 `https://e-acc.ai`。
- ✅ e-acc.ai 数据修正已上线（§3.1 第 5 项）：DeepSeek 新价格、8 个时间线事件，17 个型号全部对照官方页核实；IndexNow 已提交。
- ✅ e-accs.com 每页 head + 自动 sitemap 已在 preview 分支 `seo/per-page-head-sitemap`（§3.1 第 7 项），计划约 10-05 合并。

> **修订（2026-09-28，站长决定，见 `docs/adr/0005-official-site-and-saas-matrix.md`）**
> - **e-accs.com = 官网 + 引流**：首页介绍 e-acc 和产品；下面是「关键词文章分区」，按赢家页的打法做搜索流量，每个分区的文章都链到对应产品。§2.1、§3、§4 的 e-accs.com 工作照常执行，文章分区对应的产品链接改为指向 e-acc.ai。
> - **e-acc.ai = AI SaaS 矩阵**：产品放在 `e-acc.ai/<产品>` 路径下，现有已收录页面保留原 URL，作为免费工具区。这取代 §2.3 的「停放」定位，也取代 §6 里「12-27 挂牌出售」这一闸门。
> - **ADR**：以 ADR-0005 为准，它取代了 §2.4 表格里的 0005/0006 草案。0006（返佣与赞助政策）仍然需要写。ADR-0001 不变，适用于矩阵里的每个产品。
> - **第一个产品**：国产模型 Coding Plan 选择器 + 配置生成器，见 `docs/products/coding-plan.md`。原计划的 ¥29 配置包并入这个产品。

---

## 1. 结论与诊断

**一句话**：e-acc.ai 当前的定位靠 SEO 赚不到钱。90 天里约 90% 的时间应该投到 Google 已经信任的 www.e-accs.com，围绕「中国开发者用 AI 编程工具」这个已被验证的需求，做一组**合规**的「Claude Code / Codex / opencode + 国产模型」页面，靠自有付费产品变现。e-acc.ai 转为停放状态。

**诚实的预期（算式见 §5）**：

| | 第 1 个月 | 第 3 个月 | 第 6 个月 |
|---|---|---|---|
| 保守收入 | ≈ $1 | ≈ $3 | ≈ $5 |
| 中性收入 | ≈ $2 | ≈ $14 | ≈ $28 |
| 固定成本（亲测订阅 + 礼品卡复测 + 手续费） | $8–15 | $8–15 | $8–15 |

- **靠 SEO + 内容变现，90 天内做不到「快速盈利」**。现实目标是：第 25–35 天出第一单，中性情况下第 3–4 个月前后净收支转正。
- 真正能更快拿到现金的杠杆不在 SEO，而在你本人的专业能力：付费答疑或 B2B 咨询，每季度成交 1 单 ¥2,000 ≈ $93/月。这部分不计入预估，见 §5.1。
- 如果想要哥飞式的高方差上行，需要每周多投入 6–8 小时，并行跑精简版英文新词站（§8 决策 10）。

### 1.1 真实数据

| 指标 | e-acc.ai | www.e-accs.com |
|---|---|---|
| 近 30 天 RUM 访问 | 240（Google ≈10，Bing ≈10，落在 /pricing/deepseek-v4-flash） | 1,290（Google ≈650：google.com 450 + google.com.hk 200） |
| 近 5 个月趋势（按月） | 10 → 40 → 90 → 90 → 240 | 20 → 120 → 290 → 470 → 1,290 |
| 13 周 Google 来源访问 | ≈0 | 赢家页一页 ≈1,000 |
| GSC 近 3 个月 | **22 点击 / 3,000 曝光 / CTR 0.7% / 平均排名 29**，149 个查询 | 09-28 刚验证 |
| 收录 | 20 页已收录，1 页已抓取未编入索引 | 未知；手写 sitemap 只有 14 个 URL，漏了赢家页 |
| 外链 | **外部链接 0**（连自家 e-accs.com 都没链过来） | ≈0 |
| 点击分布 | 22 次点击里 16 次落在 /what-is-eacc（品牌词 e/acc） | 赢家页每周 Google 访问从 30 涨到 180（09-18 那周），仍在上升 |

### 1.2 对照哥飞方法论：e-acc.ai 为什么没流量

| 哥飞原则 | e-acc.ai 现状（证据） | 判定 |
|---|---|---|
| 「离钱越近越值钱」 | e/acc、时间线、术语表都是意识形态类信息词。联想词只有 meaning / manifesto / reddit，没有广告主。整个 e/acc 词簇一个季度约 1.3k 曝光，即使排到 5–20 名，天花板也很低 | **选词错（主因）** |
| 「有人搜索才做页面」 | 17 个型号页是「手里有什么数据就生成什么页」。90 天里型号页合计约 130 次曝光，能识别出的型号查询只有 15–20 次（导出不含匿名查询） | 没有需求先行 |
| 「保小图大」 | /pricing 直接去打 "llm api pricing comparison"。对手是覆盖 164–300+ 个模型、每天更新的数据库，e-acc.ai 在这类词上排 50–90 名 | 打的是打不动的词 |
| 「新词打时间差」（窗口 1–3 天） | 数据停在 09-02，漏掉 GPT-6 Astra（09-03，$10/$50）、Opus 5.5（09-22，$4/$20）、GPT-6 Sol/Luna（09-22）等 7 个新模型。Fable 5.1 次日就上线了，但 23 天的 GSC 导出里没有 "fable 5.1" 查询 | 速度慢；0 外链的域名光快也不够 |
| 「三五个外链等于没发」 | 外部链接 0。KD 0–10 约需 10 个引用域名，KD 11–30 约需 11–36 个 | **没有权重（主因之二）** |
| 每页 ≥600 词 | 25 个可索引页中 20 个不足 600 词。型号页的页面专属内容只有约 190–230 词，共用一段 83 词模板。/calculator 的结果表靠 JS 渲染（`<tbody>` 为空） | 太薄 |
| 「TDH 寸土寸金」 | 首页 H1 是没人会搜的口号 "the altar is fed by tokens"。所有生成页的 H1 和大部分 H2 都以伪 shell 命令开头（`gen/layout.mjs:85-88`），aria-hidden 挡不住 Google 抽取文本 | 关键词匹配打了折 |
| GSC 四级信号 / 网站权重 | 20/21 页已收录，属于一级信号「已收录但曝光少」。网站权重 = 4 ÷ 21 ≈ 1,905‱，远高于 100‱ 及格线 | **不是技术或惩罚问题** |
| 数据保鲜 | 唯一有 Bing 点击的 /pricing/deepseek-v4-flash 还挂着旧价 $0.44/$1.32。现价是 $0.30/$1.20（峰时），09-10 起由 V4.1-Flash 提供服务。首页「距上次前沿发布」计数器和 /api/latest-frontier.json 都是错的 | 损伤信任 |

**对照组**：e-accs.com 赢家页的技术 SEO 很差：没有 `<title>`，canonical 指向首页，不在 sitemap 里。但它每月拿到约 650 次 Google 访问，原因是：
- 离钱近：读者已经决定付费，只是卡在支付这一步。
- 中文 SERP 供给薄：联想词里总带着 linuxdo / v2ex，说明大家只能去论坛找答案。
- 标题带月份。
- 每一步都有截图。
- 被 Perplexity / ChatGPT 引用。

**结论：需求与竞争的匹配 > 域名 > 站内技术。**

---

## 2. 战略调整

### 2.1 主攻 www.e-accs.com（「老站追新词」「保小图大」「关键词树」）

1. **守住赢家页**
   - 只做增量保鲜。Pockyt 美区卡从约 09-18 起持续「补货中」，第 4 步必须马上修。
   - 这一页**不做任何变现**（不挂返佣、广告、打赏），因为它涉及地域规避。
   - 赢家页同时承接 pockyt 相关搜索，**不另开 Pockyt 页**：一个关键词只做一个页面，也不再新增规避类指南。
2. **修技术债**
   - 每页独立的 title / canonical，sitemap 自动生成，stub 页加 noindex。
   - **这是新页面能被收录的前提**：现在每页的 canonical 都指向首页，新页照样会继承这个错误。
3. **扩关键词树**
   - 在 /ai-coding/ 下，按「一词一页、标注日期、亲测」做「Claude Code / Codex / opencode + 国产模型（DeepSeek、GLM、Kimi、MiniMax、百炼）」。
   - 读者直接向国产厂商付费，不碰 Anthropic 账号，也不碰配额转售。
4. **变现顺序**（「用户付费远胜广告」「上线即接入支付」「中文站 eCPM 约为英文的 1/10」）
   - ① 自有产品：先上 ¥29 配置包，过闸后再做 ¥69 手册。
   - ② 阿里云云大使：**唯一**核实为可提现现金的厂商返佣。
   - ③ 只给额度的邀请计划（智谱赠 10%、火山代金券 5%）只记作成本抵扣。
   - ④ AdSense 延后。

### 2.2 放弃 / 停止

- **e-acc.ai 的增长工作**
  - 概念簇（/what-is-eacc、/eacc-vs-dacc、/eacc-glossary）、/timeline 叙事、/benchmark 镜像。页面保留原样；已有排名的页面冻结 **title 和 H1**。description 会随数据自动变化，这点接受。
  - 周更节奏、「weekly」字样、每个型号一个薄页、136 组 vs 矩阵、英文头部词。
- **等待页**（如 "deepseek v5 release date"）也不做。调研认为这类页面最好打，但 Fable 5.1 的测试说明：在一个 0 外链的域名上，光抢时间拿不到曝光。先有权重再说。
- **变现渠道**
  - EthicalAds：门槛约 5 万 PV/月，差约 200 倍。Carbon：邀请制，没有公开门槛，现实中不会接收这个量级的站。
  - OpenRouter、DeepSeek、Requesty：没有推荐计划。Router One、LLM Gateway：只给额度，不能提现。
- **e-accs.com 的做法**：不再手改 sitemap；不让 AI 批量改写赢家页；不新增地域规避类指南（Google Play 路线、虚拟卡、ChatGPT Plus 克隆）。
- **不计入本计划**：deck / 报告的工时。gateway/ 不碰（ADR-0002 已划出范围）。

### 2.3 e-acc.ai 新定位：停放的英文价格数据站

- **每月 ≤2 小时**，只做两件事：
  - 数据刷新。
  - tier-1 发布：OpenAI 或 Anthropic 旗舰、Google Pro、DeepSeek 大版本。release-watch 做好之后才承诺 24 小时内上线页面。
- **型号页策略**
  - `models.json` 加一个 `page` 字段，默认 `true`。非 tier-1 型号设为 `false`：只进 /pricing 表格和计算器，不生成独立页面。
  - 本次补录：GPT-6 Astra、Claude Opus 5.5 生成页面（tier-1）；GPT-6 Sol、GPT-6 Luna、Claude Opus 5、Gemini 3.8 Flash、Grok 4.7 设为 `page: false`。
  - 这两个 tier-1 页的发布窗口已过，补页是为了数据完整，**不作为流量赌注**。
  - 改动点（约 1–1.5 小时）：
    - `gen/pages/pricing.mjs:93` 的 leaves 只遍历 `page !== false`。
    - 叶子页的 related 列表（`pricing.mjs:94-98`）也要过滤。否则 GPT-6 Luna 成为最便宜型号后，会出现在每页的「others」里。
    - hub 表格对无页型号不输出链接。
    - `gen/pages/benchmark.mjs:17-21` 的 `slugFor` 同样过滤，因为 benchmark.json 里有 claude-opus-5 的数据。
    - verify 的链接检查不放宽。
- **与 e-accs.com 的互链**
  - 只在确实有对应页面时才加：deepseek-v4-flash/pro、kimi-k3、claude-* ↔ e-accs.com 的 DeepSeek / Pro vs Max 页。
  - 每页最多 1 个自家链接，避免被当成站群。
  - e-accs.com 的价格数据**直接取自厂商官网**，不依赖 e-acc.ai。
- **首页**：永久无广告。
- **12-27 做「卖掉还是停放」的决策（§6）**
  - 按目前数据，出售条件（28 天点击 <30）几乎一定会触发。
  - 出售前把 e-accs.com 指向它的链接改成 nofollow 或删除。

### 2.4 ADR 修订（需要你拍板，见 §8）

| ADR | 动作 | 要点 |
|---|---|---|
| 0001 不做配额套利 | 保持，正文不动 | 文末加「另见 ADR-0006」 |
| 0002 audience asset | 标记 Superseded by 0005 | 作废「newsletter → 赞助 → 六位数 UV 后才上广告」这条路径；保留「e-acc.ai 首页永久无广告」 |
| 0004 实测流量 | 标记 Partly superseded by 0005 | 测量结论继续有效；「卖掉还是运营」改为 12-27 日期触发，结论写入 0007 |
| **0005（新）** | 组合收割 | 赚钱的工作迁到 e-accs.com；e-acc.ai 停放；变现顺序为自有产品 > 现金返佣 > 广告；附全部止损日期 |
| **0006（新）** | 返佣、赞助与服务政策 | 把 0001 扩展为「我们链接什么、从谁那里赚钱」。denylist 见 §5.3。推广链接必须标注，并每月快照条款。**「规避步骤」的定义**：向 Anthropic 或 Apple 隐藏读者身份或位置的操作（时区、匿名邮箱、VPN）；商户自己的购买入口（如支付宝里切换城市）不算。**赢家页列为历史例外**：不变现、不复制、不再新增任何规避步骤。以后所有新页面都不写规避步骤。答疑和咨询只限国产模型、Codex、opencode，以及用 API key 配置 Claude Code，不涉及 Claude 账号、支付或地域问题 |
| 0007（12-27） | 第 90 天决策 | scale / hold / kill；e-acc.ai 卖掉还是停放 |

e-accs-com 仓库没有 ADR 目录，在 `docs/content-workflow.md` 里加两节：「赢家页变更协议」（§3.2）和「红线：见 e-acc.ai ADR-0006」。

---

## 3. 第 0–7 天（09-28 → 10-05，约 10 小时，按优先级）

### 3.1 清单

| # | 站点 | 文件 / 页面 | 改法 | 耗时 |
|---|---|---|---|---|
| 1 | ops | e-accs-com 仓库 | 先 `git pull origin main`（本地落后线上 89ae121 共 4 个提交）。两站都是 Cloudflare Pages Git 自动部署 | 0.25h |
| 2 | ops | GSC | **09-29 起**导出 `sc-domain:e-accs.com` 的网页表和查询表（28 天、3 个月）到 `docs/gsc/`。先确认能否回填到验证之前（待核实）。能回填，就用 **08-27→09-23 的 28 天**（中秋前）作基线；不能回填，就以 09-28→09-30 的 GSC 排名作临时基线，只看排名（RUM 只有访问量，判断不了排名）。建台账 `docs/ledger.md`，记收入、成本、工时 | 1h |
| 3 | **你本人亲测** | — | 用 US$2 卡测三条路线并截图：(a) shop.pockyt.io 网页端 + 支付宝扫码，SKU **9WLYdh2**；(b) 支付宝首页切到任一美国城市 → 优惠 → 大牌礼卡（待核实）；(c) SEAGM「Apple 礼品卡（美国）」+ Alipay (USD)（约 1% 手续费，目前只有一例用户报告）。成本约 $4–6 | 1h |
| 4 | e-accs.com | 赢家页 `.mdx` | **部署 A（约 10-01），只改第 4/5 步这一节**：主路径改为网页端 + SKU 9WLYdh2，加 App 内美国城市路线；「补货中」时的备选写 SEAGM（**普通链接，不加返佣**）；删掉失效的 aRMdE15 链接；提醒不要用 pockytshop.cn / .com 仿冒域名，也不要买闲鱼卡；在本步骤内注明「本步骤 2026-10-0X 实测」。**至少一条路线兑换成功后**才把标题里的「7 月」改成「10 月」，URL 和 H1 其余文字都不动。7 步/10 步不一致、提醒表单、FAQ 放到后续部署 | 2h |
| 5 | e-acc.ai | `site/data/models.json`、`timeline.json`、`gen/pages/{calculator,api,timeline}.mjs`、`gen/layout.mjs`、`gen/build.mjs`、`site/index.html` | **只做正确性修正**：deepseek-v4-flash（slug 不变）改为峰时 $0.30/$1.20、谷时 $0.15/$0.60，缓存命中 $0.006/$0.003，并注明「自 2026-09-10 起由 V4.1-Flash 提供服务」；gpt-5-6-sol 注释改为「2026-08-21 由 $5/$30 降价，促销至少到 11-21」；timeline 补 8 个事件（07-24 Opus 5、08-13 Gemini 3.7 Flash GA、09-02 Gemini 3.8 Flash GA、09-03 GPT-6 Astra、09-10 DeepSeek V4.1-Flash、09-21 Grok 4.7、09-22 GPT-6 Sol + Luna、09-22 Opus 5.5），顺带修好首页计数器和 latest-frontier.json；所有「weekly」字样改成与实际节奏一致（接受 /timeline 的 description 随之变化）；CLAUDE.md 里的 "Weekly data update" 改成 "Monthly data refresh + tier-1 launch-day entries"。然后执行 `npm run build && npm run verify && npm test`，push，再 `node gen/indexnow.mjs` | 1h |
| 6 | ops | Cloudflare / Bing / `site/_headers` | ✅ 根域名和 www 跳转已完成。剩下：两个 zone 打开 Crawler Hints；Bing Webmaster 从 GSC 导入两个站；`site/_headers` 给 `https://eacc.pages.dev/*` 加 `X-Robots-Tag: noindex`。law./sure. 子域对任意路径都返回 200、有可索引的登录页，要到各自项目里加 noindex（待你确认归属） | 0.5h |
| 7 | e-accs.com | `theme.config.jsx:30-54`、新建 `pages/_document.jsx`、`scripts/generate-sitemap.mjs`、`package.json` prebuild、`tests/sitemap.test.mjs`、`.gitignore`、`README.md:75`、各 stub 页的 frontmatter | **全站 head + sitemap（约 10-05），第一步排除赢家页。** 改动与验收见表下「第 7 项细则」 | 4.5h |

**第 7 项细则**

- **赢家页排除方式**：head 函数遇到赢家页路径时，直接返回旧 head 标签的 Fragment 常量（见 §3.3）。`_document.jsx` 在 `props.__NEXT_DATA__.page === WINNER && !WINNER_HEAD_V2` 时不输出 `lang`；等 10-19 切换时再一起加上。
- **其余页面**：
  - 独立 `<title>`、自指 canonical、各自的 description 和 og:*，`lang="zh-CN"`。
  - 删除失效的 Nextra 2 配置 `useNextSeoProps`。
  - stub 页加 `noindex: true`。
- **sitemap**：
  - 在 prebuild 阶段生成，追加在现有 prebuild 链后面。
  - 复用 `src/auth/access-policy.mjs` 的 `protectedRoutePrefixes`，排除受保护路径；同时排除 `noindex: true` 页和 404。
  - lastmod 只取 frontmatter 的 `updated:`；没有 `updated:` 的页不输出 lastmod。Cloudflare 构建可能是浅克隆，git 日期不可靠。
  - `git rm --cached public/sitemap.xml` 并把它加入 `.gitignore`。
- **验收**（先走 preview 分支，在本地 out/ 检查）：
  - 非赢家页：每页恰好 1 个 `<title>`，canonical 指向自己。
  - 赢家页：`<head>` 里从 `charSet` 到 `next-head-count` 之间的全部标签、`<html>` 标签、正文 `<article>` 都与线上逐字节一致。buildId、`/_next/static/` 的哈希、侧栏链接不参与比较。
  - `node --test`：sitemap 包含赢家页；不包含 /interviews、/fun、两个受保护的 agents 页，也不包含 noindex 页。

### 3.2 赢家页变更协议（写入 `docs/content-workflow.md`）

**规则**
- **冻结**：URL 永不改。H1 只允许改「YYYY 年 M 月」，而且必须当月「亲测通过」后才改。「亲测通过」指礼品卡兑换成功，并且 Claude iOS 能显示内购价格页。
- **一次一节**：每次部署只改一个 section。禁止 AI 批量改写。
- **串行**：赢家页的任何部署（包括月份 token）都必须等上一次部署读完闸门后才能上线。
- **不算部署的变化**：侧栏和导航会随新页上线自动变化，这不算赢家页部署。
- **记录**：每次改动写进 `docs/winner-changelog.md`。

**判定方法**
- 主信号：赢家页 URL 的 GSC 平均排名，以及它前 5 个查询的排名中位数，对比基线。
- 窗口：A、head 切换、B、C 用 14 天；月份 token 和 D 用 7 天。都另加约 2 天 GSC 数据延迟。
- 结论：
  - 恶化 <1 位：视为稳定。点击或曝光下降判定为需求或季节变化（国庆黄金周、Pockyt 断货），不回滚。
  - 恶化 1–2 位：不回滚，延长观察 7 天后再判。
  - 恶化 >2 位：判定为部署导致，回滚这次部署。

**部署排期**（每一行都在上一行读闸之后）

| 上线 | 部署 | 内容 | 读闸 |
|---|---|---|---|
| ~10-01 | A | 第 4/5 步事实 +（亲测通过时）月份 token | 10-17 |
| ~10-05 | 全站 head/sitemap | 不含赢家页的 head 和 `lang`，因此不算赢家页部署 | 非赢家页的收录情况 |
| ~10-19 | 赢家页 head 切换 | `<title>` = 现有 H1 +「 \| E-ACCS」；自指 canonical；description；`lang`。新 title 是否与 Google 目前展示的标题一致（待核实，10-19 前用 site: 查看） | +3 / +7 天在 URL 检查里看 Google 选定的 canonical；11-04 读排名。回滚时只回滚 canonical 和 og:url |
| ~11-04 | 11 月 token | 11-01 复测通过才改 | 11-13 |
| ~11-13 | D | FAQ 之后**追加**「相关指南」框（链接到已上线的 /ai-coding 页和 Pro vs Max），以及「方法失效提醒」表单（标签 `claude-route`） | 11-22 |
| ~11-23 | B | 常见问题这一节：新增「Pockyt 显示补货中怎么办」「支付宝搜不到 Pockyt Shop」「礼品卡兑换后 Apple ID 被锁」「被封会退款吗（官方流程）」；「这是不是绕过规则」改成坦诚回答（中国大陆不在支持地区，账号可能被终止且不退款，建议先买月付 Pro） | 12-09 |
| ~12-09 | 12 月 token | 12-01 复测通过才改 | 12-18 |
| ~12-18 | C | 「先说结论」改成与正文一致的 10 步 | 2027-01-03 |

### 3.3 head 函数骨架（Nextra 3.3.1 允许 `head` 为函数组件）

```jsx
const WINNER = '/notes/claude-subscription-ios-apple-gift-card'
// theme.config.jsx 第 37–52 行原样搬进来，顺序不变
const LEGACY_HEAD = (<>{/* … */}</>)
head: function Head() {
  const { asPath } = useRouter()
  const { title, frontMatter } = useConfig()
  const path = asPath.split(/[?#]/)[0].replace(/\/$/, '') || '/'
  // 必须直接返回 Fragment 常量，不能包成 <LegacyHead/> 组件：next/head 只展开一层 Fragment，
  // 包成组件会让主题默认的 viewport 和 theme-color 漏进来。10-19 把 WINNER_HEAD_V2 打开
  if (path === WINNER && !WINNER_HEAD_V2) return LEGACY_HEAD
  const url = path === '/' ? `${SITE}/` : `${SITE}${path}`
  const t = path === '/' ? 'E-ACCS | AI 知识实验室' : `${frontMatter.title || title} | E-ACCS`
  return (<>{/* 保留 viewport / theme-color / favicon / manifest */}
    <title>{t}</title><meta name="description" content={frontMatter.description || DEFAULT_DESC} />
    <meta property="og:title" content={t} /><meta property="og:url" content={url} />
    <link rel="canonical" href={url} />
    {frontMatter.noindex && <meta name="robots" content="noindex" />}</>)
}
```

---

## 4. 第 8–90 天路线

### 4.1 关键词目标（所有 URL 都是新增，上线后永不修改）

**建页门槛**（每页上线前做 zh-CN SERP 验证，记录到 `docs/keywords.md`）：前 10 名里至少 4 个是论坛、CSDN、知乎、掘金或博客的内页，并且厂商首页或官方文档不超过 3 个。

**波次 1**（head 部署之后，每页各自有上线日期）

| 上线 | URL | Title = H1（关键词在前） | 需求证据 | 备注 |
|---|---|---|---|---|
| 10-08 | /ai-coding/claude-code-deepseek | Claude Code 接入 DeepSeek V4.1 配置教程（2026 年 10 月实测，含 Codex / opencode） | Google 联想：claude code 使用deepseek、claude code 配置 deepseek v4、claude code 接入 deepseek v4 | 先放订阅表单；¥29 包 10-21 与 hub 一起上线后再加 CTA |
| 10-13 | /ai-coding/claude-code-glm-coding-plan | Claude Code / Codex 接入 GLM Coding Plan：价格、额度、配置 | Bing 联想：claude code 怎么用 glm | 智谱只给赠金，标注但不计入收入 |
| 10-16 | /notes/claude-pro-vs-max | Claude Pro 和 Max 区别：价格、额度、Max 5x/20x 怎么选（2026 年 10 月） | 两个引擎都有「claude max 多少钱一个月」；另有「claude pro和max区别」「claude max 5x / 20x」 | 不写规避步骤。价格上线当天从官网核实（待核实） |
| 10-21 | /ai-coding/coding-plan-comparison（hub） | 国产模型 Coding Plan 价格对比：GLM / Kimi / MiniMax / 火山 / 百炼（2026 年 10 月） | 「claude code 国内模型」「claude code 怎么用 glm / minimax」；「coding plan 对比」本身（待核实） | **案头研究型表格**：每行带 source_url 和 verified_at，只亲测 DeepSeek 和 GLM。云大使审批通过才挂现金链接，否则先不挂。预算 7h |

**波次 2**（第 31–60 天，过 10-28 闸门后）

| URL | 需求证据 / 前提 |
|---|---|
| /ai-coding/codex-third-party-models（Codex CLI 用 DeepSeek / 第三方模型，config.toml） | codex 使用 deepseek、codex 使用第三方模型。Codex CLI 是 Apache-2.0，最干净 |
| /ai-coding/cc-switch（CC Switch：Claude Code / Codex 一键切换国产模型） | Bing：codex 怎么用ccswitch |
| /ai-coding/claude-code-kimi-minimax | Bing：claude code 怎么用 minimax；kimi 相关（待核实） |
| /ai-coding/claude-code-qwen-bailian（挂云大使链接） | **前提**：第 8–10 天已确认百炼有 Claude Code / Codex 可用的端点，且云大使覆盖该 SKU |
| /notes/claude-payment-declined | 联想词：claude 支付 your card has been declined、claude 付款失败。只写官方原因和处理办法，**不变现、不推虚拟卡** |

**波次 3**（第 61–90 天，过 11-30 闸门后）

| 页面 | 备注 |
|---|---|
| Claude Code vs Codex 价格与额度对比 | 竞品对比页 |
| Claude Code Windows 安装教程 | — |
| Claude 封号申诉与退款（只写官方流程） | — |
| Claude Code 一个月多少钱：订阅 vs API vs 国产 Coding Plan 计算器 | 复用 e-acc.ai 的 tokenmath，默认结果预渲染进 HTML |
| **可选**：台湾地区 Claude Pro/Max 台币价格与开发票（统编） | Taiwan 是支持地区，无 ToS 风险；联想词有「claude pro 订阅 台湾」「claude 发票 统编」 |
| 国产模型发布日页面（最多 2 个） | 发布后 48 小时内上线 |

### 4.2 页面模板

- **TDH**：英文 slug；`title:` 与 H1 相同，关键词在前，带「（YYYY 年 M 月实测）」；`description:` 里包含关键词。
- **结构**
  1. 「最后实测：日期」+ 一句话结论。有推广链接时，在这里加披露。
  2. 编号步骤。
  3. **最小单厂商配置**（免费）。
  4. 验证方法。
  5. 价格表：`PlanTable` 读 `data/coding-plans.json`，字段含 vendor / plan / ¥月价 / 额度 / 兼容端点 / 返佣类型 / verified_at / source_url，**数据来源是厂商官网**。
  6. 原样的报错字符串做 H3。
  7. FAQ（取自联想词）。
  8. 相关指南。
- **质量**：≥1,500 字；用自己的截图；上线后在 GSC 请求编入索引 + IndexNow；首页「热门指南」至少挂 5 天。
- **产品 CTA**：只放在 /ai-coding 页，位置在「最小配置」之后和页尾。赢家页不放。
- **订阅表单**：/ai-coding 页的页尾放一个中文订阅表单，标签为 `ai-coding`，与赢家页的「方法失效提醒」（标签 `claude-route`）分开统计。11-12 的产品闸门只看 `ai-coding` 这个标签。
- **¥29 配置包（付费内容，与免费页严格区分）**
  - 全厂商预设：cc-switch profiles、Codex `config.toml`、opencode。
  - CLAUDE.md / AGENTS.md 与 skill 模板。
  - 用量与成本统计脚本。
  - 厂商改价或改额度后 30 天内免费更新。
  - 标题中性（以 Codex / opencode / 国产模型打头），不含任何账号、支付或地域相关内容。

### 4.3 外链（「三五个外链等于没发」「外链抄作业」，不买外链包）

| 阶段 | 来源 | 新增引用域名 / 累计 |
|---|---|---|
| 第 8–30 天 | GitHub 仓库 `ai-coding-cn-configs`（免费子集：DeepSeek + GLM），README 链到 e-accs.com；V2EX 分享创造；LINUX DO；掘金 1 篇；知乎 3 个回答。**论坛帖里不放推广链接** | 4–6 / 4–6 |
| 第 31–60 天 | 用 Ahrefs 免费工具查目标词排名页的外链，按首次发现时间逐条复制可自助提交的；给 2–3 个中文 awesome 列表提 PR；每月在 V2EX 和掘金发一篇《国产 Coding Plan 价格月报》 | 6–10 / 10–16 |
| 第 61–90 天 | 持续抄作业；发布日页面同步发帖 | 5–8 / 15–24 |

参考：voiceisolator 约 30 个引用域名拿到小词排名。

### 4.4 工时（13 周约 127–133 小时，平均约 10 小时/周；连续两周超过 12 小时/周，先砍波次 3）

| 阶段 | 分项 | 合计 |
|---|---|---|
| 第 0–7 天 | §3.1 | ≈10h |
| 第 8–30 天 | 中文 newsletter 搭建（中文确认邮件 + 隐私说明，10-07 前完成）0.5；SERP 验证 2；云大使注册 + 百炼端点核查 1（10-05 前定下决策 5）；波次 1 共 17.5（3 页 × 3.5 + hub 7）；coding-plans.json + PlanTable + 测试 2；¥29 包 + 小报童上架 + CTA 6；赢家页 head 切换 0.5；e-acc.ai tier-1 页（GPT-6 Astra、Opus 5.5）+ `page:false` 1.5；ADR-0005/0006 1.5；分发 3；周复盘 1.5 | ≈37h |
| 第 31–60 天 | 波次 2 共 17.5；¥69 手册 10（过闸才做）；赢家页部署 D、B 共 1.5；GSC 优化（排名 8–30、曝光 ≥50 的查询补成 H2/FAQ，不动 TDH）3；外链 5；e-acc.ai 2 + release-watch 1.5 + verify 新鲜度（**警告级**）和短语检查 1.5；11-01 复测 + 11 月 token 1.5；周复盘 2 | ≈45.5h（手册不过闸则 35.5h） |
| 第 61–90 天 | 波次 3 共 16.5；发布日页 3；定价与 CTA 调整 + 小报童分销 3；外链 3；12-01 复测 + 12 月 token 1.5；赢家页部署 C 0.5；e-acc.ai 2；英文测试 0–6；12-27 复盘 + ADR-0007 2.5；周复盘 2 | ≈34–40h |

**条件触发的英文测试（上限 6 小时）**
- 条件：11-30 闸门通过，**且** 12-15 前累计 ≥15 单。
- 内容：做一个 claude max vs api 盈亏平衡计算器。放在 e-acc.ai，或另买一个不含 claude 的域名（决策 9）。不放中转链接。

---

## 5. 变现

### 5.1 收入、成本与净额（¥7.2 = $1）

**假设**

| 项 | 保守 | 中性 |
|---|---|---|
| /ai-coding 页群月访问 M1 / M3 / M6 | 30 / 150 / 400 | 60 / 300 / 900 |
| 赢家页经「相关指南」框导入（部署 D 约 11-13 上线，M1 为 0） | 500 × 3% = 15/月 | 650 × 4% = 26/月 |
| 搜索访问 → 购买 | 0.15%（量级参考哥飞 Gumroad 案例的 0.16%。那是商品页、社交流量为主，只作参考） | 0.3% |
| 非搜索订单（GitHub、帖子、邮件，**纯假设，无数据来源**） | 0.5 单/月 | 1.5 单/月 |
| 客单价（小报童实得约 0.79） | ¥29 | M1 ¥29；M3 起 ¥49（¥29、¥69 各半；¥199 答疑不计入） |
| 月份 | M1 = 10 月（10-21 上线，按约 0.35 个月计） | M3 = 12 月；M6 = 2027 年 3 月 |

**① 自有产品**

| | 保守 | 中性 |
|---|---|---|
| M1 | 30×0.35×0.15% + 0.5×0.35 ≈ 0.19 单 × 29 × 0.79 ≈ ¥4.4 ≈ **$0.6** | 60×0.35×0.3% + 1.5×0.35 ≈ 0.59 单 × 29 × 0.79 ≈ ¥13.5 ≈ **$1.9** |
| M3 | (150+15)×0.15% + 0.5 = 0.75 × 29 × 0.79 ≈ ¥17 ≈ **$2.4** | (300+26)×0.3% + 1.5 = 2.48 × 49 × 0.79 ≈ ¥96 ≈ **$13.3** |
| M6 | (400+15)×0.15% + 0.5 = 1.12 × 29 × 0.79 ≈ ¥26 ≈ **$3.6** | (900+26)×0.3% + 1.5 = 4.28 × 49 × 0.79 ≈ ¥166 ≈ **$23** |

**② 阿里云云大使**（新客户大模型消费返 5–35%，以云气结算，100 云气 = ¥1，可提现；归属期 90 天；需个人实名、缴个税）

- 算式：承载页访问（取页群的 25%）× 点击率（保守 3%，中性 5%）× 新客购买率 10% × 首月 ¥100 × 20%。
- 保守：M3 = 38×3%×10%×100×20% ≈ ¥2 ≈ **$0.3**；M6 = 100×… × 1.5（90 天累积）≈ ¥9 ≈ **$1.2**。
- 中性：M3 = 75×5%×… ≈ ¥7.5 ≈ **$1**；M6 = 225×5%×…×1.5 ≈ ¥34 ≈ **$4.7**。
- M1 = 0：审批期内，承载页也还没上线。

**③ AdSense**：90 天内 $0（不申请，理由见 §7）。

**合计与净额**

| | M1 | M3 | M6 |
|---|---|---|---|
| **收入合计（保守 / 中性）** | $1 / $2 | $3 / $14 | $5 / $28 |
| **成本**：亲测订阅（GLM Coding Plan 等，约 ¥20–50/月，待核实）+ DeepSeek 充值 ¥10 + 礼品卡复测 $4–6 + 手续费；波次 2 另有 Kimi、MiniMax、百炼的一次性测试费用，以及小报童分销佣金；智谱和火山赠金可抵一部分 | $8–15 | $8–15 | $8–15 |
| **净额（保守 / 中性）** | 负 / 负 | 负 / 约 −$1~+6 | 负 / 约 +$13~20 |

**不计入预估、但最现实的现金杠杆**
- **付费答疑 ¥199（45 分钟）和 B2B 咨询 ¥2,000/半天**
  - 零开发，在 /ai-coding 页和 /about 放联系方式即可。
  - 范围**只限**国产模型、Codex、opencode，以及用 API key 配置 Claude Code；**不涉及**任何 Claude 账号、支付或地域问题。
  - 每季度成交 1 单咨询，约合 $93/月。
- **SEAGM 联盟**：不做（ADR-0006 禁止在规避类页面放返佣）。
- **e-acc.ai 域名出售**：没有可比成交，按 $0 计。

**月入 $100 需要什么**：$100 ≈ ¥720。按每单净 ¥38.7（¥49 × 0.79），约需 19 单/月。转化率 0.3% 时约需 **6,200 次 CTA 页访问/月**，约是目前全部 Google 流量的 9 倍。另一条路是每季度 1 单咨询（≈$93/月），再加约 1 单配置包。

**首单时间**：¥29 包约 10-21 上线，首单预计在第 25–35 天，大概率来自 GitHub 或帖子。小报童每周四提现，另有 48 小时冻结，到手约在第 30–40 天。

### 5.2 渠道

- **小报童先行**：抽成约 21%，零集成，自带分销（分销佣金另计为成本）。
- **面包多Pay 做备份**：2% + ¥0.1，自有页收款，需要闪电认证，待月 GMV ≥ ¥1,000 再切过去。
- **不用知识星球**：会员制，抽成约 20.6%。
- 各国内平台对「AI 工具教程」都有模糊的下架风险，源文件保留在本地。

### 5.3 红线（ADR-0001 + 新 ADR-0006，两个域名都适用，以「赞助」名义出现的也不接）

**不链接、不推荐、不收佣**
- 代充 / 代订阅。
- API 中转站和「中转站名单」。
- 账号买卖、共享、拼车。
- 订阅转 API。
- 镜像站、短信接码、VPN / 机场。
- 虚拟卡和加密卡（野卡类、Bybit、Depay）。
- 灰色礼品卡（闲鱼、「低价礼品卡」、pockytshop.cn / .com）。
- 有第三方卖家的密钥市场（如 Eneba）。
- 反检测或规避封号的技巧。
- 「免费 API key」。

**不做**
- 不代读者登录或付款，不持有读者的账号、密钥或支付方式。
- 规避类页面上不放返佣、广告或收款码。
- 不放未标注的推广链接（《互联网广告管理办法》要求广告可识别）。

**允许**
- 读者直接付给厂商的官方计划：云大使、智谱、火山。
- 自有信息产品。
- 第 90 天后，标注「广告」的正规国产厂商评测位。

---

## 6. 度量与止损

**每周一 30 分钟看板**（GSC 为主，RUM 只作分母和方向参考）

- **GSC · e-accs.com**
  - 赢家页的排名、前 5 个查询的排名、点击、曝光。
  - 每个新页是否已收录、曝光、前 5 个查询。
  - 排名 8–30 且曝光 ≥50 的查询清单。
  - 未编入索引的数量。
- **GSC · e-acc.ai**：总量；tier-1 页的曝光。
- **Bing WMT**：点击。
- **RUM**：带 CTA 页面的访问（转化分母）、外部 referrer。
- **钱与时间**：订单、只算 /ai-coding 来源的提醒订阅、CTA 点击率、云大使订单、台账里的成本和工时。

**闸门与止损**

| 日期 | 检查项 | 阈值 | 动作 |
|---|---|---|---|
| 每次赢家页部署的读闸日（§3.2 排期表） | 赢家页排名、前 5 查询排名中位数（对比基线） | 恶化 >2 位 / 1–2 位 / <1 位 | 回滚这次部署 / 延长观察 7 天再判 / 视为稳定，量的下降判定为需求或季节，不回滚 |
| 赢家页 head 切换后 +3 / +7 天 | URL 检查里 Google 选定的 canonical | ≠ 赢家页 URL | 只回滚 canonical 和 og:url，14 天后复查 |
| 持续 | RUM 赢家页每周 Google 访问 | 连续 3 周 <60/周 | 判定衰退：只更新状态，新工时全部转到页群 |
| 每月 1 日复测 | 三条礼品卡路线 | 连续两个月都失败 | H1 下加「目前无稳定渠道（日期）」，撤掉备选，标题不改到失败的月份 |
| 每页上线 +14 天 | 是否收录 | 未收录 | 查 canonical 和 sitemap，补 2–3 条外链 |
| 每页 +28 天（「4 周无曝光换词」） | 曝光 | 0 | 改一次 TDH（只对无排名的页）+ 3 条外链 |
| 每页 +56 天 | 曝光 | 仍为 0 | 加 noindex 并移出 sitemap；这种主题类型不再扩页 |
| **10-28** | 波次 1 中已上线满 14 天的页（届时应为 DeepSeek、GLM 两页） | 其中有任何一页未收录 | 暂停波次 2，用一周做 On-Page + 3–5 条外链；11-04 连同 Pro vs Max 页一起复查 |
| **11-12** | 产品闸门 | ¥29 包 ≥3 单，**或** /ai-coding 来源的提醒订阅 ≥10 且 CTA 点击率 ≥2% | 通过：写 ¥69 手册。不通过：不写，10 小时转去做 GSC 优化 |
| 11-27 | e-acc.ai tier-1 页 | 合计曝光 <100 | 停做发布日页面，数据改为季度刷新 |
| **11-30** | 页群 28 天 | 曝光 <1,000 或点击 <30 | 不做波次 3，先用 2 周做 On-Page 和外链；12-21 仍 <30 点击就停止扩群 |
| 12-15 | 产品 | CTA 页累计 ≥500 访问且 0 单 | 改为单一 ¥19–29 档并前移 CTA；2027-01-15 仍 <5 单就停售，改为免费下载换邮箱 |
| **12-27** | e-accs.com 网站权重 | 有点击的页 ÷ 已发现的页 <100‱ | 停止新建页面，先处理老页面 |
| **12-27** | e-acc.ai | 28 天点击 <30 | 挂一口价出售，保持在线，季度刷新，写入 ADR-0007 |
| 2027-01-31 | 云大使 | 0 笔归因订单 | 撤掉链接 |

---

## 7. 风险与对冲

| 风险 | 对冲 |
|---|---|
| **单页依赖 + 供应链断裂**：约 100% 的 Google 流量集中在一个 URL；Pockyt 美区卡断货，1 月已被支付宝搜索下架；SEAGM 只有一例用户报告 | 本周修第 4 步，给两条备选，每月复测；收入重心放在合规的页群上；目标是 2027-03 赢家页占 e-accs.com Google 流量 ≤50% |
| **地域规避与读者被封**：Claude 不在中国大陆提供服务，账号可能被终止且不退款 | 规避类页面一律不变现；FAQ 坦诚说明（部署 B）；另写官方申诉页；付费内容不含规避内容；ADR-0006 把赢家页列为历史例外 |
| **改动已有排名的页面引发雪崩**（哥飞案例：Liquid Glass 改版后流量掉九成） | §3.2 协议：一次部署只改一节；串行，上一次读完闸门才上下一次；用排名判定；赢家页的 head 单独切换 |
| **新页面继承错误的 canonical** | 全站 head 部署（10-05）先于任何新页上线；每页上线 +14 天查收录 |
| **PRC 合规与实名暴露**：小报童（云账户结算）和云大使都要实名，而同一个站上有规避指南 | 承认这份关联；变现只挂在 /ai-coding（合规）页；产品标题中性；不放个人收款码；不碰 VPN；答疑和咨询的范围写入 ADR-0006 |
| **Claude Code 客户端在不支持地区使用的条款**（待核实） | 每篇都给 Codex CLI（Apache-2.0）和 opencode 的变体；产品对客户端保持中立；不把 Claude Code 内容宣传为「完全合规」 |
| **国产 Coding Plan 价格和额度每月变化** | `coding-plans.json` 带 verified_at，超过 35 天测试**警告**（不阻断构建）；每月固定一天复核 |
| **返佣条款变化，或其实不付现金**（MiniMax 条款页 404，可能 08-31 已结束） | 只把云大使算作现金；条款按日期快照 |
| **转化率假设错误** | 按 0.15% 规划；¥29 包 6 小时就能做完；11-12 和 12-15 两道闸门会逼出定价和 CTA 位置的测试 |
| **AdSense 账号级风险**：审核看整站，站内又有规避类页面 | 90 天内不申请；以后只用干净的站申请，只在 /ai-coding 投放 |
| **邮件合规**：现有 Buttondown（SAC-1988）是英文 e/acc 的 newsletter | 单独建中文 newsletter，确认邮件中文化，并注明邮箱由美国服务商存储 |
| **AI 摘要吃掉点击** | 做 AI 替代不了的内容：自己的截图、原样报错字符串、带日期的实测、「方法失效提醒」 |
| **中转站 / 代充以赞助名义找上门** | 对照 ADR-0006 denylist，一律拒绝 |

---

## 8. 需要你拍板的决策

1. **战略转向**：e-accs.com 做主战场，e-acc.ai 停放；新建 ADR-0005 / 0006，0002 标记 superseded，0004 标记部分 superseded。
2. **赢家页 FAQ 坦诚改写**：明确写出「中国大陆不在支持地区，账号可能被终止且不退款」。
3. **SEAGM 备选**：只用普通链接（ADR-0006 禁止在规避类页面放返佣）。已定，无需拍板。
4. **产品渠道与身份**：小报童先行（建议），以本人实名上架；标题以 Codex / opencode / 国产模型打头。
5. **阿里云云大使**：是否做个人实名并申报个税（建议 10-05 前定下）。
6. **是否开放 ¥199 答疑和 ¥2,000 咨询**（需公开联系方式；这是最快的现金杠杆）。
7. **AdSense**：建议 90 天内不申请。
8. **e-acc.ai 出售**：12-27 触发时挂不挂一口价，定多少。
9. **英文 Claude Max vs API 测试**：过闸后做不做；放在 e-acc.ai 还是另买不含 claude 的域名。
10. **是否并行跑精简版哥飞新词站**（需额外 6–8 小时/周；评审认为全量版每周约 15 小时、一个人做不了）
    - 第 31 天起，每两周上线 1 个英文新词单页站：精确匹配域名，**域名不含商标词**。
    - 每站 72 小时内拿到 5 条外链；28 天无曝光就放弃。
    - AdSense 一人只能有一个账号：新词站加入同一个账号，用干净的新词站申请。决策 7 只约束 e-accs.com。
    - 高方差，但这是方法论里唯一有较大上行空间的路径。
11. **工时承诺**：13 周约 127–133 小时（约 10 小时/周）。
12. **law. / sure. 子域**是哪些项目，由谁来加 noindex。
