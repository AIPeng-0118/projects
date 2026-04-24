# 哄哄模拟器 - 项目开发规范

## 项目概览

哄哄模拟器是一个网页游戏，AI扮演正在生气的对象（男/女朋友），用户通过选择题的方式在10轮内把对方哄好。

## 技术栈

- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript 5
- **UI组件**: shadcn/ui (基于 Radix UI)
- **样式**: Tailwind CSS 4
- **AI能力**: coze-coding-dev-sdk (LLM对话 + TTS语音)

## 目录结构

```
src/
├── app/
│   ├── api/
│   │   ├── game/route.ts    # 游戏主逻辑API
│   │   └── tts/route.ts     # TTS语音合成API
│   ├── blog/
│   │   ├── page.tsx         # 博客列表页
│   │   └── [slug]/
│   │       └── page.tsx     # 文章详情页
│   ├── game/
│   │   └── page.tsx         # 游戏主页面
│   ├── globals.css          # 全局样式
│   ├── layout.tsx           # 根布局
│   └── page.tsx             # 首页（场景选择）
├── components/
│   ├── AffectionBar.tsx     # 好感度进度条
│   ├── ChatBubble.tsx       # 聊天气泡
│   ├── OptionButton.tsx     # 选项按钮
│   ├── ShareCard.tsx        # 分享卡片
│   └── TypewriterText.tsx   # 打字机效果
└── lib/
    ├── blog.ts              # 博客文章数据
    ├── game.ts              # 游戏逻辑（prompt构建、响应解析）
    ├── types.ts             # 类型定义
    └── utils.ts             # 工具函数
```

## 核心功能

### 1. 游戏流程

1. 用户选择对方性别（女朋友/男朋友）
2. 用户从5个预设场景中选择一个
3. 用户选择AI的声音类型
4. 进入游戏，AI生成第一句话 + 6个选项
5. 用户选择选项，AI根据选择生成下一轮对话
6. 10轮内好感度 >= 80 获胜

### 2. 好感度系统

- 初始值: 20分（满分100，最低-50）
- 胜利条件: 10轮内好感度 >= 80
- 失败条件: 好感度降到 -50 以下，或10轮用完好感度仍 < 80
- 好感度变化不显示具体数字，只展示进度条

### 3. 选项设计

每轮6个选项:
- 2个加分选项（+5到+20）
- 4个减分选项（-5到-30），其中包含搞笑选项

### 4. 情绪状态

根据好感度自动变化:
- `-50到0`: 非常生气
- `0到30`: 还在生气
- `30到60`: 开始软化
- `60到80`: 快被哄好了
- `80以上`: 原谅了

## API接口

### POST /api/game

游戏主逻辑接口，调用LLM生成对话和选项。

**请求参数**:
```typescript
{
  sceneId: string;          // 场景ID
  gender: "girlfriend" | "boyfriend";
  voiceType: VoiceType;
  round: number;             // 当前轮次
  currentAffection: number;  // 当前好感度
  messages: Array<{ role: "ai" | "user"; content: string }>;
  chosenOption?: string;     // 用户选择的选项
}
```

**响应**:
```typescript
{
  success: boolean;
  data?: {
    message: string;           // AI说的话
    affectionChange: number;   // 好感度变化
    emotionState: EmotionState;
    options: GameOption[];
  };
  error?: string;
}
```

### POST /api/tts

TTS语音合成接口。

**请求参数**:
```typescript
{
  text: string;   // 要转换的文本
  speaker: string; // 声音类型
}
```

**响应**:
```typescript
{
  success: boolean;
  audioUri?: string;
  error?: string;
}
```

## 开发命令

```bash
pnpm install     # 安装依赖
pnpm dev         # 开发环境
pnpm build       # 生产构建
pnpm lint        # 代码检查
pnpm ts-check    # 类型检查
```

## 注意事项

1. **SDK使用规范**: coze-coding-dev-sdk只能在后端代码中使用
2. **流式输出**: LLM使用stream()方法实现打字机效果
3. **好服务端口**: 必须使用5000端口
4. **包管理器**: 仅允许使用pnpm，禁止npm/yarn
