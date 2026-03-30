import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, List } from 'lucide-react';
import AdminSidebar from '../../../Components/AdminSidebar';
import '../../../Styles/Admin/adminDashBoard.css';
import '../../../Styles/Admin/Venda/venda.css';

const Vendas: React.FC = () => {
    return (
        <div className="admin-dashboard-layout">
            <AdminSidebar />
            
            <main className="admin-dashboard-content">
                <header className="admin-dashboard-header">
                    <h2 className="admin-dashboard-title">Vendas (PDV)</h2>
                    <p className="admin-dashboard-subtitle">Gerencie e realize novas vendas no sistema.</p>
                </header>
                
                <div className="vendas-container">
                    <Link to="/admin/vendas/cadastrar" className="venda-card">
                        <ShoppingCart size={48} className="venda-card-icon" />
                        <h3 className="venda-card-title">Nova Venda</h3>
                        <p className="venda-card-description">
                            Acesse o PDV para registrar os produtos, dar baixa no estoque e finalizar uma venda.
                        </p>
                    </Link>

                    <Link to="/admin/vendas/listar" className="venda-card">
                        <List size={48} className="venda-card-icon" />
                        <h3 className="venda-card-title">Histórico de Vendas</h3>
                        <p className="venda-card-description">
                            Visualize as vendas realizadas, confira valores, itens e detalhes de cada transação.
                        </p>
                    </Link>
                </div>
            </main>
        </div>
    );
};

export default Vendas;
