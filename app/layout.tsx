import type { Metadata } from "next";
import { SnackbarProvider } from "@/components/snackbar/SnackbarProvider";
import { Montserrat } from "next/font/google";
import "../globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tools-4-Schools",
  description: "Supporting local teachers with classroom supplies.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} antialiased`}>
        <SnackbarProvider>{children}</SnackbarProvider>
      </body>
    </html>
  );
}
