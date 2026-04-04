import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShieldCheck, MessageCircle, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { listarPaisesComProdutos, type PaisApi } from '../Services/localizacaoService';
import '../Styles/sidebar.css';
import logo from '../Assets/logo_pepper.png';

export interface CatalogFilters {
    pais: string;
    tamanho: string;
    precoMin: string;
    precoMax: string;
}

interface SidebarProps {
    onFilterChange?: (filters: CatalogFilters) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onFilterChange }) => {
    const initialFilters: CatalogFilters = {
        pais: '',
        tamanho: '',
        precoMin: '',
        precoMax: ''
    };

    const [paises, setPaises] = useState<PaisApi[]>([]);
    const [filters, setFilters] = useState<CatalogFilters>(initialFilters);

    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

    useEffect(() => {
        const fetchPaises = async () => {
            try {
                const data = await listarPaisesComProdutos();
                setPaises(data);
            } catch (error) {
                console.error("Erro ao carregar países:", error);
            }
        };
        void fetchPaises();
    }, []);

    const handleFilterChange = (field: keyof CatalogFilters, value: string) => {
        const newFilters = { ...filters, [field]: value };
        setFilters(newFilters);
    };

    const applyFilters = () => {
        if (onFilterChange) {
            onFilterChange(filters);
        }
        setIsMobileFiltersOpen(false); // Fecha os filtros no mobile após aplicar
    };

    const clearFilters = () => {
        setFilters(initialFilters);
        if (onFilterChange) {
            onFilterChange(initialFilters);
        }
    };

    const isMobile = window.innerWidth <= 768;

    const renderFilters = () => (
        <div className="sidebar-menu-section sidebar-filters-section">
            <div 
                className="sidebar-filters-header" 
                onClick={() => isMobile && setIsMobileFiltersOpen(!isMobileFiltersOpen)}
                style={{ cursor: isMobile ? 'pointer' : 'default' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Filter size={18} />
                    <h3 className="sidebar-section-title" style={{ margin: 0 }}>Filtros</h3>
                </div>
                {isMobile && (
                    isMobileFiltersOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />
                )}
            </div>
            
            {(!isMobile || isMobileFiltersOpen) && (
                <div className="sidebar-filters-body">
                    <div className="sidebar-filter-group">
                        <label>País / Seleção</label>
                        <select 
                            value={filters.pais} 
                            onChange={e => handleFilterChange('pais', e.target.value)}
                            className="sidebar-filter-select"
                        >
                            <option value="">Todos os Países</option>
                            {paises.map(p => (
                                <option key={p.codigoISO2 || p.CodigoISO2} value={p.codigoISO2 || p.CodigoISO2}>
                                    {p.nome || p.Nome}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="sidebar-filter-group">
                        <label>Tamanho</label>
                        <select 
                            value={filters.tamanho} 
                            onChange={e => handleFilterChange('tamanho', e.target.value)}
                            className="sidebar-filter-select"
                        >
                            <option value="">Todos</option>
                            <option value="PP">PP</option>
                            <option value="P">P</option>
                            <option value="M">M</option>
                            <option value="G">G</option>
                            <option value="GG">GG</option>
                            <option value="GGG">GGG</option>
                        </select>
                    </div>

                    <div className="sidebar-filter-group">
                        <label>Faixa de Preço (R$)</label>
                        <div className="sidebar-filter-price-inputs">
                            <input 
                                type="number" 
                                placeholder="Mín" 
                                value={filters.precoMin}
                                onChange={e => handleFilterChange('precoMin', e.target.value)}
                                className="sidebar-filter-input"
                            />
                            <span>-</span>
                            <input 
                                type="number" 
                                placeholder="Máx" 
                                value={filters.precoMax}
                                onChange={e => handleFilterChange('precoMax', e.target.value)}
                                className="sidebar-filter-input"
                            />
                        </div>
                    </div>

                    <div className="sidebar-filter-actions">
                        <button 
                            onClick={applyFilters}
                            className="sidebar-filter-apply-btn"
                        >
                            Filtrar Produtos
                        </button>
                        <button
                            onClick={clearFilters}
                            className="sidebar-filter-clear-btn"
                            type="button"
                        >
                            Limpar Filtros
                        </button>
                    </div>
                </div>
            )}
        </div>
    );

    const mobileFiltersContainer = document.getElementById('mobile-filters-container');

    const handleWhatsAppClick = (e: React.MouseEvent) => {
        e.preventDefault();
        const phoneNumber = '5514981635560'; 
        const message = 'Olá! Gostaria de tirar algumas dúvidas.';
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    return (
        <aside className="sidebar-container">
            {/* Logo */}
            <div className="sidebar-logo-wrapper">
                <img src={logo} alt="Pepper Logo" className="sidebar-logo" />
            </div>

            {/* Menu Principal */}
            <div className="sidebar-menu-section">
                <h3 className="sidebar-section-title">Menu Principal</h3>
                <nav className="sidebar-nav">
                    <NavLink 
                        to="/catalogo" 
                        end
                        className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                    >
                        <LayoutDashboard className="sidebar-nav-icon" />
                        Catálogo
                    </NavLink>

                    <a 
                        href="#" 
                        onClick={handleWhatsAppClick}
                        className="sidebar-nav-item whatsapp-btn"
                    >
                        <MessageCircle className="sidebar-nav-icon" />
                        Fale Conosco
                    </a>
                </nav>
            </div>

            {/* Filtros */}
            {!isMobile && renderFilters()}

            {/* Portal dos Filtros para Mobile */}
            {isMobile && mobileFiltersContainer && createPortal(renderFilters(), mobileFiltersContainer)}

            {/* Área Administrativa */}
            <div className="sidebar-menu-section bottom-section admin-section-hide-mobile">
                <h3 className="sidebar-section-title">Configurações</h3>
                <nav className="sidebar-nav">
                    <NavLink 
                        to="/adminLogin" 
                        className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                    >
                        <ShieldCheck className="sidebar-nav-icon" />
                        Área Admin
                    </NavLink>
                </nav>
            </div>
        </aside>
    );
};

export default Sidebar;
