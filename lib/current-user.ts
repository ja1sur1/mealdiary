import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

export async function getCurrentUser() {
  return getSessionUser();
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return user;
}

export async function requireSignedOutUser() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/");
  }
}
