import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, LogOut, PackagePlus, Building, Wallet, ChevronDown, ChevronRight, Tag } from 'lucide-react';
import '../Styles/sidebar.css';
import logo from '../Assets/logo_pepper.png';

const AdminSidebar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [financeiroOpen, setFinanceiroOpen] = useState(
        location.pathname.includes('/admin/vendas') || location.pathname.includes('/admin/estoque')
    );

    const handleLogout = () => {
        localStorage.removeItem('pepperAuth');
        navigate('/adminLogin');
    };

    return (
        <aside className="sidebar-container">
            {/* Logo */}
            <div className="sidebar-logo-wrapper">
                <img src={logo} alt="Pepper Logo" className="sidebar-logo" />
            </div>

            {/* Menu Administrativo */}
            <div className="sidebar-menu-section">
                <h3 className="sidebar-section-title">Painel de Controle</h3>
                <nav className="sidebar-nav">
                    <NavLink 
                        to="/admin/dashboard" 
                        end
                        className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                    >
                        <LayoutDashboard className="sidebar-nav-icon" />
                        Dashboard
                    </NavLink>
                    <NavLink
                        to="/admin/produtos"
                        className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                    >
                        <Package className="sidebar-nav-icon" />
                        Produtos
                    </NavLink>

                    <NavLink
                        to="/admin/categorias"
                        className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                    >
                        <Tag className="sidebar-nav-icon" />
                        Categorias
                    </NavLink>

                    {/* Submenu Financeiro */}
                    <div>
                        <button 
                            onClick={() => setFinanceiroOpen(!financeiroOpen)} 
                            className={`sidebar-submenu-trigger ${financeiroOpen ? 'active' : ''}`}
                        >
                            <div className="sidebar-submenu-trigger-content">
                                <Wallet className="sidebar-nav-icon" />
                                Financeiro
                            </div>
                            {financeiroOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                        
                        <div 
                            className="sidebar-submenu" 
                            style={{ 
                                maxHeight: financeiroOpen ? '500px' : '0', 
                                opacity: financeiroOpen ? 1 : 0 
                            }}
                        >
                            <NavLink 
                                to="/admin/vendas" 
                                className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                            >
                                <ShoppingCart className="sidebar-nav-icon" />
                                Vendas
                            </NavLink>
                            <NavLink 
                                to="/admin/estoque" 
                                className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                            >
                                <PackagePlus className="sidebar-nav-icon" />
                                Estoque
                            </NavLink>
                        </div>
                    </div>

                    <NavLink 
                        to="/admin/empresa/cadastrar" 
                        className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                    >
                        <Building className="sidebar-nav-icon" />
                        Empresa
                    </NavLink>

                </nav>
            </div>

            {/* Área de Saída */}
            <div className="sidebar-menu-section" style={{ marginTop: 'auto', marginBottom: '0' }}>
                <nav className="sidebar-nav">
                    <button 
                        onClick={handleLogout}
                        className="sidebar-nav-item"
                        style={{ width: 'calc(100% - 20px)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: '#cbd5e1' }}
                    >
                        <LogOut className="sidebar-nav-icon" />
                        Sair
                    </button>
                </nav>
            </div>
        </aside>
    );
};

export default AdminSidebar;
