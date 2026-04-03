import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Page builder chatjjjjj",
  description: "Configure Puck page JSON via chat or commands",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
