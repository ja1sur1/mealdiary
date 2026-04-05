import { notFound } from "next/navigation";
import { MealForm } from "@/components/forms/meal-form";
import { PageHeader } from "@/components/page-header";
import { updateMealAction } from "@/app/server-actions";
import { db } from "@/lib/db";
import { requireCurrentUser } from "@/lib/current-user";
import { presetFoodTags } from "@/lib/presets";

export const dynamic = "force-dynamic";

export default async function EditMealPage({
  params
}: {
  params: Promise<{ mealId: string }>;
}) {
  const { mealId } = await params;
  const user = await requireCurrentUser();

  const [tagPresets, meal] = await Promise.all([
    db.presetFoodTag.findMany({
      where: { isActive: true },
      orderBy: { tag: "asc" }
    }),
    db.meal.findFirst({
      where: {
        id: mealId,
        userId: user.id
      },
      include: {
        foodItems: {
          include: {
            tags: true
          },
          orderBy: {
            sortOrder: "asc"
          }
        }
      }
    })
  ]);

  if (!meal) {
    notFound();
  }

  return (
    <main className="grid" style={{ gap: 20 }}>
      <PageHeader
        eyebrow="Edit Meal"
        title="Update the meal details."
        copy="Adjust foods, tags, timing, or source details and save the corrected entry."
      />

      <MealForm
        action={updateMealAction.bind(null, meal.id)}
        initialDate={meal.mealDate.toISOString().slice(0, 10)}
        initialFoods={meal.foodItems.map((food) => ({
          name: food.name,
          tags: food.tags.map((tag) => tag.tag)
        }))}
        initialMealType={meal.mealType}
        initialNotes={meal.notes ?? ""}
        initialOutsideLocation={meal.outsideLocation ?? ""}
        initialSource={meal.source}
        initialTime={meal.mealTime.toISOString().slice(11, 16)}
        recommendedTags={tagPresets.length > 0 ? tagPresets.map((tag) => tag.tag) : presetFoodTags}
        submitLabel="Save Changes"
      />
    </main>
  );
}
