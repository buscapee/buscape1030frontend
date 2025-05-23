import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaStackOverflow } from 'react-icons/fa';
import FormGrupoPermissoes from './FormGrupoPermissoes';

const API_URL = `${import.meta.env.VITE_API_URL || 'https://testebuscapee102030b.onrender.com/api'}/forum-groups`;

const GerenciarGrupos = ({ team }) => {
  const [grupos, setGrupos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editandoGrupo, setEditandoGrupo] = useState(null);
  const [editGrupoData, setEditGrupoData] = useState(null);
  const token = localStorage.getItem('@Auth:Token');

  // Listar grupos do backend
  useEffect(() => {
    const fetchGrupos = async () => {
      try {
        const res = await axios.get(`${API_URL}?team=${encodeURIComponent(team.nameTeams)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setGrupos(res.data);
      } catch (err) {
        setGrupos([]);
      }
    };
    if (team?.nameTeams) fetchGrupos();
  }, [team, token]);

  const handleSalvarGrupo = async (dados) => {
    try {
      const res = await axios.post(API_URL, {
        name: dados.nome,
        team: team.nameTeams,
        permissoes: dados.permissoes,
        status: dados.status
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGrupos([...grupos, res.data]);
      setShowForm(false);
    } catch (err) {}
  };

  const handleEditarGrupo = (id) => {
    const grupo = grupos.find(g => g._id === id);
    setEditandoGrupo(id);
    setEditGrupoData({
      nome: grupo.name,
      permissoes: grupo.permissoes,
      status: grupo.status
    });
  };

  const handleSalvarEdicao = async (dados) => {
    try {
      const res = await axios.put(`${API_URL}/${editandoGrupo}`, {
        name: dados.nome,
        permissoes: dados.permissoes,
        status: dados.status
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGrupos(grupos.map(g => g._id === editandoGrupo ? res.data : g));
      setEditandoGrupo(null);
      setEditGrupoData(null);
    } catch (err) {}
  };

  const handleApagarGrupo = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGrupos(grupos.filter(g => g._id !== id));
    } catch (err) {}
  };

  // Pega cargos do departamento (hierarquia dinâmica)
  const cargosEquipe = Array.isArray(team?.hierarquia) ? team.hierarquia : [];

  return (
    <div style={{
      margin: '0 auto',
      width: '100%',
      maxWidth: 900,
      background: 'transparent',
      boxShadow: 'none',
      border: 'none',
      padding: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      position: 'relative',
      top: '-32px',
    }}>
      {/* Título com ícone */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0 0 0', fontWeight: 700, fontSize: 20, color: '#222' }}>
        <FaStackOverflow style={{ color: '#1976d2', fontSize: 24 }} />
        Gerenciar Grupos/Subfóruns
        <button onClick={() => setShowForm(!showForm)} style={{ background: '#3490ec', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, marginLeft: 18, fontSize: 15 }}>
          <FaPlus /> Adicionar Grupo
        </button>
      </div>
      {showForm && (
        <div style={{ width: '100%', marginTop: 18 }}>
          <FormGrupoPermissoes
            cargos={cargosEquipe}
            onSalvar={handleSalvarGrupo}
            onCancelar={() => setShowForm(false)}
          />
        </div>
      )}
      {editandoGrupo && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.35)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.18)', padding: 32, minWidth: 400, maxWidth: 800, width: 800 }}>
            <FormGrupoPermissoes
              cargos={cargosEquipe}
              onSalvar={handleSalvarEdicao}
              onCancelar={() => { setEditandoGrupo(null); setEditGrupoData(null); }}
              initialData={editGrupoData}
            />
          </div>
        </div>
      )}
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', marginTop: 18, marginBottom: 0, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
        <thead>
          <tr style={{ background: '#f3f3f3', borderBottom: '2px solid #ececec' }}>
            <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 700, color: '#222' }}>#</th>
            <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 700, color: '#222' }}>Nome</th>
            <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 700, color: '#222' }}>Função</th>
            <th style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 700, color: '#222' }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {grupos.map((grupo, idx) => (
            <tr key={grupo._id} style={{ borderBottom: '1px solid #ececec', background: idx % 2 === 0 ? '#fafbfc' : '#fff' }}>
              <td style={{ padding: '12px 8px' }}>{idx + 1}</td>
              <td style={{ padding: '12px 8px' }}>
                <span style={{ fontWeight: 500 }}>{grupo.name}</span>
              </td>
              <td style={{ padding: '12px 8px', color: '#555' }}>{team.nameTeams}</td>
              <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                <button style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 600, cursor: 'pointer', marginRight: 6, fontSize: 14 }}>Ver</button>
                <button onClick={() => handleEditarGrupo(grupo._id)} style={{ background: '#38c172', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 600, cursor: 'pointer', marginRight: 6, fontSize: 14 }}>Editar</button>
                <button onClick={() => handleApagarGrupo(grupo._id)} style={{ background: '#e3342f', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>Apagar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GerenciarGrupos; 