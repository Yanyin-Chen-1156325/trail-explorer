import { type FormEvent, useState } from "react";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Map,
  Mountain,
  Route,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { GoogleLoginButton } from "../components/GoogleLoginButton";
import { useAuthStore } from "../store/authStore";

interface LoginFormValues {
  email: string;
  password: string;
}

type LoginFormErrors = Partial<Record<keyof LoginFormValues, string>>;

const initialFormValues: LoginFormValues = {
  email: "",
  password: "",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateForm(values: LoginFormValues): LoginFormErrors {
  const errors: LoginFormErrors = {};
  const email = values.email.trim();

  if (!email) {
    errors.email = "Email is required.";
  } else if (!emailPattern.test(email)) {
    errors.email = "Enter a valid email address.";
  } else if (email.length > 256) {
    errors.email = "Email must not exceed 256 characters.";
  }

  if (!values.password) {
    errors.password = "Password is required.";
  } else if (values.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  } else if (values.password.length > 128) {
    errors.password = "Password must not exceed 128 characters.";
  }

  return errors;
}

function LoginPage() {
  const login = useAuthStore((state) => state.login);
  const clearError = useAuthStore((state) => state.clearError);
  const session = useAuthStore((state) => state.session);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);

  const [formValues, setFormValues] =
    useState<LoginFormValues>(initialFormValues);
  const [formErrors, setFormErrors] = useState<LoginFormErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  const updateField = <K extends keyof LoginFormValues>(
    fieldName: K,
    value: LoginFormValues[K],
  ) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [fieldName]: value,
    }));

    setFormErrors((currentErrors) => ({
      ...currentErrors,
      [fieldName]: undefined,
    }));

    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateForm(formValues);
    setFormErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      await login({
        email: formValues.email.trim(),
        password: formValues.password,
      });
      setFormValues(initialFormValues);
    } catch {
      // The store exposes a user-facing error message.
    }
  };

  return (
    <main className="min-h-screen bg-[#0F172A] text-[#F8FAFC]">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-10">
        <section className="flex items-center">
          <div className="w-full rounded-lg border border-white/10 bg-[#1E293B] p-5 shadow-2xl shadow-black/25 sm:p-8 lg:p-10">
            {session ? (
              <div className="space-y-5 rounded-lg border border-[#10B981]/30 bg-[#10B981]/10 p-6 text-[#F8FAFC]">
                <CheckCircle2
                  aria-hidden="true"
                  className="size-10 text-[#10B981]"
                />
                <div>
                  <h1 className="text-2xl font-semibold">
                    Welcome back, {session.user.displayName}.
                  </h1>
                  <p className="mt-2 text-sm leading-6 text-[#94A3B8]">
                    You are signed in as {session.user.email}.
                  </p>
                </div>
              </div>
            ) : (
              <form className="space-y-6" noValidate onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-[#10B981]">Login</p>
                  <h1 className="text-3xl font-semibold">Welcome back</h1>
                  <p className="text-sm leading-6 text-[#94A3B8]">
                    Sign in to continue tracking hikes, XP, and achievements.
                  </p>
                </div>

                <GoogleLoginButton />

                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-xs font-medium uppercase text-[#94A3B8]">
                    or use email
                  </span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <div className="space-y-4">
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-[#F8FAFC]">
                      Email
                    </span>
                    <input
                      aria-describedby={formErrors.email ? "email-error" : undefined}
                      aria-invalid={Boolean(formErrors.email)}
                      autoComplete="email"
                      className="h-12 w-full rounded-lg border border-white/10 bg-[#0F172A] px-4 text-[#F8FAFC] outline-none transition placeholder:text-[#94A3B8]/70 focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/30"
                      name="email"
                      placeholder="you@example.com"
                      type="email"
                      value={formValues.email}
                      onChange={(event) => updateField("email", event.target.value)}
                    />
                    {formErrors.email ? (
                      <p id="email-error" className="text-sm text-[#EF4444]">
                        {formErrors.email}
                      </p>
                    ) : null}
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-[#F8FAFC]">
                      Password
                    </span>
                    <div className="relative">
                      <input
                        aria-describedby={
                          formErrors.password ? "password-error" : undefined
                        }
                        aria-invalid={Boolean(formErrors.password)}
                        autoComplete="current-password"
                        className="h-12 w-full rounded-lg border border-white/10 bg-[#0F172A] px-4 pr-12 text-[#F8FAFC] outline-none transition placeholder:text-[#94A3B8]/70 focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/30"
                        name="password"
                        placeholder="Enter your password"
                        type={showPassword ? "text" : "password"}
                        value={formValues.password}
                        onChange={(event) =>
                          updateField("password", event.target.value)
                        }
                      />
                      <button
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#94A3B8] transition hover:bg-white/10 hover:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#10B981]/40"
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                      >
                        {showPassword ? (
                          <EyeOff aria-hidden="true" className="size-4" />
                        ) : (
                          <Eye aria-hidden="true" className="size-4" />
                        )}
                      </button>
                    </div>
                    {formErrors.password ? (
                      <p id="password-error" className="text-sm text-[#EF4444]">
                        {formErrors.password}
                      </p>
                    ) : null}
                  </label>
                </div>

                {error ? (
                  <p className="rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 px-4 py-3 text-sm text-red-100">
                    {error}
                  </p>
                ) : null}

                <Button
                  className="h-12 w-full rounded-lg bg-[#10B981] text-base font-semibold text-[#052E2B] hover:bg-[#22C55E]"
                  disabled={isLoading}
                  type="submit"
                >
                  {isLoading ? (
                    <>
                      <LoaderCircle
                        aria-hidden="true"
                        className="size-4 animate-spin"
                      />
                      Signing in
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>

                <p className="text-center text-sm text-[#94A3B8]">
                  New to Trail Explorer?{" "}
                  <span className="font-medium text-[#F8FAFC]">
                    Register page is ready.
                  </span>
                </p>
              </form>
            )}
          </div>
        </section>

        <section className="flex flex-col justify-between rounded-lg border border-white/10 bg-[#1E293B] p-6 shadow-2xl shadow-black/25 sm:p-8 lg:p-10">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-lg bg-[#10B981]/15 text-[#10B981]">
                <Mountain aria-hidden="true" className="size-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#F8FAFC]">
                  Trail Explorer
                </p>
                <p className="text-sm text-[#94A3B8]">Progress checkpoint</p>
              </div>
            </div>

            <div className="max-w-xl space-y-4">
              <h2 className="text-4xl font-semibold sm:text-5xl">
                Pick up where your last trail ended.
              </h2>
              <p className="text-base leading-7 text-[#94A3B8] sm:text-lg">
                Your account keeps trail history, XP progress, and future badge
                rewards connected across every session.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <div className="rounded-lg border border-white/10 bg-white/3 p-4">
              <Route
                aria-hidden="true"
                className="mb-3 size-5 text-[#10B981]"
              />
              <p className="text-sm font-medium text-[#F8FAFC]">Resume trails</p>
              <p className="mt-1 text-sm text-[#94A3B8]">History retained</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/3 p-4">
              <LockKeyhole
                aria-hidden="true"
                className="mb-3 size-5 text-[#F59E0B]"
              />
              <p className="text-sm font-medium text-[#F8FAFC]">Secure session</p>
              <p className="mt-1 text-sm text-[#94A3B8]">Refresh ready</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/3 p-4">
              <Map aria-hidden="true" className="mb-3 size-5 text-[#8B5CF6]" />
              <p className="text-sm font-medium text-[#F8FAFC]">Explore next</p>
              <p className="mt-1 text-sm text-[#94A3B8]">Dashboard prepared</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export { LoginPage };
