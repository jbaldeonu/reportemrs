import React, { useState, useEffect } from 'react';
import { Client, useStore } from '../store/useStore';

interface Props {
  client?: Client;
  onClose: () => void;
}

export default function ClientForm({ client, onClose }: Props) {
  const addClient = useStore(state => state.addClient);
  const updateClient = useStore(state => state.updateClient);

  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    username: '',
    password: ''
  });

  useEffect(() => {
    if (client) {
      setFormData(client);
    }
  }, [client]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (client) {
      updateClient(client.id, formData);
    } else {
      addClient({
        ...formData,
        id: `c_${Date.now()}`
      } as Client);
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="form-grid">
      <div className="input-group col-span-full">
        <label>Nombre del Cliente (Empresa)</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} required />
      </div>
      <div className="input-group">
        <label>Usuario (Login)</label>
        <input type="text" name="username" value={formData.username} onChange={handleChange} required />
      </div>
      <div className="input-group">
        <label>Contraseña</label>
        <input type="text" name="password" value={formData.password} onChange={handleChange} required />
      </div>

      <div className="form-actions col-span-full">
        <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
        <button type="submit" className="btn-primary">Guardar</button>
      </div>
    </form>
  );
}
