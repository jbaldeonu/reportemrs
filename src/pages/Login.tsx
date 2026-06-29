import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Lock, User } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const login = useStore((state) => state.login);
  const clients = useStore((state) => state.clients);
  const admins = useStore((state) => state.admins);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Admin login mock
    const admin = admins.find(a => a.username === username && a.password === password);
    if (admin) {
      login({ id: admin.id, username: admin.username, role: 'ADMIN', canManageUsers: admin.canManageUsers });
      navigate('/admin');
      return;
    }

    // Client login mock
    const client = clients.find(c => c.username === username && c.password === password);
    if (client) {
      login({ id: `user_${client.id}`, username: client.username, role: 'CLIENT', clientId: client.id });
      navigate('/client');
      return;
    }

    setError('Credenciales inválidas. Por favor intente de nuevo.');
  };

  return (
    <div className="login-container">
      <div className="login-bg" style={{ backgroundImage: 'url(/bg.jpg)' }}></div>
      <div className="login-card">
        <div className="login-header">
          <div className="epiroc-logo-text-light" style={{ marginBottom: '1rem', fontSize: '2rem' }}>EPIROC</div>
          <h2>Technical Service</h2>
          <p>Bienvenido, inicie sesión para continuar</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="input-group">
            <label>Usuario</label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingrese su usuario"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Contraseña</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingrese su contraseña"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary login-btn">
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
}
