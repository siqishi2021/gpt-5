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
        <h1 className="mb-4 text-center font-mono text-3xl font-bold">
          <a
            href="https://0z0z.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-blue-600 hover:underline"
          >
          </a>
            Chatgpt Generative Learning Classroom
        </h1>

        <AppGrid
          apps={pageApps}
          currentPage={currentPage}
          totalPages={totalPages}
        />
      </main>
    </div>
  );
}