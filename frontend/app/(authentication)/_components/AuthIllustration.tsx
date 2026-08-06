// components/auth/AuthIllustration.tsx
import Image from "next/image";
import illustration from "@/public/SignIn.jpg";
export function AuthIllustration() {
  return (
    <div className="relative hidden h-full w-full overflow-hidden lg:block">
      <Image
        src={illustration}
        alt="Authentication Illustration"
        fill
        className="object-cover"
        priority
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
    </div>
  );
}
