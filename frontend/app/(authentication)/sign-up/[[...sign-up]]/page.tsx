"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSignUp } from "@clerk/nextjs/legacy";
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

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputClass =
    "h-12 border border-black/10 bg-black/[0.03] text-black placeholder:text-black/40 focus-visible:ring-1 focus-visible:ring-black/20 focus-visible:ring-offset-0";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded) return;
    setError(null);
    setLoading(true);
    try {
      await signUp.create({
        firstName,
        lastName,
        username,
        emailAddress: email,
        password,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: unknown) {
      const message =
        typeof err === "object" &&
        err !== null &&
        "errors" in err &&
        Array.isArray((err as { errors?: Array<{ longMessage?: string }> }).errors)
          ? (err as { errors?: Array<{ longMessage?: string }> }).errors?.[0]?.longMessage
          : undefined;
      setError(message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded) return;
    setError(null);
    setLoading(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/");
      } else {
        console.log("missing fields:", result.missingFields, result.unverifiedFields);
        setError("Verification incomplete. Please try again.");
      }
    } catch (err: unknown) {
      const message =
        typeof err === "object" &&
        err !== null &&
        "errors" in err &&
        Array.isArray((err as { errors?: Array<{ longMessage?: string }> }).errors)
          ? (err as { errors?: Array<{ longMessage?: string }> }).errors?.[0]?.longMessage
          : undefined;
      setError(message ?? "Invalid code.");
    } finally {
      setLoading(false);
    }
  }

  function handleOAuth() {
    if (!isLoaded) return;
    signUp.authenticateWithRedirect({
      strategy: "oauth_google",
      redirectUrl: "/sso-callback",
      redirectUrlComplete: "/",
    });
  }

  if (pendingVerification) {
    return (
      <AuthShell>
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold text-black">
            Verify your email
          </h1>
          <p className="text-sm text-black/50">
            We sent a code to <span className="text-black/80">{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="mt-8 space-y-6">
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
              "Verify email"
            )}
          </Button>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold text-black">Create an account</h1>
        <p className="text-sm text-black/50">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="underline text-black/70 hover:text-black"
          >
            Log in
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div className="flex justify-between gap-3">
          <Input
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className={inputClass}
          />
          <Input
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className={inputClass}
          />
        </div>

        <Input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className={inputClass}
        />

        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={inputClass}
        />

        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
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
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Create account"
          )}
        </Button>

        <div className="flex items-center gap-3 py-1">
          <div className="h-px flex-1 bg-black/10" />
          <span className="text-xs text-black/40">Or register with</span>
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
      </form>
    </AuthShell>
  );
}