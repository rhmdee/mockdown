import type { MockdownSchema } from "@mockdown/schema";

export function generatePrismaSeed(schema: MockdownSchema, mockData: Record<string, any[]>): string {
  let script = `import { PrismaClient } from '@prisma/client';\n\n`;
  script += `const prisma = new PrismaClient();\n\n`;
  script += `async function main() {\n`;
  script += `  console.log("Start seeding...");\n\n`;

  // Prisma needs tables in the right order (parent first).
  // Assuming mockData is populated in topological order by mock-engine.
  // The keys of mockData can be iterated.

  for (const [tableName, rows] of Object.entries(mockData)) {
    const modelName = tableName.charAt(0).toUpperCase() + tableName.slice(1);
    
    script += `  // Seeding ${modelName}\n`;
    script += `  await prisma.${modelName.toLowerCase()}.createMany({\n`;
    script += `    data: ${JSON.stringify(rows, null, 4).split('\\n').join('\\n    ')}\n`;
    script += `  });\n\n`;
  }

  script += `  console.log("Seeding finished.");\n`;
  script += `}\n\n`;
  
  script += `main()\n`;
  script += `  .catch((e) => {\n`;
  script += `    console.error(e);\n`;
  script += `    process.exit(1);\n`;
  script += `  })\n`;
  script += `  .finally(async () => {\n`;
  script += `    await prisma.$disconnect();\n`;
  script += `  });\n`;

  return script;
}
