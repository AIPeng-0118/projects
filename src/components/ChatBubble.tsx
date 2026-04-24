"use client";

import { ChatMessage } from "@/lib/types";

interface ChatBubbleProps {
  message: ChatMessage;
  showVoice?: boolean;
  onVoicePlay?: (text: string) => void;
  isPlaying?: boolean;
}

export function ChatBubble({ message, showVoice, onVoicePlay, isPlaying }: ChatBubbleProps) {
  const isAI = message.role === "ai";

  return (
    <div className={`flex ${isAI ? "justify-start" : "justify-end"} mb-4`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isAI
            ? "bg-white text-gray-800 rounded-tl-sm"
            : "bg-pink-500 text-white rounded-tr-sm"
        } shadow-sm`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        <div className={`flex items-center justify-between mt-2 ${isAI ? "" : "flex-row-reverse"}`}>
          <span className="text-xs opacity-60">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
          {isAI && showVoice && (
            <button
              onClick={() => onVoicePlay?.(message.content)}
              className={`ml-2 p-1.5 rounded-full transition-colors ${
                isPlaying ? "bg-pink-100 text-pink-500" : "bg-gray-100 text-gray-500 hover:bg-pink-50"
              }`}
              title="播放语音"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isPlaying ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                  />
                )}
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
