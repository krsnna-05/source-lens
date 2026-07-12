import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "SourceLens",
  description: "AI-powered repository intelligence platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
