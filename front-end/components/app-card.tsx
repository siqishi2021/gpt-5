"use client";

import * as React from "react";
import type { CodeExample } from "@/lib/code-examples";

interface AppCardProps {
  app: CodeExample;
  onOpen: (app: CodeExample) => void;
}

export const AppCard = React.memo(function AppCard({
  app,
  onOpen,
}: AppCardProps) {
  const handlePreviewClick = React.useCallback(() => {
    onOpen(app);
  }, [app, onOpen]);

  return (
    <div
      className="
        group relative flex w-full min-w-0 flex-col
        overflow-hidden rounded-xl
        border border-border/60
        bg-card text-left shadow-sm
        transition-all duration-200
        hover:-translate-y-1 hover:shadow-lg
      "
    >
      {/* 图片区域：点击打开弹窗 */}
      <button
        type="button"
        onClick={handlePreviewClick}
        className="
          relative block aspect-[4/3] w-full
          overflow-hidden bg-muted
          focus:outline-none
          focus-visible:ring-2
          focus-visible:ring-ring
          focus-visible:ring-inset
        "
        aria-label={`预览课程：${app.title}`}
      >
        <img
          src={app.poster}
          alt=""
          loading="lazy"
          decoding="async"
          draggable={false}
          className="
            h-full w-full object-cover
            transition-transform duration-300
            group-hover:scale-[1.03]
          "
        />

        <div
          className="
            pointer-events-none absolute inset-0
            bg-black/0 transition-colors
            group-hover:bg-black/10
          "
        />
      </button>

      {/* 标题区域：点击直接打开网页 */}
      <div className="min-h-[68px] p-3">
        <a
          href={app.iframeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="
            line-clamp-2 block
            text-sm font-medium
            leading-5 text-foreground
            transition-colors
            hover:text-primary
            focus:outline-none
            focus-visible:underline
            focus-visible:ring-2
            focus-visible:ring-ring
            focus-visible:ring-offset-2
          "
          title={app.title}
        >
          {app.title}
        </a>
      </div>
    </div>
  );
});

AppCard.displayName = "AppCard";