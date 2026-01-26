import { Plus_Jakarta_Sans, Merriweather } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";

const plusJakarta = Plus_Jakarta_Sans({
    variable: "--font-plus-jakarta",
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700", "800"],
});

const merriweather = Merriweather({
    variable: "--font-merriweather",
    subsets: ["latin"],
    weight: ["300", "400", "700"],
});

export const metadata = {
    title: "Recruit-AI | Humanidade Sintética",
    description: "Curadoria de alta performance em R&S com inteligência sistêmica.",
};

export default function RootLayout({ children }) {
    return (
        <html lang="pt-BR">
            <body className={`${plusJakarta.variable} ${merriweather.variable}`}>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}
