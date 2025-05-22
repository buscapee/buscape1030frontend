import React, { useContext, useEffect, useState } from 'react';
import { SystemContext } from '../../context/SystemContext';
import { UserContext } from '../../context/UserContext';
import Notification from '../Notification/Notification';
import { TeamsContext } from '../../context/TeamsContext';
import { FaEdit, FaCogs, FaSave, FaUsers, FaStar, FaKey } from 'react-icons/fa';
import axiosInstance from '../../provider/axiosInstance';

const DpanelEdit = ({ userSelect, setPage }) => {
    const { infoSystem } = useContext(SystemContext);
    const { updateUserAdmin, messege, deleteUser, getLogs, loggers, loading } = useContext(UserContext);
    const { teams, updateTeam, removeMember, getTeams, infoTeams } = useContext(TeamsContext);
    const [nickname, setNickname] = useState('');
    const [patent, setPatent] = useState('');
    const [status, setStatus] = useState('');
    const [tag, setTag] = useState('');
    const [warnings, setWarnings] = useState('');
    const [medals, setMedals] = useState('');
    const [userType, setUserType] = useState('');
    const [showEditNotification, setShowEditNotification] = useState(false);
    const [showTeamsModal, setShowTeamsModal] = useState(false);
    const [editTeamModal, setEditTeamModal] = useState({ open: false, team: null, cargo: '' });
    const [confirmDeleteModal, setConfirmDeleteModal] = useState({ open: false, team: null });
    const [userTeamsState, setUserTeamsState] = useState([]);
    const [showHonrariasModal, setShowHonrariasModal] = useState(false);
    const [honrarias, setHonrarias] = useState([
        { nome: '', imagem: '' }
    ]);
    const [honrariasError, setHonrariasError] = useState("");
    const [showIPModal, setShowIPModal] = useState(false);
    const [ipLogs, setIpLogs] = useState([]);
    const [loadingIp, setLoadingIp] = useState(false);
    const [systemHonrarias, setSystemHonrarias] = useState([]);

    const userAdmin = JSON.parse(localStorage.getItem("@Auth:Profile"));
    
    useEffect(() => {
        if (userSelect) {
            setNickname(userSelect.nickname || '');
            setPatent(userSelect.patent || '');
            setStatus(userSelect.status || '');
            setTag(userSelect.tag || '');
            setWarnings(userSelect.warnings || '');
            setMedals(userSelect.medals || '');
            setUserType(userSelect.userType || '');
            setHonrarias(Array.isArray(userSelect.honrarias) && userSelect.honrarias.length > 0 ? userSelect.honrarias : [{ nome: '', imagem: '' }]);
        }
    }, [userSelect]);

    const body = infoSystem && infoSystem[0]?.patents?.includes(userSelect.patent);

    useEffect(() => {
        if (showTeamsModal) {
            setUserTeamsState(getUserTeamsAndOffices());
        }
        // eslint-disable-next-line
    }, [showTeamsModal]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = {
            idEdit: userSelect._id,
            nickname,
            patent,
            status,
            tag,
            warnings,
            medals,
            userType,
            honrarias,
        }
        updateUserAdmin(data);
        setShowEditNotification(true);
        setTimeout(() => setShowEditNotification(false), 2200);
        setTimeout(() => window.location.reload(), 1000);
    };

    const handleDelete = () => {
        console.log("Entrou aqui")
        if (window.confirm("Você tem certeza que deseja deletar este usuário?")){
           console.log(window.confirm) 
            deleteUser(userSelect._id);
            setPage("inicial");
        }
    };

    // Função para buscar equipes e cargos do usuário (agora busca em todas as equipes, não só em teans)
    const getUserTeamsAndOffices = () => {
        if (!userSelect || !Array.isArray(teams)) return [];
        let result = [];
        teams.forEach(team => {
            // Líder
            if (team.leader === userSelect.nickname) {
                result.push({ name: team.nameTeams, emblema: team.emblema, cargo: 'Líder' });
            }
            // Vice-Líder
            if (team.viceLeader === userSelect.nickname) {
                result.push({ name: team.nameTeams, emblema: team.emblema, cargo: 'Vice-Líder' });
            }
            // Outros cargos
            (team.members || []).forEach(m => {
                if (m.nickname === userSelect.nickname) {
                    result.push({ name: team.nameTeams, emblema: team.emblema, cargo: m.office });
                }
            });
        });
        // Remover duplicatas (caso algum cargo já tenha sido adicionado)
        result = result.filter((item, index, self) =>
            index === self.findIndex((t) => (
                t.name === item.name && t.cargo === item.cargo
            ))
        );
        return result;
    };

    // Função para abrir modal de edição de cargo
    const handleOpenEditTeam = (team, cargoAtual) => {
        setEditTeamModal({ open: true, team, cargo: cargoAtual });
    };

    // Função para fechar modal
    const handleCloseEditTeam = () => {
        setEditTeamModal({ open: false, team: null, cargo: '' });
    };

    // Função para salvar alteração de cargo de fato
    const handleSaveEditTeam = async (e) => {
        e.preventDefault();
        // Buscar equipe pelo nome
        const equipe = teams.find(t => t.nameTeams === editTeamModal.team.name);
        if (!equipe) return;
        // Atualizar cargo do usuário na equipe (corrigido para alterar apenas o vínculo/cargo antigo)
        const novosMembros = (equipe.members || []).map(m =>
            m.nickname === userSelect.nickname && m.office === editTeamModal.cargo
                ? { ...m, office: editTeamModal.cargo }
                : m
        );
        // Montar payload
        const data = {
            teamsId: equipe._id,
            nameTeams: equipe.nameTeams,
            leader: equipe.leader,
            viceLeader: equipe.viceLeader,
            members: novosMembros,
            emblema: equipe.emblema,
            idUser: JSON.parse(localStorage.getItem("@Auth:Profile"))._id,
        };
        await updateTeam(data);
        await getTeams();
        await infoTeams(equipe.nameTeams); // Forçar refresh do array usado em /team/[nome da equipe]
        await new Promise(resolve => setTimeout(resolve, 500));
        setUserTeamsState(getUserTeamsAndOffices());
        handleCloseEditTeam();
        // Notificação automática e reload após 3 segundos
        setShowEditNotification(true);
        setTimeout(() => setShowEditNotification(false), 2200);
        setTimeout(() => window.location.reload(), 1000);
    };

    // Função para excluir membro da equipe de fato
    const handleDeleteMember = async () => {
        // Buscar equipe pelo nome
        const equipe = teams.find(t => t.nameTeams === confirmDeleteModal.team.name);
        if (!equipe) return;
        const data = {
            idUser: JSON.parse(localStorage.getItem("@Auth:Profile"))._id,
            nickMember: userSelect.nickname,
            idTeams: equipe._id,
            nameTeams: equipe.nameTeams,
        };
        await removeMember(data);
        await getTeams();
        setUserTeamsState(prev => prev.filter(t => t.name !== confirmDeleteModal.team.name));
        setConfirmDeleteModal({ open: false, team: null });
        setEditTeamModal({ open: false, team: null, cargo: '' });
    };

    // Função para obter cargos possíveis da equipe
    const getCargosEquipe = (team) => {
        if (!team) return [];
        const cargos = ['Líder', 'Vice-Líder', 'Ministro', 'Capacitador', 'Membro'];
        if (team.name === 'Ensino' || team.nameTeams === 'Ensino') {
            cargos.push('Docente');
        }
        return cargos;
    };

    // Função para abrir confirmação de exclusão
    const handleOpenConfirmDelete = (team) => {
        setConfirmDeleteModal({ open: true, team });
    };

    // Função para fechar confirmação de exclusão
    const handleCloseConfirmDelete = () => {
        setConfirmDeleteModal({ open: false, team: null });
    };

    // Funções para manipular honrarias
    const handleAddHonraria = () => {
        setHonrarias([...honrarias, { nome: '', imagem: '' }]);
    };
    const handleRemoveHonraria = (index) => {
        setHonrarias(honrarias.filter((_, i) => i !== index));
    };
    const handleChangeHonraria = (index, field, value) => {
        setHonrarias(honrarias.map((h, i) => i === index ? { ...h, [field]: value } : h));
    };
    const handleSaveHonrarias = (e) => {
        e.preventDefault();
        // Validação: todas as honrarias devem ter nome e imagem
        if (honrarias.some(h => !h.nome.trim() || !h.imagem.trim())) {
            setHonrariasError("Preencha o nome e a imagem de todas as honrarias antes de salvar.");
            return;
        }
        setHonrariasError("");
        setShowHonrariasModal(false);
    };

    // Função para buscar logs de IP do usuário
    const fetchIpLogs = async () => {
        setLoadingIp(true);
        try {
            const response = await axiosInstance.get(`loggers?nickname=${userSelect.nickname}&limit=100`);
            if (response.data && Array.isArray(response.data.logs)) {
                setIpLogs(response.data.logs);
            } else {
                setIpLogs([]);
            }
        } catch (err) {
            setIpLogs([]);
        }
        setLoadingIp(false);
    };

    useEffect(() => {
        if (showIPModal && userSelect && userSelect.nickname) {
            getLogs(1, 100, userSelect.nickname);
        }
        // eslint-disable-next-line
    }, [showIPModal, userSelect]);

    // Buscar honrarias do sistema ao abrir o modal
    useEffect(() => {
        if (showHonrariasModal) {
            axiosInstance.get('honrarias')
                .then(res => setSystemHonrarias(res.data))
                .catch(() => setSystemHonrarias([]));
        }
    }, [showHonrariasModal]);

    // Adicionar honraria ao usuário
    const handleAddHonrariaUser = (honraria) => {
        if (!honrarias.some(h => h.nome === honraria.nome && h.imagem === honraria.imagem)) {
            setHonrarias([...honrarias, honraria]);
        }
    };
    // Remover honraria do usuário
    const handleRemoveHonrariaUser = (idx) => {
        setHonrarias(honrarias.filter((_, i) => i !== idx));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="relative bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl mx-auto">
                <button
                    onClick={() => setPage('inicial')}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl font-bold"
                    title="Fechar"
                >
                    ×
                </button>
            <h1 className="text-3xl font-bold mb-4">Editar Perfil</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Nickname:</label>
                    <input 
                        type="text" 
                        value={nickname} 
                        onChange={(e) => setNickname(e.target.value)} 
                        className="border border-gray-300 rounded-md px-3 py-2 mt-1 w-full" 
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Patente:</label>
                    <select 
                        value={patent} 
                        onChange={(e) => setPatent(e.target.value)} 
                        className="border border-gray-300 rounded-md px-3 py-2 mt-1 w-full"
                    >
                        <option value={userSelect.patent}>{userSelect.patent}</option>
                        {infoSystem && infoSystem[0] && 
                            (body ? 
                                infoSystem[0].patents.map((patent) => (
                                    <option key={patent} value={patent}>{patent}</option>
                                )) :
                                infoSystem[0].paidPositions.map((patent) => (
                                    <option key={patent} value={patent}>{patent}</option>
                                ))
                            )
                        }
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Status:</label>
                    <select 
                        value={status} 
                        onChange={(e) => setStatus(e.target.value)} 
                        className="border border-gray-300 rounded-md px-3 py-2 mt-1 w-full"
                    >
                        <option value="Ativo">Ativo</option>
                        <option value="Desativado">Desativado</option>
                        <option value="Exonerado">Exonerado</option>
                        <option value="Reformado">Reformado</option>
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">TAG:</label>
                    <input
                        type="text"
                        value={tag}
                        onChange={(e) => {
                            if (e.target.value.length <= 3) {
                                setTag(e.target.value);
                            }
                        }}
                        className="border border-gray-300 rounded-md px-3 py-2 mt-1 w-full"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Advertências:</label>
                    <input
                        type="number"
                        max={5}
                        min={0}
                        value={warnings}
                        onChange={(e) => {
                            const value = parseInt(e.target.value, 10);
                            if (value >= 0 && value <= 5) {
                                setWarnings(value);
                            }
                        }}
                        className="border border-gray-300 rounded-md px-3 py-2 mt-1 w-full"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Permissão:</label>
                    <select 
                        value={userType} 
                        onChange={(e) => setUserType(e.target.value)} 
                        className="border border-gray-300 rounded-md px-3 py-2 mt-1 w-full"
                    >
                        <option value="User">User</option>
                        <option value="Recursos Humanos">Centro de Recursos Humanos</option>
                        <option value="Diretor">Setor de Inteligência</option>
                        <option value="Admin">Admin</option>
                    </select>
                </div>
                    <div className="flex flex-row gap-2 mt-6">
                <button 
                    type="submit" 
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
                >
                    <FaSave /> Salvar Alterações
                </button>
                <button
                    type="button"
                    onClick={() => setShowTeamsModal(true)}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
                >
                    <FaUsers /> Funções
                </button>
                <button 
                    type="button" 
                    onClick={() => setShowHonrariasModal && setShowHonrariasModal(true)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
                        >
                    <FaStar /> Honrarias
                        </button>
                        <button
                            type="button"
                    onClick={() => setShowIPModal(true)}
                    className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
                        >
                    <FaKey /> IP
                        </button>
                    </div>
                </form>
                {showEditNotification && (
                    <Notification message="Usuário atualizado com sucesso." onClose={() => setShowEditNotification(false)} type="success" />
                )}
                {/* Modal de Equipes */}
                {showTeamsModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                        <div className="relative bg-white rounded-lg shadow-lg p-8 w-full max-w-[1450px] mx-auto" style={{ maxHeight: '80vh', minWidth: 1200, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                            <button
                                onClick={() => setShowTeamsModal(false)}
                                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl font-bold"
                                title="Fechar"
                            >
                                ×
                            </button>
                            <h2 className="text-2xl font-bold mb-6 text-center">Funções do Usuário</h2>
                            <div style={{ flex: 1, overflowY: 'auto', maxHeight: '60vh' }}>
                                <table className="w-full bg-white border border-gray-200 rounded shadow-lg">
                                    <thead className="bg-gray-100 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-4 py-3 border-b text-left whitespace-nowrap w-12">#</th>
                                            <th className="px-4 py-3 border-b text-left whitespace-nowrap w-[350px]">Função</th>
                                            <th className="px-4 py-3 border-b text-left whitespace-nowrap w-48">Nome</th>
                                            <th className="px-4 py-3 border-b text-left whitespace-nowrap w-48">Função Principal</th>
                                            <th className="px-4 py-3 border-b text-left whitespace-nowrap w-32">Data</th>
                                            <th className="px-4 py-3 border-b text-left whitespace-nowrap w-[320px]">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {userTeamsState.length > 0 ? (
                                            userTeamsState.map((team, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50 transition-all">
                                                    <td className="px-4 py-3 border-b font-semibold text-gray-700 whitespace-nowrap text-center">{idx + 1}</td>
                                                    <td className="px-4 py-3 border-b whitespace-nowrap">
                                                        <div className="flex items-center gap-4 min-w-[300px]">
                                                            {team.emblema ? (
                                                                <img src={team.emblema} alt={team.name} className="w-12 h-12 rounded object-contain bg-white border" />
                                                            ) : (
                                                                <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center text-gray-400 font-bold">?</div>
                                                            )}
                                                            <span className="font-bold text-[#031149] text-lg" style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', maxWidth: 250}}>{team.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 border-b font-medium text-gray-800 whitespace-nowrap text-center">{nickname}</td>
                                                    <td className="px-4 py-3 border-b text-gray-700 whitespace-nowrap text-center">{team.cargo}</td>
                                                    <td className="px-4 py-3 border-b text-gray-500 whitespace-nowrap text-center">Indisponível</td>
                                                    <td className="px-4 py-3 border-b whitespace-nowrap">
                                                        <div className="flex items-center gap-4 min-w-[320px] justify-center">
                                                            <button
                                                                className="bg-green-500 hover:bg-green-600 text-white font-bold py-1.5 px-4 rounded flex items-center shadow-sm transition-all"
                                                                onClick={() => handleOpenEditTeam(team, team.cargo)}
                                                            >
                                                                <FaEdit className="mr-2" size={16} />Editar
                                                            </button>
                                                            <button
                                                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-4 rounded flex items-center shadow-sm transition-all"
                                                                onClick={() => window.open(`/team/${team.name}`, '_blank')}
                                                            >
                                                                <FaCogs className="mr-2" size={16} />Gerenciar na Página da Função
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="text-center py-6 text-gray-500">O usuário não faz parte de nenhuma equipe.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
                {/* Modal de edição de cargo na equipe */}
                {editTeamModal.open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                        <div className="relative bg-white rounded-lg shadow-lg p-8 w-full max-w-md mx-auto">
                            <button
                                onClick={handleCloseEditTeam}
                                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl font-bold"
                                title="Fechar"
                            >
                                ×
                            </button>
                            <h2 className="text-2xl font-bold mb-6 text-center">Editar Cargo na Equipe</h2>
                            <form onSubmit={handleSaveEditTeam}>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Equipe:</label>
                                    <input
                                        type="text"
                                        value={editTeamModal.team?.name || ''}
                                        disabled
                                        className="border border-gray-300 rounded-md px-3 py-2 w-full bg-gray-100 font-bold text-[#031149]"
                                    />
                                </div>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Função:</label>
                                    <select
                                        value={editTeamModal.cargo}
                                        onChange={e => setEditTeamModal(modal => ({ ...modal, cargo: e.target.value }))}
                                        className="border border-gray-300 rounded-md px-3 py-2 w-full"
                                        required
                                    >
                                        {getCargosEquipe(editTeamModal.team).map(cargo => (
                                            <option key={cargo} value={cargo}>{cargo}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex flex-row gap-4 mt-2">
                                    <button
                                        type="submit"
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
                                    >
                                        Salvar Alterações
                </button>
                <button 
                    type="button" 
                                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-full"
                                        onClick={() => handleOpenConfirmDelete(editTeamModal.team)}
                >
                                        Excluir
                </button>
                                </div>
            </form>
                        </div>
                    </div>
                )}
                {/* Modal de confirmação de exclusão */}
                {confirmDeleteModal.open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                        <div className="relative bg-white rounded-lg shadow-lg p-8 w-full max-w-sm mx-auto flex flex-col items-center">
                            <h2 className="text-xl font-bold mb-4 text-center">Confirmar Exclusão</h2>
                            <p className="mb-6 text-center">Tem certeza que deseja remover este usuário da equipe <span className="font-bold text-[#031149]">{confirmDeleteModal.team?.name}</span>?</p>
                            <div className="flex flex-row gap-4 w-full justify-center">
                                <button
                                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-full"
                                    onClick={handleDeleteMember}
                                >
                                    Sim
                                </button>
                                <button
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded w-full"
                                    onClick={handleCloseConfirmDelete}
                                >
                                    Não
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* Modal de Honrarias (estrutura inicial, sem conteúdo ainda) */}
                {showHonrariasModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                        <div className="relative bg-white rounded-lg shadow-lg p-8 w-full max-w-[900px] mx-auto">
                            <button
                                onClick={() => setShowHonrariasModal(false)}
                                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl font-bold"
                                title="Fechar"
                            >
                                ×
                            </button>
                            <h2 className="text-2xl font-bold mb-6 text-center">Honrarias do Usuário</h2>
                            {honrariasError && (
                                <div className="mb-4 text-red-600 text-center font-semibold">{honrariasError}</div>
                            )}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Adicionar Honraria</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {systemHonrarias.length === 0 ? (
                                        <span className="text-gray-500 col-span-4">Nenhuma honraria cadastrada no sistema.</span>
                                    ) : (
                                        systemHonrarias.map((h, idx) => (
                                            <button key={idx} type="button" onClick={() => handleAddHonrariaUser(h)} className="flex flex-col items-center bg-gray-50 hover:bg-yellow-100 border border-gray-200 rounded-lg p-3 transition">
                                                <img src={h.imagem} alt={h.nome} title={h.nome} className="w-14 h-14 object-contain mb-1" />
                                                <span className="text-sm text-gray-800 text-center">{h.nome}</span>
                                                <span className="text-xs text-yellow-700 mt-1">Adicionar</span>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                            <form onSubmit={handleSaveHonrarias}>
                                <div style={{ maxHeight: 300, overflowY: 'auto' }} className="flex flex-col gap-4 mb-6">
                                    {honrarias.length === 0 ? (
                                        <span className="text-gray-500">Nenhuma honraria atribuída ao usuário.</span>
                                    ) : (
                                        honrarias.map((honraria, idx) => (
                                            <div key={idx} className="flex flex-row gap-4 items-center">
                                                <img src={honraria.imagem} alt={honraria.nome} className="w-12 h-12 object-contain rounded border" />
                                                <span className="flex-1 text-gray-800">{honraria.nome}</span>
                                                <button type="button" onClick={() => handleRemoveHonrariaUser(idx)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-3 rounded" title="Remover">x</button>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="flex flex-row justify-end">
                                    <button
                                        type="submit"
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
                                    >
                                        Salvar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                {showIPModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                        <div className="relative bg-white rounded-lg shadow-lg p-8 w-full max-w-[600px] mx-auto">
                            <button
                                onClick={() => setShowIPModal(false)}
                                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl font-bold"
                                title="Fechar"
                            >
                                ×
                            </button>
                            <h2 className="text-2xl font-bold mb-6 text-center">IPs de Login do Usuário</h2>
                            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                                <table className="w-full text-left border border-gray-200 rounded shadow">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-2 border-b">IP</th>
                                            <th className="px-4 py-2 border-b">Data</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr><td colSpan={2} className="text-center py-6">Carregando...</td></tr>
                                        ) : loggers && loggers.length > 0 ? (
                                            loggers.filter(log => log.user === userSelect.nickname && log.ip).map((log, idx) => (
                                                <tr key={idx}>
                                                    <td className="px-4 py-2 border-b">{log.ip}</td>
                                                    <td className="px-4 py-2 border-b">{new Date(log.createdAt).toLocaleString('pt-BR')}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan={2} className="text-center py-6 text-gray-500">Nenhum IP encontrado.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DpanelEdit;
