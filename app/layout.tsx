import type { Metadata } from "next";
import "./globals.css";
import { AppNav } from "@/components/app-nav";

export const metadata: Metadata = {
  title: "Diet and Symptoms Tracker",
  description: "Track meals, symptoms, medications, and reminder preferences."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <header className="topbar">
            <div>
              <div className="brand">Diet and Symptoms Tracker</div>
              <div className="subtitle">
                Log meals quickly, spot symptom patterns, and stay consistent.
              </div>
            </div>
            <AppNav />
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
