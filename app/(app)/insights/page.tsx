import { BarChartCard } from "@/components/bar-chart-card";
import { PageHeader } from "@/components/page-header";
import {
  buildAssociationSummary,
  buildCalendarDays,
  buildMealTypeChartRows,
  buildMedicationFrequencyRows,
  buildSymptomFrequencyRows,
  buildTopTags
} from "@/lib/analytics";
import { db } from "@/lib/db";
import { requireCurrentUser } from "@/lib/current-user";
import { formatMonthLabel, getCurrentDateString, getMonthBounds } from "@/lib/date-utils";

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  const user = await requireCurrentUser();
  const todayString = getCurrentDateString(user.timezone);
  const { monthStart, monthEnd, month, year } = getMonthBounds(todayString);

  const [monthMeals, monthSymptomLogs] = await Promise.all([
    db.meal.findMany({
      where: {
        userId: user.id,
        mealDate: {
          gte: monthStart,
          lt: monthEnd
        }
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
        symptomEntries: {
          orderBy: {
            sortOrder: "asc"
          }
        }
      }
    })
  ]);

  const topTags = buildTopTags(monthMeals);
  const associations = buildAssociationSummary(monthMeals, monthSymptomLogs);
  const calendarDays = buildCalendarDays(monthSymptomLogs, year, month);

  return (
    <main className="grid" style={{ gap: 20 }}>
      <PageHeader
        eyebrow="Monthly Insights"
        title="See patterns without pretending they are diagnoses."
        copy={`Analytics are now computed from real data for ${formatMonthLabel(year, month)}.`}
      />

      <section className="grid three">
        <BarChartCard title="Meal Type Frequency" rows={buildMealTypeChartRows(monthMeals)} />
        <BarChartCard title="Symptom Frequency" rows={buildSymptomFrequencyRows(monthSymptomLogs)} />
        <BarChartCard
          title="Medication Frequency"
          rows={buildMedicationFrequencyRows(monthSymptomLogs)}
        />
      </section>

      <section className="grid two">
        <article className="card stack">
          <h2 className="panel-title">Most Common Tags</h2>
          {topTags.length > 0 ? (
            <div className="chip-row">
              {topTags.map((tag) => (
                <span className="chip" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          ) : (
            <p className="panel-copy">Log a few meals first and the tag patterns will show up here.</p>
          )}
        </article>

        <article className="card stack">
          <h2 className="panel-title">Possible Associations</h2>
          {associations.length > 0 ? (
            associations.map((association) => (
              <div key={association.symptom}>
                <strong>{association.symptom}</strong>
                <ul className="list">
                  {association.patterns.map((pattern) => (
                    <li key={pattern}>{pattern}</li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <p className="panel-copy">
              Not enough combined meal and symptom data yet to show likely associations.
            </p>
          )}
        </article>
      </section>

      <section className="card stack">
        <h2 className="panel-title">Symptom Calendar</h2>
        <div className="calendar">
          {calendarDays.map((day) => (
            <div className={`calendar-cell${day.active ? " active" : ""}`} key={day.label}>
              {day.label}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
