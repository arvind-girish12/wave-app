import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import LayoutWrapper from "../components/LayoutWrapper";
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Wave - Mental Health Support",
  description: "Your personal mental health companion",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Gloria+Hallelujah&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <LayoutWrapper>{children}</LayoutWrapper>
        </Providers>
        <Toaster position="top-right" />
      </body>
    </html>
  );
} 