import React from 'react';
import { X } from 'lucide-react';
import '../Styles/Admin/Venda/vendaDetalhesModal.css';

interface VendaItemApi {
    produtoId?: number;
    ProdutoId?: number;
    produto?: string;
    Produto?: string;
    quantidadeItem?: number;
    QuantidadeItem?: number;
    valorUnitario?: number;
    ValorUnitario?: number;
    valorTotal?: number;
    ValorTotal?: number;
}

export interface VendaApi {
    vendaId?: number;
    VendaId?: number;
    dtVenda?: string;
    DtVenda?: string;
    itens?: VendaItemApi[];
    Itens?: VendaItemApi[];
    valorTotal?: number;
    ValorTotal?: number;
}

interface VendaDetalhesModalProps {
    venda: VendaApi | null;
    onClose: () => void;
}

const VendaDetalhesModal: React.FC<VendaDetalhesModalProps> = ({ venda, onClose }) => {
    if (!venda) return null;

    const id = venda.VendaId ?? venda.vendaId;
    const dt = venda.DtVenda ?? venda.dtVenda;
    const total = venda.ValorTotal ?? venda.valorTotal ?? 0;
    const itens = venda.Itens ?? venda.itens ?? [];
    const dataFormatada = dt ? new Date(dt).toLocaleString('pt-BR') : '-';

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="venda-detalhes-modal" onClick={e => e.stopPropagation()}>
                <div className="venda-detalhes-header">
                    <h3>Detalhes da Venda #{id ?? '-'}</h3>
                    <button className="venda-detalhes-close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>
                
                <div className="venda-detalhes-body">
                    <div className="venda-detalhes-info">
                        <span><strong>Data:</strong> {dataFormatada}</span>
                        <span><strong>Qtd. de Itens:</strong> {itens.length}</span>
                    </div>

                    <div className="venda-detalhes-table-wrapper">
                        <table className="venda-detalhes-table">
                            <thead>
                                <tr>
                                    <th>Produto</th>
                                    <th className="text-center" style={{ textAlign: 'center' }}>Qtd</th>
                                    <th className="text-right" style={{ textAlign: 'right' }}>V. Unitário</th>
                                    <th className="text-right" style={{ textAlign: 'right' }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {itens.map((item, index) => {
                                    const nome = item.Produto ?? item.produto ?? `Produto #${item.ProdutoId ?? item.produtoId}`;
                                    const qtd = item.QuantidadeItem ?? item.quantidadeItem ?? 0;
                                    const vUnitario = item.ValorUnitario ?? item.valorUnitario ?? 0;
                                    const vTotal = item.ValorTotal ?? item.valorTotal ?? (qtd * vUnitario);

                                    return (
                                        <tr key={index}>
                                            <td>{nome}</td>
                                            <td className="text-center" style={{ textAlign: 'center' }}>{qtd}</td>
                                            <td className="text-right" style={{ textAlign: 'right' }}>
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(vUnitario)}
                                            </td>
                                            <td className="text-right" style={{ textAlign: 'right' }}>
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(vTotal)}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {itens.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="text-center" style={{ padding: '2rem', textAlign: 'center' }}>
                                            Nenhum item encontrado nesta venda.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="venda-detalhes-footer">
                    <div className="venda-detalhes-total">
                        Total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendaDetalhesModal;