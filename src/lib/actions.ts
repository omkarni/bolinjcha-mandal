"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getUploadsDir } from "./paths";
import {
  createToken,
  getActiveYear,
  getSession,
  hashPassword,
  requireAuth,
  verifyPassword,
} from "./auth";
import { prisma } from "./prisma";
import {
  calculatePaymentBalance,
  groupCollectionsByDonator,
  sumGroupedPending,
  type CollectionRow,
} from "./collection-utils";
import { MEMBERSHIP_FEE_AMOUNT } from "./constants";

async function getDonatorTotalPaid(
  donatorId: string,
  managementYearId: string,
  excludeCollectionId?: string
) {
  const collections = await prisma.collection.findMany({
    where: {
      donatorId,
      managementYearId,
      ...(excludeCollectionId ? { id: { not: excludeCollectionId } } : {}),
    },
  });
  return collections.reduce((s, c) => s + c.amount, 0);
}

async function getYearId(yearId?: string) {
  if (yearId) {
    const year = await prisma.managementYear.findUnique({ where: { id: yearId } });
    if (year) return year.id;
  }
  const active = await getActiveYear();
  return active.id;
}

export async function loginAction(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.password))) {
    return { error: "Invalid email or password" };
  }
  if (user.role === "USER" && !user.isApproved) {
    return {
      error:
        "Your account is pending admin approval. Please contact the mandal committee.",
    };
  }
  const token = await createToken({
    id: user.id,
    email: user.email,
    name: user.name,
    mobile: user.mobile,
    role: user.role,
    isApproved: user.isApproved,
  });
  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return { success: true };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  redirect("/login");
}

export async function registerAction(data: Record<string, string>) {
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (existing) {
    return { error: "An account with this email already exists" };
  }
  if (data.password !== data.confirmPassword) {
    return { error: "Passwords do not match" };
  }
  if (data.password.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }

  const hashed = await hashPassword(data.password);
  await prisma.user.create({
    data: {
      email: data.email,
      password: hashed,
      name: data.name,
      mobile: data.mobile || null,
      role: "USER",
      isApproved: false,
    },
  });

  return {
    success: true,
    message:
      "Registration successful! Your account will be active after admin approval.",
  };
}

export async function approveUser(id: string) {
  await requireAuth("ADMIN");
  await prisma.user.update({
    where: { id },
    data: { isApproved: true },
  });
  revalidatePath("/dashboard/users");
}

export async function rejectUser(id: string) {
  await requireAuth("ADMIN");
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || user.role === "ADMIN") return;
  await prisma.user.delete({ where: { id } });
  revalidatePath("/dashboard/users");
}

export async function uploadFile(formData: FormData, subfolder: string) {
  const file = formData.get("file") as File;
  if (!file || file.size === 0) return null;
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = path.extname(file.name);
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  const uploadDir = getUploadsDir(subfolder);
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), buffer);
  return `/api/uploads/${subfolder}/${filename}`;
}

// Members
export async function createMember(data: Record<string, string>, yearId?: string) {
  await requireAuth("ADMIN");
  const managementYearId = await getYearId(yearId);
  await prisma.member.create({
    data: {
      name: data.name,
      designation: data.designation,
      dob: data.dob || null,
      mobile: data.mobile || null,
      address: data.address || null,
      profilePic: data.profilePic || null,
      documents: data.documents || null,
      managementYearId,
    },
  });
  revalidatePath("/dashboard/members");
}

export async function updateMember(id: string, data: Record<string, string>) {
  await requireAuth("ADMIN");
  await prisma.member.update({
    where: { id },
    data: {
      name: data.name,
      designation: data.designation,
      dob: data.dob || null,
      mobile: data.mobile || null,
      address: data.address || null,
      profilePic: data.profilePic || null,
      documents: data.documents || null,
    },
  });
  revalidatePath("/dashboard/members");
}

export async function deleteMember(id: string) {
  await requireAuth("ADMIN");
  await prisma.member.delete({ where: { id } });
  revalidatePath("/dashboard/members");
}

