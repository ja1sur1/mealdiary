import { notFound } from "next/navigation";
import { SymptomForm } from "@/components/forms/symptom-form";
import { PageHeader } from "@/components/page-header";
import { updateSymptomLogAction } from "@/app/server-actions";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { presetMedications, presetSymptoms } from "@/lib/presets";

export const dynamic = "force-dynamic";

export default async function EditSymptomLogPage({
  params
}: {
  params: Promise<{ symptomLogId: string }>;
}) {
  const { symptomLogId } = await params;
  const user = await getCurrentUser();

  const [commonSymptoms, commonMedications, symptomLog] = await Promise.all([
    db.presetSymptom.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" }
    }),
    db.presetMedication.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" }
    }),
    db.dailySymptomLog.findFirst({
      where: {
        id: symptomLogId,
        userId: user.id
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

  if (!symptomLog) {
    notFound();
  }

  return (
    <main className="grid" style={{ gap: 20 }}>
      <PageHeader
        eyebrow="Edit Symptoms"
        title="Update the daily symptom log."
        copy="Adjust symptom names, severity, medication, or date and save the corrected log."
      />

      <SymptomForm
        action={updateSymptomLogAction.bind(null, symptomLog.id)}
        commonMedications={
          commonMedications.length > 0 ? commonMedications.map((medication) => medication.name) : presetMedications
        }
        commonSymptoms={
          commonSymptoms.length > 0 ? commonSymptoms.map((symptom) => symptom.name) : presetSymptoms
        }
        initialDate={symptomLog.logDate.toISOString().slice(0, 10)}
        initialRows={symptomLog.symptomEntries.map((entry) => ({
          name: entry.symptomName,
          severity: String(entry.severity),
          medicationTaken: entry.medicationTaken,
          medicationName: entry.medicationName ?? "",
          notes: entry.notes ?? ""
        }))}
        submitLabel="Save Changes"
      />
    </main>
  );
}
