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
    { href: "/dashboard", label: "Início" },
    { href: "/dashboard/jobs", label: "Vagas" },
    { href: "/dashboard/candidates", label: "Talentos" },
    { href: "/dashboard/settings", label: "Configurações" },
  ];

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <Link href="/dashboard" className="brand">
            Recruit<span className="accent">AI</span>
          </Link>
          <span className="company-name">{userProfile.companyName}</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${pathname === item.href ? "active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <span className="user-email">{userProfile.email}</span>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            Sair
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
          width: 260px;
          background: rgba(12, 12, 18, 0.95);
          border-right: 1px solid var(--border-glass);
          display: flex;
          flex-direction: column;
          padding: 32px 20px;
          position: fixed;
          height: 100vh;
          overflow-y: auto;
        }

        .sidebar-header {
          margin-bottom: 48px;
        }

        .brand {
          font-size: 1.4rem;
          font-weight: 800;
          text-decoration: none;
          color: white;
          display: block;
          margin-bottom: 8px;
        }

        .accent {
          color: var(--action-primary);
        }

        .company-name {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.4);
          font-weight: 500;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }

        .nav-item {
          padding: 14px 16px;
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.6);
          text-decoration: none;
          font-weight: 600;
          font-size: 0.95rem;
          transition: all 0.15s;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: white;
        }

        .nav-item.active {
          background: var(--action-primary);
          color: white;
        }

        .sidebar-footer {
          padding-top: 24px;
          border-top: 1px solid var(--border-glass);
        }

        .user-info {
          margin-bottom: 16px;
        }

        .user-email {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.5);
          word-break: break-all;
        }

        .logout-btn {
          width: 100%;
          background: transparent;
          border: 1px solid var(--border-glass);
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
          margin-left: 260px;
          padding: 48px;
          min-height: 100vh;
        }

        @media (max-width: 1024px) {
          .sidebar {
            width: 220px;
            padding: 24px 16px;
          }

          .main-content {
            margin-left: 220px;
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
