import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.scss";
import { AuthProvider } from "@/context/AuthContext";
import PWAWrapper from "@/components/PWAWrapper";
import ClientLayout from "@/components/ClientLayout";
import AnimatedBackground from "@/components/AnimatedBackground";

// next/font automatically self-hosts the font — no layout shift, no blocking network request
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  display: "swap",
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
  title: {
    default: "HealthAI | AI Medical Symptom Checker & Predictor",
    template: "%s | HealthAI"
  },
  description: "Advanced AI health risk predictor. Check symptoms online, identify early warning signs, and get personalized health recommendations instantly.",
  keywords: ["AI Health Check", "Symptom Checker", "Health Risk Predictor", "Medical AI", "Online Health AI", "Health Monitoring"],
  authors: [{ name: "HealthAI Team" }],
  creator: "HealthAI",
  publisher: "HealthAI Inc.",
  openGraph: {
    title: "HealthAI | AI Medical Symptom Checker",
    description: "Predict potential health risks using our advanced medical AI model.",
    url: "https://healthai.example.com",
    siteName: "HealthAI",
    images: [{
      url: "/icon-512.png",
      width: 512,
      height: 512,
      alt: "HealthAI Logo"
    }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HealthAI Risk Predictor",
    description: "Get instant AI health insights and symptom analysis.",
    images: ["/icon-512.png"],
    creator: "@HealthAI"
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HealthAI",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#06b6d4",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={outfit.variable} suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icon-512.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('beforeinstallprompt', function(e) {
                e.preventDefault();
                window.deferredPrompt = e;
              });
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>
          <PWAWrapper>
            <AnimatedBackground />
            <ClientLayout>
              {children}
            </ClientLayout>
          </PWAWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
