import React, { useState, useMemo } from 'react';
import { Project, Client } from '../store/useStore';
import { Edit, Trash2, ArrowUpDown, ArrowUp, ArrowDown, Search, AlertTriangle, ChevronDown, ChevronRight, Check, X } from 'lucide-react';
import { parseISO, differenceInDays, format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
  projects: Project[];
  isAdmin?: boolean;
  clients?: Client[];
  onEdit?: (p: Project) => void;
  onDelete?: (id: string) => void;
}

export default function DataTable({ projects, isAdmin, clients, onEdit, onDelete }: Props) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [expandedProjects, setExpandedProjects] = useState<string[]>([]);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedProjects(prev => prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const date = parseISO(dateStr);
      const formatted = format(date, 'dd MMM yyyy', { locale: es });
      return formatted.replace(/([a-z])/, (match) => match.toUpperCase());
    } catch {
      return dateStr;
    }
  };

  const formatEstado = (estado: string) => {
    if (estado === '9. Proceso de Facturación / Cierre') {
      return '9. Proceso de facturación';
    }
    return estado;
  };

  const toggleRow = (id: string) => {
    setSelectedRows(prev => 
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const today = new Date();
  const expiringProjects = projects.filter(p => {
    if (p.estado.includes('10. Cerrado') || p.estado.includes('Cancelado')) return false;
    if (!p.fechaEstimadaEntrega) return false;
    const deliveryDate = parseISO(p.fechaEstimadaEntrega);
    const diff = differenceInDays(deliveryDate, today);
    return diff >= 0 && diff <= 7;
  }).length;

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const clientName = clients?.find(c => c.id === p.clientId)?.name || '';
      const searchString = `${Object.values(p).join(' ')} ${clientName}`.toLowerCase();
      return searchString.includes(searchTerm.toLowerCase());
    });
  }, [projects, searchTerm, clients]);

  const sortedProjects = useMemo(() => {
    let sortableItems = [...filteredProjects];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue: any = a[sortConfig.key as keyof Project];
        let bValue: any = b[sortConfig.key as keyof Project];
        
        if (sortConfig.key === 'cliente') {
          aValue = clients?.find(c => c.id === a.clientId)?.name || '';
          bValue = clients?.find(c => c.id === b.clientId)?.name || '';
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredProjects, sortConfig, clients]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnKey: string) => {
    if (!sortConfig || sortConfig.key !== columnKey) return <ArrowUpDown size={12} style={{ opacity: 0.3 }} />;
    return sortConfig.direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />;
  };

  const getTrafficLight = (dateStr?: string, estado?: string) => {
    if (!dateStr || estado?.includes('10. Cerrado') || estado?.includes('Cancelado')) {
      return <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#e2e8f0', margin: '0 auto' }} title="Sin fecha o Cerrado" />;
    }
    const targetDate = parseISO(dateStr);
    const diff = differenceInDays(targetDate, today);

    if (diff <= 7) {
      return <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#ef4444', boxShadow: '0 0 6px #ef4444', margin: '0 auto' }} title="<= 7 días (Crítico)" />;
    }
    if (diff <= 15) {
      return <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#eab308', boxShadow: '0 0 6px #eab308', margin: '0 auto' }} title="8-15 días (Precaución)" />;
    }
    return <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#22c55e', boxShadow: '0 0 6px #22c55e', margin: '0 auto' }} title="> 15 días (A tiempo)" />;
  };

  const Th = ({ label, sortKey }: { label: string, sortKey: string }) => (
    <th onClick={() => requestSort(sortKey)}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'space-between' }}>
        {label} {getSortIcon(sortKey)}
      </div>
    </th>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      {/* KPI & Filter Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Search */}
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder={isAdmin ? "Buscar por cliente, OP, servicio..." : "Buscar por OP, servicio, estado..."} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.2rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
          />
        </div>

        {/* KPI */}
        {isAdmin && expiringProjects > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#fef2f2', color: '#dc2626', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #fca5a5' }}>
            <AlertTriangle size={18} />
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{expiringProjects} Proyectos por vencer (7 días)</span>
          </div>
        )}

      </div>

      <div className="table-container large-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '40px', textAlign: 'center' }}></th>
              <th style={{ textAlign: 'center' }}>St</th>
              {isAdmin && <Th label="Cliente" sortKey="cliente" />}
              <Th label="Tipo de Servicio" sortKey="tipoServicio" />
              <Th label="Doc Ref Cliente" sortKey="docReferenciaCliente" />
              <Th label="Nº Guía Remisión" sortKey="guiaRemisionCliente" />
              <Th label="Nº Proyecto Epiroc" sortKey="nProyectoEpiroc" />
              <Th label="Nº OP Epiroc" sortKey="nOpEpiroc" />
              <Th label="Flota" sortKey="flota" />
              <Th label="Descripción" sortKey="descripcionComponente" />
              <Th label="N/P" sortKey="np" />
              <Th label="N/S" sortKey="ns" />
              <Th label="Cant." sortKey="cantidad" />
              {isAdmin && <Th label="Precio (USD)" sortKey="precio" />}
              <Th label="Estado" sortKey="estado" />
              <Th label="Ppto Epiroc" sortKey="nPresupuestoEpiroc" />
              <Th label="Nº OC Cliente" sortKey="nOcCliente" />
              <Th label="Entrega Ofrecida" sortKey="fechaEntregaOfrecida" />
              <Th label="Estimada Entrega" sortKey="fechaEstimadaEntrega" />
              <Th label="Avance (%)" sortKey="avanceEjecucion" />
              <Th label="Comentarios" sortKey="comentarios" />
              {isAdmin && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {sortedProjects.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 22 : 19} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                  No se encontraron proyectos.
                </td>
              </tr>
            ) : (
              sortedProjects.map(p => {
                const isSelected = selectedRows.includes(p.id);
                return (
                  <React.Fragment key={p.id}>
                    <tr 
                      onClick={() => toggleRow(p.id)}
                      style={{ 
                        cursor: 'pointer', 
                        outline: isSelected ? '2px solid #22c55e' : 'none', 
                        outlineOffset: '-2px',
                        backgroundColor: isSelected ? 'rgba(34, 197, 94, 0.05)' : undefined
                      }}
                    >
                      <td onClick={(e) => toggleExpand(p.id, e)} style={{ cursor: 'pointer', textAlign: 'center' }}>
                        <button className="icon-btn" style={{ padding: '2px', margin: 0 }}>
                          {expandedProjects.includes(p.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                      </td>
                      <td>{getTrafficLight(p.fechaEstimadaEntrega, p.estado)}</td>
                      {isAdmin && <td>{clients?.find(c => c.id === p.clientId)?.name || 'Desconocido'}</td>}
                      <td>{p.tipoServicio}</td>
                      <td>{p.docReferenciaCliente}</td>
                      <td>{p.guiaRemisionCliente}</td>
                      <td>{p.nProyectoEpiroc}</td>
                      <td>{p.nOpEpiroc}</td>
                      <td>{p.flota}</td>
                      <td className="description-cell">
                        <div className="description-text" title={p.descripcionComponente}>
                          {p.descripcionComponente}
                        </div>
                      </td>
                      <td>{p.np}</td>
                      <td>{p.ns}</td>
                      <td>{p.cantidad}</td>
                      {isAdmin && <td>${p.precio.toLocaleString()}</td>}
                      <td><span className="status-badge">{formatEstado(p.estado)}</span></td>
                      
                      <td>{p.nPresupuestoEpiroc}</td>
                      
                      <td>{p.nOcCliente}</td>
                      <td>{formatDate(p.fechaEntregaOfrecida)}</td>
                      <td>{formatDate(p.fechaEstimadaEntrega)}</td>
                  <td>
                    <div className="progress-bar-container">
                      <div 
                        className="progress-bar" 
                        style={{ 
                          width: `${p.avanceEjecucion}%`, 
                          backgroundColor: p.avanceEjecucion === 100 ? 'var(--accent-secondary)' : 'var(--accent-primary)' 
                        }}
                      ></div>
                      <span className="progress-text">{p.avanceEjecucion}%</span>
                    </div>
                  </td>
                    <td>{p.comentarios}</td>
                    {isAdmin && (
                      <td onClick={(e) => e.stopPropagation()}>
                        <button className="icon-btn edit" onClick={() => onEdit?.(p)}><Edit size={16}/></button>
                        <button className="icon-btn delete" onClick={() => { if(window.confirm('¿Seguro?')) onDelete?.(p.id) }}><Trash2 size={16}/></button>
                      </td>
                    )}
                    </tr>
                    
                    {expandedProjects.includes(p.id) && (
                      <tr className="expanded-row-timeline">
                        <td colSpan={isAdmin ? 22 : 19} style={{ padding: 0, backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)' }}>
                          <div className="horizontal-timeline-container">
                            <div style={{ fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>Flujo de Fechas del Proyecto</div>
                            <div className="horizontal-timeline">
                              {[
                                { label: 'Ingreso Taller', date: p.fechaIngresoTaller },
                                { label: 'Inicio Eval.', date: p.fechaInicioEvaluacion },
                                { label: 'Fin Eval.', date: p.fechaFinalEvaluacion },
                                { label: 'Emisión Informe', date: p.fechaEmisionInforme },
                                { label: 'Recepción OC', date: p.fechaRecepcionOc },
                                { label: 'Entrega Ofrecida', date: p.fechaEntregaOfrecida },
                                { label: 'Estimada Entrega', date: p.fechaEstimadaEntrega }
                              ].map((step, idx) => (
                                <div className="timeline-step" key={idx}>
                                  <div className={`timeline-dot ${step.date && step.date.toLowerCase() !== 'tbd' ? 'completed' : ''}`}>
                                    {step.date && step.date.toLowerCase() !== 'tbd' ? <Check size={12} color="white" /> : <X size={12} color="var(--text-secondary)" />}
                                  </div>
                                  <div className="timeline-date">{(step.date && step.date.toLowerCase() !== 'tbd') ? formatDate(step.date) : 'TBD'}</div>
                                  <div className="timeline-label">{step.label}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
