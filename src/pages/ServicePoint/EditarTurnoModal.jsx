import React, { useState } from 'react';
import { FaPlay, FaStop, FaExchangeAlt } from 'react-icons/fa';

const SETORES = [
  'Batalhão',
  'Portador de Direitos',
  'Corredores'
];

function formatarDataInput(data) {
  if (!data) return '';
  const d = new Date(data);
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  const hora = String(d.getHours()).padStart(2, '0');
  const minuto = String(d.getMinutes()).padStart(2, '0');
  return `${ano}-${mes}-${dia}T${hora}:${minuto}`;
}

const EditarTurnoModal = ({ turno, onClose, onSave }) => {
  const [editTurno, setEditTurno] = useState(JSON.parse(JSON.stringify(turno)));
  const [saving, setSaving] = useState(false);

  function handleSetorChange(idx, value) {
    setEditTurno(t => {
      const setores = [...t.setores];
      setores[idx].nome = value;
      return { ...t, setores };
    });
  }
  function handleDataChange(idx, campo, value) {
    setEditTurno(t => {
      const setores = [...t.setores];
      setores[idx][campo] = value;
      return { ...t, setores };
    });
  }
  function handleInicioChange(value) {
    setEditTurno(t => ({ ...t, inicio: value }));
  }
  function handleFimChange(value) {
    setEditTurno(t => ({ ...t, fim: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      // Chame a API de update aqui, envie editTurno
      await onSave(editTurno);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, background: 'rgba(30,32,38,0.18)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 4px 32px #dbe3ee', minWidth: 900, maxWidth: 1100, width: '95%', minHeight: 420, display: 'flex', gap: 24, padding: 0, position: 'relative', overflow: 'hidden' }}>
        {/* Card usuário */}
        <div style={{ minWidth: 220, maxWidth: 240, width: 220, background: '#f7f8fa', borderRight: '1px solid #ececec', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 24 }}>
          <img
            src={`https://www.habbo.com.br/habbo-imaging/avatarimage?img_format=png&user=${editTurno.nickname}&direction=3&head_direction=3&size=m&action=std&headonly=1`}
            alt={editTurno.nickname}
            style={{ width: 64, height: 64, borderRadius: '50%', background: '#fff', border: 'none', marginBottom: 10 }}
          />
          <div style={{ fontWeight: 700, fontSize: 17, color: '#222', marginBottom: 2 }}>{editTurno.nickname}</div>
          <button onClick={onClose} style={{ height: 38, fontSize: 15, borderRadius: 6, fontWeight: 600, boxShadow: '0 1px 4px #e4e4e4', padding: '0 28px', transition: 'background 0.18s', background: '#f3f4f6', color: '#222', border: 'none', width: '100%', marginTop: 24, cursor: 'pointer' }}>Voltar</button>
        </div>
        {/* Formulário de edição */}
        <form onSubmit={handleSubmit} style={{ flex: 1, background: '#fff', borderRadius: 0, padding: 32, boxShadow: 'none', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <h2 style={{ fontWeight: 800, fontSize: 18, marginBottom: 8, color: '#222', letterSpacing: 0.2 }}>Editar Turno</h2>
          {/* Início do turno */}
          <div style={{ background: '#f7f8fa', borderRadius: 8, border: '1px solid #ececec', padding: 14, marginBottom: 6, boxShadow: '0 1px 4px #f2f4f8' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 15, marginBottom: 8, color: '#8a8a8a' }}><FaPlay style={{ color: '#8a8a8a', fontSize: 15 }} /> Começo do Turno</div>
            <label style={{ fontWeight: 500, fontSize: 13, color: '#666', display: 'block', marginBottom: 0 }}>Data
              <input type="datetime-local" value={formatarDataInput(editTurno.inicio)} onChange={e => handleInicioChange(e.target.value)} style={{ marginTop: 6, width: 180, padding: 7, borderRadius: 6, border: '1.2px solid #dbe3ee', fontSize: 14, outline: 'none', transition: 'border 0.2s', boxShadow: 'none' }} required />
            </label>
          </div>
          {/* Setores */}
          {editTurno.setores && editTurno.setores.map((setor, idx) => idx === 0 ? null : (
            <div key={idx} style={{ background: '#f7f8fa', borderRadius: 8, border: '1px solid #ececec', padding: 14, marginBottom: 6, boxShadow: '0 1px 4px #f2f4f8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 15, marginBottom: 8, color: '#8a8a8a' }}><FaExchangeAlt style={{ color: '#8a8a8a', fontSize: 15 }} /> Troca de Setor</div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 500, fontSize: 13, color: '#666', display: 'block' }}>Setor
                    <input type="text" value={setor.nome} onChange={e => handleSetorChange(idx, e.target.value)} style={{ marginTop: 6, width: '100%', padding: 7, borderRadius: 6, border: '1.2px solid #dbe3ee', fontSize: 14, outline: 'none', transition: 'border 0.2s', boxShadow: 'none' }} required />
                  </label>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 500, fontSize: 13, color: '#666', display: 'block' }}>Começo do Setor
                    <input type="datetime-local" value={formatarDataInput(setor.inicio)} onChange={e => handleDataChange(idx, 'inicio', e.target.value)} style={{ marginTop: 6, width: '100%', padding: 7, borderRadius: 6, border: '1.2px solid #dbe3ee', fontSize: 14, outline: 'none', transition: 'border 0.2s', boxShadow: 'none' }} required />
                  </label>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 500, fontSize: 13, color: '#666', display: 'block' }}>Termino do Setor
                    <input type="datetime-local" value={formatarDataInput(setor.fim)} onChange={e => handleDataChange(idx, 'fim', e.target.value)} style={{ marginTop: 6, width: '100%', padding: 7, borderRadius: 6, border: '1.2px solid #dbe3ee', fontSize: 14, outline: 'none', transition: 'border 0.2s', boxShadow: 'none' }} required />
                  </label>
                </div>
              </div>
            </div>
          ))}
          {/* Fim do turno */}
          <div style={{ background: '#f7f8fa', borderRadius: 8, border: '1px solid #ececec', padding: 14, marginBottom: 6, boxShadow: '0 1px 4px #f2f4f8' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 15, marginBottom: 8, color: '#8a8a8a' }}><FaStop style={{ color: '#8a8a8a', fontSize: 15 }} /> Termino do Turno</div>
            <label style={{ fontWeight: 500, fontSize: 13, color: '#666', display: 'block', marginBottom: 0 }}>Data
              <input type="datetime-local" value={formatarDataInput(editTurno.fim)} onChange={e => handleFimChange(e.target.value)} style={{ marginTop: 6, width: 180, padding: 7, borderRadius: 6, border: '1.2px solid #dbe3ee', fontSize: 14, outline: 'none', transition: 'border 0.2s', boxShadow: 'none' }} required />
            </label>
          </div>
          <button type="submit" disabled={saving} style={{ marginTop: 10, background: '#222b3a', color: '#fff', border: 'none', borderRadius: 6, padding: '11px 0', fontWeight: 700, fontSize: 15, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 2px 8px #e4e4e4', transition: 'background 0.2s', width: 180, alignSelf: 'flex-end' }}>
            <span className="fa fa-save" /> Salvar
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditarTurnoModal; 