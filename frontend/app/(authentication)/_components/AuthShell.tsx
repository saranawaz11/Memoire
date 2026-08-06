// // components/auth/AuthShell.tsx
// import type { ReactNode } from "react";
// import { AuthIllustration } from "./AuthIllustration";

// export function AuthShell({ children }: { children: ReactNode }) {
//   return (
//     <div className="flex h-screen justify-center overflow-y-auto bg-[#FAF7EF]">
//       <div className="w-1/2">
//         <AuthIllustration />
//       </div>
//       <div className="flex w-1/2 flex-col justify-center">
//         <div className="mx-auto w-full max-w-sm">{children}</div>
//       </div>
//     </div>
//   );
// }


// app/(authentication)/_components/AuthShell.tsx
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuthIllustration } from "./AuthIllustration";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen justify-center overflow-y-auto bg-[#FAF7EF]">
      <div className="w-1/2">
        <AuthIllustration />
      </div>
      <div className="relative flex w-1/2 flex-col justify-center">
        <Link
          href="/"
          className="absolute top-6 left-26 flex items-center gap-1.5 text-xs text-black/50 hover:text-black/75 transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to home
        </Link>
        <div className="mx-auto w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}