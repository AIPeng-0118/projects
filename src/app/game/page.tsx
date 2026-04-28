"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { TypewriterText } from "@/components/TypewriterText";
import { OptionButton } from "@/components/OptionButton";
import {
  SCENES,
  VOICE_OPTIONS,
  GameOption,
  ChatMessage,
  EmotionState,
  VoiceType,
} from "@/lib/types";

interface User {
  id: number;
  username: string;
}

const MAX_ROUNDS = 10;
const INITIAL_AFFECTION = 20;
const WIN_AFFECTION = 80;
const LOSE_AFFECTION = -50;

// 微信风格头像SVG
const AI_AVATAR = (gender: "girlfriend" | "boyfriend") => (
  <svg viewBox="0 0 40 40" className="w-full h-full rounded-full bg-pink-100">
    {gender === "girlfriend" ? (
      <>
        <circle cx="20" cy="14" r="8" fill="#FFB6C1" />
        <circle cx="20" cy="14" r="6" fill="#FFC0CB" />
        <circle cx="18" cy="13" r="1" fill="#333" />
        <circle cx="22" cy="13" r="1" fill="#333" />
        <path d="M18 16 Q20 18 22 16" stroke="#333" strokeWidth="1" fill="none" />
        <ellipse cx="20" cy="30" rx="12" ry="10" fill="#FFB6C1" />
        <path d="M10 28 Q20 22 30 28" fill="#FF69B4" />
      </>
    ) : (
      <>
        <circle cx="20" cy="14" r="8" fill="#87CEEB" />
        <circle cx="20" cy="14" r="6" fill="#ADD8E6" />
        <circle cx="18" cy="13" r="1" fill="#333" />
        <circle cx="22" cy="13" r="1" fill="#333" />
        <path d="M18 16 Q20 17 22 16" stroke="#333" strokeWidth="1" fill="none" />
        <ellipse cx="20" cy="30" rx="12" ry="10" fill="#87CEEB" />
        <path d="M8 26 L20 20 L32 26" fill="#4169E1" />
      </>
    )}
  </svg>
);

const USER_AVATAR = (
  <svg viewBox="0 0 40 40" className="w-full h-full rounded-full bg-green-100">
    <circle cx="20" cy="15" r="8" fill="#90EE90" />
    <circle cx="18" cy="14" r="1" fill="#333" />
    <circle cx="22" cy="14" r="1" fill="#333" />
    <path d="M18 17 Q20 19 22 17" stroke="#333" strokeWidth="1" fill="none" />
    <ellipse cx="20" cy="30" rx="12" ry="10" fill="#90EE90" />
  </svg>
);

export default function GamePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messageIdCounter = useRef<number>(1);

  // 游戏配置
  const [sceneId, setSceneId] = useState<string>("");
  const [gender, setGender] = useState<"girlfriend" | "boyfriend">("girlfriend");
  const [voiceType, setVoiceType] = useState<VoiceType>("gentle_female");

  // 游戏状态
  const [round, setRound] = useState(1);
  const [affection, setAffection] = useState(INITIAL_AFFECTION);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentAIMessage, setCurrentAIMessage] = useState("");
  const [options, setOptions] = useState<GameOption[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emotionState, setEmotionState] = useState<EmotionState>("angry");
  const [lastChange, setLastChange] = useState<number | undefined>(undefined);
  const [gameOver, setGameOver] = useState(false);
  const [gameResult, setGameResult] = useState<"win" | "lose" | null>(null);
  const [chosenOptions, setChosenOptions] = useState<string[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [requestError, setRequestError] = useState<string>(""); // 请求错误信息
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null); // 当前正在播放的语音URL

  // 派生的场景对象
  const currentScene = SCENES.find((s) => s.id === sceneId);
  const scenarioName = currentScene?.title || sceneId;

  // 获取配置和用户状态
  useEffect(() => {
    const scene = searchParams.get("scene") || "anniversary";
    const gen = (searchParams.get("gender") || "girlfriend") as "girlfriend" | "boyfriend";
    const voice = (searchParams.get("voice") || "gentle_female") as VoiceType;

    setSceneId(scene);
    setGender(gen);
    setVoiceType(voice);

    // 检查登录状态
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, [searchParams]);

  // 自动滚动到底部
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentAIMessage, scrollToBottom]);

  // 根据好感度获取情绪状态
  const getEmotionState = (aff: number): EmotionState => {
    if (aff < 0) return "furious";
    if (aff < 30) return "angry";
    if (aff < 60) return "annoyed";
    if (aff < 80) return "softening";
    return "almost";
  };

  // 情绪表情
  const getEmotionEmoji = (state: EmotionState): string => {
    const emojis: Record<EmotionState, string> = {
      furious: "😡",
      angry: "😠",
      annoyed: "😤",
      softening: "🙂",
      almost: "😊",
      forgiven: "🥰",
    };
    return emojis[state];
  };

   
  const callGameAPIRef = useRef<((chosenOption?: string) => Promise<{
    message: string;
    affectionChange: number;
    emotionState: EmotionState;
    options: GameOption[];
  } | undefined>) | null>(null);
   
  const callTTSRef = useRef<((text: string) => Promise<string | null>) | null>(null);

  if (!callGameAPIRef.current) {
    callGameAPIRef.current = async (chosenOption?: string) => {
      setIsLoading(true);

      try {
        const response = await fetch("/api/game", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sceneId,
            gender,
            voiceType,
            round,
            currentAffection: affection,
            messages: messages.map((m) => ({ role: m.role, content: m.content })),
            chosenOption,
          }),
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "游戏出错");
        }

        return data.data;
      } catch (error) {
        console.error("API调用失败:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    };
  }

  // 过滤文本中的括号内容（神态动作描述）
  const cleanTextForTTS = (text: string): string => {
    // 移除所有括号内的内容，包括中英文括号
    return text
      .replace(/（[^）]*）/g, "")  // 移除中文括号内容
      .replace(/\([^)]*\)/g, "")   // 移除英文括号内容
      .trim();
  };

  if (!callTTSRef.current) {
    callTTSRef.current = async (text: string): Promise<string | null> => {
      try {
        // 清理文本，移除括号内的神态动作描述
        const cleanedText = cleanTextForTTS(text);
        
        if (!cleanedText) {
          return null;
        }

        const speaker = VOICE_OPTIONS.find((v) => v.id === voiceType)?.speaker || "zh_female_xiaohe_uranus_bigtts";

        const response = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: cleanedText, speaker }),
        });

        const data = await response.json();

        if (data.success && data.audioUri) {
          return data.audioUri;
        }
      } catch (error) {
        console.error("TTS调用失败:", error);
      }
      return null;
    };
  }

  // 开始游戏
  const startGame = useCallback(async () => {
    setCurrentAIMessage("");
    setRequestError("");
    setIsLoading(true);
    
    try {
      const result = await callGameAPIRef.current?.();

      if (!result?.message) {
        throw new Error("未收到有效回复");
      }

      setIsTyping(true);
      setCurrentAIMessage(result.message);
      setOptions(result.options);
      setEmotionState(result.emotionState || "angry");
    } catch (error) {
      console.error("游戏请求失败:", error);
      setIsTyping(false);
      setCurrentAIMessage("");
      setRequestError("请求失败，请点击重试");
    } finally {
      setIsLoading(false);
    }
  }, [sceneId, gender, round, affection, messages]);

  // 打字完成
  const handleTypingComplete = useCallback(() => {
    setIsTyping(false);
    const messageToSave = currentAIMessage;
    if (messageToSave) {
      const messageId = `ai-${messageIdCounter.current++}`;
      setMessages((prev) => [
        ...prev,
        {
          id: messageId,
          role: "ai",
          content: messageToSave,
          timestamp: Date.now(),
        },
      ]);
      setCurrentAIMessage("");
    }
  }, [currentAIMessage]);

  // 选择选项
  const handleOptionSelect = async (option: GameOption) => {
    if (isLoading || isTyping) return;

    const userMessage: ChatMessage = {
      id: `user-${messageIdCounter.current++}`,
      role: "user",
      content: option.text,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);

    if (!option.isGood) {
      setChosenOptions((prev) => [...prev, option.text]);
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(false);

    setCurrentAIMessage("");
    // 保留语音消息，不要清空
    setOptions([]);
    setRound((prev) => prev + 1);

    try {
      setIsTyping(true);
      setIsLoading(true);
      setRequestError("");
      const result = await callGameAPIRef.current?.(option.text);

      if (!result) {
        setIsTyping(false);
        setIsLoading(false);
        setRequestError("请求失败，请点击重试");
        return;
      }

      setLastChange(result.affectionChange);
      const newAffection = Math.max(-50, Math.min(100, affection + result.affectionChange));
      setAffection(newAffection);

      const newEmotion = getEmotionState(newAffection);
      setEmotionState(newEmotion);

      setIsTyping(true);
      setCurrentAIMessage(result.message);
      setOptions(result.options);

      if (newAffection >= WIN_AFFECTION) {
        setGameResult("win");
        setGameOver(true);
        saveGameRecord(scenarioName, newAffection, "win");
      } else if (newAffection < LOSE_AFFECTION || (round >= MAX_ROUNDS && newAffection < WIN_AFFECTION)) {
        setGameResult("lose");
        setGameOver(true);
        saveGameRecord(scenarioName, newAffection, "lose");
      }
    } catch {
      setIsTyping(false);
      setCurrentAIMessage("");
      setRequestError("请求失败，请点击重试");
    } finally {
      setIsLoading(false);
    }
  };

  // 保存游戏记录
  const saveGameRecord = async (scenarioName: string, finalScore: number, result: string) => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    try {
      await fetch("/api/game/save-record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          scenario: scenarioName,
          finalScore: finalScore,
          result: result,
        }),
      });
      setShowSaveSuccess(true);
    } catch {
      // 保存失败，静默处理
    }
  };

  // 播放语音
  const handlePlayVoice = async (text: string, messageId?: string) => {
    if (isSpeaking) {
      audioRef.current?.pause();
      audioRef.current = null;
      setIsSpeaking(false);
      return;
    }

    let audioUrl = null;

    // 如果有消息ID，查找消息是否已有音频URL
    if (messageId) {
      const message = messages.find(msg => msg.id === messageId);
      audioUrl = message?.audioUrl || null;

      // 如果没有音频URL，生成新的
      if (!audioUrl) {
        audioUrl = await callTTSRef.current?.(text);
        if (audioUrl) {
          // 更新消息的音频URL
          setMessages(prevMessages => 
            prevMessages.map(msg => 
              msg.id === messageId ? { ...msg, audioUrl } : msg
            )
          );
        }
      }
    } else {
      // 对于currentAIMessage，直接生成音频URL
      audioUrl = await callTTSRef.current?.(text);
    }

    if (audioUrl) {
      setCurrentAudioUrl(audioUrl);
      try {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        setIsSpeaking(true);

        audio.onended = () => {
          setIsSpeaking(false);
          setCurrentAudioUrl(null);
          audioRef.current = null;
        };

        audio.onerror = (e) => {
          console.error("音频播放失败:", e);
          setIsSpeaking(false);
          setCurrentAudioUrl(null);
          audioRef.current = null;
          // 显示错误提示
          alert("语音播放失败，请检查网络连接后重试");
        };

        await audio.play();
      } catch (error) {
        console.error("音频播放异常:", error);
        setIsSpeaking(false);
        setCurrentAudioUrl(null);
        alert("语音播放失败，请检查网络连接后重试");
      }
    } else {
      alert("语音生成失败，请重试");
    }
  };

  // 重新开始
  const handleRestart = () => {
    router.push("/");
  };

  // 初始化游戏 - 等待 sceneId 设置后再开始
  useEffect(() => {
    if (sceneId && !gameOver && messages.length === 0) {
      startGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneId, gameOver]);

  const scene = SCENES.find((s) => s.id === sceneId);

  // 游戏结束画面
  if (gameOver && gameResult) {
    return (
      <div className="min-h-screen bg-[#EDEDED] flex flex-col">
        {/* 微信风格导航栏 */}
        <div className="bg-[#1E1E1E] text-white px-4 py-3 flex items-center gap-4">
          <button onClick={handleRestart} className="text-lg">
            ←
          </button>
          <span className="font-medium flex-1 text-center">游戏结束</span>
          <span className="text-sm opacity-50">{round - 1}/{MAX_ROUNDS}</span>
        </div>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-lg">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">{gameResult === "win" ? "🎉" : "💔"}</div>
              <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">
                {gameResult === "win" ? "恭喜通关！" : "游戏结束"}
              </h1>
              <p className="text-[#666666]">
                {gameResult === "win"
                  ? "你成功哄好了TA！"
                  : "好感度太低，TA不想理你了..."}
              </p>
              <div className="mt-4 flex justify-center gap-4 text-sm text-[#999999]">
                <span>用了 {round - 1} 轮</span>
                <span>|</span>
                <span>好感度 {affection}</span>
              </div>
            </div>

            {/* 分享卡片 */}
            <div className={`p-4 rounded-xl ${gameResult === "win" ? "bg-[#E8F5E9]" : "bg-[#FFEBEE]"}`}>
              <p className="text-center text-sm text-[#666666] mb-2">
                {gameResult === "win" ? "太厉害了！快分享给朋友炫耀一下~" : "踩坑发言："}{" "}
                {chosenOptions[chosenOptions.length - 1] && (
                  <span className="italic text-[#FF6B6B]">「{chosenOptions[chosenOptions.length - 1]}」</span>
                )}
              </p>
            </div>

            {/* 重新开始按钮 */}
            <button
              onClick={handleRestart}
              className="w-full mt-6 py-3 bg-[#07C160] hover:bg-[#06AD56] text-white rounded-full font-medium transition-colors"
            >
              再试一次
            </button>
          </div>
        </div>

        {/* 保存成功提示 */}
        {showSaveSuccess && user && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full text-sm animate-fade-in">
            ✓ 记录已保存到个人中心
          </div>
        )}

        {/* 未登录提示 */}
        {showLoginPrompt && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
              <h3 className="text-lg font-bold text-center mb-2">登录后可保存游戏记录</h3>
              <p className="text-sm text-[#666666] text-center mb-6">
                登录后将本局游戏保存到个人中心，随时查看历史战绩
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="flex-1 py-3 border border-[#E0E0E0] rounded-full text-[#666666]"
                >
                  稍后登录
                </button>
                <Link
                  href="/login"
                  className="flex-1 py-3 bg-[#07C160] text-white rounded-full text-center font-medium"
                >
                  去登录
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EDEDED] flex flex-col">
      {/* 微信风格导航栏 */}
      <div className="bg-[#1E1E1E] text-white px-4 py-3 flex items-center gap-4 sticky top-0 z-50">
        <button onClick={handleRestart} className="text-lg">
          ←
        </button>
        <div className="flex-1 text-center">
          <span className="font-medium">{scene?.title || "哄哄模拟器"}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs opacity-70">第{round}轮</span>
          <span className="text-xs opacity-50">/ {MAX_ROUNDS}</span>
        </div>
      </div>

      {/* 好感度状态栏 */}
      <div className="bg-white border-b border-[#E0E0E0] px-4 py-2">
        <div className="flex items-center gap-3">
          <span className="text-lg">{getEmotionEmoji(emotionState)}</span>
          <div className="flex-1">
            <div className="flex justify-between text-xs text-[#999999] mb-1">
              <span>好感度</span>
              <span>{affection}/100</span>
            </div>
            <div className="h-1.5 bg-[#E0E0E0] rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  affection < 0
                    ? "bg-[#FF5252]"
                    : affection < 30
                    ? "bg-[#FF9800]"
                    : affection < 60
                    ? "bg-[#FFEB3B]"
                    : affection < 80
                    ? "bg-[#8BC34A]"
                    : "bg-[#4CAF50]"
                }`}
                style={{ width: `${Math.max(0, Math.min(100, ((affection + 50) / 150) * 100))}%` }}
              />
            </div>
          </div>
          {lastChange !== undefined && lastChange !== 0 && (
            <span className={`text-sm font-bold ${lastChange > 0 ? "text-[#4CAF50]" : "text-[#FF5252]"}`}>
              {lastChange > 0 ? "+" : ""}{lastChange}
            </span>
          )}
        </div>
      </div>

      {/* 对话区域 */}
      <div className="flex-1 overflow-auto p-4 bg-[#EDEDED]">
        <div className="max-w-lg mx-auto space-y-3">
          {/* 历史消息 */}
          {messages.map((msg) => (
            <div key={msg.id} className="space-y-1">
              <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "ai" && (
                  <div className="w-9 h-9 flex-shrink-0 mr-2">{AI_AVATAR(gender)}</div>
                )}
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-lg text-sm leading-relaxed shadow-sm ${
                    msg.role === "ai"
                      ? "bg-white text-[#1A1A1A] rounded-tl-none"
                      : "bg-[#95EC69] text-[#1A1A1A] rounded-tr-none"
                  }`}
                >
                  {msg.content}
                </div>
                {msg.role === "user" && (
                  <div className="w-9 h-9 flex-shrink-0 ml-2">{USER_AVATAR}</div>
                )}
              </div>
              {/* 语音播放按钮（每个AI消息下方都显示） */}
              {msg.role === "ai" && (
                <div className="flex justify-start ml-11">
                  <div className="flex items-center gap-2 px-3 py-2 bg-white/80 backdrop-blur rounded-lg shadow-sm">
                    <button
                      onClick={() => handlePlayVoice(msg.content, msg.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors ${
                        isSpeaking && currentAudioUrl === msg.audioUrl
                          ? "bg-[#07C160] text-white"
                          : "bg-[#F5F5F5] text-[#666666] hover:bg-[#07C160] hover:text-white"
                      }`}
                    >
                      {isSpeaking ? (
                        <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        </svg>
                      )}
                      <span className="text-xs">{isSpeaking ? "播放中" : "点击听语音"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* 当前AI消息 */}
          {currentAIMessage && (
            <div className="space-y-1">
              <div className="flex justify-start">
                <div className="w-9 h-9 flex-shrink-0 mr-2">{AI_AVATAR(gender)}</div>
                <div className="max-w-[75%] px-3 py-2 rounded-lg rounded-tl-none bg-white text-sm leading-relaxed shadow-sm">
                  <span className="text-[#1A1A1A]">
                    <TypewriterText
                      text={currentAIMessage}
                      speed={25}
                      onComplete={handleTypingComplete}
                    />
                  </span>
                </div>
              </div>
              {/* 语音播放按钮（当前AI消息下方） */}
              {!isTyping && (
                <div className="flex justify-start ml-11">
                  <div className="flex items-center gap-2 px-3 py-2 bg-white/80 backdrop-blur rounded-lg shadow-sm">
                    <button
                      onClick={() => handlePlayVoice(currentAIMessage)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors ${
                        isSpeaking
                          ? "bg-[#07C160] text-white"
                          : "bg-[#F5F5F5] text-[#666666] hover:bg-[#07C160] hover:text-white"
                      }`}
                    >
                      {isSpeaking ? (
                        <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        </svg>
                      )}
                      <span className="text-xs">{isSpeaking ? "播放中" : "点击听语音"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 加载中 */}
          {isTyping && !currentAIMessage && (
            <div className="flex justify-start">
              <div className="w-9 h-9 flex-shrink-0 mr-2">{AI_AVATAR(gender)}</div>
              <div className="px-4 py-3 rounded-lg rounded-tl-none bg-white shadow-sm">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-[#999] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-[#999] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-[#999] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          {/* 重试按钮 */}
          {isLoading === false && isTyping === false && !currentAIMessage && requestError && (
            <div className="flex flex-col items-center gap-4 py-8">
              <p className="text-[#999999]">{requestError}</p>
              <button
                onClick={() => {
                  setRound((prev) => Math.max(1, prev - 1)); // 回退轮次
                  startGame();
                }}
                className="px-6 py-2 bg-[#07C160] text-white rounded-full hover:bg-[#06AD56] transition-colors"
              >
                重试
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 微信风格选项区域 */}
      <div className="bg-[#F7F7F7] border-t border-[#E0E0E0] p-3">
        <div className="max-w-lg mx-auto">
          {options.length > 0 && !isTyping ? (
            <>
              <div className="text-xs text-[#999999] mb-2 text-center">选择你的回复</div>
              <div className="space-y-2">
                {options.map((option) => (
                  <OptionButton
                    key={option.id}
                    option={option}
                    onClick={() => handleOptionSelect(option)}
                    disabled={isLoading}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center text-[#CCCCCC] text-sm py-4">
              等待回复...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
