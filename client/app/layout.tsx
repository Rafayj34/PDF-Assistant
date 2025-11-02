import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {
  ClerkProvider,
  SignIn,
  SignInButton,
  SignUp,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "A PDF Assistant",
  description: "I have Uploaded three PDFs for node.js. Ask anyhting from node.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <section className="min-h-screen w-screen flex justify-center items-center">
            <SignedOut>
              <SignUp />
            </SignedOut>
            <SignedIn>
              {children}
            </SignedIn>
          </section>
          {/* {children} */}
        </body>
    </html>
    </ClerkProvider>
  );
}
