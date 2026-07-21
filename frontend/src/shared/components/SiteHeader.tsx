import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  CheckCheck,
  CheckCircle2,
  Menu,
  Mountain,
  UserCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { useAuthStore } from "@/features/auth/store/authStore";
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
import { useNotificationStore } from "@/features/notifications/store/notificationStore";
import type { Notification } from "@/features/notifications/types/notification";

function Logo() {
  return (
    <Link
      className="flex items-center gap-3 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E]/60"
      to="/"
    >
      <span className="flex size-10 items-center justify-center rounded-xl border border-[#2E7D32]/20 bg-[#E4F5E5] text-[#1F7A3A] shadow-lg shadow-black/10 dark:border-[#86EFAC]/40 dark:bg-[#14532D]/70 dark:text-[#BBF7D0] dark:shadow-black/20">
        <Mountain aria-hidden="true" className="size-6" />
      </span>
      <span className="leading-none">
        <span className="block text-sm font-black uppercase tracking-wide text-[#0B1511] dark:text-white">
          Trail
        </span>
        <span className="block text-sm font-black uppercase tracking-wide text-[#1F7A3A] dark:text-[#65D46E]">
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
        className="h-10 max-w-64 border-black/10 bg-white/70 px-3 text-[#0B1511] hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
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
          className="absolute right-0 mt-3 w-72 rounded-xl border border-black/10 bg-white p-3 text-[#0B1511] shadow-2xl shadow-black/15 dark:border-white/10 dark:bg-[#071511] dark:text-white dark:shadow-black/35"
          role="menu"
        >
          <div className="mb-3 border-b border-black/10 px-2 pb-3 dark:border-white/10">
            <p className="truncate text-sm font-bold">{displayName}</p>
            <p className="mt-1 truncate text-xs text-[#56655D] dark:text-white/60">
              {session.user.email}
            </p>
          </div>
          <LogoutButton />
        </div>
      ) : null}
    </div>
  );
}

function NotificationIndicator() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const label =
    unreadCount > 0
      ? `${unreadCount} unread notifications`
      : "Notifications";
  const recentNotifications = notifications.slice(0, 5);

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

  const handleMarkAsRead = (notificationId: string) => {
    void markAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    void markAllAsRead();
  };

  return (
    <div className="relative" ref={menuRef}>
      <Button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={label}
        className="relative size-10 border-black/10 bg-white/70 p-0 text-[#0B1511] hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
        size="icon"
        type="button"
        variant="outline"
        onClick={() => setIsOpen((current) => !current)}
      >
        <Bell aria-hidden="true" className="size-5" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-[#EF4444] px-1.5 text-[11px] font-black leading-5 text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </Button>

      {isOpen ? (
        <NotificationMenu
          notifications={recentNotifications}
          unreadCount={unreadCount}
          onMarkAllAsRead={handleMarkAllAsRead}
          onMarkAsRead={handleMarkAsRead}
          onViewAll={() => setIsOpen(false)}
        />
      ) : null}
    </div>
  );
}

function formatNotificationDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function NotificationMenu({
  notifications,
  unreadCount,
  onMarkAllAsRead,
  onMarkAsRead,
  onViewAll,
}: {
  notifications: Notification[];
  unreadCount: number;
  onMarkAllAsRead: () => void;
  onMarkAsRead: (notificationId: string) => void;
  onViewAll: () => void;
}) {
  return (
    <div
      className="absolute right-0 mt-3 w-[min(calc(100vw-2rem),24rem)] rounded-xl border border-black/10 bg-white p-3 text-[#0B1511] shadow-2xl shadow-black/15 dark:border-white/10 dark:bg-[#071511] dark:text-white dark:shadow-black/35"
      role="menu"
    >
      <div className="flex items-start justify-between gap-3 border-b border-black/10 px-2 pb-3 dark:border-white/10">
        <div>
          <p className="text-sm font-black">Notifications</p>
          <p className="mt-1 text-xs text-[#56655D] dark:text-white/60">
            {unreadCount} unread
          </p>
        </div>
        <Button
          className="h-8 border-black/10 bg-black/5 px-2 text-xs text-[#0B1511] hover:bg-black/10 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          disabled={unreadCount === 0}
          type="button"
          variant="outline"
          onClick={onMarkAllAsRead}
        >
          <CheckCheck aria-hidden="true" className="size-3.5" />
          Mark all
        </Button>
      </div>

      {notifications.length === 0 ? (
        <div className="px-2 py-6 text-center text-sm text-[#56655D] dark:text-white/60">
          No notifications yet.
        </div>
      ) : (
        <ol className="max-h-80 overflow-y-auto py-2" aria-label="Recent notifications">
          {notifications.map((notification) => (
            <li
              className={`rounded-lg px-2 py-3 ${
                notification.isRead
                  ? "text-[#34463C] dark:text-white/75"
                  : "bg-[#10B981]/10 text-[#0B1511] dark:text-white"
              }`}
              key={notification.id}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`mt-1 size-2 rounded-full ${
                    notification.isRead ? "bg-transparent" : "bg-[#10B981]"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">
                    {notification.title}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#56655D] dark:text-white/60">
                    {notification.message}
                  </p>
                  <p className="mt-2 text-[11px] font-semibold uppercase text-[#6B7A72] dark:text-white/45">
                    {formatNotificationDate(notification.createdAt)}
                  </p>
                </div>
                {!notification.isRead ? (
                  <Button
                    aria-label={`Mark ${notification.title} as read`}
                    className="size-8 border-black/10 bg-white/60 text-[#0B1511] hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                    size="icon"
                    type="button"
                    variant="outline"
                    onClick={() => onMarkAsRead(notification.id)}
                  >
                    <CheckCircle2 aria-hidden="true" className="size-4" />
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      )}

      <Button
        asChild
        className="mt-2 h-10 w-full bg-[#43A047] font-bold text-white hover:bg-[#2E7D32]"
      >
        <Link to="/notifications" onClick={onViewAll}>
          View all notifications
        </Link>
      </Button>
    </div>
  );
}

function SiteHeader() {
  const session = useAuthStore((state) => state.session);
  const canManageUsers =
    session?.user.role === "Admin" || session?.user.role === "Moderator";
  const sessionNavigationItems = session
    ? canManageUsers
      ? [
          { label: "Dashboard", to: "/dashboard" },
          { label: "Trails", to: "/trails" },
          { label: "Check-ins", to: "/checkins" },
          { label: "Badges", to: "/badges" },
          { label: "Leaderboard", to: "/leaderboard" },
          { label: "Notifications", to: "/notifications" },
          { label: "Moderation", to: "/moderation/checkins" },
          { label: "Manage Users", to: "/admin/users" },
        ]
      : [
          { label: "Dashboard", to: "/dashboard" },
          { label: "Trails", to: "/trails" },
          { label: "Check-ins", to: "/checkins" },
          { label: "Badges", to: "/badges" },
          { label: "Leaderboard", to: "/leaderboard" },
          { label: "Notifications", to: "/notifications" },
        ]
    : [];
  const visibleNavigationItems = sessionNavigationItems;

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-[#F7F8F3]/88 text-[#0B1511] shadow-lg shadow-black/5 backdrop-blur-xl dark:border-white/10 dark:bg-[#061813]/85 dark:text-white dark:shadow-black/10">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {visibleNavigationItems.map((item) => (
            <NavLink
              className={({ isActive }) =>
                `rounded-lg text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#22C55E]/60 ${
                  isActive
                    ? "text-[#1F7A3A] dark:text-[#86EFAC]"
                    : "text-[#34463C] hover:text-[#0B1511] dark:text-white/85 dark:hover:text-white"
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
            <>
              <NotificationIndicator />
              <AccountMenu session={session} />
            </>
          ) : (
            <>
              <Button
                asChild
                className="h-10 border-[#2E7D32]/30 bg-white/70 px-5 text-[#1F7A3A] hover:bg-white dark:border-white/30 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
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
          {session ? <NotificationIndicator /> : null}
          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button
                aria-label="Open navigation menu"
                className="border-black/10 bg-white/70 text-[#0B1511] hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
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
                      className="rounded-lg px-3 py-3 text-base font-semibold text-[#34463C] transition hover:bg-black/5 hover:text-[#0B1511] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/60 dark:text-white/85 dark:hover:bg-white/10 dark:hover:text-white"
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
                    <div className="rounded-xl border border-black/10 bg-black/5 p-4 dark:border-white/10 dark:bg-white/5">
                      <div className="flex items-center gap-3">
                        <UserCircle
                          aria-hidden="true"
                          className="size-6 shrink-0 text-[#1F7A3A] dark:text-[#86EFAC]"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-[#0B1511] dark:text-white">
                            {session.user.displayName || session.user.email}
                          </p>
                          <p className="mt-1 truncate text-xs text-[#56655D] dark:text-white/60">
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
                        className="h-11 border-[#2E7D32]/30 bg-white text-[#1F7A3A] hover:bg-[#F7F8F3] dark:border-white/30 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
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
