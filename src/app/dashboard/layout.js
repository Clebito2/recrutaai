"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

export default function DashboardLayout({ children }) {
  const { user, userProfile, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading) {
      if (!user) {
        router.push("/login");
      } else if (!userProfile?.companyName) {
        router.push("/onboarding");
      }
    }
  }, [mounted, loading, user, userProfile, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (!mounted || loading || !user || !userProfile?.companyName) {
    return (
      <div className="loading-screen">
        <span>Carregando...</span>
        <style jsx>{`
          .loading-screen {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: rgba(255, 255, 255, 0.4);
          }
        `}</style>
      </div>
    );
  }

  const navItems = [
    { href: "/dashboard", label: "Início", section: "main" },
    { href: "/dashboard/jobs", label: "Vagas", section: "main" },
    { href: "/dashboard/candidates", label: "Talentos", section: "main" },
    { href: "/dashboard/settings", label: "Configurações", section: "config" },
  ];

  const mainNav = navItems.filter(item => item.section === "main");
  const configNav = navItems.filter(item => item.section === "config");

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <Link href="/dashboard" className="brand">
            Recruit<span className="accent">AI</span>
          </Link>
        </div>

        <div className="company-badge">
          <span className="company-label">Empresa</span>
          <span className="company-name">{userProfile.companyName}</span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <span className="nav-section-title">Menu Principal</span>
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${pathname === item.href ? "active" : ""}`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="nav-section">
            <span className="nav-section-title">Sistema</span>
            {configNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${pathname === item.href ? "active" : ""}`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <span className="user-label">Logado como</span>
            <span className="user-email">{userProfile.email}</span>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            Sair da Conta
          </button>
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>

      <style jsx>{`
        .dashboard-layout {
          display: flex;
          min-height: 100vh;
        }

        .sidebar {
          width: 280px;
          background: linear-gradient(180deg, rgba(15, 15, 22, 0.98) 0%, rgba(10, 10, 15, 0.98) 100%);
          border-right: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          flex-direction: column;
          position: fixed;
          height: 100vh;
          overflow-y: auto;
        }

        .sidebar-header {
          padding: 28px 24px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }

        .brand {
          font-size: 1.5rem;
          font-weight: 800;
          text-decoration: none;
          color: white;
          letter-spacing: -0.02em;
        }

        .accent {
          color: var(--action-primary);
        }

        .company-badge {
          margin: 20px 20px 0;
          padding: 16px 18px;
          background: rgba(79, 70, 229, 0.08);
          border: 1px solid rgba(79, 70, 229, 0.15);
          border-radius: 10px;
        }

        .company-label {
          display: block;
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--action-primary);
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 6px;
        }

        .company-name {
          display: block;
          font-size: 1rem;
          font-weight: 600;
          color: white;
        }

        .sidebar-nav {
          flex: 1;
          padding: 24px 16px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .nav-section {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .nav-section-title {
          font-size: 0.7rem;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.35);
          text-transform: uppercase;
          letter-spacing: 1.5px;
          padding: 0 12px;
          margin-bottom: 8px;
        }

        .nav-item {
          padding: 12px 18px;
          border-radius: 8px;
          color: white;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.95rem;
          transition: all 0.2s ease;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.02);
          margin-bottom: 8px;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateX(4px);
        }

        .nav-item.active {
          background: var(--action-primary);
          border-color: var(--action-primary);
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
        }

        .sidebar-footer {
          padding: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
          margin-top: auto;
        }

        .user-info {
          margin-bottom: 16px;
        }

        .user-label {
          display: block;
          font-size: 0.7rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.35);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 4px;
        }

        .user-email {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.6);
          word-break: break-all;
        }

        .logout-btn {
          width: 100%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.6);
          padding: 12px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.15s;
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.3);
          color: #FCA5A5;
        }

        .main-content {
          flex: 1;
          margin-left: 280px;
          padding: 48px;
          min-height: 100vh;
        }

        @media (max-width: 1024px) {
          .sidebar {
            width: 240px;
          }

          .main-content {
            margin-left: 240px;
            padding: 32px;
          }
        }

        @media (max-width: 768px) {
          .sidebar {
            display: none;
          }

          .main-content {
            margin-left: 0;
            padding: 24px;
          }
        }
      `}</style>
    </div>
  );
}
