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
  const handleClick = React.useCallback(() => {
    onOpen(app);
  }, [app, onOpen]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className="
        group relative flex w-full min-w-0 flex-col
        overflow-hidden rounded-xl
        border border-border/60
        bg-card text-left shadow-sm
        transition-all duration-200
        hover:-translate-y-1 hover:shadow-lg
        focus:outline-none
        focus-visible:ring-2
        focus-visible:ring-ring
        focus-visible:ring-offset-2
      "
      aria-label={`打开课程：${app.title}`}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
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
      </div>

      <div className="min-h-[68px] p-3">
        <p
          className="
            line-clamp-2
            text-sm font-medium
            leading-5 text-foreground
          "
        >
          {app.title}
        </p>
      </div>
    </button>
  );
});

AppCard.displayName = "AppCard";