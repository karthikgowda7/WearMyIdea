import { SignInButton, SignUpButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* ── Nav ── */}
      <nav className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="text-lg font-bold tracking-tight">
            WearMyIdea
          </span>
          <div className="flex items-center gap-3">
            <SignInButton mode="redirect">
              <button className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:text-black">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="redirect">
              <button className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800">
                Get Started
              </button>
            </SignUpButton>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="mx-auto max-w-3xl px-6 pb-24 pt-20 text-center sm:pt-28">
        <div className="mb-6 inline-block rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-xs font-medium tracking-wide text-gray-500">
          AI-Powered Custom T-Shirts
        </div>

        <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
          Turn Ideas Into
          <br />
          <span className="bg-gradient-to-r from-gray-900 via-gray-600 to-gray-900 bg-clip-text text-transparent">
            Wearable Art
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-gray-500">
          Describe what you want. AI generates the artwork. Preview it on a
          t-shirt. Order it — printed and delivered to your door.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <SignUpButton mode="redirect">
            <button className="w-full rounded-xl bg-black px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/10 transition hover:bg-gray-800 hover:shadow-xl sm:w-auto">
              Start Designing →
            </button>
          </SignUpButton>
          <a
            href="#how-it-works"
            className="w-full rounded-xl border border-gray-200 px-8 py-3.5 text-center text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 sm:w-auto"
          >
            How It Works
          </a>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section
        id="how-it-works"
        className="border-t border-gray-100 bg-gray-50/60 px-6 py-20"
      >
        <div className="mx-auto max-w-4xl">
          <p className="text-center text-sm font-semibold uppercase tracking-widest text-gray-400">
            How It Works
          </p>
          <h2 className="mt-3 text-center text-3xl font-bold tracking-tight text-gray-900">
            From idea to doorstep in 4 steps
          </h2>

          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: "01",
                title: "Describe",
                desc: "Tell us your idea in plain words — a samurai cat, a galaxy wolf, anything.",
              },
              {
                step: "02",
                title: "Generate",
                desc: "Our AI creates a unique, print-ready artwork from your description.",
              },
              {
                step: "03",
                title: "Preview",
                desc: "See your design on a real t-shirt mockup. Drag, resize, perfect it.",
              },
              {
                step: "04",
                title: "Order",
                desc: "Pick your size and color. Pay securely. We print and deliver.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center sm:text-left">
                <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-black text-xs font-bold text-white sm:mx-0">
                  {item.step}
                </div>
                <h3 className="text-base font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 text-xs text-gray-400 sm:flex-row">
          <span className="font-semibold text-gray-600">WearMyIdea</span>
          <span>Built with AI · © {new Date().getFullYear()}</span>
        </div>
      </footer>
    </main>
  );
}