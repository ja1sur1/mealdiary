import { PageHeader } from "@/components/page-header";
import { saveReminderSettingsAction } from "@/app/server-actions";
import { db } from "@/lib/db";
import { requireCurrentUser } from "@/lib/current-user";

export default async function SettingsPage() {
  const user = await requireCurrentUser();
  const reminderSetting = await db.reminderSetting.findUnique({
    where: {
      userId: user.id
    }
  });

  return (
    <main className="grid" style={{ gap: 20 }}>
      <PageHeader
        eyebrow="Settings"
        title="Keep the reminder simple."
        copy="For MVP, the app supports one daily SMS reminder at 9:00 PM in the user's local timezone."
      />

      <section className="card stack">
        <div>
          <p className="eyebrow">Account</p>
          <h2 className="panel-title">Signed-in profile</h2>
        </div>
        <div className="field-grid">
          <div className="field">
            <label>Email</label>
            <input disabled readOnly type="email" value={user.email} />
          </div>
          <div className="field">
            <label>Name</label>
            <input disabled readOnly type="text" value={user.name ?? "Not set"} />
          </div>
        </div>
      </section>

      <form action={saveReminderSettingsAction} className="card stack">
        <div className="field-grid">
          <div className="field">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              defaultValue={reminderSetting?.phoneNumber ?? user.phoneNumber ?? ""}
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
            />
          </div>
          <div className="field">
            <label htmlFor="timezone">Timezone</label>
            <input
              defaultValue={reminderSetting?.timezone ?? user.timezone}
              id="timezone"
              name="timezone"
              type="text"
            />
          </div>
        </div>

        <div className="entry-box stack">
          <div className="field">
            <label htmlFor="smsEnabled">SMS Reminders</label>
            <select
              defaultValue={reminderSetting?.smsEnabled ? "true" : "false"}
              id="smsEnabled"
              name="smsEnabled"
            >
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
