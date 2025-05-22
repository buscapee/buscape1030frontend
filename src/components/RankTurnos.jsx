import React, { useEffect, useState } from 'react';
import axiosInstance from '../provider/axiosInstance';

// Função para obter o intervalo da semana (segunda a domingo)
function getWeekRange(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diffToMonday = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diffToMonday));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return [monday, sunday];
}

function formatDateShort(date) {
  const d = new Date(date);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

const RankTurnos = () => {
  const [week, setWeek] = useState(getWeekRange());
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRanking();
    // eslint-disable-next-line
  }, [week[0].toISOString()]);

  async function fetchRanking() {
    setLoading(true);
    try {
      const inicio = week[0].toISOString();
      const fim = week[1].toISOString();
      const res = await axiosInstance.get(`/servicepoints/ranking?inicio=${inicio}&fim=${fim}`);
      setRanking(res.data);
    } catch (err) {
      setRanking([]);
    }
    setLoading(false);
  }

  function handlePrevWeek() {
    const prev = new Date(week[0]);
    prev.setDate(prev.getDate() - 7);
    setWeek(getWeekRange(prev));
  }
  function handleNextWeek() {
    const next = new Date(week[0]);
    next.setDate(next.getDate() + 7);
    setWeek(getWeekRange(next));
  }

  return (
    <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 8px #e4e4e4', margin: '24px 0', padding: 0, width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, borderBottom: '1px solid #ececec' }}>
        <button onClick={handlePrevWeek} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#888', padding: 4 }}>&lt;</button>
        <span style={{ fontWeight: 600, fontSize: 16 }}>
          {formatDateShort(week[0])} - {formatDateShort(week[1])}
        </span>
        <button onClick={handleNextWeek} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#888', padding: 4 }}>&gt;</button>
      </div>
      <div style={{ fontWeight: 700, fontSize: 15, padding: '10px 18px 6px 18px', borderBottom: '1px solid #ececec', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: '#222' }}>Ranking da Semana</span>
        <span style={{ color: '#00bfae', fontSize: 18 }}>★</span>
      </div>
      <div style={{ padding: 0 }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#888', padding: 24 }}>Carregando...</div>
        ) : (
          ranking.map((item, idx) => (
            <div key={item.nick} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 18px', borderBottom: idx === ranking.length - 1 ? 'none' : '1px solid #ececec', fontSize: 15 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontWeight: 700, width: 22, textAlign: 'right', color: idx < 3 ? '#00bfae' : '#222' }}>{idx + 1}º</span>
                <img src={`https://www.habbo.com.br/habbo-imaging/avatarimage?img_format=png&user=${item.nick}&direction=3&head_direction=3&size=s&action=std`} alt={item.nick} style={{ width: 32, height: 32, borderRadius: '50%', background: '#eee', border: '2px solid #fff', marginRight: 4 }} />
                <span style={{ fontWeight: 500 }}>{item.nick}</span>
              </div>
              <span style={{ background: '#00bfae', color: '#fff', fontWeight: 700, borderRadius: 16, padding: '4px 16px', fontSize: 15 }}>
                {item.horas}h {item.minutos > 0 ? `${item.minutos}min` : ''}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RankTurnos; 