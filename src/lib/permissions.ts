/** Routes only accessible to ADMIN role */
export const ADMIN_ONLY_PATHS = [
  "/dashboard/members",
  "/dashboard/documents",
  "/dashboard/sponsors",
  "/dashboard/societies",
  "/dashboard/donators",
  "/dashboard/collections",
  "/dashboard/balance",
  "/dashboard/exceptions",
  "/dashboard/expenses",
  "/dashboard/budget",
  "/dashboard/volunteers",
  "/dashboard/inventory",
  "/dashboard/years",
  "/dashboard/users",
  "/dashboard/payment-approvals",
  "/dashboard/membership-fees",
];

/** Routes accessible to registered users (view-only portal) */
export const USER_PORTAL_PATHS = [
  "/dashboard",
  "/dashboard/my-payments",
  "/dashboard/events",
  "/dashboard/qr-donations",
  "/dashboard/activities",
];

export function isAdminOnlyPath(pathname: string) {
  return ADMIN_ONLY_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export function isUserPortalPath(pathname: string) {
  return USER_PORTAL_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}
