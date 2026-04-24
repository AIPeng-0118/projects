import { EmotionState } from "./types";

const SYSTEM_PROMPT = `你是一个正在和男朋友/女朋友吵架的角色扮演游戏。

【游戏背景】
用户需要通过选择正确的对话选项来"哄好"正在生气的对象。每轮用户选择一个回复，然后你会根据选择给出新的对话和好感度变化。

【核心规则】
1. 你必须返回一个JSON对象，包含以下字段：
   - message: 角色说的下一句话（要符合当前情绪状态，对话要连贯自然）
   - affectionChange: 好感度变化值（-30到+20之间的整数）
   - emotionState: 当前情绪状态，枚举值：furious/angry/annoyed/softening/almost/forgiven
   - options: 6个用户可选的回复（必须包含2个好选项和4个坏选项）

2. 选项设计原则（重点！）：
   - 2个好选项：真诚道歉、具体弥补方案、提起共同美好回忆等，加分+5到+20
   - 2个普通减分选项：敷衍、转移话题、找借口等，减分-5到-15
   - 2个"忍不住想选"的搞笑减分选项：这些选项要看起来很有道理、很诱人、甚至有点浪漫，但实际效果极差！让人看到就想点，选完立刻后悔！
     * 比如：
       - "要不我跪键盘给你表演一个？"（以为很搞笑很诚恳，实际很蠢）
       - "你生气的样子好可爱哦，像个小仓鼠一样鼓着脸~"（以为是夸她，实际火上浇油）
       - "要不我发个毒誓？我要是再犯就让我胖十斤！"（以为很认真，实际很敷衍）
       - "我错了，但我打游戏也是为了放松啊，不放松怎么有精力陪你？"（前半句对，后半句找借口）
       - "那我罚自己一个月不许吃肉！"（以为自己很惨很诚恳，实际跟哄人没关系）
       - "来来来，跟我一起骂我自己，你骂我一句我给你发10块钱红包"（以为是互动，实际很幼稚）
       - "我已经深刻反省了，总结了一万字的检讨书，你要看吗？"（形式主义，看似认真实则逃避）
       - "要不这样，我们都不提这件事了，当它没发生过好不好？"（以为翻篇了，实际在逃避）
     * 减分-10到-30

3. 情绪状态规则：
   - furious（-50到0分）：非常生气，冷暴力或激烈质问
   - angry（0到30分）：还在生气，但愿意听你说
   - annoyed（30到60分）：开始软化，嘴上生气但语气缓和
   - softening（60到80分）：快被哄好了，可能撒娇或小声说"哼"
   - almost/forgiven（80分以上）：原谅了，但还要你保证不再犯

4. 对话风格：
   - 俏皮、搞笑、给人轻松感
   - 即使生气也要带点可爱
   - 对方的话必须和前面的对话连贯

5. 输出格式：
   必须只输出JSON，不要包含任何其他文字。

【输出JSON格式】
{
  "message": "角色说的话",
  "affectionChange": 数字,
  "emotionState": "情绪状态",
  "options": [
    {"id": "1", "text": "选项1文字", "isGood": true},
    {"id": "2", "text": "选项2文字", "isGood": true},
    {"id": "3", "text": "选项3文字", "isGood": false},
    {"id": "4", "text": "选项4文字", "isGood": false},
    {"id": "5", "text": "选项5文字", "isGood": false},
    {"id": "6", "text": "选项6文字", "isGood": false}
  ]
}`;

// 场景提示词
const SCENE_PROMPTS: Record<string, string> = {
  anniversary: "用户忘记了你们在一起三周年的纪念日，完全没有任何表示，甚至连一句「今天是我们在一起三周年」都没说。",
  no_reply: "用户昨晚打游戏到凌晨三点，期间对方发了十几条消息问用户在干嘛、怎么还不睡，用户一条都没回。",
  chat_record: "对方发现用户和一个异性朋友有暧昧的聊天记录，虽然用户说是普通朋友但内容让人不舒服。",
  lost_cat: "用户帮对方照顾猫的时候，猫从窗户跑丢了，用户找了很久都没找到。",
  embarrass: "用户在朋友聚会上开了一个过心的玩笑，让对方在朋友面前很没面子。",
};

// 性别称呼
const GENDER_CALLS: Record<string, { self: string; partner: string }> = {
  girlfriend: { self: "男朋友", partner: "我" },
  boyfriend: { self: "女朋友", partner: "我" },
};

function getEmotionState(affection: number): EmotionState {
  if (affection < 0) return "furious";
  if (affection < 30) return "angry";
  if (affection < 60) return "annoyed";
  if (affection < 80) return "softening";
  return "almost";
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function buildGamePrompt(
  sceneId: string,
  gender: "girlfriend" | "boyfriend",
  round: number,
  currentAffection: number,
  messages: Array<{ role: "ai" | "user"; content: string }>,
  chosenOption?: string
): string {
  const sceneContext = SCENE_PROMPTS[sceneId] || "";
  const genderContext = GENDER_CALLS[gender];
  const emotionState = getEmotionState(currentAffection);

  let prompt = `${SYSTEM_PROMPT}

【具体场景】
${sceneContext}

【角色设定】
你是${genderContext.partner}的${genderContext.self}，现在正在生气。

【当前状态】
- 当前回合：第${round}轮（最多10轮）
- 当前好感度：${currentAffection}/100（初始20，最低-50，最高100）
- 当前情绪状态：${emotionState}
- 胜利条件：10轮内好感度>=80
- 失败条件：好感度<-50，或10轮后好感度<80`;

  if (chosenOption) {
    prompt += `\n\n【上一轮用户的回复】\n${chosenOption}`;
  }

  if (messages.length > 0) {
    prompt += `\n\n【对话历史】`;
    messages.forEach((msg) => {
      if (msg.role === "ai") {
        prompt += `\n${genderContext.partner}：${msg.content}`;
      } else {
        prompt += `\n你：${msg.content}`;
      }
    });
  }

  prompt += `\n\n【你的第一句话】请根据以上情境，生成一句生气但可爱的话作为开场白，然后生成6个选项。`;

  return prompt;
}

export function parseGameResponse(content: string): {
  message: string;
  affectionChange: number;
  emotionState: EmotionState;
  options: Array<{ id: string; text: string; isGood: boolean }>;
} | null {
  try {
    // 尝试提取JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);

    // 验证必要字段
    if (
      typeof parsed.message !== "string" ||
      typeof parsed.affectionChange !== "number" ||
      !parsed.options ||
      parsed.options.length !== 6
    ) {
      return null;
    }

    // 确保有2个好选项和4个坏选项
    const goodCount = parsed.options.filter((o: { isGood: boolean }) => o.isGood).length;
    const badCount = parsed.options.filter((o: { isGood: boolean }) => !o.isGood).length;

    if (goodCount !== 2 || badCount !== 4) {
      return null;
    }

    // 添加ID并打乱顺序
    const optionsArray = parsed.options as Array<{ text: string; isGood: boolean }>;
    const options = shuffleArray(
      optionsArray.map((o, i) => ({
        id: String(i + 1),
        text: o.text,
        isGood: o.isGood,
      }))
    );

    return {
      message: parsed.message,
      affectionChange: parsed.affectionChange,
      emotionState: parsed.emotionState || getEmotionState(parsed.affectionChange || 0),
      options,
    };
  } catch {
    return null;
  }
}
