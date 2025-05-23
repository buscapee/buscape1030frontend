import React, { useState, useEffect, useRef } from 'react';
import { FaPlay, FaList, FaStop, FaExchangeAlt, FaChevronRight } from 'react-icons/fa';
import axiosInstance from '../../provider/axiosInstance';
import { useNavigate } from 'react-router-dom';

const user = JSON.parse(localStorage.getItem('@Auth:Profile'));
const userType = JSON.parse(localStorage.getItem('@Auth:ProfileUser'));

const SETORES = [
  'Batalhão',
  'Portador de Direitos',
  'Corredores'
];

const ServicePointPage = () => {
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSetorMenu, setShowSetorMenu] = useState(false);
  const setorMenuRef = useRef(null);
  // Para menu suspenso de troca de setor na tabela
  const [openSetorMenuIdx, setOpenSetorMenuIdx] = useState(null);
  const setorMenuTableRef = useRef([]);
  const navigate = useNavigate();
  const [successMsg, setSuccessMsg] = useState("");

  // Buscar turnos abertos do backend
  const fetchTurnos = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/servicepoints/abertos');
      setTurnos(res.data);
      setLoading(false);
    } catch (err) {
      setError('Erro ao buscar turnos.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTurnos();
    const interval = setInterval(fetchTurnos, 60000); // Atualiza a cada 1 minuto
    return () => clearInterval(interval);
  }, []);

  // Fecha menu de setor ao clicar fora (card do usuário)
  useEffect(() => {
    function handleClickOutside(event) {
      if (setorMenuRef.current && !setorMenuRef.current.contains(event.target)) {
        setShowSetorMenu(false);
      }
    }
    if (showSetorMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSetorMenu]);

  // Fecha menu de setor ao clicar fora (tabela)
  useEffect(() => {
    function handleClickOutsideTable(event) {
      if (
        openSetorMenuIdx !== null &&
        setorMenuTableRef.current[openSetorMenuIdx] &&
        !setorMenuTableRef.current[openSetorMenuIdx].contains(event.target)
      ) {
        setOpenSetorMenuIdx(null);
      }
    }
    if (openSetorMenuIdx !== null) {
      document.addEventListener('mousedown', handleClickOutsideTable);
    } else {
      document.removeEventListener('mousedown', handleClickOutsideTable);
    }
    return () => document.removeEventListener('mousedown', handleClickOutsideTable);
  }, [openSetorMenuIdx]);

  // Iniciar turno
  const handleIniciarTurno = async () => {
    try {
      setLoading(true);
      await axiosInstance.post('/servicepoints/iniciar', {
        nickname: user.nickname,
        setor: 'Batalhão',
      });
      await fetchTurnos();
      setLoading(false);
      setSuccessMsg('Turno iniciado. Seu turno foi iniciado com sucesso.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao iniciar turno.');
      setLoading(false);
    }
  };

  // Encerrar turno (admin ou próprio usuário)
  const handleEncerrarTurno = async (nickname) => {
    try {
      setLoading(true);
      await axiosInstance.post('/servicepoints/encerrar', {
        nickname,
        admin: user.nickname
      });
      await fetchTurnos();
      setLoading(false);
      setShowSetorMenu(false);
      setOpenSetorMenuIdx(null);
      if (nickname === user.nickname) {
        setSuccessMsg('Turno finalizado. Seu turno foi finalizado com sucesso.');
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setSuccessMsg(`Turno finalizado. Você finalizou o turno de ${nickname}.`);
      }
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao encerrar turno.');
      setLoading(false);
    }
  };

  // Trocar setor (próprio usuário ou admin na tabela)
  const handleTrocarSetor = async (nickname, novoSetor, isTable) => {
    try {
      setLoading(true);
      await axiosInstance.patch('/servicepoints/setor', {
        nickname,
        setor: novoSetor
      });
      await fetchTurnos();
      setLoading(false);
      if (nickname === user.nickname) {
        setSuccessMsg('Troca de Setor. Você trocou de setor com sucesso.');
      } else {
        setSuccessMsg(`Troca de Setor. Você alterou de setor o(a) ${nickname}.`);
      }
      setTimeout(() => setSuccessMsg(''), 4000);
      if (isTable) setOpenSetorMenuIdx(null);
      else setShowSetorMenu(false);
    } catch (err) {
      setError('Erro ao trocar setor.');
      setLoading(false);
      if (isTable) setOpenSetorMenuIdx(null);
      else setShowSetorMenu(false);
    }
  };

  // Verifica se o usuário tem turno aberto
  const turnoAberto = turnos.find(t => t.nickname === user.nickname && t.aberto);

  // Calcula tempo em minutos
  const getTempo = (inicio) => {
    if (!inicio) return 0;
    const diff = Date.now() - new Date(inicio).getTime();
    return Math.floor(diff / 60000);
  };

  // Função utilitária para formatar minutos em 'X hora(s) e YY minutos'
  function formatarTempoHorasMinutos(minutos) {
    const horas = Math.floor(minutos / 60);
    const min = minutos % 60;
    return `${horas} hora${horas !== 1 ? 's' : ''} e ${min.toString().padStart(2, '0')} minutos`;
  }

  const isAdmin = userType?.userType === 'Admin';

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#f5f5f5', padding: '32px 0', paddingTop: 100 }}>
      <h2 style={{ marginLeft: 60, fontWeight: 700, fontSize: 28, marginBottom: 24 }}>Ponto de Serviço</h2>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 40, marginTop: 0 }}>
        <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 8px #e4e4e4', minWidth: 320, maxWidth: 340, width: '100%', padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
          <div style={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <img
              src={`https://www.habbo.com.br/habbo-imaging/avatarimage?img_format=png&user=${user?.nickname || ''}&direction=3&head_direction=3&size=l&action=std`}
              alt={user?.nickname}
              style={{ width: 120, height: 120, borderRadius: '50%', marginBottom: 16, background: '#eee', border: '4px solid #fff', boxShadow: '0 1px 8px #e4e4e4' }}
            />
            <div style={{ fontWeight: 600, fontSize: 22, color: '#222', marginBottom: 2 }}>{user?.nickname}</div>
            {turnoAberto && (
              <div style={{ fontSize: 15, color: '#888', marginBottom: 0 }}>
                {getTempo(turnoAberto.setores?.[turnoAberto.setores.length-1]?.inicio) === 0
                  ? 'Agora'
                  : formatarTempoHorasMinutos(getTempo(turnoAberto.setores?.[turnoAberto.setores.length-1]?.inicio))}
              </div>
            )}
          </div>
          <div style={{ width: '100%', borderTop: '1px solid #ececec', position: 'relative' }}>
            <button
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                outline: 'none',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 15,
                color: turnoAberto ? '#c00' : '#222',
                cursor: 'pointer',
                transition: 'background 0.2s',
                borderRadius: '0 0 0 0',
                fontWeight: 500
              }}
              onMouseOver={e => e.currentTarget.style.background = '#f7f7f7'}
              onMouseOut={e => e.currentTarget.style.background = 'none'}
              onClick={() => turnoAberto ? handleEncerrarTurno(user.nickname) : handleIniciarTurno()}
              disabled={loading}
            >
              {turnoAberto ? 'Finalizar Turno' : 'Iniciar Turno'}
              {turnoAberto ? <FaStop style={{ fontSize: 16 }} /> : <FaPlay style={{ fontSize: 16 }} />}
            </button>
            <button style={{
              width: '100%',
              background: 'none',
              border: 'none',
              outline: 'none',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 15,
              color: '#222',
              cursor: 'pointer',
              transition: 'background 0.2s',
              borderRadius: '0 0 0 0',
              fontWeight: 500
            }}
            onMouseOver={e => e.currentTarget.style.background = '#f7f7f7'}
            onMouseOut={e => e.currentTarget.style.background = 'none'}
            onClick={() => navigate('/meus-turnos')}
            >
              Meus Turnos
              <FaList style={{ fontSize: 16 }} />
            </button>
            {/* Botão Trocar Setor */}
            {turnoAberto && (
              <div style={{ position: 'relative' }} ref={setorMenuRef}>
                <button
                  style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    outline: 'none',
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: 15,
                    color: '#222',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    borderRadius: '0 0 8px 8px',
                    fontWeight: 500
                  }}
                  onMouseOver={e => e.currentTarget.style.background = '#f7f7f7'}
                  onMouseOut={e => e.currentTarget.style.background = 'none'}
                  onClick={() => setShowSetorMenu(v => !v)}
                >
                  Trocar Setor
                  <FaChevronRight style={{ fontSize: 16 }} />
                </button>
                {showSetorMenu && (
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: '100%',
                    width: '100%',
                    background: '#fff',
                    border: '1px solid #ececec',
                    borderRadius: '0 0 8px 8px',
                    boxShadow: '0 2px 8px #e4e4e4',
                    zIndex: 10
                  }}>
                    {SETORES.map((setor, idx) => (
                      <button
                        key={setor}
                        style={{
                          width: '100%',
                          background: 'none',
                          border: 'none',
                          outline: 'none',
                          padding: '12px 18px',
                          textAlign: 'left',
                          fontSize: 15,
                          color: turnoAberto.setor === setor ? '#1976d2' : '#222',
                          cursor: 'pointer',
                          fontWeight: 500,
                          borderBottom: idx === SETORES.length - 1 ? 'none' : '1px solid #ececec',
                          backgroundColor: turnoAberto.setor === setor ? '#f3faff' : 'none'
                        }}
                        onClick={e => { e.stopPropagation(); handleTrocarSetor(user.nickname, setor, false); }}
                      >
                        {setor}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Histórico de setores - fora do card */}
          {turnoAberto && turnoAberto.setores && turnoAberto.setores.length > 1 && (
            <div style={{ marginTop: 40, width: 340 }}>
              <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 14, marginLeft: 4 }}>Histórico</div>
              <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 8px #e4e4e4', padding: 0 }}>
                {(turnoAberto.setores || []).slice(0, -1).reverse().map((setor, idx, arr) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', fontSize: 15, borderBottom: idx !== arr.length - 1 ? '1px solid #ececec' : 'none' }}>
                    <span>{setor.nome}</span>
                    <span>{setor.fim ? `${Math.max(1, Math.floor((new Date(setor.fim) - new Date(setor.inicio)) / 60000))} minutos` : 'Agora'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {successMsg && (
            <div style={{ background: '#e6f9ec', border: '1.5px solid #2ecc40', color: '#179c3c', borderRadius: 6, padding: '18px 24px', marginBottom: 24, fontWeight: 500, fontSize: 17, boxShadow: '0 1px 8px #e4e4e4', width: 600, maxWidth: '90%', textAlign: 'left' }}>
              <span style={{ fontWeight: 700, color: '#179c3c', fontSize: 16 }}>
                {successMsg.split('.')[0]}.
              </span>
              <br />
              <span style={{ color: '#179c3c', fontWeight: 400, fontSize: 15 }}>
                {successMsg.split('. ').slice(1).join('. ')}
              </span>
            </div>
          )}
          <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 8px #e4e4e4', minWidth: 480, width: 600, padding: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f7f7f7' }}>
                  <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 700 }}>Nick</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 700 }}>Tempo</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 700 }}>Setor</th>
                  {isAdmin && <th style={{ textAlign: 'center', padding: '8px 12px', fontWeight: 700 }}>Ações</th>}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={isAdmin ? 4 : 3} style={{ textAlign: 'center', color: '#aaa', padding: 24 }}>Carregando...</td></tr>
                ) : turnos.length === 0 ? (
                  <tr><td colSpan={isAdmin ? 4 : 3} style={{ textAlign: 'center', color: '#aaa', padding: 24 }}>Nenhum turno aberto.</td></tr>
                ) : (
                  turnos.filter(t => t.aberto).map((turno, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: '8px 12px' }}>{turno.nickname}</td>
                      <td style={{ padding: '8px 12px' }}>{formatarTempoHorasMinutos(getTempo(turno.inicio))}</td>
                      <td style={{ padding: '8px 12px' }}>{turno.setor}</td>
                      {isAdmin && (
                        <td style={{ padding: '8px 12px', textAlign: 'center', position: 'relative' }}>
                          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
                            <div style={{ position: 'relative' }} ref={el => setorMenuTableRef.current[idx] = el}>
                              <button
                                style={{ background: '#FFD600', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', marginRight: 4 }}
                                title="Trocar setor"
                                onClick={() => setOpenSetorMenuIdx(openSetorMenuIdx === idx ? null : idx)}
                              >
                                <FaExchangeAlt style={{ color: '#fff200', fontSize: 16, filter: 'drop-shadow(0 0 1px #bfa700)' }} />
                              </button>
                              {openSetorMenuIdx === idx && (
                                <div style={{
                                  position: 'absolute',
                                  left: 0,
                                  top: '110%',
                                  minWidth: 160,
                                  background: '#fff',
                                  border: '1px solid #ececec',
                                  borderRadius: 8,
                                  boxShadow: '0 2px 8px #e4e4e4',
                                  zIndex: 20
                                }}>
                                  {SETORES.map((setor, sidx) => (
                                    <button
                                      key={setor}
                                      style={{
                                        width: '100%',
                                        background: 'none',
                                        border: 'none',
                                        outline: 'none',
                                        padding: '12px 18px',
                                        textAlign: 'left',
                                        fontSize: 15,
                                        color: turno.setor === setor ? '#1976d2' : '#222',
                                        cursor: 'pointer',
                                        fontWeight: 500,
                                        borderBottom: sidx === SETORES.length - 1 ? 'none' : '1px solid #ececec',
                                        backgroundColor: turno.setor === setor ? '#f3faff' : 'none'
                                      }}
                                      onClick={e => { e.stopPropagation(); handleTrocarSetor(turno.nickname, setor, true); }}
                                    >
                                      {setor}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                            <button
                              style={{ background: '#E53935', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}
                              title="Pausar/Encerrar turno"
                              onClick={() => handleEncerrarTurno(turno.nickname)}
                            >
                              <FaStop style={{ color: '#fff', fontSize: 16 }} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicePointPage; 