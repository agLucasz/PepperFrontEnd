import React, { useState, useEffect } from 'react';
import { X, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ProdutoCatalogoApi } from '../Pages/Catalogo';
import '../Styles/catalogo.css';

interface ProductImageCarouselModalProps {
    isOpen: boolean;
    images: string[];
    onClose: () => void;
    produto: ProdutoCatalogoApi | null;
}

export const ProductImageCarouselModal: React.FC<ProductImageCarouselModalProps> = ({
    isOpen,
    images,
    onClose,
    produto
}) => {
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [touchStartX, setTouchStartX] = useState<number | null>(null);

    const TAMANHOS_PADRAO = ['PP', 'P', 'M', 'G', 'GG', 'G1', 'GGGG', 'G2'];

    useEffect(() => {
        setCurrentIndex(0);
        setSelectedSize(null);
    }, [produto]);

    const normalizeSizeLabel = (value: string) => {
        const cleaned = value.trim().toUpperCase().replace(/[\s-_]/g, '');
        if (cleaned === 'NENHUM') return 'NENHUM';
        const semGenero = cleaned.replace(/(MASCULINO|FEMININO)$/g, '');
        const matched = TAMANHOS_PADRAO.find(t => semGenero === t);
        return matched ?? semGenero;
    };

    if (!isOpen || !produto) return null;

    const handleClose = () => {
        setSelectedSize(null);
        setCurrentIndex(0);
        onClose();
    };

    const goTo = (idx: number) => {
        if (images.length === 0) return;
        setCurrentIndex((idx + images.length) % images.length);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStartX(e.touches[0].clientX);
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX === null) return;
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) {
            diff > 0 ? goTo(currentIndex + 1) : goTo(currentIndex - 1);
        }
        setTouchStartX(null);
    };

    const formatPrice = (value: number | undefined) => {
        if (value === undefined) return 'R$ 0,00';
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const nome = produto.nomeProduto || produto.NomeProduto || '';
    const descricao = produto.descricaoProduto || produto.DescricaoProduto || 'Nenhuma descrição disponível.';
    const valor = produto.valorVenda || produto.ValorVenda || 0;
    const tamanhoStr = produto.tamanho || produto.Tamanho || '';

    const tamanhosDisponiveis = Array.from(
        new Set(
            tamanhoStr
                .split(',')
                .map(normalizeSizeLabel)
                .filter(Boolean)
        )
    );

    let tamanhosExibicao = [...TAMANHOS_PADRAO];
    const outrosTamanhos = tamanhosDisponiveis.filter(t => !tamanhosExibicao.includes(t) && t !== 'NENHUM');
    if (outrosTamanhos.length > 0) {
        const onlyNumbers = tamanhosDisponiveis.every(t => /^\d+$/.test(t));
        if (onlyNumbers) {
            tamanhosExibicao = outrosTamanhos.sort((a, b) => Number(a) - Number(b));
        } else {
            tamanhosExibicao = [...tamanhosExibicao, ...outrosTamanhos];
        }
    }

    const hasSizes = tamanhosDisponiveis.length > 0 && tamanhosDisponiveis[0] !== 'NENHUM';

    const handleWhatsAppClick = () => {
        const phoneNumber = '5514981635560';
        const sizeText = selectedSize ? ` no tamanho ${selectedSize}` : '';
        const message = `Olá! Tenho interesse no produto: ${nome}${sizeText}`;
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    const currentImage = images[currentIndex];

    return (
        <div className="catalogo-modal-overlay" onClick={handleClose}>
            <div className="catalogo-modal-content" onClick={e => e.stopPropagation()}>
                <button className="catalogo-modal-close" onClick={handleClose}>
                    <X size={22} />
                </button>

                {/* Seção de imagens — carousel */}
                <div className="catalogo-modal-carousel-section">
                    <div
                        className="catalogo-modal-main-image"
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                    >
                        {currentImage ? (
                            <img src={currentImage} alt={`${nome} - ${currentIndex + 1}`} />
                        ) : (
                            <div className="catalogo-modal-no-image">Sem imagem</div>
                        )}

                        {images.length > 1 && (
                            <>
                                <button
                                    className="catalogo-nav-btn catalogo-nav-prev"
                                    onClick={e => { e.stopPropagation(); goTo(currentIndex - 1); }}
                                    aria-label="Imagem anterior"
                                >
                                    <ChevronLeft size={22} />
                                </button>
                                <button
                                    className="catalogo-nav-btn catalogo-nav-next"
                                    onClick={e => { e.stopPropagation(); goTo(currentIndex + 1); }}
                                    aria-label="Próxima imagem"
                                >
                                    <ChevronRight size={22} />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Dots — mobile */}
                    {images.length > 1 && (
                        <div className="catalogo-modal-dots">
                            {images.map((_, idx) => (
                                <button
                                    key={idx}
                                    className={`catalogo-modal-dot ${idx === currentIndex ? 'active' : ''}`}
                                    onClick={e => { e.stopPropagation(); goTo(idx); }}
                                    aria-label={`Imagem ${idx + 1}`}
                                />
                            ))}
                        </div>
                    )}

                    {/* Thumbnails — desktop */}
                    {images.length > 1 && (
                        <div className="catalogo-modal-thumbnails">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    className={`catalogo-modal-thumb ${idx === currentIndex ? 'active' : ''}`}
                                    onClick={e => { e.stopPropagation(); goTo(idx); }}
                                    aria-label={`Ver imagem ${idx + 1}`}
                                >
                                    <img src={img} alt={`Miniatura ${idx + 1}`} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Informações do produto */}
                <div className="catalogo-modal-info">
                    <h1 className="catalogo-modal-title">{nome}</h1>
                    <div className="catalogo-modal-price">{formatPrice(valor)}</div>

                    <div className="catalogo-modal-description">
                        <p>{descricao}</p>
                    </div>

                    {hasSizes && (
                        <div className="catalogo-modal-sizes">
                            <div className="catalogo-modal-sizes-header">
                                <h4 className="catalogo-modal-sizes-title">Tamanhos</h4>
                            </div>
                            <div className="catalogo-modal-sizes-grid">
                                {tamanhosExibicao
                                    .filter(tamanho => tamanhosDisponiveis.includes(tamanho))
                                    .map(tamanho => (
                                        <button
                                            key={tamanho}
                                            className={`catalogo-modal-size-btn ${selectedSize === tamanho ? 'selected' : ''}`}
                                            onClick={() => setSelectedSize(tamanho)}
                                        >
                                            {tamanho}
                                        </button>
                                    ))
                                }
                            </div>
                        </div>
                    )}

                    <button className="catalogo-modal-whatsapp-btn" onClick={handleWhatsAppClick}>
                        <MessageCircle size={20} />
                        Chamar no WhatsApp
                    </button>

                    <button className="catalogo-modal-voltar-btn" onClick={handleClose}>
                        ← Voltar ao Catálogo
                    </button>
                </div>
            </div>
        </div>
    );
};
