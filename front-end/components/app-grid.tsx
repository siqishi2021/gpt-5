"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import type { CodeExample } from "@/lib/code-examples";
import { AppCard } from "./app-card";

const AppModal = dynamic(
  () =>
    import("./app-modal").then(
      (mod) => mod.AppModal
    ),
  {
    ssr: false,
    loading: () => null,
  }
);

interface AppGridProps {
  apps: CodeExample[];
  currentPage: number;
  totalPages: number;
}

export function AppGrid({
  apps,
  currentPage,
  totalPages,
}: AppGridProps) {
  const [isModalOpen, setIsModalOpen] =
    React.useState(false);

  const [selectedApp, setSelectedApp] =
    React.useState<CodeExample | null>(null);

  const handleOpenApp = React.useCallback(
    (app: CodeExample) => {
      setSelectedApp(app);
      setIsModalOpen(true);
    },
    []
  );

  const handleModalChange = React.useCallback(
    (open: boolean) => {
      setIsModalOpen(open);

      if (!open) {
        setSelectedApp(null);
      }
    },
    []
  );

  const goToPage = React.useCallback(
    (nextPage: number) => {
      const safePage = Math.min(
        Math.max(1, nextPage),
        totalPages
      );

      const target =
        safePage === 1
          ? "/"
          : `/pages/${safePage}`;

      window.location.href = target;
    },
    [totalPages]
  );

  return (
    <>
      <div
        className="
          mx-auto grid w-full max-w-[1600px]
          grid-cols-2 gap-4 px-4
          sm:grid-cols-3
          md:grid-cols-4
          lg:grid-cols-5
          xl:grid-cols-6
        "
      >
        {apps.map((app) => (
          <AppCard
            key={app.id}
            app={app}
            onOpen={handleOpenApp}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <nav
          className="
            mx-auto mt-8 flex
            max-w-[1600px]
            items-center justify-center
            gap-2 px-4
          "
          aria-label="Course pagination"
        >
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() =>
              goToPage(currentPage - 1)
            }
            className="
              rounded-lg border
              px-4 py-2 text-sm
              transition-colors
              hover:bg-gray-100
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            Previous
          </button>

          <span
            className="
              whitespace-nowrap
              px-3 text-sm
              text-muted-foreground
            "
          >
            Page {currentPage} / {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() =>
              goToPage(currentPage + 1)
            }
            className="
              rounded-lg border
              px-4 py-2 text-sm
              transition-colors
              hover:bg-gray-100
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            Next
          </button>
        </nav>
      )}

      {selectedApp && (
        <AppModal
          active={selectedApp}
          open={isModalOpen}
          onOpenChange={handleModalChange}
          onCopy={() => {}}
        />
      )}
    </>
  );
}