import type { Metadata } from "next";
import "./globals.css";
import "./workbench.css";

export const metadata: Metadata = {
  title: "Nebula — Your open-source workspace",
  description: "Track issues, pull requests, reviews, and the next step across every open-source project.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
