import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "MOCKR.AI",
    template: "%s | MOCKR.AI",
  },
  description:
    "Student-friendly AI interview preparation for practising coding questions, reviewing structured feedback, and tracking improvement over time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