// Documents
export async function createDocument(data: Record<string, string>, yearId?: string) {
  await requireAuth("ADMIN");
  const managementYearId = await getYearId(yearId);
  await prisma.mandalDocument.create({
    data: {
      name: data.name,
      fileUrl: data.fileUrl,
      fileType: data.fileType || null,
      managementYearId,
    },
  });
  revalidatePath("/dashboard/documents");
}

export async function deleteDocument(id: string) {
  await requireAuth("ADMIN");
  await prisma.mandalDocument.delete({ where: { id } });
  revalidatePath("/dashboard/documents");
}

// Sponsors
export async function createSponsor(data: Record<string, string>, yearId?: string) {
  await requireAuth("ADMIN");
  const managementYearId = await getYearId(yearId);
  await prisma.sponsor.create({
    data: {
      name: data.name,
      address: data.address || null,
      mobile: data.mobile || null,
      managementYearId,
    },
  });
  revalidatePath("/dashboard/sponsors");
}

export async function updateSponsor(id: string, data: Record<string, string>) {
  await requireAuth("ADMIN");
  await prisma.sponsor.update({
    where: { id },
    data: {
      name: data.name,
      address: data.address || null,
      mobile: data.mobile || null,
    },
  });
  revalidatePath("/dashboard/sponsors");
}

export async function deleteSponsor(id: string) {
  await requireAuth("ADMIN");
  await prisma.sponsor.delete({ where: { id } });
  revalidatePath("/dashboard/sponsors");
}

// Societies
export async function createSociety(data: Record<string, string>, yearId?: string) {
  await requireAuth("ADMIN");
  const managementYearId = await getYearId(yearId);
  await prisma.society.create({
    data: {
      buildingName: data.buildingName,
      address: data.address || null,
      secretary: data.secretary || null,
      chairman: data.chairman || null,
      totalFlats: data.totalFlats ? parseInt(data.totalFlats) : null,
      managementYearId,
    },
  });
  revalidatePath("/dashboard/societies");
}

export async function updateSociety(id: string, data: Record<string, string>) {
  await requireAuth("ADMIN");
  await prisma.society.update({
    where: { id },
    data: {
      buildingName: data.buildingName,
      address: data.address || null,
      secretary: data.secretary || null,
      chairman: data.chairman || null,
      totalFlats: data.totalFlats ? parseInt(data.totalFlats) : null,
    },
  });
  revalidatePath("/dashboard/societies");
}

export async function deleteSociety(id: string) {
  await requireAuth("ADMIN");
  await prisma.society.delete({ where: { id } });
  revalidatePath("/dashboard/societies");
}

// Donators
export async function createDonator(data: Record<string, string>, yearId?: string) {
  await requireAuth("ADMIN");
  const managementYearId = await getYearId(yearId);
  const donator = await prisma.donator.create({
    data: {
      name: data.name,
      mobile: data.mobile || null,
      expectedAmount: data.expectedAmount
        ? parseFloat(data.expectedAmount)
        : null,
      referredBy: data.referredBy || null,
      societyId: data.societyId || null,
      managementYearId,
    },
  });
  revalidatePath("/dashboard/donators");
  revalidatePath("/dashboard/collections");
  return donator;
}

export async function updateDonator(id: string, data: Record<string, string>) {
  await requireAuth("ADMIN");
  await prisma.donator.update({
    where: { id },
    data: {
      name: data.name,
      mobile: data.mobile || null,
      expectedAmount: data.expectedAmount
        ? parseFloat(data.expectedAmount)
        : null,
      referredBy: data.referredBy || null,
      societyId: data.societyId || null,
    },
  });
  revalidatePath("/dashboard/donators");
  revalidatePath("/dashboard/collections");
}

export async function deleteDonator(id: string) {
  await requireAuth("ADMIN");
  await prisma.donator.delete({ where: { id } });
  revalidatePath("/dashboard/donators");
}

