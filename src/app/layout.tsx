import "./globals.css";
import type { Metadata } from "next";
import { Poppins, IBM_Plex_Mono } from "next/font/google";

import { Providers, ToasterProvider } from "@/shared";
import { ConditionalHeader } from "@/widgets/header/ui";
// import { SuspenseLoader } from "@/components/loader";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  style: "normal", 
  subsets: ["latin"],
  variable: "--font-poppins",
});
const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "700"],
  style: "normal", 
  subsets: ["latin"],
  variable: "--font-ibmPlexMono",
});

export const metadata: Metadata = {
  title: "vtb",
  description: "Developer tools for modern web development.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={`${poppins} ${ibmPlexMono}`} lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (window.history.scrollRestoration) {
                window.history.scrollRestoration = 'manual';
              }
              window.scrollTo(0, 0);
            `,
          }}
        />
      </head>
      <body>
        <Providers>
          <ConditionalHeader />
          {/* <ModalProvider /> */}
          <ToasterProvider />
          {/* <SuspenseLoader> */}
						{children}
					{/* </SuspenseLoader> */}
        </Providers>
      </body>
    </html>
  );
}
