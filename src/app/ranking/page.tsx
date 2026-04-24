"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface RankingItem {
  id: number;
  user_id: number;
  scenario: string;
  final_score: number;
  result: string;
  played_at: string;
  users: {
    username: string;
  };
}

export default function RankingPage() {
  const router = useRouter();
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 获取排行榜数据
    const fetchRanking = async () => {
      try {
        const response = await fetch("/api/game/ranking");
        const data = await response.json();
        
        if (data.success) {
          setRanking(data.data);
        } else {
          setError(data.error || "获取排行榜失败");
        }
      } catch (err) {
        setError("网络错误，请稍后重试");
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, []);

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
      <div className="flex-1 p-4">
        <div className="max-w-md mx-auto">
          {/* 标题 */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-3 bg-[#FFF3E0] rounded-full flex items-center justify-center text-3xl">
              🏆
            </div>
            <h2 className="text-xl font-bold text-[#1A1A1A]">排行榜</h2>
            <p className="text-[#666666] text-sm mt-1">最高好感度排行</p>
          </div>

          {/* 加载状态 */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-[#07C160] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-[#666666]">加载中...</p>
            </div>
          )}

          {/* 错误状态 */}
          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 bg-[#FFEBEE] rounded-full flex items-center justify-center text-2xl mb-4">
                ⚠️
              </div>
              <p className="text-[#666666] mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-[#07C160] hover:bg-[#06a050] text-white rounded-full font-medium text-sm transition-all"
              >
                重试
              </button>
            </div>
          )}

          {/* 排行榜列表 */}
          {!loading && !error && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {ranking.length > 0 ? (
                <div className="divide-y divide-[#F0F0F0]">
                  {ranking.map((item, index) => (
                    <div key={item.id} className="flex items-center px-4 py-3">
                      {/* 排名 */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${index < 3 ? 'text-white' : 'text-[#666666]'}`} style={{ backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#F5F5F5' }}>
                        {index + 1}
                      </div>
                      
                      {/* 用户名 */}
                      <div className="flex-1 ml-3">
                        <p className="font-medium text-[#1A1A1A]">{item.users.username}</p>
                        <p className="text-xs text-[#999999]">{item.scenario}</p>
                      </div>
                      
                      {/* 分数 */}
                      <div className="text-right">
                        <p className="font-bold text-[#FF6B6B]">{item.final_score}</p>
                        <p className="text-xs text-[#999999]">{item.result === 'win' ? '成功通关' : '挑战失败'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 bg-[#F5F5F5] rounded-full flex items-center justify-center text-3xl mb-4">
                    📋
                  </div>
                  <p className="text-[#666666]">暂无排行数据</p>
                </div>
              )}
            </div>
          )}

          {/* 返回首页按钮 */}
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push("/")}
              className="px-8 py-2.5 bg-[#07C160] hover:bg-[#06a050] text-white rounded-full font-medium text-sm transition-all"
            >
              返回首页
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
