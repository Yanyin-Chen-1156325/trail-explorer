import { LogOut, LoaderCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";

import { useAuthStore } from "../store/authStore";

function LogoutButton() {
  const logout = useAuthStore((state) => state.logout);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch {
      // The auth store exposes a user-facing error message.
    }
  };

  return (
    <div className="space-y-2">
      <Button
        className="h-10 rounded-lg border border-white/10 bg-[#0F172A] px-4 text-sm font-semibold text-[#F8FAFC] hover:bg-white/10"
        disabled={isLoading}
        onClick={handleLogout}
        type="button"
        variant="outline"
      >
        {isLoading ? (
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
        ) : (
          <LogOut aria-hidden="true" className="size-4" />
        )}
        {isLoading ? "Signing out" : "Logout"}
      </Button>
      {error ? <p className="text-sm text-[#EF4444]">{error}</p> : null}
    </div>
  );
}

export { LogoutButton };
