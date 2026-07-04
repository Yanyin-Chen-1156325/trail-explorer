import { type FormEvent, useMemo, useState } from "react";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  Mountain,
  ShieldCheck,
  Trophy,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { GoogleLoginButton } from "../components/GoogleLoginButton";
import { useAuthStore } from "../store/authStore";

interface RegisterFormValues {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

type RegisterFormErrors = Partial<Record<keyof RegisterFormValues, string>>;

const initialFormValues: RegisterFormValues = {
  displayName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const passwordRequirements = [
  {
    label: "8-128 characters",
    isMet: (password: string) => password.length >= 8 && password.length <= 128,
  },
  {
    label: "Uppercase letter",
    isMet: (password: string) => /[A-Z]/.test(password),
  },
  {
    label: "Lowercase letter",
    isMet: (password: string) => /[a-z]/.test(password),
  },
  {
    label: "Number",
    isMet: (password: string) => /[0-9]/.test(password),
  },
];

function validateForm(values: RegisterFormValues): RegisterFormErrors {
  const errors: RegisterFormErrors = {};
  const displayName = values.displayName.trim();
  const email = values.email.trim();

  if (!displayName) {
    errors.displayName = "Display name is required.";
  } else if (displayName.length > 256) {
    errors.displayName = "Display name must not exceed 256 characters.";
  }

  if (!email) {
    errors.email = "Email is required.";
  } else if (!emailPattern.test(email)) {
    errors.email = "Enter a valid email address.";
  } else if (email.length > 256) {
    errors.email = "Email must not exceed 256 characters.";
  }

  if (!values.password) {
    errors.password = "Password is required.";
  } else {
    const failedRequirement = passwordRequirements.find(
      (requirement) => !requirement.isMet(values.password),
    );

    if (failedRequirement) {
      errors.password = "Password must meet all requirements.";
    }
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Confirm your password.";
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

function RegisterPage() {
  const register = useAuthStore((state) => state.register);
  const clearError = useAuthStore((state) => state.clearError);
  const session = useAuthStore((state) => state.session);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);

  const [formValues, setFormValues] =
    useState<RegisterFormValues>(initialFormValues);
  const [formErrors, setFormErrors] = useState<RegisterFormErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  const requirementStatus = useMemo(
    () =>
      passwordRequirements.map((requirement) => ({
        ...requirement,
        met: requirement.isMet(formValues.password),
      })),
    [formValues.password],
  );

  const updateField = <K extends keyof RegisterFormValues>(
    fieldName: K,
    value: RegisterFormValues[K],
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
      await register({
        displayName: formValues.displayName.trim(),
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
      <div className="mx-auto grid min-h-screen w-full max-w-7xl gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-10">
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
                <p className="text-sm text-[#94A3B8]">Member onboarding</p>
              </div>
            </div>

            <div className="max-w-xl space-y-4">
              <h1 className="text-4xl font-semibold sm:text-5xl">
                Create your account and start building trail progress.
              </h1>
              <p className="text-base leading-7 text-[#94A3B8] sm:text-lg">
                Save completed hikes, build XP, and keep every achievement tied
                to a secure profile from day one.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <div className="rounded-lg border border-white/10 bg-white/3 p-4">
              <ShieldCheck aria-hidden="true" className="mb-3 size-5 text-[#10B981]" />
              <p className="text-sm font-medium text-[#F8FAFC]">Secure auth</p>
              <p className="mt-1 text-sm text-[#94A3B8]">JWT session ready</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/3 p-4">
              <Trophy aria-hidden="true" className="mb-3 size-5 text-[#F59E0B]" />
              <p className="text-sm font-medium text-[#F8FAFC]">XP profile</p>
              <p className="mt-1 text-sm text-[#94A3B8]">Prepared for rewards</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/3 p-4">
              <CheckCircle2 aria-hidden="true" className="mb-3 size-5 text-[#8B5CF6]" />
              <p className="text-sm font-medium text-[#F8FAFC]">Trail history</p>
              <p className="mt-1 text-sm text-[#94A3B8]">Progress stays saved</p>
            </div>
          </div>
        </section>

        <section className="flex items-center">
          <div className="w-full rounded-lg border border-white/10 bg-[#1E293B] p-5 shadow-2xl shadow-black/25 sm:p-8 lg:p-10">
            {session ? (
              <div className="space-y-5 rounded-lg border border-[#10B981]/30 bg-[#10B981]/10 p-6 text-[#F8FAFC]">
                <CheckCircle2 aria-hidden="true" className="size-10 text-[#10B981]" />
                <div>
                  <h2 className="text-2xl font-semibold">
                    Welcome, {session.user.displayName}.
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#94A3B8]">
                    Your Trail Explorer account is active for {session.user.email}.
                  </p>
                </div>
              </div>
            ) : (
              <form className="space-y-6" noValidate onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-[#10B981]">Register</p>
                  <h2 className="text-3xl font-semibold">Create account</h2>
                  <p className="text-sm leading-6 text-[#94A3B8]">
                    Use the same requirements enforced by the backend register API.
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

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 sm:col-span-2">
                    <span className="text-sm font-medium text-[#F8FAFC]">
                      Display name
                    </span>
                    <input
                      aria-describedby={
                        formErrors.displayName ? "display-name-error" : undefined
                      }
                      aria-invalid={Boolean(formErrors.displayName)}
                      autoComplete="name"
                      className="h-12 w-full rounded-lg border border-white/10 bg-[#0F172A] px-4 text-[#F8FAFC] outline-none transition placeholder:text-[#94A3B8]/70 focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/30"
                      name="displayName"
                      placeholder="Alex Walker"
                      value={formValues.displayName}
                      onChange={(event) =>
                        updateField("displayName", event.target.value)
                      }
                    />
                    {formErrors.displayName ? (
                      <p id="display-name-error" className="text-sm text-[#EF4444]">
                        {formErrors.displayName}
                      </p>
                    ) : null}
                  </label>

                  <label className="space-y-2 sm:col-span-2">
                    <span className="text-sm font-medium text-[#F8FAFC]">Email</span>
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

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-[#F8FAFC]">
                      Password
                    </span>
                    <div className="relative">
                      <input
                        aria-describedby={
                          formErrors.password ? "password-error" : "password-help"
                        }
                        aria-invalid={Boolean(formErrors.password)}
                        autoComplete="new-password"
                        className="h-12 w-full rounded-lg border border-white/10 bg-[#0F172A] px-4 pr-12 text-[#F8FAFC] outline-none transition placeholder:text-[#94A3B8]/70 focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/30"
                        name="password"
                        placeholder="Create password"
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

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-[#F8FAFC]">
                      Confirm password
                    </span>
                    <input
                      aria-describedby={
                        formErrors.confirmPassword
                          ? "confirm-password-error"
                          : undefined
                      }
                      aria-invalid={Boolean(formErrors.confirmPassword)}
                      autoComplete="new-password"
                      className="h-12 w-full rounded-lg border border-white/10 bg-[#0F172A] px-4 text-[#F8FAFC] outline-none transition placeholder:text-[#94A3B8]/70 focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/30"
                      name="confirmPassword"
                      placeholder="Repeat password"
                      type={showPassword ? "text" : "password"}
                      value={formValues.confirmPassword}
                      onChange={(event) =>
                        updateField("confirmPassword", event.target.value)
                      }
                    />
                    {formErrors.confirmPassword ? (
                      <p id="confirm-password-error" className="text-sm text-[#EF4444]">
                        {formErrors.confirmPassword}
                      </p>
                    ) : null}
                  </label>
                </div>

                <div
                  id="password-help"
                  className="grid gap-2 rounded-lg border border-white/10 bg-[#0F172A]/70 p-4 sm:grid-cols-2"
                >
                  {requirementStatus.map((requirement) => (
                    <div
                      className="flex items-center gap-2 text-sm text-[#94A3B8]"
                      key={requirement.label}
                    >
                      <CheckCircle2
                        aria-hidden="true"
                        className={
                          requirement.met
                            ? "size-4 text-[#10B981]"
                            : "size-4 text-[#94A3B8]/40"
                        }
                      />
                      <span>{requirement.label}</span>
                    </div>
                  ))}
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
                      Creating account
                    </>
                  ) : (
                    "Create account"
                  )}
                </Button>
              </form>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export { RegisterPage };
