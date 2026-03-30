import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { atualizarProduto, desativarProduto, reativarProduto, type ProdutoUpdateDTO } from '../Services/produtoService';
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
    paisCodigoISO?: string;
    PaisCodigoISO?: string;
    imagemUrl?: string;
    ImagemUrl?: string;
}

interface EditarProdutoModalProps {
    produto: ProdutoApi | null;
    onClose: () => void;
    onUpdateSuccess: () => void;
}

const TAMANHOS_DISPONIVEIS = [
    { value: '1', label: 'PP Masculino' },
    { value: '2', label: 'P Masculino' },
    { value: '4', label: 'M Masculino' },
    { value: '8', label: 'G Masculino' },
    { value: '16', label: 'GG Masculino' },
    { value: '32', label: 'XL Masculino' },
    { value: '64', label: 'PP Feminino' },
    { value: '128', label: 'P Feminino' },
    { value: '256', label: 'M Feminino' },
    { value: '512', label: 'G Feminino' },
    { value: '1024', label: 'GG Feminino' }
];

const EditarProdutoModal: React.FC<EditarProdutoModalProps> = ({ produto, onClose, onUpdateSuccess }) => {
    const [nomeProduto, setNomeProduto] = useState('');
    const [descricaoProduto, setDescricaoProduto] = useState('');
    const [valorCompra, setValorCompra] = useState<number>(0);
    const [valorVenda, setValorVenda] = useState<number>(0);
    const [quantidade, setQuantidade] = useState<number>(0);
    const [paisCodigoISO, setPaisCodigoISO] = useState('');
    const [ativo, setAtivo] = useState<boolean>(true);
    const [imagemUrl, setImagemUrl] = useState('');
    const [tamanhosSelecionados, setTamanhosSelecionados] = useState<string[]>([]);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (produto) {
            setNomeProduto(produto.nomeProduto ?? produto.NomeProduto ?? '');
            setDescricaoProduto(produto.descricaoProduto ?? produto.DescricaoProduto ?? '');
            setValorCompra(produto.valorCompra ?? produto.ValorCompra ?? 0);
            setValorVenda(produto.valorVenda ?? produto.ValorVenda ?? 0);
            setQuantidade(produto.quantidade ?? produto.Quantidade ?? 0);
            setPaisCodigoISO(produto.paisCodigoISO ?? produto.PaisCodigoISO ?? '');
            setAtivo(produto.ativo !== undefined ? produto.ativo : (produto.Ativo ?? true));
            setImagemUrl(produto.imagemUrl ?? produto.ImagemUrl ?? '');
            
            // O backend retorna uma lista de strings, como ['PMasculino', 'MMasculino']
            // Precisamos mapear para os values do enum se quisermos manter compatibilidade
            // Mas no DTO de envio, ele espera array de string onde os valores são os inteiros
            // Vamos tentar inferir a partir do DTO recebido.
            // Se o backend retorna strings, precisamos mapear de volta.
            // Para simplificar, assumimos que vamos usar a UI para recriar as opções.
            // Idealmente, a API de GET deveria retornar os valores numéricos ou devemos mapear.
            // Como estamos lidando com strings literais no GET e precisamos enviar numéricos no PUT...
            let nomesTamanhos: string[] = [];
            const rawTamanho = produto.tamanho ?? produto.Tamanho;
            
            if (Array.isArray(rawTamanho)) {
                nomesTamanhos = rawTamanho;
            } else if (typeof rawTamanho === 'string') {
                nomesTamanhos = (rawTamanho as string).split(',').map(s => s.trim());
            }

            const selectedValues = TAMANHOS_DISPONIVEIS
                .filter(t => nomesTamanhos.includes(t.label.replace(' ', '')))
                .map(t => t.value);
            setTamanhosSelecionados(selectedValues);
        }
    }, [produto]);

    if (!produto) return null;

    const id = produto.produtoId ?? produto.ProdutoId;

    const handleTamanhoChange = (value: string) => {
        setTamanhosSelecionados(prev => 
            prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!id) {
            setError('ID do produto inválido.');
            return;
        }

        if (!nomeProduto || valorCompra <= 0 || valorVenda <= 0 || !paisCodigoISO) {
            setError('Por favor, preencha todos os campos obrigatórios corretamente.');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const updateData: ProdutoUpdateDTO = {
                NomeProduto: nomeProduto,
                DescricaoProduto: descricaoProduto,
                ValorCompra: valorCompra,
                ValorVenda: valorVenda,
                Quantidade: quantidade,
                PaisCodigoISO: paisCodigoISO,
                Ativo: ativo,
                ImagemUrl: imagemUrl,
                Tamanho: tamanhosSelecionados
            };

            await atualizarProduto(id, updateData);

            // Verifica se o status mudou e precisa chamar a API específica
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
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Erro desconhecido ao atualizar o produto.');
            }
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
                                <label>País (ISO) *</label>
                                <input 
                                    type="text" 
                                    maxLength={2}
                                    value={paisCodigoISO} 
                                    onChange={e => setPaisCodigoISO(e.target.value.toUpperCase())} 
                                    required 
                                    placeholder="BR, US..."
                                />
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