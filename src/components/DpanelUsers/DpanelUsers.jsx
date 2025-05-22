import React, { useContext, useEffect, useState } from 'react';
import DpanelEdit from './DpanelEdit';
import { UserContext } from '../../context/UserContext';
import { FaEdit, FaTrash } from 'react-icons/fa';
import Notification from '../Notification/Notification';
import { useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';

const DpanelUsers = () => {
    const { user, getAll, setMessege, deleteUser } = useContext(UserContext);
    const [currentPage, setCurrentPage] = useState(1);
    const [page, setPage] = useState('inicial');
    const [userSelect, setUserSelect] = useState('');
    const [arrayUser, setArrayUser] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const itemsPerPage = 15;
    const [showModal, setShowModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [showNotification, setShowNotification] = useState(false);
    const [allUsers, setAllUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const location = useLocation();

    useEffect(() => {
        const fetchAllUsers = async () => {
            const data = await getAll(1, 10000); // Busca todos os usuários
            setAllUsers(data);
            setFilteredUsers(data);
        };
        fetchAllUsers();
    }, [location]);

    // WebSocket para atualização ao vivo
    useEffect(() => {
        const socket = io('http://localhost:3000', { path: '/socket.io' });
        socket.on('userLocationUpdate', ({ nickname, currentLocation }) => {
            setAllUsers(prevUsers => prevUsers.map(u =>
                u.nickname === nickname ? { ...u, currentLocation } : u
            ));
            setFilteredUsers(prevUsers => prevUsers.map(u =>
                u.nickname === nickname ? { ...u, currentLocation } : u
            ));
        });
        return () => {
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredUsers(allUsers);
        } else {
            setFilteredUsers(
                allUsers.filter(user =>
                    user.nickname && user.nickname.toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }
        setCurrentPage(1); // Sempre volta para a primeira página ao buscar
    }, [searchTerm, allUsers]);

    useEffect(() => {
        if (Array.isArray(user)) {
            setArrayUser(user);
        } else {
            console.error('Expected user to be an array but got:', user);
        }
    }, [user]);

    const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleSearch = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        setCurrentPage(1); // Reset to first page when search term changes
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleViewUser = (user) => {
        setPage('Edit');
        setUserSelect(user);
        setMessege('');
    };

    const handleDelete = async () => {
        if (userToDelete) {
            await deleteUser(userToDelete._id);
            setAllUsers(prev => prev.filter(u => u._id !== userToDelete._id));
            setFilteredUsers(prev => prev.filter(u => u._id !== userToDelete._id));
            setShowModal(false);
            setShowNotification(true);
            setTimeout(() => setShowNotification(false), 2200);
        }
    };

    return (
        <div className="w-full px-0 py-8">
            <h1 className="text-3xl font-bold mb-6">Usuários</h1>
                    <input
                        type="text"
                        placeholder="Buscar usuário"
                        value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="mb-4 p-3 border rounded w-full text-lg"
                    />
            <div className="bg-white shadow rounded-lg p-6 w-full">
                        <table className="min-w-full w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nickname</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patente</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Localização</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nível</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-4 text-yellow-700">Nenhum usuário encontrado.</td>
                                    </tr>
                                ) : (
                            paginatedUsers.map((user, idx) => (
                                        <tr key={user._id}>
                                            <td className="px-4 py-2">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                                            <td className="px-4 py-2 font-semibold">{user.nickname}</td>
                                            <td className="px-4 py-2">{user.patent}</td>
                                            <td className="px-4 py-2">{user.ip || '-'}</td>
                                            <td className="px-4 py-2">{user.currentLocation || '-'}</td>
                                            <td className="px-4 py-2">{user.status || 'Ativado'}</td>
                                    <td className="px-4 py-2">{
                                        user.userType === 'Admin' ? 'Administrador' :
                                        user.userType === 'Diretor' ? 'Setor de Inteligência' :
                                        user.userType === 'Recursos Humanos' ? 'Recursos Humanos' :
                                        user.userType
                                    }</td>
                                            <td className="px-4 py-2 flex gap-2">
                                                <button
                                                    onClick={() => handleViewUser(user)}
                                                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-1"
                                                    title="Editar"
                                                >
                                                    <FaEdit size={16} /> Editar
                                                </button>
                                                <button
                                            onClick={() => { setUserToDelete(user); setShowModal(true); }}
                                                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-1"
                                                    title="Apagar"
                                                >
                                                    <FaTrash size={16} /> Apagar
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                <div className="flex justify-between mt-4">
                        <button
                        className="p-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition" 
                        onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                        Anterior
                        </button>
                        <button
                        className="p-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition" 
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === Math.ceil(filteredUsers.length / itemsPerPage)}
                        >
                        Próxima
                        </button>
                    </div>
                </div>
            {page === "Edit" &&
                <DpanelEdit
                    setPage={setPage}
                    userSelect={userSelect}
                />
            }
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.01)' }}>
                    <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-center">
                        <h2 className="text-xl font-bold mb-4">Confirmação</h2>
                        <p className="mb-6">Tem certeza que deseja excluir o usuário <span className="font-semibold">"{userToDelete?.nickname}"</span>? Essa ação não poderá ser desfeita.</p>
                        <div className="flex justify-center gap-4">
                            <button
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                                onClick={handleDelete}
                            >
                                Excluir
                            </button>
                            <button
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
                                onClick={() => setShowModal(false)}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showNotification && (
                <Notification message="Usuário excluído com sucesso." onClose={() => setShowNotification(false)} type="success" />
            )}
        </div>
    );
};

export default DpanelUsers;
