import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);
  const userPassword = await bcrypt.hash("user123", 10);

  await prisma.user.upsert({
    where: { email: "admin@mandal.com" },
    update: { isApproved: true, role: "ADMIN" },
    create: {
      email: "admin@mandal.com",
      password: adminPassword,
      name: "Mandal Admin",
      role: "ADMIN",
      isApproved: true,
    },
  });

  await prisma.user.upsert({
    where: { email: "user@mandal.com" },
    update: { isApproved: true, mobile: "9876543210", role: "USER" },
    create: {
      email: "user@mandal.com",
      password: userPassword,
      name: "Test Member",
      mobile: "9876543210",
      role: "USER",
      isApproved: true,
    },
  });

  const currentYear = new Date().getFullYear().toString();
  const year = await prisma.managementYear.upsert({
    where: { year: currentYear },
    update: { isActive: true },
    create: {
      year: currentYear,
      label: `Ganesh Utsav ${currentYear}`,
      isActive: true,
    },
  });

  const donator = await prisma.donator.upsert({
    where: { id: "seed-donator-user" },
    update: { mobile: "9876543210" },
    create: {
      id: "seed-donator-user",
      name: "Test Member",
      mobile: "9876543210",
      managementYearId: year.id,
    },
  });

  await prisma.collection.upsert({
    where: { id: "seed-collection-user" },
    update: {},
    create: {
      id: "seed-collection-user",
      amount: 5000,
      date: new Date().toISOString().split("T")[0],
      paymentStatus: "PENDING",
      balanceAmount: 2000,
      donatorId: donator.id,
      managementYearId: year.id,
    },
  });

  console.log("Seed completed!");
  console.log("Admin: admin@mandal.com / admin123");
  console.log("User:  user@mandal.com / user123 (mobile: 9876543210, sample payment seeded)");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
