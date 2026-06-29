import React, { useState, useEffect } from 'react';
import { Project, useStore } from '../store/useStore';

interface Props {
  project?: Project;
  onClose: () => void;
}

export default function ProjectForm({ project, onClose }: Props) {
  const clients = useStore(state => state.clients);
  const addProject = useStore(state => state.addProject);
  const updateProject = useStore(state => state.updateProject);

  const [formData, setFormData] = useState<Partial<Project>>({
    tipoServicio: 'Evaluación de Componente',
    clientId: clients[0]?.id || '',
    docReferenciaCliente: '',
    guiaRemisionCliente: '',
    nProyectoEpiroc: '',
    nOpEpiroc: '',
    flota: '',
    descripcionComponente: '',
    np: '',
    ns: '',
    cantidad: 1,
    precio: 0,
    estado: 'Evaluación',
    fechaIngresoTaller: '',
    fechaInicioEvaluacion: '',
    fechaFinalEvaluacion: '',
    fechaEmisionInforme: '',
    nPresupuestoEpiroc: '',
    fechaRecepcionOc: '',
    nOcCliente: '',
    fechaEntregaOfrecida: '',
    fechaEstimadaEntrega: '',
    avanceEjecucion: 0,
    comentarios: ''
  });

  useEffect(() => {
    if (project) {
      setFormData(project);
    }
  }, [project]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'cantidad' || name === 'precio' || name === 'avanceEjecucion' ? Number(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (project) {
      updateProject(project.id, formData);
    } else {
      addProject({
        ...formData,
        id: `p_${Date.now()}`
      } as Project);
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="form-grid">
      {/* Fila 1 */}
      <div className="input-group">
        <label>Tipo de Servicio</label>
        <select name="tipoServicio" value={formData.tipoServicio} onChange={handleChange} required>
          <option value="Evaluación de Componente">Evaluación de Componente</option>
          <option value="Reparación de componente">Reparación de componente</option>
          <option value="Evaluación de equipo">Evaluación de equipo</option>
          <option value="Reparación de equipo">Reparación de equipo</option>
        </select>
      </div>
      <div className="input-group">
        <label>Cliente</label>
        <select name="clientId" value={formData.clientId} onChange={handleChange} required>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className="input-group">
        <label>Estado</label>
        <select name="estado" value={formData.estado} onChange={handleChange}>
          <option value="1. Espera de evaluación">1. Espera de evaluación</option>
          <option value="2. Proceso de evaluación">2. Proceso de evaluación</option>
          <option value="3. Espera de cotización">3. Espera de cotización</option>
          <option value="4. Espera de decisión">4. Espera de decisión</option>
          <option value="5. Espera de recursos">5. Espera de recursos</option>
          <option value="6. Espera de ejecución">6. Espera de ejecución</option>
          <option value="7. Proceso de ejecución">7. Proceso de ejecución</option>
          <option value="8. Proceso de despacho">8. Proceso de despacho</option>
          <option value="9. Proceso de facturación">9. Proceso de facturación</option>
          <option value="10. Cerrado">10. Cerrado</option>
          <option value="Cancelado">Cancelado</option>
          <option value="Stand By">Stand By</option>
        </select>
      </div>

      {/* Fila 2 */}
      <div className="input-group">
        <label>Nº Proyecto Epiroc</label>
        <input type="text" name="nProyectoEpiroc" value={formData.nProyectoEpiroc} onChange={handleChange} required />
      </div>
      <div className="input-group">
        <label>Nº OP Epiroc</label>
        <input type="text" name="nOpEpiroc" value={formData.nOpEpiroc} onChange={handleChange} />
      </div>
      <div className="input-group">
        <label>Flota</label>
        <input type="text" name="flota" value={formData.flota} onChange={handleChange} />
      </div>

      {/* Fila 3 */}
      <div className="input-group">
        <label>Doc Ref Cliente (SOLPED/OC)</label>
        <input type="text" name="docReferenciaCliente" value={formData.docReferenciaCliente} onChange={handleChange} />
      </div>
      <div className="input-group">
        <label>Nº Guía Remisión</label>
        <input type="text" name="guiaRemisionCliente" value={formData.guiaRemisionCliente} onChange={handleChange} />
      </div>
      <div className="input-group">
        <label>Descripción Componente</label>
        <input type="text" name="descripcionComponente" value={formData.descripcionComponente} onChange={handleChange} />
      </div>

      {/* Fila 4 */}
      <div className="input-group">
        <label>Número de Parte (N/P)</label>
        <input type="text" name="np" value={formData.np} onChange={handleChange} />
      </div>
      <div className="input-group">
        <label>Número de Serie (N/S)</label>
        <input type="text" name="ns" value={formData.ns} onChange={handleChange} />
      </div>
      <div className="input-group" style={{display: 'flex', flexDirection: 'row', gap: '1rem'}}>
        <div style={{flex: 1}}>
          <label>Cantidad</label>
          <input type="number" min="1" name="cantidad" value={formData.cantidad} onChange={handleChange} />
        </div>
        <div style={{flex: 1}}>
          <label>Precio (USD)</label>
          <input type="number" step="0.01" name="precio" value={formData.precio} onChange={handleChange} />
        </div>
      </div>

      {/* Fechas */}
      <div className="input-group">
        <label>Fecha Ingreso Taller</label>
        <input type="date" name="fechaIngresoTaller" value={formData.fechaIngresoTaller} onChange={handleChange} />
      </div>
      <div className="input-group">
        <label>Fecha Inicio Eval.</label>
        <input type="date" name="fechaInicioEvaluacion" value={formData.fechaInicioEvaluacion} onChange={handleChange} />
      </div>
      <div className="input-group">
        <label>Fecha Final Eval.</label>
        <input type="date" name="fechaFinalEvaluacion" value={formData.fechaFinalEvaluacion} onChange={handleChange} />
      </div>

      <div className="input-group">
        <label>Fecha Emisión Informe</label>
        <input type="date" name="fechaEmisionInforme" value={formData.fechaEmisionInforme} onChange={handleChange} />
      </div>
      <div className="input-group">
        <label>Nº Ppto Epiroc</label>
        <input type="text" name="nPresupuestoEpiroc" value={formData.nPresupuestoEpiroc} onChange={handleChange} />
      </div>
      <div className="input-group">
        <label>Fecha Recepción OC</label>
        <input type="date" name="fechaRecepcionOc" value={formData.fechaRecepcionOc} onChange={handleChange} />
      </div>

      <div className="input-group">
        <label>Nº OC Cliente</label>
        <input type="text" name="nOcCliente" value={formData.nOcCliente} onChange={handleChange} />
      </div>
      <div className="input-group">
        <label>Fecha Entrega Ofrecida</label>
        <input type="date" name="fechaEntregaOfrecida" value={formData.fechaEntregaOfrecida} onChange={handleChange} />
      </div>
      <div className="input-group">
        <label>Fecha Estimada Entrega</label>
        <input type="date" name="fechaEstimadaEntrega" value={formData.fechaEstimadaEntrega} onChange={handleChange} style={{ borderColor: 'var(--warning)', borderWidth: '2px' }} />
      </div>

      {/* Fila Final */}
      <div className="input-group">
        <label>Avance de Ejecución (%)</label>
        <input type="number" min="0" max="100" name="avanceEjecucion" value={formData.avanceEjecucion} onChange={handleChange} />
      </div>
      <div className="input-group col-span-full" style={{ gridColumn: 'span 2' }}>
        <label>Comentarios</label>
        <input type="text" name="comentarios" value={formData.comentarios} onChange={handleChange} />
      </div>

      <div className="form-actions col-span-full">
        <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
        <button type="submit" className="btn-primary">Guardar Proyecto</button>
      </div>
    </form>
  );
}
