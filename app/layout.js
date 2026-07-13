import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { DisableNumberInputWheel } from "@/components/providers/disable-number-input-wheel";
import { QueryProvider } from "@/components/providers/query-provider";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "Kayra Aura Admin",
  description: "Modern premium admin panel",
  icons: {
    icon: "/assets/ka-bg1.png",
    shortcut: "/assets/ka-bg1.png",
    apple: "/assets/ka-bg1.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full bg-background font-sans text-foreground">
        <QueryProvider>
          <DisableNumberInputWheel />
          {children}
          <Toaster richColors position="top-right" />
        </QueryProvider>
      </body>
    </html>
  );
}
