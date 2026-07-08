import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ChevronDown, Menu, Mountain, UserCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LogoutButton, useAuthStore } from "@/features/auth";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/shared/components/ThemeToggle";
import type { AuthSession } from "@/features/auth/store/authStore";

const navigationItems = [
  { label: "Home", to: "/" },
];

function Logo() {
  return (
    <Link
      className="flex items-center gap-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22C55E]/60"
      to="/"
    >
      <span className="flex size-10 items-center justify-center rounded-xl border border-[#86EFAC]/40 bg-[#14532D]/70 text-[#BBF7D0] shadow-lg shadow-black/20">
        <Mountain aria-hidden="true" className="size-6" />
      </span>
      <span className="leading-none">
        <span className="block text-sm font-black uppercase tracking-wide text-white">
          Trail
        </span>
        <span className="block text-sm font-black uppercase tracking-wide text-[#65D46E]">
          Explorer
        </span>
      </span>
    </Link>
  );
}

function AccountMenu({ session }: { session: AuthSession }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const displayName = session.user.displayName || session.user.email;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <Button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={`${displayName} account menu`}
        className="h-10 max-w-64 border-white/15 bg-white/5 px-3 text-white hover:bg-white/10"
        type="button"
        variant="outline"
        onClick={() => setIsOpen((current) => !current)}
      >
        <UserCircle aria-hidden="true" className="size-5 shrink-0" />
        <span className="truncate text-sm font-semibold">{displayName}</span>
        <ChevronDown
          aria-hidden="true"
          className={`size-4 shrink-0 transition ${isOpen ? "rotate-180" : ""}`}
        />
      </Button>

      {isOpen ? (
        <div
          className="absolute right-0 mt-3 w-72 rounded-xl border border-white/10 bg-[#071511] p-3 text-white shadow-2xl shadow-black/35"
          role="menu"
        >
          <div className="mb-3 border-b border-white/10 px-2 pb-3">
            <p className="truncate text-sm font-bold">{displayName}</p>
            <p className="mt-1 truncate text-xs text-white/60">
              {session.user.email}
            </p>
          </div>
          <LogoutButton />
        </div>
      ) : null}
    </div>
  );
}

function SiteHeader() {
  const session = useAuthStore((state) => state.session);
  const canManageUsers =
    session?.user.role === "Admin" || session?.user.role === "Moderator";
  const sessionNavigationItems = session
    ? [
        { label: "Dashboard", to: "/dashboard" },
        { label: "Trails", to: "/trails" },
        { label: "Check-ins", to: "/checkins" },
        ...(canManageUsers
          ? [
              { label: "Moderation", to: "/moderation/checkins" },
              { label: "Manage Users", to: "/admin/users" },
            ]
          : []),
      ]
    : [];
  const visibleNavigationItems = [
    ...navigationItems,
    ...sessionNavigationItems,
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#061813]/85 text-white shadow-lg shadow-black/10 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {visibleNavigationItems.map((item) => (
            <NavLink
              className={({ isActive }) =>
                `rounded-lg text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#22C55E]/60 ${
                  isActive
                    ? "text-[#86EFAC]"
                    : "text-white/85 hover:text-white"
                }`
              }
              key={item.label}
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle />
          {session ? (
            <AccountMenu session={session} />
          ) : (
            <>
              <Button
                asChild
                className="h-10 border-white/30 bg-white/5 px-5 text-white hover:bg-white/10"
                variant="outline"
              >
                <Link to="/login">Log In</Link>
              </Button>
              <Button
                asChild
                className="h-10 bg-[#43A047] px-5 font-bold text-white hover:bg-[#2E7D32]"
              >
                <Link to="/register">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button
                aria-label="Open navigation menu"
                className="border-white/15 bg-white/5 text-white hover:bg-white/10"
                size="icon"
                type="button"
                variant="outline"
              >
                <Menu aria-hidden="true" className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader className="pr-8">
                <SheetTitle>Trail Explorer</SheetTitle>
                <SheetDescription>
                  Explore trails, progress, and rewards.
                </SheetDescription>
              </SheetHeader>

              <nav className="mt-8 grid gap-2" aria-label="Mobile primary">
                {visibleNavigationItems.map((item) => (
                  <SheetClose asChild key={item.label}>
                    <Link
                      className="rounded-lg px-3 py-3 text-base font-semibold text-white/85 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#22C55E]/60"
                      to={item.to}
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>

              <div className="mt-8 grid gap-3">
                {session ? (
                  <>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-3">
                        <UserCircle
                          aria-hidden="true"
                          className="size-6 shrink-0 text-[#86EFAC]"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-white">
                            {session.user.displayName || session.user.email}
                          </p>
                          <p className="mt-1 truncate text-xs text-white/60">
                            {session.user.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    <LogoutButton />
                  </>
                ) : (
                  <>
                    <SheetClose asChild>
                      <Button
                        asChild
                        className="h-11 border-white/30 bg-white/5 text-white hover:bg-white/10"
                        variant="outline"
                      >
                        <Link to="/login">Log In</Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button
                        asChild
                        className="h-11 bg-[#43A047] font-bold text-white hover:bg-[#2E7D32]"
                      >
                        <Link to="/register">Sign Up</Link>
                      </Button>
                    </SheetClose>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export { SiteHeader };
