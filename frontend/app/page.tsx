export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">SourceLens</h1>
      <p className="mt-3 text-base text-zinc-600">
        AI-powered repository intelligence platform.
      </p>

      <div className="mt-8 flex flex-col gap-3 text-sm sm:flex-row sm:items-center">
        <a className="underline underline-offset-4" href="/docs">
          API docs
        </a>
        <a className="underline underline-offset-4" href="http://localhost:8000/api/health/">
          Backend health
        </a>
      </div>
    </main>
  );
}
