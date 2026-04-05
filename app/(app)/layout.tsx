import { AppNav } from "@/components/app-nav";
import { signOutAction } from "@/app/server-actions";
import { requireCurrentUser } from "@/lib/current-user";

export default async function ProtectedAppLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireCurrentUser();
  const displayName = user.name?.trim() || user.email;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <div className="brand">Diet and Symptoms Tracker</div>
          <div className="subtitle">
            Log meals quickly, spot symptom patterns, and stay consistent.
          </div>
        </div>

        <div className="topbar-actions">
          <div className="account-pill">
            <span className="account-label">Signed in as</span>
            <strong>{displayName}</strong>
          </div>
          <form action={signOutAction}>
            <button className="button secondary" type="submit">
              Sign Out
            </button>
          </form>
        </div>
      </header>

      <AppNav />
      {children}
    </div>
  );
}
