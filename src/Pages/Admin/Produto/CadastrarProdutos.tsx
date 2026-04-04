import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Save, X, CheckCircle, AlertCircle } from 'lucide-react';
import AdminSidebar from '../../../Components/AdminSidebar';
import { cadastrarProduto, uploadImagem } from '../../../Services/produtoService';
import type { ProdutoCreateDTO } from '../../../Services/produtoService';
import '../../../Styles/Admin/adminDashBoard.css';
import '../../../Styles/Admin/Produto/CadastrarProdutos.css';

const CadastrarProdutos: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [imagens, setImagens] = useState<File[]>([]);

    const [formData, setFormData] = useState<ProdutoCreateDTO>({
        NomeProduto: '',
        DescricaoProduto: '',
        ValorCompra: 0,
        ValorVenda: 0,
        Quantidade: 0,
        Tamanho: [],
        PaisCodigoISO: 'BR',
        ImagemUrl: ''
    });

    const [showCountryMenu, setShowCountryMenu] = useState(false);
    const [showTamanhoModal, setShowTamanhoModal] = useState(false);

    const tamanhosOpcoes = [
        { value: '1', label: 'PP' },
        { value: '2', label: 'P' },
        { value: '4', label: 'M' },
        { value: '8', label: 'G' },
        { value: '16', label: 'GG' },
        { value: '32', label: 'GGG' },
        { value: '64', label: 'GGGG' }
    ];

    const paisesISO = [
        { codigo: 'BR', nome: 'Brasil' },
        { codigo: 'US', nome: 'Estados Unidos' },
        { codigo: 'GB', nome: 'Reino Unido' },
        { codigo: 'ES', nome: 'Espanha' },
        { codigo: 'IT', nome: 'Itália' },
        { codigo: 'FR', nome: 'França' },
        { codigo: 'DE', nome: 'Alemanha' },
        { codigo: 'PT', nome: 'Portugal' },
        { codigo: 'AR', nome: 'Argentina' }
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'select-multiple') {
            const select = e.target as HTMLSelectElement;
            const selectedOptions = Array.from(select.selectedOptions).map(option => option.value);
            setFormData(prev => ({
                ...prev,
                [name]: selectedOptions
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: name.includes('Valor') || name === 'Quantidade' ? Number(value) : value
            }));
        }
    };

    const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const onlyDigits = value.replace(/\D/g, '');
        if (!onlyDigits) {
            setFormData(prev => ({ ...prev, [name]: 0 }));
            return;
        }
        const numericValue = parseInt(onlyDigits, 10) / 100;
        setFormData(prev => ({ ...prev, [name]: numericValue }));
    };

    const handleKeyDownPais = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            setShowCountryMenu(true);
        }
    };

    const handleKeyDownTamanho = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            setShowTamanhoModal(true);
        }
    };

    const toggleTamanho = (valor: string) => {
        setFormData(prev => {
            const tamanhosAtuais = prev.Tamanho || [];
            if (tamanhosAtuais.includes(valor)) {
                return { ...prev, Tamanho: tamanhosAtuais.filter(t => t !== valor) };
            } else {
                return { ...prev, Tamanho: [...tamanhosAtuais, valor] };
            }
        });
    };

    const handleSelectCountry = (codigo: string) => {
        setFormData(prev => ({ ...prev, PaisCodigoISO: codigo }));
        setShowCountryMenu(false);
    };

    // Fechar menu ao clicar fora
    React.useEffect(() => {
        const handleClickOutside = () => setShowCountryMenu(false);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        if (selectedFiles.length === 0) {
            setImagens([]);
            return;
        }

        const extensoesPermitidas = ['.jpg', '.jpeg', '.png', '.webp'];
        const possuiInvalida = selectedFiles.some(file => {
            const nome = file.name.toLowerCase();
            const extensaoValida = extensoesPermitidas.some(ext => nome.endsWith(ext));
            const tamanhoValido = file.size <= 5 * 1024 * 1024;
            return !extensaoValida || !tamanhoValido;
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
        if (!imagens.length) {
            setError('Selecione pelo menos uma imagem antes de salvar.');
            return;
        }
        setLoading(true);

        try {
            const urlsImagens: string[] = [];

            for (const arquivo of imagens) {
                const url = await uploadImagem(arquivo);
                urlsImagens.push(url);
            }

            await cadastrarProduto({
                ...formData,
                ImagemUrl: urlsImagens.join(',')
            });
            setSuccess('Produto cadastrado com sucesso!');

            setFormData({
                NomeProduto: '',
                DescricaoProduto: '',
                ValorCompra: 0,
                ValorVenda: 0,
                Quantidade: 0,
                Tamanho: [],
                PaisCodigoISO: 'BR',
                ImagemUrl: ''
            });
            setImagens([]);

            setTimeout(() => {
                navigate('/admin/produtos/listar');
            }, 2000);
            
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Ocorreu um erro inesperado ao cadastrar o produto.');
            }
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
                                    value={formData.ValorCompra === 0 ? '' : formData.ValorCompra.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                                    value={formData.ValorVenda === 0 ? '' : formData.ValorVenda.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                                <label htmlFor="Tamanho">Tamanho *</label>
                                <input 
                                    type="text" 
                                    id="Tamanho" 
                                    name="Tamanho" 
                                    value={formData.Tamanho && formData.Tamanho.length > 0 ? `${formData.Tamanho.length} selecionado(s)` : ''}
                                    readOnly
                                    onClick={() => setShowTamanhoModal(true)}
                                    onKeyDown={handleKeyDownTamanho}
                                    placeholder="Clique ou Enter p/ selecionar"
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
                                                {tamanhosOpcoes.map((opcao) => (
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
                                <label htmlFor="PaisCodigoISO">País (ISO) *</label>
                                <input 
                                    type="text" 
                                    id="PaisCodigoISO" 
                                    name="PaisCodigoISO" 
                                    value={formData.PaisCodigoISO}
                                    onClick={() => setShowCountryMenu(true)}
                                    onKeyDown={handleKeyDownPais}
                                    placeholder="Clique ou Enter p/ selecionar"
                                    readOnly
                                    required
                                    style={{ cursor: 'pointer' }}
                                />
                                
                                {showCountryMenu && (
                                    <div className="modal-overlay" onClick={() => setShowCountryMenu(false)}>
                                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                                            <div className="modal-header">
                                                <h3>Selecione um País</h3>
                                                <button type="button" onClick={() => setShowCountryMenu(false)}><X size={20} /></button>
                                            </div>
                                            <ul className="country-list modal-list">
                                                {paisesISO.map((pais) => (
                                                    <li 
                                                        key={pais.codigo}
                                                        onClick={() => handleSelectCountry(pais.codigo)}
                                                        className={formData.PaisCodigoISO === pais.codigo ? 'selected' : ''}
                                                    >
                                                        <span className="country-code">{pais.codigo} - </span>
                                                        <span className="country-name">{pais.nome}</span>
                                                        {formData.PaisCodigoISO === pais.codigo && <CheckCircle size={16} className="check-icon" />}
                                                    </li>
                                                ))}
                                            </ul>
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
                                    onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                                />
                                {imagens.length > 0 && (
                                    <ul className="file-list">
                                        {imagens.map((file, index) => (
                                            <li key={index} className="file-list-item">
                                                {file.name}
                                            </li>
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
