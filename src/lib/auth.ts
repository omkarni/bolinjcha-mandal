import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret"
);

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  mobile?: string | null;
  role: "ADMIN" | "USER";
  isApproved?: boolean;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createToken(user: SessionUser) {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAuth(role?: "ADMIN" | "USER") {
  const session = await getSession();
  if (!session) return null;
  if (role === "ADMIN" && session.role !== "ADMIN") return null;
  return session;
}

export async function getActiveYear() {
  let year = await prisma.managementYear.findFirst({
    where: { isActive: true },
  });
  if (!year) {
    const currentYear = new Date().getFullYear().toString();
    year = await prisma.managementYear.upsert({
      where: { year: currentYear },
      update: { isActive: true },
      create: {
        year: currentYear,
        label: `Ganesh Utsav ${currentYear}`,
        isActive: true,
      },
    });
  }
  return year;
}
