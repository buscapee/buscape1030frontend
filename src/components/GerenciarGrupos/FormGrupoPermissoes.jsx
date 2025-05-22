import React, { useState, useEffect } from 'react';
import { FaPlus, FaSave } from 'react-icons/fa';

const permissoesPadrao = [
  'Ver',
  'Criar',
  'Responder',
  'Editar',
  'Apagar',
  'Administração',
];

const statusOpcoes = [
  { value: 'Ativado', label: 'Ativado' },
  { value: 'Desativado', label: 'Desativado' },
  { value: 'Oculto', label: 'Oculto' },
];

const FormGrupoPermissoes = ({ cargos = [], onSalvar, onCancelar, initialData }) => {
  const [nome, setNome] = useState('');
  const [permissoes, setPermissoes] = useState({});
  const [status, setStatus] = useState('Ativado');

  useEffect(() => {
    if (initialData) {
      setNome(initialData.nome || '');
      setPermissoes(
        cargos.reduce((acc, cargo) => {
          acc[cargo] = permissoesPadrao.reduce((p, perm) => {
            p[perm] = initialData.permissoes?.[cargo]?.[perm] || false;
            return p;
          }, {});
          return acc;
        }, {})
      );
      setStatus(initialData.status || 'Ativado');
    }
  }, [initialData, cargos]);

  useEffect(() => {
    if (!cargos || cargos.length === 0) return;
    if (Object.keys(permissoes).length === 0) {
      setPermissoes(
        cargos.reduce((acc, cargo) => {
          acc[cargo] = permissoesPadrao.reduce((p, perm) => {
            p[perm] = false;
            return p;
          }, {});
          return acc;
        }, {})
      );
    }
  }, [cargos]);

  const handlePermissaoChange = (cargo, permissao) => {
    setPermissoes(prev => ({
      ...prev,
      [cargo]: {
        ...prev[cargo],
        [permissao]: !prev[cargo][permissao]
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSalvar({ nome, permissoes, status });
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.04)', border: '1.2px solid #ececec', padding: 24, marginTop: 18, maxWidth: 900, marginLeft: 'auto', marginRight: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}>
        <FaPlus style={{ marginRight: 8, fontSize: 20 }} />
        <h2 style={{ fontWeight: 700, fontSize: 22, margin: 0 }}>Adicionar Grupo</h2>
      </div>
      <div style={{ marginBottom: 18 }}>
        <input
          type="text"
          placeholder="Digite o nick do usuário"
          value={nome}
          onChange={e => setNome(e.target.value)}
          style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 16 }}
        />
      </div>
      {(!cargos || cargos.length === 0) ? (
        <div style={{ color: '#b00', marginBottom: 18, fontWeight: 600 }}>Nenhum cargo cadastrado neste departamento.</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', marginBottom: 18 }}>
          <thead>
            <tr style={{ background: '#f3f3f3' }}>
              <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: 700 }}>Permissões</th>
              {permissoesPadrao.map(perm => (
                <th key={perm} style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 700 }}>{perm}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cargos.map(cargo => (
              <tr key={cargo} style={{ borderBottom: '1px solid #ececec' }}>
                <td style={{ padding: '10px 8px', fontWeight: 600 }}>{cargo}</td>
                {permissoesPadrao.map(perm => (
                  <td key={perm} style={{ padding: '10px 8px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={permissoes[cargo]?.[perm] || false}
                      onChange={() => handlePermissaoChange(cargo, perm)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div style={{ marginBottom: 18 }}>
        <label style={{ fontWeight: 600, marginRight: 12 }}>Status</label>
        <select value={status} onChange={e => setStatus(e.target.value)} style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', fontSize: 16 }}>
          {statusOpcoes.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div style={{ fontSize: 13, color: '#555', marginBottom: 18 }}>
        No <b>Desativado</b> somente a liderança pode acessar o grupo, já no <b>Oculto</b> ninguém pode acessar.<br />
        Para outras configurações, você deve entrar em configuração do grupo. Após criar irá aparecer um botão na mensagem.
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
        <button type="submit" style={{ background: '#3490ec', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 28px', fontWeight: 600, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
          <FaSave /> Salvar
        </button>
        {onCancelar && (
          <button type="button" onClick={onCancelar} style={{ background: '#eee', color: '#333', border: 'none', borderRadius: 6, padding: '10px 28px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>Cancelar</button>
        )}
      </div>
    </form>
  );
};

export default FormGrupoPermissoes; 