// Collections
export async function createCollection(data: Record<string, string>, yearId?: string) {
  await requireAuth("ADMIN");
  const managementYearId = await getYearId(yearId);

  let donatorId = data.donatorId;
  if (!donatorId && data.newDonatorName) {
    const donator = await prisma.donator.create({
      data: {
        name: data.newDonatorName,
        mobile: data.newDonatorMobile || null,
        expectedAmount: data.newDonatorExpected
          ? parseFloat(data.newDonatorExpected)
          : null,
        managementYearId,
      },
    });
    donatorId = donator.id;
  }

  const amount = parseFloat(data.amount);
  const donator = await prisma.donator.findUnique({ where: { id: donatorId! } });
  const totalPaidBefore = await getDonatorTotalPaid(
    donatorId!,
    managementYearId
  );

  const hasExpected =
    donator?.expectedAmount != null && donator.expectedAmount > 0;
  const manualBalance =
    !hasExpected && data.paymentStatus === "PENDING"
      ? parseFloat(data.balanceAmount || "0")
      : 0;
  const { paymentStatus, balanceAmount } = calculatePaymentBalance(
    donator?.expectedAmount,
    totalPaidBefore,
    amount,
    manualBalance,
    !hasExpected
  );

  if (donatorId) {
    await prisma.collection.updateMany({
      where: {
        donatorId,
        managementYearId,
        paymentStatus: "PENDING",
      },
      data: { paymentStatus: "FULL", balanceAmount: 0 },
    });
  }

  await prisma.collection.create({
    data: {
      amount,
      date: data.date,
      paymentStatus,
      balanceAmount,
      donatorId: donatorId!,
      managementYearId,
    },
  });
  revalidatePath("/dashboard/collections");
  revalidatePath("/dashboard/balance");
  revalidatePath("/dashboard");
}

export async function updateCollection(id: string, data: Record<string, string>) {
  await requireAuth("ADMIN");
  const existing = await prisma.collection.findUnique({
    where: { id },
    include: { donator: true },
  });
  if (!existing) return;

  const amount = parseFloat(data.amount);
  const totalPaidBefore = await getDonatorTotalPaid(
    existing.donatorId,
    existing.managementYearId,
    id
  );

  const hasExpected =
    existing.donator.expectedAmount != null && existing.donator.expectedAmount > 0;
  const manualBalance =
    !hasExpected && data.paymentStatus === "PENDING"
      ? parseFloat(data.balanceAmount || "0")
      : 0;
  const { paymentStatus, balanceAmount } = calculatePaymentBalance(
    existing.donator.expectedAmount,
    totalPaidBefore,
    amount,
    manualBalance,
    !hasExpected
  );

  await prisma.collection.update({
    where: { id },
    data: {
      amount,
      date: data.date,
      paymentStatus,
      balanceAmount,
    },
  });
  revalidatePath("/dashboard/collections");
  revalidatePath("/dashboard/balance");
  revalidatePath("/dashboard");
}

export async function deleteCollection(id: string) {
  await requireAuth("ADMIN");
  await prisma.collection.delete({ where: { id } });
  revalidatePath("/dashboard/collections");
  revalidatePath("/dashboard/balance");
  revalidatePath("/dashboard");
}

// Exceptions
export async function createException(data: Record<string, string>, yearId?: string) {
  await requireAuth("ADMIN");
  const managementYearId = await getYearId(yearId);
  await prisma.donatorException.create({
    data: {
      reason: data.reason,
      amount: data.amount ? parseFloat(data.amount) : null,
      donatorId: data.donatorId,
      managementYearId,
    },
  });
  revalidatePath("/dashboard/exceptions");
}

export async function deleteException(id: string) {
  await requireAuth("ADMIN");
  await prisma.donatorException.delete({ where: { id } });
  revalidatePath("/dashboard/exceptions");
}

