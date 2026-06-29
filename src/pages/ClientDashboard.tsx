import React, { useMemo } from 'react';
import { useStore, Project } from '../store/useStore';
import { LogOut, Briefcase, Clock, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PieChartStatus from '../components/PieChartStatus';
import DataTable from '../components/DataTable';
import { parseISO, isBefore, startOfDay } from 'date-fns';

export default function ClientDashboard() {
  const logout = useStore((state) => state.logout);
  const currentUser = useStore((state) => state.currentUser);
  const projects = useStore((state) => state.projects);
  const clients = useStore((state) => state.clients);
  const navigate = useNavigate();
  const [showHistory, setShowHistory] = React.useState(false);

  const isHistoryProject = (p: Project) => p.estado === '10. Cerrado' || p.estado === 'Cancelado';

  const clientProjects = useMemo(() => {
    return projects.filter(p => p.clientId === currentUser?.clientId);
  }, [projects, currentUser]);

  const activeProjects = useMemo(() => clientProjects.filter(p => !isHistoryProject(p)), [clientProjects]);
  const historyProjects = useMemo(() => clientProjects.filter(p => isHistoryProject(p)), [clientProjects]);

  const clientInfo = useMemo(() => {
    return clients.find(c => c.id === currentUser?.clientId);
  }, [clients, currentUser]);

  const stats = useMemo(() => {
    const today = startOfDay(new Date());
    let onTime = 0;
    let overdue = 0;

    clientProjects.forEach(p => {
      if (p.estado.includes('Cierre') || p.avanceEjecucion === 100) {
        // If it's closed, it's considered resolved, maybe on time if delivered before estimate? 
        // For simplicity, completed projects could be excluded or just counted as on-time.
        onTime++;
        return;
      }
      
      if (!p.fechaEstimadaEntrega) {
        onTime++; // no estimate, assume on time
        return;
      }

      const estimatedDate = parseISO(p.fechaEstimadaEntrega);
      if (isBefore(estimatedDate, today)) {
        overdue++;
      } else {
        onTime++;
      }
    });

    return { total: activeProjects.length, onTime, overdue };
  }, [activeProjects]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-layout">
      <main className="main-content full-width">
        <header className="top-header">
          <div className="header-brand">
            <span className="epiroc-logo-text" style={{ marginRight: '1rem', textShadow: 'none' }}>EPIROC</span>
            <h2>Panel de Cliente - {clientInfo?.name}</h2>
          </div>
          <button className="nav-btn logout-btn header-logout" onClick={handleLogout}>
            <LogOut size={18} /> Cerrar Sesión
          </button>
        </header>

        <div className="dashboard-content">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon-wrapper blue">
                <Briefcase size={24} />
              </div>
              <div className="stat-info">
                <h3>Total Proyectos</h3>
                <p className="stat-value">{stats.total}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon-wrapper green">
                <Clock size={24} />
              </div>
              <div className="stat-info">
                <h3>A Tiempo</h3>
                <p className="stat-value">{stats.onTime}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon-wrapper red">
                <AlertTriangle size={24} />
              </div>
              <div className="stat-info">
                <h3>Vencidos</h3>
                <p className="stat-value">{stats.overdue}</p>
              </div>
            </div>
            <div className="stat-card chart-card">
               <PieChartStatus onTime={stats.onTime} overdue={stats.overdue} />
            </div>
          </div>

          <div className="data-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{showHistory ? 'Historial de Proyectos' : 'Proyectos Activos'}</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className={`btn-secondary ${!showHistory ? 'active' : ''}`} 
                  style={{ backgroundColor: !showHistory ? 'var(--bg-tertiary)' : 'transparent' }}
                  onClick={() => setShowHistory(false)}
                >
                  Activos
                </button>
                <button 
                  className={`btn-secondary ${showHistory ? 'active' : ''}`} 
                  style={{ backgroundColor: showHistory ? 'var(--bg-tertiary)' : 'transparent' }}
                  onClick={() => setShowHistory(true)}
                >
                  Historial
                </button>
              </div>
            </div>
            <DataTable projects={showHistory ? historyProjects : activeProjects} />
          </div>
        </div>
      </main>
    </div>
  );
}
