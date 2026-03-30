import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import AdminSidebar from '../../../Components/AdminSidebar';
import '../../../Styles/Admin/adminDashBoard.css';
import '../../../Styles/Admin/Venda/cadastrarVenda.css';
import { lancarVenda, type VendaCreateDTO, type VendaItemCreateDTO } from '../../../Services/vendaService';
import { listarProdutos } from '../../../Services/produtoService';

type ProdutoApi = {
    produtoId?: number;
    ProdutoId?: number;
    nomeProduto?: string;
    NomeProduto?: string;
    valorVenda?: number;
    ValorVenda?: number;
};

const CadastrarVenda: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);


    const [itens, setItens] = useState<(VendaItemCreateDTO & { NomeProduto: string })[]>([]);

    const [produtoIdStr, setProdutoIdStr] = useState<string>('');
    const [quantidade, setQuantidade] = useState<number>(1);
    const [valorUnitario, setValorUnitario] = useState<number>(0);
    const [nomeProdutoAtual, setNomeProdutoAtual] = useState<string>('');


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
            const pId = parseInt(produtoIdStr, 10);
            if (!isNaN(pId)) {
                // Tenta achar o produto na lista se já carregada
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
        const valor = produto.ValorVenda ?? produto.valorVenda;

        if (id != null) setProdutoIdStr(id.toString());
        if (nome != null) setNomeProdutoAtual(nome);
        if (valor != null) setValorUnitario(valor);
        
        setQuantidade(1);
        setShowProdutoModal(false);
    };

    const adicionarItem = () => {
        const pId = parseInt(produtoIdStr, 10);
        if (isNaN(pId) || pId <= 0) {
            setError('Informe um ID de produto válido.');
            return;
        }
        if (quantidade <= 0) {
            setError('A quantidade deve ser maior que zero.');
            return;
        }
        if (valorUnitario < 0) {
            setError('O valor unitário não pode ser negativo.');
            return;
        }

        const novoItem = {
            ProdutoId: pId,
            QuantidadeItem: quantidade,
            ValorUnitario: valorUnitario,
            NomeProduto: nomeProdutoAtual || `Produto #${pId}`
        };

        setItens([...itens, novoItem]);
        setError(null);
        

        setProdutoIdStr('');
        setNomeProdutoAtual('');
        setQuantidade(1);
        setValorUnitario(0);
    };

    const removerItem = (index: number) => {
        const novosItens = [...itens];
        novosItens.splice(index, 1);
        setItens(novosItens);
    };

    const valorTotal = itens.reduce((acc, item) => acc + (item.QuantidadeItem * item.ValorUnitario), 0);

    const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const onlyDigits = value.replace(/\D/g, '');
        if (!onlyDigits) {
            setValorUnitario(0);
            return;
        }
        const numericValue = parseInt(onlyDigits, 10) / 100;
        setValorUnitario(numericValue);
    };

    const finalizarVenda = async (confirmarDesconto: boolean = false) => {
        if (itens.length === 0) {
            setError('Adicione pelo menos um item para finalizar a venda.');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        const vendaDto: VendaCreateDTO = {
            DtVenda: new Date().toISOString(),
            Items: itens.map(i => ({
                ProdutoId: i.ProdutoId,
                QuantidadeItem: i.QuantidadeItem,
                ValorUnitario: i.ValorUnitario
            }))
        };

        try {
            await lancarVenda(vendaDto, confirmarDesconto);
            setSuccess('Venda finalizada com sucesso!');
            setItens([]);
            
            setTimeout(() => {
                navigate('/admin/vendas/listar');
            }, 2000);
        } catch (err: unknown) {
            if (err instanceof Error) {
                if (err.message.includes('Confirme o desconto')) {
                    const confirm = window.confirm(`${err.message}\n\nDeseja prosseguir com a venda aplicando o desconto?`);
                    if (confirm) {
                        finalizarVenda(true);
                        return;
                    }
                } else {
                    setError(err.message);
                }
            } else {
                setError('Ocorreu um erro inesperado ao finalizar a venda.');
            }
            setLoading(false);
        }
    };

    const produtosFiltrados = produtos.filter((p) => {
        const nome = (p.NomeProduto ?? p.nomeProduto ?? '').toLowerCase();
        const busca = termoBusca.toLowerCase();
        return nome.includes(busca) || (p.ProdutoId ?? p.produtoId)?.toString() === busca;
    });

    return (
        <div className="admin-dashboard-layout">
            <AdminSidebar />
            
            <main className="admin-dashboard-content">
                <header className="admin-dashboard-header">
                    <h2 className="admin-dashboard-title">Frente de Caixa (PDV)</h2>
                    <p className="admin-dashboard-subtitle">Registre os itens e finalize a venda.</p>
                </header>

                <div className="admin-dashboard-body pdv-container">
                    {/* Feedback Messages */}
                    {error && (
                        <div className="feedback-message error">
                            <AlertCircle size={20} />
                            <span>{error}</span>
                        </div>
                    )}
                    {success && (
                        <div className="feedback-message success">
                            <CheckCircle size={20} />
                            <span>{success}</span>
                        </div>
                    )}

                    <div className="pdv-layout">
                        {/* Lado Esquerdo - Formulário de Item */}
                        <div className="pdv-form-section panel-box">
                            <h3 className="panel-title">Adicionar Item</h3>
                            
                            <div className="form-group">
                                <label>Código do Produto (Aperte Enter)</label>
                                    <input 
                                        type="text" 
                                        value={produtoIdStr}
                                        onChange={(e) => setProdutoIdStr(e.target.value)}
                                        onKeyDown={handleKeyDownProduto}
                                        className="pdv-input"
                                    />
                      
                                {nomeProdutoAtual && <span className="produto-atual-nome">{nomeProdutoAtual}</span>}
                            </div>

                            <div className="form-group-row">
                                <div className="form-group flex-1">
                                    <label>Valor Unitário (R$)</label>
                                    <input 
                                        type="text" 
                                        value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorUnitario)}
                                        onChange={handleCurrencyChange}
                                        className="pdv-input currency-input"
                                    />
                                </div>

                                <div className="form-group quantity-group">
                                    <label>Qtd</label>
                                    <input 
                                        type="number" 
                                        min="1"
                                        value={quantidade}
                                        onChange={(e) => setQuantidade(parseInt(e.target.value) || 1)}
                                        className="pdv-input text-center"
                                    />
                                </div>
                            </div>

                            <button type="button" className="btn-primary full-width mt-4" onClick={adicionarItem}>
                                <Plus size={20} />
                                Inserir Item
                            </button>
                        </div>

                        {/* Lado Direito - Cupom/Lista de Itens */}
                        <div className="pdv-cupom-section panel-box">
                            <h3 className="panel-title">Itens da Venda</h3>
                            
                            <div className="cupom-items-list">
                                {itens.length === 0 ? (
                                    <div className="cupom-empty">Nenhum item adicionado.</div>
                                ) : (
                                    itens.map((item, index) => (
                                        <div key={index} className="cupom-item">
                                            <div className="cupom-item-info">
                                                <span className="cupom-item-name">{item.QuantidadeItem}x {item.NomeProduto}</span>
                                                <span className="cupom-item-price">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.ValorUnitario)} un.
                                                </span>
                                            </div>
                                            <div className="cupom-item-actions">
                                                <span className="cupom-item-total">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.QuantidadeItem * item.ValorUnitario)}
                                                </span>
                                                <button className="btn-remove-item" onClick={() => removerItem(index)} title="Remover item">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="cupom-footer">
                                <div className="cupom-total-row">
                                    <span>Total:</span>
                                    <span className="cupom-total-value">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorTotal)}
                                    </span>
                                </div>
                                <button 
                                    type="button" 
                                    className="btn-success full-width mt-4" 
                                    onClick={() => finalizarVenda(false)}
                                    disabled={loading || itens.length === 0}
                                >
                                    {loading ? 'Finalizando...' : 'Finalizar Venda'}
                                </button>
                            </div>
                        </div>
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
                                className="pdv-input mb-4"
                                autoFocus
                            />
                            
                            {loadingProdutos ? (
                                <p className="text-center mt-4">Carregando...</p>
                            ) : (
                                <div className="produto-list-grid">
                                    {produtosFiltrados.map(p => {
                                        const id = p.ProdutoId ?? p.produtoId;
                                        const nome = p.NomeProduto ?? p.nomeProduto;
                                        const preco = p.ValorVenda ?? p.valorVenda;

                                        return (
                                            <div key={id} className="produto-select-card" onClick={() => selecionarProduto(p)}>
                                                <div className="produto-select-info">
                                                    <span className="produto-select-id">#{id}</span>
                                                    <span className="produto-select-name">{nome}</span>
                                                    <span className="produto-select-price">
                                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(preco || 0)}
                                                    </span>
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

export default CadastrarVenda;