// Expenses
export async function createExpense(data: Record<string, string>, yearId?: string) {
  await requireAuth("ADMIN");
  const managementYearId = await getYearId(yearId);
  await prisma.expense.create({
    data: {
      name: data.name,
      amount: parseFloat(data.amount),
      date: data.date,
      memberId: data.memberId || null,
      doneByName: data.doneByName || null,
      managementYearId,
    },
  });
  revalidatePath("/dashboard/expenses");
  revalidatePath("/dashboard");
}

export async function deleteExpense(id: string) {
  await requireAuth("ADMIN");
  await prisma.expense.delete({ where: { id } });
  revalidatePath("/dashboard/expenses");
  revalidatePath("/dashboard");
}

// Year management
export async function createNewYear(year: string, label: string) {
  await requireAuth("ADMIN");
  await prisma.managementYear.updateMany({ data: { isActive: false } });
  await prisma.managementYear.upsert({
    where: { year },
    update: { isActive: true, label },
    create: { year, label, isActive: true },
  });
  revalidatePath("/dashboard");
}

export async function switchYear(yearId: string) {
  await requireAuth("ADMIN");
  await prisma.managementYear.updateMany({ data: { isActive: false } });
  await prisma.managementYear.update({
    where: { id: yearId },
    data: { isActive: true },
  });
  revalidatePath("/dashboard");
}

export async function getFinancialSummary(yearId: string) {
  const collections = await prisma.collection.findMany({
    where: { managementYearId: yearId },
    include: { donator: true },
  });
  const expenses = await prisma.expense.findMany({
    where: { managementYearId: yearId },
  });

  const totalCollection = collections.reduce((s, c) => s + c.amount, 0);
  const totalPending = sumGroupedPending(
    groupCollectionsByDonator(collections as CollectionRow[])
  );
  const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);
  const availableFund = totalCollection - totalExpense;

  return { totalCollection, totalPending, totalExpense, availableFund };
}

// Events
export async function createEvent(data: Record<string, string>, yearId?: string) {
  await requireAuth("ADMIN");
  const managementYearId = await getYearId(yearId);
  await prisma.event.create({
    data: {
      title: data.title,
      eventType: data.eventType as "AARTI" | "VISARJAN" | "CULTURAL" | "POOJA" | "OTHER",
      date: data.date,
      time: data.time || null,
      location: data.location || null,
      description: data.description || null,
      managementYearId,
    },
  });
  revalidatePath("/dashboard/events");
}

export async function updateEvent(id: string, data: Record<string, string>) {
  await requireAuth("ADMIN");
  await prisma.event.update({
    where: { id },
    data: {
      title: data.title,
      eventType: data.eventType as "AARTI" | "VISARJAN" | "CULTURAL" | "POOJA" | "OTHER",
      date: data.date,
      time: data.time || null,
      location: data.location || null,
      description: data.description || null,
    },
  });
  revalidatePath("/dashboard/events");
}

export async function deleteEvent(id: string) {
  await requireAuth("ADMIN");
  await prisma.event.delete({ where: { id } });
  revalidatePath("/dashboard/events");
}

// Volunteers
export async function createVolunteer(data: Record<string, string>, yearId?: string) {
  await requireAuth("ADMIN");
  const managementYearId = await getYearId(yearId);
  await prisma.volunteer.create({
    data: {
      name: data.name,
      mobile: data.mobile || null,
      memberId: data.memberId || null,
      managementYearId,
    },
  });
  revalidatePath("/dashboard/volunteers");
}

export async function updateVolunteer(id: string, data: Record<string, string>) {
  await requireAuth("ADMIN");
  await prisma.volunteer.update({
    where: { id },
    data: {
      name: data.name,
      mobile: data.mobile || null,
      memberId: data.memberId || null,
    },
  });
  revalidatePath("/dashboard/volunteers");
}

export async function deleteVolunteer(id: string) {
  await requireAuth("ADMIN");
  await prisma.volunteer.delete({ where: { id } });
  revalidatePath("/dashboard/volunteers");
}

