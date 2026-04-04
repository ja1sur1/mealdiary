import { PageHeader } from "@/components/page-header";
import { SymptomForm } from "@/components/forms/symptom-form";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function NewSymptomsPage() {
  const [commonSymptoms, commonMedications] = await Promise.all([
    db.presetSymptom.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" }
    }),
    db.presetMedication.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" }
    })
  ]);

  return (
    <main className="grid" style={{ gap: 20 }}>
      <PageHeader
        eyebrow="Daily Symptoms"
        title="Log how the day felt."
        copy="Add or remove symptom rows, rate severity quickly, and only show medication when you took one."
      />

      <SymptomForm
        commonMedications={commonMedications.map((medication) => medication.name)}
        commonSymptoms={commonSymptoms.map((symptom) => symptom.name)}
        initialDate={new Date().toISOString().slice(0, 10)}
      />
    </main>
  );
}
