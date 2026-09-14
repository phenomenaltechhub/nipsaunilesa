import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nipsaunilesa.com.ng"),
  title: {
    template: "%s | NIPSA UNILESA",
    default: "NIPSA UNILESA",
  },
  description:
    "A student network for pharmacology learning, events and community at the University of Ilesa.",
  openGraph: {
    title: "NIPSA UNILESA",
    description:
      "A student network for pharmacology learning, events and community at the University of Ilesa.",
    type: "website",
    locale: "en_NG",
    url: "https://nipsaunilesa.com.ng",
  },
  twitter: {
    card: "summary_large_image",
    title: "NIPSA UNILESA",
    description:
      "A student network for pharmacology learning, events and community at the University of Ilesa.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div className="site-watermark" aria-hidden="true">
          <div className="site-watermark-stack">
            <img className="brand-logo brand-logo--crest" src="/unilesa-logo.png" alt="" />
            <img className="brand-logo brand-logo--nipsa" src="/nipsa-logo.png" alt="" />
          </div>
        </div>
        {children}
      </body>
    </html>
  );
}
