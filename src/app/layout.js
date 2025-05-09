import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import LayoutWrapper from "../components/LayoutWrapper";

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
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <LayoutWrapper>{children}</LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
} 