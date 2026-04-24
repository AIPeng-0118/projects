"use client";

import { useEffect, useState } from "react";
import { EmotionState, EMOTION_CONFIG } from "@/lib/types";

interface AffectionBarProps {
  value: number;
  emotionState: EmotionState;
  maxValue?: number;
  minValue?: number;
  round: number;
  maxRounds?: number;
  lastChange?: number;
}

export function AffectionBar({
  value,
  emotionState,
  maxValue = 100,
  minValue = -50,
  round,
  maxRounds = 10,
  lastChange,
}: AffectionBarProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [animationClass, setAnimationClass] = useState("");

  // 计算进度条百分比
  const range = maxValue - minValue;
  const percentage = ((displayValue - minValue) / range) * 100;

  // 动画效果
  useEffect(() => {
    if (lastChange !== undefined && lastChange !== 0) {
      setAnimationClass(lastChange > 0 ? "animate-bounce-up" : "animate-shake");

      const timeout = setTimeout(() => {
        setDisplayValue(value);
        setAnimationClass("");
      }, 300);

      return () => clearTimeout(timeout);
    } else {
      setDisplayValue(value);
    }
  }, [value, lastChange]);

  const emotion = EMOTION_CONFIG[emotionState] || EMOTION_CONFIG.angry;

  return (
    <div className="w-full space-y-2">
      {/* 顶部信息 */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="font-medium">好感度</span>
          <span className={`font-bold ${emotion.color}`}>{displayValue}</span>
        </div>
        <div className="text-gray-500">
          第{round}轮/共{maxRounds}轮
        </div>
      </div>

      {/* 进度条 */}
      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`absolute top-0 left-0 h-full transition-all duration-500 ease-out rounded-full ${
            displayValue < 0
              ? "bg-gradient-to-r from-red-500 to-red-400"
              : displayValue < 30
              ? "bg-gradient-to-r from-orange-500 to-yellow-400"
              : displayValue < 60
              ? "bg-gradient-to-r from-yellow-400 to-lime-400"
              : displayValue < 80
              ? "bg-gradient-to-r from-lime-400 to-green-400"
              : "bg-gradient-to-r from-green-400 to-emerald-500"
          } ${animationClass}`}
          style={{ width: `${Math.max(0, Math.min(100, percentage))}%` }}
        />
        {/* 目标线 */}
        <div
          className="absolute top-0 w-0.5 h-full bg-white/50"
          style={{ left: `${((80 - minValue) / range) * 100}%` }}
          title="目标: 80"
        />
      </div>

      {/* 情绪标签 */}
      <div className="flex items-center justify-between">
        <span className={`text-xs ${emotion.color} font-medium`}>{emotion.label}</span>
        <span className="text-xs text-gray-400">
          {displayValue < 0 ? "危险" : displayValue < 30 ? "冷淡" : displayValue < 60 ? "缓和" : displayValue < 80 ? "好转" : "成功"}
        </span>
      </div>

      {/* 变化提示 */}
      {lastChange !== undefined && lastChange !== 0 && (
        <div
          className={`absolute -top-6 left-1/2 transform -translate-x-1/2 font-bold text-lg ${
            lastChange > 0 ? "text-green-500" : "text-red-500"
          } animate-float-up`}
        >
          {lastChange > 0 ? "+" : ""}{lastChange}
        </div>
      )}
    </div>
  );
}
