import type { Metadata, Viewport } from "next";
import { Outfit, Work_Sans } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import { LocaleProvider } from "@/lib/i18n/provider";
import { ThemeScript } from "@/components/theme-script";
import { ServiceWorker } from "@/components/service-worker";
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
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Albert Maths",
    description: "Hints before answers. Always.",
    images: ["/og.png"],
  },
  robots: { index: true, follow: true },
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1226" },
  ],
};

const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "LearningResource",
  name: "Albert Maths",
  description:
    "A guided maths tutor that locates the step where a student's reasoning broke, instead of handing over the answer.",
  url: "https://albert-maths.pages.dev",
  inLanguage: ["en", "fr"],
  isAccessibleForFree: true,
  learningResourceType: "Tutoring service",
  educationalLevel: "Undergraduate",
  teaches: [
    "Algebra",
    "Analysis",
    "Probability",
    "Statistics",
    "Matrix decomposition",
  ],
  audience: {
    "@type": "EducationalAudience",
    educationalRole: "student",
  },
} as const;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${outfit.variable} ${workSans.variable} h-full`}
    >
      <head>
        <ThemeScript />
        <script
          type="application/ld+json"
          // A learning tool, described as one: the structured data says what it
          // teaches and who for, not just that a website exists.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
        />
      </head>
      <body className="noise flex min-h-full flex-col bg-bg text-text">
        <ServiceWorker />
        <AuthProvider>
          <LocaleProvider>{children}</LocaleProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
