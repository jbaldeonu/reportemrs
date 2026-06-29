import React, { useState, useRef } from 'react';
import { useStore, Project } from '../store/useStore';
import { LogOut, Users, FileText, Plus, Edit, Trash2, Archive, Upload, UserCog, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import Modal from '../components/Modal';
import ProjectForm from '../components/ProjectForm';
import ClientForm from '../components/ClientForm';
import AdminForm from '../components/AdminForm';
import DataTable from '../components/DataTable';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'projects' | 'clients' | 'history' | 'admins'>('projects');
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const [editingClient, setEditingClient] = useState<any>();
  const [editingAdmin, setEditingAdmin] = useState<any>();

  const currentUser = useStore((state) => state.currentUser);
  const logout = useStore((state) => state.logout);
  const projects = useStore((state) => state.projects);
  const clients = useStore((state) => state.clients);
  const admins = useStore((state) => state.admins);
  const addProject = useStore((state) => state.addProject);
  const deleteProject = useStore((state) => state.deleteProject);
  const addClient = useStore((state) => state.addClient);
  const updateClient = useStore((state) => state.updateClient);
  const deleteClient = useStore((state) => state.deleteClient);
  const deleteAdmin = useStore((state) => state.deleteAdmin);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isHistoryProject = (p: Project) => p.estado === '10. Cerrado' || p.estado === 'Cancelado';
  const activeProjects = projects.filter(p => !isHistoryProject(p));
  const historyProjects = projects.filter(p => isHistoryProject(p));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      
      const getVal = (row: any, keys: string[]) => {
        const rowKeys = Object.keys(row);
        for (let k of keys) {
          const found = rowKeys.find(rk => rk.trim().toLowerCase() === k.trim().toLowerCase());
          if (found) return row[found];
        }
        return '';
      };

      const parseExcelDate = (val: any) => {
        if (!val) return '';
        if (typeof val === 'number') {
          const d = new Date(Math.round((val - 25569) * 86400 * 1000));
          return d.toISOString().split('T')[0];
        }
        if (typeof val === 'string') {
          const parts = val.split(/[-/]/);
          if (parts.length === 3) {
            // Assume DD/MM/YYYY or YYYY-MM-DD
            if (parts[0].length === 4) return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
            return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          }
          return val;
        }
        return String(val);
      };

      data.forEach((row: any) => {
        const clientName = getVal(row, ['Cliente', 'cliente']);
        const client = clients.find(c => c.name.toLowerCase() === clientName.toLowerCase()) || clients[0];

        let avance = getVal(row, ['Avance real de ejecución (%)', 'Avance (%)', 'Avance de Ejecución (%)']);
        if (typeof avance === 'string') avance = avance.replace('%', '').trim();

        const newProject: Project = {
          id: `p_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          tipoServicio: getVal(row, ['Tipo de Servicio', 'tipoServicio']) || 'Evaluación de Componente',
          clientId: client?.id || '',
          docReferenciaCliente: getVal(row, ['Documento de referencia Cliente', 'Doc Ref Cliente', 'docReferenciaCliente']),
          guiaRemisionCliente: getVal(row, ['N° guia remisión Cliente', 'Nº Guía Remisión', 'guiaRemisionCliente']),
          nProyectoEpiroc: getVal(row, ['N° Proyecto Epiroc', 'Nº Proyecto Epiroc', 'nProyectoEpiroc']),
          nOpEpiroc: getVal(row, ['N° OP Epiroc', 'Nº OP Epiroc', 'nOpEpiroc']),
          flota: getVal(row, ['Flota', 'flota']),
          descripcionComponente: getVal(row, ['Descripción del componente / equipo', 'Descripción Componente', 'descripcionComponente']),
          np: getVal(row, ['NP', 'N/P', 'np']),
          ns: getVal(row, ['NS', 'N/S', 'ns']),
          cantidad: Number(getVal(row, ['Cantidad', 'cantidad'])) || 1,
          precio: Number(getVal(row, ['PRECIO (USD)', 'Precio (USD)', 'precio'])) || 0,
          estado: getVal(row, ['Estado', 'estado']) || '1. Espera de evaluación',
          fechaIngresoTaller: parseExcelDate(getVal(row, ['Fecha ingreso taller Epiroc', 'Fecha Ingreso Taller', 'fechaIngresoTaller'])),
          fechaInicioEvaluacion: parseExcelDate(getVal(row, ['Fecha inicio evaluación', 'Fecha Inicio Eval.', 'fechaInicioEvaluacion'])),
          fechaFinalEvaluacion: parseExcelDate(getVal(row, ['Fecha final evaluación', 'Fecha Final Eval.', 'fechaFinalEvaluacion'])),
          fechaEmisionInforme: parseExcelDate(getVal(row, ['Fecha emisión informe y presupuesto', 'Fecha Emisión Informe', 'fechaEmisionInforme'])),
          nPresupuestoEpiroc: getVal(row, ['N° Presupuesto Epiroc', 'Nº Ppto Epiroc', 'nPresupuestoEpiroc']),
          fechaRecepcionOc: parseExcelDate(getVal(row, ['Fecha recepción OC', 'fechaRecepcionOc'])),
          nOcCliente: getVal(row, ['N° OC Cliente', 'Nº OC Cliente', 'nOcCliente']),
          fechaEntregaOfrecida: parseExcelDate(getVal(row, ['Fecha entrega ofrecida OC', 'Fecha Entrega Ofrecida', 'fechaEntregaOfrecida'])),
          fechaEstimadaEntrega: parseExcelDate(getVal(row, ['Fecha estimada de entrega', 'Fecha Estimada Entrega', 'fechaEstimadaEntrega'])),
          avanceEjecucion: Number(avance) || 0,
          comentarios: getVal(row, ['Comentarios', 'comentarios'])
        };
        addProject(newProject);
      });
      alert('Proyectos importados correctamente.');
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };

  const handleExportExcel = () => {
    const dataToExport = activeTab === 'projects' ? activeProjects : historyProjects;
    
    const exportData = dataToExport.map(p => ({
      'Cliente': clients.find(c => c.id === p.clientId)?.name || 'Desconocido',
      'Tipo de Servicio': p.tipoServicio,
      'Doc Ref Cliente': p.docReferenciaCliente,
      'Nº Guía Remisión': p.guiaRemisionCliente,
      'Nº Proyecto Epiroc': p.nProyectoEpiroc,
      'Nº OP Epiroc': p.nOpEpiroc,
      'Flota': p.flota,
      'Descripción Componente': p.descripcionComponente,
      'N/P': p.np,
      'N/S': p.ns,
      'Cantidad': p.cantidad,
      'Precio (USD)': p.precio,
      'Estado': p.estado,
      'Fecha Ingreso Taller': p.fechaIngresoTaller,
      'Fecha Inicio Eval.': p.fechaInicioEvaluacion,
      'Fecha Final Eval.': p.fechaFinalEvaluacion,
      'Fecha Emisión Informe': p.fechaEmisionInforme,
      'Nº Ppto Epiroc': p.nPresupuestoEpiroc,
      'Fecha Recepción OC': p.fechaRecepcionOc,
      'Nº OC Cliente': p.nOcCliente,
      'Fecha Entrega Ofrecida': p.fechaEntregaOfrecida,
      'Fecha Estimada Entrega': p.fechaEstimadaEntrega,
      'Avance (%)': p.avanceEjecucion,
      'Comentarios': p.comentarios
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Proyectos");
    
    XLSX.writeFile(wb, `Reporte_Proyectos_${activeTab}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="epiroc-logo-text">EPIROC</span>
        </div>
        <nav className="sidebar-nav">
          <button 
            className={`nav-btn ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            <FileText size={18} /> Proyectos Activos
          </button>
          <button 
            className={`nav-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <Archive size={18} /> Historial
          </button>
          {currentUser?.canManageUsers && (
            <>
              <button 
                className={`nav-btn ${activeTab === 'clients' ? 'active' : ''}`}
                onClick={() => setActiveTab('clients')}
              >
                <Users size={18} /> Clientes
              </button>
              <button 
                className={`nav-btn ${activeTab === 'admins' ? 'active' : ''}`}
                onClick={() => setActiveTab('admins')}
              >
                <UserCog size={18} /> Administradores
              </button>
            </>
          )}
        </nav>
        <div className="sidebar-footer">
          <button className="nav-btn logout-btn" onClick={handleLogout}>
            <LogOut size={18} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="content-header">
          <h1>
            {activeTab === 'projects' && 'Gestión de Proyectos Activos'}
            {activeTab === 'history' && 'Historial de Proyectos'}
            {activeTab === 'clients' && 'Gestión de Clientes'}
            {activeTab === 'admins' && 'Gestión de Administradores'}
          </h1>
          {activeTab === 'projects' && (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-secondary" onClick={handleExportExcel} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Download size={16} /> Exportar Excel
              </button>
              <input 
                type="file" 
                accept=".xlsx, .xls, .xlsm" 
                style={{ display: 'none' }} 
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <button className="btn-secondary" onClick={() => fileInputRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Upload size={16} /> Importar Excel
              </button>
              <button className="btn-primary" onClick={() => { setEditingProject(undefined); setIsProjectModalOpen(true); }}>
                <Plus size={16} /> Nuevo Proyecto
              </button>
            </div>
          )}
          {activeTab === 'history' && (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-secondary" onClick={handleExportExcel} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Download size={16} /> Exportar Excel
              </button>
            </div>
          )}
          {activeTab === 'clients' && (
            <button className="btn-primary" onClick={() => { setEditingClient(undefined); setIsClientModalOpen(true); }}>
              <Plus size={16} /> Nuevo Cliente
            </button>
          )}
          {activeTab === 'admins' && (
            <button className="btn-primary" onClick={() => { setEditingAdmin(undefined); setIsAdminModalOpen(true); }}>
              <Plus size={16} /> Nuevo Administrador
            </button>
          )}
        </header>

        <div className="content-body">
          {(activeTab === 'projects' || activeTab === 'history') ? (
            <DataTable 
              projects={activeTab === 'projects' ? activeProjects : historyProjects}
              isAdmin={true}
              clients={clients}
              onEdit={(p) => { setEditingProject(p); setIsProjectModalOpen(true); }}
              onDelete={deleteProject}
            />
          ) : activeTab === 'admins' ? (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Usuario / Email</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((a) => (
                    <tr key={a.id}>
                      <td>{a.name} {a.canManageUsers && <span style={{ fontSize: '0.75rem', backgroundColor: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px' }}>Super Admin</span>}</td>
                      <td>{a.username}</td>
                      <td>
                        <button className="icon-btn edit" onClick={() => { setEditingAdmin(a); setIsAdminModalOpen(true); }}><Edit size={16}/></button>
                        {a.id !== 'admin1' && (
                          <button className="icon-btn delete" onClick={() => { if(window.confirm('¿Seguro?')) deleteAdmin(a.id) }}><Trash2 size={16}/></button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Usuario</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((c) => (
                    <tr key={c.id}>
                      <td>{c.name}</td>
                      <td>{c.username}</td>
                      <td>
                        <button className="icon-btn edit" onClick={() => { setEditingClient(c); setIsClientModalOpen(true); }}><Edit size={16}/></button>
                        <button className="icon-btn delete" onClick={() => { if(window.confirm('¿Seguro?')) deleteClient(c.id) }}><Trash2 size={16}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Modal 
        isOpen={isProjectModalOpen} 
        onClose={() => setIsProjectModalOpen(false)} 
        title={editingProject ? "Editar Proyecto" : "Nuevo Proyecto"}
      >
        <ProjectForm project={editingProject} onClose={() => setIsProjectModalOpen(false)} />
      </Modal>

      <Modal 
        isOpen={isClientModalOpen} 
        onClose={() => setIsClientModalOpen(false)} 
        title={editingClient ? "Editar Cliente" : "Nuevo Cliente"}
      >
        <ClientForm client={editingClient} onClose={() => setIsClientModalOpen(false)} />
      </Modal>

      <Modal 
        isOpen={isAdminModalOpen} 
        onClose={() => setIsAdminModalOpen(false)} 
        title={editingAdmin ? "Editar Administrador" : "Nuevo Administrador"}
      >
        <AdminForm admin={editingAdmin} onClose={() => setIsAdminModalOpen(false)} />
      </Modal>
    </div>
  );
}
