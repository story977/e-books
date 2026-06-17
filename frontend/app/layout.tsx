import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://yourebookstore.com"
  ),
  title: {
    default: "eBook Store — Premium Digital Books",
    template: "%s | eBook Store",
  },
  description:
    "Discover and instantly download premium digital eBooks on programming, self-help, business, and more. Secure payment & instant delivery.",
  keywords: [
    "ebooks",
    "digital books",
    "programming books",
    "buy ebooks online",
    "pdf books",
    "instant download",
  ],
  authors: [{ name: "eBook Store" }],
  creator: "eBook Store",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "eBook Store",
    title: "eBook Store — Premium Digital Books",
    description:
      "Discover and instantly download premium digital eBooks on programming, self-help, business, and more.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "eBook Store",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "eBook Store — Premium Digital Books",
    description: "Buy and download premium digital eBooks instantly.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
