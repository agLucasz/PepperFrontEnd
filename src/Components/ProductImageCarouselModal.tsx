import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import '../Styles/catalogo.css';

interface ProductImageCarouselModalProps {
    isOpen: boolean;
    images: string[];
    onClose: () => void;
    productName: string;
}

export const ProductImageCarouselModal: React.FC<ProductImageCarouselModalProps> = ({
    isOpen,
    images,
    onClose,
    productName
}) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    if (!isOpen || !images.length) return null;

    const handleClose = () => {
        setCurrentImageIndex(0);
        onClose();
    };

    const handlePrevImage = () => {
        setCurrentImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNextImage = () => {
        setCurrentImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
    };

    return (
        <div className="catalogo-modal-overlay" onClick={handleClose}>
            <div className="catalogo-modal-content" onClick={e => e.stopPropagation()}>
                <button className="catalogo-modal-close" onClick={handleClose}>
                    <X size={24} />
                </button>
                <h3 className="catalogo-modal-title">{productName}</h3>
                <div className="catalogo-modal-carousel-container">
                    <button className="catalogo-modal-nav-button prev" onClick={handlePrevImage}>
                        <ChevronLeft size={32} />
                    </button>
                    <img
                        src={images[currentImageIndex]}
                        alt={`${productName} - Imagem ${currentImageIndex + 1}`}
                        className="catalogo-modal-image"
                    />
                    <button className="catalogo-modal-nav-button next" onClick={handleNextImage}>
                        <ChevronRight size={32} />
                    </button>
                </div>
                <div className="catalogo-modal-indicators">
                    {images.map((_, idx) => (
                        <div
                            key={idx}
                            className={`catalogo-modal-indicator-dot ${idx === currentImageIndex ? 'active' : ''}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
