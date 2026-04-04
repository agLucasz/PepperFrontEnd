import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, AlertCircle } from 'lucide-react';
import AdminSidebar from '../../../Components/AdminSidebar';
import { cadastrarUsuario } from '../../../Services/usuarioService';
import type { UsuarioCreateDTO } from '../../../Services/usuarioService';
import '../../../Styles/Admin/adminDashBoard.css';
import '../../../Styles/Admin/Empresa/CadastrarEmpresa.css';

const CadastrarEmpresa: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [formData, setFormData] = useState<UsuarioCreateDTO>({
        Nome: '',
        Email: '',
        SenhaHash: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            await cadastrarUsuario(formData);
            setSuccess('Empresa cadastrada com sucesso!');
            
            // Reset form
            setFormData({
                Nome: '',
                Email: '',
                SenhaHash: ''
            });

            setTimeout(() => {
                navigate('/admin/dashboard'); // Redirect somewhere
            }, 2000);

        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Ocorreu um erro desconhecido ao cadastrar a empresa.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-dashboard-layout">
            <AdminSidebar />
            
            <main className="admin-dashboard-content">
                <header className="admin-dashboard-header">
                    <h2 className="admin-dashboard-title">Cadastrar Empresa</h2>
                    <p className="admin-dashboard-subtitle">Adicione uma nova empresa ao sistema.</p>
                </header>

                <div className="admin-dashboard-body cadastrar-empresa-container">
                    <div className="cadastro-empresa-card">
                        {error && (
                            <div className="message-box error-box">
                                <AlertCircle size={20} />
                                <span>{error}</span>
                            </div>
                        )}
                        
                        {success && (
                            <div className="message-box success-box">
                                <Save size={20} />
                                <span>{success}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="cadastro-empresa-form">
                            <div className="form-group-empresa">
                                <label htmlFor="Nome">Nome da Empresa *</label>
                                <input 
                                    type="text" 
                                    id="Nome" 
                                    name="Nome" 
                                    value={formData.Nome}
                                    onChange={handleInputChange}
                                    placeholder="Ex: Minha Loja Ltda"
                                    required
                                />
                            </div>

                            <div className="form-group-empresa">
                                <label htmlFor="Email">E-mail *</label>
                                <input 
                                    type="email" 
                                    id="Email" 
                                    name="Email" 
                                    value={formData.Email}
                                    onChange={handleInputChange}
                                    placeholder="email@empresa.com"
                                    required
                                />
                            </div>

                            <div className="form-group-empresa">
                                <label htmlFor="SenhaHash">Senha *</label>
                                <input 
                                    type="password" 
                                    id="SenhaHash" 
                                    name="SenhaHash" 
                                    value={formData.SenhaHash}
                                    onChange={handleInputChange}
                                    placeholder="••••••••"
                                    required
                                />
                                <span className="senha-hint">
                                    A senha deve conter no mínimo 8 caracteres com maiúscula, minúscula, número e símbolo.
                                </span>
                            </div>

                            <div className="form-actions-empresa">
                                <button 
                                    type="button" 
                                    className="btn-cancelar-empresa"
                                    onClick={() => navigate('/admin/dashboard')}
                                    disabled={loading}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn-salvar-empresa"
                                    disabled={loading}
                                >
                                    {loading ? 'Salvando...' : 'Salvar Empresa'}
                                    <Save size={18} />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CadastrarEmpresa;