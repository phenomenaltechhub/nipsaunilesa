import type { Metadata } from "next";
import Script from "next/script";
import GuidedTour from "./components/guided-tour";
import "./globals.css";

const GA_MEASUREMENT_ID = "G-BY89T3HT2Z";

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
      data-scroll-behavior="smooth"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        <GuidedTour />
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
