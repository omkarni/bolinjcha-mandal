"use client";

import { approveUser, rejectUser } from "@/lib/actions";
import { Button, Badge } from "@/components/ui";
import { Check, X, User } from "lucide-react";

type AppUser = {
  id: string;
  name: string;
  email: string;
  mobile: string | null;
  isApproved: boolean;
  createdAt: Date;
};

function UserInfo({ user }: { user: AppUser }) {
  return (
    <div className="flex items-start gap-3 min-w-0 flex-1">
      <div className="p-2 bg-amber-50 rounded-lg shrink-0">
        <User size={18} className="text-amber-600" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold truncate">{user.name}</h3>
        <p className="text-sm text-gray-500 break-all">{user.email}</p>
        {user.mobile && (
          <p className="text-xs text-gray-400">Mobile: {user.mobile}</p>
        )}
        <p className="text-xs text-gray-400 mt-0.5">
          Registered {new Date(user.createdAt).toLocaleDateString("en-IN")}
        </p>
      </div>
    </div>
  );
}

export function UsersClient({ users }: { users: AppUser[] }) {
  const pending = users.filter((u) => !u.isApproved);
  const approved = users.filter((u) => u.isApproved);

  return (
    <div className="space-y-8 w-full max-w-full overflow-hidden">
      <div>
        <h1 className="page-title">App Users</h1>
        <p className="text-sm text-gray-500 mt-1">
          Approve registrations so users can view their donations
        </p>
      </div>

      {pending.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-amber-600 mb-4">
            Pending Approval ({pending.length})
          </h2>
          <div className="space-y-3">
            {pending.map((u) => (
              <div
                key={u.id}
                className="card flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <UserInfo user={u} />
                <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:shrink-0">
                  <Button
                    onClick={() => approveUser(u.id)}
                    className="w-full justify-center text-sm px-3"
                  >
                    <Check size={16} className="inline mr-1 shrink-0" />
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => rejectUser(u.id)}
                    className="w-full justify-center text-sm px-3"
                  >
                    <X size={16} className="inline mr-1 shrink-0" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-mandal-maroon mb-4">
          Approved Users ({approved.length})
        </h2>
        {approved.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No approved users yet</p>
        ) : (
          <div className="space-y-3">
            {approved.map((u) => (
              <div
                key={u.id}
                className="card flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium truncate">{u.name}</h3>
                    <Badge variant="success">Approved</Badge>
                  </div>
                  <p className="text-sm text-gray-500 break-all mt-1">{u.email}</p>
                  {u.mobile && (
                    <p className="text-xs text-gray-400">Mobile: {u.mobile}</p>
                  )}
                </div>
                <Button
                  variant="danger"
                  onClick={() => rejectUser(u.id)}
                  className="w-full sm:w-auto justify-center text-sm shrink-0"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
