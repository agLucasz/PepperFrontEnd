import React, { useEffect, useState } from 'react';
import { Eye, Trash2 } from 'lucide-react';
import AdminSidebar from '../../../Components/AdminSidebar';
import VendaDetalhesModal from '../../../Components/VendaDetalhesModal';
import '../../../Styles/Admin/adminDashBoard.css';
import '../../../Styles/Admin/Venda/listarVenda.css';
import { listarVendas, excluirVenda, type VendaItemDTO } from '../../../Services/vendaService';

type VendaApi = {
    vendaId?: number;
    VendaId?: number;
    dtVenda?: string;
    DtVenda?: string;
    itens?: VendaItemDTO[];
    Itens?: VendaItemDTO[];
    valorTotal?: number;
    ValorTotal?: number;
};

const ListarVenda: React.FC = () => {
    const [vendas, setVendas] = useState<VendaApi[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [vendaSelecionada, setVendaSelecionada] = useState<VendaApi | null>(null);
    const [modalAberto, setModalAberto] = useState<boolean>(false);
    const [dataInicio, setDataInicio] = useState<string>('');
    const [dataFim, setDataFim] = useState<string>('');

    useEffect(() => {
        carregarVendas();
    }, []);

    const carregarVendas = async () => {
        try {
            setLoading(true);
            const data = await listarVendas();
            setVendas(data);
            setError(null);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Erro ao carregar vendas.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir esta venda? Esta ação não pode ser desfeita.')) {
            try {
                await excluirVenda(id);
                carregarVendas();
            } catch (err: unknown) {
                if (err instanceof Error) {
                    alert(err.message);
                } else {
                    alert('Erro ao excluir a venda.');
                }
            }
        }
    };

    const handleView = (venda: VendaApi) => {
        setVendaSelecionada(venda);
        setModalAberto(true);
    };

    const handleCloseModal = () => {
        setModalAberto(false);
        setVendaSelecionada(null);
    };

    const vendasFiltradas = vendas.filter((venda) => {
        if (!dataInicio && !dataFim) {
            return true;
        }

        const dt = venda.DtVenda ?? venda.dtVenda;
        if (!dt) {
            return false;
        }

        const dataVenda = new Date(dt);
        if (Number.isNaN(dataVenda.getTime())) {
            return false;
        }

        const inicio = dataInicio ? new Date(`${dataInicio}T00:00:00`) : null;
        const fim = dataFim ? new Date(`${dataFim}T23:59:59.999`) : null;

        if (inicio && dataVenda < inicio) {
            return false;
        }

        if (fim && dataVenda > fim) {
            return false;
        }

        return true;
    });

    const totalVendasFiltradas = vendasFiltradas.length;
    const valorTotalFiltrado = vendasFiltradas.reduce((acumulado, venda) => {
        const total = venda.ValorTotal ?? venda.valorTotal ?? 0;
        return acumulado + total;
    }, 0);

    return (
        <div className="admin-dashboard-layout">
            <AdminSidebar />
            
            <main className="admin-dashboard-content">
                <header className="admin-dashboard-header">
                    <h2 className="admin-dashboard-title">Histórico de Vendas</h2>
                    <p className="admin-dashboard-subtitle">Acompanhe todas as vendas realizadas pelo sistema.</p>
                </header>
                
                <div className="admin-dashboard-body listar-vendas-container">
                    <div className="listar-vendas-filtros">
                        <div className="filtro-periodo-grupo">
                            <label htmlFor="dataInicio">De</label>
                            <input
                                id="dataInicio"
                                type="date"
                                value={dataInicio}
                                onChange={(e) => setDataInicio(e.target.value)}
                            />
                        </div>

                        <div className="filtro-periodo-grupo">
                            <label htmlFor="dataFim">Até</label>
                            <input
                                id="dataFim"
                                type="date"
                                value={dataFim}
                                onChange={(e) => setDataFim(e.target.value)}
                            />
                        </div>

                        <button
                            type="button"
                            className="btn-limpar-filtro-venda"
                            onClick={() => {
                                setDataInicio('');
                                setDataFim('');
                            }}
                            disabled={!dataInicio && !dataFim}
                        >
                            Limpar Filtro
                        </button>
                    </div>

                    <div className="listar-vendas-resumo">
                        <p>
                            <strong>Total de vendas no período:</strong> {totalVendasFiltradas}
                        </p>
                        <p>
                            <strong>Valor total no período:</strong>{' '}
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorTotalFiltrado)}
                        </p>
                    </div>

                    {loading && <div className="listar-vendas-loading">Carregando vendas...</div>}
                    {error && <div className="listar-vendas-error">{error}</div>}
                    
                    {!loading && !error && (
                        <div className="listar-vendas-table-wrapper">
                            <table className="listar-vendas-table">
                                <thead>
                                    <tr>
                                        <th className="text-left">ID</th>
                                        <th className="text-left">Data da Venda</th>
                                        <th className="text-center">Qtd. Itens</th>
                                        <th className="text-left">Valor Total</th>
                                        <th className="text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {vendasFiltradas.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="empty-state">Nenhuma venda encontrada para o período informado.</td>
                                        </tr>
                                    ) : (
                                        vendasFiltradas.map((venda) => {
                                            const id = venda.VendaId ?? venda.vendaId;
                                            const dt = venda.DtVenda ?? venda.dtVenda;
                                            const itens = venda.Itens ?? venda.itens ?? [];
                                            const total = venda.ValorTotal ?? venda.valorTotal ?? 0;
                                            const dataFormatada = dt ? new Date(dt).toLocaleString('pt-BR') : '-';

                                            return (
                                            <tr key={id ?? `venda-${dataFormatada}`}>
                                                <td className="td-id">#{id ?? '-'}</td>
                                                <td>{dataFormatada}</td>
                                                <td className="text-center">{itens.length}</td>
                                                <td className="font-medium">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                                                </td>
                                                <td className="td-actions">
                                                    <div className="actions-container">
                                                        <button 
                                                            onClick={() => handleView(venda)} 
                                                            title="Visualizar" 
                                                            className="btn-action view"
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(id ?? 0)} 
                                                            title="Excluir" 
                                                            className="btn-action delete"
                                                            disabled={!id}
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

            {modalAberto && (
                <VendaDetalhesModal 
                    venda={vendaSelecionada} 
                    onClose={handleCloseModal} 
                />
            )}
        </div>
    );
};

export default ListarVenda;
