import React, { useState, useEffect } from 'react';
import { X, Save, ArrowUp, ArrowDown } from 'lucide-react';
import { atualizarProduto, desativarProduto, reativarProduto, type ProdutoUpdateDTO } from '../Services/produtoService';
import { listarCategorias, type CategoriaDTO } from '../Services/categoriaService';
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
    categoriaId?: number;
    CategoriaId?: number;
    nomeCategoria?: string;
    NomeCategoria?: string;
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
    { value: '32', label: 'GGG' },
    { value: '64', label: 'GGGG' }
];
const TAMANHOS_PADRAO = TAMANHOS_DISPONIVEIS.map(t => t.label);

const normalizeSizeLabel = (value: string) => {
    const cleaned = value.trim().toUpperCase().replace(/[\s-_]/g, '');
    if (cleaned === 'NENHUM') return 'NENHUM';
    const semGenero = cleaned.replace(/(MASCULINO|FEMININO)$/g, '');
    const matched = TAMANHOS_PADRAO.find(t => semGenero === t || semGenero.startsWith(t));
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
    const [categoriaId, setCategoriaId] = useState<number>(0);
    const [ativo, setAtivo] = useState<boolean>(true);
    const [imagemUrl, setImagemUrl] = useState('');
    const [alterarPosicaoImagens, setAlterarPosicaoImagens] = useState(false);
    const [imagensOrdenadas, setImagensOrdenadas] = useState<string[]>([]);
    const [tamanhosSelecionados, setTamanhosSelecionados] = useState<string[]>([]);
    const [categorias, setCategorias] = useState<CategoriaDTO[]>([]);
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
            setCategoriaId(produto.categoriaId ?? produto.CategoriaId ?? 0);
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
        if (!nomeProduto || valorCompra <= 0 || valorVenda <= 0 || !categoriaId) {
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
                CategoriaId: categoriaId,
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
                                <label>Categoria *</label>
                                <select
                                    value={categoriaId}
                                    onChange={e => setCategoriaId(Number(e.target.value))}
                                    required
                                >
                                    <option value={0} disabled>Selecione...</option>
                                    {categorias.map(cat => (
                                        <option key={cat.categoriaId} value={cat.categoriaId}>
                                            {cat.nomeCategoria}
                                        </option>
                                    ))}
                                </select>
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
                                                    <img src={url} alt={`Imagem ${index + 1}`} className="image-order-preview" />
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
