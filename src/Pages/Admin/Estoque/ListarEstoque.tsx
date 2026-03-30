import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, AlertCircle } from 'lucide-react';
import AdminSidebar from '../../../Components/AdminSidebar';
import '../../../Styles/Admin/adminDashBoard.css';
import '../../../Styles/Admin/Estoque/listarEstoque.css';
import { listarEntradas, excluirEntrada } from '../../../Services/estoqueService';
import { listarProdutos, type ProdutoDTO } from '../../../Services/produtoService';

const ListarEstoque: React.FC = () => {
    const navigate = useNavigate();
    const [entradas, setEntradas] = useState<any[]>([]);
    const [produtos, setProdutos] = useState<ProdutoDTO[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        try {
            setLoading(true);
            const [entradasData, produtosData] = await Promise.all([
                listarEntradas(),
                listarProdutos()
            ]);
            setEntradas(entradasData);
            setProdutos(produtosData);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Erro ao carregar histórico de entradas.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir esta entrada de estoque? A quantidade será revertida.')) {
            try {
                await excluirEntrada(id);
                carregarDados();
            } catch (err: any) {
                alert(err.message || 'Erro ao excluir entrada.');
            }
        }
    };

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
                            <h2 className="admin-dashboard-title">Histórico de Entradas</h2>
                            <p className="admin-dashboard-subtitle">Visualize e gerencie as movimentações de entrada do estoque.</p>
                        </div>
                    </div>
                </header>
                
                <div className="admin-dashboard-body listar-estoque-container">
                    {loading && <div className="loading-state">Carregando entradas...</div>}
                    
                    {error && (
                        <div className="alert-message error mb-4">
                            <AlertCircle size={20} />
                            <span>{error}</span>
                        </div>
                    )}
                    
                    {!loading && !error && (
                        <div className="table-wrapper panel-box">
                            <table className="custom-table">
                                <thead>
                                    <tr>
                                        <th className="text-left">ID Entrada</th>
                                        <th className="text-left">Produto</th>
                                        <th className="text-center">Quantidade</th>
                                        <th className="text-center">Data Entrada</th>
                                        <th className="text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {entradas.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="empty-state">Nenhuma entrada encontrada.</td>
                                        </tr>
                                    ) : (
                                        entradas.map((entrada) => {
                                            const id = entrada.estoqueId ?? entrada.EstoqueId;
                                            
                                            const pId = entrada.produtoId ?? entrada.ProdutoId;
                                            const produtoEncontrado = produtos.find(p => (p.ProdutoId ?? (p as any).produtoId) === pId);
                                            const produtoNome = produtoEncontrado 
                                                ? (produtoEncontrado.NomeProduto ?? (produtoEncontrado as any).nomeProduto)
                                                : (entrada.produto?.nomeProduto ?? entrada.Produto?.NomeProduto ?? `ID: ${pId}`);

                                            const qtd = entrada.quantidadeProduto ?? entrada.QuantidadeProduto;
                                            const dataStr = entrada.dataEntrada ?? entrada.DataEntrada;
                                            const dataFormatada = dataStr ? new Date(dataStr).toLocaleDateString('pt-BR') : '-';

                                            return (
                                                <tr key={id}>
                                                    <td className="td-id">#{id}</td>
                                                    <td>{produtoNome}</td>
                                                    <td className="text-center font-medium text-success">
                                                        +{qtd} un.
                                                    </td>
                                                    <td className="text-center">{dataFormatada}</td>
                                                    <td className="td-actions">
                                                        <div className="actions-container">
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
        </div>
    );
};

export default ListarEstoque;
