import type { Metadata } from "next";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}
