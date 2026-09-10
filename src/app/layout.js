import { Poppins, Nunito_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";

const poppins = Poppins({
    weight: ['700', '800'],
    subsets: ['latin'],
    variable: '--font-poppins',
    display: 'swap',
});

const nunitoSans = Nunito_Sans({
    weight: ['400', '600', '700'],
    subsets: ['latin'],
    variable: '--font-nunito',
    display: 'swap',
});

export const metadata = {
    title: "RecruteAI | Curadoria de Talentos",
    description: "Plataforma de recrutamento inteligente com IA. Curadoria de alta performance em R&S.",
};

export default function RootLayout({ children }) {
    return (
        <html lang="pt-BR" className={`${poppins.variable} ${nunitoSans.variable}`}>
            <body style={{ fontFamily: "var(--font-nunito)" }}>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}
