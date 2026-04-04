"use client";

import { useActionState, useState } from "react";
import { createSymptomLogAction } from "@/app/server-actions";
import { initialFormState, type FormAction } from "@/lib/form-state";

type SymptomRow = {
  id: string;
  name: string;
  severity: string;
  medicationTaken: boolean;
  medicationName: string;
  notes: string;
};

function buildSymptomRow(seed?: Partial<SymptomRow>): SymptomRow {
  return {
    id: crypto.randomUUID(),
    name: seed?.name ?? "",
    severity: seed?.severity ?? "3",
    medicationTaken: seed?.medicationTaken ?? false,
    medicationName: seed?.medicationName ?? "",
    notes: seed?.notes ?? ""
  };
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return <div className="field-error">{errors[0]}</div>;
}

export function SymptomForm({
  action = createSymptomLogAction,
  commonSymptoms,
  commonMedications,
  initialDate,
  initialRows = [
    {
      name: "Headache",
      severity: "4",
      medicationTaken: true,
      medicationName: "Tylenol",
      notes: "Started in the evening."
    },
    {
      name: "Bloating",
      severity: "3",
      medicationTaken: false,
      medicationName: "",
      notes: ""
    }
  ],
  submitLabel = "Save Symptoms"
}: {
  action?: FormAction;
  commonSymptoms: string[];
  commonMedications: string[];
  initialDate: string;
  initialRows?: Array<{
    name: string;
    severity: string;
    medicationTaken: boolean;
    medicationName: string;
    notes: string;
  }>;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialFormState);
  const [rows, setRows] = useState<SymptomRow[]>(() =>
    initialRows.length > 0 ? initialRows.map((row) => buildSymptomRow(row)) : [buildSymptomRow()]
  );

  function updateRow(id: string, updater: (row: SymptomRow) => SymptomRow) {
    setRows((current) => current.map((row) => (row.id === id ? updater(row) : row)));
  }

  return (
    <form action={formAction} className="card stack">
      {state.status === "error" ? (
        <div className="form-banner error">{state.message ?? "Please fix the highlighted fields."}</div>
      ) : null}

      <div className="field">
        <label htmlFor="logDate">Date</label>
        <input defaultValue={initialDate} id="logDate" name="logDate" required type="date" />
        <FieldError errors={state.fieldErrors?.logDate} />
      </div>

      <datalist id="symptom-options">
        {commonSymptoms.map((symptom) => (
          <option key={symptom} value={symptom} />
        ))}
      </datalist>

      <datalist id="medication-options">
        {commonMedications.map((medication) => (
          <option key={medication} value={medication} />
        ))}
      </datalist>

      <div className="stack">
        {rows.map((row, index) => (
          <div className="entry-box stack" key={row.id}>
            <div className="row-header">
              <div>
                <strong>Symptom {index + 1}</strong>
                <div className="hint">Each symptom gets its own severity and optional medication.</div>
              </div>
              <button
                className="button ghost"
                disabled={rows.length === 1 || pending}
                onClick={() => setRows((current) => current.filter((item) => item.id !== row.id))}
                type="button"
              >
                Remove
              </button>
            </div>

            <div className="field">
              <label htmlFor={`symptomName${index}`}>Symptom</label>
              <input
                id={`symptomName${index}`}
                list="symptom-options"
                name={`symptomName${index}`}
                onChange={(event) =>
                  updateRow(row.id, (current) => ({
                    ...current,
                    name: event.target.value
                  }))
                }
                placeholder="Headache, nausea, bloating..."
                required
                type="text"
                value={row.name}
              />
              <FieldError errors={state.fieldErrors?.[`symptomName${index}`]} />
            </div>

            <div className="field-grid">
              <div className="field">
                <label htmlFor={`severity${index}`}>Severity</label>
                <select
                  id={`severity${index}`}
                  name={`severity${index}`}
                  onChange={(event) =>
                    updateRow(row.id, (current) => ({
                      ...current,
                      severity: event.target.value
                    }))
                  }
                  value={row.severity}
                >
                  <option value="1">1 - Very mild</option>
                  <option value="2">2 - Mild</option>
                  <option value="3">3 - Moderate</option>
                  <option value="4">4 - Severe</option>
                  <option value="5">5 - Very severe</option>
                </select>
                <FieldError errors={state.fieldErrors?.[`severity${index}`]} />
              </div>
              <div className="field align-end">
                <label className="checkbox-row">
                  <input
                    checked={row.medicationTaken}
                    onChange={(event) =>
                      updateRow(row.id, (current) => ({
                        ...current,
                        medicationTaken: event.target.checked,
                        medicationName: event.target.checked ? current.medicationName : ""
                      }))
                    }
                    type="checkbox"
                  />
                  Took medication for this symptom
                </label>
              </div>
            </div>

            {row.medicationTaken ? (
              <div className="field">
                <label htmlFor={`medicationName${index}`}>Medication</label>
                <input
                  id={`medicationName${index}`}
                  list="medication-options"
                  name={`medicationName${index}`}
                  onChange={(event) =>
                    updateRow(row.id, (current) => ({
                      ...current,
                      medicationName: event.target.value
                    }))
                  }
                  placeholder="Tylenol, Tums..."
                  type="text"
                  value={row.medicationName}
                />
                <FieldError errors={state.fieldErrors?.[`medicationName${index}`]} />
              </div>
            ) : null}

            <div className="field">
              <label htmlFor={`symptomNotes${index}`}>Notes</label>
              <textarea
                id={`symptomNotes${index}`}
                name={`symptomNotes${index}`}
                onChange={(event) =>
                  updateRow(row.id, (current) => ({
                    ...current,
                    notes: event.target.value
                  }))
                }
                placeholder="Optional context for this symptom"
                value={row.notes}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="button-row">
        <button
          className="button secondary"
          disabled={pending}
          onClick={() => setRows((current) => [...current, buildSymptomRow()])}
          type="button"
        >
          Add Another Symptom
        </button>
        <button className="button" disabled={pending} type="submit">
          {pending ? "Saving Symptoms..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
