export type CollectionRow = {
  id: string;
  amount: number;
  date: string;
  paymentStatus: string;
  balanceAmount: number;
  donatorId: string;
  donator: {
    id: string;
    name: string;
    expectedAmount?: number | null;
  };
};

export type GroupedCollection = {
  donatorId: string;
  donatorName: string;
  expectedAmount: number | null;
  totalPaid: number;
  balancePending: number;
  hasPending: boolean;
  paymentCount: number;
  payments: CollectionRow[];
};

/** Compute balance from expected vargani or use manual balance */
export function calculatePaymentBalance(
  expectedAmount: number | null | undefined,
  totalPaidBefore: number,
  newPaymentAmount: number,
  manualBalance?: number,
  forceManual?: boolean
): { paymentStatus: "FULL" | "PENDING"; balanceAmount: number } {
  if (!forceManual && expectedAmount != null && expectedAmount > 0) {
    const totalAfter = totalPaidBefore + newPaymentAmount;
    const balance = Math.max(0, expectedAmount - totalAfter);
    return {
      paymentStatus: balance === 0 ? "FULL" : "PENDING",
      balanceAmount: balance,
    };
  }

  const balance = manualBalance ?? 0;
  return {
    paymentStatus: balance > 0 ? "PENDING" : "FULL",
    balanceAmount: balance,
  };
}

function resolveBalance(
  totalPaid: number,
  expectedAmount: number | null | undefined,
  storedPending: CollectionRow[]
): number {
  if (expectedAmount != null && expectedAmount > 0) {
    return Math.max(0, expectedAmount - totalPaid);
  }
  const pendingSorted = [...storedPending].sort((a, b) =>
    b.date.localeCompare(a.date)
  );
  return pendingSorted.length > 0 ? pendingSorted[0].balanceAmount : 0;
}

/** Group installments by donator — one summary, multiple receipts */
export function groupCollectionsByDonator(
  collections: CollectionRow[]
): GroupedCollection[] {
  const map = new Map<string, CollectionRow[]>();

  for (const c of collections) {
    const list = map.get(c.donatorId) || [];
    list.push(c);
    map.set(c.donatorId, list);
  }

  return Array.from(map.entries())
    .map(([donatorId, payments]) => {
      const sorted = [...payments].sort((a, b) => b.date.localeCompare(a.date));
      const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
      const expectedAmount = payments[0].donator.expectedAmount ?? null;
      const pendingPayments = sorted.filter((p) => p.paymentStatus === "PENDING");
      const balancePending = resolveBalance(
        totalPaid,
        expectedAmount,
        pendingPayments
      );
      const hasPending =
        expectedAmount != null && expectedAmount > 0
          ? balancePending > 0
          : pendingPayments.length > 0;

      return {
        donatorId,
        donatorName: payments[0].donator.name,
        expectedAmount,
        totalPaid,
        balancePending,
        hasPending,
        paymentCount: payments.length,
        payments: sorted,
      };
    })
    .sort((a, b) => a.donatorName.localeCompare(b.donatorName));
}

export function sumGroupedPending(groups: GroupedCollection[]) {
  return groups.reduce((s, g) => s + g.balancePending, 0);
}

export function sumTotalCollected(collections: { amount: number }[]) {
  return collections.reduce((s, c) => s + c.amount, 0);
}
