// 预设场景
export interface Scene {
  id: string;
  title: string;
  description: string;
}

export const SCENES: Scene[] = [
  {
    id: "anniversary",
    title: "忘记纪念日",
    description: "今天是你们在一起三周年，你完全忘了",
  },
  {
    id: "no_reply",
    title: "深夜不回消息",
    description: "你昨晚打游戏到凌晨三点，对方发了十几条消息你都没回",
  },
  {
    id: "chat_record",
    title: "被发现和异性聊天",
    description: "对方看到你和异性朋友的暧昧聊天记录",
  },
  {
    id: "lost_cat",
    title: "把对方的猫弄丢了",
    description: "你帮对方照顾猫的时候，猫跑丢了",
  },
  {
    id: "embarrass",
    title: "当众让对方没面子",
    description: "你在朋友聚会上开了一个过分的玩笑",
  },
];

// 声音类型
export type VoiceType = "gentle_female" | "cool_female" | "cute_female" | "deep_male" | "gentle_male";

export interface VoiceOption {
  id: VoiceType;
  label: string;
  speaker: string;
}

export const VOICE_OPTIONS: VoiceOption[] = [
  { id: "gentle_female", label: "温柔女声", speaker: "zh_female_xiaohe_uranus_bigtts" },
  { id: "cool_female", label: "霸道御姐", speaker: "zh_female_meilinvyou_saturn_bigtts" },
  { id: "cute_female", label: "可爱软妹", speaker: "saturn_zh_female_keainvsheng_tob" },
  { id: "deep_male", label: "低沉男声", speaker: "zh_male_m191_uranus_bigtts" },
  { id: "gentle_male", label: "温柔男声", speaker: "zh_male_taocheng_uranus_bigtts" },
];

// 对话选项
export interface GameOption {
  id: string;
  text: string;
  isGood: boolean;
}

// AI回复
export interface AIReply {
  message: string;
  affectionChange: number;
  emotionState: EmotionState;
}

// 情绪状态
export type EmotionState = "furious" | "angry" | "annoyed" | "softening" | "almost" | "forgiven";

// 对话消息
export interface ChatMessage {
  id: string;
  role: "ai" | "user";
  content: string;
  timestamp: number;
}

// 游戏状态
export interface GameState {
  scene: Scene | null;
  gender: "girlfriend" | "boyfriend";
  voiceType: VoiceType;
  round: number;
  affection: number;
  messages: ChatMessage[];
  isTyping: boolean;
  isLoading: boolean;
  gameOver: boolean;
  gameResult: "win" | "lose" | null;
  chosenOptions: string[]; // 用户选过的搞笑选项
}

// API 请求/响应类型
export interface GameRequest {
  sceneId: string;
  gender: "girlfriend" | "boyfriend";
  voiceType: VoiceType;
  round: number;
  currentAffection: number;
  messages: Array<{ role: "ai" | "user"; content: string }>;
  chosenOption?: string;
}

export interface GameResponse {
  success: boolean;
  data?: {
    message: string;
    affectionChange: number;
    emotionState: EmotionState;
    options: GameOption[];
  };
  error?: string;
}

export interface TTSRequest {
  text: string;
  speaker: string;
}

export interface TTSResponse {
  success: boolean;
  audioUri?: string;
  error?: string;
}

// 情绪状态对应的UI状态
export const EMOTION_CONFIG: Record<EmotionState, { label: string; color: string }> = {
  furious: { label: "非常生气", color: "text-red-500" },
  angry: { label: "还在生气", color: "text-orange-500" },
  annoyed: { label: "态度缓和", color: "text-yellow-500" },
  softening: { label: "开始软化", color: "text-lime-500" },
  almost: { label: "快被哄好了", color: "text-green-400" },
  forgiven: { label: "原谅了", color: "text-green-500" },
};
