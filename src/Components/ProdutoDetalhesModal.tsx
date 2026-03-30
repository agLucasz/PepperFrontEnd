import React from 'react';
import { X } from 'lucide-react';
import '../Styles/Admin/Produto/produtoDetalhesModal.css';

interface ProdutoApi {
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
}

interface ProdutoDetalhesModalProps {
    produto: ProdutoApi | null;
    onClose: () => void;
}

const ProdutoDetalhesModal: React.FC<ProdutoDetalhesModalProps> = ({ produto, onClose }) => {
    if (!produto) return null;

    const API_BASE_URL = 'https://localhost:7035';
    
    const id = produto.produtoId ?? produto.ProdutoId;
    const nome = produto.nomeProduto ?? produto.NomeProduto;
    const descricao = produto.descricaoProduto ?? produto.DescricaoProduto ?? 'Nenhuma descrição informada';
    const valorCompra = produto.valorCompra ?? produto.ValorCompra ?? 0;
    const valorVenda = produto.valorVenda ?? produto.ValorVenda ?? 0;
    const quantidade = produto.quantidade ?? produto.Quantidade ?? 0;
    const ativo = produto.ativo !== undefined ? produto.ativo : produto.Ativo;
    const tamanhos = produto.tamanho ?? produto.Tamanho;
    const paisISO = produto.paisCodigoISO ?? produto.PaisCodigoISO;
    
    // Corrigindo o carregamento da imagem (pegando apenas a primeira URL caso seja separada por vírgula)
    const rawImagemUrl = produto.imagemUrl ?? produto.ImagemUrl;
    const primeiraImagem = rawImagemUrl ? rawImagemUrl.split(',')[0].trim() : '';

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="produto-detalhes-modal" onClick={e => e.stopPropagation()}>
                <div className="produto-detalhes-header">
                    <h3>Detalhes do Produto #{id}</h3>
                    <button className="produto-detalhes-close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>
                
                <div className="produto-detalhes-body">
                    <div className="produto-detalhes-content">
                        <div className="produto-detalhes-imagem-container">
                            {primeiraImagem ? (
                                <img 
                                    src={`${API_BASE_URL}${primeiraImagem}`} 
                                    alt={nome} 
                                    className="produto-detalhes-img"
                                />
                            ) : (
                                <div className="produto-detalhes-img-placeholder">
                                    <span>Sem imagem</span>
                                </div>
                            )}
                        </div>
                        <div className="produto-detalhes-info">
                            <p><strong>Nome:</strong> {nome}</p>
                            <p><strong>Descrição:</strong> {descricao}</p>
                            <p><strong>Preço de Compra:</strong> {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorCompra)}</p>
                            <p><strong>Preço de Venda:</strong> {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorVenda)}</p>
                            <p><strong>Estoque:</strong> {quantidade} un.</p>
                            <p>
                                <strong>Tamanhos:</strong>{' '}
                                {tamanhos && tamanhos.length > 0 ? tamanhos.join(', ') : 'Nenhum'}
                            </p>
                            <p><strong>País (ISO):</strong> {paisISO}</p>
                            <p>
                                <strong>Status:</strong>{' '}
                                <span className={`status-text ${ativo ? 'ativo' : 'inativo'}`}>
                                    {ativo ? 'Ativo' : 'Inativo'}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProdutoDetalhesModal;
