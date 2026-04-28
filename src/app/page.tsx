"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { SCENES, VOICE_OPTIONS, VoiceType } from "@/lib/types";

interface User {
  id: number;
  username: string;
}

export default function HomePage() {
  const router = useRouter();
  const [step, setStep] = useState<"welcome" | "gender" | "scene" | "voice">("welcome");
  const [gender, setGender] = useState<"girlfriend" | "boyfriend">("girlfriend");
  const [selectedScene, setSelectedScene] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<VoiceType>("gentle_female");
  const [user, setUser] = useState<User | null>(null);
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // 检查登录状态
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleStart = () => {
    setStep("gender");
  };

  const handleGenderSelect = (selected: "girlfriend" | "boyfriend") => {
    setGender(selected);
    setStep("scene");
  };

  const handleSceneSelect = (sceneId: string) => {
    setSelectedScene(sceneId);
    setStep("voice");
  };

  const handleVoiceSelect = (voice: VoiceType) => {
    setSelectedVoice(voice);
    router.push(`/game?scene=${selectedScene}&gender=${gender}&voice=${voice}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  // 悬停预览声音
  const handleVoicePreview = async (voice: typeof VOICE_OPTIONS[0]) => {
    // 如果正在预览其他声音，先停止
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
    }

    // 避免重复预览同一种声音
    if (previewingVoice === voice.id) {
      setPreviewingVoice(null);
      return;
    }

    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: `你好，我是${voice.label}`, speaker: voice.speaker }),
      });

      const data = await response.json();

      if (data.success && data.audioUri) {
        const audio = new Audio(data.audioUri);
        previewAudioRef.current = audio;
        setPreviewingVoice(voice.id);

        audio.onended = () => {
          setPreviewingVoice(null);
          previewAudioRef.current = null;
        };

        audio.onerror = () => {
          setPreviewingVoice(null);
          previewAudioRef.current = null;
        };

        await audio.play();
      }
    } catch (error) {
      console.error("声音预览失败:", error);
      setPreviewingVoice(null);
    }
  };

  // 停止预览
  const stopVoicePreview = () => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
    }
    setPreviewingVoice(null);
  };

  return (
    <div className="min-h-screen bg-[#EDEDED] flex flex-col">
      {/* 微信风格顶部 */}
      <div className="bg-[#1E1E1E] text-white px-4 py-3 flex items-center justify-between">
        <span className="font-medium">哄哄模拟器</span>
        {user ? (
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/profile")}
              className="text-sm opacity-80 hover:opacity-100 flex items-center gap-1"
            >
              <span>👤</span>
              <span>{user.username}</span>
            </button>
            <button
              onClick={handleLogout}
              className="text-xs opacity-60 hover:opacity-100"
            >
              退出
            </button>
          </div>
        ) : (
          <div className="flex gap-2 text-sm">
            <button
              onClick={() => router.push("/login")}
              className="opacity-80 hover:opacity-100"
            >
              登录
            </button>
            <span className="opacity-40">|</span>
            <button
              onClick={() => router.push("/register")}
              className="opacity-80 hover:opacity-100"
            >
              注册
            </button>
          </div>
        )}
      </div>

      {/* 内容区域 */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 bg-[#EDEDED]">
        {/* 欢迎页 */}
        {step === "welcome" && (
          <div className="text-center space-y-6 animate-fade-in">
            <div className="w-24 h-24 mx-auto mb-4 bg-[#FFE4E1] rounded-full flex items-center justify-center text-5xl shadow-lg">
              💕
            </div>
            <h1 className="text-2xl font-bold text-[#1A1A1A]">哄哄模拟器</h1>
            <p className="text-[#666666] text-sm max-w-xs">
              AI扮演正在生气的对象，你需要在10轮内通过选择题把它哄好
            </p>
            <button
              onClick={handleStart}
              className="px-10 py-3 bg-[#07C160] hover:bg-[#06AD56] text-white rounded-full font-bold text-base transition-all shadow-lg active:scale-95"
            >
              开始挑战
            </button>
            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={() => router.push("/blog")}
                className="px-6 py-2.5 bg-white hover:bg-[#F0F0F0] text-[#666666] rounded-full font-medium text-sm transition-all border border-[#E0E0E0]"
              >
                📖 恋爱攻略
              </button>
              <button
                onClick={() => router.push("/ranking")}
                className="px-6 py-2.5 bg-white hover:bg-[#F0F0F0] text-[#666666] rounded-full font-medium text-sm transition-all border border-[#E0E0E0]"
              >
                🏆 排行榜
              </button>
            </div>
            <p className="text-xs text-[#999999] mt-4">共5个经典吵架场景等你来解锁</p>
            {/* 管理员入口 */}
            <button
              onClick={() => router.push("/admin")}
              className="text-xs text-[#CCCCCC] hover:text-[#999999] transition-colors mt-2"
            >
              文章管理
            </button>
          </div>
        )}

        {/* 性别选择 */}
        {step === "gender" && (
          <div className="w-full max-w-sm animate-fade-in">
            <div className="bg-white rounded-t-xl p-4 text-center">
              <h2 className="text-lg font-medium text-[#1A1A1A]">TA是你的...</h2>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleGenderSelect("girlfriend")}
                className={`flex-1 p-6 rounded-xl font-bold text-base transition-all active:scale-95 ${
                  gender === "girlfriend"
                    ? "bg-[#FFE4E1] text-[#E91E63] shadow-lg"
                    : "bg-white text-[#666666]"
                }`}
              >
                <span className="text-3xl block mb-2">👩</span>
                女朋友
              </button>
              <button
                onClick={() => handleGenderSelect("boyfriend")}
                className={`flex-1 p-6 rounded-xl font-bold text-base transition-all active:scale-95 ${
                  gender === "boyfriend"
                    ? "bg-[#E3F2FD] text-[#2196F3] shadow-lg"
                    : "bg-white text-[#666666]"
                }`}
              >
                <span className="text-3xl block mb-2">👨</span>
                男朋友
              </button>
            </div>
            <button
              onClick={() => setStep("welcome")}
              className="w-full mt-4 py-3 bg-white text-[#666666] rounded-b-xl text-sm"
            >
              ← 返回
            </button>
          </div>
        )}

        {/* 场景选择 */}
        {step === "scene" && (
          <div className="w-full max-w-sm animate-fade-in">
            <div className="bg-white rounded-t-xl p-4 text-center">
              <h2 className="text-lg font-medium text-[#1A1A1A]">发生了什么？</h2>
              <p className="text-xs text-[#999999] mt-1">选择一个吵架场景</p>
            </div>
            <div className="bg-white space-y-2 p-3 rounded-b-xl">
              {SCENES.map((scene, index) => (
                <button
                  key={scene.id}
                  onClick={() => handleSceneSelect(scene.id)}
                  className="w-full p-4 bg-[#FAFAFA] rounded-lg hover:bg-[#F0F0F0] transition-all active:scale-[0.99] text-left group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {["💔", "📱", "💬", "🐱", "😅"][index]}
                    </span>
                    <div className="flex-1">
                      <h3 className="font-medium text-[#1A1A1A] group-hover:text-[#07C160]">
                        {scene.title}
                      </h3>
                      <p className="text-xs text-[#999999] mt-0.5">{scene.description}</p>
                    </div>
                    <span className="text-[#CCCCCC]">›</span>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep("gender")}
              className="w-full mt-4 py-3 bg-white text-[#666666] rounded-xl text-sm"
            >
              ← 返回
            </button>
          </div>
        )}

        {/* 声音选择 */}
        {step === "voice" && (
          <div className="w-full max-w-sm animate-fade-in">
            <div className="bg-white rounded-t-xl p-4 text-center">
              <h2 className="text-lg font-medium text-[#1A1A1A]">选择TA的声音</h2>
              <p className="text-xs text-[#999999] mt-1">不同的声音会影响对话氛围</p>
            </div>
            <div className="bg-white space-y-2 p-3 rounded-b-xl">
              {VOICE_OPTIONS.map((voice) => (
                <button
                  key={voice.id}
                  onClick={() => handleVoiceSelect(voice.id)}
                  onMouseEnter={() => handleVoicePreview(voice)}
                  onMouseLeave={stopVoicePreview}
                  className={`w-full p-4 rounded-lg transition-all active:scale-[0.99] text-left ${
                    selectedVoice === voice.id
                      ? "bg-[#E8F5E9] border-2 border-[#07C160]"
                      : "bg-[#FAFAFA] hover:bg-[#F0F0F0]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {voice.id.includes("female")
                        ? voice.id === "cute_female"
                          ? "🎀"
                          : "👩"
                        : "👨"}
                    </span>
                    <span className={`font-medium ${selectedVoice === voice.id ? "text-[#07C160]" : "text-[#1A1A1A]"}`}>
                      {voice.label}
                    </span>
                    {previewingVoice === voice.id && (
                      <span className="ml-auto text-[#07C160] animate-pulse">🔊</span>
                    )}
                    {selectedVoice === voice.id && previewingVoice !== voice.id && (
                      <span className="ml-auto text-[#07C160]">✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep("scene")}
              className="w-full mt-4 py-3 bg-white text-[#666666] rounded-xl text-sm"
            >
              ← 返回
            </button>
          </div>
        )}
      </div>

      {/* 微信风格底部 */}
      <div className="bg-[#F7F7F7] border-t border-[#E0E0E0] px-4 py-3">
        <div className="flex justify-center gap-6 text-xs text-[#999999]">
          <span>场景 {["", "1/5", "2/5", "3/5", "4/5", "5/5"][["welcome", "gender", "scene", "voice"].indexOf(step) + 1]}</span>
        </div>
      </div>
    </div>
  );
}
