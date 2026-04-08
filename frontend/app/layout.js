import "./globals.css";
import { Manrope } from "next/font/google";

const manrope = Manrope({ subsets: ["latin"] });

export const metadata = { title: "Doggy Connect & Walk" };

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${manrope.className} min-h-screen bg-gray-50 text-slate-900 antialiased`}>
        {children}
      </body>
    </html>
  );
}
