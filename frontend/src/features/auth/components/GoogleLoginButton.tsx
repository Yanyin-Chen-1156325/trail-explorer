import { useEffect, useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useAuthStore } from "../store/authStore";

interface GoogleCredentialResponse {
  credential?: string;
}

interface GoogleButtonOptions {
  theme: "outline" | "filled_blue" | "filled_black";
  size: "large" | "medium" | "small";
  shape: "rectangular" | "pill" | "circle" | "square";
  text: "signin_with" | "signup_with" | "continue_with" | "signin";
  width?: string;
}

interface GoogleAccountsId {
  initialize: (options: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }) => void;
  renderButton: (parent: HTMLElement, options: GoogleButtonOptions) => void;
  cancel: () => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleAccountsId;
      };
    };
  }
}

const googleScriptId = "google-identity-services";
const googleScriptUrl = "https://accounts.google.com/gsi/client";

let googleScriptPromise: Promise<void> | null = null;

function loadGoogleIdentityScript(): Promise<void> {
  if (window.google?.accounts.id) {
    return Promise.resolve();
  }

  if (googleScriptPromise) {
    return googleScriptPromise;
  }

  googleScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(googleScriptId);

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Google sign-in could not be loaded.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.id = googleScriptId;
    script.src = googleScriptUrl;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Google sign-in could not be loaded."));

    document.head.appendChild(script);
  });

  return googleScriptPromise;
}

function GoogleLoginButton() {
  const googleOAuth = useAuthStore((state) => state.googleOAuth);
  const clearError = useAuthStore((state) => state.clearError);
  const isLoading = useAuthStore((state) => state.isLoading);
  const authError = useAuthStore((state) => state.error);

  const buttonContainerRef = useRef<HTMLDivElement | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isScriptReady, setIsScriptReady] = useState(false);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const configError = clientId ? null : "Google sign-in is not configured.";
  const statusMessage = configError || localError || authError;

  useEffect(() => {
    let isActive = true;

    if (!clientId) {
      return () => {
        isActive = false;
      };
    }

    loadGoogleIdentityScript()
      .then(() => {
        if (!isActive || !window.google?.accounts.id) {
          return;
        }

        setIsScriptReady(true);
        buttonContainerRef.current?.replaceChildren();

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            if (!response.credential) {
              setLocalError("Google did not return a sign-in credential.");
              return;
            }

            try {
              setLocalError(null);
              clearError();
              await googleOAuth({ idToken: response.credential });
            } catch {
              // The auth store exposes the API error for this component.
            }
          },
        });

        if (buttonContainerRef.current) {
          const buttonWidth = Math.floor(
            buttonContainerRef.current.getBoundingClientRect().width,
          );

          window.google.accounts.id.renderButton(buttonContainerRef.current, {
            theme: "outline",
            size: "large",
            shape: "rectangular",
            text: "continue_with",
            width: String(buttonWidth),
          });
        }
      })
      .catch((error: unknown) => {
        if (!isActive) {
          return;
        }

        setLocalError(
          error instanceof Error
            ? error.message
            : "Google sign-in could not be loaded.",
        );
      });

    return () => {
      isActive = false;
      window.google?.accounts.id.cancel();
    };
  }, [clearError, clientId, googleOAuth]);

  if (configError || localError) {
    return (
      <div className="space-y-2">
        <Button
          className="h-12 w-full rounded-lg border border-white/10 bg-[#0F172A] text-base font-semibold text-[#94A3B8]"
          disabled
          type="button"
          variant="outline"
        >
          Continue with Google
        </Button>
        {statusMessage ? (
          <p className="text-sm text-[#EF4444]">{statusMessage}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative min-h-12 w-full overflow-hidden rounded-lg bg-transparent">
        <div
          aria-busy={!isScriptReady || isLoading}
          className="flex min-h-12 w-full items-center justify-center"
          ref={buttonContainerRef}
        />
        {!isScriptReady ? (
          <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-[#0F172A] text-sm text-[#94A3B8]">
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            Loading Google sign-in
          </div>
        ) : null}
      </div>
      {statusMessage ? (
        <p className="text-sm text-[#EF4444]">{statusMessage}</p>
      ) : null}
    </div>
  );
}

export { GoogleLoginButton };
