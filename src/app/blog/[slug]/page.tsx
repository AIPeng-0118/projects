"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface BlogPost {
  id: number;
  title: string;
  summary: string;
  content: string;
  created_at: string;
}

export default function BlogPostPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const postId = params.slug;

  useEffect(() => {
    if (!postId) return;

    setLoading(true);
    fetch(`/api/blog/${postId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPost(data.data);
        } else {
          setError(data.error);
        }
      })
      .catch(() => setError("加载失败"))
      .finally(() => setLoading(false));
  }, [postId]);

  // 解析markdown内容为HTML
  const renderContent = (content: string) => {
    return content
      .split("\n")
      .map((line, index) => {
        // 标题
        if (line.startsWith("# ")) {
          return (
            <h1 key={index} className="text-2xl font-bold text-[#1A1A1A] mb-4 mt-6 first:mt-0">
              {line.replace("# ", "")}
            </h1>
          );
        }
        if (line.startsWith("## ")) {
          return (
            <h2 key={index} className="text-xl font-bold text-[#1A1A1A] mb-3 mt-5">
              {line.replace("## ", "")}
            </h2>
          );
        }
        if (line.startsWith("**") && line.endsWith("**")) {
          return (
            <p key={index} className="font-bold text-[#1A1A1A] my-3">
              {line.replace(/\*\*/g, "")}
            </p>
          );
        }
        // 列表项
        if (line.startsWith("- ")) {
          return (
            <li key={index} className="text-[#333333] leading-relaxed ml-4 my-1">
              {line.replace("- ", "")}
            </li>
          );
        }
        // 分割线
        if (line.startsWith("---")) {
          return <hr key={index} className="my-6 border-[#E0E0E0]" />;
        }
        // 引用
        if (line.startsWith("*") && line.endsWith("*") && !line.startsWith("**")) {
          return (
            <p key={index} className="text-[#666666] italic my-4 text-sm">
              {line.replace(/\*/g, "")}
            </p>
          );
        }
        // 空行
        if (line.trim() === "") {
          return <div key={index} className="h-2" />;
        }
        // 普通段落
        return (
          <p key={index} className="text-[#333333] leading-relaxed my-2">
            {line}
          </p>
        );
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EDEDED] flex flex-col">
        <div className="bg-[#1E1E1E] text-white px-4 py-3 flex items-center gap-4">
          <button onClick={() => router.push("/blog")} className="text-lg">
            ←
          </button>
          <span className="font-medium flex-1 text-center">加载中...</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[#666666]">正在加载文章...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-[#EDEDED] flex flex-col">
        <div className="bg-[#1E1E1E] text-white px-4 py-3 flex items-center gap-4">
          <button onClick={() => router.push("/blog")} className="text-lg">
            ←
          </button>
          <span className="font-medium flex-1 text-center">文章不存在</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-[#666666] mb-4">{error || "这篇文章跑丢了~"}</p>
            <button
              onClick={() => router.push("/blog")}
              className="px-6 py-2 bg-[#07C160] text-white rounded-full text-sm"
            >
              返回列表
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EDEDED] flex flex-col">
      {/* 微信风格顶部 */}
      <div className="bg-[#1E1E1E] text-white px-4 py-3 flex items-center gap-4 sticky top-0 z-50">
        <button onClick={() => router.push("/blog")} className="text-lg">
          ←
        </button>
        <span className="font-medium flex-1 text-center">攻略详情</span>
      </div>

      {/* 文章内容 */}
      <div className="flex-1 p-4">
        <div className="max-w-md mx-auto bg-white rounded-xl p-5 shadow-sm">
          {renderContent(post.content)}
        </div>
      </div>

      {/* 底部按钮 */}
      <div className="bg-[#F7F7F7] border-t border-[#E0E0E0] px-4 py-4">
        <button
          onClick={() => router.push("/game")}
          className="w-full py-3 bg-[#07C160] text-white rounded-full text-center font-medium hover:bg-[#06a050] transition-colors"
        >
          去玩哄哄模拟器
        </button>
      </div>
    </div>
  );
}
