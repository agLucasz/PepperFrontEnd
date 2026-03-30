import React from 'react';
import { Link } from 'react-router-dom';
import { PackagePlus, ClipboardList } from 'lucide-react';
import AdminSidebar from '../../../Components/AdminSidebar';
import '../../../Styles/Admin/adminDashBoard.css';
import '../../../Styles/Admin/Estoque/estoque.css';

const Estoque: React.FC = () => {
    return (
        <div className="admin-dashboard-layout">
            <AdminSidebar />
            
            <main className="admin-dashboard-content">
                <header className="admin-dashboard-header">
                    <h2 className="admin-dashboard-title">Estoque</h2>
                    <p className="admin-dashboard-subtitle">Gerencie as entradas e o histórico de movimentações do estoque.</p>
                </header>
                
                <div className="estoque-container">
                    <Link to="/admin/estoque/lancar" className="estoque-card">
                        <PackagePlus size={48} className="estoque-card-icon" />
                        <h3 className="estoque-card-title">Lançar Entrada</h3>
                        <p className="estoque-card-description">
                            Registre a entrada de novos produtos no estoque, atualizando a quantidade disponível.
                        </p>
                    </Link>

                    <Link to="/admin/estoque/listar" className="estoque-card">
                        <ClipboardList size={48} className="estoque-card-icon" />
                        <h3 className="estoque-card-title">Histórico de Entradas</h3>
                        <p className="estoque-card-description">
                            Visualize o histórico de todas as entradas de produtos realizadas no sistema.
                        </p>
                    </Link>
                </div>
            </main>
        </div>
    );
};

export default Estoque;
