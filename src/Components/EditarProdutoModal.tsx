import React, { useState, useEffect } from 'react';
import { X, Save, ArrowUp, ArrowDown, CheckCircle } from 'lucide-react';
import { atualizarProduto, desativarProduto, reativarProduto, type ProdutoUpdateDTO } from '../Services/produtoService';
import { listarCategorias, type CategoriaDTO } from '../Services/categoriaService';
import { resolveImageUrl } from '../config/api';
import '../Styles/Admin/Produto/editarProdutoModal.css';

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
    categoriaIds?: number[];
    CategoriaIds?: number[];
    nomeCategorias?: string[];
    NomeCategorias?: string[];
    imagemUrl?: string;
    ImagemUrl?: string;
}

interface EditarProdutoModalProps {
    produto: ProdutoApi | null;
    onClose: () => void;
    onUpdateSuccess: () => void;
}

const TAMANHOS_DISPONIVEIS = [
    { value: '1', label: 'PP' },
    { value: '2', label: 'P' },
    { value: '4', label: 'M' },
    { value: '8', label: 'G' },
    { value: '16', label: 'GG' },
    { value: '32', label: 'G1' },
    { value: '128', label: 'G2' }
];
const TAMANHOS_PADRAO = TAMANHOS_DISPONIVEIS.map(t => t.label);

const normalizeSizeLabel = (value: string) => {
    const cleaned = value.trim().toUpperCase().replace(/[\s-_]/g, '');
    if (cleaned === 'NENHUM') return 'NENHUM';
    const semGenero = cleaned.replace(/(MASCULINO|FEMININO)$/g, '');
    const matched = TAMANHOS_PADRAO.find(t => semGenero === t);
    return matched ?? semGenero;
};

const extractImageList = (rawImageUrl: string) =>
    rawImageUrl.split(/[,\n;]+/).map(url => url.trim()).filter(Boolean);

