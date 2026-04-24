"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  username: string;
}

interface GameRecord {
  id: number;
  scenario: string;
  final_score: number;
  result: string;
  played_at: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [records, setRecords] = useState<GameRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalGames: 0,
    wins: 0,
    winRate: 0,
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    // 获取用户游戏记录
    fetch(`/api/game/records/${parsedUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setRecords(data.data);
          const wins = data.data.filter((r: GameRecord) => r.result === "win").length;
          setStats({
            totalGames: data.data.length,
            wins,
            winRate: data.data.length > 0 ? Math.round((wins / data.data.length) * 100) : 0,
          });
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#EDEDED] flex items-center justify-center">
        <div className="text-[#999999]">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EDEDED]">
      {/* 微信风格导航栏 */}
      <div className="bg-[#1E1E1E] text-white px-4 py-3 flex items-center gap-4 sticky top-0 z-50">
        <button onClick={() => router.push("/")} className="text-lg">
          ←
        </button>
        <span className="font-medium flex-1 text-center">个人中心</span>
      </div>

      {/* 用户信息卡片 */}
      <div className="bg-white mx-4 mt-4 rounded-2xl p-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#07C160] flex items-center justify-center text-white text-2xl">
            {user?.username.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="text-lg font-medium text-[#1A1A1A]">{user?.username}</div>
            <div className="text-sm text-[#999999]">哄哄模拟器玩家</div>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-3 mt-4 pt-4 border-t border-[#F0F0F0]">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#1A1A1A]">{stats.totalGames}</div>
            <div className="text-xs text-[#999999]">总场次</div>
          </div>
          <div className="text-center border-x border-[#F0F0F0]">
            <div className="text-2xl font-bold text-[#07C160]">{stats.wins}</div>
            <div className="text-xs text-[#999999]">获胜</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#FF9500]">{stats.winRate}%</div>
            <div className="text-xs text-[#999999]">胜率</div>
          </div>
        </div>
      </div>

      {/* 历史战绩 */}
      <div className="mt-4">
        <div className="px-4 py-2 bg-white border-b border-[#E0E0E0]">
          <span className="font-medium text-[#1A1A1A]">历史战绩</span>
        </div>

        {records.length === 0 ? (
          <div className="bg-white mx-4 mt-4 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-4">📭</div>
            <div className="text-[#666666]">还没有游戏记录</div>
            <div className="text-[#999999] text-sm mt-1">快去开始一局游戏吧~</div>
            <button
              onClick={() => router.push("/")}
              className="mt-4 px-6 py-2 bg-[#07C160] text-white rounded-full text-sm"
            >
              开始游戏
            </button>
          </div>
        ) : (
          <div className="bg-white mx-4 mt-2 rounded-2xl overflow-hidden">
            {records.map((record, index) => (
              <div
                key={record.id}
                className={`p-4 ${index < records.length - 1 ? "border-b border-[#F0F0F0]" : ""}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        record.result === "win"
                          ? "bg-[#E8F5E9] text-[#07C160]"
                          : "bg-[#FFEBEE] text-[#FF5252]"
                      }`}
                    >
                      {record.result === "win" ? "胜" : "负"}
                    </span>
                    <span className="font-medium text-[#1A1A1A]">{record.scenario}</span>
                  </div>
                  <span className="text-sm text-[#999999]">{formatDate(record.played_at)}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-[#666666]">
                  <span>好感度 {record.final_score}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 退出登录按钮 */}
      <div className="mx-4 mt-6">
        <button
          onClick={handleLogout}
          className="w-full py-3 border border-[#E0E0E0] rounded-full text-[#666666]"
        >
          退出登录
        </button>
      </div>

      {/* 底部安全区 */}
      <div className="h-8" />
    </div>
  );
}
