import { PageHeader } from "@/components/page-header";
import { saveReminderSettingsAction } from "@/app/server-actions";

export default function SettingsPage() {
  return (
    <main className="grid" style={{ gap: 20 }}>
      <PageHeader
        eyebrow="Settings"
        title="Keep the reminder simple."
        copy="For MVP, the app supports one daily SMS reminder at 9:00 PM in the user's local timezone."
      />

      <form action={saveReminderSettingsAction} className="card stack">
        <div className="field-grid">
          <div className="field">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              defaultValue="+14155550123"
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
            />
          </div>
          <div className="field">
            <label htmlFor="timezone">Timezone</label>
            <input
              defaultValue="America/Los_Angeles"
              id="timezone"
              name="timezone"
              type="text"
            />
          </div>
        </div>

        <div className="entry-box stack">
          <div className="field">
            <label htmlFor="smsEnabled">SMS Reminders</label>
            <select defaultValue="true" id="smsEnabled" name="smsEnabled">
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </div>
          <div>
            <strong>Reminder Schedule</strong>
            <div className="panel-copy">Daily at 9:00 PM local time</div>
          </div>
          <div>
            <strong>Message Preview</strong>
            <div className="panel-copy">
              Reminder: log your meals and symptoms in Diet and Symptoms Tracker.
            </div>
          </div>
        </div>

        <div className="button-row">
          <button className="button" type="submit">
            Save Settings
          </button>
        </div>
      </form>
    </main>
  );
}
