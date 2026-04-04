import React, { useCallback, useEffect, useState } from 'react';
import { HubConnectionBuilder, HttpTransportType, LogLevel } from '@microsoft/signalr';
import { listarCatalogo } from '../Services/produtoService';
import Sidebar, { type CatalogFilters } from '../Components/Sidebar';
import { ProductImageCarouselModal } from '../Components/ProductImageCarouselModal';
import { MessageCircle, Search } from 'lucide-react';
import '../Styles/catalogo.css';
import '../Styles/dashboard.css';
import logo from '../Assets/logo_pepper.png';
import { API_BASE_URL, PRODUTO_HUB_URL } from '../config/api';

export type ProdutoCatalogoApi = {
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
    paisCodigoISO?: string;
    PaisCodigoISO?: string;
};

interface ProdutoCardProps {
    produto: ProdutoCatalogoApi;
    onOpenModal: (produto: ProdutoCatalogoApi, imagens: string[]) => void;
}

const ProdutoCard: React.FC<ProdutoCardProps> = ({ produto, onOpenModal }) => {
    const nome: string = (produto.nomeProduto || produto.NomeProduto) ?? '';
    const imagemUrlString = produto.imagemUrl || produto.ImagemUrl;
    const preco = produto.valorVenda || produto.ValorVenda || 0;

    const imagensRelativas = imagemUrlString 
        ? imagemUrlString.split(',').map((url: string) => url.trim()).filter((url: string) => url !== '')
        : [];

    const imagens = imagensRelativas.map((url: string) => `${API_BASE_URL}${url}`);
    const primeiraImagem = imagens[0];

    return (
        <div 
            className="modern-product-card"
            onClick={() => {
                onOpenModal(produto, imagens);
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
    const [modalProduto, setModalProduto] = useState<ProdutoCatalogoApi | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sidebarFilters, setSidebarFilters] = useState<CatalogFilters>({
        pais: '',
        tamanho: '',
        precoMin: '',
        precoMax: ''
    });

    const carregarCatalogo = useCallback(async (showLoading: boolean = true) => {
        try {
            if (showLoading) {
                setLoading(true);
            }
            const data = await listarCatalogo();
            setProdutos(data);
            setCurrentPage(1);
            setError(null);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Erro ao carregar catálogo.');
            }
        } finally {
            if (showLoading) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        void carregarCatalogo();

        const connection = new HubConnectionBuilder()
            .withUrl(PRODUTO_HUB_URL, {
                withCredentials: true,
                transport: HttpTransportType.WebSockets,
                skipNegotiation: true
            })
            .withAutomaticReconnect()
            .configureLogging(LogLevel.Warning)
            .build();

        connection.on('CatalogoAtualizado', () => {
            void carregarCatalogo(false);
        });

        let isMounted = true;
        let startPromise: Promise<void> | null = null;

        const iniciarConexao = async () => {
            try {
                if (connection.state === 'Disconnected') {
                    startPromise = connection.start();
                    await startPromise;
                    startPromise = null;

                    if (isMounted) {
                        await connection.invoke('EntrarNoGrupoCatalogo');
                    } else {
                        if (connection.state !== 'Disconnected') {
                            await connection.stop();
                        }
                    }
                }
            } catch (err: any) {
                if (isMounted) {
                    if (err?.message !== 'Failed to start the HttpConnection before stop() was called.') {
                        console.warn('Erro ao conectar ao SignalR:', err);
                        setError('Conexão em tempo real indisponível no momento.');
                    }
                }
            }
        };

        void iniciarConexao();

        return () => {
            isMounted = false;
            connection.off('CatalogoAtualizado');
            void (async () => {
                try {
                    if (startPromise) {
                        await startPromise;
                    }
                } catch {
                    // Ignora falha de start durante desmontagem
                } finally {
                    if (connection.state !== 'Disconnected') {
                        await connection.stop();
                    }
                }
            })();
        };
    }, [carregarCatalogo]);

    const handleOpenModal = (produto: ProdutoCatalogoApi, images: string[]) => {
        setModalImages(images);
        setModalProduto(produto);
        setModalOpen(true);
    };

    // Apply filters
    const produtosFiltrados = produtos.filter(p => {
        const nome = (p.nomeProduto || p.NomeProduto || '').toLowerCase();
        const matchesSearch = nome.includes(searchTerm.toLowerCase());

        const preco = p.valorVenda || p.ValorVenda || 0;
        const matchesPrecoMin = sidebarFilters.precoMin ? preco >= Number(sidebarFilters.precoMin) : true;
        const matchesPrecoMax = sidebarFilters.precoMax ? preco <= Number(sidebarFilters.precoMax) : true;

        const tamanhoStr = (p.tamanho || p.Tamanho || '');
        const matchesTamanho = sidebarFilters.tamanho ? tamanhoStr.includes(sidebarFilters.tamanho) : true;

        const pais = (p.paisCodigoISO || p.PaisCodigoISO || '');
        const matchesPais = sidebarFilters.pais ? pais === sidebarFilters.pais : true;

        return matchesSearch && matchesPrecoMin && matchesPrecoMax && matchesTamanho && matchesPais;
    });

    const totalPages = Math.ceil(produtosFiltrados.length / pageSize) || 1;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const produtosPagina = produtosFiltrados.slice(startIndex, endIndex);

    const goToPage = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleWhatsAppClick = (e: React.MouseEvent) => {
        e.preventDefault();
        const phoneNumber = '5511999999999'; // Substitua pelo número real da empresa
        const message = 'Olá! Gostaria de ver mais modelos e tirar dúvidas.';
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    return (
        <div className="dashboard-layout">
            <Sidebar onFilterChange={(filters) => {
                setSidebarFilters(filters);
                setCurrentPage(1);
            }} />
            <main className="dashboard-content">
                <div className="catalogo-container">
                    <header className="dashboard-header" style={{ marginBottom: '20px' }}>
                        <img src={logo} alt="Pepper Logo" className="catalog-logo-mobile" />
                        <h2 className="catalogo-title">Nossos Produtos</h2>
                        <p className="catalogo-subtitle">Descubra nossa coleção exclusiva de camisas de times, criada para verdadeiros apaixonados por futebol. Nosso catálogo reúne modelos autênticos e réplicas de alta qualidade, com acabamentos impecáveis, tecidos confortáveis e design fiel aos uniformes oficiais.</p>
                        
                        <a 
                            href="#" 
                            onClick={handleWhatsAppClick}
                            className="catalog-whatsapp-mobile-btn"
                        >
                            <MessageCircle size={20} />
                            Chamar no WhatsApp
                        </a>

                        <div className="catalogo-search-bar">
                            <Search className="catalogo-search-icon" size={20} />
                            <input 
                                type="text" 
                                placeholder="Buscar por nome do produto..." 
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                        
                        {/* Container onde a Sidebar renderizará os filtros no mobile (Portal) */}
                        <div id="mobile-filters-container" className="mobile-filters-container"></div>
                    </header>
                    
                    {loading && <div className="catalogo-loading">Carregando catálogo...</div>}
                    {error && <div className="catalogo-error">{error}</div>}

                    {!loading && !error && (
                        <div className="catalogo-grid">
                            {produtosFiltrados.length === 0 ? (
                                <p className="catalogo-empty">Nenhum produto encontrado com os filtros selecionados.</p>
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
                    {!loading && !error && produtosFiltrados.length > pageSize && (
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
                        produto={modalProduto}
                    />
        </div>
      </main>
    </div>
    );
};
