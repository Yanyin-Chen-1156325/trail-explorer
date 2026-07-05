import { Link } from "react-router-dom";
import {
  ArrowLeft,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  UserCog,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/features/auth";

const adminNotes = [
  {
    title: "Protected access",
    description: "Only authenticated sessions can reach this admin workspace.",
    icon: LockKeyhole,
  },
  {
    title: "Admin policy",
    description:
      "The users API is already guarded by the backend AdminOnly policy.",
    icon: ShieldCheck,
  },
  {
    title: "Role-aware actions",
    description:
      "User list and role controls will be added in the next roadmap tasks.",
    icon: KeyRound,
  },
];

function UserManagementPage() {
  const session = useAuthStore((state) => state.session);

  return (
    <main className="min-h-screen bg-[#0F172A] px-4 py-6 text-[#F8FAFC] sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl items-center">
        <section className="w-full space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Button
              asChild
              className="w-fit border-white/15 bg-white/5 text-[#F8FAFC] hover:bg-white/10"
              variant="outline"
            >
              <Link to="/dashboard">
                <ArrowLeft aria-hidden="true" className="size-4" />
                Dashboard
              </Link>
            </Button>

            <div className="rounded-lg border border-[#10B981]/25 bg-[#10B981]/10 px-4 py-2 text-sm font-medium text-[#A7F3D0]">
              Admin workspace
            </div>
          </div>

          <Card className="border-white/10 bg-[#1E293B] text-[#F8FAFC] shadow-2xl shadow-black/25">
            <CardContent className="p-6 sm:p-8 lg:p-10">
              <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                <div className="space-y-5">
                  <div className="flex size-14 items-center justify-center rounded-xl bg-[#10B981]/15 text-[#10B981]">
                    <UserCog aria-hidden="true" className="size-8" />
                  </div>

                  <div className="max-w-2xl space-y-4">
                    <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
                      User Management
                    </h1>
                    <p className="text-base leading-7 text-[#94A3B8] sm:text-lg">
                      Review the signed-in admin context before loading account
                      records and role controls.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-[#0F172A] p-5">
                  <p className="text-sm font-semibold text-[#94A3B8]">
                    Current session
                  </p>
                  <div className="mt-4 space-y-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-[#94A3B8]">
                        Name
                      </p>
                      <p className="mt-1 font-semibold">
                        {session?.user.displayName ?? "Authenticated user"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-[#94A3B8]">
                        Email
                      </p>
                      <p className="mt-1 break-all font-semibold">
                        {session?.user.email ?? "Session email unavailable"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            {adminNotes.map((note) => (
              <Card
                className="border-white/10 bg-[#1E293B] text-[#F8FAFC] shadow-lg shadow-black/15"
                key={note.title}
              >
                <CardContent className="p-6">
                  <note.icon
                    aria-hidden="true"
                    className="mb-5 size-7 text-[#10B981]"
                  />
                  <h2 className="text-lg font-bold">{note.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#94A3B8]">
                    {note.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export { UserManagementPage };
