"use client";

import { useState } from "react";
import {
  markMembershipFeePaid,
  markMembershipFeeUnpaid,
} from "@/lib/actions";
import { Button, Badge } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { MEMBERSHIP_FEE_AMOUNT } from "@/lib/constants";
import { Check, X, Search, Users } from "lucide-react";

type Member = {
  id: string;
  name: string;
  designation: string;
  mobile: string | null;
  membershipFeePaid: boolean;
  membershipFeePaidDate: string | null;
};

export function MembershipFeesClient({ members }: { members: Member[] }) {
  const [search, setSearch] = useState("");

  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.designation.toLowerCase().includes(search.toLowerCase()) ||
      m.mobile?.includes(search)
  );

  const paid = members.filter((m) => m.membershipFeePaid);
  const unpaid = members.filter((m) => !m.membershipFeePaid);
  const totalCollected = paid.length * MEMBERSHIP_FEE_AMOUNT;

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      <div>
        <h1 className="page-title">Membership Fees</h1>
        <p className="text-sm text-gray-500 mt-1">
          Annual membership fee: {formatCurrency(MEMBERSHIP_FEE_AMOUNT)} per member
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="text-sm text-gray-500">Total Members</p>
          <p className="text-2xl font-bold">{members.length}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-green-600">Fees Collected</p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(totalCollected)}
          </p>
          <p className="text-xs text-gray-400">{paid.length} paid</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-amber-600">Pending</p>
          <p className="text-2xl font-bold text-amber-600">{unpaid.length}</p>
          <p className="text-xs text-gray-400">
            {formatCurrency(unpaid.length * MEMBERSHIP_FEE_AMOUNT)} due
          </p>
        </div>
      </div>

      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          className="input-field pl-10"
          placeholder="Search member..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {unpaid.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-amber-600 mb-3">
            Pending Fees ({unpaid.length})
          </h2>
          <div className="space-y-2">
            {filtered
              .filter((m) => !m.membershipFeePaid)
              .map((m) => (
                <MemberRow key={m.id} member={m} />
              ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-mandal-maroon mb-3">
          Paid ({paid.length})
        </h2>
        {paid.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No fees collected yet</p>
        ) : (
          <div className="space-y-2">
            {filtered
              .filter((m) => m.membershipFeePaid)
              .map((m) => (
                <MemberRow key={m.id} member={m} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MemberRow({ member }: { member: Member }) {
  return (
    <div className="card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="p-2 bg-mandal-cream rounded-lg shrink-0">
          <Users size={18} className="text-mandal-maroon" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold truncate">{member.name}</h3>
            <Badge variant={member.membershipFeePaid ? "success" : "warning"}>
              {member.membershipFeePaid ? "Paid" : "Pending"}
            </Badge>
          </div>
          <p className="text-sm text-gray-500">{member.designation}</p>
          {member.mobile && (
            <p className="text-xs text-gray-400">{member.mobile}</p>
          )}
          {member.membershipFeePaid && member.membershipFeePaidDate && (
            <p className="text-xs text-green-600 mt-0.5">
              Paid on {member.membershipFeePaidDate}
            </p>
          )}
        </div>
      </div>
      <div className="shrink-0">
        {member.membershipFeePaid ? (
          <Button
            variant="danger"
            onClick={() => markMembershipFeeUnpaid(member.id)}
            className="w-full sm:w-auto text-sm"
          >
            <X size={16} className="inline mr-1" /> Mark Unpaid
          </Button>
        ) : (
          <Button
            onClick={() => markMembershipFeePaid(member.id)}
            className="w-full sm:w-auto text-sm"
          >
            <Check size={16} className="inline mr-1" />
            Mark Paid ({formatCurrency(MEMBERSHIP_FEE_AMOUNT)})
          </Button>
        )}
      </div>
    </div>
  );
}
