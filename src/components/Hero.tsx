// The hero section at the top of the home page.
//
// It is a plain (server) component because it has no interactivity beyond a
// link that scrolls down to the onboarding form (#onboarding).

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Soft gradient background for a modern look. */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-50 via-white to-sky-100" />

      <div className="mx-auto max-w-5xl px-6 py-24 text-center sm:py-32">
        <span className="inline-block rounded-full border border-indigo-200 bg-white/70 px-4 py-1 text-sm font-medium text-indigo-700 shadow-sm">
          Your dorm move-in, sorted.
        </span>

        <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
          Dorm Living <span className="text-indigo-600">OS</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
          Answer a few quick questions about your school, climate, budget, and
          hobbies. We&apos;ll build a personalized shopping checklist with
          recommended items, estimated costs, and links so you arrive on campus
          ready for anything.
        </p>

        <div className="mt-10 flex items-center justify-center gap-4">
          <a
            href="#onboarding"
            className="rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-md transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Get started
          </a>
          <a
            href="#how-it-works"
            className="rounded-lg px-6 py-3 text-base font-semibold text-slate-700 transition hover:text-indigo-600"
          >
            How it works
          </a>
        </div>
      </div>
    </section>
  );
}
