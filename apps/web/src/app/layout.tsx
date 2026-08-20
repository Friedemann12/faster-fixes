import { APP_URL } from "@/app/_constants/app";
import { SITE_META_DESCRIPTION, SITE_NAME } from "@/app/_constants/seo";
import { TRPCProviderWrapper as TRPCProvider } from "@/lib/trpc/trpc-provider";
import { FeedbackProvider } from "@fasterfixes/react";
import "@workspace/ui/globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "sonner";
import { StopImpersonateButton } from "./_features/auth/stop-impersonate-button/stop-impersonate-button.client";

const fontSans = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: SITE_NAME,
    template: `%s - ${SITE_NAME}`,
  },
  description: SITE_META_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="scroll-smooth"
      data-scroll-behavior="smooth"
    >
      <body
        className={`${fontSans.variable} ${fontMono.variable} flex min-h-screen flex-col font-sans antialiased`}
      >
        {/* Runtime config for client components: keeps the deployment's
            settings out of the build output, so one image serves any instance. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__GITHUB_APP_NAME__=${JSON.stringify(process.env.GITHUB_APP_NAME ?? "")}`,
          }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          enableColorScheme
        >
          <TRPCProvider>
            <NuqsAdapter>
              <StopImpersonateButton />

              <FeedbackProvider
                projectId={process.env.FF_API_KEY ?? ""}
                apiOrigin={process.env.FF_API_ORIGIN}
                classNames={{
                  button:
                    "bg-primary text-primary-foreground hover:bg-primary/90",
                }}
                position="bottom-left"
                captureDiagnostics={true}
              >
                {children}
              </FeedbackProvider>

              <Toaster />
            </NuqsAdapter>
          </TRPCProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
