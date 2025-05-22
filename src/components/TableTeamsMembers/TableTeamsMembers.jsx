import React, { useContext, useEffect, useState } from 'react';
import style from './TableTeamsMembers.module.css';
import { TeamsContext } from '../../context/TeamsContext';
import Confirmation from '../Confirmation/Confirmation';
import { useNavigate } from 'react-router-dom';

const TableTeamsMembers = ({ team, userOk }) => {
    const { infoTeamsArray, infoTeams, updateTeam, teams } = useContext(TeamsContext);
    const [isRemove, setIsRemove] = useState(false);
    const [dataUser, setDataUser] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [editCargo, setEditCargo] = useState("");
    const navigate = useNavigate();

    const cargosDisponiveis = [
        "Membro",
        "Ministro",
        "Capacitador",
        ...(team.nameTeams === "Ensino" ? ["Docente"] : [])
    ];

    const handleRemove = (data) => {
        setDataUser(data);
        setIsRemove(true);
    };

    const handleEdit = (user) => {
        setEditUser(user);
        setEditCargo(user.user.office);
        setIsEdit(true);
    };

    const handleSaveEdit = async () => {
        // Buscar equipe pelo nome
        const equipe = teams.find(t => t.nameTeams === team.nameTeams);
        if (!equipe) return;
        // Atualizar cargo do usuário na equipe
        const novosMembros = (equipe.members || []).map(m =>
            m.nickname === editUser.user.nickname ? { ...m, office: editCargo } : m
        );
        // Montar payload
        const data = {
            teamsId: equipe._id,
            nameTeams: equipe.nameTeams,
            leader: equipe.leader,
            viceLeader: equipe.viceLeader,
            members: novosMembros,
            emblema: equipe.emblema,
            idUser: JSON.parse(localStorage.getItem("@Auth:ProfileUser"))._id,
        };
        await updateTeam(data);
        setIsEdit(false);
        // Notificação de sucesso
        window.dispatchEvent(new CustomEvent('showNotification', { detail: { message: 'Usuário atualizado com sucesso!' } }));
        setTimeout(() => window.location.reload(), 1000);
    };

    useEffect(() => {
        const fetchTeamInfo = async () => {
            const token = localStorage.getItem("@Auth:Token");
            if (token) {
                await infoTeams(token, team.nameTeams);
            }
        };

        fetchTeamInfo();
    }, [team.nameTeams]);
    return (
        <>
            {!isRemove && !isEdit && (
                <div className={style.ListTeamsMembers}>
                    <div>
                        <h2>
                            <span>Nickname</span> <span>Cargo</span> <span>Total de aulas</span> <span>Ação</span>
                        </h2>
                    </div>
                    <ul>
                        {infoTeamsArray && infoTeamsArray.map((user) => (
                            <li key={user.user.nickname}>
                                <span>{user.user.nickname}</span>
                                <span>{user.user.office}</span>
                                <span>{user.requirements.length}</span>
                                <span>
                                    <button onClick={() => handleEdit(user)} className={style.buttonEdit}>Editar</button>
                                    <button onClick={() => handleRemove(user)} className={style.buttonExcluir}>Excluir</button>
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {isRemove && (
                <Confirmation
                    team={team}
                    userOk={userOk}
                    dataUser={dataUser}
                    setIsRemove={setIsRemove}
                />
            )}

            {isEdit && editUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div style={{
                        background: '#fff',
                        borderRadius: 16,
                        boxShadow: '0 4px 24px rgba(0,0,0,0.13)',
                        padding: '40px 48px 36px 48px',
                        minWidth: 480,
                        maxWidth: 540,
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 32,
                        position: 'relative',
                    }}>
                        {/* Emblema da equipe */}
                        <div style={{ minWidth: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <img src={team.emblema} alt={team.nameTeams} style={{ width: 90, height: 90, borderRadius: 12, objectFit: 'contain', background: '#f4f4f4', border: '1.5px solid #e5e7eb', marginBottom: 12 }} />
                            <span style={{ fontWeight: 700, color: '#031149', fontSize: 16, textAlign: 'center' }}>{team.nameTeams}</span>
                        </div>
                        {/* Formulário de edição */}
                        <div style={{ flex: 1, minWidth: 220 }}>
                            <button
                                onClick={() => setIsEdit(false)}
                                style={{ position: 'absolute', top: 18, right: 22, color: '#6b7280', background: 'none', border: 'none', fontSize: 26, fontWeight: 700, cursor: 'pointer' }}
                                title="Fechar"
                            >
                                ×
                            </button>
                            <h2 style={{ fontWeight: 700, fontSize: 26, marginBottom: 24, color: '#23272e', textAlign: 'left', lineHeight: 1.2 }}>Editar<br />Cargo do Membro</h2>
                            <form onSubmit={e => { e.preventDefault(); handleSaveEdit(); }}>
                                <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <label style={{ fontWeight: 500, fontSize: 16, minWidth: 90, color: '#23272e' }}>Nickname:</label>
                                    <input
                                        type="text"
                                        value={editUser.user.nickname}
                                        disabled
                                        style={{ border: '1.5px solid #e5e7eb', borderRadius: 7, padding: '8px 14px', width: '100%', background: '#f5f6fa', fontWeight: 700, color: '#031149', fontSize: 16 }}
                                    />
                                </div>
                                <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <label style={{ fontWeight: 500, fontSize: 16, minWidth: 90, color: '#23272e' }}>Cargo:</label>
                                    <select
                                        value={editCargo}
                                        onChange={e => setEditCargo(e.target.value)}
                                        style={{ border: '1.5px solid #e5e7eb', borderRadius: 7, padding: '8px 14px', width: '100%', fontSize: 16, background: '#fff' }}
                                        required
                                    >
                                        {cargosDisponiveis.map(cargo => (
                                            <option key={cargo} value={cargo}>{cargo}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'row', gap: 18, marginTop: 8 }}>
                                    <button
                                        type="submit"
                                        style={{ background: '#368eec', color: '#fff', fontWeight: 700, border: 'none', borderRadius: 7, padding: '10px 36px', fontSize: 17, cursor: 'pointer', transition: 'background 0.2s' }}
                                    >
                                        Salvar
                                    </button>
                                    <button
                                        type="button"
                                        style={{ background: '#e5e7eb', color: '#23272e', fontWeight: 700, border: 'none', borderRadius: 7, padding: '10px 36px', fontSize: 17, cursor: 'pointer', transition: 'background 0.2s' }}
                                        onClick={() => setIsEdit(false)}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default TableTeamsMembers;
