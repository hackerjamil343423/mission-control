import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mission Control | Oto & Jamil",
  description: "Track tasks, content, calendar, memories, and team",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-claw-dark">
        {children}
      </body>
    </html>
  );
}
