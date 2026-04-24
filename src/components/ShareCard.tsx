"use client";

import { useRef } from "react";
import { Scene } from "@/lib/types";

interface ShareCardProps {
  result: "win" | "lose";
  scene: Scene;
  rounds: number;
  funniestOption?: string;
}

export function ShareCard({ result, scene, rounds, funniestOption }: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!cardRef.current) return;

    try {
      const canvas = document.createElement("canvas");
      const scale = 2;
      canvas.width = 400 * scale;
      canvas.height = 500 * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // 背景
      ctx.scale(scale, scale);
      ctx.fillStyle = result === "win" ? "#FEF3C7" : "#FEE2E2";
      ctx.fillRect(0, 0, 400, 500);

      // 顶部装饰
      ctx.fillStyle = result === "win" ? "#F59E0B" : "#EF4444";
      ctx.beginPath();
      ctx.arc(200, 80, 50, 0, Math.PI * 2);
      ctx.fill();

      // 图标
      ctx.fillStyle = "white";
      ctx.font = "bold 48px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(result === "win" ? "❤️" : "💔", 200, 95);

      // 标题
      ctx.fillStyle = result === "win" ? "#92400E" : "#991B1B";
      ctx.font = "bold 28px sans-serif";
      ctx.fillText(result === "win" ? "成功哄好了！" : "哄人失败...", 200, 170);

      // 场景
      ctx.fillStyle = "#374151";
      ctx.font = "16px sans-serif";
      ctx.fillText("场景：" + scene.title, 200, 220);

      // 轮次
      ctx.fillText(`用了 ${rounds} 轮`, 200, 255);

      // 高光时刻
      if (funniestOption && result === "lose") {
        ctx.fillStyle = "#6B7280";
        ctx.font = "14px sans-serif";
        ctx.fillText("踩坑发言", 200, 310);
        
        ctx.fillStyle = "#4B5563";
        ctx.font = "bold 15px sans-serif";
        const lines = wrapText(ctx, `「${funniestOption}」`, 320);
        lines.forEach((line, i) => {
          ctx.fillText(line, 200, 340 + i * 22);
        });
      }

      // 水印
      ctx.fillStyle = "#9CA3AF";
      ctx.font = "12px sans-serif";
      ctx.fillText("哄哄模拟器", 200, 470);

      // 转换为图片
      const dataUrl = canvas.toDataURL("image/png");

      // 下载
      const link = document.createElement("a");
      link.download = `哄哄模拟器_${scene.title}_${result === "win" ? "成功" : "失败"}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("生成图片失败:", error);
    }
  };

  return (
    <div className="space-y-4">
      {/* 预览卡片 */}
      <div
        ref={cardRef}
        className={`w-64 h-80 mx-auto rounded-2xl p-6 flex flex-col items-center ${
          result === "win" ? "bg-amber-100" : "bg-red-100"
        }`}
      >
        {/* 头像区域 */}
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl ${
            result === "win" ? "bg-amber-400" : "bg-red-400"
          }`}
        >
          {result === "win" ? "❤️" : "💔"}
        </div>

        {/* 结果 */}
        <h3
          className={`mt-4 text-2xl font-bold ${
            result === "win" ? "text-amber-800" : "text-red-800"
          }`}
        >
          {result === "win" ? "成功哄好了！" : "哄人失败..."}
        </h3>

        {/* 场景 */}
        <p className="mt-2 text-gray-600">场景：{scene.title}</p>
        <p className="text-gray-500">用了 {rounds} 轮</p>

        {/* 高光时刻 */}
        {funniestOption && result === "lose" && (
          <div className="mt-4 p-3 bg-white/50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">踩坑发言</p>
            <p className="text-sm text-gray-700 italic">「{funniestOption}」</p>
          </div>
        )}

        {/* 水印 */}
        <p className="mt-auto text-xs text-gray-400">哄哄模拟器</p>
      </div>

      {/* 下载按钮 */}
      <button
        onClick={handleDownload}
        className="w-full py-3 px-6 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-medium transition-colors"
      >
        保存分享图片
      </button>
    </div>
  );
}

// 文字换行辅助函数
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split("");
  const lines: string[] = [];
  let currentLine = "";

  for (const char of words) {
    const testLine = currentLine + char;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = char;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}
