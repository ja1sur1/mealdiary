import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import {
  buildDashboardStats,
  buildMealTypeChartRows,
  buildSymptomFrequencyRows,
  mealTypeLabel
} from "@/lib/analytics";
import {
  formatDisplayTime,
  getCurrentDateString,
  getMonthBounds,
  parseDateOnlyString
} from "@/lib/date-utils";
import { BarChartCard } from "@/components/bar-chart-card";
import { PageHeader } from "@/components/page-header";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();
  const todayString = getCurrentDateString(user.timezone);
  const todayDate = parseDateOnlyString(todayString);
  const { monthStart, monthEnd } = getMonthBounds(todayString);

  const [mealsToday, symptomLogToday, reminderSetting, monthMeals, monthSymptomLogs] =
    await Promise.all([
      db.meal.findMany({
        where: {
          userId: user.id,
          mealDate: todayDate
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
        },
        orderBy: {
          mealTime: "asc"
        }
      }),
      db.dailySymptomLog.findUnique({
        where: {
          userId_logDate: {
            userId: user.id,
            logDate: todayDate
          }
        },
        include: {
          symptomEntries: {
            orderBy: {
              sortOrder: "asc"
            }
          }
        }
      }),
      db.reminderSetting.findUnique({
        where: {
          userId: user.id
        }
      }),
      db.meal.findMany({
        where: {
          userId: user.id,
          mealDate: {
            gte: monthStart,
            lt: monthEnd
          }
        }
      }),
      db.dailySymptomLog.findMany({
        where: {
          userId: user.id,
          logDate: {
            gte: monthStart,
            lt: monthEnd
          }
        },
        include: {
          symptomEntries: true
        }
      })
    ]);

  const dashboardStats = buildDashboardStats({
    mealsToday,
    symptomsToday: symptomLogToday?.symptomEntries ?? [],
    reminderSetting
  });

  const timelineEntries = [
    ...mealsToday.map((meal) => ({
      time: formatDisplayTime(meal.mealTime),
      title: `${mealTypeLabel(meal.mealType)} · ${meal.source === "OUTSIDE" ? "Outside" : "Home Cooked"}${meal.outsideLocation ? ` · ${meal.outsideLocation}` : ""}`,
      items: meal.foodItems.map((food) => {
        const tags = food.tags.map((tag) => `[${tag.tag}]`).join(" ");
        return tags ? `${food.name} ${tags}` : food.name;
      })
    })),
    ...(symptomLogToday
      ? [
          {
            time: "Day summary",
            title: "Symptoms",
            items: symptomLogToday.symptomEntries.map(
              (entry) =>
                `${entry.symptomName} ${entry.severity}/5${entry.medicationName ? ` · ${entry.medicationName}` : ""}`
            )
          }
        ]
      : [])
  ];

  return (
    <main className="grid" style={{ gap: 20 }}>
      <PageHeader
        eyebrow="Today"
        title="Keep logging light and consistent."
        copy="The dashboard now reflects the real meals, symptoms, and reminder state stored for the current user."
        actions={
          <div className="button-row">
            <Link className="button" href="/meals/new">
              Add Meal
            </Link>
            <Link className="button secondary" href="/symptoms/new">
              Add Symptoms
            </Link>
          </div>
        }
      />

      <section className="grid three">
        {dashboardStats.map((item) => (
          <article className="card" key={item.label}>
            <p className="eyebrow">{item.label}</p>
            <div className="stat-value">{item.value}</div>
            <div className="panel-copy">{item.detail}</div>
          </article>
        ))}
      </section>

      <section className="grid two">
        <article className="card">
          <h2 className="panel-title">Today's Timeline</h2>
          {timelineEntries.length > 0 ? (
            <div className="timeline">
              {timelineEntries.map((entry) => (
                <div className="timeline-item" key={`${entry.time}-${entry.title}`}>
                  <div className="timeline-time">{entry.time}</div>
                  <div className="timeline-title">{entry.title}</div>
                  <ul className="list">
                    {entry.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className="panel-copy">No meals or symptoms logged yet for today.</p>
          )}
        </article>

        <article className="card">
          <h2 className="panel-title">Monthly Snapshot</h2>
          <div className="stack">
            <BarChartCard title="Meal Type Frequency" rows={buildMealTypeChartRows(monthMeals)} />
            <BarChartCard
              title="Symptom Frequency"
              rows={buildSymptomFrequencyRows(monthSymptomLogs)}
            />
          </div>
        </article>
      </section>
    </main>
  );
}
