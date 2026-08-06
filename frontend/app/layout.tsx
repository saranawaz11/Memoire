import type { Metadata } from "next";
import {
  Playfair_Display,
  Source_Serif_4,
  Work_Sans,
} from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";

import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mémoire",
  description: "An old-English inspired notes application.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${sourceSerif.variable} ${workSans.variable} h-full antialiased`}
    >
      <body className="h-full flex flex-col overflow-hidden">
        <ClerkProvider>
          <Toaster position="bottom-right" richColors />
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}