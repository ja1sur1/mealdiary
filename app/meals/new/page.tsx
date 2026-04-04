import { PageHeader } from "@/components/page-header";
import { MealForm } from "@/components/forms/meal-form";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function NewMealPage() {
  const tagPresets = await db.presetFoodTag.findMany({
    where: { isActive: true },
    orderBy: { tag: "asc" }
  });

  const now = new Date();
  const initialDate = now.toISOString().slice(0, 10);
  const initialTime = now.toISOString().slice(11, 16);

  return (
    <main className="grid" style={{ gap: 20 }}>
      <PageHeader
        eyebrow="Meal Logging"
        title="Capture the meal while it is still easy to remember."
        copy="Add or remove food rows, tap tags quickly, and keep the logging flow light."
      />

      <MealForm
        initialDate={initialDate}
        initialTime={initialTime}
        recommendedTags={tagPresets.map((tag) => tag.tag)}
      />
    </main>
  );
}
