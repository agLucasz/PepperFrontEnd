import React, { useState, useEffect } from 'react';
import { X, ArrowUp, ArrowDown } from 'lucide-react';
import '../Styles/Admin/Produto/ordenarImagensModal.css';

interface OrdenarImagensModalProps {
    imagens: File[];
    onConfirm: (imagensOrdenadas: File[]) => void;
    onClose: () => void;
}

const OrdenarImagensModal: React.FC<OrdenarImagensModalProps> = ({ imagens, onConfirm, onClose }) => {
    const [ordem, setOrdem] = useState<File[]>([...imagens]);
    const [previews, setPreviews] = useState<string[]>([]);

    useEffect(() => {
        const urls = ordem.map(f => URL.createObjectURL(f));
        setPreviews(urls);
        return () => urls.forEach(u => URL.revokeObjectURL(u));
    }, [ordem]);

    const handleMove = (index: number, direction: 'up' | 'down') => {
        const target = direction === 'up' ? index - 1 : index + 1;
        if (target < 0 || target >= ordem.length) return;
        const novaOrdem = [...ordem];
        [novaOrdem[index], novaOrdem[target]] = [novaOrdem[target], novaOrdem[index]];
        setOrdem(novaOrdem);
    };

    return (
        <div className="ordenar-imagens-overlay" onClick={onClose}>
            <div className="ordenar-imagens-modal" onClick={e => e.stopPropagation()}>
                <div className="ordenar-imagens-header">
                    <h3>Ordenar Imagens</h3>
                    <button type="button" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="ordenar-imagens-body">
                    {ordem.map((file, index) => (
                        <div key={`${file.name}-${index}`} className="ordenar-imagens-item">
                            <img
                                src={previews[index]}
                                alt={`Imagem ${index + 1}`}
                                className="ordenar-imagens-preview"
                            />
                            <div className="ordenar-imagens-info">
                                <span className="ordenar-imagens-position">Posição {index + 1}</span>
                                <span className="ordenar-imagens-filename">{file.name}</span>
                            </div>
                            <div className="ordenar-imagens-actions">
                                <button
                                    type="button"
                                    className="ordenar-imagens-btn"
                                    onClick={() => handleMove(index, 'up')}
                                    disabled={index === 0}
                                >
                                    <ArrowUp size={14} /> Subir
                                </button>
                                <button
                                    type="button"
                                    className="ordenar-imagens-btn"
                                    onClick={() => handleMove(index, 'down')}
                                    disabled={index === ordem.length - 1}
                                >
                                    <ArrowDown size={14} /> Descer
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="ordenar-imagens-footer">
                    <button type="button" className="ordenar-imagens-btn-cancelar" onClick={onClose}>
                        Cancelar
                    </button>
                    <button type="button" className="ordenar-imagens-btn-confirmar" onClick={() => onConfirm(ordem)}>
                        Confirmar Ordem
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrdenarImagensModal;
