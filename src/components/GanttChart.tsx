import { useMemo } from 'react';
import { Project } from '../store/useStore';
import { differenceInDays, parseISO, isValid, format, isBefore, isAfter, startOfDay } from 'date-fns';

interface Props {
  projects: Project[];
}

export default function GanttChart({ projects }: Props) {
  const { minDate, maxDate, totalDays, todayPercentage, validProjects } = useMemo(() => {
    const today = startOfDay(new Date());
    let minD = today;
    let maxD = today;
    const vProjects: (Project & { startDate: Date; endDate: Date })[] = [];

    projects.forEach(p => {
      const startStr = p.fechaIngresoTaller || p.fechaInicioEvaluacion;
      const endStr = p.fechaEstimadaEntrega || p.fechaEntregaOfrecida;
      
      if (startStr && endStr) {
        const startDate = parseISO(startStr);
        const endDate = parseISO(endStr);
        
        if (isValid(startDate) && isValid(endDate)) {
          vProjects.push({ ...p, startDate, endDate });
          if (isBefore(startDate, minD)) minD = startDate;
          if (isAfter(endDate, maxD)) maxD = endDate;
        }
      }
    });

    // Add some padding to min/max dates
    minD = new Date(minD.getTime() - 7 * 24 * 60 * 60 * 1000); // minus 7 days
    maxD = new Date(maxD.getTime() + 14 * 24 * 60 * 60 * 1000); // plus 14 days

    const tDays = Math.max(1, differenceInDays(maxD, minD));
    const tPerc = Math.max(0, Math.min(100, (differenceInDays(today, minD) / tDays) * 100));

    return {
      minDate: minD,
      maxDate: maxD,
      totalDays: tDays,
      todayPercentage: tPerc,
      validProjects: vProjects
    };
  }, [projects]);

  if (validProjects.length === 0) {
    return <div className="stat-card" style={{ padding: '2rem', textAlign: 'center' }}>No hay suficientes fechas ingresadas para mostrar el Gantt.</div>;
  }

  return (
    <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'stretch', padding: '1.5rem', overflowX: 'auto' }}>
      <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Cronograma de Proyectos (Gantt)</h3>
      
      <div style={{ position: 'relative', minWidth: '600px', paddingBottom: '1rem' }}>
        {/* Timeline Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          <span>{format(minDate, 'dd MMM yyyy')}</span>
          <span>{format(maxDate, 'dd MMM yyyy')}</span>
        </div>

        {/* Today Marker */}
        <div style={{
          position: 'absolute',
          top: '40px',
          bottom: 0,
          left: `${todayPercentage}%`,
          width: '2px',
          backgroundColor: 'var(--danger)',
          zIndex: 10
        }}>
          <div style={{
            position: 'absolute',
            top: '-25px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'var(--danger)',
            color: 'white',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '0.7rem',
            fontWeight: 'bold'
          }}>Hoy</div>
        </div>

        {/* Project Bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {validProjects.map((p) => {
            const leftPerc = Math.max(0, (differenceInDays(p.startDate, minDate) / totalDays) * 100);
            const widthPerc = Math.max(1, (differenceInDays(p.endDate, p.startDate) / totalDays) * 100);
            
            return (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', position: 'relative', height: '30px' }}>
                <div style={{ width: '150px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginRight: '1rem' }} title={p.flota || p.tipoServicio}>
                  {p.flota || p.tipoServicio || 'Proyecto'}
                </div>
                <div style={{ flex: 1, position: 'relative', height: '100%', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px' }}>
                  <div style={{
                    position: 'absolute',
                    left: `${leftPerc}%`,
                    width: `${widthPerc}%`,
                    height: '100%',
                    backgroundColor: p.avanceEjecucion === 100 ? 'var(--accent-secondary)' : 'var(--accent-primary)',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 0.5rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    overflow: 'hidden'
                  }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: p.avanceEjecucion === 100 ? 'white' : '#1e293b' }}>
                      {p.avanceEjecucion}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
