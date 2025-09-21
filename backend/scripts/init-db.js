const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Initializing database...");

  try {
    await prisma.$connect();
    console.log("Database connection successful");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }

  const userCount = await prisma.user.count();
  console.log(`Found ${userCount} users in database`);

  console.log("Database initialization complete");
}

main()
  .catch((e) => {
    console.error("Database initialization failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
