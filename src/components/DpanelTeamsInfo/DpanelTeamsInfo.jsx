import React, { useContext, useEffect, useState } from 'react';
import { ClassesContext } from '../../context/ClassesContext';
import { SystemContext } from '../../context/SystemContext';
import { TeamsContext } from '../../context/TeamsContext';
import { FaTrash, FaEdit, FaSave, FaTimes, FaUserPlus, FaCog } from 'react-icons/fa';
import { DocsContext } from '../../context/DocsContext';
import ConfirmationModal from '../ConfirmationModal';
import { SlArrowUp } from 'react-icons/sl';

const DpanelTeamsInfo = ({ team, getTeams }) => {
  // Validação inicial do objeto team
  if (!team || !team.nameTeams || !team._id) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 font-semibold">Erro ao carregar dados da equipe. Dados incompletos ou equipe não encontrada.</p>
        <button
          onClick={() => getTeams && getTeams()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  const [editClasse, setEditClasse] = useState("inicio");
  const [classeSelected, setClasseSelected] = useState([]);
  const [nameTeams, setNameTeams] = useState(team.nameTeams);
  const [leader, setLeader] = useState(team.leader);
  const [viceLeader, setViceLeader] = useState(team.viceLeader);
  const [emblema, setEmblema] = useState(team.emblema ? team.emblema : "");
  const { Classes, message, editClasse: handleEditClasse, setMessage, getClasses, createClasse, deleteClasse } = useContext(ClassesContext);
  const { message: messageTeam, setMessage: setMessageTeam, updateTeam, deleteTeams, updateHierarquia } = useContext(TeamsContext);
  const { infoSystem, getSystem } = useContext(SystemContext);
  const newArrayClesses = Classes.filter(classes => classes.team === team.nameTeams);
  const { searchDoc, docSelected, loadingDocs } = useContext(DocsContext);

  // Checagem de carregamento do infoSystem
  useEffect(() => {
    getSystem();
  }, [getSystem]);

  if (!infoSystem || !Array.isArray(infoSystem) || infoSystem.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2 text-gray-600">Carregando informações do sistema...</p>
      </div>
    );
  }

  const patentsArray = infoSystem[0]?.patents || [];
  const [patentData, setPatentData] = useState('');
  const [classeData, setClasseData] = useState('');
  const idUser = JSON.parse(localStorage.getItem("@Auth:ProfileUser"));

  const [newAulaName, setNewAulaName] = useState('');
  const [newAulaPatent, setNewAulaPatent] = useState('');

  useEffect(() => {
    setPatentData(classeSelected.patent);
    setClasseData(classeSelected.nameClasse);
    setMessageTeam('');
    getTeams(localStorage.getItem(idUser.token));
    getClasses(localStorage.getItem(idUser.token));
  }, [editClasse]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      idUser: idUser._id,
      idClasse: classeSelected._id,
      nameClasse: classeData,
      team: classeSelected.team,
      patent: patentData,
    };
    handleEditClasse(data);
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState(team.nameTeams);
  const [editSigla, setEditSigla] = useState(team.sigla || '');
  const [editStatus, setEditStatus] = useState(team.status || 'Ativado');
  const [editEmblema, setEditEmblema] = useState(team.emblema || '');

  // Função para mostrar notificação
  const showNotification = (message) => {
    window.dispatchEvent(new CustomEvent('showNotification', { detail: { message } }));
    setTimeout(() => window.location.reload(), 1000);
  };

  const handleEditTeam = (e) => {
    e.preventDefault();
    const data = {
      idUser: idUser._id,
      teamsId: team._id,
      nameTeams: editName,
      sigla: editSigla,
      status: editStatus,
      emblema: editEmblema,
      leader: team.leader,
      viceLeader: team.viceLeader,
      members: team.members,
      hierarquia: team.hierarquia,
      url: team.url
    };
    updateTeam(data);
    setEditMode(false);
    showNotification('Sua equipe foi editada com sucesso.');
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    const data = {
      idUser,
      teamsId: team._id,
    };
    deleteTeams(data);
    setShowDeleteModal(false);
    showNotification('Sua equipe foi excluída com sucesso.');
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
  };

  const handleDeleteClasse = (classe) => {
    const data = {
      idUser,
      idClass: classe._id ,
    };
    deleteClasse(data);
  };

  

  const handleCreateNewClasse = (e) => {
    e.preventDefault();
    const data = {
      idUser,
      nameClasse: newAulaName,
      team: team.nameTeams,
      patent: newAulaPatent
    };
    createClasse(data);
  };

  // Hierarquia interna vinda do backend
  const [hierarquia, setHierarquia] = useState(team.hierarquia || []);

  // Sempre que o team mudar, atualiza a hierarquia exibida
  useEffect(() => {
    setHierarquia(team.hierarquia || []);
  }, [team]);

  const [editIdx, setEditIdx] = useState(null);
  const [editValue, setEditValue] = useState('');

  const handleEditHierarquia = (idx) => {
    setEditIdx(idx);
    setEditValue(hierarquia[idx]);
  };

  // Função para buscar equipe atualizada após alteração de hierarquia
  const fetchEquipeAtualizada = async () => {
    // Busca a equipe pelo id
    const res = await fetch(`/api/teams/all`);
    const data = await res.json();
    const equipeAtualizada = data.find(t => t._id === team._id);
    if (equipeAtualizada) setHierarquia(equipeAtualizada.hierarquia || []);
  };

  const handleSaveHierarquia = async (idx) => {
    const nova = [...hierarquia];
    nova[idx] = editValue;
    setHierarquia(nova);
    setEditIdx(null);
    setEditValue('');
    await updateHierarquia(team._id, nova);
    await fetchEquipeAtualizada();
  };
  const handleDeleteHierarquia = async (idx) => {
    const nova = hierarquia.filter((_, i) => i !== idx);
    setHierarquia(nova);
    await updateHierarquia(team._id, nova);
    await fetchEquipeAtualizada();
  };

  // Documentos/scripts edição inline
  const [editDocIdx, setEditDocIdx] = useState(null);
  const [editDocValue, setEditDocValue] = useState('');
  const handleEditDoc = (idx) => {
    setEditDocIdx(idx);
    setEditDocValue(newArrayClesses[idx].nameClasse);
  };
  const handleSaveDoc = async (idx) => {
    const classe = newArrayClesses[idx];
    await handleEditClasse({
      idUser: idUser._id,
      idClasse: classe._id,
      nameClasse: editDocValue,
      team: classe.team,
      patent: classe.patent,
    });
    setEditDocIdx(null);
    setEditDocValue('');
    await getClasses(localStorage.getItem('@Auth:Token'));
  };
  const handleDeleteDoc = async (idx) => {
    const classe = newArrayClesses[idx];
    await deleteClasse({
      idUser: idUser._id,
      idClass: classe._id,
    });
    setEditDocIdx(null);
    setEditDocValue('');
    await getClasses(localStorage.getItem('@Auth:Token'));
  };

  // Estado para novo cargo
  const [novoCargo, setNovoCargo] = useState("");
  const [novaFuncao, setNovaFuncao] = useState("membro padrão");

  const handleAddCargo = async (e) => {
    e.preventDefault();
    if (!novoCargo.trim()) return;
    const novaHierarquia = [...hierarquia, novoCargo.trim()];
    setHierarquia(novaHierarquia);
    setNovoCargo("");
    await updateHierarquia(team._id, novaHierarquia);
    window.dispatchEvent(new CustomEvent('showNotification', { detail: { message: 'Cargo interno adicionado com sucesso.', type: 'success' } }));
  };

  // Estado para controle de membros por cargo
  const [cargoMembrosOpen, setCargoMembrosOpen] = useState(null);
  const [novoMembro, setNovoMembro] = useState("");

  // Função para adicionar membro ao cargo
  const [members, setMembers] = useState(team.members || []);

  useEffect(() => {
    setMembers(team.members || []);
  }, [team.members]);

  const handleAddMembro = async (cargo) => {
    if (!novoMembro.trim()) return;
    const membro = members.find(m => m.nickname === novoMembro.trim());
    let novosMembros;
    if (membro) {
      novosMembros = members.map(m => m.nickname === novoMembro.trim() ? { ...m, office: cargo } : m);
    } else {
      novosMembros = [...members, { nickname: novoMembro.trim(), office: cargo }];
    }
    setMembers(novosMembros);
      await updateTeam({
        idUser: idUser._id,
        teamsId: team._id,
        nameTeams: team.nameTeams,
        leader: team.leader,
        viceLeader: team.viceLeader,
        members: novosMembros,
        emblema: team.emblema
      });
    setNovoMembro("");
    setCargoMembrosOpen(null);
    // Notificação global de sucesso
    window.dispatchEvent(new CustomEvent('showNotification', { detail: { message: 'Usuário adicionado com sucesso.', type: 'success' } }));
  };

  // Função para remover membro do cargo
  const handleRemoveMembro = async (nickname) => {
    const novosMembros = members.filter(m => m.nickname !== nickname);
    setMembers(novosMembros);
    await updateTeam({
      idUser: idUser._id,
      teamsId: team._id,
      nameTeams: team.nameTeams,
      leader: team.leader,
      viceLeader: team.viceLeader,
      members: novosMembros,
      emblema: team.emblema
    });
    setCargoMembrosOpen(null);
  };

  // Estado para documentos/scripts
  const [docsEquipe, setDocsEquipe] = useState([]);

  // Buscar documentos/scripts da equipe ao carregar
  useEffect(() => {
    if (team && team.nameTeams) {
      searchDoc(team.nameTeams).then(res => {
        setDocsEquipe(Array.isArray(res) ? res : []);
      });
    }
    // eslint-disable-next-line
  }, [team]);

  // Funções utilitárias para labels customizados
  const departamentosCoordenador = [
    "Corregedoria",
    "Agência Brasileira de Inteligência",
    "Grupo de Operações Especiais",
    "Corpo de Oficiais Generais"
  ];
  function getLeaderLabel(team) {
    if (departamentosCoordenador.includes(team.nameTeams)) return "Coordenador";
    return "Líder";
  }
  function getViceLeaderLabel(team) {
    if (departamentosCoordenador.includes(team.nameTeams)) return "Vice-Coordenador";
    return "Vice-líder";
  }

  const departamentosDiretor = [
    "Centro de Recursos Humanos",
    "Academia Publicitária Militar"
  ];
  function getLeaderLabel(team) {
    if (departamentosDiretor.includes(team.nameTeams)) return "Diretor";
    return "Líder";
  }
  function getViceLeaderLabel(team) {
    if (departamentosDiretor.includes(team.nameTeams)) return "Vice-Diretor";
    return "Vice-líder";
  }

  // Estado para modal de exclusão de cargo
  const [showDeleteCargoModal, setShowDeleteCargoModal] = useState(false);
  const [cargoToDeleteIdx, setCargoToDeleteIdx] = useState(null);

  // Função para abrir modal de exclusão de cargo
  const handleOpenDeleteCargo = (idx) => {
    setCargoToDeleteIdx(idx);
    setShowDeleteCargoModal(true);
  };

  // Função para confirmar exclusão de cargo
  const handleConfirmDeleteCargo = async () => {
    const nova = hierarquia.filter((_, i) => i !== cargoToDeleteIdx);
    setHierarquia(nova);
    await updateHierarquia(team._id, nova);
    setShowDeleteCargoModal(false);
    setCargoToDeleteIdx(null);
    // Notificação global de sucesso
    window.dispatchEvent(new CustomEvent('showNotification', { detail: { message: 'Cargo interno excluído com sucesso.', type: 'success' } }));
  };

  const handleCancelDeleteCargo = () => {
    setShowDeleteCargoModal(false);
    setCargoToDeleteIdx(null);
  };

  // Estado para modal de exclusão de membro
  const [showDeleteMemberModal, setShowDeleteMemberModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);

  // Função para abrir modal de exclusão de membro
  const handleOpenDeleteMember = (nickname) => {
    setMemberToDelete(nickname);
    setShowDeleteMemberModal(true);
  };

  // Função para confirmar exclusão de membro
  const handleConfirmDeleteMember = async () => {
    const novosMembros = members.filter(m => m.nickname !== memberToDelete);
    setMembers(novosMembros);
    await updateTeam({
      idUser: idUser._id,
      teamsId: team._id,
      nameTeams: team.nameTeams,
      leader: team.leader,
      viceLeader: team.viceLeader,
      members: novosMembros,
      emblema: team.emblema
    });
    setShowDeleteMemberModal(false);
    setMemberToDelete(null);
    window.dispatchEvent(new CustomEvent('showNotification', { detail: { message: 'Membro removido com sucesso.', type: 'success' } }));
  };

  const handleCancelDeleteMember = () => {
    setShowDeleteMemberModal(false);
    setMemberToDelete(null);
  };

  // Accordion visual para hierarquia interna
  const [openCargo, setOpenCargo] = useState({});
  const toggleCargo = (idx) => setOpenCargo(prev => ({ ...prev, [idx]: !prev[idx] }));

  // Accordion visual para documentos/scripts
  const [openDoc, setOpenDoc] = useState({});
  const toggleDoc = (idx) => setOpenDoc(prev => ({ ...prev, [idx]: !prev[idx] }));

  const [showCreateCargoModal, setShowCreateCargoModal] = useState(false);
  const [novoCargoNome, setNovoCargoNome] = useState('');

  const handleCreateCargo = async (e) => {
    e.preventDefault();
    if (!novoCargoNome.trim()) return;
    const novaHierarquia = [...hierarquia, novoCargoNome.trim()];
    setHierarquia(novaHierarquia);
    await updateHierarquia(team._id, novaHierarquia);
    setNovoCargoNome('');
    setShowCreateCargoModal(false);
    window.dispatchEvent(new CustomEvent('showNotification', { 
      detail: { 
        message: 'Cargo interno criado com sucesso.', 
        type: 'success' 
      } 
    }));
  };

  // Estados para edição do nickname do líder e vice-líder
  const [editLeaderNick, setEditLeaderNick] = useState(false);
  const [editViceLeaderNick, setEditViceLeaderNick] = useState(false);
  const [leaderNick, setLeaderNick] = useState(team.leader || "");
  const [viceLeaderNick, setViceLeaderNick] = useState(team.viceLeader || "");

  useEffect(() => {
    setLeaderNick(team.leader || "");
    setViceLeaderNick(team.viceLeader || "");
  }, [team]);

  const handleSaveLeaderNick = async () => {
    await updateTeam({
      idUser: idUser._id,
      teamsId: team._id,
      nameTeams: team.nameTeams,
      leader: leaderNick.trim(),
      viceLeader: team.viceLeader || "",
      members: members.map(m => m.office === (team.hierarquia && team.hierarquia[0] ? team.hierarquia[0] : 'Líder') ? { ...m, nickname: leaderNick.trim() } : m).filter(m => m.nickname !== ""),
      emblema: team.emblema,
      status: team.status,
      sigla: team.sigla,
      hierarquia: team.hierarquia,
      url: team.url
    });
    setEditLeaderNick(false);
    showNotification('Nickname do líder atualizado com sucesso.');
  };

  const handleSaveViceLeaderNick = async () => {
    await updateTeam({
      idUser: idUser._id,
      teamsId: team._id,
      nameTeams: team.nameTeams,
      leader: team.leader || "",
      viceLeader: viceLeaderNick.trim(),
      members: members.map(m => m.office === (team.hierarquia && team.hierarquia[1] ? team.hierarquia[1] : 'Vice-Líder') ? { ...m, nickname: viceLeaderNick.trim() } : m).filter(m => m.nickname !== ""),
      emblema: team.emblema,
      status: team.status,
      sigla: team.sigla,
      hierarquia: team.hierarquia,
      url: team.url
    });
    setEditViceLeaderNick(false);
    showNotification('Nickname do vice-líder atualizado com sucesso.');
  };

  return (
    <>
    <div className="container mx-auto p-4 bg-white shadow rounded-lg flex gap-6">
      {/* Card da equipe */}
      <div style={{ minWidth: 400, maxWidth: 420, width: 420, background: '#fff', borderRadius: 10, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1.2px solid #ececec', padding: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 24 }}>
          <img src={emblema || 'https://i.imgur.com/5JYhbtS.png'} alt="Emblema" style={{ width: 90, height: 90, borderRadius: 10, marginBottom: 10, background: '#eaeaea', border: '1.2px solid #e0e0e0' }} />
          {editMode ? (
            <form onSubmit={handleEditTeam} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <input value={editName} onChange={e => setEditName(e.target.value)} style={{ fontWeight: 700, fontSize: 26, margin: 0, textAlign: 'center', border: '1px solid #ccc', borderRadius: 6, padding: 4, width: '90%' }} />
              <input value={editSigla} onChange={e => setEditSigla(e.target.value)} placeholder="Sigla" style={{ fontSize: 16, border: '1px solid #ccc', borderRadius: 6, padding: 4, width: '60%' }} />
              <input value={editEmblema} onChange={e => setEditEmblema(e.target.value)} placeholder="Emblema (base64 ou link)" style={{ fontSize: 16, border: '1px solid #ccc', borderRadius: 6, padding: 4, width: '90%' }} />
              <select value={editStatus} onChange={e => setEditStatus(e.target.value)} style={{ fontSize: 16, border: '1px solid #ccc', borderRadius: 6, padding: 4, width: '60%' }}>
                <option value="Ativado">Ativado</option>
                <option value="Desativado">Desativado</option>
              </select>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="submit" style={{ background: '#43a047', color: '#fff', border: 'none', borderRadius: 6, padding: 8, fontSize: 18 }} title="Salvar"><FaSave /></button>
                <button type="button" onClick={() => setEditMode(false)} style={{ background: '#e53935', color: '#fff', border: 'none', borderRadius: 6, padding: 8, fontSize: 18 }} title="Cancelar"><FaTimes /></button>
              </div>
            </form>
          ) : (
            <>
              <h2 style={{ fontWeight: 700, fontSize: 26, margin: 0 }}>{team.nameTeams}</h2>
              <span style={{ marginTop: 8, fontWeight: 600, color: '#22c55e', background: '#e6f9ec', borderRadius: 6, padding: '2px 12px', fontSize: 15 }}>{team.status || 'Ativado'}</span>
              <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                <button onClick={() => setEditMode(true)} style={{ background: '#43a047', color: '#fff', border: 'none', borderRadius: 6, padding: 8, fontSize: 18 }} title="Editar"><FaEdit /></button>
                <button style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: 8, fontSize: 18 }} title="Configurações"><FaCog /></button>
                <button onClick={handleDelete} style={{ background: '#e53935', color: '#fff', border: 'none', borderRadius: 6, padding: 8, fontSize: 18 }} title="Excluir"><FaTrash /></button>
              </div>
            </>
          )}
        </div>
        {/* Modal de confirmação de exclusão */}
        {showDeleteModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
            <div style={{ background: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 4px 24px rgba(0,0,0,0.13)', minWidth: 320, maxWidth: 400, textAlign: 'center' }}>
              <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 18 }}>Deseja realmente excluir esta equipe?</h3>
              <p style={{ color: '#e53935', marginBottom: 24 }}>Esta ação não poderá ser desfeita.</p>
              <div style={{ display: 'flex', gap: 18, justifyContent: 'center' }}>
                <button onClick={confirmDelete} style={{ background: '#e53935', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 600, fontSize: 16 }}>Excluir</button>
                <button onClick={cancelDelete} style={{ background: '#eee', color: '#222', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 600, fontSize: 16 }}>Cancelar</button>
              </div>
            </div>
          </div>
        )}
        {/* Modos */}
        <div style={{ padding: '0 24px 18px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span>Modo Aula</span>
            <span style={{ background: '#22c55e', color: '#fff', borderRadius: 6, padding: '2px 12px', fontWeight: 600 }}>Ativado</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span>Modo Público</span>
            <span style={{ background: '#e53935', color: '#fff', borderRadius: 6, padding: '2px 12px', fontWeight: 600 }}>Desativado</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span>Membros</span>
            <span style={{ background: '#eee', color: '#222', borderRadius: 6, padding: '2px 12px', fontWeight: 600 }}>{members?.length || 0}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span>Documentos</span>
            <span style={{ background: '#eee', color: '#222', borderRadius: 6, padding: '2px 12px', fontWeight: 600 }}>{newArrayClesses.length}</span>
          </div>
          {/* Adicionar função, gerenciamento, etc. */}
          <div style={{ marginTop: 18, fontWeight: 700, color: '#222', fontSize: 15 }}>Gerenciamento</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
            <button style={{ background: '#fff', border: '1px solid #ececec', borderRadius: 6, padding: '8px 12px', fontWeight: 500, color: '#222', textAlign: 'left' }}>Página da Função</button>
            <button style={{ background: '#fff', border: '1px solid #ececec', borderRadius: 6, padding: '8px 12px', fontWeight: 500, color: '#222', textAlign: 'left' }}>Gerenciar Membros</button>
            <button style={{ background: '#fff', border: '1px solid #ececec', borderRadius: 6, padding: '8px 12px', fontWeight: 500, color: '#222', textAlign: 'left' }}>Página da Aula</button>
          </div>
        </div>
        {/* FAQ ou aviso */}
        <div style={{ background: '#fff7e6', border: '1.5px solid #ff9800', color: '#e65100', borderRadius: 6, padding: '14px 18px', margin: 18, fontWeight: 500, fontSize: 15, boxShadow: '0 1px 8px #ff980022', width: '90%', textAlign: 'left' }}>
          Está com dúvidas?<br />
          <a href="#" style={{ color: '#e65100', textDecoration: 'underline' }}>Acesse nosso FAQ, clicando aqui.</a>
        </div>
      </div>
      {/* Hierarquia interna e documentos/scripts */}
      <div style={{ flex: 1, background: '#fff', borderRadius: 10, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1.2px solid #ececec', padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700, fontSize: 20, marginBottom: 18 }}>
            <span>Hierarquia Interna</span>
            <button
              onClick={() => setShowCreateCargoModal(true)}
              style={{
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: 5,
                padding: '5px 16px',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
                boxShadow: '0 1px 2px #0001',
                transition: 'background 0.2s'
              }}
            >
              Criar cargo interno
            </button>
          </div>
        <ul style={{ border: '1px solid #ececec', borderRadius: 8, overflow: 'hidden', background: '#fafbfc', marginBottom: 32, padding: 0 }}>
          {hierarquia.map((item, idx) => (
            <li key={idx} style={{ borderBottom: idx < hierarquia.length - 1 ? '1px solid #ececec' : 'none', background: '#fff', transition: 'background 0.2s', padding: 0 }}>
              <div
                style={{
                  padding: '16px 24px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontWeight: 600,
                  fontSize: 15,
                  background: '#fff',
                }}
                onClick={() => toggleCargo(idx)}
              >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {editIdx === idx ? (
                  <>
                      <input value={editValue} onChange={e => setEditValue(e.target.value)} style={{ padding: 4, border: '1px solid #ccc', borderRadius: 4, fontSize: 15 }} />
                      <button onClick={() => handleSaveHierarquia(idx)} style={{ color: '#179c3c', background: 'none', border: 'none', marginLeft: 4 }} title="Salvar"><FaSave /></button>
                      <button onClick={() => { setEditIdx(null); setEditValue(''); }} style={{ color: '#e53935', background: 'none', border: 'none', marginLeft: 2 }} title="Cancelar"><FaTimes /></button>
                  </>
                ) : (
                  <>
                    <span>{item}</span>
                      <button onClick={e => { e.stopPropagation(); handleEditHierarquia(idx); }} style={{ color: '#1976d2', background: 'none', border: 'none', marginLeft: 8 }} title="Editar cargo"><FaEdit /></button>
                      <button onClick={e => { e.stopPropagation(); handleOpenDeleteCargo(idx); }} style={{ color: '#e53935', background: 'none', border: 'none', marginLeft: 2 }} title="Excluir cargo"><FaTrash /></button>
                  </>
                )}
                </div>
              </div>
              {openCargo[idx] && (
                <ul style={{ padding: '0 32px 12px 32px', margin: 0, listStyle: 'none', background: '#fafbfc' }}>
                  {members.filter(m => m.office === item).length === 0 && (
                    <li style={{ color: '#888', fontSize: 14, padding: '6px 0' }}>Nenhum membro neste cargo.</li>
                  )}
                  {members.filter(m => m.office === item).map(m => (
                    <li key={m.nickname} style={{ padding: '6px 0', color: '#222', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>{m.nickname}</span>
                      <button onClick={e => { e.stopPropagation(); handleOpenDeleteMember(m.nickname); }} style={{ color: '#e53935', background: 'none', border: 'none', marginLeft: 8 }} title="Remover membro"><FaTrash /></button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
          {/* Nova seção: Liderança da Equipe */}
          <div style={{ fontWeight: 700, fontSize: 18, margin: '24px 0 10px 0' }}>Liderança da Equipe</div>
          <ul style={{ border: '1px solid #ececec', borderRadius: 8, overflow: 'hidden', background: '#fafbfc', marginBottom: 32, padding: 0 }}>
            <li style={{ borderBottom: '1px solid #ececec', background: '#fff', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 600, fontSize: 15 }}>
              <span>Líder</span>
              {editLeaderNick ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input value={leaderNick} onChange={e => setLeaderNick(e.target.value)} style={{ width: 120, fontWeight: 700, color: '#2563eb', border: '1px solid #ccc', borderRadius: 4, padding: 4 }} placeholder="Nickname do Líder (opcional)" />
                  <button onClick={handleSaveLeaderNick} style={{ background: '#43a047', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', fontWeight: 600, fontSize: 14 }}><FaSave /></button>
                  <button onClick={() => { setEditLeaderNick(false); setLeaderNick(team.leader || ""); }} style={{ background: '#e53935', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', fontWeight: 600, fontSize: 14 }}><FaTimes /></button>
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#2563eb', fontWeight: 700 }}>{team.leader ? team.leader : <span style={{ color: '#888', fontWeight: 400 }}>Não definido</span>}</span>
                  <button onClick={() => setEditLeaderNick(true)} style={{ background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer' }} title="Editar Líder"><FaEdit style={{ color: '#2563eb', fontSize: 20 }} /></button>
                </span>
              )}
            </li>
            <li style={{ background: '#fff', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 600, fontSize: 15 }}>
              <span>Vice-Líder</span>
              {editViceLeaderNick ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input value={viceLeaderNick} onChange={e => setViceLeaderNick(e.target.value)} style={{ width: 120, fontWeight: 700, color: '#2563eb', border: '1px solid #ccc', borderRadius: 4, padding: 4 }} placeholder="Nickname do Vice-Líder (opcional)" />
                  <button onClick={handleSaveViceLeaderNick} style={{ background: '#43a047', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', fontWeight: 600, fontSize: 14 }}><FaSave /></button>
                  <button onClick={() => { setEditViceLeaderNick(false); setViceLeaderNick(team.viceLeader || ""); }} style={{ background: '#e53935', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', fontWeight: 600, fontSize: 14 }}><FaTimes /></button>
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#2563eb', fontWeight: 700 }}>{team.viceLeader ? team.viceLeader : <span style={{ color: '#888', fontWeight: 400 }}>Não definido</span>}</span>
                  <button onClick={() => setEditViceLeaderNick(true)} style={{ background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer' }} title="Editar Vice-Líder"><FaEdit style={{ color: '#2563eb', fontSize: 20 }} /></button>
                </span>
              )}
            </li>
          </ul>
        <ConfirmationModal
          open={showDeleteCargoModal}
          title="Confirmar exclusão"
          message="Tem certeza que deseja excluir este cargo interno? Esta ação não poderá ser desfeita."
          onConfirm={handleConfirmDeleteCargo}
          onCancel={handleCancelDeleteCargo}
          confirmText="Excluir"
          cancelText="Cancelar"
        />
        <ConfirmationModal
          open={showDeleteMemberModal}
          title="Confirmar exclusão"
          message="Tem certeza que deseja remover este membro do cargo? Esta ação não poderá ser desfeita."
          onConfirm={handleConfirmDeleteMember}
          onCancel={handleCancelDeleteMember}
          confirmText="Excluir"
          cancelText="Cancelar"
        />
        <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 18 }}>Documentos/Scripts</div>
        <ul style={{ border: '1px solid #ececec', borderRadius: 8, overflow: 'hidden', background: '#fafbfc', marginBottom: 32, padding: 0 }}>
          {docsEquipe.length === 0 && <li style={{ color: '#888', fontSize: 14, padding: '16px 24px' }}>Nenhum documento/script cadastrado para esta equipe.</li>}
          {docsEquipe.map((doc, idx) => (
            <li key={doc._id} style={{ borderBottom: idx < docsEquipe.length - 1 ? '1px solid #ececec' : 'none', background: '#fff', transition: 'background 0.2s', padding: 0 }}>
              <div
                style={{
                  padding: '16px 24px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontWeight: 500,
                  fontSize: 15,
                  background: '#fff',
                }}
                onClick={() => toggleDoc(idx)}
              >
                <span>{doc.nameDocs}</span>
                <SlArrowUp style={{
                  transition: 'transform 0.3s',
                  transform: openDoc[idx] ? 'rotate(0deg)' : 'rotate(180deg)',
                  color: '#222'
                }} />
              </div>
              {openDoc[idx] && (
                <div style={{ padding: '0 32px 12px 32px', background: '#fafbfc', fontSize: 14 }}>
                  <span style={{ fontSize: 13, color: doc.script ? '#1976d2' : '#43a047', background: doc.script ? '#e3f0ff' : '#e6f9ec', borderRadius: 4, padding: '2px 8px', marginRight: 8 }}>{doc.script ? 'Script' : 'Documento'}</span>
                  <a href={`/doc/${doc.url}`} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', textDecoration: 'underline', fontSize: 14, marginLeft: 8 }}>Visualizar</a>
                </div>
              )}
              </li>
            ))}
          </ul>
      </div>
    </div>

      {showCreateCargoModal && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100vw', 
          height: '100vh', 
          background: 'rgba(0,0,0,0.25)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 9999 
        }}>
          <div style={{ 
            background: '#fff', 
            borderRadius: 12, 
            padding: 32, 
            boxShadow: '0 4px 24px rgba(0,0,0,0.13)', 
            minWidth: 320, 
            maxWidth: 400, 
            textAlign: 'center' 
          }}>
            <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 18 }}>Criar Cargo Interno</h3>
            <form onSubmit={handleCreateCargo}>
              <input
                type="text"
                value={novoCargoNome}
                onChange={(e) => setNovoCargoNome(e.target.value)}
                placeholder="Nome do cargo"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px solid #ccc',
                  marginBottom: 18,
                  fontSize: 16
                }}
              />
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button
                  type="submit"
                  style={{
                    background: '#2563eb',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '8px 24px',
                    fontWeight: 600,
                    fontSize: 16,
                    cursor: 'pointer'
                  }}
                >
                  Criar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateCargoModal(false);
                    setNovoCargoNome('');
                  }}
                  style={{
                    background: '#e5e7eb',
                    color: '#374151',
                    border: 'none',
                    borderRadius: 6,
                    padding: '8px 24px',
                    fontWeight: 600,
                    fontSize: 16,
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default DpanelTeamsInfo;
