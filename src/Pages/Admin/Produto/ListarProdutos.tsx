import React, { useEffect, useState } from 'react';
import { Eye, Edit, Trash2, Ban, CheckCircle } from 'lucide-react';
import AdminSidebar from '../../../Components/AdminSidebar';
import EditarProdutoModal from '../../../Components/EditarProdutoModal';
import ProdutoDetalhesModal from '../../../Components/ProdutoDetalhesModal';
import '../../../Styles/Admin/adminDashBoard.css';
import '../../../Styles/Admin/Produto/ListarProdutos.css'; // Importação do CSS externo
import { listarProdutos, desativarProduto, excluirProduto, reativarProduto } from '../../../Services/produtoService';
import { resolveImageUrl } from '../../../config/api';

type ProdutoApi = {
    produtoId?: number;
    ProdutoId?: number;
    nomeProduto?: string;
    NomeProduto?: string;
    descricaoProduto?: string;
    DescricaoProduto?: string;
    valorCompra?: number;
    ValorCompra?: number;
    valorVenda?: number;
    ValorVenda?: number;
    quantidade?: number;
    Quantidade?: number;
    ativo?: boolean;
    Ativo?: boolean;
    tamanho?: string[];
    Tamanho?: string[];
    paisCodigoISO?: string;
    PaisCodigoISO?: string;
    imagemUrl?: string;
    ImagemUrl?: string;
};

