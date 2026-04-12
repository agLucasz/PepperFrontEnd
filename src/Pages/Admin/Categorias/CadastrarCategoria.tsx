import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag, Save, AlertCircle, CheckCircle } from 'lucide-react';
import AdminSidebar from '../../../Components/AdminSidebar';
import { cadastrarCategoria } from '../../../Services/categoriaService';
import '../../../Styles/Admin/adminDashBoard.css';
import '../../../Styles/Admin/Categorias/CadastrarCategoria.css';

const CadastrarCategoria: React.FC = () => {
    const navigate = useNavigate();
    const [nomeCategoria, setNomeCategoria] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!nomeCategoria.trim()) {
            setError('O nome da categoria é obrigatório.');
            return;
        }

        setLoading(true);
        try {
            await cadastrarCategoria({ NomeCategoria: nomeCategoria.trim(), Destaque: false });
            setSuccess('Categoria cadastrada com sucesso!');
            setNomeCategoria('');
            setTimeout(() => navigate('/admin/categorias/listar'), 2000);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Ocorreu um erro inesperado ao cadastrar a categoria.');
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
                    <h2 className="admin-dashboard-title">Cadastrar Categoria</h2>
                    <p className="admin-dashboard-subtitle">Crie uma nova categoria para organizar os produtos.</p>
                </header>

                <div className="cadastro-categoria-container">
                    <div className="cadastro-categoria-icon-wrapper">
                        <Tag size={36} />
                    </div>

                    {error && (
                        <div className="feedback-message feedback-error">
                            <AlertCircle size={20} />
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="feedback-message feedback-success">
                            <CheckCircle size={20} />
                            <span>{success}</span>
                        </div>
                    )}

                    <form className="cadastro-categoria-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="NomeCategoria">Nome da Categoria *</label>
                            <input
                                type="text"
                                id="NomeCategoria"
                                value={nomeCategoria}
                                onChange={e => setNomeCategoria(e.target.value)}
                                placeholder="Ex: Camisas Nacionais, Importadas, Retrô..."
                                required
                                autoFocus
                            />
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn-cancelar"
                                onClick={() => navigate('/admin/categorias')}
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="btn-salvar"
                                disabled={loading}
                            >
                                {loading ? 'Salvando...' : 'Salvar Categoria'}
                                <Save size={18} />
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default CadastrarCategoria;
