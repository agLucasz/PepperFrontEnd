import React, { useEffect, useState } from 'react';
import { DollarSign, ShoppingCart, TrendingUp, AlertTriangle } from 'lucide-react';
import AdminSidebar from '../../Components/AdminSidebar';
import { listarVendas } from '../../Services/vendaService';
import { listarProdutos } from '../../Services/produtoService';
import '../../Styles/Admin/adminDashBoard.css';
import '../../Styles/Admin/dashboard.css';

const AdminDashBoard: React.FC = () => {
    const [totalVendas, setTotalVendas] = useState<number>(0);
    const [numeroVendas, setNumeroVendas] = useState<number>(0);
    const [produtoMaisVendido, setProdutoMaisVendido] = useState<string>('Nenhum');
    const [produtosBaixoEstoque, setProdutosBaixoEstoque] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        try {
            setLoading(true);
            const [vendas, produtos] = await Promise.all([
                listarVendas(),
                listarProdutos()
            ]);

            // Calcula número de vendas e valor total
            setNumeroVendas(vendas.length);
            const total = vendas.reduce((acc, venda) => {
                const valorVenda = venda.ValorTotal ?? (venda as any).valorTotal ?? 0;
                return acc + valorVenda;
            }, 0);
            setTotalVendas(total);

            // Calcula produto mais vendido
            const contagemProdutos: Record<string, { nome: string, qtd: number }> = {};
            vendas.forEach(venda => {
                const itens = venda.Itens || (venda as any).itens || [];
                itens.forEach((item: any) => {
                    const id = item.produtoId ?? item.ProdutoId;
                    const qtd = item.quantidadeItem ?? item.QuantidadeItem;
                    const nome = item.produto ?? item.Produto ?? `ID: ${id}`;
                    
                    if (!contagemProdutos[id]) {
                        contagemProdutos[id] = { nome, qtd: 0 };
                    }
                    contagemProdutos[id].qtd += qtd;
                });
            });

            let maisVendido = { nome: 'Nenhum', qtd: 0 };
            for (const key in contagemProdutos) {
                if (contagemProdutos[key].qtd > maisVendido.qtd) {
                    maisVendido = contagemProdutos[key];
                }
            }
            setProdutoMaisVendido(maisVendido.nome !== 'Nenhum' ? `${maisVendido.nome} (${maisVendido.qtd} un.)` : 'Nenhum');

            // Filtra produtos com baixo estoque (ex: menor ou igual a 5)
            const baixoEstoque = produtos.filter(p => {
                const qtd = p.Quantidade ?? (p as any).quantidade ?? 0;
                return qtd <= 5;
            }).sort((a, b) => {
                const qA = a.Quantidade ?? (a as any).quantidade ?? 0;
                const qB = b.Quantidade ?? (b as any).quantidade ?? 0;
                return qA - qB;
            }).slice(0, 5); // Pega os 5 com menor estoque

            setProdutosBaixoEstoque(baixoEstoque);

        } catch (error) {
            console.error("Erro ao carregar dados do dashboard", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-dashboard-layout">
            <AdminSidebar />
            
            <main className="admin-dashboard-content">
                <header className="admin-dashboard-header">
                    <h2 className="admin-dashboard-title">Dashboard</h2>
                    <p className="admin-dashboard-subtitle">Visão geral do desempenho e estoque.</p>
                </header>
                
                {loading ? (
                    <div className="dashboard-loading">Carregando dados...</div>
                ) : (
                    <div className="dashboard-grid">
                        <div className="dash-card">
                            <div className="dash-card-icon bg-green">
                                <DollarSign size={24} />
                            </div>
                            <div className="dash-card-info">
                                <h3>Valor Total</h3>
                                <p className="dash-value highlight-green">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalVendas)}
                                </p>
                            </div>
                        </div>

                        <div className="dash-card">
                            <div className="dash-card-icon bg-blue">
                                <ShoppingCart size={24} />
                            </div>
                            <div className="dash-card-info">
                                <h3>Número de Vendas</h3>
                                <p className="dash-value">{numeroVendas}</p>
                            </div>
                        </div>

                        <div className="dash-card card-wide">
                            <div className="dash-card-icon bg-purple">
                                <TrendingUp size={24} />
                            </div>
                            <div className="dash-card-info">
                                <h3>Produto Mais Vendido</h3>
                                <p className="dash-value text-small" title={produtoMaisVendido}>{produtoMaisVendido}</p>
                            </div>
                        </div>

                        <div className="dash-panel full-width">
                            <div className="dash-panel-header">
                                <AlertTriangle size={20} className="icon-warning" />
                                <h3>Produtos com Baixo Estoque</h3>
                            </div>
                            <div className="dash-panel-body">
                                {produtosBaixoEstoque.length === 0 ? (
                                    <p className="dash-empty">Nenhum produto com baixo estoque.</p>
                                ) : (
                                    <table className="dash-table">
                                        <thead>
                                            <tr>
                                                <th className="text-left">Produto</th>
                                                <th className="text-center">Quantidade</th>
                                                <th className="text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {produtosBaixoEstoque.map(p => {
                                                const id = p.ProdutoId ?? (p as any).produtoId;
                                                const nome = p.NomeProduto ?? (p as any).nomeProduto;
                                                const qtd = p.Quantidade ?? (p as any).quantidade ?? 0;
                                                
                                                return (
                                                    <tr key={id}>
                                                        <td>#{id} - {nome}</td>
                                                        <td className="text-center font-bold">{qtd} un.</td>
                                                        <td className="text-right">
                                                            <span className="dash-badge warning">Baixo</span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashBoard;
