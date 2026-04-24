"use client";

import { GameOption } from "@/lib/types";

interface OptionButtonProps {
  option: GameOption;
  onClick: () => void;
  disabled?: boolean;
}

export function OptionButton({ option, onClick, disabled }: OptionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full p-3 rounded-lg text-left transition-all duration-200 text-sm
        border border-[#E0E0E0]
        ${
          disabled
            ? "opacity-50 cursor-not-allowed bg-[#F7F7F7]"
            : "cursor-pointer hover:scale-[1.01] active:scale-[0.99] bg-white"
        }
      `}
    >
      <span className="text-[#1A1A1A] leading-relaxed">
        {option.text}
      </span>
    </button>
  );
}
