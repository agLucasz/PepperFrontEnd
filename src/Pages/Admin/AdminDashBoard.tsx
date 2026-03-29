import React from 'react';
import AdminSidebar from '../../Components/AdminSidebar';
import '../../Styles/Admin/adminDashBoard.css';

const AdminDashBoard: React.FC = () => {
    return (
        <div className="admin-dashboard-layout">
            <AdminSidebar />
            
            <main className="admin-dashboard-content">
                <header className="admin-dashboard-header">
                    <h2 className="admin-dashboard-title">Dashboard</h2>
                    <p className="admin-dashboard-subtitle">Bem-vindo ao painel de controle administrativo.</p>
                </header>
                
                <div>
                    <p>Resumo das atividades será exibido aqui...</p>
                </div>
            </main>
        </div>
    );
};

export default AdminDashBoard;
