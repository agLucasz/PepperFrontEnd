import React, { useState } from 'react';
import { X, MessageCircle } from 'lucide-react';
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
    const TAMANHOS_PADRAO = ['PP', 'P', 'M', 'G', 'GG', 'G1', 'GGGG', 'G2'];

    const normalizeSizeLabel = (value: string) => {
        const cleaned = value.trim().toUpperCase().replace(/[\s-_]/g, '');
        if (cleaned === 'NENHUM') return 'NENHUM';

        const semGenero = cleaned.replace(/(MASCULINO|FEMININO)$/g, '');
        const matched = TAMANHOS_PADRAO.find(t => semGenero === t || semGenero.startsWith(t));
        return matched ?? semGenero;
    };

    if (!isOpen || !produto) return null;

    const handleClose = () => {
        setSelectedSize(null);
        onClose();
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

    return (
        <div className="catalogo-modal-overlay" onClick={handleClose}>
            <div className="catalogo-modal-content" onClick={e => e.stopPropagation()}>
                <button className="catalogo-modal-close" onClick={handleClose}>
                    <X size={24} />
                </button>

                <div className="catalogo-modal-gallery">
                    {images.map((img, idx) => (
                        <div key={idx} className="catalogo-modal-image-wrapper">
                            <img src={img} alt={`${nome} - Imagem ${idx + 1}`} />
                        </div>
                    ))}
                    {images.length === 0 && (
                        <div className="catalogo-modal-image-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            Sem imagem
                        </div>
                    )}
                </div>

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
