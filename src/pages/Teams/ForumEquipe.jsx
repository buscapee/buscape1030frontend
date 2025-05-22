import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { FaUser, FaClock, FaEye, FaTrash, FaEdit, FaUsers } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import JoditEditor from 'jodit-react';
import axios from 'axios';

const ForumEquipe = ({ team }) => {
  // 1. Todos os hooks de estado devem ser declarados primeiro, na mesma ordem sempre
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subforuns, setSubforuns] = useState([]);
  const [grupoSelecionado, setGrupoSelecionado] = useState(null);
  const [topicoAberto, setTopicoAberto] = useState(null);
  const [topicosGrupo, setTopicosGrupo] = useState([]);
  const [loadingTopicos, setLoadingTopicos] = useState(false);
  const [respostas, setRespostas] = useState([]);
  const [loadingRespostas, setLoadingRespostas] = useState(false);
  const [refreshSubforuns, setRefreshSubforuns] = useState(0);
  const [showNovoTopico, setShowNovoTopico] = useState(false);
  const [showResponderBox, setShowResponderBox] = useState(false);
  const [menuAberto, setMenuAberto] = useState(null);
  const [editandoResposta, setEditandoResposta] = useState(null);
  const [editandoTopico, setEditandoTopico] = useState(null);
  const [confirmarExclusao, setConfirmarExclusao] = useState({ aberto: false, id: null });
  const [tituloNovoTopico, setTituloNovoTopico] = useState('');
  const [corpoNovoTopico, setCorpoNovoTopico] = useState('');
  const [imagemNovoTopico, setImagemNovoTopico] = useState('');
  const [tituloResp, setTituloResp] = useState('');
  const [corpoResp, setCorpoResp] = useState('');
  const [imagemResp, setImagemResp] = useState('');
  const [textoEdicao, setTextoEdicao] = useState('');
  const [tituloEdicaoTopico, setTituloEdicaoTopico] = useState('');
  const [corpoEdicaoTopico, setCorpoEdicaoTopico] = useState('');
  const [imagemEdicaoTopico, setImagemEdicaoTopico] = useState('');
  const [loadingEdicaoTopico, setLoadingEdicaoTopico] = useState(false);
  const [showResponder, setShowResponder] = useState(false);
  const [refreshRespostas, setRefreshRespostas] = useState(0);
  const [grupoEditando, setGrupoEditando] = useState(null);
  const [formGrupo, setFormGrupo] = useState({
    name: '',
    permissoes: {},
    status: 'Ativado',
    // Adicione outros campos necessários
  });

  // 2. Hooks de ref
  const editor = useRef(null);

  // 3. Hooks de memoização
  const token = useMemo(() => localStorage.getItem('@Auth:Token'), []);
  const user = useMemo(() => JSON.parse(localStorage.getItem("@Auth:ProfileUser")), []);
  
  const grupoSelecionadoObj = useMemo(() => {
    if (!grupoSelecionado || !Array.isArray(subforuns)) return null;
    return subforuns.find(sub => sub._id === grupoSelecionado) || null;
  }, [grupoSelecionado, subforuns]);

  const config = useMemo(() => ({
    readonly: false,
    placeholder: 'Digite sua resposta... ',
    height: 300,
    width: '100%',
    minHeight: 200,
    style: { minHeight: 200, width: '100%' },
    toolbarAdaptive: false,
    toolbarSticky: false,
    buttons: [
      'bold', 'italic', 'underline', 'strikethrough', '|',
      'ul', 'ol', '|',
      'outdent', 'indent', '|',
      'font', 'fontsize', 'brush', 'paragraph', '|',
      'image', 'table', 'link', '|',
      'align', 'undo', 'redo', '|',
      'hr', 'eraser', 'copyformat', 'fullsize', 'selectall', 'print'
    ],
    askBeforePasteHTML: false,
    askBeforePasteFromWord: false,
    defaultActionOnPaste: 'insert_as_html',
    uploader: { insertImageAsBase64URI: true },
    showCharsCounter: true,
    showWordsCounter: true,
    showXPathInStatusbar: false,
  }), []);

  // 4. Hooks de callback
  const verificarPermissaoGrupo = useCallback((grupoId, permissao) => {
    if (!user || !team) return false;
    
    const isAdmin = user.userType === 'Admin';
    const isDiretor = user.userType === 'Diretor';
    const isLider = user.nickname === team.leader;
    const isViceLider = user.nickname === team.viceLeader;
    
    if (isAdmin || isDiretor || isLider || isViceLider) return true;
    
    const grupo = subforuns.find(sub => sub._id === grupoId);
    if (!grupo || !grupo.permissoes) return false;
    
    const membroEquipe = team.members?.find(m => m.nickname === user.nickname);
    const cargoInterno = membroEquipe?.office || (isLider ? 'Líder' : isViceLider ? 'Vice-Líder' : null);
    if (!cargoInterno) return false;
    
    const permissoesCargo = grupo.permissoes[cargoInterno];
    return !!permissoesCargo?.[permissao];
  }, [user, team, subforuns]);

  const podeVerGrupo = useCallback((grupoId) => verificarPermissaoGrupo(grupoId, 'Ver'), [verificarPermissaoGrupo]);

  // 6. Verificações de permissões (usando valores memoizados)
  const verificarPermissoes = useMemo(() => {
    if (!user || !team) return { podeVer: false, podeCriar: false, podeResponder: false, podeEditar: false, podeApagar: false };
    
    const isAdmin = user.userType === 'Admin';
    const isDiretor = user.userType === 'Diretor';
    const isLider = user.nickname === team.leader;
    const isViceLider = user.nickname === team.viceLeader;
    const membroEquipe = team.members?.find(m => m.nickname === user.nickname);
    const cargoInterno = membroEquipe?.office || (isLider ? 'Líder' : isViceLider ? 'Vice-Líder' : null);

    return {
      podeVer: true,
      podeCriar: isAdmin || isDiretor || isLider || isViceLider || (cargoInterno && grupoSelecionadoObj?.permissoes?.[cargoInterno]?.Criar),
      podeResponder: isAdmin || isDiretor || isLider || isViceLider || (cargoInterno && grupoSelecionadoObj?.permissoes?.[cargoInterno]?.Responder),
      podeEditar: isAdmin || isDiretor || isLider || isViceLider || (cargoInterno && grupoSelecionadoObj?.permissoes?.[cargoInterno]?.Editar),
      podeApagar: isAdmin || isDiretor || isLider || isViceLider || (cargoInterno && grupoSelecionadoObj?.permissoes?.[cargoInterno]?.Apagar),
      podeAdministrar: isAdmin || isDiretor || isLider || isViceLider || (cargoInterno && grupoSelecionadoObj?.permissoes?.[cargoInterno]?.Administração)
    };
  }, [user, team, grupoSelecionadoObj]);

  // 7. Valores derivados das permissões
  const { podeCriar, podeResponder, podeEditar, podeApagar, podeAdministrar } = verificarPermissoes;

  // 8. Funções de manipulação
  const handleSalvarNovoTopico = useCallback(async (e) => {
    e.preventDefault();
    if (!tituloNovoTopico || !corpoNovoTopico) return;
    if (!grupoSelecionadoObj || !grupoSelecionadoObj._id) return;
    try {
      const res = await axios.post('http://localhost:3000/api/forum-topics', {
        forumGroupId: grupoSelecionadoObj._id,
        title: tituloNovoTopico,
        body: corpoNovoTopico,
        image: imagemNovoTopico
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTituloNovoTopico('');
      setCorpoNovoTopico('');
      setImagemNovoTopico('');
      setShowNovoTopico(false);
      setTopicosGrupo(prev => [res.data, ...prev]);
    } catch (err) {
      console.error('Erro ao criar tópico:', err);
      alert('Erro ao criar tópico: ' + (err?.response?.data?.error || err.message));
    }
  }, [grupoSelecionadoObj, tituloNovoTopico, corpoNovoTopico, imagemNovoTopico, token]);

  const handleResponderTopico = useCallback(async (e, topicoId) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/forum-replies', {
        topicId: topicoId,
        body: corpoResp,
        image: imagemResp
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCorpoResp('');
      setImagemResp('');
      setShowResponderBox(false);
      setRefreshRespostas(prev => prev + 1);
    } catch (err) {
      console.error('Erro ao enviar resposta:', err);
      alert('Erro ao enviar resposta: ' + (err?.response?.data?.error || err.message));
    }
  }, [corpoResp, imagemResp, token]);

  const handleSalvarEdicaoResposta = useCallback(async (respostaId, novoTexto) => {
    setLoadingRespostas(true);
    try {
      await axios.put(`http://localhost:3000/api/forum-replies/${respostaId}`, {
        body: novoTexto
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRefreshSubforuns(prev => prev + 1);
    } catch (err) {
      console.error('Erro ao editar resposta:', err);
      alert('Erro ao editar resposta: ' + (err?.response?.data?.error || err.message));
    } finally {
      setLoadingRespostas(false);
    }
  }, [token]);

  const handleApagarResposta = useCallback(async (respostaId) => {
    setLoadingRespostas(true);
    try {
      await axios.delete(`http://localhost:3000/api/forum-replies/${respostaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRefreshSubforuns(prev => prev + 1);
    } catch (err) {
      console.error('Erro ao apagar resposta:', err);
      alert('Erro ao apagar resposta: ' + (err?.response?.data?.error || err.message));
    } finally {
      setLoadingRespostas(false);
    }
  }, [token]);

  const abrirConfirmacaoExclusao = useCallback((id) => {
    setConfirmarExclusao({ aberto: true, id });
    setMenuAberto(null);
  }, []);

  const fecharConfirmacaoExclusao = useCallback(() => {
    setConfirmarExclusao({ aberto: false, id: null });
  }, []);

  // 9. Callbacks que dependem das permissões
  const podeEditarTopico = useCallback((topico) => {
    if (!topico) return false;
    if (podeEditar || podeAdministrar) return true;
    return user?.nickname === topico.author;
  }, [podeEditar, podeAdministrar, user]);

  const podeApagarTopico = useCallback((topico) => {
    if (!topico) return false;
    if (podeApagar || podeAdministrar) return true;
    return user?.nickname === topico.author;
  }, [podeApagar, podeAdministrar, user]);

  const podeEditarResposta = useCallback((resposta) => {
    if (!resposta) return false;
    if (podeEditar || podeAdministrar) return true;
    return user?.nickname === resposta.author;
  }, [podeEditar, podeAdministrar, user]);

  const podeApagarResposta = useCallback((resposta) => {
    if (!resposta) return false;
    if (podeApagar || podeAdministrar) return true;
    return user?.nickname === resposta.author;
  }, [podeApagar, podeAdministrar, user]);

  // 5. Hooks de efeito
  useEffect(() => {
    if (!team || !team.nameTeams) {
      setError('Equipe não encontrada');
      setIsLoading(false);
      return;
    }
    setIsLoading(false);
  }, [team]);

  useEffect(() => {
    const fetchSubforuns = async () => {
      if (!team?.nameTeams) return;
      if (subforuns.length === 0) setIsLoading(true);
      setError(null);
      try {
        const res = await axios.get(`http://localhost:3000/api/forum-groups?team=${encodeURIComponent(team.nameTeams)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
        setSubforuns(res.data);
      } catch (err) {
        console.error('Erro ao buscar subfóruns:', err);
        setError('Não foi possível carregar os subfóruns. Por favor, tente novamente.');
        setSubforuns([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubforuns();
  }, [team, token, refreshSubforuns]);

  useEffect(() => {
    const fetchTopicos = async () => {
      if (!grupoSelecionadoObj?._id) {
        setTopicosGrupo([]);
        return;
      }

      setLoadingTopicos(true);
      try {
        const res = await axios.get(`http://localhost:3000/api/forum-topics?forumGroupId=${grupoSelecionadoObj._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
        
        const topicos = res.data;
        const topicosComRespostas = await Promise.all(topicos.map(async (topico) => {
          let totalRespostas = 0;
          let lastUser = null;
          let lastDate = null;
          
          try {
            const respCount = await axios.get(`http://localhost:3000/api/forum-replies/count?topicId=${topico._id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            totalRespostas = respCount.data.count || 0;
          } catch (err) {
            console.error('Erro ao contar respostas:', err);
          }

          try {
            const respLast = await axios.get(`http://localhost:3000/api/forum-replies?topicId=${topico._id}&_sort=createdAt:desc&_limit=1`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (Array.isArray(respLast.data) && respLast.data.length > 0) {
              lastUser = respLast.data[0].author;
              lastDate = new Date(respLast.data[0].createdAt).toLocaleString('pt-BR');
            }
          } catch (err) {
            console.error('Erro ao buscar última resposta:', err);
          }

          return { ...topico, totalRespostas, lastUser, lastDate };
        }));

        setTopicosGrupo(topicosComRespostas);
      } catch (err) {
        console.error('Erro ao buscar tópicos:', err);
        setTopicosGrupo([]);
      } finally {
        setLoadingTopicos(false);
      }
    };

    fetchTopicos();
  }, [grupoSelecionadoObj, token, refreshSubforuns]);

  useEffect(() => {
    const fetchRespostas = async () => {
      if (
        grupoSelecionado === null ||
        topicoAberto === null ||
        !topicosGrupo[topicoAberto]?._id
      ) {
        setRespostas([]);
        setLoadingRespostas(false);
        return;
      }
      setLoadingRespostas(true);
      try {
        const res = await axios.get(
          `http://localhost:3000/api/forum-replies?topicId=${topicosGrupo[topicoAberto]._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setRespostas(res.data);
      } catch (err) {
        console.error('Erro ao buscar respostas:', err);
        setRespostas([]);
      } finally {
        setLoadingRespostas(false);
      }
    };
    fetchRespostas();
  }, [grupoSelecionado, topicoAberto, token, topicosGrupo[topicoAberto]?._id, refreshRespostas]);

  // 9. Renderização condicional inicial
  if (isLoading) {
    return (
      <div style={{ 
        padding: 32, 
        textAlign: 'center', 
        color: '#555',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16
      }}>
        <div>Carregando informações do fórum...</div>
        <div style={{ width: 40, height: 40, border: '3px solid #f3f3f3', borderTop: '3px solid #1976d2', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
            </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: 32, 
        textAlign: 'center', 
        color: '#d32f2f',
        background: '#ffebee',
        borderRadius: 8,
        margin: 16
      }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Erro ao carregar o fórum</div>
        <div>{error}</div>
              </div>
    );
  }

  if (!team || !team.nameTeams) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: '#555' }}>
        Carregando informações do centro...
      </div>
    );
  }

  // Obter sigla da equipe (ex: 'CI', 'CS', 'CT')
  const sigla = team?.sigla || (team?.nameTeams?.match(/\b([A-Z]{2,})\b/)?.[1]) || 'CI';

  // Adicione esta constante logo após a definição do componente:
  const imagemDepartamento = team?.image || "https://i.imgur.com/5JYhbtS.png";

  // Tabela inicial de subfóruns
  if (grupoSelecionado === null) {
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
        {/* Título Sub-Fóruns */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0 0 0', fontWeight: 700, fontSize: 20, color: '#222' }}>
          <FaUsers style={{ fontSize: 22, color: '#6c3483' }} /> Sub-Fóruns
              </div>
        {/* Tabela dos subfóruns */}
        <div style={{ width: '100%', marginTop: 18, background: '#fff', borderRadius: 6, boxShadow: '0 1px 6px rgba(0,0,0,0.04)', border: '1px solid #e0e0e0', padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15, background: '#fff', borderRadius: 6, overflow: 'hidden' }}>
            <thead>
              <tr style={{ background: '#f6f8fa' }}>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 700, fontSize: 15, width: 60 }}></th>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 700, fontSize: 15 }}>Nome</th>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 700, fontSize: 15 }}>Última Resposta</th>
                <th style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 700, fontSize: 15, width: 90 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {subforuns.filter(sub => podeVerGrupo(sub._id)).map((sub) => (
                <tr key={sub._id} style={{ borderBottom: '1px solid #ececec', background: '#fff', transition: 'background 0.2s' }}>
                  <td style={{ padding: '10px 8px' }}>
                    <img src={imagemDepartamento} alt="icon" style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #e0e0e0', background: '#f5f5f5' }} />
                  </td>
                  <td style={{ padding: '10px 8px', fontWeight: 500, color: '#222', fontSize: 15 }}>{sub.name}</td>
                  <td style={{ padding: '10px 8px', color: '#222', fontSize: 15 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <FaUser style={{ color: '#1976d2', fontSize: 15 }} />
                      <span style={{ fontWeight: 600 }}>{sub.lastUser || team.nameTeams}</span>
                </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#666', fontSize: 14 }}>
                      <FaClock style={{ color: '#1976d2', fontSize: 14 }} />
                      <span>{sub.lastDate || '---'}</span>
            </div>
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                    <button style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 18px', cursor: 'pointer', fontWeight: 600, fontSize: 15, display: 'flex', alignItems: 'center', gap: 6, boxShadow: 'none' }}
                      onClick={() => {
                        if (podeVerGrupo(sub._id)) {
                          setGrupoSelecionado(sub._id);
                          setTopicoAberto(null);
                        } else {
                          alert('Você não tem permissão para acessar este grupo.');
                        }
                      }}
                    >
                      <FaEye /> Ver
                  </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
            </div>
        </div>
      );
    }

  // Página de tópicos do subfórum
  if (grupoSelecionadoObj && grupoSelecionado !== null && topicoAberto === null) {
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
        {/* Título do subfórum */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0 0 0', fontWeight: 700, fontSize: 20, color: '#222' }}>
          <img src={imagemDepartamento} alt={grupoSelecionadoObj.name} style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #e0e0e0', background: '#f5f5f5' }} />
          {grupoSelecionadoObj.name}
        </div>
        {/* Botão Novo Tópico */}
        {podeCriar && (
          <div style={{ margin: '18px 0 0 0', background: '#f6f8fa', borderRadius: 4, textAlign: 'center', fontWeight: 500, color: '#444', padding: 10, fontSize: 16, cursor: 'pointer', userSelect: 'none', width: '100%' }}
            onClick={() => setShowNovoTopico(!showNovoTopico)}
          >
          Novo Tópico
        </div>
        )}
        {showNovoTopico && (
          <form style={{ margin: '24px 0 0 0', background: '#f8f8f8', borderRadius: 6, border: '1px solid #e0e0e0', padding: 18, width: '100%' }} onSubmit={handleSalvarNovoTopico}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 500 }}>Título</label>
              <input type="text" value={tituloNovoTopico} onChange={e => setTituloNovoTopico(e.target.value)} placeholder="Digite o título do tópico" style={{ width: '100%', marginTop: 4, marginBottom: 12, padding: 8, borderRadius: 4, border: '1px solid #ccc', fontSize: 15 }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 500 }}>Mensagem</label>
              <JoditEditor
                value={corpoNovoTopico}
                config={config}
                tabIndex={1}
                onBlur={setCorpoNovoTopico}
                onChange={setCorpoNovoTopico}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 500 }}>Imagem em Destaque</label>
              <input type="text" value={imagemNovoTopico} onChange={e => setImagemNovoTopico(e.target.value)} placeholder="Cole o LINK da imagem, não do álbum" style={{ width: '100%', marginTop: 4, marginBottom: 4, padding: 8, borderRadius: 4, border: '1px solid #ccc', fontSize: 15 }} />
              <div style={{ fontSize: 12, color: '#888' }}>As imagens sempre terminam com .png/.gif/.jpg, etc.</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 28px', fontWeight: 600, fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}>
                Salvar
              </button>
            </div>
          </form>
        )}
        {/* Lista de tópicos do subfórum */}
        <div style={{ width: '100%', marginTop: 24, background: '#fff', borderRadius: 6, boxShadow: '0 1px 6px rgba(0,0,0,0.04)', border: '1px solid #e0e0e0', padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15, background: '#fff', borderRadius: 6, overflow: 'hidden' }}>
            <thead>
              <tr style={{ background: '#f6f8fa' }}>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 700 }}>Nome</th>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 700 }}>Respostas</th>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 700 }}>Última Resposta</th>
                <th style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 700 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {topicosGrupo.map((topico, idx) => (
                editandoTopico === idx ? (
                  <tr key={topico._id} style={{ background: '#fff' }}>
                    <td colSpan={4} style={{ padding: 0 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', width: '100%', padding: 0, margin: 0 }}>
                        <div style={{ display: 'flex', gap: 16, width: '100%', padding: 24, boxSizing: 'border-box' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <input
                              type="text"
                              value={tituloEdicaoTopico}
                              onChange={e => setTituloEdicaoTopico(e.target.value)}
                              style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc', fontSize: 17, marginBottom: 12, fontWeight: 600 }}
                              placeholder="Título do tópico"
                            />
                            <div style={{ marginBottom: 16 }}>
                              <label style={{ fontWeight: 500 }}>Mensagem</label>
                              <JoditEditor
                                value={corpoEdicaoTopico}
                                config={config}
                                tabIndex={1}
                                onBlur={setCorpoEdicaoTopico}
                                onChange={setCorpoEdicaoTopico}
                              />
                            </div>
                            <div style={{ marginBottom: 16 }}>
                              <label style={{ fontWeight: 500 }}>Imagem em Destaque</label>
                              <input type="text" value={imagemEdicaoTopico} onChange={e => setImagemEdicaoTopico(e.target.value)} placeholder="Cole o LINK da imagem, não do álbum" style={{ width: '100%', marginTop: 4, marginBottom: 4, padding: 8, borderRadius: 4, border: '1px solid #ccc', fontSize: 15 }} />
                              <div style={{ fontSize: 12, color: '#888' }}>As imagens sempre terminam com .png/.gif/.jpg, etc.</div>
                            </div>
                            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                              <button
                                style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 28px', fontWeight: 600, fontSize: 15 }}
                                disabled={loadingEdicaoTopico}
                                onClick={async () => {
                                  if (!grupoSelecionadoObj || !grupoSelecionadoObj._id) return;
                                  setLoadingEdicaoTopico(true);
                                  try {
                                    await axios.put(`http://localhost:3000/api/forum-topics/${topico._id}`, {
                                      title: tituloEdicaoTopico,
                                      body: corpoEdicaoTopico,
                                      image: imagemEdicaoTopico
                                    }, {
                                      headers: { Authorization: `Bearer ${token}` }
                                    });
                                    // Atualizar lista
                                    const res = await axios.get(`http://localhost:3000/api/forum-topics?forumGroupId=${grupoSelecionadoObj._id}`, {
                                      headers: { Authorization: `Bearer ${token}` }
                                    });
                                    const topicos = res.data;
                                    const topicosComRespostas = await Promise.all(topicos.map(async (topico) => {
                                      let totalRespostas = 0;
                                      let lastUser = null;
                                      let lastDate = null;
                                      try {
                                        // Buscar contagem
                                        const respCount = await axios.get(`http://localhost:3000/api/forum-replies/count?topicId=${topico._id}`, {
                                          headers: { Authorization: `Bearer ${token}` }
                                        });
                                        totalRespostas = respCount.data.count || 0;
                                      } catch {}
                                      try {
                                        // Buscar última resposta
                                        const respLast = await axios.get(`http://localhost:3000/api/forum-replies?topicId=${topico._id}&_sort=createdAt:desc&_limit=1`, {
                                          headers: { Authorization: `Bearer ${token}` }
                                        });
                                        if (Array.isArray(respLast.data) && respLast.data.length > 0) {
                                          lastUser = respLast.data[0].author;
                                          lastDate = new Date(respLast.data[0].createdAt).toLocaleString('pt-BR');
                                        }
                                      } catch {}
                                      return { ...topico, totalRespostas, lastUser, lastDate };
                                    }));
                                    setTopicosGrupo(topicosComRespostas);
                                    setEditandoTopico(null);
                                  } catch (err) {
                                    alert('Erro ao editar tópico: ' + (err?.response?.data?.error || err.message));
                                  } finally {
                                    setLoadingEdicaoTopico(false);
                                  }
                                }}
                              >Salvar</button>
                              <button
                                style={{ background: '#e0e0e0', color: '#222', border: 'none', borderRadius: 4, padding: '8px 28px', fontWeight: 600, fontSize: 15 }}
                                onClick={() => setEditandoTopico(null)}
                              >Cancelar</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={topico._id} style={{ borderBottom: '1px solid #ececec', background: '#fff' }}>
                    <td style={{ padding: '12px 8px', fontWeight: 500 }}>{topico.title}</td>
                    <td style={{ padding: '12px 8px' }}>{topico.totalRespostas || 0} resposta{(topico.totalRespostas === 1) ? '' : 's'}</td>
                  <td style={{ padding: '12px 8px' }}>
                      {topico.lastUser && topico.lastDate ? (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                            <FaUser style={{ color: '#1976d2', fontSize: 15 }} />
                            <span style={{ fontWeight: 600 }}>{topico.lastUser}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#666', fontSize: 14 }}>
                            <FaClock style={{ color: '#1976d2', fontSize: 14 }} />
                            <span>{topico.lastDate}</span>
                          </div>
                      </>
                    ) : (
                        <span style={{ color: '#888' }}>Nenhuma Resposta</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                      <button style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '7px 22px', cursor: 'pointer', fontWeight: 600, fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}
                        onClick={() => setTopicoAberto(idx)}
                      >
                        <FaEye /> Ver
                      </button>
                        {(podeEditarTopico(topico) || podeApagarTopico(topico)) && (
                          <button style={{ background: '#2e7d32', color: '#fff', border: 'none', borderRadius: 4, padding: '7px 18px', cursor: 'pointer', fontWeight: 600, fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}
                            onClick={() => {
                              setEditandoTopico(idx);
                              setTituloEdicaoTopico(topico.title);
                              setCorpoEdicaoTopico(topico.body);
                              setImagemEdicaoTopico(topico.image || '');
                            }}
                          >
                            <FaEdit style={{ marginRight: 4 }} /> Editar
                          </button>
                        )}
                        {(podeApagarTopico(topico)) && (
                      <button style={{ background: '#d32f2f', color: '#fff', border: 'none', borderRadius: 4, padding: '7px 18px', cursor: 'pointer', fontWeight: 600, fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}
                        onClick={() => handleExcluirTopico(idx)}
                      >
                        <MdDelete style={{ marginRight: 4 }} /> Excluir
                      </button>
                        )}
                    </div>
                  </td>
                </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
        <button
          style={{ background: '#06113C', color: '#fff', border: 'none', borderRadius: 4, padding: '10px 28px', fontWeight: 600, fontSize: 15, margin: '32px 32px', cursor: 'pointer' }}
          onClick={() => setGrupoSelecionado(null)}
        >
          Voltar
        </button>
      </div>
    );
  }

  // Adicionar fallback defensivo para caso grupoSelecionadoObj seja undefined
  if (grupoSelecionado !== null && !grupoSelecionadoObj) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: '#b00', fontWeight: 600 }}>
        Erro: Grupo não encontrado ou não disponível.
        <br />
        <button style={{ marginTop: 24, background: '#06113C', color: '#fff', border: 'none', borderRadius: 4, padding: '10px 28px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }} onClick={() => setGrupoSelecionado(null)}>Voltar</button>
      </div>
    );
  }

  // Página de respostas do tópico
  if (grupoSelecionado !== null && topicoAberto !== null) {
    const topico = topicosGrupo[topicoAberto];
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
        {/* Título do tópico */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0 0 0', fontWeight: 700, fontSize: 20, color: '#222' }}>
          <img src={imagemDepartamento} alt={topico.title} style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #e0e0e0', background: '#f5f5f5' }} />
          {topico.title}
        </div>
        {/* Bloco do tópico */}
        <div style={{ width: '100%', marginTop: 18, background: '#fff', borderRadius: 6, boxShadow: '0 1px 6px rgba(0,0,0,0.04)', border: '1px solid #e0e0e0', padding: 0 }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #ececec' }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: '#222' }}>
              {topico.title} <span style={{ color: '#888', fontWeight: 400, fontSize: 13 }}>{topico.createdAt ? new Date(topico.createdAt).toLocaleString('pt-BR') : ''}</span>
        </div>
            <div style={{ color: '#222', fontSize: 14, marginBottom: 8 }} dangerouslySetInnerHTML={{ __html: topico.body }} />
          </div>
        </div>
        {/* Botão Responder */}
        <div style={{ width: '100%' }}>
          <button
            style={{ width: '100%', background: '#f6f8fa', color: '#222', border: 'none', borderRadius: 4, padding: '10px 0', fontWeight: 600, fontSize: 15, margin: '18px 0 0 0', cursor: 'pointer' }}
            onClick={() => setShowResponderBox(!showResponderBox)}
            disabled={!podeResponder}
          >
            Responder
          </button>
        </div>
        {/* Caixa de digitação só aparece se showResponderBox for true */}
        {showResponderBox && (
          <form onSubmit={e => { handleResponderTopico(e, topico._id); setShowResponderBox(false); }} style={{ margin: '18px 0 0 0', background: '#f8f8f8', borderRadius: 6, border: '1px solid #e0e0e0', padding: 18, width: '100%' }}>
              <JoditEditor
              ref={editor}
              value={corpoResp}
                config={config}
                tabIndex={1}
              onBlur={setCorpoResp}
              onChange={setCorpoResp}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button type="submit" style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 28px', fontWeight: 600, fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}>
                Enviar Resposta
              </button>
              <button type="button" style={{ background: '#e0e0e0', color: '#222', border: 'none', borderRadius: 4, padding: '8px 28px', fontWeight: 600, fontSize: 15 }} onClick={() => setShowResponderBox(false)}>
                Cancelar
              </button>
            </div>
          </form>
        )}
        {/* Lista de respostas salvas */}
        <div style={{ width: '100%', marginTop: 24, background: '#fff', borderRadius: 6, boxShadow: '0 1px 6px rgba(0,0,0,0.04)', border: '1px solid #e0e0e0', padding: 0 }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #ececec', fontWeight: 700, fontSize: 16, color: '#222' }}>Respostas</div>
          <div style={{ padding: '18px 24px' }}>
            {loadingRespostas ? (
              <div>Carregando respostas...</div>
            ) : respostas.length > 0 ? (
              respostas.map((resp, idx) => (
                <div key={resp._id} style={{ background: '#fafbfc', border: '1px solid #e0e0e0', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: 18, marginBottom: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <img src={`https://www.habbo.com.br/habbo-imaging/avatarimage?img_format=png&user=${resp.author || 'Desconhecido'}&direction=3&head_direction=3&size=m&action=std`} alt={resp.author || 'avatar'} style={{ width: 40, height: 40, borderRadius: 6, border: '1px solid #e0e0e0', background: '#f5f5f5', marginTop: 2 }} />
                      <span style={{ fontWeight: 700 }}>{resp.author || 'Desconhecido'}</span>
                      <span style={{ color: '#888', fontSize: 13, marginLeft: 8 }}>{resp.createdAt ? new Date(resp.createdAt).toLocaleString('pt-BR') : ''}</span>
                    </div>
                    {(podeEditarResposta(resp) || podeApagarResposta(resp)) && (
                      <div style={{ cursor: 'pointer', fontSize: 20, color: '#888', position: 'relative' }} onClick={() => setMenuAberto(menuAberto === idx ? null : idx)}>
                        &#8942;
                        {menuAberto === idx && (
                          <div style={{ position: 'absolute', top: 28, right: 0, background: '#fff', border: '1px solid #ececec', borderRadius: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', zIndex: 10, minWidth: 90, padding: '4px 0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', cursor: 'pointer', color: '#2e7d32', fontWeight: 500, fontSize: 15 }} onClick={() => { setEditandoResposta(idx); setTextoEdicao(resp.body); setMenuAberto(null); }}>
                              <FaEdit style={{ color: '#2e7d32', fontSize: 16 }} /> Editar
                          </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', cursor: 'pointer', color: '#d32f2f', fontWeight: 500, fontSize: 15 }} onClick={() => handleApagarResposta(resp._id)}>
                              <MdDelete style={{ color: '#d32f2f', fontSize: 16 }} /> Apagar
                          </div>
                        </div>
                      )}
                    </div>
                    )}
                  </div>
                  <hr style={{ border: 0, borderTop: '1px solid #ececec', margin: '6px 0 10px 0' }} />
                  {editandoResposta === idx ? (
                    <div style={{ marginBottom: 8 }}>
                      <JoditEditor
                        value={textoEdicao}
                        config={config}
                        tabIndex={1}
                        onBlur={setTextoEdicao}
                        onChange={setTextoEdicao}
                      />
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <button onClick={async () => {
                          await handleSalvarEdicaoResposta(resp._id, textoEdicao);
                          setEditandoResposta(null);
                          setTextoEdicao('');
                        }} style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 18px', fontWeight: 600, fontSize: 15 }}>Salvar</button>
                        <button onClick={() => { setEditandoResposta(null); setTextoEdicao(''); }} style={{ background: '#e0e0e0', color: '#222', border: 'none', borderRadius: 4, padding: '6px 18px', fontWeight: 600, fontSize: 15 }}>Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ color: '#222', fontSize: 15, marginBottom: 2 }} dangerouslySetInnerHTML={{ __html: resp.body }} />
                  )}
                  {resp.image && <img src={resp.image} alt="imagem" style={{ maxWidth: 200, margin: '8px 0', borderRadius: 6 }} />}
                  </div>
              ))
            ) : (
              <div style={{ color: '#888', fontStyle: 'italic' }}>Nenhuma resposta ainda.</div>
            )}
          </div>
        </div>
        <button
          style={{ background: '#06113C', color: '#fff', border: 'none', borderRadius: 4, padding: '10px 28px', fontWeight: 600, fontSize: 15, margin: '24px 0 0 0', cursor: 'pointer' }}
          onClick={() => setTopicoAberto(null)}
        >
          Voltar
        </button>
      </div>
    );
  }

  // Renderização da lista de subfóruns
  if (grupoEditando) {
    // Formulário de edição de grupo/subfórum
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1.2px solid #ececec', padding: 32 }}>
        <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18 }}>Editar Grupo/Subfórum</h2>
        <form onSubmit={async e => {
          e.preventDefault();
          try {
            await axios.put(`http://localhost:3000/api/forum-groups/${grupoEditando._id}`, formGrupo, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setGrupoEditando(null);
            setFormGrupo({ name: '', permissoes: {}, status: 'Ativado' });
            setRefreshSubforuns(prev => prev + 1);
          } catch (err) {
            alert('Erro ao salvar edição: ' + (err?.response?.data?.error || err.message));
          }
        }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: 500 }}>Nome</label>
            <input type="text" value={formGrupo.name} onChange={e => setFormGrupo(f => ({ ...f, name: e.target.value }))} style={{ width: '100%', marginTop: 4, marginBottom: 12, padding: 8, borderRadius: 4, border: '1px solid #ccc', fontSize: 15 }} />
          </div>
          {/* Permissões */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: 500 }}>Permissões</label>
            {/* Exemplo de renderização dinâmica das permissões */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
              <thead>
                <tr>
                  <th></th>
                  <th>Ver</th>
                  <th>Criar</th>
                  <th>Responder</th>
                  <th>Editar</th>
                  <th>Apagar</th>
                  <th>Administração</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(formGrupo.permissoes || {}).map(cargo => (
                  <tr key={cargo}>
                    <td>{cargo}</td>
                    {['Ver','Criar','Responder','Editar','Apagar','Administração'].map(perm => (
                      <td key={perm}>
                        <input type="checkbox" checked={!!formGrupo.permissoes[cargo]?.[perm]} onChange={e => setFormGrupo(f => ({
                          ...f,
                          permissoes: {
                            ...f.permissoes,
                            [cargo]: {
                              ...f.permissoes[cargo],
                              [perm]: e.target.checked
                            }
                          }
                        }))} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Status */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: 500 }}>Status</label>
            <select value={formGrupo.status} onChange={e => setFormGrupo(f => ({ ...f, status: e.target.value }))} style={{ width: '100%', marginTop: 4, marginBottom: 12, padding: 8, borderRadius: 4, border: '1px solid #ccc', fontSize: 15 }}>
              <option value="Ativado">Ativado</option>
              <option value="Desativado">Desativado</option>
              <option value="Oculto">Oculto</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button type="submit" style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 28px', fontWeight: 600, fontSize: 15 }}>Salvar</button>
            <button type="button" style={{ background: '#e0e0e0', color: '#222', border: 'none', borderRadius: 4, padding: '8px 28px', fontWeight: 600, fontSize: 15 }} onClick={() => { setGrupoEditando(null); setFormGrupo({ name: '', permissoes: {}, status: 'Ativado' }); }}>Cancelar</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 24, width: '100%', maxWidth: 700, minHeight: 400, background: '#fff', borderRadius: 8, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1.2px solid #ececec', padding: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '32px 32px 0 32px' }}>
        <img src={imagemDepartamento} alt={team.nameTeams} style={{ width: 56, height: 56, borderRadius: 8, border: '1.5px solid #e0e0e0', background: '#f5f5f5' }} />
        <h2 style={{ fontWeight: 700, fontSize: 26, color: '#222', margin: 0 }}>{team.nameTeams}</h2>
      </div>
      <div style={{ margin: '32px 32px 0 32px' }}>
        <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 18 }}>Sub-Fóruns</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', borderRadius: 8, overflow: 'hidden', background: '#fff', fontSize: 15 }}>
          <thead>
            <tr style={{ background: '#f3f3f3' }}>
              <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 700 }}></th>
              <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 700 }}>Nome</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 700 }}>Última Resposta</th>
              <th style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 700 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {subforuns.filter(sub => podeVerGrupo(sub._id)).map((sub) => (
              <tr key={sub._id} style={{ borderBottom: '1px solid #ececec', background: '#fff' }}>
                <td style={{ padding: '12px 8px' }}>
                  <img src={imagemDepartamento} alt="icon" style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #e0e0e0', background: '#f5f5f5' }} />
                </td>
                <td style={{ padding: '12px 8px', fontWeight: 500 }}>{sub.name}</td>
                <td style={{ padding: '12px 8px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <FaUser style={{ marginRight: 4, color: '#222' }} />{sub.lastUser || team.nameTeams}<br />
                    <FaClock style={{ marginRight: 4, color: '#222' }} />{sub.lastDate || '---'}
                  </span>
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                  <button style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '7px 22px', cursor: 'pointer', fontWeight: 600, fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}
                    onClick={() => {
                      if (podeVerGrupo(sub._id)) {
                        setGrupoSelecionado(sub._id);
                        setTopicoAberto(null);
                      } else {
                        alert('Você não tem permissão para acessar este grupo.');
                      }
                    }}
                  >
                    <FaEye /> Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ForumEquipe; 