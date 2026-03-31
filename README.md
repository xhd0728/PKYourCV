# PKYourCV

一个幽默搞怪的恶搞 Web 项目。

用户可以上传 `个人主页 URL` 或 `PDF 简历`，系统会先抽取文字，再用“刻薄但不下三路”的大厂 HR 口吻给出点评。还支持双人 PK 和匿名排行榜。

## 功能

- `单人审判`：输出大厂生还率、抽象浓度、一句话毒评、致命硬伤、三条抢救建议、维度打分
- `简历 PK`：分别分析两份材料，再判断谁更能进厂、谁更像事故现场，并生成对战解说
- `排行榜`：自动收录单人审判结果，支持 `最能进厂榜` 和 `最离谱简历榜`
- `OpenAI-compatible`：支持标准 OpenAI 接口，也支持兼容后端，比如自部署 vLLM

## 技术栈

- Next.js 16 + TypeScript + Tailwind CSS 4
- Prisma Client + SQLite
- OpenAI Node SDK
- `cheerio` 做网页文本抽取
- `pdf-parse` 做 PDF 文本抽取
- Vitest + Testing Library

## 启动

1. 安装依赖

```bash
npm install
```

2. 复制环境变量

```bash
cp .env.example .env.local
```

3. 配置模型接口

```env
OPENAI_BASE_URL="https://api.openai.com/v1"
OPENAI_API_KEY="sk-..."
OPENAI_MODEL="gpt-4.1-mini"
```

4. 初始化 SQLite

```bash
npm run db:init
```

5. 启动开发环境

```bash
npm run dev
```

打开 `http://localhost:3000`。

## 说明

- 只支持 `URL + PDF`
- 只抽取文字，不做 OCR，不看图片
- 排行榜默认匿名展示，不公开原始简历和完整主页文本
- 首次访问排行榜或首次写入记录时，应用也会自动自举 SQLite 表结构
- API 路由：
  - `POST /api/analyze`
  - `POST /api/duel`
  - `GET /api/leaderboard?board=hireable|chaos`

## 校验

```bash
npm run lint
npm test
npm run build
```
