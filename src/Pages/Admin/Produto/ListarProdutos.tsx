import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash2, X } from 'lucide-react';
import AdminSidebar from '../../../Components/AdminSidebar';
import '../../../Styles/Admin/adminDashBoard.css';
import '../../../Styles/Admin/Produto/ListarProdutos.css'; // Importação do CSS externo
import { listarProdutos, desativarProduto } from '../../../Services/produtoService';

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
    const [selectedProduto, setSelectedProduto] = useState<ProdutoApi | null>(null);

    const navigate = useNavigate();
    const API_BASE_URL = 'https://localhost:7035';

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

    const handleEdit = (id: number) => {
        navigate(`/admin/produto/editar/${id}`);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir/desativar este produto?')) {
            try {
                await desativarProduto(id);
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

    return (
        <div className="admin-dashboard-layout">
            <AdminSidebar />
            
            <main className="admin-dashboard-content">
                <header className="admin-dashboard-header">
                    <h2 className="admin-dashboard-title">Listar Produtos</h2>
                    <p className="admin-dashboard-subtitle">Visualize e gerencie os produtos do catálogo.</p>
                </header>
                
                <div className="admin-dashboard-body listar-produtos-container">
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
                                    {produtos.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="empty-state">Nenhum produto encontrado.</td>
                                        </tr>
                                    ) : (
                                        produtos.map((produto) => {
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

                                            return (
                                                <tr key={id}>
                                                    <td className="td-id">#{id}</td>
                                                    <td>
                                                        <div className="produto-info">
                                                            {primeiraImagem ? (
                                                                <img 
                                                                    src={`${API_BASE_URL}${primeiraImagem}`} 
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
                                                        <span className={`status-badge ${ativo ? 'ativo' : 'inativo'}`}>
                                                            <span className={`status-dot ${ativo ? 'ativo' : 'inativo'}`}></span>
                                                            {ativo ? 'Ativo' : 'Inativo'}
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
                                                                onClick={() => handleEdit(id)} 
                                                                title="Editar" 
                                                                className="btn-action edit"
                                                            >
                                                                <Edit size={18} />
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
            {viewModalOpen && selectedProduto && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                    justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: '#fff', padding: '24px', borderRadius: '8px',
                        width: '600px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto',
                        position: 'relative', boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}>
                        <button 
                            onClick={() => setViewModalOpen(false)}
                            style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                            <X size={24} color="#666" />
                        </button>
                        
                        <h3 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '12px', marginBottom: '20px', color: '#333' }}>
                            Detalhes do Produto
                        </h3>
                        
                        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                            <div style={{ flexShrink: 0 }}>
                                {selectedProduto.imagemUrl || selectedProduto.ImagemUrl ? (
                                    <img 
                                        src={`${API_BASE_URL}${selectedProduto.imagemUrl || selectedProduto.ImagemUrl}`} 
                                        alt={selectedProduto.nomeProduto || selectedProduto.NomeProduto} 
                                        style={{ width: '180px', height: '180px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #eee' }} 
                                    />
                                ) : (
                                    <div style={{ width: '180px', height: '180px', backgroundColor: '#f5f5f5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #eee' }}>
                                        <span style={{ color: '#888' }}>Sem imagem</span>
                                    </div>
                                )}
                            </div>
                            <div style={{ flex: 1, minWidth: '250px', display: 'flex', flexDirection: 'column', gap: '8px', color: '#444' }}>
                                <p style={{ margin: 0 }}><strong>ID:</strong> {selectedProduto.produtoId || selectedProduto.ProdutoId}</p>
                                <p style={{ margin: 0 }}><strong>Nome:</strong> {selectedProduto.nomeProduto || selectedProduto.NomeProduto}</p>
                                <p style={{ margin: 0 }}><strong>Descrição:</strong> {selectedProduto.descricaoProduto || selectedProduto.DescricaoProduto || 'Nenhuma descrição informada'}</p>
                                <p style={{ margin: 0 }}><strong>Preço de Compra:</strong> {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedProduto.valorCompra || selectedProduto.ValorCompra || 0)}</p>
                                <p style={{ margin: 0 }}><strong>Preço de Venda:</strong> {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedProduto.valorVenda || selectedProduto.ValorVenda || 0)}</p>
                                <p style={{ margin: 0 }}><strong>Quantidade em Estoque:</strong> {(selectedProduto.quantidade ?? selectedProduto.Quantidade) ?? 0}</p>
                                <p style={{ margin: 0 }}>
                                    <strong>Tamanhos:</strong>{' '}
                                    {(() => {
                                        const tamanhos = selectedProduto.tamanho || selectedProduto.Tamanho;
                                        return tamanhos && tamanhos.length > 0 ? tamanhos.join(', ') : 'Nenhum';
                                    })()}
                                </p>
                                <p style={{ margin: 0 }}><strong>País (ISO):</strong> {selectedProduto.paisCodigoISO || selectedProduto.PaisCodigoISO}</p>
                                <p style={{ margin: 0 }}><strong>Status:</strong> <span style={{ color: (selectedProduto.ativo !== undefined ? selectedProduto.ativo : selectedProduto.Ativo) ? '#1e8e3e' : '#d93025', fontWeight: 'bold' }}>
                                    {(selectedProduto.ativo !== undefined ? selectedProduto.ativo : selectedProduto.Ativo) ? 'Ativo' : 'Inativo'}
                                </span></p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListarProdutos;
