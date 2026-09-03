import React from "react";

export function LoadingSpinner({ text = "Loading data..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-[#4A90A4] space-y-3">
      <div className="w-8 h-8 border-3 border-[#4A90A4] border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs font-semibold text-[#6B7280]">{text}</p>
    </div>
  );
}
