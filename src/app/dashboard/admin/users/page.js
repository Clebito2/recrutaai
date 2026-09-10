"use client";

import { useState, useEffect } from "react";
import GlassCard from "@/components/common/GlassCard";
import { 
  Users, CheckCircle2, Clock, ShieldCheck, AlertCircle, 
  RefreshCw, Search, UserCheck, UserX, Mail, Building2, Calendar, Loader2
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function AdminUsersPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);
  const [actionSuccess, setActionSuccess] = useState("");
  const [actionError, setActionError] = useState("");

  const isMasterAdmin = 
    user?.email === "cleber.ihs@gmail.com" || 
    user?.email === "cleberdonato@ecossistemalive.com.br";

  useEffect(() => {
    if (user && !isMasterAdmin) {
      router.push("/dashboard");
    }
  }, [user, isMasterAdmin, router]);

  useEffect(() => {
    if (isMasterAdmin) {
      fetchUsers();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMasterAdmin]);

  const fetchUsers = async () => {
    setLoading(true);
    setActionError("");
    try {
      const snap = await getDocs(collection(db, "users"));
      const list = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        createdAtDate: d.data().createdAt?.toDate ? d.data().createdAt.toDate() : null
      }));
      list.sort((a, b) => (b.createdAtDate || 0) - (a.createdAtDate || 0));
      setUsersList(list);
    } catch (err) {
      console.error("Erro ao carregar usuários:", err);
      setActionError("Erro ao carregar lista de usuários: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (targetUser) => {
    setUpdatingId(targetUser.id);
    setActionError("");
    setActionSuccess("");
    try {
      const userRef = doc(db, "users", targetUser.id);
      const updateData = {
        status: "active",
        paymentApproved: true,
        plan: targetUser.plan === "pending" || !targetUser.plan ? "elite" : targetUser.plan
      };
      await updateDoc(userRef, updateData);

      setUsersList(prev => prev.map(u => u.id === targetUser.id ? { ...u, ...updateData } : u));
      setActionSuccess(`Usuário ${targetUser.email} aprovado com sucesso! Acesso liberado.`);
      setTimeout(() => setActionSuccess(""), 4000);
    } catch (err) {
      console.error("Erro ao aprovar usuário:", err);
      setActionError("Falha ao aprovar usuário: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRevoke = async (targetUser) => {
    if (!confirm(`Suspender o acesso de ${targetUser.email}?`)) return;
    setUpdatingId(targetUser.id);
    setActionError("");
    setActionSuccess("");
    try {
      const userRef = doc(db, "users", targetUser.id);
      const updateData = {
        status: "pending_payment",
        paymentApproved: false
      };
      await updateDoc(userRef, updateData);

      setUsersList(prev => prev.map(u => u.id === targetUser.id ? { ...u, ...updateData } : u));
      setActionSuccess(`Acesso de ${targetUser.email} colocado em pendência.`);
      setTimeout(() => setActionSuccess(""), 4000);
    } catch (err) {
      console.error("Erro ao suspender usuário:", err);
      setActionError("Falha ao suspender usuário: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  if (!isMasterAdmin) {
    return null;
  }

  const filteredUsers = usersList.filter(u => {
    const matchesSearch = 
      (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.displayName || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.companyName || "").toLowerCase().includes(search.toLowerCase());

    const isApproved = u.paymentApproved === true || u.status === "active";
    if (filter === "pending") return matchesSearch && !isApproved;
    if (filter === "active") return matchesSearch && isApproved;
    return matchesSearch;
  });

  const pendingCount = usersList.filter(u => u.status === "pending_payment" || u.paymentApproved === false).length;
  const activeCount = usersList.filter(u => u.status === "active" || u.paymentApproved === true).length;

  return (
    <div className="admin-users-page animate-fade">
      <header className="page-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <ShieldCheck size={28} color="var(--purple-600)" />
            <h1 style={{ fontSize: "1.8rem", fontWeight: "800", color: "var(--ink-900)", margin: 0 }}>
              Central de Aprovações & Usuários
            </h1>
          </div>
          <p style={{ color: "var(--ink-500)", fontSize: "0.9rem", margin: 0 }}>
            Gerencie e aprove imediatamente cadastros e liberações de pagamento PIX.
          </p>
        </div>

        <button 
          onClick={fetchUsers} 
          disabled={loading}
          className="btn-refresh"
        >
          <RefreshCw size={16} className={loading ? "spin" : ""} />
          Atualizar Lista
        </button>
      </header>

      {actionSuccess && (
        <div className="alert-box success animate-fade">
          <CheckCircle2 size={18} /> {actionSuccess}
        </div>
      )}
      {actionError && (
        <div className="alert-box error animate-fade">
          <AlertCircle size={18} /> {actionError}
        </div>
      )}

      <div className="stats-row">
        <GlassCard className="stat-box">
          <div className="stat-label">Total Cadastros</div>
          <div className="stat-val">{usersList.length}</div>
        </GlassCard>
        <GlassCard className="stat-box pending">
          <div className="stat-label">Aguardando Aprovação (PIX)</div>
          <div className="stat-val" style={{ color: "var(--status-warning)" }}>{pendingCount}</div>
        </GlassCard>
        <GlassCard className="stat-box active">
          <div className="stat-label">Acessos Ativos</div>
          <div className="stat-val" style={{ color: "var(--status-success)" }}>{activeCount}</div>
        </GlassCard>
      </div>

      <div className="controls-row">
        <div className="search-bar">
          <Search size={16} color="var(--ink-500)" />
          <input 
            type="text" 
            placeholder="Buscar por e-mail, nome ou empresa..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-pills">
          <button 
            className={`pill ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            Todos ({usersList.length})
          </button>
          <button 
            className={`pill warning ${filter === "pending" ? "active" : ""}`}
            onClick={() => setFilter("pending")}
          >
            Pendentes ({pendingCount})
          </button>
          <button 
            className={`pill success ${filter === "active" ? "active" : ""}`}
            onClick={() => setFilter("active")}
          >
            Ativos ({activeCount})
          </button>
        </div>
      </div>

      <GlassCard className="table-card">
        {loading ? (
          <div className="loading-state">
            <Loader2 size={32} className="spin" color="var(--purple-600)" />
            <p>Carregando usuários cadastrados...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="empty-state">
            <Users size={48} opacity={0.3} />
            <p>Nenhum usuário encontrado com os filtros aplicados.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Usuário</th>
                  <th>Empresa</th>
                  <th>Data Cadastro</th>
                  <th>Status</th>
                  <th>Plano</th>
                  <th style={{ textAlign: "right" }}>Ação de Liberação</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => {
                  const isApproved = u.paymentApproved === true || u.status === "active";
                  const isSelf = u.email === user?.email;

                  return (
                    <tr key={u.id} className={!isApproved ? "pending-row" : ""}>
                      <td>
                        <div className="user-identity">
                          <strong>{u.displayName || "Usuário"}</strong>
                          <span className="user-email">
                            <Mail size={12} /> {u.email}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="company-text">
                          <Building2 size={13} /> {u.companyName || "Pendente Onboarding"}
                        </span>
                      </td>
                      <td>
                        <span className="date-text">
                          <Calendar size={13} />
                          {u.createdAtDate ? u.createdAtDate.toLocaleDateString("pt-BR") : "—"}
                        </span>
                      </td>
                      <td>
                        {isApproved ? (
                          <span className="badge-status active">
                            <CheckCircle2 size={12} /> Ativo
                          </span>
                        ) : (
                          <span className="badge-status pending">
                            <Clock size={12} /> Pagamento Pendente
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="plan-badge">{u.plan || "pro"}</span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {isSelf ? (
                          <span className="self-badge">Você (Master Admin)</span>
                        ) : !isApproved ? (
                          <button
                            className="btn-approve"
                            disabled={updatingId === u.id}
                            onClick={() => handleApprove(u)}
                          >
                            {updatingId === u.id ? (
                              <Loader2 size={14} className="spin" />
                            ) : (
                              <UserCheck size={14} />
                            )}
                            Aprovar Acesso
                          </button>
                        ) : (
                          <button
                            className="btn-revoke"
                            disabled={updatingId === u.id}
                            onClick={() => handleRevoke(u)}
                            title="Suspender acesso deste usuário"
                          >
                            <UserX size={14} />
                            Suspender
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      <style jsx>{`
        .admin-users-page {
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .btn-refresh {
          background: var(--ink-900);
          color: var(--ink-500);
          border: 1px solid var(--line);
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-refresh:hover {
          color: var(--ink-900);
          border-color: var(--purple-600);
        }

        .alert-box {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 18px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 0.9rem;
          font-weight: 600;
        }
        .alert-box.success {
          background: rgba(16, 185, 129, 0.1);
          color: var(--status-success);
          border: 1px solid var(--status-success);
        }
        .alert-box.error {
          background: rgba(239, 68, 68, 0.15);
          color: var(--status-danger);
          border: 1px solid var(--status-danger);
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-box {
          padding: 20px;
        }
        .stat-label {
          font-size: 0.82rem;
          color: var(--ink-500);
          font-weight: 600;
          text-transform: uppercase;
          margin-bottom: 6px;
        }
        .stat-val {
          font-size: 2rem;
          font-weight: 800;
          color: var(--ink-900);
        }

        .controls-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .search-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--ink-900);
          border: 1px solid var(--line);
          border-radius: 8px;
          padding: 10px 14px;
          flex: 1;
          min-width: 260px;
        }
        .search-bar input {
          background: transparent;
          border: none;
          outline: none;
          color: var(--ink-900);
          width: 100%;
          font-size: 0.9rem;
        }

        .filter-pills {
          display: flex;
          gap: 8px;
        }
        .pill {
          background: var(--ink-900);
          border: 1px solid var(--line);
          color: var(--ink-500);
          padding: 8px 14px;
          border-radius: 20px;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .pill:hover {
          color: var(--ink-900);
        }
        .pill.active {
          background: var(--purple-600);
          border-color: var(--purple-600);
          color: var(--ink-900);
        }
        .pill.warning.active {
          background: var(--status-warning);
          border-color: var(--status-warning);
          color: var(--ink-900);
          font-weight: 700;
        }
        .pill.success.active {
          background: var(--status-success);
          border-color: var(--status-success);
          color: var(--ink-900);
        }

        .table-card {
          padding: 0;
          overflow: hidden;
        }
        .table-wrapper {
          overflow-x: auto;
        }
        .users-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.88rem;
        }
        .users-table th {
          background: var(--purple-100);
          border-bottom: 1px solid var(--line);
          padding: 14px 18px;
          text-align: left;
          color: var(--ink-500);
          font-weight: 700;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .users-table td {
          padding: 0 16px; height: 52px;
          border-bottom: 1px solid var(--line);
          vertical-align: middle;
        }
        .users-table tr.pending-row {
          background: #FFF9ED;
        }

        .user-identity strong {
          display: block;
          color: var(--ink-900);
          font-size: 0.92rem;
          margin-bottom: 3px;
        }
        .user-email {
          display: flex;
          align-items: center;
          gap: 5px;
          color: var(--ink-500);
          font-size: 0.8rem;
        }

        .company-text, .date-text {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--ink-700);
          font-size: 0.82rem;
        }

        .badge-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 700;
        }
        .badge-status.active {
          background: rgba(16, 185, 129, 0.1);
          color: var(--status-success);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
        .badge-status.pending {
          background: rgba(245, 158, 11, 0.1);
          color: var(--status-warning);
          border: 1px solid rgba(245, 158, 11, 0.3);
        }

        .plan-badge {
          background: rgba(91, 42, 134, 0.1);
          color: var(--purple-600);
          border: 1px solid var(--purple-100);
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .self-badge {
          font-size: 0.78rem;
          color: var(--purple-600);
          font-weight: 600;
          opacity: 0.7;
        }

        .btn-approve {
          background: var(--status-success);
          color: var(--ink-900);
          border: none;
          padding: 8px 14px;
          border-radius: 6px;
          font-weight: 700;
          font-size: 0.82rem;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-approve:hover {
          background: #059669;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
        .btn-approve:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .btn-revoke {
          background: rgba(239, 68, 68, 0.05);
          color: var(--status-danger);
          border: 1px solid rgba(239, 68, 68, 0.15);
          padding: 6px 12px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.78rem;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-revoke:hover {
          background: rgba(239, 68, 68, 0.15);
        }

        .loading-state, .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 60px 20px;
          color: var(--ink-500);
        }

        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
