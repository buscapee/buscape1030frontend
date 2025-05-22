import React, { useEffect, useState } from 'react';
import axiosInstance from '../../provider/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { FaPlay, FaStop, FaExchangeAlt } from 'react-icons/fa';
import EditarTurnoModal from './EditarTurnoModal';

const user = JSON.parse(localStorage.getItem('@Auth:Profile'));
const userType = JSON.parse(localStorage.getItem('@Auth:ProfileUser'));

function formatarDataHora(data) {
  if (!data) return '';
  const d = new Date(data);
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const ano = d.getFullYear();
  const hora = String(d.getHours()).padStart(2, '0');
  const minuto = String(d.getMinutes()).padStart(2, '0');
  return `${dia}/${mes}/${ano} às ${hora}:${minuto}`;
}

function calcularTempoTotal(inicio, fim) {
  if (!inicio || !fim) return '-';
  const diff = new Date(fim) - new Date(inicio);
  const minutos = Math.floor(diff / 60000);
  if (minutos < 60) return `Total: ${minutos} minutos`;
  const horas = Math.floor(minutos / 60);
  const min = minutos % 60;
  return `Total: ${horas} hora${horas > 1 ? 's' : ''}${min > 0 ? ` e ${min} min` : ''}`;
}

const MeusTurnosPage = () => {
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [porPagina] = useState(10);
  const navigate = useNavigate();
  const [turnoSelecionado, setTurnoSelecionado] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditar, setShowEditar] = useState(false);
  const [deletando, setDeletando] = useState(false);

  useEffect(() => {
    const fetchTurnos = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/servicepoints/usuario/${user.nickname}`);
        setTurnos(res.data);
      } catch (err) {
        setTurnos([]);
      }
      setLoading(false);
    };
    fetchTurnos();
  }, []);

  // Paginação simples
  const totalPaginas = Math.ceil(turnos.length / porPagina);
  const turnosPaginados = turnos.slice((pagina - 1) * porPagina, pagina * porPagina);

  const isAdmin = userType?.userType === 'Admin' || userType?.userType === 'Diretor';

  function getTempoMinutos(inicio, fim) {
    if (!inicio || !fim) return 0;
    return Math.max(1, Math.floor((new Date(fim) - new Date(inicio)) / 60000));
  }

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#f5f5f5', padding: '32px 0', paddingTop: 100 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 32px 18px 32px' }}>
        <h2 style={{ fontWeight: 700, fontSize: 22, margin: 0 }}>Meus Turnos</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {isAdmin && (
            <button style={{ background: '#e0e0e0', color: '#222', border: 'none', borderRadius: 4, padding: '7px 18px', fontWeight: 500, cursor: 'pointer' }} onClick={() => navigate('/todos-turnos')}>
              Todos os Turnos
            </button>
          )}
          <button style={{ background: '#e0e0e0', color: '#222', border: 'none', borderRadius: 4, padding: '7px 18px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => navigate(-1)}>
            <span style={{ display: 'inline-block', transform: 'rotate(180deg)' }}>&#10140;</span> Voltar
          </button>
        </div>
      </div>
      <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 8px #e4e4e4', margin: '0 32px', padding: 24 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
          <thead>
            <tr style={{ background: '#f7f7f7' }}>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>#</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Usuário</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Tempo</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, width: 70 }}>Nº de Setores</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: '#aaa', padding: 24 }}>Carregando...</td></tr>
            ) : turnosPaginados.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: '#aaa', padding: 24 }}>Nenhum turno encontrado.</td></tr>
            ) : (
              turnosPaginados.map((turno, idx) => (
                <tr key={turno._id} style={{ borderBottom: '1px solid #ececec' }}>
                  <td style={{ padding: '10px 12px' }}>{turno._id?.slice(-3) || idx + 1}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <a href="#" style={{ color: '#1976d2', textDecoration: 'underline', fontWeight: 500 }}>{turno.nickname}</a>
                  </td>
                  <td style={{ padding: '10px 12px', whiteSpace: 'pre-line' }}>
                    Início {formatarDataHora(turno.inicio)}
                    {turno.fim && `\nFim ${formatarDataHora(turno.fim)}`}
                    <br />{calcularTempoTotal(turno.inicio, turno.fim)}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'left', width: 70, marginRight: 24 }}>{turno.setores?.length || 1}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <button
                      style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 18px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                      onClick={() => { setTurnoSelecionado(turno); setShowModal(true); }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7Zm0 12c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5Zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"/></svg>
                      Ver
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {/* Paginação */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 18, gap: 16 }}>
          <button onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={pagina === 1} style={{ background: '#eee', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: pagina === 1 ? 'not-allowed' : 'pointer' }}>&larr;</button>
          <span style={{ fontWeight: 500 }}>{pagina}</span>
          <span style={{ color: '#888' }}>/ {totalPaginas || 1} páginas</span>
          <button onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))} disabled={pagina === totalPaginas || totalPaginas === 0} style={{ background: '#eee', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: pagina === totalPaginas || totalPaginas === 0 ? 'not-allowed' : 'pointer' }}>&rarr;</button>
        </div>
      </div>
      {showModal && turnoSelecionado && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(30,32,38,0.18)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 4px 32px #dbe3ee', display: 'flex', minWidth: 900, maxWidth: 1100, width: '95%', minHeight: 420, position: 'relative', overflow: 'hidden' }}>
            {/* Esquerda: Card do usuário */}
            <div style={{ minWidth: 320, maxWidth: 340, width: 340, background: '#f7f8fa', borderRight: '1px solid #ececec', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 36 }}>
              <img
                src={`https://www.habbo.com.br/habbo-imaging/avatarimage?img_format=png&user=${turnoSelecionado.nickname}&direction=3&head_direction=3&size=m&action=std&headonly=1`}
                alt={turnoSelecionado.nickname}
                style={{ width: 64, height: 64, borderRadius: '50%', background: '#fff', border: 'none', marginBottom: 10 }}
              />
              <div style={{ fontWeight: 700, fontSize: 22, color: '#222', marginBottom: 2 }}>{turnoSelecionado.nickname}</div>
              <div style={{ fontSize: 15, color: '#888', marginBottom: 18, fontWeight: 500 }}>
                {turnoSelecionado.inicio && turnoSelecionado.fim ? calcularTempoTotal(turnoSelecionado.inicio, turnoSelecionado.fim) : '-'}
              </div>
              <div style={{ width: '100%', marginTop: 18 }}>
                {(turnoSelecionado.setores || []).map((setor, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: idx !== (turnoSelecionado.setores.length - 1) ? '1px solid #ececec' : 'none', fontSize: 15, color: '#444' }}>
                    <span>{setor.nome}</span>
                    <span style={{ color: '#888', fontWeight: 500 }}>{getTempoMinutos(setor.inicio, setor.fim) > 0 ? `${getTempoMinutos(setor.inicio, setor.fim)} min` : '-'}</span>
                  </div>
                ))}
              </div>
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10, marginTop: 36 }}>
                <button onClick={() => setShowModal(false)} style={{ height: 38, fontSize: 15, borderRadius: 6, fontWeight: 600, boxShadow: '0 1px 4px #e4e4e4', padding: '0 28px', transition: 'background 0.18s', background: '#f3f4f6', color: '#222', border: 'none', width: '100%', marginTop: 12, cursor: 'pointer' }}>Voltar</button>
                {isAdmin && (
                  <>
                    <button onClick={() => { setShowEditar(true); }} style={{ height: 38, fontSize: 15, borderRadius: 6, fontWeight: 600, boxShadow: '0 1px 4px #e4e4e4', padding: '0 28px', transition: 'background 0.18s', background: '#222b3a', color: '#fff', border: 'none', width: '100%', marginTop: 12, cursor: 'pointer' }}>Editar</button>
                    <button onClick={async () => {
                      if(window.confirm('Tem certeza que deseja apagar este turno?')) {
                        setDeletando(true);
                        try {
                          await axiosInstance.delete(`/servicepoints/${turnoSelecionado._id}`);
                          setShowModal(false);
                          setTurnos(turnos.filter(t => t._id !== turnoSelecionado._id));
                        } finally {
                          setDeletando(false);
                        }
                      }
                    }} style={{ height: 38, fontSize: 15, borderRadius: 6, fontWeight: 600, boxShadow: '0 1px 4px #e4e4e4', padding: '0 28px', transition: 'background 0.18s', background: '#e74c3c', color: '#fff', border: 'none', width: '100%', marginTop: 12, cursor: deletando ? 'not-allowed' : 'pointer' }}>Apagar Turno</button>
                  </>
                )}
              </div>
            </div>
            {/* Direita: Histórico do turno */}
            <div style={{ flex: 1, padding: 40, display: 'flex', flexDirection: 'column', gap: 0 }}>
              <h3 style={{ fontWeight: 800, fontSize: 24, marginBottom: 24, color: '#1a2746', letterSpacing: 0.5 }}>Relatório</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {/* Início do turno */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
                  <FaPlay style={{ color: '#8a8a8a', fontSize: 16 }} />
                  <span style={{ fontWeight: 600, color: '#222', fontSize: 16 }}>{formatarDataHora(turnoSelecionado.inicio)}</span>
                  <span style={{ color: '#222', fontWeight: 600, fontSize: 16 }}>Começou o Turno</span>
                </div>
                {/* Trocas de setor */}
                {(turnoSelecionado.setores || []).map((setor, idx) => idx > 0 && (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
                    <FaExchangeAlt style={{ color: '#8a8a8a', fontSize: 16 }} />
                    <span style={{ fontWeight: 600, color: '#222', fontSize: 16 }}>{formatarDataHora(setor.inicio)}</span>
                    <span style={{ color: '#222', fontWeight: 600, fontSize: 16 }}>Trocou de Setor</span>
                    <span style={{ color: '#888', fontWeight: 500, fontSize: 15 }}>{setor.nome}</span>
                  </div>
                ))}
                {/* Fim do turno */}
                {turnoSelecionado.fim && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 16 }}>
                    <FaStop style={{ color: '#8a8a8a', fontSize: 16 }} />
                    <span style={{ fontWeight: 600, color: '#222', fontSize: 16 }}>{formatarDataHora(turnoSelecionado.fim)}</span>
                    <span style={{ color: '#222', fontWeight: 600, fontSize: 16 }}>Finalizou o Turno</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {showEditar && turnoSelecionado && (
        <EditarTurnoModal
          turno={turnoSelecionado}
          onClose={() => setShowEditar(false)}
          onSave={async (novoTurno) => {
            await axiosInstance.put(`/servicepoints/${turnoSelecionado._id}`, novoTurno);
            setShowEditar(false);
            setShowModal(false);
            setTurnos(turnos.map(t => t._id === turnoSelecionado._id ? { ...t, ...novoTurno } : t));
          }}
        />
      )}
    </div>
  );
};

export default MeusTurnosPage; 