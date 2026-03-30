import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Save, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import AdminSidebar from '../../../Components/AdminSidebar';
import '../../../Styles/Admin/adminDashBoard.css';
import '../../../Styles/Admin/Estoque/lancarEstoque.css';
import { lancarEntrada, type EntradaEstoqueCreateDTO } from '../../../Services/estoqueService';
import { listarProdutos } from '../../../Services/produtoService';

type ProdutoApi = {
    produtoId?: number;
    ProdutoId?: number;
    nomeProduto?: string;
    NomeProduto?: string;
};

const LancarEstoque: React.FC = () => {
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Campos do formulário
    const [produtoSelecionadoId, setProdutoSelecionadoId] = useState<number | null>(null);
    const [produtoBuscaStr, setProdutoBuscaStr] = useState<string>('');
    const [quantidade, setQuantidade] = useState<number>(1);
    const [dataEntrada, setDataEntrada] = useState<string>(new Date().toISOString().split('T')[0]);

    // Modal de produtos
    const [showProdutoModal, setShowProdutoModal] = useState(false);
    const [produtos, setProdutos] = useState<ProdutoApi[]>([]);
    const [loadingProdutos, setLoadingProdutos] = useState(false);
    const [termoBusca, setTermoBusca] = useState('');

    const carregarProdutos = useCallback(async () => {
        try {
            setLoadingProdutos(true);
            const data = await listarProdutos();
            setProdutos(data);
        } catch (err) {
            console.error('Erro ao carregar produtos', err);
        } finally {
            setLoadingProdutos(false);
        }
    }, []);

    useEffect(() => {
        if (showProdutoModal && produtos.length === 0) {
            carregarProdutos();
        }
    }, [showProdutoModal, produtos.length, carregarProdutos]);

    const handleKeyDownProduto = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const pId = parseInt(produtoBuscaStr, 10);
            if (!isNaN(pId)) {
                const p = produtos.find((prod) => (prod.ProdutoId ?? prod.produtoId) === pId);
                if (p) {
                    selecionarProduto(p);
                    return;
                }
            }
            setShowProdutoModal(true);
        }
    };

    const selecionarProduto = (produto: ProdutoApi) => {
        const id = produto.ProdutoId ?? produto.produtoId;
        const nome = produto.NomeProduto ?? produto.nomeProduto;

        if (id != null) setProdutoSelecionadoId(id);
        if (nome != null) setProdutoBuscaStr(nome);
        
        setShowProdutoModal(false);
    };

    const handleLancar = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        let finalProdutoId = produtoSelecionadoId;

        // Tenta resolver o produto se o usuário digitou o ID mas não apertou Enter
        if (!finalProdutoId && produtoBuscaStr) {
            const pIdStr = parseInt(produtoBuscaStr, 10);
            if (!isNaN(pIdStr) && pIdStr > 0) {
                finalProdutoId = pIdStr;
            }
        }

        if (!finalProdutoId || finalProdutoId <= 0) {
            setError('Selecione um produto válido.');
            return;
        }

        if (quantidade <= 0) {
            setError('A quantidade deve ser maior que zero.');
            return;
        }

        if (!dataEntrada) {
            setError('Informe a data de entrada.');
            return;
        }

        try {
            setLoading(true);
            const dto: EntradaEstoqueCreateDTO = {
                produtoId: finalProdutoId,
                quantidadeProduto: quantidade,
                dataEntrada: new Date(dataEntrada).toISOString()
            };

            await lancarEntrada(dto);
            
            setSuccess('Entrada de estoque lançada com sucesso!');
            
            // Limpar form
            setProdutoSelecionadoId(null);
            setProdutoBuscaStr('');
            setQuantidade(1);
            
            setTimeout(() => {
                setSuccess(null);
            }, 3000);

        } catch (err: any) {
            setError(err.message || 'Erro ao lançar estoque.');
        } finally {
            setLoading(false);
        }
    };

    const produtosFiltrados = produtos.filter(p => {
        if (!termoBusca) return true;
        const termo = termoBusca.toLowerCase();
        const nome = (p.NomeProduto ?? p.nomeProduto ?? '').toLowerCase();
        const id = (p.ProdutoId ?? p.produtoId ?? '').toString();
        return nome.includes(termo) || id.includes(termo);
    });

    return (
        <div className="admin-dashboard-layout">
            <AdminSidebar />
            
            <main className="admin-dashboard-content">
                <header className="admin-dashboard-header">
                    <div className="header-with-back">
                        <button onClick={() => navigate('/admin/estoque')} className="btn-back" title="Voltar">
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h2 className="admin-dashboard-title">Lançar Entrada</h2>
                            <p className="admin-dashboard-subtitle">Adicione produtos ao estoque do sistema.</p>
                        </div>
                    </div>
                </header>
                
                <div className="admin-dashboard-body">
                    <div className="lancar-estoque-container">
                        
                        {error && (
                            <div className="alert-message error">
                                <AlertCircle size={20} />
                                <span>{error}</span>
                            </div>
                        )}

                        {success && (
                            <div className="alert-message success">
                                <CheckCircle size={20} />
                                <span>{success}</span>
                            </div>
                        )}

                        <form onSubmit={handleLancar} className="lancar-estoque-form panel-box">
                            <h3 className="form-title">Detalhes da Entrada</h3>
                            
                            <div className="form-grid-centered">
                                <div className="form-group full-width">
                                    <label>Produto (ID ou Nome) *</label>
                                    <div className="input-with-icon">
                                        <input 
                                            type="text" 
                                            value={produtoBuscaStr}
                                            onChange={(e) => {
                                                setProdutoBuscaStr(e.target.value);
                                                setProdutoSelecionadoId(null);
                                            }}
                                            onKeyDown={handleKeyDownProduto}
                                            placeholder="Digite o ID e tecle Enter ou clique na lupa..."
                                            className="form-input"
                                        />
                                        <button 
                                            type="button" 
                                            className="icon-button"
                                            onClick={() => setShowProdutoModal(true)}
                                            title="Buscar Produto"
                                        >
                                            <Search size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="form-group half-width">
                                    <label>Quantidade *</label>
                                    <input 
                                        type="number" 
                                        value={quantidade}
                                        onChange={(e) => setQuantidade(parseInt(e.target.value) || 0)}
                                        min="1"
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-group half-width">
                                    <label>Data de Entrada *</label>
                                    <input 
                                        type="date" 
                                        value={dataEntrada}
                                        onChange={(e) => setDataEntrada(e.target.value)}
                                        className="form-input"
                                    />
                                </div>
                            </div>

                            <div className="form-actions-centered">
                                <button type="submit" className="btn-success btn-large" disabled={loading}>
                                    {loading ? 'Salvando...' : 'Salvar Entrada'}
                                    <Save size={18} />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>

            {/* Modal de Busca de Produtos */}
            {showProdutoModal && (
                <div className="modal-overlay" onClick={() => setShowProdutoModal(false)}>
                    <div className="modal-content produto-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Buscar Produto</h3>
                            <button className="btn-close" onClick={() => setShowProdutoModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <input 
                                type="text" 
                                placeholder="Buscar por nome ou ID..." 
                                value={termoBusca}
                                onChange={(e) => setTermoBusca(e.target.value)}
                                className="form-input mb-4"
                                autoFocus
                            />
                            
                            {loadingProdutos ? (
                                <p className="text-center mt-4">Carregando...</p>
                            ) : (
                                <div className="produto-list-grid">
                                    {produtosFiltrados.map(p => {
                                        const id = p.ProdutoId ?? p.produtoId;
                                        const nome = p.NomeProduto ?? p.nomeProduto;

                                        return (
                                            <div key={id} className="produto-select-card" onClick={() => selecionarProduto(p)}>
                                                <div className="produto-select-info">
                                                    <span className="produto-select-id">#{id} - {nome || 'Sem Nome'}</span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                    {produtosFiltrados.length === 0 && (
                                        <p className="text-center mt-4 w-100">Nenhum produto encontrado.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LancarEstoque;