export async function createVolunteerDuty(data: Record<string, string>, yearId?: string) {
  await requireAuth("ADMIN");
  const managementYearId = await getYearId(yearId);
  await prisma.volunteerDuty.create({
    data: {
      dutyTitle: data.dutyTitle,
      date: data.date,
      shiftStart: data.shiftStart || null,
      shiftEnd: data.shiftEnd || null,
      location: data.location || null,
      notes: data.notes || null,
      volunteerId: data.volunteerId,
      memberId: data.memberId || null,
      managementYearId,
    },
  });
  revalidatePath("/dashboard/volunteers");
}

export async function deleteVolunteerDuty(id: string) {
  await requireAuth("ADMIN");
  await prisma.volunteerDuty.delete({ where: { id } });
  revalidatePath("/dashboard/volunteers");
}

// Budget
export async function createBudgetCategory(data: Record<string, string>, yearId?: string) {
  await requireAuth("ADMIN");
  const managementYearId = await getYearId(yearId);
  await prisma.budgetCategory.create({
    data: {
      name: data.name,
      allocatedAmount: parseFloat(data.allocatedAmount),
      managementYearId,
    },
  });
  revalidatePath("/dashboard/budget");
}

export async function updateBudgetCategory(id: string, data: Record<string, string>) {
  await requireAuth("ADMIN");
  await prisma.budgetCategory.update({
    where: { id },
    data: {
      name: data.name,
      allocatedAmount: parseFloat(data.allocatedAmount),
    },
  });
  revalidatePath("/dashboard/budget");
}

export async function deleteBudgetCategory(id: string) {
  await requireAuth("ADMIN");
  await prisma.budgetCategory.delete({ where: { id } });
  revalidatePath("/dashboard/budget");
}

export async function createBudgetRequest(data: Record<string, string>, yearId?: string) {
  await requireAuth("ADMIN");
  const managementYearId = await getYearId(yearId);
  const session = await getSession();
  await prisma.budgetRequest.create({
    data: {
      requestedAmount: parseFloat(data.requestedAmount),
      reason: data.reason,
      requestedBy: session?.name || "Admin",
      categoryId: data.categoryId,
      managementYearId,
    },
  });
  revalidatePath("/dashboard/budget");
}

export async function reviewBudgetRequest(
  id: string,
  status: "APPROVED" | "REJECTED",
  reviewNote?: string
) {
  const session = await requireAuth("ADMIN");
  if (!session) throw new Error("Unauthorized");
  await prisma.budgetRequest.update({
    where: { id },
    data: {
      status,
      reviewedBy: session.name,
      reviewNote: reviewNote || null,
    },
  });
  revalidatePath("/dashboard/budget");
}

// QR Donations
export async function createQrDonation(data: Record<string, string>, yearId?: string) {
  await requireAuth("ADMIN");
  const managementYearId = await getYearId(yearId);
  await prisma.qrDonation.create({
    data: {
      title: data.title,
      imageUrl: data.imageUrl,
      upiId: data.upiId || null,
      isActive: data.isActive === "true",
      managementYearId,
    },
  });
  revalidatePath("/dashboard/qr-donations");
}

export async function updateQrDonation(id: string, data: Record<string, string>) {
  await requireAuth("ADMIN");
  await prisma.qrDonation.update({
    where: { id },
    data: {
      title: data.title,
      imageUrl: data.imageUrl || undefined,
      upiId: data.upiId || null,
      isActive: data.isActive === "true",
    },
  });
  revalidatePath("/dashboard/qr-donations");
}

export async function deleteQrDonation(id: string) {
  await requireAuth("ADMIN");
  await prisma.qrDonation.delete({ where: { id } });
  revalidatePath("/dashboard/qr-donations");
}

// Inventory
export async function createInventoryItem(data: Record<string, string>, yearId?: string) {
  await requireAuth("ADMIN");
  const managementYearId = await getYearId(yearId);
  await prisma.inventoryItem.create({
    data: {
      name: data.name,
      category: data.category as "POOJA_SAMAGRI" | "DECORATION" | "ELECTRICAL" | "OTHER",
      quantity: parseFloat(data.quantity),
      unit: data.unit || "pcs",
      notes: data.notes || null,
      managementYearId,
    },
  });
  revalidatePath("/dashboard/inventory");
}

