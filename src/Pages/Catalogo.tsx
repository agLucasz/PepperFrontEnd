import React, { useEffect, useState } from 'react';
import { listarCatalogo } from '../Services/produtoService';
import Sidebar from '../Components/Sidebar';
import { ProductImageCarouselModal } from '../Components/ProductImageCarouselModal';
import '../Styles/catalogo.css';
import '../Styles/dashboard.css';

const API_BASE_URL = 'https://localhost:7035';

const formatTamanho = (tamanhoString: string) => {
    if (!tamanhoString || tamanhoString === 'Nenhum') return '';
    
    const tamanhos = tamanhoString.split(', ');
    
    const formatados = tamanhos.map((t: string) => {
        const match = t.match(/^([A-Z]+)(Masculino|Feminino)$/);
        if (match) {
            return `${match[1]} - ${match[2]}`;
        }
        return t; 
    });
    
    return formatados.join(', ');
};

type ProdutoCatalogoApi = {
    produtoId?: number;
    ProdutoId?: number;
    nomeProduto?: string;
    NomeProduto?: string;
    descricaoProduto?: string;
    DescricaoProduto?: string;
    valorVenda?: number;
    ValorVenda?: number;
    tamanho?: string;
    Tamanho?: string;
    imagemUrl?: string;
    ImagemUrl?: string;
};

interface ProdutoCardProps {
    produto: ProdutoCatalogoApi;
    onOpenModal: (images: string[], nome: string) => void;
}

const ProdutoCard: React.FC<ProdutoCardProps> = ({ produto, onOpenModal }) => {
    const nome: string = (produto.nomeProduto || produto.NomeProduto) ?? '';
    const descricao = produto.descricaoProduto || produto.DescricaoProduto;
    const imagemUrlString = produto.imagemUrl || produto.ImagemUrl;
    const preco = produto.valorVenda || produto.ValorVenda || 0;
    const tamanho = produto.tamanho || produto.Tamanho || '';

    const imagensRelativas = imagemUrlString 
        ? imagemUrlString.split(',').map((url: string) => url.trim()).filter((url: string) => url !== '')
        : [];

    const imagens = imagensRelativas.map((url: string) => `${API_BASE_URL}${url}`);
    const primeiraImagem = imagens[0];

    return (
        <div 
            className="modern-product-card"
            onClick={() => {
                if (imagens.length > 0) {
                    onOpenModal(imagens, nome);
                }
            }}
        >
            <div className="card-image-container">
                {imagens.length > 0 ? (
                    <img 
                        src={primeiraImagem} 
                        alt={nome} 
                        className="card-image"
                    />
                ) : (
                    <div className="card-image-placeholder">Sem Imagem</div>
                )}
            </div>
            
            <div className="card-content">
                <h3 className="card-title">{nome}</h3>
                <p className="card-description">
                    {descricao ? descricao : ''}
                    {descricao && tamanho && tamanho !== 'Nenhum' && <br />}
                    {tamanho && tamanho !== 'Nenhum' && `Tam: ${formatTamanho(tamanho)}`}
                </p>
                
                <div className="card-price">
                    R$ {preco.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
            </div>
        </div>
    );
};

export const Catalogo: React.FC = () => {
    const [produtos, setProdutos] = useState<ProdutoCatalogoApi[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const pageSize = 8;
    const [modalOpen, setModalOpen] = useState(false);
    const [modalImages, setModalImages] = useState<string[]>([]);
    const [modalProductName, setModalProductName] = useState('');

    useEffect(() => {
        carregarCatalogo();
    }, []);

    const carregarCatalogo = async () => {
        try {
            setLoading(true);
            const data = await listarCatalogo();
            setProdutos(data);
            setCurrentPage(1);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Erro ao carregar catálogo.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (images: string[], nome: string) => {
        if (!images.length) return;
        setModalImages(images);
        setModalProductName(nome);
        setModalOpen(true);
    };

    const totalPages = Math.ceil(produtos.length / pageSize) || 1;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const produtosPagina = produtos.slice(startIndex, endIndex);

    const goToPage = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-content">
                <div className="catalogo-container">
                    <header className="dashboard-header" style={{ marginBottom: '20px' }}>
                        <h2 className="dashboard-title">Nossos Produtos</h2>
                        <p className="dashboard-subtitle">Explore as melhores camisas de times disponíveis.</p>
                    </header>
                    
                    {loading && <div className="catalogo-loading">Carregando catálogo...</div>}
                    {error && <div className="catalogo-error">{error}</div>}

                    {!loading && !error && (
                        <div className="catalogo-grid">
                            {produtos.length === 0 ? (
                                <p className="catalogo-empty">Nenhum produto disponível no catálogo.</p>
                            ) : (
                                produtosPagina.map(produto => (
                                    <ProdutoCard 
                                        key={produto.produtoId || produto.ProdutoId} 
                                        produto={produto} 
                                        onOpenModal={handleOpenModal}
                                    />
                                ))
                            )}
                        </div>
                    )}
                    {!loading && !error && produtos.length > pageSize && (
                        <div className="catalogo-pagination">
                            <button 
                                className="pagination-btn" 
                                onClick={() => goToPage(currentPage - 1)} 
                                disabled={currentPage === 1}
                            >
                                Anterior
                            </button>
                            <div className="pagination-pages">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                    <button
                                        key={p}
                                        className={`pagination-page ${p === currentPage ? 'active' : ''}`}
                                        onClick={() => goToPage(p)}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                            <button 
                                className="pagination-btn" 
                                onClick={() => goToPage(currentPage + 1)} 
                                disabled={currentPage === totalPages}
                            >
                                Próxima
                            </button>
                        </div>
                    )}
                    <ProductImageCarouselModal 
                        isOpen={modalOpen}
                        images={modalImages}
                        onClose={() => setModalOpen(false)}
                        productName={modalProductName}
                    />
        </div>
      </main>
    </div>
    );
};
