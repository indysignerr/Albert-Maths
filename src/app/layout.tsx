import type { Metadata, Viewport } from "next";
import { Outfit, Work_Sans } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeScript } from "@/components/theme-script";
import "./globals.css";

/**
 * albertschool.com sets body copy in Work Sans (open licence, reused as-is) and
 * headings in "At Textual", a proprietary face we cannot redistribute. Outfit is
 * the closest open substitute for that airy geometric display voice.
 */
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
  display: "swap",
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://albert-maths.pages.dev"),
  title: {
    default: "Albert Maths — understand your mistakes, not just the answer",
    template: "%s · Albert Maths",
  },
  description:
    "Photograph a maths problem, work through it with guided hints, and find out exactly where your reasoning broke. Built for Albert School students.",
  applicationName: "Albert Maths",
  openGraph: {
    type: "website",
    siteName: "Albert Maths",
    title: "Albert Maths",
    description:
      "Guided maths practice for Albert School students. Hints before answers, always.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1226" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${outfit.variable} ${workSans.variable} h-full`}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="noise flex min-h-full flex-col bg-bg text-text">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
