import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, List } from 'lucide-react';
import AdminSidebar from '../../../Components/AdminSidebar';
import '../../../Styles/Admin/adminDashBoard.css';
import '../../../Styles/Admin/Categorias/Categorias.css';

const Categorias: React.FC = () => {
    return (
        <div className="admin-dashboard-layout">
            <AdminSidebar />

            <main className="admin-dashboard-content">
                <header className="admin-dashboard-header">
                    <h2 className="admin-dashboard-title">Categorias</h2>
                    <p className="admin-dashboard-subtitle">Organize os produtos por categorias.</p>
                </header>

                <div className="categorias-container">
                    <Link to="/admin/categorias/cadastrar" className="categoria-card">
                        <PlusCircle size={48} className="categoria-card-icon" />
                        <h3 className="categoria-card-title">Cadastrar Categoria</h3>
                        <p className="categoria-card-description">
                            Crie novas categorias para organizar e classificar os produtos do catálogo.
                        </p>
                    </Link>

                    <Link to="/admin/categorias/listar" className="categoria-card">
                        <List size={48} className="categoria-card-icon" />
                        <h3 className="categoria-card-title">Listar Categorias</h3>
                        <p className="categoria-card-description">
                            Visualize, edite ou remova as categorias cadastradas no sistema.
                        </p>
                    </Link>
                </div>
            </main>
        </div>
    );
};

export default Categorias;
