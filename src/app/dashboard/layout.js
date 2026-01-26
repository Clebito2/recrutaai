"use client";

import { useSubscription } from "../../hooks/useSubscription";
import { useAuth } from "../../context/AuthContext";
import { LogOut, LayoutGrid, Briefcase, Users, Settings, Command } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function DashboardLayout({ children }) {
  const { subscription, loading } = useSubscription();
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  // Redirect if not authenticated
  if (!loading && !user) {
    router.push("/login");
    return null;
  }

  if (loading) return <div className="loading-screen animate-thinking">Carregando Cockpit...</div>;

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <Command color="var(--action-secondary)" size={24} />
          <span className="brand-text">Recruit<span className="text-neon">AI</span></span>
        </div>

        <nav className="sidebar-nav">
          <Link href="/dashboard" className={`nav-item ${pathname === '/dashboard' ? 'active' : ''}`}>
            <LayoutGrid size={20} />
            Visão Geral
          </Link>
          <Link href="/dashboard/jobs" className={`nav-item ${pathname.includes('/jobs') ? 'active' : ''}`}>
            <Briefcase size={20} />
            Pipeline Vagas
          </Link>
          <Link href="/dashboard/candidates" className={`nav-item ${pathname.includes('/candidates') ? 'active' : ''}`}>
            <Users size={20} />
            Talentos
          </Link>

          <div className="nav-spacer" />

          <div className="subscription-mini">
            <div className="plan-indicator">
              <span className="plan-name">{subscription?.plan?.toUpperCase() || "TRIAL"}</span>
              <span className="plan-days">{subscription?.daysRemaining}d restantes</span>
            </div>
            <div className="usage-bar">
              <div
                className="usage-fill"
                style={{ width: `${(subscription?.jobsCount / (subscription?.currentLimits?.jobs || 1)) * 100}%` }}
              />
            </div>
          </div>

          <Link href="/dashboard/settings" className="nav-item">
            <Settings size={20} />
            Ajustes
          </Link>
          <button onClick={handleLogout} className="nav-item logout">
            <LogOut size={20} />
            Sair
          </button>
        </nav>
      </aside>

      <main className="dashboard-content">
        {children}
      </main>

      <style jsx>{`
        .dashboard-container {
          display: grid;
          grid-template-columns: 240px 1fr;
          min-height: 100vh;
        }

        .sidebar {
          background: rgba(10, 10, 15, 0.6);
          border-right: 1px solid var(--border-glass);
          display: flex;
          flex-direction: column;
          padding: 30px 20px;
          backdrop-filter: blur(20px);
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 50px;
          padding-left: 8px;
        }

        .brand-text {
          font-weight: 800;
          font-size: 1.2rem;
          color: white;
          letter-spacing: -0.5px;
        }

        .text-neon {
          color: var(--action-secondary);
        }

        .sidebar-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 10px;
          color: rgba(255, 255, 255, 0.6);
          text-decoration: none;
          font-weight: 500;
          font-family: var(--font-ui);
          font-size: 0.9rem;
          transition: all 0.2s ease;
          border: none;
          background: transparent;
          cursor: pointer;
          width: 100%;
          text-align: left;
        }

        .nav-item:hover {
          color: white;
          background: rgba(255, 255, 255, 0.05);
        }

        .nav-item.active {
          background: rgba(79, 70, 229, 0.1);
          color: var(--action-secondary);
          border-left: 2px solid var(--action-secondary);
        }

        .nav-item.logout {
          margin-top: 8px;
        }
        
        .nav-item.logout:hover {
          color: var(--status-danger);
          background: rgba(239, 68, 68, 0.1);
        }

        .nav-spacer {
          flex: 1;
        }

        .subscription-mini {
          background: rgba(255, 255, 255, 0.03);
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
          border: 1px solid var(--border-glass);
        }

        .plan-indicator {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          margin-bottom: 8px;
        }

        .plan-name { font-weight: 700; color: var(--action-primary); }
        .plan-days { opacity: 0.5; }

        .usage-bar {
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          overflow: hidden;
        }

        .usage-fill {
          height: 100%;
          background: var(--status-analysis);
        }

        .dashboard-content {
          padding: 40px;
          overflow-y: auto;
          background: radial-gradient(circle at 50% 0%, rgba(79, 70, 229, 0.03) 0%, transparent 40%);
        }

        .loading-screen {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--action-secondary);
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
