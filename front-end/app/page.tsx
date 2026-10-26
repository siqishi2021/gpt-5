import { AppGrid } from "@/components/app-grid";
import { loadApps } from "@/lib/code-examples";
import { paginate, PAGE_SIZE } from "@/lib/pagination";

export const dynamic = "force-static";

export default async function Home() {
  const apps = await loadApps();

  const {
    pageApps,
    currentPage,
    totalPages,
  } = paginate(apps, 1, PAGE_SIZE);

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
            Chatgpt Generative Learning Classroom
          </a>
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