export async function updateInventoryItem(id: string, data: Record<string, string>) {
  await requireAuth("ADMIN");
  await prisma.inventoryItem.update({
    where: { id },
    data: {
      name: data.name,
      category: data.category as "POOJA_SAMAGRI" | "DECORATION" | "ELECTRICAL" | "OTHER",
      quantity: parseFloat(data.quantity),
      unit: data.unit || "pcs",
      notes: data.notes || null,
    },
  });
  revalidatePath("/dashboard/inventory");
}

export async function deleteInventoryItem(id: string) {
  await requireAuth("ADMIN");
  await prisma.inventoryItem.delete({ where: { id } });
  revalidatePath("/dashboard/inventory");
}

// Activities
export async function createActivity(data: Record<string, string>, yearId?: string) {
  await requireAuth("ADMIN");
  const managementYearId = await getYearId(yearId);
  await prisma.activity.create({
    data: {
      name: data.name,
      date: data.date,
      location: data.location || null,
      description: data.description || null,
      status: data.status as "PLANNED" | "ONGOING" | "COMPLETED",
      results: data.results || null,
      managementYearId,
    },
  });
  revalidatePath("/dashboard/activities");
}

export async function updateActivity(id: string, data: Record<string, string>) {
  await requireAuth("ADMIN");
  await prisma.activity.update({
    where: { id },
    data: {
      name: data.name,
      date: data.date,
      location: data.location || null,
      description: data.description || null,
      status: data.status as "PLANNED" | "ONGOING" | "COMPLETED",
      results: data.results || null,
    },
  });
  revalidatePath("/dashboard/activities");
}

export async function deleteActivity(id: string) {
  await requireAuth("ADMIN");
  await prisma.activity.delete({ where: { id } });
  revalidatePath("/dashboard/activities");
}

export async function getUserPayments(userId: string, yearId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.mobile) {
    return { collections: [], totalPaid: 0, totalPending: 0, donators: [] };
  }

  const donators = await prisma.donator.findMany({
    where: { mobile: user.mobile, managementYearId: yearId },
  });

  if (donators.length === 0) {
    return { collections: [], totalPaid: 0, totalPending: 0, donators: [] };
  }

  const collections = await prisma.collection.findMany({
    where: { donatorId: { in: donators.map((d) => d.id) } },
    include: { donator: true },
    orderBy: { date: "desc" },
  });

  const grouped = groupCollectionsByDonator(collections as CollectionRow[]);
  const totalPaid = grouped.reduce((s, g) => s + g.totalPaid, 0);
  const totalPending = sumGroupedPending(grouped);

  return { collections, totalPaid, totalPending, donators };
}

// Payment submissions (user → admin approval)
export async function submitPayment(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "USER") {
    return { error: "Only registered members can submit payments" };
  }

  const file = formData.get("screenshot") as File;
  if (!file || file.size === 0) {
    return { error: "Payment screenshot is required" };
  }

  const uploadFd = new FormData();
  uploadFd.append("file", file);
  const screenshotUrl = await uploadFile(uploadFd, "payment-screenshots");
  if (!screenshotUrl) {
    return { error: "Failed to upload screenshot" };
  }

  const managementYearId = await getYearId();
  const amount = parseFloat(formData.get("amount") as string);
  const user = await prisma.user.findUnique({ where: { id: session.id } });
  const donator = user?.mobile
    ? await prisma.donator.findFirst({
        where: { mobile: user.mobile, managementYearId },
      })
    : null;

  const hasExpected =
    donator?.expectedAmount != null && donator.expectedAmount > 0;
  const totalPaidBefore = donator
    ? await getDonatorTotalPaid(donator.id, managementYearId)
    : 0;
  const manualBalance = !hasExpected
    ? parseFloat((formData.get("balanceAmount") as string) || "0")
    : 0;
  const useManualBalance = !hasExpected && formData.get("useManualBalance") === "true";

  const { paymentStatus, balanceAmount } = calculatePaymentBalance(
    donator?.expectedAmount,
    totalPaidBefore,
    amount,
    manualBalance,
    useManualBalance || !hasExpected
  );

  await prisma.paymentSubmission.create({
    data: {
      amount,
      date: formData.get("date") as string,
      paymentStatus,
      balanceAmount,
      screenshotUrl,
      notes: (formData.get("notes") as string) || null,
      userId: session.id,
      managementYearId,
    },
  });

  revalidatePath("/dashboard/my-payments");
  revalidatePath("/dashboard/payment-approvals");
  return { success: true };
}

