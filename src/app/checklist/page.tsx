import ChecklistView from "@/components/ChecklistView";
import { Button } from "@/components/ui/Button";
import { getCatalog } from "@/lib/catalog/getCatalog";
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

  if (!answers) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center bg-background px-6 text-center">
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Let&apos;s build your checklist
        </h1>
        <p className="mt-2 font-body text-muted-foreground">
          We couldn&apos;t find your answers. Head back home and fill out the
          quick onboarding form to generate your personalized list.
        </p>
        <Button href="/" showArrow className="mt-8">
          Go to onboarding
        </Button>
      </main>
    );
  }

  const { products, source } = await getCatalog();
  const categories = generateChecklist(answers, products);

  return (
    <main className="min-h-screen bg-background">
      <ChecklistView
        answers={answers}
        categories={categories}
        catalogSource={source}
      />
    </main>
  );
}
