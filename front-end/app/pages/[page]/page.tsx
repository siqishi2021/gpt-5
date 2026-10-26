import { notFound } from "next/navigation";
import { AppGrid } from "@/components/app-grid";
import { loadApps } from "@/lib/code-examples";
import {
  paginate,
  PAGE_SIZE,
  totalPagesOf,
} from "@/lib/pagination";

export const dynamic = "force-static";

export async function generateStaticParams() {
  const apps = await loadApps();

  const totalPages = totalPagesOf(
    apps.length,
    PAGE_SIZE
  );

  return Array.from(
    { length: Math.max(0, totalPages - 1) },
    (_, index) => ({
      page: String(index + 2),
    })
  );
}

export default async function Page({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;

  const pageNumber = Number(page);

  if (
    !Number.isInteger(pageNumber) ||
    pageNumber < 2
  ) {
    notFound();
  }

  const apps = await loadApps();

  const {
    pageApps,
    currentPage,
    totalPages,
  } = paginate(
    apps,
    pageNumber,
    PAGE_SIZE
  );

  if (pageNumber > totalPages) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-100 font-sans">
      <main className="mx-auto w-full py-6">
        {/* Top nav row: title on the left, AI Class button on the right */}
        <header className="mx-auto mb-4 flex max-w-3xl items-center justify-between gap-4 px-4">
          <h1 className="font-mono text-2xl font-bold sm:text-3xl">
            <a
              href="https://0z0z.com"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-blue-600 hover:underline"
            >
              Chatgpt Generative Classroom
            </a>
          </h1>

          <a
            href="https://www.hh7h.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-100"
          >
            AI Class
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5"
              aria-hidden
            >
              <path d="M7 17 17 7" />
              <path d="M7 7h10v10" />
            </svg>
          </a>
        </header>

        <AppGrid
          apps={pageApps}
          currentPage={currentPage}
          totalPages={totalPages}
        />
      </main>
    </div>
  );
}