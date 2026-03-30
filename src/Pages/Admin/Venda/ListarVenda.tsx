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

    return (
        <div className="admin-dashboard-layout">
            <AdminSidebar />
            
            <main className="admin-dashboard-content">
                <header className="admin-dashboard-header">
                    <h2 className="admin-dashboard-title">Histórico de Vendas</h2>
                    <p className="admin-dashboard-subtitle">Acompanhe todas as vendas realizadas pelo sistema.</p>
                </header>
                
                <div className="admin-dashboard-body listar-vendas-container">
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
                                    {vendas.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="empty-state">Nenhuma venda encontrada.</td>
                                        </tr>
                                    ) : (
                                        vendas.map((venda) => {
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
