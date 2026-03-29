import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShieldCheck } from 'lucide-react';
import '../Styles/sidebar.css';
import logo from '../Assets/logo_pepper.png';

const Sidebar: React.FC = () => {
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
                </nav>
            </div>

            {/* Área Administrativa */}
            <div className="sidebar-menu-section">
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
