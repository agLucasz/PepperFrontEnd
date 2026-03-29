import React, { useState } from 'react';
import { Mail, Lock, LogIn, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../../Styles/Admin/adminLogin.css';
import logo from '../../Assets/logo_pepper.png';
import { login } from '../../Services/authService';

const AdminLogin: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        try {
            const result = await login({ email, password });
            localStorage.setItem('pepperAuth', JSON.stringify(result));
            setSuccess('Login realizado com sucesso! Redirecionando...');
            setTimeout(() => {
                navigate('/admin/dashboard');
            }, 1500);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Erro ao realizar login. Tente novamente.');
            }
            setLoading(false);
        }
    };

    return (
        <div className="login-layout">
            <div className="login-container">
                <button className="back-button" onClick={() => navigate('/')}>
                    <ArrowLeft size={20} />
                    Voltar
                </button>
                
                <div className="login-box">
                    <div className="login-header">
                        <img src={logo} alt="Pepper Logo" className="login-logo" />
                        <h2 className="login-title">Área Restrita</h2>
                        <p className="login-subtitle">Faça login para gerenciar o catálogo</p>
                    </div>
                    
                    <form className="login-form" onSubmit={handleLogin}>
                        <div className="input-group">
                            <label htmlFor="email">E-mail</label>
                            <div className="input-wrapper">
                                <Mail className="input-icon" size={20} />
                                <input 
                                    type="email" 
                                    id="email"
                                    placeholder="admin@pepper.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label htmlFor="password">Senha</label>
                            <div className="input-wrapper">
                                <Lock className="input-icon" size={20} />
                                <input 
                                    type="password" 
                                    id="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="login-button" disabled={loading}>
                            {loading ? 'Entrando...' : 'Entrar'}
                            <LogIn size={20} />
                        </button>
                    </form>
                    {error && <p className="login-error">{error}</p>}
                    {success && <p className="login-success">{success}</p>}
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
