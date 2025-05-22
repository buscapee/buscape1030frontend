import React, { useContext, useState } from 'react';
import { IoArrowUndo } from "react-icons/io5";
import { FaPlus } from "react-icons/fa";
import { TeamsContext } from '../../context/TeamsContext';
import DpanelTeamsInfo from '../DpanelTeamsInfo/DpanelTeamsInfo';
import { ClassesContext } from '../../context/ClassesContext';
import DpanelTeamsInfoNew from '../DpanelTeamsInfo/DpanelTeamsInfoNew';

const DpanelTeams = () => {
  const { teams, getTeams, setMessage } = useContext(TeamsContext);
  const { Classes } = useContext(ClassesContext);
  const [DpanelTeam, setDpanelTeam] = useState("inicio");
  const [team, setTeam] = useState([]);
  
  const showTeam = () => {
    setDpanelTeam("novo");
    setTeam("");
  }

  const setEditDoc = (team) => {
    setDpanelTeam("Editar");
    setTeam(team);
  }

  return (
    <div className="w-full px-0 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Equipes</h1>
        <button className="text-3xl text-gray-600 hover:text-gray-900 font-bold" onClick={showTeam}>+</button>
      </div>
      <div className="w-full" style={{ background: 'transparent', boxShadow: 'none', borderRadius: 0, padding: 0 }}>
        {DpanelTeam === "inicio" && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center' }}>
            {teams && teams.map((team) => {
              const filteredClasses = Classes.filter(cls => cls.team === team.nameTeams);
              return (
                <div
                  key={team._id}
                  style={{
                    background: '#fff',
                    borderRadius: 12,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                    minWidth: 270,
                    maxWidth: 320,
                    width: '100%',
                    padding: 20,
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 18,
                    cursor: 'pointer',
                    transition: 'box-shadow 0.2s, transform 0.2s',
                    border: '1.5px solid #f1f1f1',
                  }}
                  onClick={() => setEditDoc(team)}
                  onMouseOver={e => { e.currentTarget.style.boxShadow = '0 6px 24px rgba(25, 118, 210, 0.10)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                  onMouseOut={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.07)'; e.currentTarget.style.transform = 'none'; }}
                >
                  <img
                    src={team.emblema || team.emblem || 'https://i.imgur.com/5JYhbtS.png'}
                    alt={team.nameTeams}
                    style={{ width: 54, height: 54, borderRadius: 10, objectFit: 'contain', background: '#f7f7f7', border: '1.5px solid #e0e0e0' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 18, color: '#222', marginBottom: 2 }}>{team.nameTeams}</div>
                    <div style={{ fontSize: 13, color: '#888', fontWeight: 500 }}>
                      <span style={{ marginRight: 12 }}>Aulas: <b>{filteredClasses.length}</b></span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {DpanelTeam === "Editar" && (
          <DpanelTeamsInfo
            getTeams={getTeams}
            team={team}
          />
        )}
        {DpanelTeam === "novo" && (
          <DpanelTeamsInfoNew
            getTeams={getTeams}
            team={team}
          />
        )}
      </div>
    </div>
  );
}

export default DpanelTeams;
