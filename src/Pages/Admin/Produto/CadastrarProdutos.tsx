import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Save, X, CheckCircle, AlertCircle } from 'lucide-react';
import AdminSidebar from '../../../Components/AdminSidebar';
import { cadastrarProduto, uploadImagem } from '../../../Services/produtoService';
import type { ProdutoCreateDTO } from '../../../Services/produtoService';
import { listarCategorias, type CategoriaDTO } from '../../../Services/categoriaService';
import '../../../Styles/Admin/adminDashBoard.css';
import '../../../Styles/Admin/Produto/CadastrarProdutos.css';

const CadastrarProdutos: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [imagens, setImagens] = useState<File[]>([]);
    const [categorias, setCategorias] = useState<CategoriaDTO[]>([]);
    const [showCategoriaModal, setShowCategoriaModal] = useState(false);
    const [showTamanhoModal, setShowTamanhoModal] = useState(false);

    const [formData, setFormData] = useState<ProdutoCreateDTO>({
        NomeProduto: '',
        DescricaoProduto: '',
        ValorCompra: 0,
        ValorVenda: 0,
        Quantidade: 0,
        Tamanho: [],
        CategoriaId: 0,
        ImagemUrl: ''
    });

    const tamanhosOpcoes = [
        { value: '1', label: 'PP' },
        { value: '2', label: 'P' },
        { value: '4', label: 'M' },
        { value: '8', label: 'G' },
        { value: '16', label: 'GG' },
        { value: '32', label: 'GGG' },
        { value: '64', label: 'GGGG' }
    ];

    useEffect(() => {
        listarCategorias()
            .then(setCategorias)
            .catch(() => setError('Erro ao carregar categorias. Cadastre uma categoria antes de continuar.'));
    }, []);

    const categoriaSelecionada = categorias.find(c => c.categoriaId === formData.CategoriaId);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'Quantidade' ? Number(value) : value
        }));
    };

    const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const onlyDigits = value.replace(/\D/g, '');
        if (!onlyDigits) {
            setFormData(prev => ({ ...prev, [name]: 0 }));
            return;
        }
        setFormData(prev => ({ ...prev, [name]: parseInt(onlyDigits, 10) / 100 }));
    };

    const toggleTamanho = (valor: string) => {
        setFormData(prev => {
            const atual = prev.Tamanho || [];
            return {
                ...prev,
                Tamanho: atual.includes(valor) ? atual.filter(t => t !== valor) : [...atual, valor]
            };
        });
    };

    const handleSelectCategoria = (id: number) => {
        setFormData(prev => ({ ...prev, CategoriaId: id }));
        setShowCategoriaModal(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        if (!selectedFiles.length) { setImagens([]); return; }

        const extensoesPermitidas = ['.jpg', '.jpeg', '.png', '.webp'];
        const possuiInvalida = selectedFiles.some(file => {
            const nome = file.name.toLowerCase();
            return !extensoesPermitidas.some(ext => nome.endsWith(ext)) || file.size > 5 * 1024 * 1024;
        });

        if (possuiInvalida) {
            setError('Todas as imagens devem ser JPG, JPEG, PNG ou WEBP e ter no máximo 5MB cada.');
            setImagens([]);
            e.target.value = '';
            return;
        }

        setError(null);
        setImagens(selectedFiles);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!imagens.length) { setError('Selecione pelo menos uma imagem antes de salvar.'); return; }
        if (!formData.CategoriaId) { setError('Selecione uma categoria antes de salvar.'); return; }

        setLoading(true);
        try {
            const urlsImagens: string[] = [];
            for (const arquivo of imagens) {
                urlsImagens.push(await uploadImagem(arquivo));
            }

            await cadastrarProduto({ ...formData, ImagemUrl: urlsImagens.join(',') });
            setSuccess('Produto cadastrado com sucesso!');

            setFormData({
                NomeProduto: '', DescricaoProduto: '',
                ValorCompra: 0, ValorVenda: 0, Quantidade: 0,
                Tamanho: [], CategoriaId: 0, ImagemUrl: ''
            });
            setImagens([]);
            setTimeout(() => navigate('/admin/produtos/listar'), 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocorreu um erro inesperado ao cadastrar o produto.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-dashboard-layout">
            <AdminSidebar />

            <main className="admin-dashboard-content">
                <header className="admin-dashboard-header">
                    <h2 className="admin-dashboard-title">Cadastrar Produto</h2>
                    <p className="admin-dashboard-subtitle">Adicione uma nova camisa ao catálogo.</p>
                </header>

                <div className="cadastro-produto-container">
                    {error && (
                        <div className="feedback-message feedback-error">
                            <AlertCircle size={20} />
                            <span>{error}</span>
                        </div>
                    )}
                    {success && (
                        <div className="feedback-message feedback-success">
                            <CheckCircle size={20} />
                            <span>{success}</span>
                        </div>
                    )}

                    <form className="cadastro-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="NomeProduto">Nome do Produto *</label>
                            <input
                                type="text"
                                id="NomeProduto"
                                name="NomeProduto"
                                value={formData.NomeProduto}
                                onChange={handleInputChange}
                                placeholder="Ex: Camisa Real Madrid 2024 Oficial"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="DescricaoProduto">Descrição</label>
                            <textarea
                                id="DescricaoProduto"
                                name="DescricaoProduto"
                                value={formData.DescricaoProduto}
                                onChange={handleInputChange}
                                placeholder="Detalhes da camisa, tecido, temporada..."
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group small">
                                <label htmlFor="ValorCompra">Valor Compra (R$) *</label>
                                <input
                                    type="text"
                                    id="ValorCompra"
                                    name="ValorCompra"
                                    value={formData.ValorCompra === 0 ? '' : formData.ValorCompra.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    onChange={handleCurrencyChange}
                                    placeholder="0,00"
                                    required
                                />
                            </div>

                            <div className="form-group small">
                                <label htmlFor="ValorVenda">Valor Venda (R$) *</label>
                                <input
                                    type="text"
                                    id="ValorVenda"
                                    name="ValorVenda"
                                    value={formData.ValorVenda === 0 ? '' : formData.ValorVenda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    onChange={handleCurrencyChange}
                                    placeholder="0,00"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group small">
                                <label htmlFor="Quantidade">Estoque Inicial *</label>
                                <input
                                    type="number"
                                    id="Quantidade"
                                    name="Quantidade"
                                    value={formData.Quantidade || ''}
                                    onChange={handleInputChange}
                                    min="0"
                                    required
                                />
                            </div>

                            <div className="form-group medium" style={{ position: 'relative' }}>
                                <label>Tamanho *</label>
                                <input
                                    type="text"
                                    value={formData.Tamanho.length > 0 ? `${formData.Tamanho.length} selecionado(s)` : ''}
                                    readOnly
                                    onClick={() => setShowTamanhoModal(true)}
                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); setShowTamanhoModal(true); } }}
                                    placeholder="Clique para selecionar"
                                    required
                                    style={{ cursor: 'pointer' }}
                                />
                                {showTamanhoModal && (
                                    <div className="modal-overlay" onClick={() => setShowTamanhoModal(false)}>
                                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                                            <div className="modal-header">
                                                <h3>Selecione os Tamanhos</h3>
                                                <button type="button" onClick={() => setShowTamanhoModal(false)}><X size={20} /></button>
                                            </div>
                                            <div className="tamanhos-list">
                                                {tamanhosOpcoes.map(opcao => (
                                                    <div
                                                        key={opcao.value}
                                                        className={`tamanho-item ${formData.Tamanho.includes(opcao.value) ? 'selected' : ''}`}
                                                        onClick={() => toggleTamanho(opcao.value)}
                                                    >
                                                        <div className="checkbox-custom">
                                                            {formData.Tamanho.includes(opcao.value) && <CheckCircle size={14} />}
                                                        </div>
                                                        <span>{opcao.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <button type="button" className="btn-salvar-modal" onClick={() => setShowTamanhoModal(false)}>
                                                Confirmar
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="form-group medium" style={{ position: 'relative' }}>
                                <label>Categoria *</label>
                                <input
                                    type="text"
                                    value={categoriaSelecionada ? categoriaSelecionada.nomeCategoria : ''}
                                    readOnly
                                    onClick={() => setShowCategoriaModal(true)}
                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); setShowCategoriaModal(true); } }}
                                    placeholder="Clique para selecionar"
                                    required
                                    style={{ cursor: 'pointer' }}
                                />
                                {showCategoriaModal && (
                                    <div className="modal-overlay" onClick={() => setShowCategoriaModal(false)}>
                                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                                            <div className="modal-header">
                                                <h3>Selecione uma Categoria</h3>
                                                <button type="button" onClick={() => setShowCategoriaModal(false)}><X size={20} /></button>
                                            </div>
                                            {categorias.length === 0 ? (
                                                <p style={{ padding: '24px', textAlign: 'center', color: '#888' }}>
                                                    Nenhuma categoria cadastrada.
                                                </p>
                                            ) : (
                                                <ul className="country-list modal-list">
                                                    {categorias.map(cat => (
                                                        <li
                                                            key={cat.categoriaId}
                                                            onClick={() => handleSelectCategoria(cat.categoriaId)}
                                                            className={formData.CategoriaId === cat.categoriaId ? 'selected' : ''}
                                                        >
                                                            <span>{cat.nomeCategoria}</span>
                                                            {formData.CategoriaId === cat.categoriaId && <CheckCircle size={16} className="check-icon" />}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Imagens do Produto</label>
                            <div className="file-upload-wrapper">
                                <Upload size={32} className="file-upload-icon" />
                                <p className="file-upload-text">
                                    Clique ou arraste imagens aqui (você pode selecionar várias)
                                </p>
                                <input
                                    type="file"
                                    multiple
                                    accept=".jpg,.jpeg,.png,.webp"
                                    onChange={handleFileChange}
                                    onKeyDown={e => e.key === 'Enter' && e.preventDefault()}
                                />
                                {imagens.length > 0 && (
                                    <ul className="file-list">
                                        {imagens.map((file, i) => (
                                            <li key={i} className="file-list-item">{file.name}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn-cancelar"
                                onClick={() => navigate('/admin/produtos')}
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="btn-salvar"
                                disabled={loading}
                            >
                                {loading ? 'Salvando...' : 'Salvar Produto'}
                                <Save size={18} />
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default CadastrarProdutos;
