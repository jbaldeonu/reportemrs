import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 'ADMIN' | 'CLIENT';

export interface User {
  id: string;
  username: string;
  role: Role;
  clientId?: string;
  canManageUsers?: boolean;
}

export interface Client {
  id: string;
  name: string;
  username: string;
  password?: string;
}

export interface Admin {
  id: string;
  name: string;
  username: string;
  password?: string;
  canManageUsers?: boolean;
}

export interface Project {
  id: string;
  tipoServicio: string;
  clientId: string;
  docReferenciaCliente: string;
  guiaRemisionCliente: string;
  nProyectoEpiroc: string;
  nOpEpiroc: string;
  flota: string;
  descripcionComponente: string;
  np: string;
  ns: string;
  cantidad: number;
  precio: number;
  estado: string;
  fechaIngresoTaller: string;
  fechaInicioEvaluacion: string;
  fechaFinalEvaluacion: string;
  fechaEmisionInforme: string;
  nPresupuestoEpiroc: string;
  fechaRecepcionOc: string;
  nOcCliente: string;
  fechaEntregaOfrecida: string;
  fechaEstimadaEntrega: string;
  avanceEjecucion: number;
  comentarios: string;
}

interface AppState {
  currentUser: User | null;
  clients: Client[];
  projects: Project[];
  admins: Admin[];
  
  login: (user: User) => void;
  logout: () => void;
  
  addClient: (client: Client) => void;
  updateClient: (id: string, data: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  
  addAdmin: (admin: Admin) => void;
  updateAdmin: (id: string, data: Partial<Admin>) => void;
  deleteAdmin: (id: string) => void;
  
  addProject: (project: Project) => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;
}

const initialClients: Client[] = [
  { id: 'c1', name: 'COMPAÑIA MINERA ANTAMINA S.A', username: 'antamina', password: 'password' },
];

const initialAdmins: Admin[] = [
  { id: 'admin1', name: 'Jhon Baldeon', username: 'jhon.baldeon@epiroc.com', password: 'adminreportes1*', canManageUsers: true }
];

const initialProjects: Project[] = [
  {
    id: 'p1',
    tipoServicio: 'Evaluación de Componente',
    clientId: 'c1',
    docReferenciaCliente: 'SOLPED 1300030170',
    guiaRemisionCliente: 'EG07-00024008',
    nProyectoEpiroc: 'PR000755',
    nOpEpiroc: 'PENDIENTE',
    flota: 'PV351',
    descripcionComponente: 'BASTIDOR LH',
    np: '2657730145',
    ns: 'S/N',
    cantidad: 1,
    precio: 400483.79,
    estado: '4. Espera de decisión',
    fechaIngresoTaller: '2026-02-25',
    fechaInicioEvaluacion: '2026-03-10',
    fechaFinalEvaluacion: '2026-03-18',
    fechaEmisionInforme: '2026-03-29',
    nPresupuestoEpiroc: '7035-2026',
    fechaRecepcionOc: '',
    nOcCliente: '',
    fechaEntregaOfrecida: '',
    fechaEstimadaEntrega: '2026-06-30',
    avanceEjecucion: 0,
    comentarios: 'Ppto actualizado enviado el 24/05'
  },
];

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      currentUser: null,
      clients: initialClients,
      projects: initialProjects,
      admins: initialAdmins,

      login: (user) => set({ currentUser: user }),
      logout: () => set({ currentUser: null }),

      addClient: (client) => set((state) => ({ clients: [...state.clients, client] })),
      updateClient: (id, data) => set((state) => ({
        clients: state.clients.map(c => c.id === id ? { ...c, ...data } : c)
      })),
      deleteClient: (id) => set((state) => ({
        clients: state.clients.filter(c => c.id !== id)
      })),

      addAdmin: (admin) => set((state) => ({ admins: [...state.admins, admin] })),
      updateAdmin: (id, data) => set((state) => ({
        admins: state.admins.map(a => a.id === id ? { ...a, ...data } : a)
      })),
      deleteAdmin: (id) => set((state) => ({
        admins: state.admins.filter(a => a.id !== id)
      })),

      addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
      updateProject: (id, data) => set((state) => ({
        projects: state.projects.map(p => p.id === id ? { ...p, ...data } : p)
      })),
      deleteProject: (id) => set((state) => ({
        projects: state.projects.filter(p => p.id !== id)
      })),
    }),
    {
      name: 'dashboard-storage',
    }
  )
);
