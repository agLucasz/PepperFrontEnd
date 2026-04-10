import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShieldCheck, MessageCircle, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { listarCategorias, type CategoriaDTO } from '../Services/categoriaService';
import '../Styles/sidebar.css';
import logo from '../Assets/logo_pepper.png';

export interface CatalogFilters {
    categoria: string;
    tamanho: string;
}

interface SidebarProps {
    onFilterChange?: (filters: CatalogFilters) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onFilterChange }) => {
    const initialFilters: CatalogFilters = {
        categoria: '',
        tamanho: ''
    };

    const [categorias, setCategorias] = useState<CategoriaDTO[]>([]);
    const [filters, setFilters] = useState<CatalogFilters>(initialFilters);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

    useEffect(() => {
        listarCategorias()
            .then(setCategorias)
            .catch(() => {});
    }, []);

    const handleFilterChange = (field: keyof CatalogFilters, value: string) => {
        const newFilters = { ...filters, [field]: value };
        setFilters(newFilters);
    };

    const applyFilters = () => {
        if (onFilterChange) onFilterChange(filters);
        setIsMobileFiltersOpen(false);
    };

    const clearFilters = () => {
        setFilters(initialFilters);
        if (onFilterChange) onFilterChange(initialFilters);
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
                {isMobile && (isMobileFiltersOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />)}
            </div>

            {(!isMobile || isMobileFiltersOpen) && (
                <div className="sidebar-filters-body">
                    <div className="sidebar-filter-group">
                        <label>Categoria</label>
                        <select
                            value={filters.categoria}
                            onChange={e => handleFilterChange('categoria', e.target.value)}
                            className="sidebar-filter-select"
                        >
                            <option value="">Todas as Categorias</option>
                            {categorias.map(cat => (
                                <option key={cat.categoriaId} value={String(cat.categoriaId)}>
                                    {cat.nomeCategoria}
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

                    <div className="sidebar-filter-actions">
                        <button onClick={applyFilters} className="sidebar-filter-apply-btn">
                            Filtrar Produtos
                        </button>
                        <button onClick={clearFilters} className="sidebar-filter-clear-btn" type="button">
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
        window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
    };

    return (
        <aside className="sidebar-container">
            <div className="sidebar-logo-wrapper">
                <img src={logo} alt="Pepper Logo" className="sidebar-logo" />
            </div>

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

                    <a href="#" onClick={handleWhatsAppClick} className="sidebar-nav-item whatsapp-btn">
                        <MessageCircle className="sidebar-nav-icon" />
                        Fale Conosco
                    </a>
                </nav>
            </div>

            {!isMobile && renderFilters()}

            {isMobile && mobileFiltersContainer && createPortal(renderFilters(), mobileFiltersContainer)}

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
