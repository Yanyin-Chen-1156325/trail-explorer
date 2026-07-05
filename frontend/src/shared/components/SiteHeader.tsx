import { Link, NavLink } from "react-router-dom";
import { Menu, Mountain } from "lucide-react";

import { Button } from "@/components/ui/button";
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

const navigationItems = [
  { label: "Explore", to: "/" },
  { label: "Trails", to: "/#featured-trails" },
  { label: "Dashboard", to: "/dashboard" },
  { label: "Badges", to: "/#progress" },
  { label: "Leaderboard", to: "/#leaderboard" },
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

function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#061813]/85 text-white shadow-lg shadow-black/10 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {navigationItems.map((item) => (
            <NavLink
              className={({ isActive }) =>
                `rounded-lg text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#22C55E]/60 ${
                  isActive && item.to === "/"
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
                {navigationItems.map((item) => (
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
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export { SiteHeader };
