import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mountain,
  Trophy,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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
    <main className="bg-[#F7F8F3] px-4 py-12 text-[#0B1511] dark:bg-[#071511] dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[0.92fr_1.08fr]">
        <section className="flex items-center">
          <Card className="w-full border-black/5 bg-white shadow-xl shadow-black/8 dark:border-white/10 dark:bg-[#10221A]">
            <CardContent className="p-5 sm:p-8 lg:p-10">
            {session ? (
              <div className="space-y-5 rounded-xl border border-[#10B981]/30 bg-[#10B981]/10 p-6">
                <CheckCircle2
                  aria-hidden="true"
                  className="size-10 text-[#10B981]"
                />
                <div>
                  <h1 className="text-2xl font-semibold">
                    Welcome back, {session.user.displayName}.
                  </h1>
                  <p className="mt-2 text-sm leading-6 text-[#56655D] dark:text-white/65">
                    You are signed in as {session.user.email}.
                  </p>
                </div>
              </div>
            ) : (
              <form className="space-y-6" noValidate onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <p className="text-sm font-bold text-[#2E7D32] dark:text-[#86EFAC]">
                    Login
                  </p>
                  <h1 className="text-3xl font-black">Welcome back</h1>
                  <p className="text-sm leading-6 text-[#56655D] dark:text-white/65">
                    Sign in to continue tracking hikes, XP, and achievements.
                  </p>
                </div>

                <GoogleLoginButton />

                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
                  <span className="text-xs font-bold uppercase text-[#56655D] dark:text-white/55">
                    or use email
                  </span>
                  <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
                </div>

                <div className="space-y-4">
                  <label className="block space-y-2">
                    <span className="text-sm font-bold">
                      Email
                    </span>
                    <Input
                      aria-describedby={formErrors.email ? "email-error" : undefined}
                      aria-invalid={Boolean(formErrors.email)}
                      autoComplete="email"
                      className="h-12 border-black/10 bg-[#F7F8F3] focus-visible:border-[#2E7D32] focus-visible:ring-[#2E7D32]/25 dark:border-white/10 dark:bg-[#071511]"
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
                    <span className="text-sm font-bold">
                      Password
                    </span>
                    <div className="relative">
                      <Input
                        aria-describedby={
                          formErrors.password ? "password-error" : undefined
                        }
                        aria-invalid={Boolean(formErrors.password)}
                        autoComplete="current-password"
                        className="h-12 border-black/10 bg-[#F7F8F3] pr-12 focus-visible:border-[#2E7D32] focus-visible:ring-[#2E7D32]/25 dark:border-white/10 dark:bg-[#071511]"
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
                        className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#56655D] transition hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/40 dark:text-white/60 dark:hover:bg-white/10"
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
                  className="h-12 w-full rounded-lg bg-[#43A047] text-base font-bold text-white hover:bg-[#2E7D32]"
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

                <p className="text-center text-sm text-[#56655D] dark:text-white/65">
                  New to Trail Explorer?{" "}
                  <Link className="font-bold text-[#0B6B2B] dark:text-[#86EFAC]" to="/register">
                    Create an account
                  </Link>
                </p>
              </form>
            )}
            </CardContent>
          </Card>
        </section>

        <section className="flex flex-col justify-between rounded-xl border border-white/10 bg-[#061813] p-6 text-white shadow-2xl shadow-black/20 sm:p-8 lg:p-10">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-[#10B981]/15 text-[#86EFAC]">
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
              <h2 className="text-4xl font-black sm:text-5xl">
                Pick up where your last trail ended.
              </h2>
              <p className="text-base leading-7 text-[#94A3B8] sm:text-lg">
                Your account keeps trail history, XP progress, and future badge
                rewards connected across every session.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <Trophy
                aria-hidden="true"
                className="mb-3 size-5 text-[#F59E0B]"
              />
              <p className="text-sm font-medium">XP retained</p>
              <p className="mt-1 text-sm text-[#94A3B8]">History retained</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <LockKeyhole
                aria-hidden="true"
                className="mb-3 size-5 text-[#86EFAC]"
              />
              <p className="text-sm font-medium">Secure session</p>
              <p className="mt-1 text-sm text-[#94A3B8]">Refresh ready</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <Mountain aria-hidden="true" className="mb-3 size-5 text-[#65D46E]" />
              <p className="text-sm font-medium">Explore next</p>
              <p className="mt-1 text-sm text-[#94A3B8]">Dashboard ready</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export { LoginPage };
