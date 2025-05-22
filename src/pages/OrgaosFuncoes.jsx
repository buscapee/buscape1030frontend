import React, { useContext, useEffect, useState } from 'react';
import { TeamsContext } from '../context/TeamsContext';

const getProfileUser = () => JSON.parse(localStorage.getItem("@Auth:Profile"));

const OrgaosFuncoes = () => {
  const { teams } = useContext(TeamsContext);
  const [profileUser, setProfileUser] = useState(getProfileUser());

  // Atualiza o usuário logado ao trocar de conta (sem precisar atualizar a página)
  useEffect(() => {
    const interval = setInterval(() => {
      const current = getProfileUser();
      if (JSON.stringify(current) !== JSON.stringify(profileUser)) {
        setProfileUser(current);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [profileUser]);

  // Se for Admin, Diretor ou Recursos Humanos, mostra todas as equipes
  const isPrivileged = ["Admin", "Diretor", "Recursos Humanos"].includes(profileUser?.userType);
  const userTeams = isPrivileged
    ? (teams || [])
    : (teams ? teams.filter(team => team.members.some(member => member.nickname === profileUser?.nickname)) : []);

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 32 }}>
      <h2 style={{ textAlign: 'center', margin: '48px 0 32px 0', fontSize: 28, fontWeight: 700, letterSpacing: 0.5 }}>Órgãos e Funções</h2>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, boxShadow: '0 2px 16px rgba(0,0,0,0.04)', borderRadius: 16, background: '#fff' }}>
        {userTeams.length === 0 && (
          <li style={{ color: '#888', fontSize: 18, textAlign: 'center', margin: '48px 0' }}>Você ainda não faz parte de nenhum órgão ou função.</li>
        )}
        {userTeams.map((team) => (
          <li
            key={team._id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 24,
              padding: '22px 32px',
              borderBottom: '1px solid #f0f0f0',
              cursor: 'pointer',
              transition: 'background 0.18s',
            }}
            onClick={() => window.location.href = `/team/${team.url}`}
            onMouseOver={e => { e.currentTarget.style.background = '#f8fafc'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <img
              src={team.emblema || team.emblem}
              alt={team.nameTeams}
              style={{ width: 56, height: 56, borderRadius: 12, objectFit: 'contain', background: '#f7f7f7', border: 'none', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 20, color: '#1e293b', marginBottom: 2 }}>{team.nameTeams}</div>
              <div style={{ fontSize: 14, color: '#64748b', fontWeight: 500 }}>{team.description || 'Órgão/Função do sistema'}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrgaosFuncoes; 