const ListarProdutos: React.FC = () => {
    const [produtos, setProdutos] = useState<ProdutoApi[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [viewModalOpen, setViewModalOpen] = useState<boolean>(false);
    const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
    const [selectedProduto, setSelectedProduto] = useState<ProdutoApi | null>(null);
    const [statusFilter, setStatusFilter] = useState<'todos' | 'ativos' | 'inativos'>('todos');

    useEffect(() => {
        carregarProdutos();
    }, []);

    const carregarProdutos = async () => {
        try {
            setLoading(true);
            const data = await listarProdutos();
            setProdutos(data);
            setError(null);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Erro ao carregar produtos.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleView = (produto: ProdutoApi) => {
        setSelectedProduto(produto);
        setViewModalOpen(true);
    };

    const handleEdit = (produto: ProdutoApi) => {
        setSelectedProduto(produto);
        setEditModalOpen(true);
    };

    const handleEditSuccess = () => {
        setEditModalOpen(false);
        carregarProdutos();
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir permanentemente este produto?')) {
            try {
                await excluirProduto(id);
                carregarProdutos();
            } catch (err: unknown) {
                if (err instanceof Error) {
                    alert(err.message);
                } else {
                    alert('Erro ao excluir o produto.');
                }
            }
        }
    };

    const handleToggleAtivo = async (id: number, ativoAtual: boolean) => {
        const acao = ativoAtual ? 'inativar' : 'reativar';
        if (window.confirm(`Tem certeza que deseja ${acao} este produto?`)) {
            try {
                if (ativoAtual) {
                    await desativarProduto(id);
                } else {
                    await reativarProduto(id);
                }
                carregarProdutos();
            } catch (err: unknown) {
                if (err instanceof Error) {
                    alert(err.message);
                } else {
                    alert(`Erro ao ${acao} o produto.`);
                }
            }
        }
    };

    const produtosFiltrados = produtos.filter(produto => {
        if (statusFilter === 'todos') return true;
        
        const ativo = produto.ativo !== undefined ? produto.ativo : produto.Ativo;
        
        if (statusFilter === 'ativos') return ativo === true;
        if (statusFilter === 'inativos') return ativo === false;
        
        return true;
    });

    return (
        <div className="admin-dashboard-layout">
            <AdminSidebar />
            
            <main className="admin-dashboard-content">
                <header className="admin-dashboard-header">
                    <h2 className="admin-dashboard-title">Listar Produtos</h2>
                    <p className="admin-dashboard-subtitle">Visualize e gerencie os produtos do catálogo.</p>
                </header>
                
                <div className="admin-dashboard-body listar-produtos-container">
                    <div className="filtros-container" style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <label htmlFor="statusFilter" style={{ fontWeight: 500, color: '#e0e0e0' }}>Filtrar por Status:</label>
                        <select 
                            id="statusFilter" 
                            value={statusFilter} 
                            onChange={(e) => setStatusFilter(e.target.value as 'todos' | 'ativos' | 'inativos')}
                            style={{
                                padding: '8px 12px',
                                borderRadius: '6px',
                                border: '1px solid #444',
                                backgroundColor: '#2a2a2a',
                                color: '#fff',
                                outline: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="todos">Todos</option>
                            <option value="ativos">Ativos</option>
                            <option value="inativos">Inativos</option>
                        </select>
                    </div>

                    {loading && <div className="listar-produtos-loading">Carregando produtos...</div>}
                    {error && <div className="listar-produtos-error">{error}</div>}
                    
                    {!loading && !error && (
                        <div className="listar-produtos-table-wrapper">
                            <table className="listar-produtos-table">
                                <thead>
                                    <tr>
                                        <th className="text-left">ID</th>
                                        <th className="text-left">Produto</th>
                                        <th className="text-left">Preço</th>
                                        <th className="text-center">Estoque</th>
                                        <th className="text-center">Status</th>
                                        <th className="text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {produtosFiltrados.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="empty-state">Nenhum produto encontrado.</td>
                                        </tr>
                                    ) : (
                                        produtosFiltrados.map((produto) => {
                                            const id = produto.produtoId ?? produto.ProdutoId;
                                            if (id == null) {
                                                return null;
                                            }
                                            const imagemUrl = produto.imagemUrl || produto.ImagemUrl;
                                            const primeiraImagem = imagemUrl ? imagemUrl.split(',')[0].trim() : '';
                                            const nome = produto.nomeProduto || produto.NomeProduto;
                                            const preco = produto.valorVenda || produto.ValorVenda;
                                            const quantidade = produto.quantidade ?? produto.Quantidade ?? 0;
                                            const ativo = produto.ativo !== undefined ? produto.ativo : produto.Ativo;
                                            const ativoFlag = Boolean(ativo);

                                            return (
                                                <tr key={id}>
                                                    <td className="td-id">#{id}</td>
                                                    <td>
                                                        <div className="produto-info">
                                                            {primeiraImagem ? (
                                                                <img 
                                                                    src={resolveImageUrl(primeiraImagem)} 
                                                                    alt={nome} 
                                                                    className="produto-img" 
                                                                />
                                                            ) : (
                                                                <div className="produto-img-placeholder">
                                                                    <span>Sem img</span>
                                                                </div>
                                                            )}
                                                            <span className="produto-nome">{nome}</span>
                                                        </div>
                                                    </td>
                                                    <td className="font-medium">
                                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(preco || 0)}
                                                    </td>
                                                    <td className="text-center">
                                                        <span className={`estoque-badge ${quantidade > 10 ? 'ok' : 'baixo'}`}>
                                                            {quantidade} un.
                                                        </span>
                                                    </td>
                                                    <td className="text-center">
                                                        <span className={`status-badge ${ativoFlag ? 'ativo' : 'inativo'}`}>
                                                            <span className={`status-dot ${ativoFlag ? 'ativo' : 'inativo'}`}></span>
                                                            {ativoFlag ? 'Ativo' : 'Inativo'}
                                                        </span>
                                                    </td>
                                                    <td className="td-actions">
                                                        <div className="actions-container">
                                                            <button 
                                                                onClick={() => handleView(produto)} 
                                                                title="Visualizar" 
                                                                className="btn-action view"
                                                            >
                                                                <Eye size={18} />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleEdit(produto)} 
                                                                title="Editar" 
                                                                className="btn-action edit"
                                                            >
                                                                <Edit size={18} />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleToggleAtivo(id, ativoFlag)} 
                                                                title={ativoFlag ? "Inativar" : "Reativar"} 
                                                                className={`btn-action ${ativoFlag ? 'deactivate' : 'activate'}`}
                                                            >
                                                                {ativoFlag ? <Ban size={18} /> : <CheckCircle size={18} />}
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDelete(id)} 
                                                                title="Excluir" 
                                                                className="btn-action delete"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {/* Modal de Visualização do Produto */}
            {viewModalOpen && (
                <ProdutoDetalhesModal
                    produto={selectedProduto}
                    onClose={() => setViewModalOpen(false)}
                />
            )}

            {/* Modal de Edição do Produto */}
            {editModalOpen && (
                <EditarProdutoModal
                    produto={selectedProduto}
                    onClose={() => setEditModalOpen(false)}
                    onUpdateSuccess={handleEditSuccess}
                />
            )}
        </div>
    );
};

export default ListarProdutos;
