"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs/legacy";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { AuthShell } from "@/app/(authentication)/_components/AuthShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import GoogleIcon from "@/lib/auth-helpers";


type Mode = "password" | "email" | "verify-otp";

export default function SignInPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("password");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputClass =
    "h-12 border border-black/10 bg-black/[0.03] text-black placeholder:text-black/40 focus-visible:ring-1 focus-visible:ring-black/20 focus-visible:ring-offset-0";

  //Username + password sign-in
  async function handlePasswordSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded) return;
    setError(null);
    setLoading(true);
    try {
      const result = await signIn.create({
        identifier: username,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/");
      } else {
        setError("Unable to sign in. Please check your details.");
      }
    } catch (err: unknown) {
      if (err && typeof err === "object" && "errors" in err) {
        const clerkError = err as { errors?: { longMessage?: string }[] };
        setError(
          clerkError.errors?.[0]?.longMessage ?? "Invalid username or password.",
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  }

  // Email + OTP: step 1, send code
  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded) return;
    setError(null);
    setLoading(true);
    try {
      const result = await signIn.create({ identifier: email });

      const emailFactor = result.supportedFirstFactors?.find(
        (factor: { strategy?: string; emailAddressId?: string }) =>
          factor.strategy === "email_code",
      );
      console.log("emailFactor:", emailFactor);

      if (!emailFactor) {
        setError("No account found with that email.");
        setLoading(false);
        return;
      }

      await signIn.prepareFirstFactor({
        strategy: "email_code",
        emailAddressId: (emailFactor as { emailAddressId: string }).emailAddressId,
      });

      setMode("verify-otp");
    } catch (err: unknown) {
      if (err && typeof err === "object" && "errors" in err) {
        const clerkError = err as { errors?: { longMessage?: string }[] };
        setError(
          clerkError.errors?.[0]?.longMessage ?? "No account found with that email.",
        );
      } else {
        setError("No account found with that email.");
      }
    } finally {
      setLoading(false);
    }
  }

  //Email + OTP: step 2, verify code
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded) return;
    setError(null);
    setLoading(true);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "email_code",
        code,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/");
      } else {
        setError("Invalid code. Please try again.");
      }
    } catch (err: unknown) {
      if (err && typeof err === "object" && "errors" in err) {
        const clerkError = err as { errors?: { longMessage?: string }[] };
        setError(clerkError.errors?.[0]?.longMessage ?? "Invalid code.");
      } else {
        setError("Invalid code.");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleOAuth() {
    if (!isLoaded) return;
    signIn.authenticateWithRedirect({
      strategy: "oauth_google",
      redirectUrl: "/sso-callback",
      redirectUrlComplete: "/",
    });
  }

  //OTP verification screen
  if (mode === "verify-otp") {
    return (
      <AuthShell>
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold text-black">Enter your code</h1>
          <p className="text-sm text-black/50">
            We sent a code to <span className="text-black/80">{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerifyOtp} className="mt-8 space-y-6">
          <InputOTP maxLength={6} value={code} onChange={setCode}>
            <InputOTPGroup className="w-full justify-between gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <InputOTPSlot
                  key={i}
                  index={i}
                  className="h-12 w-12 rounded-md border border-black/15 first:rounded-md last:rounded-md"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-green-800 hover:bg-green-700 shadow-none text-white"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Verify code"
            )}
          </Button>

          <button
            type="button"
            onClick={() => {
              setMode("email");
              setError(null);
              setCode("");
            }}
            className="w-full text-sm text-black/50 underline hover:text-black"
          >
            Use a different email
          </button>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold text-black">
          Log in to your account
        </h1>
        <p className="text-sm text-black/50">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="underline text-black/70 hover:text-black"
          >
            Sign up
          </Link>
        </p>
      </div>

      {mode === "password" ? (
        <form onSubmit={handlePasswordSignIn} className="mt-8 space-y-4">
          <Input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className={inputClass}
          />

          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`${inputClass} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/70"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div
            id="clerk-captcha"
            className="empty:hidden rounded-md border border-black/10 bg-black/[0.02] p-3"
          />

          <Button
            type="submit"
            disabled={loading || !isLoaded}
            className="w-full h-12 bg-green-800 hover:bg-green-700 text-white font-medium shadow-none"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Log in"}
          </Button>

          <button
            type="button"
            onClick={() => {
              setMode("email");
              setError(null);
            }}
            className="w-full text-sm text-black/50 underline hover:text-black"
          >
            Sign in with email code instead
          </button>
        </form>
      ) : (
        <form onSubmit={handleSendOtp} className="mt-8 space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={inputClass}
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button
            type="submit"
            disabled={loading || !isLoaded}
            className="w-full h-12 bg-green-800 hover:bg-green-700 text-white font-medium shadow-none"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Send code"
            )}
          </Button>

          <button
            type="button"
            onClick={() => {
              setMode("password");
              setError(null);
            }}
            className="w-full text-sm text-black/50 underline hover:text-black"
          >
            Sign in with username and password instead
          </button>
        </form>
      )}

      <div className="flex items-center gap-3 py-4">
        <div className="h-px flex-1 bg-black/10" />
        <span className="text-xs text-black/40">Or continue with</span>
        <div className="h-px flex-1 bg-black/10" />
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={handleOAuth}
        className="w-full h-12 border-black/15 text-black hover:bg-black/5 shadow-none"
      >
        <GoogleIcon />
        <span className="ml-2">Continue with Google</span>
      </Button>
    </AuthShell>
  );
}
