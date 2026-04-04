"use client";

import { useActionState, useMemo, useState } from "react";
import { createMealAction } from "@/app/server-actions";
import { initialFormState, type FormAction } from "@/lib/form-state";

type MealFoodRow = {
  id: string;
  name: string;
  tags: string[];
  customTags: string;
};

const mealTypeOptions = [
  { value: "BREAKFAST", label: "Breakfast" },
  { value: "LUNCH", label: "Lunch" },
  { value: "DINNER", label: "Dinner" },
  { value: "OTHER", label: "Other" }
] as const;

const sourceOptions = [
  { value: "HOME_COOKED", label: "Home Cooked" },
  { value: "OUTSIDE", label: "Outside" }
] as const;

function buildFoodRow(seed?: Partial<MealFoodRow>): MealFoodRow {
  return {
    id: crypto.randomUUID(),
    name: seed?.name ?? "",
    tags: seed?.tags ?? [],
    customTags: seed?.customTags ?? ""
  };
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return <div className="field-error">{errors[0]}</div>;
}

export function MealForm({
  action = createMealAction,
  recommendedTags,
  initialDate,
  initialTime,
  initialSource = "OUTSIDE",
  initialMealType = "LUNCH",
  initialOutsideLocation = "",
  initialFoods = [
    { name: "Spicy chicken bowl", tags: ["spicy", "heavy", "oily"] },
    { name: "Iced tea", tags: ["caffeine"] }
  ],
  initialNotes = "Felt very full after lunch.",
  submitLabel = "Save Meal"
}: {
  action?: FormAction;
  recommendedTags: string[];
  initialDate: string;
  initialTime: string;
  initialSource?: "HOME_COOKED" | "OUTSIDE";
  initialMealType?: "BREAKFAST" | "LUNCH" | "DINNER" | "OTHER";
  initialOutsideLocation?: string;
  initialFoods?: Array<{ name: string; tags: string[] }>;
  initialNotes?: string;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialFormState);
  const [source, setSource] = useState<"HOME_COOKED" | "OUTSIDE">(initialSource);
  const [foods, setFoods] = useState<MealFoodRow[]>(() =>
    initialFoods.length > 0 ? initialFoods.map((food) => buildFoodRow(food)) : [buildFoodRow()]
  );

  const tagSuggestions = useMemo(() => recommendedTags.join(", "), [recommendedTags]);

  function updateFood(id: string, updater: (row: MealFoodRow) => MealFoodRow) {
    setFoods((current) => current.map((row) => (row.id === id ? updater(row) : row)));
  }

  function toggleTag(id: string, tag: string) {
    updateFood(id, (row) => {
      const hasTag = row.tags.includes(tag);
      return {
        ...row,
        tags: hasTag ? row.tags.filter((item) => item !== tag) : [...row.tags, tag]
      };
    });
  }

  function addCustomTags(id: string) {
    updateFood(id, (row) => {
      const additions = row.customTags
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .filter((item) => !row.tags.includes(item));

      return {
        ...row,
        tags: [...row.tags, ...additions],
        customTags: ""
      };
    });
  }

  return (
    <form action={formAction} className="card stack">
      {state.status === "error" ? (
        <div className="form-banner error">{state.message ?? "Please fix the highlighted fields."}</div>
      ) : null}

      <div className="field-grid">
        <div className="field">
          <label htmlFor="mealDate">Date</label>
          <input defaultValue={initialDate} id="mealDate" name="mealDate" required type="date" />
          <FieldError errors={state.fieldErrors?.mealDate} />
        </div>
        <div className="field">
          <label htmlFor="mealTime">Time</label>
          <input defaultValue={initialTime} id="mealTime" name="mealTime" required type="time" />
          <FieldError errors={state.fieldErrors?.mealTime} />
        </div>
        <div className="field">
          <label htmlFor="source">Source</label>
          <select
            defaultValue={initialSource}
            id="source"
            name="source"
            onChange={(event) => setSource(event.target.value as "HOME_COOKED" | "OUTSIDE")}
          >
            {sourceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <FieldError errors={state.fieldErrors?.source} />
        </div>
        <div className="field">
          <label htmlFor="mealType">Meal Type</label>
          <select defaultValue={initialMealType} id="mealType" name="mealType">
            {mealTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <FieldError errors={state.fieldErrors?.mealType} />
        </div>
      </div>

      {source === "OUTSIDE" ? (
        <div className="field">
          <label htmlFor="outsideLocation">Where did you eat it?</label>
            <input
            defaultValue={initialOutsideLocation}
            id="outsideLocation"
            name="outsideLocation"
            placeholder="Restaurant or place"
            required
            type="text"
          />
          <div className="hint">This only appears when the meal source is outside.</div>
          <FieldError errors={state.fieldErrors?.outsideLocation} />
        </div>
      ) : null}

      <div className="stack">
        {foods.map((food, index) => (
          <div className="entry-box stack" key={food.id}>
            <div className="row-header">
              <div>
                <strong>Food {index + 1}</strong>
                <div className="hint">Add a name first, then tap tags that fit.</div>
              </div>
              <button
                className="button ghost"
                disabled={foods.length === 1 || pending}
                onClick={() => setFoods((current) => current.filter((row) => row.id !== food.id))}
                type="button"
              >
                Remove
              </button>
            </div>

            <div className="field">
              <label htmlFor={`foodName${index}`}>Food Name</label>
              <input
                id={`foodName${index}`}
                name={`foodName${index}`}
                onChange={(event) =>
                  updateFood(food.id, (row) => ({
                    ...row,
                    name: event.target.value
                  }))
                }
                required
                type="text"
                value={food.name}
              />
              <FieldError errors={state.fieldErrors?.[`foodName${index}`]} />
            </div>

            <div className="field">
              <label>Food Tags</label>
              <div className="chip-row">
                {recommendedTags.map((tag) => {
                  const selected = food.tags.includes(tag);
                  return (
                    <button
                      className={`chip-button${selected ? " selected" : ""}`}
                      key={tag}
                      onClick={() => toggleTag(food.id, tag)}
                      type="button"
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
              <FieldError errors={state.fieldErrors?.[`foodTags${index}`]} />
            </div>

            <div className="field-grid">
              <div className="field">
                <label htmlFor={`customTags${index}`}>Custom Tags</label>
                <input
                  id={`customTags${index}`}
                  onChange={(event) =>
                    updateFood(food.id, (row) => ({
                      ...row,
                      customTags: event.target.value
                    }))
                  }
                  placeholder={tagSuggestions}
                  type="text"
                  value={food.customTags}
                />
                <div className="hint">Use commas if you want to add more than one.</div>
              </div>
              <div className="field align-end">
                <button className="button secondary" onClick={() => addCustomTags(food.id)} type="button">
                  Add Custom Tags
                </button>
              </div>
            </div>

            {food.tags.length > 0 ? (
              <div className="chip-row">
                {food.tags.map((tag) => (
                  <button
                    className="chip removable"
                    key={tag}
                    onClick={() => toggleTag(food.id, tag)}
                    type="button"
                  >
                    {tag} ×
                  </button>
                ))}
              </div>
            ) : null}

            <input name={`foodTags${index}`} type="hidden" value={food.tags.join(",")} />
          </div>
        ))}
      </div>

      <div className="button-row">
        <button
          className="button secondary"
          disabled={pending}
          onClick={() => setFoods((current) => [...current, buildFoodRow()])}
          type="button"
        >
          Add Another Food
        </button>
      </div>

      <div className="field">
        <label htmlFor="mealNotes">Notes</label>
        <textarea defaultValue={initialNotes} id="mealNotes" name="notes" />
      </div>

      <div className="button-row">
        <button className="button" disabled={pending} type="submit">
          {pending ? "Saving Meal..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
