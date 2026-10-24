
export const dynamic = "force-static";
import { AppGrid } from "@/components/app-grid";
import { loadApps } from "@/lib/code-examples";

export default async function Home() {
  const apps = await loadApps();

  return (
    <div className="font-sans min-h-screen bg-gradient-to-b from-gray-50 to-blue-100">
      <main className="mx-auto w-full py-6">
        <h1 className="text-3xl font-bold font-mono text-center mb-4">
          <a 
            href="https://0z0z.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-blue-600 hover:underline transition-colors"
          >
            GPT-5 编程应用集合
          </a>
        </h1>
        <AppGrid apps={apps} />
      </main>
    </div>
  );
}