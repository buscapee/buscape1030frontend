import { FaUser, FaBook, FaExclamationTriangle, FaHandshake, FaDollarSign, FaHistory, FaSearch, FaCheckCircle, FaTimesCircle, FaClock, FaGlobe } from "react-icons/fa";
import { FaRegCopy } from "react-icons/fa6";
import { Link, useNavigate } from 'react-router-dom';
import style from "./profile.module.css";
import { CiSearch } from "react-icons/ci";
import { useContext, useEffect, useState, useRef } from 'react';
import { RequirementsContext } from "../../context/Requirements";
import { AuthContext } from "../../context/AuthContext";
import axiosInstance from '../../provider/axiosInstance';

import Preloader from "../../assets/preloader.gif";
import Functions from "../../components/Funcions/Functions";
import { TeamsContext } from "../../context/TeamsContext";
import Notification from '../../components/Notification/Notification';
import { DocsContext } from '../../context/DocsContext';
import { SystemContext } from '../../context/SystemContext';

const Profile = ({ profile }) => {
    const [newProfile, setNewProfile] = useState(null); // Inicializando com null
    const { loading } = useContext(AuthContext);
    const { getTeams, teams } = useContext(TeamsContext);
    const { searchRequerimentsUser, requerimentsArray, formatarDataHora } = useContext(RequirementsContext);
    const [busca, setBusca] = useState('');
    const navigate = useNavigate();
    const [showOnlyAulas, setShowOnlyAulas] = useState(false);
    const [showEquipes, setShowEquipes] = useState(false);
    const [showGratificacoes, setShowGratificacoes] = useState(false);
    const [showDiplomas, setShowDiplomas] = useState(false);
    const [showTurnos, setShowTurnos] = useState(false);
    const [copied, setCopied] = useState(false);
    const [emblemas, setEmblemas] = useState([]);
    const [habboOnline, setHabboOnline] = useState(null);
    const [banner, setBanner] = useState(null);
    const [isOwnProfile, setIsOwnProfile] = useState(false);
    const { Documents, getDocuments } = useContext(DocsContext);
    const [turnos, setTurnos] = useState([]);
    const [loadingTurnos, setLoadingTurnos] = useState(false);
    const [paginaTurnos, setPaginaTurnos] = useState(1);
    const [isPaidPosition, setIsPaidPosition] = useState(false);
    const { infoSystem } = useContext(SystemContext);

    // Atualiza newProfile quando profile é alterado
    useEffect(() => {
        if (profile && profile.users) {
            document.title = `Polícia DME - Perfil`;
            const token = localStorage.getItem('@Auth:Token')
            const userProfile = profile.users[0];
            setNewProfile(userProfile);
            searchRequerimentsUser(userProfile.nickname, token); 
            getTeams();
            // Buscar apenas os emblemas exibidos do usuário do perfil
            axiosInstance.get(`/emblemas-exibidos/${userProfile.nickname}`)
                .then(res => setEmblemas(res.data))
                .catch(() => setEmblemas([]));
            // Buscar status online do Habbo
            fetch(`https://www.habbo.com.br/api/public/users?name=${userProfile.nickname}`)
                .then(res => res.json())
                .then(data => setHabboOnline(data.online))
                .catch(() => setHabboOnline(null));
            // Verificar se é o próprio perfil logado
            const localProfile = JSON.parse(localStorage.getItem('@Auth:Profile'));
            setIsOwnProfile(localProfile && localProfile.nickname === userProfile.nickname);
            // Buscar banner exibido do usuário
            if (localProfile && localProfile.nickname === userProfile.nickname) {
              axiosInstance.get('/me/banners-exibidos')
                .then(res => setBanner(res.data && res.data.length > 0 ? res.data[0] : null))
                .catch(() => setBanner(null));
            } else {
              axiosInstance.get(`/banners-exibidos/${userProfile.nickname}`)
                .then(res => setBanner(res.data && res.data.length > 0 ? res.data[0] : null))
                .catch(() => setBanner(null));
            }
            // Verificar se o usuário tem cargo do tipo paidPositions
            if (infoSystem && infoSystem[0] && Array.isArray(infoSystem[0].paidPositions)) {
                setIsPaidPosition(infoSystem[0].paidPositions.includes(userProfile.patent));
            } else {
                setIsPaidPosition(false);
            }
        }
    }, [profile, searchRequerimentsUser, infoSystem]);

    // Monitorar mudanças em requerimentsArray para atualizar o estado local
    useEffect(() => {
        requerimentsArray
    }, []);

    useEffect(() => {
        getDocuments(1, 100); // Buscar até 100 documentos para diplomas
    }, []);

    // Buscar turnos do usuário ao ativar a aba Turnos
    useEffect(() => {
        if (showTurnos && newProfile && newProfile.nickname) {
            setLoadingTurnos(true);
            axiosInstance.get(`/servicepoints/usuario/${newProfile.nickname}`)
                .then(res => setTurnos(res.data))
                .catch(() => setTurnos([]))
                .finally(() => setLoadingTurnos(false));
        }
        // eslint-disable-next-line
    }, [showTurnos, newProfile]);

    const handleSubmit = (e) => {
        e.preventDefault();
        searchRequerimentsUser(busca);
        navigate(`/search/${busca}`);
    }

    if (loading) {
        return (
            <div className='relative flex items-center justify-center h-[100vh] w-[100vw]'>
                <img src={Preloader} alt="Loading..." />
            </div>
        );
    }

    // Aceita tanto profile.users quanto um array simples
    const usersArray = profile?.users || (Array.isArray(profile) ? profile : []);
    const safeProfile = usersArray[0] || {};
    // Equipes do usuário
    const userTeams = (teams || []).filter(team => (safeProfile.teans || []).includes(team.nameTeams));
    // Cargo do usuário em cada equipe
    const getUserOffice = (team) => {
        if (!team.members) return '';
        const member = team.members.find(m => m.nickname === safeProfile.nickname);
        return member ? member.office : '';
    };

    if (!usersArray.length) {
        return <div className="text-center py-8 text-red-500 font-semibold">Usuário não encontrado ou dados inválidos.</div>;
    }

    function formatarDataHoraTurno(data) {
        if (!data) return '';
        const d = new Date(data);
        const dia = String(d.getDate()).padStart(2, '0');
        const mes = String(d.getMonth() + 1).padStart(2, '0');
        const ano = d.getFullYear();
        const hora = String(d.getHours()).padStart(2, '0');
        const minuto = String(d.getMinutes()).padStart(2, '0');
        return `${dia}/${mes}/${ano} às ${hora}:${minuto}`;
    }
    function calcularTempoTotalTurno(inicio, fim) {
        if (!inicio) return '-';
        if (!fim) return (
            <span style={{ fontWeight: 600, color: '#23272e', fontSize: 15, marginBottom: 1 }}>
                Total: <span style={{ fontWeight: 400 }}>Em Andamento</span>
            </span>
        );
        const diff = new Date(fim) - new Date(inicio);
        const segundos = Math.floor(diff / 1000);
        if (segundos < 60) return (
            <span style={{ fontWeight: 600, color: '#23272e', fontSize: 15, marginBottom: 1 }}>
                Total: <span style={{ fontWeight: 400 }}>{segundos} segundos</span>
            </span>
        );
        const minutos = Math.floor(segundos / 60);
        if (minutos < 60) return (
            <span style={{ fontWeight: 600, color: '#23272e', fontSize: 15, marginBottom: 1 }}>
                Total: <span style={{ fontWeight: 400 }}>{minutos} minutos</span>
            </span>
        );
        const horas = Math.floor(minutos / 60);
        const min = minutos % 60;
        if (horas === 1 && min === 0) return (
            <span style={{ fontWeight: 600, color: '#23272e', fontSize: 15, marginBottom: 1 }}>
                Total: <span style={{ fontWeight: 400 }}>1 hora</span>
            </span>
        );
        if (horas === 1) return (
            <span style={{ fontWeight: 600, color: '#23272e', fontSize: 15, marginBottom: 1 }}>
                Total: <span style={{ fontWeight: 400 }}>1 hora e {min} min</span>
            </span>
        );
        if (min === 0) return (
            <span style={{ fontWeight: 600, color: '#23272e', fontSize: 15, marginBottom: 1 }}>
                Total: <span style={{ fontWeight: 400 }}>{horas} horas</span>
            </span>
        );
        return (
            <span style={{ fontWeight: 600, color: '#23272e', fontSize: 15, marginBottom: 1 }}>
                Total: <span style={{ fontWeight: 400 }}>{horas} horas e {min} min</span>
            </span>
        );
    }

    return (
        <div className={style.profile}>
            <div className={style.profileBody} style={{flexDirection: 'row', alignItems: 'flex-start', gap: '32px', justifyContent: 'flex-start', width: '100%', maxWidth: 1400, margin: '0 auto'}}>
                <aside className={style.profileCardModern}>
                    <div className={style.profileCardHeader}
                         style={isOwnProfile && banner && banner.image ? {
                           backgroundImage: `url(${banner.image})`,
                           backgroundSize: 'cover',
                           backgroundPosition: 'center',
                           position: 'relative',
                           zIndex: 1
                         } : !isOwnProfile && banner && banner.image ? {
                           backgroundImage: `url(${banner.image})`,
                           backgroundSize: 'cover',
                           backgroundPosition: 'center',
                           position: 'relative',
                           zIndex: 1
                         } : {}}>
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 0, marginBottom: 0, position: 'relative', zIndex: 2 }}>
                          <div className={style.profileAvatarWrapper}>
                              <img
                                  src={`https://www.habbo.com.br/habbo-imaging/avatarimage?img_format=png&user=${safeProfile.nickname || ''}&direction=3&head_direction=3&size=l&gesture=sml&action=std`}
                                  alt="Avatar"
                                  className={style.profileAvatar}
                              />
                          </div>
                        </div>
                    </div>
                    {/* Nome e patente bem separados do header/banner, acima da TAG */}
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 12, marginBottom: 4, background: '#fff', borderRadius: 8, boxShadow: '0 1px 6px #ececec', padding: '8px 0' }}>
                      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#222', margin: 0 }}>{safeProfile.nickname || 'Não informado'}</h2>
                      <span className={style.profilePatent} style={{ margin: 0 }}>{safeProfile.patent || 'Não informado'}</span>
                    </div>
                    <div className={style.profileCardBody}>
                        <div className={style.profileInfoRow}><FaUser className={style.profileInfoIcon} /><span><b>TAG:</b> [{safeProfile.tag || 'Não informado'}]</span></div>
                        {/* Status com badge colorido */}
                        <div className={style.profileInfoRow}>
                          <FaClock className={style.profileInfoIcon} />
                          <span><b>Status:</b></span>
                          {(safeProfile.patent === 'Exonerado' || safeProfile.status === 'Exonerado') ? (
                            <span style={{ marginLeft: 8, background: '#e53935', color: '#fff', borderRadius: 6, padding: '2px 12px', fontWeight: 700, fontSize: 13 }}>Exonerado</span>
                          ) : safeProfile.status === 'Ativo' ? (
                            <span style={{ marginLeft: 8, background: '#22c55e', color: '#fff', borderRadius: 6, padding: '2px 12px', fontWeight: 700, fontSize: 13 }}>Ativo</span>
                          ) : safeProfile.status === 'Pendente' ? (
                            <span style={{ marginLeft: 8, background: '#facc15', color: '#222', borderRadius: 6, padding: '2px 12px', fontWeight: 700, fontSize: 13 }}>Pendente</span>
                          ) : (
                            <span style={{ marginLeft: 8, background: '#e53935', color: '#fff', borderRadius: 6, padding: '2px 12px', fontWeight: 700, fontSize: 13 }}>{safeProfile.status || 'Não informado'}</span>
                          )}
                        </div>
                        {/* Status Habbo Online/Offline com ícone e label negrito */}
                        <div className={style.profileInfoRow}>
                          <FaGlobe className={style.profileInfoIcon} />
                          <span style={{ fontWeight: 700, marginRight: 4 }}>No Habbo:</span>
                          {habboOnline === null ? (
                            <span style={{ marginLeft: 8, color: '#888', fontSize: 13 }}>...</span>
                          ) : habboOnline ? (
                            <span style={{ marginLeft: 8, background: '#22c55e', color: '#fff', borderRadius: 6, padding: '2px 12px', fontWeight: 700, fontSize: 13 }}>Online</span>
                          ) : (
                            <span style={{ marginLeft: 8, background: '#e53935', color: '#fff', borderRadius: 6, padding: '2px 12px', fontWeight: 700, fontSize: 13 }}>Offline</span>
                          )}
                        </div>
                        <div className={style.profileInfoRow}>
                          <FaBook className={style.profileInfoIcon} />
                          <span><b>Cadastro:</b> {safeProfile.code ?? `[DME] - ${safeProfile.patent || 'Não informado'}`}</span>
                          <button
                            style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: 8, padding: 0, display: 'flex', alignItems: 'center' }}
                            title="Copiar cadastro"
                            onClick={() => {
                              const cadastro = safeProfile.code ?? `[DME] - ${safeProfile.patent || 'Não informado'}`;
                              navigator.clipboard.writeText(cadastro);
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            }}
                          >
                            <FaRegCopy size={18} color="#222" />
                          </button>
                        </div>
                        <div className={style.profileInfoRow}><FaExclamationTriangle className={style.profileInfoIcon} /><span><b>Advertências:</b> {safeProfile.warnings ?? '0'}</span></div>
                        <div className={style.profileInfoRow}><FaHandshake className={style.profileInfoIcon} /><span><b>Dragonas:</b> {safeProfile.medals ?? '0'}</span></div>
                        <div className={style.profileInfoRow}><FaHistory className={style.profileInfoIcon} /><span><b>Admissão:</b> {safeProfile.createdAt ? formatarDataHora(safeProfile.createdAt) : 'Não informado'}</span></div>
                    </div>
                    <div className={style.profileCardEmblems}>
                        <span className={style.profileEmblemsTitle}>Emblemas</span>
                        <div className={style.profileEmblemsList}>
                            {emblemas.length === 0 ? (
                                <span style={{color: '#888', fontSize: 15}}>[Sem emblemas]</span>
                            ) : (
                                emblemas.map(emblema => (
                                    <img
                                        key={emblema._id}
                                        src={emblema.image}
                                        alt={emblema.name}
                                        title={emblema.name}
                                        className={style.profileEmblem}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                    {/* Honrarias */}
                    <div className={style.profileCardEmblems}>
                        <span className={style.profileEmblemsTitle}>Honrarias</span>
                        <div className={style.profileEmblemsList}>
                            {Array.isArray(safeProfile.honrarias) && safeProfile.honrarias.filter(h => h.nome && h.imagem).length > 0 ? (
                                safeProfile.honrarias.filter(h => h.nome && h.imagem).map((honraria, idx) => (
                                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 60 }}>
                                        <img
                                            src={honraria.imagem}
                                            alt={honraria.nome}
                                            title={honraria.nome}
                                            className={style.profileEmblem}
                                            style={{ marginBottom: 2 }}
                                        />
                                    </div>
                                ))
                            ) : (
                                <span style={{color: '#888', fontSize: 15}}>[Sem honrarias]</span>
                            )}
                        </div>
                    </div>
                </aside>
                <main className={style.timelineMain}>
                    <div className={style.timelineHeaderBox}>
                        <div className={style.timelineHeader}>
                            <h3 className={style.timelineHeaderTitle}><span className="mr-2"><FaHistory /></span>Histórico Policial</h3>
                            <div className={style.timelineHeaderTabs}>
                                <button
                                    className={showDiplomas ? style.activeButton : style.aulasButton}
                                    onClick={() => { setShowDiplomas(true); setShowOnlyAulas(false); setShowEquipes(false); setShowGratificacoes(false); setShowTurnos(false); }}
                                >Aulas e Diplomas</button>
                                <button
                                    className={showEquipes ? style.activeButton : style.aulasButton}
                                    onClick={() => { setShowEquipes(true); setShowOnlyAulas(false); setShowGratificacoes(false); setShowDiplomas(false); setShowTurnos(false); }}
                                >Funções</button>
                                <button
                                    className={!showOnlyAulas && !showEquipes && !showGratificacoes && !showDiplomas && !showTurnos ? style.activeButton : style.aulasButton}
                                    onClick={() => { setShowOnlyAulas(false); setShowEquipes(false); setShowGratificacoes(false); setShowDiplomas(false); setShowTurnos(false); }}
                                >Linha do Tempo</button>
                                <button
                                    className={showGratificacoes ? style.activeButton : style.aulasButton}
                                    onClick={() => { setShowGratificacoes(true); setShowOnlyAulas(false); setShowEquipes(false); setShowDiplomas(false); setShowTurnos(false); }}
                                >Gratificações</button>
                                <button
                                    className={showTurnos ? style.activeButton : style.aulasButton}
                                    onClick={() => { setShowTurnos(true); setShowOnlyAulas(false); setShowEquipes(false); setShowGratificacoes(false); setShowDiplomas(false); }}
                                >Turnos</button>
                            </div>
                        </div>
                    </div>
                    {showTurnos ? (
                        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 auto', padding: '0 0 32px 0' }}>
                            <div style={{ width: '100%', maxWidth: 900, display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', margin: '0 auto', marginTop: 40 }}>
                                {loadingTurnos ? (
                                    <div style={{ color: '#888', fontSize: 17, textAlign: 'center', marginTop: 40 }}>Carregando turnos...</div>
                                ) : turnos.length === 0 ? (
                                    <div style={{ color: '#888', fontSize: 17, textAlign: 'center', marginTop: 40 }}>Nenhum turno encontrado.</div>
                                ) : (
                                    <>
                                        {turnos.slice().reverse().slice((paginaTurnos - 1) * 10, paginaTurnos * 10).map((turno, idx) => (
                                            <div key={turno._id || idx} style={{ background: '#fff', border: '1.5px solid #ececec', borderRadius: 12, boxShadow: '0 2px 8px #ececec', padding: '10px 40px', width: '100%', maxWidth: 900, margin: 0, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
                                                <div style={{ fontWeight: 600, color: '#23272e', fontSize: 15, marginBottom: 1 }}>Início: <span style={{ fontWeight: 400 }}>{formatarDataHoraTurno(turno.inicio)}</span></div>
                                                <div style={{ fontWeight: 600, color: '#23272e', fontSize: 15, marginBottom: 1 }}>Fim: <span style={{ fontWeight: 400 }}>{turno.fim ? formatarDataHoraTurno(turno.fim) : 'Em Andamento'}</span></div>
                                                <div style={{ fontWeight: 600, color: '#444', fontSize: 15, marginTop: 1 }}>{calcularTempoTotalTurno(turno.inicio, turno.fim)}</div>
                                            </div>
                                        ))}
                                        {Math.ceil(turnos.length / 10) > 1 && (
                                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 24 }}>
                                                <button onClick={() => setPaginaTurnos(p => Math.max(1, p - 1))} disabled={paginaTurnos === 1} style={{ background: '#eee', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, color: paginaTurnos === 1 ? '#aaa' : '#222', cursor: paginaTurnos === 1 ? 'not-allowed' : 'pointer', fontSize: 15 }}>Anterior</button>
                                                <span style={{ fontWeight: 600, color: '#222', fontSize: 15 }}>{paginaTurnos} / {Math.ceil(turnos.length / 10)}</span>
                                                <button onClick={() => setPaginaTurnos(p => Math.min(Math.ceil(turnos.length / 10), p + 1))} disabled={paginaTurnos === Math.ceil(turnos.length / 10)} style={{ background: '#eee', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, color: paginaTurnos === Math.ceil(turnos.length / 10) ? '#aaa' : '#222', cursor: paginaTurnos === Math.ceil(turnos.length / 10) ? 'not-allowed' : 'pointer', fontSize: 15 }}>Próxima</button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    ) : showDiplomas ? (
                        <div style={{ display: 'flex', flexDirection: 'row', gap: 32, padding: 24 }}>
                            {/* Scripts de Equipe */}
                            <div style={{ flex: 1 }}>
                                <h4 style={{ fontWeight: 700, fontSize: 17, margin: '0 0 10px 0' }}>Aulas</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                    {Documents && Documents.filter(doc => doc.script === true && !(doc.nameDocs && doc.nameDocs.startsWith('Diploma')) && !(doc.nameDocs && doc.nameDocs.startsWith('Aquisição'))).length > 0 ? (
                                        Documents.filter(doc => doc.script === true && !(doc.nameDocs && doc.nameDocs.startsWith('Diploma')) && !(doc.nameDocs && doc.nameDocs.startsWith('Aquisição'))).map((doc) => {
                                        const realizado = Array.isArray(safeProfile.classes) && safeProfile.classes.includes(doc.nameDocs);
                                        let dataRealizacao = null;
                                        if (realizado && Array.isArray(requerimentsArray)) {
                                            const req = requerimentsArray.find(r => r.typeRequirement === 'Aula' && r.status === 'Aprovado' && r.classe === doc.nameDocs);
                                            if (req && req.createdAt) {
                                                dataRealizacao = formatarDataHora(req.createdAt);
                                            }
                                        }
                                        return (
                                            <div key={doc._id} style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#f8f9fa', borderRadius: 8, padding: '10px 18px', border: '1px solid #e4e4e4', maxWidth: 400 }}>
                                                {doc.imageUrl && (
                                                    <img src={doc.imageUrl} alt={doc.nameDocs} style={{ width: 38, height: 38, objectFit: 'cover', borderRadius: 8, border: '1px solid #ccc', background: '#fff', filter: realizado ? 'none' : 'grayscale(1) brightness(0.7)' }} />
                                                )}
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontWeight: 600, fontSize: 16, color: '#222' }}>{doc.nameDocs}</span>
                                                    <span style={{ fontSize: 14, color: realizado ? '#22c55e' : '#888', fontWeight: 500 }}>
                                                        {realizado ? (
                                                            <>Realizado{dataRealizacao && <> em {dataRealizacao}</>}</>
                                                        ) : 'Aula não realizada'}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <span style={{ color: '#888', fontSize: 16 }}>Nenhum script de equipe encontrado.</span>
                                )}
                            </div>
                            </div>
                            {/* Diplomas de Equipe */}
                            <div style={{ flex: 1 }}>
                                <h4 style={{ fontWeight: 700, fontSize: 17, margin: '0 0 10px 0' }}>Diplomas</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                    {Documents && Documents.filter(doc => doc.nameDocs && doc.nameDocs.startsWith('Diploma')).length > 0 ? (
                                        Documents.filter(doc => doc.nameDocs && doc.nameDocs.startsWith('Diploma')).map((doc) => {
                                            const realizado = Array.isArray(safeProfile.classes) && safeProfile.classes.includes(doc.nameDocs);
                                            let dataRealizacao = null;
                                            if (realizado && Array.isArray(requerimentsArray)) {
                                                const req = requerimentsArray.find(r => r.typeRequirement === 'Aula' && r.status === 'Aprovado' && r.classe === doc.nameDocs);
                                                if (req && req.createdAt) {
                                                    dataRealizacao = formatarDataHora(req.createdAt);
                                                }
                                            }
                                            return (
                                                <div key={doc._id} style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#f8f9fa', borderRadius: 8, padding: '10px 18px', border: '1px solid #e4e4e4', maxWidth: 400 }}>
                                                    {doc.imageUrl && (
                                                        <img src={doc.imageUrl} alt={doc.nameDocs} style={{ width: 38, height: 38, objectFit: 'cover', borderRadius: 8, border: '1px solid #ccc', background: '#fff', filter: realizado ? 'none' : 'grayscale(1) brightness(0.7)' }} />
                                                    )}
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <span style={{ fontWeight: 600, fontSize: 16, color: '#222' }}>{doc.nameDocs}</span>
                                                        <span style={{ fontSize: 14, color: realizado ? '#22c55e' : '#888', fontWeight: 500 }}>
                                                            {realizado ? (
                                                                <>Realizado{dataRealizacao && <> em {dataRealizacao}</>}</>
                                                            ) : 'Diploma não realizado'}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <span style={{ color: '#888', fontSize: 16 }}>Nenhum diploma de equipe encontrado.</span>
                                    )}
                                </div>
                            </div>
                            {/* Aquisições - Exibido apenas para cargos paidPositions */}
                            {isPaidPosition && (
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ fontWeight: 700, fontSize: 17, margin: '0 0 10px 0' }}>Aquisições</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                        {Documents && Documents.filter(doc => doc.nameDocs && doc.nameDocs.startsWith('Aquisição')).length > 0 ? (
                                            Documents.filter(doc => doc.nameDocs && doc.nameDocs.startsWith('Aquisição')).map((doc) => {
                                                const realizado = Array.isArray(safeProfile.classes) && safeProfile.classes.includes(doc.nameDocs);
                                                let dataRealizacao = null;
                                                if (realizado && Array.isArray(requerimentsArray)) {
                                                    const req = requerimentsArray.find(r => r.typeRequirement === 'Aula' && r.status === 'Aprovado' && r.classe === doc.nameDocs);
                                                    if (req && req.createdAt) {
                                                        dataRealizacao = formatarDataHora(req.createdAt);
                                                    }
                                                }
                                                return (
                                                    <div key={doc._id} style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#f8f9fa', borderRadius: 8, padding: '10px 18px', border: '1px solid #e4e4e4', maxWidth: 400 }}>
                                                        {doc.imageUrl && (
                                                            <img src={doc.imageUrl} alt={doc.nameDocs} style={{ width: 38, height: 38, objectFit: 'cover', borderRadius: 8, border: '1px solid #ccc', background: '#fff', filter: realizado ? 'none' : 'grayscale(1) brightness(0.7)' }} />
                                                        )}
                                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                            <span style={{ fontWeight: 600, fontSize: 16, color: '#222' }}>{doc.nameDocs}</span>
                                                            <span style={{ fontSize: 14, color: realizado ? '#22c55e' : '#888', fontWeight: 500 }}>
                                                                {realizado ? (
                                                                    <>Realizado{dataRealizacao && <> em {dataRealizacao}</>}</>
                                                                ) : 'Aula não realizada'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <span style={{ color: '#888', fontSize: 16 }}>Nenhuma aquisição encontrada.</span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className={style.timelineWrapper}>
                            {/* Linha do tempo visual */}
                            <div className={style.timelineBody}>
                                {(!showEquipes) && <div className={style.timelineLine}></div>}
                                {showEquipes ? (
                                    <div className="flex flex-col items-center p-6 gap-4">
                                        {userTeams.length > 0 ? userTeams.map((team) => (
                                            <div key={team._id || team.nameTeams} className="flex flex-row items-center gap-4 bg-[#f8f9fa] rounded-lg shadow p-4 w-full max-w-xl border border-[#e4e4e4]">
                                                <img src={team.emblema} alt={team.nameTeams} className="w-16 h-16 rounded-md object-contain bg-white border border-[#e4e4e4]" />
                                                <div>
                                                    <h4 className="font-bold text-lg text-[#031149]">{team.nameTeams}</h4>
                                                    <p className="text-sm text-gray-700">Cargo: <span className="font-semibold">{getUserOffice(team) || 'Membro'}</span></p>
                                                </div>
                                            </div>
                                        )) : <p>O militar ainda não faz parte de nenhuma equipe.</p>}
                                    </div>
                                ) : (
                                    showGratificacoes ? (
                                        <div className={style.timelineWrapper}>
                                            <div className={style.timelineBody}>
                                                <div className={style.timelineLine}></div>
                                                {requerimentsArray && requerimentsArray.filter(r => r.typeRequirement === 'Gratificação').length > 0 ? (
                                                    requerimentsArray.filter(r => r.typeRequirement === 'Gratificação').slice().reverse().map((requeriment, index) => {
                                                        let statusIcon = null;
                                                        let statusColor = '';
                                                        if (requeriment.status === 'Aprovado') {
                                                            statusIcon = <FaCheckCircle style={{ color: '#22c55e', fontSize: 28, background: '#fff', borderRadius: '50%', boxShadow: '0 2px 8px #e4e4e4' }} />;
                                                            statusColor = '#22c55e';
                                                        } else if (requeriment.status === 'Reprovado') {
                                                            statusIcon = <FaTimesCircle style={{ color: '#ef4444', fontSize: 28, background: '#fff', borderRadius: '50%', boxShadow: '0 2px 8px #e4e4e4' }} />;
                                                            statusColor = '#ef4444';
                                                        } else if (requeriment.status === 'Pendente') {
                                                            statusIcon = <FaClock style={{ color: '#facc15', fontSize: 28, background: '#fff', borderRadius: '50%', boxShadow: '0 2px 8px #e4e4e4' }} />;
                                                            statusColor = '#facc15';
                                                        }
                                                        return (
                                                            <div key={index} className={index % 2 === 0 ? `${style.timelineCard} ${style.timelineCardLeft}` : `${style.timelineCard} ${style.timelineCardRight}`}
                                                                style={{ position: 'relative' }}>
                                                                <div style={{
                                                                    position: 'absolute',
                                                                    top: '50%',
                                                                    transform: 'translateY(-50%)',
                                                                    right: index % 2 === 0 ? '-46px' : 'auto',
                                                                    left: index % 2 !== 0 ? '-46px' : 'auto',
                                                                    zIndex: 3,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    background: 'transparent',
                                                                }}>
                                                                    {statusIcon}
                                                                </div>
                                                                <div className={style.timelineContent}>
                                                                    <div className={style.timelineTitle}>Gratificação</div>
                                                                    <div className={style.timelineMeta}>
                                                                        <span>{requeriment.createdAt ? formatarDataHora(requeriment.createdAt) : ''}</span>
                                                                        <span>por {requeriment.operator || 'Não informado'}</span>
                                                                    </div>
                                                                    <div className={style.timelineDetails}>
                                                                        <div style={{fontWeight: 600, color: '#14532d', fontSize: 15, marginBottom: 2}}>Quantidade: {requeriment.amount}</div>
                                                                        {requeriment.reason && <p>{requeriment.reason}</p>}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <p style={{color: '#888', textAlign: 'center'}}>Nenhuma gratificação encontrada.</p>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        requerimentsArray && requerimentsArray.length > 0 ? (
                                            (showOnlyAulas
                                                ? requerimentsArray.filter(r => r.typeRequirement === 'Aula')
                                                : requerimentsArray.filter(r => r.typeRequirement !== 'Gratificação')
                                            ).slice().reverse().map((requeriment, index) => {
                                                let statusIcon = null;
                                                let statusColor = '';
                                                if (requeriment.status === 'Aprovado') {
                                                    statusIcon = <FaCheckCircle style={{ color: '#22c55e', fontSize: 28, background: '#fff', borderRadius: '50%', boxShadow: '0 2px 8px #e4e4e4' }} />;
                                                    statusColor = '#22c55e';
                                                } else if (requeriment.status === 'Reprovado') {
                                                    statusIcon = <FaTimesCircle style={{ color: '#ef4444', fontSize: 28, background: '#fff', borderRadius: '50%', boxShadow: '0 2px 8px #e4e4e4' }} />;
                                                    statusColor = '#ef4444';
                                                } else if (requeriment.status === 'Pendente') {
                                                    statusIcon = <FaClock style={{ color: '#facc15', fontSize: 28, background: '#fff', borderRadius: '50%', boxShadow: '0 2px 8px #e4e4e4' }} />;
                                                    statusColor = '#facc15';
                                                }
                                                return (
                                                    <div key={index} className={index % 2 === 0 ? `${style.timelineCard} ${style.timelineCardLeft}` : `${style.timelineCard} ${style.timelineCardRight}`}
                                                        style={{ position: 'relative' }}>
                                                        {/* Ícone de status encostado na linha */}
                                                        <div style={{
                                                            position: 'absolute',
                                                            top: '50%',
                                                            transform: 'translateY(-50%)',
                                                            right: index % 2 === 0 ? '-46px' : 'auto',
                                                            left: index % 2 !== 0 ? '-46px' : 'auto',
                                                            zIndex: 3,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            background: 'transparent',
                                                        }}>
                                                            {statusIcon}
                                                        </div>
                                                        <div className={style.timelineContent}>
                                                            {/* Título detalhado para promoções, rebaixamentos e vendas */}
                                                            <div className={style.timelineTitle}>{requeriment.typeRequirement || ''}</div>
                                                            {/* Exibir apenas a nova patente para promoção, rebaixamento e venda */}
                                                            {(['Promoção', 'Rebaixamento', 'Venda'].includes(requeriment.typeRequirement) && requeriment.newPatent) && (
                                                                <div style={{ fontWeight: 600, color: '#14532d', fontSize: 15, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                                    <FaUser style={{ marginRight: 4 }} />
                                                                    {requeriment.newPatent}
                                                                </div>
                                                            )}
                                                            {/* Linha detalhada para promoções, rebaixamentos e vendas */}
                                                            {requeriment.typeRequirement === 'Rebaixamento' && requeriment.patenteAntiga && requeriment.newPatent && (
                                                                <div style={{ fontWeight: 600, color: '#c2410c', fontSize: 15, marginBottom: 2 }}>
                                                                    {requeriment.patenteAntiga} a {requeriment.newPatent}
                                                                </div>
                                                            )}
                                                            {/* Exibir nome da aula/curso se for Aula */}
                                                            {requeriment.typeRequirement === 'Aula' && requeriment.classe && (
                                                                <div style={{ fontWeight: 600, color: '#14532d', fontSize: 15, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                                    <FaBook style={{ marginRight: 4 }} />
                                                                    {requeriment.classe}
                                                                </div>
                                                            )}
                                                            <div className={style.timelineMeta}>
                                                                <span>{requeriment.createdAt ? formatarDataHora(requeriment.createdAt) : ''}</span>
                                                                <span>por {requeriment.operator || 'Não informado'}</span>
                                                            </div>
                                                            <div className={style.timelineDetails}>
                                                                {requeriment.reason && <p>{requeriment.reason}</p>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p style={{color: '#888', textAlign: 'center'}}>Nenhum requerimento encontrado.</p>
                                        )
                                    )
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>
            {copied && (
                <div style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 9999 }}>
                <Notification message="Cadastro copiado com sucesso!" onClose={() => setCopied(false)} />
                </div>
            )}
        </div>
    );
}

export default Profile;
