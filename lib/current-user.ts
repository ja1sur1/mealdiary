import { db } from "@/lib/db";

const DEFAULT_USER = {
  email: "demo@diet-tracker.local",
  name: "Demo User",
  timezone: "America/Los_Angeles"
};

export async function getCurrentUser() {
  const existingUser = await db.user.findFirst({
    orderBy: {
      createdAt: "asc"
    }
  });

  if (existingUser) {
    return existingUser;
  }

  return db.user.create({
    data: DEFAULT_USER
  });
}
