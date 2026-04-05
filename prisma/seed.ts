import { PrismaClient } from "@prisma/client";
import { presetFoodTags, presetMedications, presetSymptoms } from "../lib/presets";

const prisma = new PrismaClient();

function normalize(value: string) {
  return value.trim().toLowerCase();
}

async function main() {
  await Promise.all(
    presetSymptoms.map((name) =>
      prisma.presetSymptom.upsert({
        where: { name },
        update: { isActive: true },
        create: {
          name,
          nameNormalized: normalize(name)
        }
      })
    )
  );

  await Promise.all(
    presetMedications.map((name) =>
      prisma.presetMedication.upsert({
        where: { name },
        update: { isActive: true },
        create: {
          name,
          nameNormalized: normalize(name)
        }
      })
    )
  );

  await Promise.all(
    presetFoodTags.map((tag) =>
      prisma.presetFoodTag.upsert({
        where: { tag },
        update: { isActive: true },
        create: {
          tag,
          tagNormalized: normalize(tag)
        }
      })
    )
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
