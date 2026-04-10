import React, { useEffect, useState } from 'react';
import { Edit, Trash2, Tag, Save, X } from 'lucide-react';
import AdminSidebar from '../../../Components/AdminSidebar';
import { listarCategorias, atualizarCategoria, excluirCategoria, type CategoriaDTO } from '../../../Services/categoriaService';
import '../../../Styles/Admin/adminDashBoard.css';
import '../../../Styles/Admin/Categorias/ListarCategorias.css';

const ListarCategorias: React.FC = () => {
    const [categorias, setCategorias] = useState<CategoriaDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editando, setEditando] = useState<CategoriaDTO | null>(null);
    const [nomeEditado, setNomeEditado] = useState('');
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState<string | null>(null);

    useEffect(() => {
        carregarCategorias();
    }, []);

    const carregarCategorias = async () => {
        try {
            setLoading(true);
            const data = await listarCategorias();
            setCategorias(data);
            setError(null);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Erro ao carregar categorias.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (categoria: CategoriaDTO) => {
        setEditando(categoria);
        setNomeEditado(categoria.nomeCategoria);
        setEditError(null);
    };

    const handleEditSave = async () => {
        if (!editando) return;
        if (!nomeEditado.trim()) {
            setEditError('O nome da categoria é obrigatório.');
            return;
        }

        try {
            setEditLoading(true);
            setEditError(null);
            await atualizarCategoria(editando.categoriaId, { NomeCategoria: nomeEditado.trim() });
            setEditando(null);
            carregarCategorias();
        } catch (err) {
            if (err instanceof Error) {
                setEditError(err.message);
            } else {
                setEditError('Erro ao atualizar categoria.');
            }
        } finally {
            setEditLoading(false);
        }
    };

    const handleDelete = async (id: number, nome: string) => {
        if (!window.confirm(`Tem certeza que deseja excluir a categoria "${nome}"?`)) return;

        try {
            await excluirCategoria(id);
            carregarCategorias();
        } catch (err) {
            if (err instanceof Error) {
                alert(err.message);
            } else {
                alert('Erro ao excluir categoria.');
            }
        }
    };

    return (
        <div className="admin-dashboard-layout">
            <AdminSidebar />

            <main className="admin-dashboard-content">
                <header className="admin-dashboard-header">
                    <h2 className="admin-dashboard-title">Listar Categorias</h2>
                    <p className="admin-dashboard-subtitle">Gerencie as categorias cadastradas no sistema.</p>
                </header>

                <div className="admin-dashboard-body listar-categorias-container">
                    {loading && <div className="listar-categorias-loading">Carregando categorias...</div>}
                    {error && <div className="listar-categorias-error">{error}</div>}

                    {!loading && !error && (
                        <div className="listar-categorias-table-wrapper">
                            <table className="listar-categorias-table">
                                <thead>
                                    <tr>
                                        <th className="text-left">ID</th>
                                        <th className="text-left">Nome da Categoria</th>
                                        <th className="text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categorias.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="empty-state">
                                                Nenhuma categoria cadastrada.
                                            </td>
                                        </tr>
                                    ) : (
                                        categorias.map(categoria => (
                                            <tr key={categoria.categoriaId}>
                                                <td className="td-id">#{categoria.categoriaId}</td>
                                                <td>
                                                    <div className="categoria-nome">
                                                        <Tag size={16} className="categoria-nome-icon" />
                                                        {categoria.nomeCategoria}
                                                    </div>
                                                </td>
                                                <td className="td-actions">
                                                    <div className="actions-container">
                                                        <button
                                                            onClick={() => handleEdit(categoria)}
                                                            title="Editar"
                                                            className="btn-action edit"
                                                        >
                                                            <Edit size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(categoria.categoriaId, categoria.nomeCategoria)}
                                                            title="Excluir"
                                                            className="btn-action delete"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {/* Modal de edição */}
            {editando && (
                <div className="modal-overlay" onClick={() => setEditando(null)}>
                    <div className="editar-categoria-modal" onClick={e => e.stopPropagation()}>
                        <div className="editar-categoria-header">
                            <h3>Editar Categoria #{editando.categoriaId}</h3>
                            <button className="editar-categoria-close" onClick={() => setEditando(null)}>
                                <X size={22} />
                            </button>
                        </div>

                        <div className="editar-categoria-body">
                            {editError && <div className="error-message">{editError}</div>}
                            <div className="form-group">
                                <label>Nome da Categoria *</label>
                                <input
                                    type="text"
                                    value={nomeEditado}
                                    onChange={e => setNomeEditado(e.target.value)}
                                    placeholder="Nome da categoria"
                                    autoFocus
                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleEditSave(); } }}
                                />
                            </div>
                        </div>

                        <div className="editar-categoria-footer">
                            <button
                                type="button"
                                className="btn-cancelar"
                                onClick={() => setEditando(null)}
                                disabled={editLoading}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="btn-salvar"
                                onClick={handleEditSave}
                                disabled={editLoading}
                            >
                                <Save size={18} />
                                {editLoading ? 'Salvando...' : 'Salvar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListarCategorias;