export async function approvePaymentSubmission(id: string) {
  const session = await requireAuth("ADMIN");
  if (!session) throw new Error("Unauthorized");

  const submission = await prisma.paymentSubmission.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!submission || submission.status !== "PENDING") return;

  let donator = await prisma.donator.findFirst({
    where: {
      managementYearId: submission.managementYearId,
      mobile: submission.user.mobile || undefined,
    },
  });

  if (!donator) {
    donator = await prisma.donator.create({
      data: {
        name: submission.user.name,
        mobile: submission.user.mobile,
        managementYearId: submission.managementYearId,
      },
    });
  }

  await prisma.collection.updateMany({
    where: {
      donatorId: donator.id,
      managementYearId: submission.managementYearId,
      paymentStatus: "PENDING",
    },
    data: { paymentStatus: "FULL", balanceAmount: 0 },
  });

  const totalPaidBefore = await getDonatorTotalPaid(
    donator.id,
    submission.managementYearId
  );
  const hasExpected =
    donator.expectedAmount != null && donator.expectedAmount > 0;
  const { paymentStatus, balanceAmount } = calculatePaymentBalance(
    donator.expectedAmount,
    totalPaidBefore,
    submission.amount,
    submission.balanceAmount,
    !hasExpected
  );

  const collection = await prisma.collection.create({
    data: {
      amount: submission.amount,
      date: submission.date,
      paymentStatus,
      balanceAmount,
      donatorId: donator.id,
      managementYearId: submission.managementYearId,
    },
  });

  await prisma.paymentSubmission.update({
    where: { id },
    data: {
      status: "APPROVED",
      reviewedBy: session.name,
      collectionId: collection.id,
    },
  });

  revalidatePath("/dashboard/payment-approvals");
  revalidatePath("/dashboard/collections");
  revalidatePath("/dashboard/balance");
  revalidatePath("/dashboard/my-payments");
  revalidatePath("/dashboard");
}

export async function rejectPaymentSubmission(id: string, reason?: string) {
  const session = await requireAuth("ADMIN");
  if (!session) throw new Error("Unauthorized");

  await prisma.paymentSubmission.update({
    where: { id },
    data: {
      status: "REJECTED",
      reviewedBy: session.name,
      rejectReason: reason || null,
    },
  });

  revalidatePath("/dashboard/payment-approvals");
  revalidatePath("/dashboard/my-payments");
}

// Membership fees
export async function markMembershipFeePaid(id: string, date?: string) {
  await requireAuth("ADMIN");
  await prisma.member.update({
    where: { id },
    data: {
      membershipFeePaid: true,
      membershipFeePaidDate: date || new Date().toISOString().split("T")[0],
      membershipFeeAmount: MEMBERSHIP_FEE_AMOUNT,
    },
  });
  revalidatePath("/dashboard/membership-fees");
}

export async function markMembershipFeeUnpaid(id: string) {
  await requireAuth("ADMIN");
  await prisma.member.update({
    where: { id },
    data: {
      membershipFeePaid: false,
      membershipFeePaidDate: null,
    },
  });
  revalidatePath("/dashboard/membership-fees");
}
