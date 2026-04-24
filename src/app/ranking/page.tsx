"use client";

import { useRouter } from "next/navigation";

export default function RankingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#EDEDED] flex flex-col">
      {/* 微信风格顶部 */}
      <div className="bg-[#1E1E1E] text-white px-4 py-3 flex items-center gap-4 sticky top-0 z-50">
        <button onClick={() => router.push("/")} className="text-lg">
          ←
        </button>
        <span className="font-medium flex-1 text-center">排行榜</span>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-[#FFF3E0] rounded-full flex items-center justify-center text-4xl">
            🏆
          </div>
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">排行榜</h2>
          <p className="text-[#666666] text-sm mb-6">
            功能正在开发中，敬请期待！
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-8 py-2.5 bg-[#07C160] hover:bg-[#06a050] text-white rounded-full font-medium text-sm transition-all"
          >
            返回首页
          </button>
        </div>
      </div>
    </div>
  );
}
