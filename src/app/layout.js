import "./globals.css";
import { AuthProvider } from "../context/AuthContext";

export const metadata = {
    title: "Recruit-AI | Curadoria de Talentos",
    description: "Plataforma de recrutamento inteligente com IA. Curadoria de alta performance em R&S.",
};

export default function RootLayout({ children }) {
    return (
        <html lang="pt-BR">
            <body>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}
