// The results page at /checklist.
//
// This is a server component. It reads the answers from the URL query string,
// validates them, generates the checklist from mock data, and hands the
// result to the interactive <ChecklistView> client component.
//
// In Next.js 15 the `searchParams` prop is a Promise, so the component is
// async and we `await` it.

import Link from "next/link";
import ChecklistView from "@/components/ChecklistView";
import { parseAnswers } from "@/lib/params";
import { generateChecklist } from "@/lib/recommendations";

interface ChecklistPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ChecklistPage({
  searchParams,
}: ChecklistPageProps) {
  const raw = await searchParams;
  const answers = parseAnswers(raw);

  // If the URL is missing valid answers (e.g. someone visited /checklist
  // directly), show a friendly prompt to fill out the form.
  if (!answers) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900">
          Let&apos;s build your checklist
        </h1>
        <p className="mt-2 text-slate-600">
          We couldn&apos;t find your answers. Head back home and fill out the
          quick onboarding form to generate your personalized list.
        </p>
        <Link
          href="/"
          className="mt-6 rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-indigo-700"
        >
          Go to onboarding
        </Link>
      </main>
    );
  }

  // Generate the categories on the server from the mock data.
  const categories = generateChecklist(answers);

  return (
    <main>
      <ChecklistView answers={answers} categories={categories} />
    </main>
  );
}
