import { requireSignedOutUser } from "@/lib/current-user";

export default async function AuthLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireSignedOutUser();

  return <div className="auth-shell">{children}</div>;
}
