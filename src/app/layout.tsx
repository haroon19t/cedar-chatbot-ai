import "./globals.css";
import { cn,constructMetadata } from "@/lib/utils";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

interface RootLayoutProps {
  children: React.ReactNode;
}

export const metadata = constructMetadata();

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <html
        lang="en-US"
        className={cn(GeistSans.variable, GeistMono.variable)}
        data-lt-installed="true"
      >
        <body className={cn("max-h-screen bg-background antialiased")} cz-shortcut-listen="true">
          
          <main className="relative flex flex-col max-h-screen">
            {children}
          </main>
        </body>
      </html>
    </>
  );
}
