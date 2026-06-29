import React, { useState, useEffect } from 'react';
import { Admin, useStore } from '../store/useStore';

interface Props {
  admin?: Admin;
  onClose: () => void;
}

export default function AdminForm({ admin, onClose }: Props) {
  const addAdmin = useStore(state => state.addAdmin);
  const updateAdmin = useStore(state => state.updateAdmin);

  const [formData, setFormData] = useState<Partial<Admin>>({
    name: '',
    username: '',
    password: '',
    canManageUsers: false
  });

  useEffect(() => {
    if (admin) {
      setFormData(admin);
    }
  }, [admin]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (admin) {
      updateAdmin(admin.id, formData);
    } else {
      addAdmin({
        ...formData,
        id: `a_${Date.now()}`
      } as Admin);
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="form-grid">
      <div className="input-group col-span-full">
        <label>Nombre Completo</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} required />
      </div>
      <div className="input-group">
        <label>Correo Electrónico / Usuario</label>
        <input type="text" name="username" value={formData.username} onChange={handleChange} required />
      </div>
      <div className="input-group">
        <label>Contraseña</label>
        <input type="text" name="password" value={formData.password} onChange={handleChange} required />
      </div>

      <div className="input-group col-span-full" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
        <input type="checkbox" name="canManageUsers" checked={!!formData.canManageUsers} onChange={handleChange} id="canManageUsers" style={{ width: 'auto' }} />
        <label htmlFor="canManageUsers" style={{ marginBottom: 0, cursor: 'pointer' }}>Permitir gestionar Clientes y Administradores</label>
      </div>

      <div className="form-actions col-span-full">
        <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
        <button type="submit" className="btn-primary">Guardar</button>
      </div>
    </form>
  );
}
