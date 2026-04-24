"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    setMessage(null);

    try {
      const res = await fetch("/api/blog/generate", {
        method: "POST",
      });
      const data = await res.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: `文章《${data.data.title}》生成成功！`,
        });
        // 3秒后跳转到博客列表
        setTimeout(() => {
          router.push("/blog");
          router.refresh();
        }, 1500);
      } else {
        setMessage({ type: "error", text: data.error || "生成失败" });
      }
    } catch {
      setMessage({ type: "error", text: "网络错误，请重试" });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EDEDED] flex flex-col">
      {/* 微信风格顶部 */}
      <div className="bg-[#1E1E1E] text-white px-4 py-3 flex items-center gap-4 sticky top-0 z-50">
        <button onClick={() => router.push("/blog")} className="text-lg">
          ←
        </button>
        <span className="font-medium flex-1 text-center">文章管理</span>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 p-4">
        <div className="max-w-md mx-auto space-y-6">
          {/* 管理员卡片 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-[#1A1A1A] mb-4">AI 生成文章</h2>
            <p className="text-[#666666] text-sm mb-6">
              点击下方按钮，让 AI 为你生成一篇恋爱沟通技巧文章。
              文章将自动保存到数据库中。
            </p>

            {/* 功能说明 */}
            <div className="bg-[#F7F7F7] rounded-lg p-4 mb-6">
              <h3 className="font-medium text-[#1A1A1A] mb-2">AI 会生成什么？</h3>
              <ul className="text-sm text-[#666666] space-y-1">
                <li>吸引人的文章标题</li>
                <li>简洁的摘要</li>
                <li>实用且幽默的正文内容</li>
                <li>包含具体例子和可操作建议</li>
              </ul>
            </div>

            {/* 消息提示 */}
            {message && (
              <div
                className={`p-3 rounded-lg mb-4 text-sm ${
                  message.type === "success"
                    ? "bg-[#E8F5E9] text-[#2E7D32]"
                    : "bg-[#FFEBEE] text-[#C62828]"
                }`}
              >
                {message.text}
              </div>
            )}

            {/* 生成按钮 */}
            <button
              onClick={handleGenerate}
              disabled={generating}
              className={`w-full py-3 rounded-full font-medium transition-all ${
                generating
                  ? "bg-[#CCCCCC] text-white cursor-not-allowed"
                  : "bg-[#07C160] text-white hover:bg-[#06a050] active:scale-[0.98]"
              }`}
            >
              {generating ? "生成中..." : "生成新文章"}
            </button>
          </div>

          {/* 提示卡片 */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs text-[#999999] text-center">
              当前共 3 篇文章 | AI 生成功能可无限扩展文章库
            </p>
          </div>
        </div>
      </div>

      {/* 底部按钮 */}
      <div className="bg-[#F7F7F7] border-t border-[#E0E0E0] px-4 py-4">
        <button
          onClick={() => router.push("/blog")}
          className="w-full py-3 bg-white border border-[#E0E0E0] text-[#1A1A1A] rounded-full text-center font-medium hover:bg-[#F7F7F7] transition-colors"
        >
          返回博客列表
        </button>
      </div>
    </div>
  );
}