const EditarProdutoModal: React.FC<EditarProdutoModalProps> = ({ produto, onClose, onUpdateSuccess }) => {
    const [nomeProduto, setNomeProduto] = useState('');
    const [descricaoProduto, setDescricaoProduto] = useState('');
    const [valorCompra, setValorCompra] = useState<number>(0);
    const [valorVenda, setValorVenda] = useState<number>(0);
    const [quantidade, setQuantidade] = useState<number>(0);
    const [categoriaIds, setCategoriaIds] = useState<number[]>([]);
    const [ativo, setAtivo] = useState<boolean>(true);
    const [imagemUrl, setImagemUrl] = useState('');
    const [alterarPosicaoImagens, setAlterarPosicaoImagens] = useState(false);
    const [imagensOrdenadas, setImagensOrdenadas] = useState<string[]>([]);
    const [tamanhosSelecionados, setTamanhosSelecionados] = useState<string[]>([]);
    const [categorias, setCategorias] = useState<CategoriaDTO[]>([]);
    const [showCategoriaModal, setShowCategoriaModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        listarCategorias().then(setCategorias).catch(() => {});
    }, []);

    useEffect(() => {
        if (produto) {
            setNomeProduto(produto.nomeProduto ?? produto.NomeProduto ?? '');
            setDescricaoProduto(produto.descricaoProduto ?? produto.DescricaoProduto ?? '');
            setValorCompra(produto.valorCompra ?? produto.ValorCompra ?? 0);
            setValorVenda(produto.valorVenda ?? produto.ValorVenda ?? 0);
            setQuantidade(produto.quantidade ?? produto.Quantidade ?? 0);
            setCategoriaIds(produto.categoriaIds ?? produto.CategoriaIds ?? []);
            setAtivo(produto.ativo !== undefined ? produto.ativo : (produto.Ativo ?? true));

            const imagemUrlAtual = produto.imagemUrl ?? produto.ImagemUrl ?? '';
            setImagemUrl(imagemUrlAtual);
            setAlterarPosicaoImagens(false);
            setImagensOrdenadas(extractImageList(imagemUrlAtual));

            const rawTamanho = produto.tamanho ?? produto.Tamanho;
            let nomesTamanhos: string[] = [];
            if (Array.isArray(rawTamanho)) {
                nomesTamanhos = rawTamanho.map(normalizeSizeLabel);
            } else if (typeof rawTamanho === 'string') {
                nomesTamanhos = (rawTamanho as string).split(',').map(normalizeSizeLabel);
            }
            setTamanhosSelecionados(
                TAMANHOS_DISPONIVEIS.filter(t => nomesTamanhos.includes(t.label)).map(t => t.value)
            );
        }
    }, [produto]);

    if (!produto) return null;

    const id = produto.produtoId ?? produto.ProdutoId;

    const handleTamanhoChange = (value: string) => {
        setTamanhosSelecionados(prev =>
            prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
        );
    };

    const toggleCategoria = (catId: number) => {
        setCategoriaIds(prev =>
            prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
        );
    };

    const handleMoveImage = (index: number, direction: 'up' | 'down') => {
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= imagensOrdenadas.length) return;
        const novas = [...imagensOrdenadas];
        [novas[index], novas[targetIndex]] = [novas[targetIndex], novas[index]];
        setImagensOrdenadas(novas);
        setImagemUrl(novas.join(','));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!id) { setError('ID do produto inválido.'); return; }
        if (!nomeProduto || valorCompra <= 0 || valorVenda <= 0 || categoriaIds.length === 0) {
            setError('Por favor, preencha todos os campos obrigatórios corretamente.');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const imagemUrlAtualizada = alterarPosicaoImagens ? imagensOrdenadas.join(',') : imagemUrl;

            const updateData: ProdutoUpdateDTO = {
                NomeProduto: nomeProduto,
                DescricaoProduto: descricaoProduto,
                ValorCompra: valorCompra,
                ValorVenda: valorVenda,
                Quantidade: quantidade,
                CategoriaIds: categoriaIds,
                Ativo: ativo,
                ImagemUrl: imagemUrlAtualizada,
                Tamanho: tamanhosSelecionados
            };

            await atualizarProduto(id, updateData);

            const statusOriginal = produto.ativo !== undefined ? produto.ativo : (produto.Ativo ?? true);
            if (statusOriginal !== ativo) {
                if (ativo) {
                    await reativarProduto(id);
                } else {
                    await desativarProduto(id);
                }
            }

            onUpdateSuccess();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido ao atualizar o produto.');
        } finally {
            setLoading(false);
        }
    };

    const categoriasSelecionadasNomes = categorias
        .filter(c => categoriaIds.includes(c.categoriaId))
        .map(c => c.nomeCategoria)
        .join(', ');

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="editar-produto-modal" onClick={e => e.stopPropagation()}>
                <div className="editar-produto-header">
                    <h3>Editar Produto #{id}</h3>
                    <button className="editar-produto-close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="editar-produto-body">
                    {error && <div className="error-message">{error}</div>}

                    <form id="editarProdutoForm" onSubmit={handleSubmit}>
                        <div className="editar-produto-form-grid">
                            <div className="form-group full-width">
                                <label>Nome do Produto *</label>
                                <input
                                    type="text"
                                    value={nomeProduto}
                                    onChange={e => setNomeProduto(e.target.value)}
                                    required
                                    placeholder="Ex: Camiseta Básica"
                                />
                            </div>

                            <div className="form-group full-width">
                                <label>Descrição</label>
                                <textarea
                                    value={descricaoProduto}
                                    onChange={e => setDescricaoProduto(e.target.value)}
                                    placeholder="Descrição detalhada do produto"
                                />
                            </div>

                            <div className="form-group quarter-width">
                                <label>Valor Compra (R$)*</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={valorCompra}
                                    onChange={e => setValorCompra(parseFloat(e.target.value))}
                                    required
                                />
                            </div>

                            <div className="form-group quarter-width">
                                <label>Valor Venda (R$)*</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={valorVenda}
                                    onChange={e => setValorVenda(parseFloat(e.target.value))}
                                    required
                                />
                            </div>

                            <div className="form-group quarter-width">
                                <label>Estoque *</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={quantidade}
                                    onChange={e => setQuantidade(parseInt(e.target.value))}
                                    required
                                />
                            </div>

                            <div className="form-group quarter-width">
                                <label>Categorias *</label>
                                <input
                                    type="text"
                                    readOnly
                                    value={categoriasSelecionadasNomes || ''}
                                    placeholder="Clique para selecionar"
                                    onClick={() => setShowCategoriaModal(true)}
                                    style={{ cursor: 'pointer' }}
                                />
                                {showCategoriaModal && (
                                    <div className="modal-overlay" style={{ zIndex: 1100 }} onClick={() => setShowCategoriaModal(false)}>
                                        <div style={{
                                            background: '#1a1a1a',
                                            border: '1px solid #333',
                                            borderRadius: '12px',
                                            width: '90%',
                                            maxWidth: '400px',
                                            maxHeight: '80vh',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                                            overflow: 'hidden'
                                        }} onClick={e => e.stopPropagation()}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #333', background: '#222' }}>
                                                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>Selecione as Categorias</h3>
                                                <button type="button" onClick={() => setShowCategoriaModal(false)} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer' }}><X size={20} /></button>
                                            </div>
                                            <div style={{ padding: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                {categorias.map(cat => (
                                                    <div
                                                        key={cat.categoriaId}
                                                        onClick={() => toggleCategoria(cat.categoriaId)}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '12px',
                                                            padding: '12px 16px',
                                                            background: categoriaIds.includes(cat.categoriaId) ? 'rgba(74,222,128,0.1)' : '#252525',
                                                            border: categoriaIds.includes(cat.categoriaId) ? '1px solid #4ade80' : '1px solid transparent',
                                                            borderRadius: '8px',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        <div style={{
                                                            width: '20px', height: '20px', border: '2px solid', borderColor: categoriaIds.includes(cat.categoriaId) ? '#4ade80' : '#555',
                                                            borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            background: categoriaIds.includes(cat.categoriaId) ? '#4ade80' : 'transparent', color: 'white', flexShrink: 0
                                                        }}>
                                                            {categoriaIds.includes(cat.categoriaId) && <CheckCircle size={14} />}
                                                        </div>
                                                        <span style={{ color: '#e0e0e0' }}>{cat.nomeCategoria}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setShowCategoriaModal(false)}
                                                style={{ margin: '16px', padding: '12px', background: '#4ade80', color: '#1a1a1a', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                                            >
                                                Confirmar
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="form-group full-width">
                                <label>Tamanhos Disponíveis</label>
                                <div className="tamanhos-container">
                                    {TAMANHOS_DISPONIVEIS.map(t => (
                                        <label key={t.value} className="tamanho-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={tamanhosSelecionados.includes(t.value)}
                                                onChange={() => handleTamanhoChange(t.value)}
                                            />
                                            {t.label}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group full-width" style={{ marginTop: '0.5rem' }}>
                                <label className="status-toggle">
                                    <input
                                        type="checkbox"
                                        checked={ativo}
                                        onChange={e => setAtivo(e.target.checked)}
                                    />
                                    Produto Ativo (Visível no catálogo)
                                </label>
                            </div>

                            <div className="form-group full-width">
                                <label className="status-toggle">
                                    <input
                                        type="checkbox"
                                        checked={alterarPosicaoImagens}
                                        onChange={e => setAlterarPosicaoImagens(e.target.checked)}
                                    />
                                    Deseja alterar a posição das imagens?
                                </label>
                            </div>

                            {alterarPosicaoImagens && (
                                <div className="form-group full-width">
                                    <label>Ordem das imagens</label>
                                    {imagensOrdenadas.length === 0 ? (
                                        <p className="image-order-empty">Nenhuma imagem cadastrada para este produto.</p>
                                    ) : (
                                        <div className="image-order-list">
                                            {imagensOrdenadas.map((url, index) => (
                                                <div className="image-order-item" key={`${url}-${index}`}>
                                                    <img src={resolveImageUrl(url)} alt={`Imagem ${index + 1}`} className="image-order-preview" />
                                                    <div className="image-order-info">
                                                        <span className="image-order-position">Posição {index + 1}</span>
                                                        <span className="image-order-url">{url}</span>
                                                    </div>
                                                    <div className="image-order-actions">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleMoveImage(index, 'up')}
                                                            disabled={index === 0}
                                                            className="image-order-btn"
                                                        >
                                                            <ArrowUp size={16} /> Subir
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleMoveImage(index, 'down')}
                                                            disabled={index === imagensOrdenadas.length - 1}
                                                            className="image-order-btn"
                                                        >
                                                            <ArrowDown size={16} /> Descer
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </form>
                </div>

                <div className="editar-produto-footer">
                    <button type="button" className="btn-cancelar" onClick={onClose} disabled={loading}>
                        Cancelar
                    </button>
                    <button type="submit" form="editarProdutoForm" className="btn-salvar" disabled={loading}>
                        <Save size={18} />
                        {loading ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditarProdutoModal;
