import "./globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata = { title: "Doggy Connect & Walk" };

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={sans.variable}>
      <body
        className={`${sans.className} min-h-screen bg-surface text-ink antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
