# 個人網頁設計大綱（v0.4）

> 風格關鍵字：**黑底白字 · 工程師 · 終端機 · 等寬字體 · 極簡**
> 參考網站：[SITCON 2027 CFP](https://sitcon.org/2027/cfp/)（原始碼：[sitcon-tw/2027-cfp](https://github.com/sitcon-tw/2027-cfp)，MIT）
> 狀態：Draft v0.4

## 0. 變更摘要

### v0.4

- 部署平台確定為 **GitHub Pages**（GitHub Actions 建置與部署，第 11.1 節）
- 部落格改為首頁的一個**區塊**（`#blog`）：文章為 Markdown + YAML front matter，**直接渲染檔案內容**，不做目錄、標籤、RSS 等額外功能（第 9 節）
- 移除部落格路由、文章預渲染與 RSS；`nav` 全部為 hash 類型

### v0.3

- 字型確定為 **Noto Sans TC**（自託管、建置時子集化）
- Markdown 先以 **`react-markdown`** 為核心，其餘套件分階段加入
- 確認只提供 `en` / `zh-TW`，不做簡體中文
- 每個分頁（含部落格）在導覽列與 Hero 各有一顆 CTA，並配對應 icon；由 `site.yaml` 的 `nav` 單一來源產生（第 4.1 節）
- 連結預覽改為**建置時自動抓取** Open Graph（第 7.4 節）
- 新增**部落格**：列表頁 + 文章頁（v0.4 已改為首頁區塊，見第 9 節）
- 友站支援 88×31 小圖章
- iframe 嵌入暫不開放第三方網域（僅內建 YouTube）
- 部署平台仍在討論（v0.4 已決定 GitHub Pages）

### v0.2

- 新增：以 SITCON 2027 CFP 為視覺與工程規範參考（第 3、4、12 節）
- 移除專案詳細頁路由；專案內容改在**頁內面板**呈現，並支援**嵌入連結**（第 7 節）
- 新增：**瀏覽器語言自動偵測**（中文 / 英文），路徑式 i18n（第 6 節）
- 新增：**友站**區塊與友站申請資訊（第 8 節）
- 內容來源由「僅 YAML」擴充為 **YAML + Markdown**（第 5 節）

---

## 1. 專案目標

- 展示個人背景、技能、經歷、專案、部落格文章、友站與聯絡方式的個人網站
- 黑底白字、終端機風格；版型與工程規範參考 SITCON 2027 CFP
- **內容與程式碼分離**：改 `src/content/` 內的 YAML / Markdown 就能更新網站，不需動 React
- 雙語（繁體中文 / English），依瀏覽器語言自動切換，可手動覆寫
- 靜態輸出（prerender），部署到 GitHub Pages

---

## 2. 技術棧

| 類別             | 選擇                                                                                                                                          |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 框架             | React 19                                                                                                                                      |
| 建置工具         | Vite                                                                                                                                          |
| 樣式             | Tailwind CSS v4                                                                                                                               |
| 語言             | TypeScript                                                                                                                                    |
| 套件管理         | **pnpm**（npm / yarn / bun 皆封鎖）                                                                                                           |
| UI 元件          | Base UI (`@base-ui/react`)                                                                                                                    |
| 路由             | TanStack Router（file-based）                                                                                                                 |
| 樣式工具         | `clsx` + `tailwind-merge`（封裝為 `cn()`）                                                                                                    |
| 圖示             | `lucide-react`                                                                                                                                |
| 內容：YAML       | Vite YAML plugin（如 `@modyfi/vite-plugin-yaml`）                                                                                             |
| 內容：Markdown   | `react-markdown`（核心）+ `remark-gfm` + `front-matter`；第二階段視需要再加 `remark-directive`（`::embed`）、`rehype-highlight`（程式碼高亮） |
| 連結預覽         | 建置時以腳本抓取 Open Graph（第 7.4 節）                                                                                                      |
| 部署             | GitHub Pages + GitHub Actions（第 11.1 節）                                                                                                   |
| 內容驗證（選配） | `zod` + Vitest                                                                                                                                |

### 開發規範

- 一律使用 `@/` alias 從 `src` 匯入：
  ```ts
  import { Button } from "@/components/ui/button";
  import { cn } from "@/lib/utils";
  ```
- 完成任何任務前必須執行 `pnpm check`（typecheck + lint + format check）
- 禁止使用 npm / yarn / bun；`package.json` 設定 `packageManager` 並以 `only-allow pnpm` 封鎖
- 不為了通過檢查而擅自更換工具鏈；無法執行的檢查要回報
- 建議在新專案根目錄放一份 `AGENTS.md`（`CLAUDE.md` 為 symlink），沿用本文件第 12 節的規範

---

## 3. 視覺設計規範

### 3.1 從 SITCON 參考到本站的對照

| SITCON 2027 CFP 的做法                             | 本站採用方式                                                                               |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| 近黑背景 `#101312` + 米白前景                      | 黑底白字（近黑 `#0A0A0A` + `#FAFAFA`），可微調                                             |
| 懸浮玻璃感圓角導覽列（`bg-black/35`）              | 保留：固定頂部的懸浮導覽列，放置語言切換與 GitHub 圖示                                     |
| 巨大 Hero 標題（`text-mega`）+ 三顆彩色 CTA        | 姓名作為 Hero 巨型標題；**每個分頁一顆 CTA（各附 icon）**，主要 CTA 用綠色，其餘為外框按鈕 |
| 倒數 + 截止日雙卡片（外側大圓角、內側小圓角）      | 「目前狀態」＋「當地時間（Asia/Taipei）」雙卡片                                            |
| 黃色跑馬燈色帶（Early Bird）                       | 技術棧跑馬燈色帶（尊重 `prefers-reduced-motion`）                                          |
| 大數字統計（`text-stat`）                          | About 區的統計數字（年資、專案數等，來自 YAML）                                            |
| 議程類型：左側堆疊 tiles + 右側詳細面板            | **專案區**：左側專案列表，右側面板顯示 Markdown 與嵌入內容                                 |
| 狀態徽章（即將開始 / 進行中 / 已結束，由日期計算） | 經歷、專案的狀態徽章（Present / Ended / Archived），由日期計算                             |
| 頁尾多欄連結 + 社群圖示                            | 頁尾：導覽、友站、社群                                                                     |
| 靜態預渲染 + sitemap + BASE_PATH                   | 沿用（第 11 節）                                                                           |

> 只借用版型思路與工程規範，**不複製** SITCON 的品牌、圖片、文案與字型授權以外的資產。

### 3.2 設計 Token（強制）

所有 token 放在 `src/index.css` 的 `@theme`。**重設** Tailwind 預設的顏色、字級與圓角，因此 `bg-white`、`text-sm`、預設 `rounded-lg` 都不存在。

- **所有尺寸皆為 token**：顏色、字級、行高、字型、圓角、間距、元件尺寸；**禁止任意值**（`bg-[#…]`、`text-[24px]`、`h-[59px]`、`p-[13px]` 等），沒有「一次性」例外
- 尺寸 token 一律用 `rem`（px ÷ 16，旁邊註解原 px），跟隨瀏覽器字級設定
- 新增 `text-*` 字級或具名 `--spacing-*` 時，要同步登錄到 `src/lib/utils.ts` 的 tailwind-merge 設定，否則 `cn()` 會把它與文字色一起吃掉
- 先重用既有 token，數值相近就吸附到既有 token；新增 token 要以**角色**命名（`control`、`content`），不以數值命名
- 響應式尺寸寫在 token 內（`md`＝48rem 以下覆寫），元件不需要為了縮字再加 `md:text-*`，breakpoint 只用在版面

#### 顏色

| Token        | 值        | 用途                                     |
| ------------ | --------- | ---------------------------------------- |
| `background` | `#0A0A0A` | 頁面背景；反白卡片上的深色文字           |
| `surface`    | `#141414` | 卡片、終端機視窗底色                     |
| `foreground` | `#FAFAFA` | 主要文字；反白卡片底色                   |
| `gray`       | `#A1A1A1` | 次要文字                                 |
| `rule`       | `#2A2A2A` | 分隔線、邊框                             |
| `green`      | `#8DF280` | 主要 accent（終端機綠）、成功狀態、游標  |
| `blue`       | `#6A74E3` | 連結、**focus ring**                     |
| `red`        | `#FF625B` | 錯誤、封存狀態                           |
| `yellow`     | `#FCBF30` | 警示、跑馬燈色帶（選配）                 |
| `black`      | `#000000` | 僅用於遮罩（導覽列玻璃感 `bg-black/35`） |

> 在反白（`foreground` 底）區塊中，文字色為 `text-background`，這是預期行為。

#### 字型

| Token       | 字型                             | 用途                              |
| ----------- | -------------------------------- | --------------------------------- |
| `font-sans` | Noto Sans TC → Inter → system-ui | 內文、中文段落                    |
| `font-mono` | JetBrains Mono → ui-monospace    | 導覽、標籤、eyebrow、數字、程式碼 |

- 字型**自行託管**（OFL），不使用 CDN
- Noto Sans TC 字集龐大，必須在建置時**依實際用字子集化**並切 unicode-range（如 `vite-plugin-font`）；掃描範圍包含 `src/` 與 `src/content/` 下的 YAML / Markdown（含部落格文章），只載入 400 / 700 兩種字重
- 新增文章或文案後，新字元會在下次建置自動納入；子集內沒有的字元會退回 Inter / 系統字型
- 中文沒有好的等寬字型，因此**標題與 UI 標籤用 mono，中文內文用 sans**

#### 字級（px；token 為 rem）

| Token            | 桌機      | 手機 | 用途                      |
| ---------------- | --------- | ---- | ------------------------- |
| `text-mega`      | 96 / 1.05 | 44   | Hero 姓名                 |
| `text-stat`      | 64 / 1    | 40   | 統計數字                  |
| `text-display`   | 48 / 1.15 | 32   | 區塊標題（`// projects`） |
| `text-h1`        | 32 / 1.25 | 26   | 次標題                    |
| `text-h2`        | 24 / 1.3  | 20   | 卡片標題                  |
| `text-lead`      | 18 / 1.6  | 16   | 大按鈕、引言              |
| `text-paragraph` | 16 / 1.75 | 15   | 內文                      |
| `text-body`      | 14 / 1.5  | 14   | 導覽、頁尾連結            |
| `text-caption`   | 12 / 1.5  | 12   | 附註、徽章                |

字重：`font-normal`(400)、`font-bold`(700)。

#### 圓角與尺寸

| Token               | 桌機 | 手機 | 用途                     |
| ------------------- | ---- | ---- | ------------------------ |
| `rounded-*-xs`      | 2    | 2    | 徽章、按鈕尖角           |
| `rounded-*-sm`      | 4    | 4    | 相鄰 tile 的**內側**圓角 |
| `rounded-*-md`      | 8    | 6    | 按鈕、輸入框             |
| `rounded-*-lg`      | 12   | 10   | 終端機視窗               |
| `rounded-*-xl`      | 20   | 16   | 相鄰 tile 的**外側**圓角 |
| `--spacing`         | 4    | 4    | 間距基準（`p-5`＝20px）  |
| `h-control`         | 40   | 36   | 預設控制項高度           |
| `h-control-lg`      | 56   | 48   | 大控制項、導覽列高度     |
| `size-control-icon` | 36   | 36   | 純圖示按鈕               |
| `pt-header`         | 88   | 76   | 懸浮導覽列的佔位高度     |
| `max-w-content`     | 960  | 960  | 內容欄寬                 |

**圓角規則**：相鄰並排／堆疊的 tile 視為同一個形狀，**外側角 `xl`、內側角 `sm`**（例：狀態卡＋時間卡、專案列表＋詳細面板）。

#### 版面規則

- 全站共用**同一個螢幕邊距**與**同一個置中內容欄**（`mx-auto max-w-content`），文字在每個區塊都從同一條 x 線開始
- 區塊負責自己的背景、滿版寬度與上下留白；內容欄負責子元素間距（單一 `gap`），需要更大間距時由子元素自己加 padding，不混用 margin
- 同角色的區塊共用相同的垂直留白；新區塊直接複製既有區塊的外殼

### 3.3 視覺元素

- 終端機語彙：`$ whoami`、`> ls projects`、`~/about`、閃爍游標 `▍`
- 區塊標題採註解風格：`// about`、`// projects`
- 細邊框（1px `rule`）、小圓角、無陰影
- 終端機視窗元件（標題列三顆點 + 內容），用於 About 的 `whoami` 與專案面板
- Hero 標語的打字機效果（僅此一處；`prefers-reduced-motion` 下直接顯示）

---

## 4. 頁面與資訊架構

```
/                      偵測語言 → 轉址到 /en 或 /zh-TW
/en                    英文版首頁
/zh-TW                 繁體中文版首頁
```

首頁為單頁式，各區塊以 hash 錨點連結（`#about`、`#projects`、`#blog`…）。**專案沒有詳細頁，部落格也沒有獨立的文章頁**，兩者都在首頁的區塊內呈現。

| 區塊              | 內容                                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------ |
| **Navbar**        | 懸浮玻璃感圓角導覽列：`~/` 標誌、全部分頁連結（icon + 文字；窄螢幕收進 `Menu`）、語言切換、GitHub 圖示 |
| **Hero**          | `$ whoami`、姓名（mega）、職稱 · 地點、打字機標語、**全部分頁的 CTA（各附 icon，見 4.1）**             |
| **Status 雙卡片** | 目前狀態（如 Open to work）＋ 當地時間（每秒更新）                                                     |
| **跑馬燈色帶**    | 技術棧滾動                                                                                             |
| **About**         | 統計數字 + Markdown 自介（終端機視窗呈現）                                                             |
| **Skills**        | Tabs 依類別切換（Languages / Frontend / Backend / Tools）                                              |
| **Experience**    | 時間軸，含狀態徽章；重點以 Collapsible 展開                                                            |
| **Projects**      | 左側專案列表 + 右側面板（Markdown、連結、嵌入內容）                                                    |
| **Blog**          | 依日期由新到舊列出文章，直接顯示各篇 Markdown 內容（標題與日期取自 front matter）                      |
| **Friends**       | 友站卡片網格（含 88×31 小圖章）+ 友站申請資訊                                                          |
| **Contact**       | 反白大卡片：Email（一鍵複製）、社群連結                                                                |
| **Footer**        | 導覽 / 友站 / 社群三欄、授權、原始碼連結                                                               |

### 4.1 分頁、CTA 與 icon（單一來源）

導覽列、Hero CTA、頁尾連結**全部由 `site.yaml` 的 `nav` 產生**，每個分頁一個 `lucide-react` icon。

| id           | 類型 | 名稱（en / zh-TW） | icon         |
| ------------ | ---- | ------------------ | ------------ |
| `about`      | hash | About / 關於我     | `User`       |
| `skills`     | hash | Skills / 技能      | `Braces`     |
| `experience` | hash | Experience / 經歷  | `Briefcase`  |
| `projects`   | hash | Projects / 專案    | `FolderGit2` |
| `blog`       | hash | Blog / 部落格      | `PenLine`    |
| `friends`    | hash | Friends / 友站     | `Users`      |
| `contact`    | hash | Contact / 聯絡     | `Mail`       |

```yaml
# site.yaml（節錄）
nav:
  - { id: about, type: hash, icon: User, label: { en: About, zh-TW: 關於我 } }
  - { id: skills, type: hash, icon: Braces, label: { en: Skills, zh-TW: 技能 } }
  - { id: projects, type: hash, icon: FolderGit2, label: { en: Projects, zh-TW: 專案 } }
  - { id: blog, type: hash, icon: PenLine, label: { en: Blog, zh-TW: 部落格 } }
  # … 其餘同理
```

- 所有分頁皆為 `type: hash` → `<Link to="/$lang" params={{ lang }} hash="projects">`；日後若需要獨立路由，再加入 `type: route`
- **Hero**：顯示全部分頁的 CTA（icon + 文字）；`profile.yaml` 的 `primaryCta` 指定哪一顆用綠色強調，其餘為外框按鈕；手機排成 2 欄網格
- **Navbar**：桌機顯示 icon + 文字；空間不足時只顯示 icon 並以 `Tooltip` 補文字；手機收進 `Menu`
- icon 以名稱在 YAML 指定，程式內用**白名單 mapping 表**載入（只打包用到的 icon），不整包匯入；icon 為裝飾，加 `aria-hidden`，文字由 label 提供
- 新增分頁只需在 `nav` 加一筆並實作對應區塊

---

## 5. 內容系統：YAML + Markdown

### 5.1 原則

- **所有使用者可見的文字都放在 `src/content/`**，包含按鈕文字、導覽、aria 標籤、圖片 alt、placeholder、日期格式、meta 資訊與外部連結
- 程式碼中不寫死文案；動態字串用具名 placeholder（`{count}`、`{name}`）並在程式內代換，不拼接硬編碼的字詞或標點
- 技術識別字（路由路徑、錨點 id、CSS class、狀態值）可留在程式碼，但其**顯示文字**要放進內容檔
- YAML 負責**結構化資料**（清單、日期、連結、標籤）；Markdown 負責**長文與排版**（自介、專案說明、友站規則）

### 5.2 檔案結構

```
src/content/
├── README.md              # 給編輯者的速查表（欄位說明、範例）
├── site.yaml              # meta、導覽、UI 文字、embed 允許網域
├── profile.yaml           # 姓名、職稱、Hero、統計、目前狀態
├── skills.yaml
├── experience.yaml
├── projects.yaml
├── friends.yaml
├── contact.yaml
├── md/
│   ├── about.en.md
│   ├── about.zh-TW.md
│   └── projects/
│       ├── awesome-cli.en.md
│       └── awesome-cli.zh-TW.md
├── blog/                  # 部落格文章（見第 9 節）
│   ├── hello-world.en.md
│   └── hello-world.zh-TW.md
└── .generated/
    └── og.json            # 建置時抓取的連結預覽快取（commit）
src/assets/
├── projects/              # 專案封面
├── friends/               # 友站頭像與 88×31 小圖章
├── blog/                  # 文章圖片（blog/<slug>/）
└── brands/                # 品牌 SVG（見第 12 節）
```

### 5.3 多語欄位

可翻譯欄位寫成 `{ en, zh-TW }`；不需翻譯的值（網址、日期、標籤）直接寫純值。

```ts
type Localized = string | { en: string; "zh-TW": string };
```

缺少某語言時，退回另一語言並在開發模式印出警告；內容檢查（Vitest）會在缺漏必填欄位時失敗。

### 5.4 Markdown 規格

Markdown 檔以語言為後綴（`name.en.md` / `name.zh-TW.md`），檔頭可用 YAML front matter：

```md
---
title: awesome-cli
date: 2025-03-01
tags: [TypeScript, CLI]
---

## Why

這是一個…

https://github.com/you/awesome-cli

::embed{kind="youtube" url="https://www.youtube.com/watch?v=xxxx"}
```

| 語法                          | 行為                                                                  |
| ----------------------------- | --------------------------------------------------------------------- |
| GFM（表格、任務清單、刪除線） | `remark-gfm`                                                          |
| 程式碼區塊                    | 第一階段僅樣式化；第二階段加入 `rehype-highlight` 語法高亮            |
| 一般連結                      | 站外連結自動 `target="_blank" rel="noopener noreferrer"` 並加外連圖示 |
| **單獨一行的網址**            | 自動轉為 **連結卡片**（LinkCard）；以覆寫 `p` 元件實作，不需額外套件  |
| `::embed{kind="…" url="…"}`   | 嵌入內容（見第 7 節；第二階段，需 `remark-directive`）                |
| 圖片                          | 相對路徑經 `?responsive` 處理，產生 AVIF / WebP `<picture>`           |
| 標題                          | 自動加錨點 id                                                         |
| 原始 HTML                     | **不支援**（預設不解析），避免 XSS                                    |

YAML 內可寫 Markdown 的欄位（以 `<Markdown inline>` 渲染，僅支援粗體、連結、行內程式碼）：`highlights[]`、`friends.exchange.rules` 等；長文一律用 `.md` 檔。

---

## 6. 多語系與瀏覽器語言偵測

### 6.1 支援語言

`en`、`zh-TW`。凡 `zh*`（`zh-TW`、`zh-HK`、`zh-Hant`、`zh-CN`…）一律對應到 `zh-TW`；其餘對應到 `en`。**不提供簡體中文版**。

### 6.2 偵測順序

1. URL 已含 `/en` 或 `/zh-TW` → 直接使用
2. `localStorage` 中使用者手動選過的語言（`try/catch`，且只在瀏覽器端讀取）
3. `navigator.languages`（依偏好順序，第一個命中支援語言者勝出）
4. 都沒有 → `en`

```ts
export const languages = ["en", "zh-TW"] as const;
export type Lang = (typeof languages)[number];

export function detectLang(): Lang {
  const stored = readStoredLang(); // 失敗或不存在 → null
  if (stored) return stored;
  for (const tag of navigator.languages ?? [navigator.language]) {
    const t = tag.toLowerCase();
    if (t.startsWith("zh")) return "zh-TW";
    if (t.startsWith("en")) return "en";
  }
  return "en";
}
```

### 6.3 路由與預渲染

```
src/routes/
├── __root.tsx
├── index.tsx            # `/`：beforeLoad 偵測語言 → redirect 到 /$lang（replace）
└── $lang/
    ├── route.tsx        # 驗證 lang 參數（無效 → notFound）、提供 i18n context、設定 <html lang>
    └── index.tsx        # 首頁
```

- 採**路徑式**語系（`/en`、`/zh-TW`），讓兩種語言都能被預渲染、被搜尋引擎收錄、被分享
- `/` 的預渲染外殼包含：極小的內嵌偵測 script（JS 失效時的備援）、`<noscript>` 內的兩個語言連結、`hreflang` 與 `x-default` alternate
- 每個語言頁面有獨立的 `<title>`、description、Open Graph，並互相宣告 `hreflang`
- 語言切換器（Base UI `Menu` 或 `ToggleGroup`）切換時保留目前 hash，並把選擇寫入 `localStorage`
- 日期、數字一律用 `Intl` 依語言格式化

---

## 7. 專案區與嵌入連結（無詳細頁）

### 7.1 互動

- 桌機：左側 tile 堆疊（專案名稱、狀態徽章、標籤）＋右側詳細面板（套用圓角規則）
- 手機：tile 改為 Accordion，展開後顯示面板內容
- 目前選取的專案可寫入 search param（如 `/zh-TW?p=awesome-cli#projects`），方便**分享連結**但不新增路由；search 以 TanStack Router 的 `validateSearch` 驗證
- 面板內容：封面、摘要、連結按鈕列、Markdown 說明、嵌入內容

### 7.2 `projects.yaml`

```yaml
items:
  - id: awesome-cli
    name: awesome-cli
    status: active # active | wip | archived
    period: { start: 2025-03, end: null }
    featured: true
    tags: [TypeScript, Node.js]
    cover: awesome-cli.webp # src/assets/projects/
    summary:
      en: A small CLI tool for automating dev workflows.
      zh-TW: 自動化開發流程的小型 CLI 工具。
    links:
      - { type: github, url: https://github.com/you/awesome-cli }
      - { type: demo, url: https://example.com }
    embeds:
      - { kind: youtube, url: https://www.youtube.com/watch?v=xxxx }
      - kind: card
        url: https://dev.to/you/awesome-cli
        title: { en: Writing awesome-cli, zh-TW: 開發 awesome-cli 的心得 }
    body: projects/awesome-cli # → md/projects/awesome-cli.<lang>.md（選填）
```

### 7.3 嵌入類型

| `kind`    | 行為                                                                                                                                                 |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `card`    | 連結卡片：網域、標題、描述（YAML 手寫優先，未填則用建置時自動抓取的 Open Graph 資料；執行時不對外請求）                                              |
| `youtube` | 使用 `youtube-nocookie.com`，先顯示縮圖與播放鈕（點擊才載入 iframe）                                                                                 |
| `iframe`  | 通用 iframe（`sandbox`、`loading="lazy"`、`referrerpolicy`）。**目前不開放第三方網域**：`site.yaml` 的 `embedAllowlist` 預設為空，日後需要再逐一加入 |

- `ratio` 為列舉（`video` / `wide` / `square`），對應既有 token，不使用任意值
- 許多網站禁止被 iframe 嵌入；載入失敗或網域不在允許清單時**自動退回連結卡片**
- 部署時 CSP 的 `frame-src` 與 `embedAllowlist` 保持一致
- 連結預覽改為建置時自動抓取，見第 7.4 節

### 7.4 連結預覽（建置時自動抓取）

- 腳本 `scripts/fetch-og.mjs` 在 `pnpm build` 之前自動執行（`prebuild`），也可手動執行 `pnpm og:refresh`
- **蒐集來源**：`projects.yaml` 的 `card` 嵌入與 `links`、Markdown（含部落格）內單獨一行的網址
- **抓取欄位**：標題、描述、網站名稱（優先 `og:*`，退回 `<title>` 與 meta description）
- **快取**：`src/content/.generated/og.json`，以正規化網址為 key 並記錄抓取時間，**commit 進 repo**；預設 30 天內不重抓
- **失敗不中斷建置**：抓取失敗時依序退回快取、再退回網域名稱
- **YAML 手寫欄位優先**於抓取結果
- **安全**：只允許 `https`、逾時 5 秒、限制回應大小與轉址次數、拒絕私有 / 本機 IP（腳本跑在 CI 內，避免 SSRF）、使用固定 User-Agent
- **隱私**：訪客瀏覽時不對外請求；預覽圖第一版不抓（避免熱連結），日後若要加，建置時下載並用 `?responsive` 處理
- `pnpm check` 不連網；測試以 mock 取代實際請求

---

## 8. 友站（Friends）

### 8.1 `friends.yaml`

```yaml
intro:
  en: Sites by people I like reading.
  zh-TW: 一些我喜歡閱讀的朋友的網站。
items:
  - name: Alice's Blog
    url: https://alice.example.com
    description:
      en: Notes on frontend and design.
      zh-TW: 前端與設計筆記。
    avatar: alice.webp # src/assets/friends/；省略則顯示首字母
    badge: alice-88x31.gif # 選填，88×31 小圖章（src/assets/friends/badges/）
    tags: [blog, frontend]
exchange: # 友站申請資訊（給別人複製用）
  name: Your Name
  url: https://you.example.com
  description:
    en: Software engineer. Building reliable things for the web.
    zh-TW: 軟體工程師，打造可靠的網路產品。
  avatar: /avatar.png # 對外公開的頭像網址
  badge: /badge-88x31.png # 選填，88×31 小圖章，供對方放在自己的友站頁
  apply: mailto:you@example.com # 或 GitHub issue 連結
  rules: |
    - 內容原創、持續更新
    - 請先放上本站連結再來申請
```

### 8.2 呈現

- 卡片網格（頭像、名稱、描述、標籤、外連圖示），手機單欄、桌機 2～3 欄
- 「友站申請」卡片：顯示本站資訊（名稱、網址、描述、頭像），每個欄位附一鍵複製（Base UI Toast 或 Tooltip 提示「已複製」）；下方為 `rules` 與申請方式
- 頭像使用本地資產，**不在執行時抓取對方 favicon**（避免外洩訪客資訊、CSP 限制）
- **88×31 小圖章**：友站若有 `badge`，在卡片上以原始尺寸（寬 88、高 31，不套用縮放）顯示；「友站申請」卡片提供本站小圖章與**複製 HTML 片段**按鈕，方便對方貼到自己的網站

---

## 9. 部落格（Blog）區塊

> 部落格是首頁的一個**區塊**（`#blog`），沒有獨立的列表頁或文章頁。文章是 `src/content/blog/` 下的 Markdown 檔，**直接把檔案內容渲染出來，不做額外加工**。

### 9.1 文章檔案

```
src/content/blog/
├── hello-world.en.md
├── hello-world.zh-TW.md
└── my-first-post.zh-TW.md     # 只有一種語言也可以
```

Front matter 只有標題與日期（YAML）：

```yaml
---
title: 我的第一篇文章
date: 2026-10-21
---
```

- `slug` ＝ 檔名去掉語言後綴；文章圖片放 `src/assets/blog/<slug>/`，Markdown 內以檔名引用
- 選填 `draft: true`：只在開發模式顯示，不進正式建置

### 9.2 呈現規則

- 區塊依 `date` **由新到舊**列出所有文章；每篇顯示 front matter 的標題與日期，接著是 Markdown 內容原樣渲染（使用與 About、專案說明相同的 `<Markdown>` 元件）
- 語言：依目前語言載入 `<slug>.<lang>.md`；沒有該語言版本就直接顯示現有版本，不加徽章或提示
- **不做**：獨立路由、目錄、標籤篩選、閱讀時間、摘要、封面圖、分頁、RSS、留言、搜尋
- 文章在首頁區塊內，隨首頁一起預渲染，不另產生頁面或 sitemap 項目

### 9.3 技術做法

- `import.meta.glob("/src/content/blog/*.md", { query: "?raw", import: "default", eager: true })` 載入；以 `front-matter` 解析標題與日期；由檔名取得 slug 與語言
- 內容檢查（Vitest）：`title`、`date` 必填且日期格式正確、slug + 語言唯一、引用的圖片存在

---

## 10. 其他內容範例

### `profile.yaml`

```yaml
name: Your Name
title: { en: Software Engineer, zh-TW: 軟體工程師 }
location: { en: Taipei, Taiwan, zh-TW: 台灣・台北 }
timezone: Asia/Taipei
tagline:
  en: Building reliable things for the web.
  zh-TW: 打造可靠的網路產品。
status:
  state: open # open | busy | away
  text: { en: Open to work, zh-TW: 開放工作機會 }
stats:
  - { value: 6, label: { en: Years, zh-TW: 年資 } }
  - { value: 20, label: { en: Projects, zh-TW: 專案 } }
  - { value: 300, label: { en: Commits / yr, zh-TW: 年度 Commits } }
primaryCta: projects # 對應 site.yaml nav 的 id；Hero 以綠色強調該顆 CTA，其餘為外框按鈕
about: about # → md/about.<lang>.md
```

### `skills.yaml`

```yaml
groups:
  - name: Languages
    items: [TypeScript, JavaScript, Python, Go]
  - name: Frontend
    items: [React, Tailwind CSS, Vite, TanStack Router]
  - name: Tools
    items: [Git, Docker, Linux, pnpm]
marquee: [TypeScript, React, Vite, Tailwind, pnpm, Linux]
```

### `experience.yaml`

```yaml
items:
  - company: Company Name
    role: { en: Frontend Engineer, zh-TW: 前端工程師 }
    period: { start: 2023-01, end: null } # end: null → 顯示 Present 徽章
    highlights:
      - { en: Led migration to React 19 and Vite., zh-TW: 主導遷移至 React 19 與 Vite。 }
      - { en: Reduced bundle size by **35%**., zh-TW: 將 bundle 縮小 **35%**。 }
```

### `contact.yaml`

```yaml
email: you@example.com
links:
  - { label: GitHub, icon: github, url: https://github.com/you }
  - { label: LinkedIn, icon: linkedin, url: https://linkedin.com/in/you }
```

### 技術做法

- 以 Vite YAML plugin 直接 `import` YAML；`.yaml` 需在 `src/types/yaml.d.ts` 宣告 module
- `src/types/content.ts` 定義每份內容的型別，`src/lib/content.ts` 匯出 typed 資料與 `t(value, lang)` 輔助函式
- Markdown：`import.meta.glob("/src/content/md/**/*.md", { query: "?raw", import: "default", eager: false })`，依語言後綴取檔，缺檔退回另一語言
- `icon` 對應 `lucide-react` 圖示或 `src/assets/brands/` 的品牌 SVG
- 內容檢查（Vitest）：必填欄位雙語皆有、`id` 唯一、網址格式正確、`body` 指向的 md 存在、`avatar` / `cover` 檔案存在

---

## 11. 專案結構、建置與部署

```
src/
├── routes/                    # file-based routes（見第 6.3 節）
│   ├── __root.tsx
│   ├── index.tsx
│   └── $lang/
│       ├── route.tsx
│       └── index.tsx
├── components/
│   ├── ui/                    # 原子元件，一檔一個，kebab-case，皆基於 Base UI
│   │   ├── button.tsx  tabs.tsx  dialog.tsx  tooltip.tsx
│   │   ├── collapsible.tsx  menu.tsx  toast.tsx  badge.tsx
│   ├── layout/                # navbar、footer、section shell
│   ├── sections/              # hero、status、about、skills、experience、projects、blog、friends、contact
│   ├── markdown.tsx           # Markdown 渲染與自訂元件對應
│   ├── embed.tsx              # card / youtube / iframe
│   ├── link-card.tsx
│   ├── terminal.tsx           # 終端機視窗外框
│   ├── type-writer.tsx
│   └── responsive-image.tsx   # <picture> AVIF/WebP
├── content/                   # ✍️ 使用者只改這裡（見第 5 節）
├── lib/
│   ├── utils.ts               # cn() + tailwind-merge 設定
│   ├── i18n.ts                # 語言偵測、t()
│   ├── content.ts             # typed 內容匯出
│   └── markdown.ts            # front matter 解析、glob 載入
├── types/
├── assets/
├── routeTree.gen.ts           # 自動產生，不手改，但要 commit
├── index.css                  # @theme tokens
└── main.tsx
scripts/
├── prerender.mjs              # 預渲染
├── fetch-og.mjs               # 建置時抓取連結預覽
└── build-sitemap.mjs          # sitemap
```

- **預渲染**：建置時預渲染 `/`、`/en/`、`/zh-TW/`（部落格文章是首頁區塊的一部分，一併輸出）；頁面在 JS 載入前就含有標題、文案與連結。預渲染程式碼不得在 effect 之外呼叫瀏覽器專屬 API
- **sitemap / robots**：由同一份公開頁面清單自動產生 `sitemap.xml`，不手寫
- **Base path**：以 `BASE_PATH` 設定 Vite `base` 與 router `basepath`（預設 `/`）；canonical URL 一律使用正式網域
- **不寫根相對連結**：不寫 `href="/…"`、`src="/…"`，一律使用 `<Link>` 或 import 資源，確保 base path 生效
- **404**：輸出 `404.html`（`index.html` 的複本）供靜態主機使用
- 部署：GitHub Pages（見第 11.1 節）；建置指令 `pnpm build`
- CI：lint、format、build（若 `routeTree.gen.ts` 被重新產生則失敗）、test

### 11.1 部署到 GitHub Pages

- 以 **GitHub Actions** 建置與部署（`actions/upload-pages-artifact` + `actions/deploy-pages`）；repo 的 Pages Source 設為 **GitHub Actions**，不使用 `gh-pages` 分支
- 部署流程（push 到 `main` 或手動觸發）：`pnpm install --frozen-lockfile` → `pnpm check` → `pnpm test` → `pnpm build`（含 `fetch-og` 與預渲染）→ 上傳 `dist/` → 部署
- 另有 CI（pull request 與非部署分支）：lint、format、build、test，不部署
- **網址與 `BASE_PATH`**
  - 使用者網站（repo 名為 `<user>.github.io`）或自訂網域：`BASE_PATH=/`
  - 專案網站（`https://<user>.github.io/<repo>/`）：`BASE_PATH=/<repo>/`
  - 自訂網域在 repo 的 Pages 設定中指定
- **GitHub Pages 的限制與對應**
  - 沒有 SPA fallback：所有公開頁面（`/`、`/en/`、`/zh-TW/`）都預渲染成實體 HTML；`/` 的語言偵測轉址在瀏覽器端完成
  - 不能自訂回應標頭或轉址：CSP 只能用 `<meta http-equiv="Content-Security-Policy">`，`frame-src` 僅允許 `https://www.youtube-nocookie.com`（meta 形式不支援 `frame-ancestors` 等指令）
  - Router 的 trailing slash 設定要與 Pages 輸出一致（`/en/`），避免 canonical 與實際網址不符（以 TanStack Router 文件為準）
  - 輸出 `404.html`（站點根目錄才會被使用）
  - 官方軟性限制：網站約 1 GB、每月約 100 GB 頻寬，個人網站足夠；以官方文件為準
- `fetch-og` 在 Actions 內需要對外網路；失敗時退回快取，不中斷建置；`og.json` 快取要 commit

---

## 12. 元件與樣式規範（沿用參考專案）

### Base UI 為硬性要求

- 任何影響使用體驗的互動元素（按鈕、分頁、選單、對話框、提示、輸入、開關…）**必須**以 `@base-ui/react` 建構，不手刻 `<div>` + 自訂鍵盤／焦點／ARIA
- 撰寫前先查 Base UI 文件（隨套件提供：`node_modules/@base-ui/react/docs/react/components/<name>.md`），以其為準
- **不得**用 `Button` 的 `render` 屬性渲染 `<a>`；連結以 `buttonVariants()` 套用在 `<a>` 或 `<Link>` 上
- 不引入其他 headless / 預設樣式 UI 套件（Radix、shadcn/ui、Headless UI、MUI…）

| 需求                       | 使用                        |
| -------------------------- | --------------------------- |
| 按鈕、圖示按鈕             | `Button`                    |
| Skills 分類                | `Tabs`                      |
| 經歷重點展開、手機版專案   | `Collapsible` / `Accordion` |
| 語言切換、手機導覽         | `Menu`                      |
| 圖片燈箱、必要時的大型嵌入 | `Dialog`                    |
| 社群圖示說明               | `Tooltip`                   |
| 「已複製」回饋             | `Toast`（或 Tooltip）       |

### 樣式

- 元件為 shadcn 風格的薄包裝：包住 Base UI 的 part，自己擁有 Tailwind class；程式碼在本專案內，可自由修改
- 以 Base UI 的 data attribute 設定狀態樣式：`data-active:`（Tabs）、`data-checked:`、`data-popup-open:`、`data-disabled:`、`data-[orientation=vertical]:`
- 元件接受字串 `className`，以 `cn()` 合併；型別為 `WithClassName<X.Props>`
- 所有互動元素的 focus ring：`focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue`
- 圖示：優先使用 `lucide-react`；**品牌圖示（GitHub、LinkedIn 等）若 Lucide 沒有，則放 SVG 到 `src/assets/brands/` 後 import**，不手畫近似路徑
- 圖片：以 `vite-imagetools` 的 `?responsive` 處理（AVIF + WebP 多尺寸），用 `ResponsiveImage` 渲染；首屏圖片 `loading="eager"` 與 `fetchPriority="high"`

### 路由與錨點

- 站內跳轉到區塊一律用 `<Link to="/$lang" params={{ lang }} hash="projects">`，不用 `<a href="#projects">`
- 由 router 負責平滑捲動（`defaultHashScrollIntoView`，`prefers-reduced-motion` 下瞬間捲動），`html` 加 `scroll-pt-header` 避開導覽列；**不要**在 CSS 加 `scroll-behavior: smooth`
- `routeTree.gen.ts` 由 Vite plugin 產生，不手改，但要 commit

---

## 13. 體驗、無障礙與效能

- 鍵盤友善：所有互動元件可用鍵盤操作，focus 樣式明確
- 對比度符合 WCAG AA；語意化標籤；`<html lang>` 隨語言更新
- 動畫（打字機、跑馬燈、游標）在 `prefers-reduced-motion` 下停用
- 響應式 Mobile First；token 內建手機覆寫
- 部落格：每篇文章使用 `<article>`，標題階層連續，程式碼區塊可鍵盤捲動
- 效能：字體子集化、圖片 `?responsive`、嵌入內容點擊才載入、預渲染

---

## 14. 開發里程碑

- [ ] **M1 初始化**：Vite + React 19 + TS + Tailwind v4 + TanStack Router + pnpm 封鎖
- [ ] **M2 基礎**：`@/` alias、`cn()`、`@theme` token、Noto Sans TC / JetBrains Mono 自託管與子集化、`pnpm check`
- [ ] **M3 內容層**：YAML plugin、型別、`content.ts`、`react-markdown` 渲染、內容檢查
- [ ] **M4 i18n**：語言偵測、`/$lang` 路由、語言切換、hreflang
- [ ] **M5 UI 元件**：Button / Tabs / Collapsible / Menu / Dialog / Tooltip / Toast / ToggleGroup / Terminal 等
- [ ] **M6 首頁區塊**：`nav` 單一來源（含 icon）→ Navbar → Hero → Status → About → Skills → Experience → Contact → Footer
- [ ] **M7 專案區**：專案面板、`LinkCard`、YouTube 嵌入、`fetch-og` 腳本
- [ ] **M8 友站**：卡片網格、88×31 小圖章、友站申請卡片
- [ ] **M9 部落格區塊**：載入 `src/content/blog/*.md`、解析 front matter、依日期排序並直接渲染
- [ ] **M10 預渲染與 SEO**：預渲染、sitemap、meta、OG
- [ ] **M11 第二階段 Markdown**：`remark-directive`（`::embed`）、`rehype-highlight`
- [ ] **M12 打磨與部署**：無障礙、動畫、`pnpm check` 與測試全通過、GitHub Actions 部署到 GitHub Pages

---

## 15. 決定與待確認事項

### 已確認

| 項目       | 結論                                                      |
| ---------- | --------------------------------------------------------- |
| 中文字型   | Noto Sans TC                                              |
| Markdown   | 先用 `react-markdown`                                     |
| 語言       | 只有 `en` / `zh-TW`，不做簡體                             |
| 分頁 CTA   | 每個分頁一顆，附對應 icon                                 |
| 嵌入來源   | 暫時只有 YouTube，其他 iframe 先不開放                    |
| 連結預覽   | 建置時自動抓取                                            |
| 部落格     | 首頁的一個區塊；Markdown + YAML front matter，直接渲染    |
| 友站小圖章 | 支援 88×31                                                |
| 部署       | GitHub Pages（GitHub Actions）                            |
| 設計稿     | token 暫以本文件為準；若之後有 Figma 設計稿則以設計稿為準 |

### 待確認

1. **網址形式**：使用者網站（`<user>.github.io`）、專案網站，還是自訂網域？這會決定 `BASE_PATH` 與 canonical
2. **程式碼高亮**：第二階段預設用 `rehype-highlight`，是否同意？
