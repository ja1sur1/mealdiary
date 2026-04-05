import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { deleteMealAction, deleteSymptomLogAction } from "@/app/server-actions";
import { db } from "@/lib/db";
import { requireCurrentUser } from "@/lib/current-user";

export const dynamic = "force-dynamic";

function formatDisplayDate(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(value);
}

function formatDisplayTime(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC"
  }).format(value);
}

type HistoryGroup = {
  date: string;
  entries: Array<{
    id: string;
    type: "meal" | "symptom";
    time: string;
    title: string;
    items: string[];
  }>;
};

export default async function HistoryPage() {
  const user = await requireCurrentUser();
  const [meals, symptomLogs] = await Promise.all([
    db.meal.findMany({
      where: { userId: user.id },
      include: {
        foodItems: {
          include: {
            tags: true
          },
          orderBy: {
            sortOrder: "asc"
          }
        }
      },
      orderBy: [{ mealDate: "desc" }, { mealTime: "desc" }]
    }),
    db.dailySymptomLog.findMany({
      where: { userId: user.id },
      include: {
        symptomEntries: {
          orderBy: {
            sortOrder: "asc"
          }
        }
      },
      orderBy: {
        logDate: "desc"
      }
    })
  ]);

  const grouped = new Map<string, HistoryGroup>();

  for (const meal of meals) {
    const key = meal.mealDate.toISOString();
    const existing = grouped.get(key) ?? {
      date: formatDisplayDate(meal.mealDate),
      entries: []
    };

    existing.entries.push({
      id: meal.id,
      type: "meal",
      time: formatDisplayTime(meal.mealTime),
      title: `${meal.mealType[0]}${meal.mealType.slice(1).toLowerCase()} · ${meal.source === "OUTSIDE" ? "Outside" : "Home Cooked"}${meal.outsideLocation ? ` · ${meal.outsideLocation}` : ""}`,
      items: meal.foodItems.map((food) => {
        const tags = food.tags.map((tag) => `[${tag.tag}]`).join(" ");
        return tags ? `${food.name} ${tags}` : food.name;
      })
    });

    grouped.set(key, existing);
  }

  for (const symptomLog of symptomLogs) {
    const key = symptomLog.logDate.toISOString();
    const existing = grouped.get(key) ?? {
      date: formatDisplayDate(symptomLog.logDate),
      entries: []
    };

    existing.entries.push({
      id: symptomLog.id,
      type: "symptom",
      time: "Day log",
      title: "Symptoms",
      items: symptomLog.symptomEntries.map((entry) =>
        `${entry.symptomName} ${entry.severity}/5${entry.medicationName ? ` · ${entry.medicationName}` : ""}`
      )
    });

    grouped.set(key, existing);
  }

  const historyEntries = Array.from(grouped.entries())
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([, value]) => value);

  return (
    <main className="grid" style={{ gap: 20 }}>
      <PageHeader
        eyebrow="History"
        title="Review and edit past entries."
        copy="The history page is grouped by date so meals and symptom logs can be adjusted together."
      />

      <section className="card stack">
        <div className="field-grid">
          <div className="field">
            <label htmlFor="fromDate">From</label>
            <input defaultValue="2026-04-01" id="fromDate" type="date" />
          </div>
          <div className="field">
            <label htmlFor="toDate">To</label>
            <input defaultValue="2026-04-30" id="toDate" type="date" />
          </div>
          <div className="field">
            <label htmlFor="entryType">Type</label>
            <select defaultValue="ALL" id="entryType">
              <option value="ALL">All</option>
              <option value="MEALS">Meals</option>
              <option value="SYMPTOMS">Symptoms</option>
            </select>
          </div>
        </div>
      </section>

      {historyEntries.length === 0 ? (
        <section className="card">
          <h2 className="panel-title">No history yet</h2>
          <p className="panel-copy">
            Save your first meal or symptom log and it will show up here.
          </p>
        </section>
      ) : null}

      {historyEntries.map((group) => (
        <section className="card stack" key={group.date}>
          <div>
            <p className="eyebrow">{group.date}</p>
          </div>
          {group.entries.map((entry) => (
            <article className="entry-box stack" key={`${entry.type}-${entry.id}`}>
              <div>
                <div className="timeline-time">{entry.time}</div>
                <div className="timeline-title">{entry.title}</div>
              </div>
              <ul className="list">
                {entry.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="button-row">
                <Link
                  className="button secondary"
                  href={entry.type === "meal" ? `/meals/${entry.id}/edit` : `/symptoms/${entry.id}/edit`}
                >
                  Edit
                </Link>
                <form
                  action={
                    entry.type === "meal"
                      ? deleteMealAction.bind(null, entry.id)
                      : deleteSymptomLogAction.bind(null, entry.id)
                  }
                  className="inline-form"
                >
                  <button className="button secondary" type="submit">
                    Delete
                  </button>
                </form>
              </div>
            </article>
          ))}
        </section>
      ))}
    </main>
  );
}
