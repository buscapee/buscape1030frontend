import React, { useContext, useState, useEffect } from 'react';
import { FaFloppyDisk } from 'react-icons/fa6';
import { UserContext } from '../../context/UserContext';
import Notification from '../Notification/Notification';
import { RequirementsContext } from '../../context/Requirements';
import { RhContext } from '../../context/RhContext';
import { MdDelete, MdEdit } from 'react-icons/md';
import { FaCheck } from 'react-icons/fa';
import ConfirmationModal from '../ConfirmationModal';

const FormPermission = ({ requerimentSelected }) => {
  const { user } = useContext(UserContext);
  const { createRequerimentPermission, editRequerimentData } = useContext(RequirementsContext);
  const { rhStatus, deleteRequeriment } = useContext(RhContext);
  const [authorized, setAuthorized] = useState('');
  const [promoted, setPromoted] = useState('');
  const [observation, setObservation] = useState('');
  const [notification, setNotification] = useState(null);
  const [operator, setOperator] = useState('');
  const [status, setStatus] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [createdAt, setCreatedAt] = useState('');
  const [logs, setLogs] = useState([]);
  const [crhAnalysis, setCrhAnalysis] = useState('');
  const [approved, setApproved] = useState(false);
  const [reproved, setReproved] = useState(false);

  useEffect(() => {
    if (!requerimentSelected) {
      setOperator(JSON.parse(localStorage.getItem("@Auth:Profile")));
      setAuthorized('');
      setPromoted('');
      setObservation('');
      setStatus('');
      setLogs([]);
      setCreatedAt('');
      setCrhAnalysis('');
    } else if (requerimentSelected) {
      setAuthorized(requerimentSelected.authorized);
      setPromoted(requerimentSelected.promoted);
      setObservation(requerimentSelected.reason);
      setStatus(requerimentSelected.status);
      setLogs(requerimentSelected.logs || []);
      setCreatedAt(requerimentSelected.createdAt ? requerimentSelected.createdAt.substring(0, 16) : '');
      setCrhAnalysis(requerimentSelected.crhAnalysis || '');
    }
  }, [requerimentSelected]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      operator: operator.nickname,
      authorized,
      promoted,
      reason: observation,
      typeRequirement: 'Permissão',
      status: 'Pendente',
    };
    await createRequerimentPermission(data);
    setNotification({ message: 'Permissão aplicada com sucesso!', type: 'success' });
    setAuthorized('');
    setPromoted('');
    setObservation('');
  };

  const handleStatus = async (e, newStatus) => {
    e.preventDefault();
    // Log de depuração
    console.log('Clique em status:', newStatus, {
      idUser: user?.users?.[0]?._id,
      idRequirements: requerimentSelected?._id,
      statusRequirements: newStatus
    });
    if (!user?.users?.[0]?._id || !requerimentSelected?._id) {
      setNotification({ message: 'Erro: usuário ou requerimento não encontrado.', type: 'error' });
      return;
    }
    const data = {
      idUser: user?.users?.[0]?._id,
      idRequirements: requerimentSelected._id,
      statusRequirements: newStatus
    };
    try {
      const resp = await rhStatus(data);
      setStatus(newStatus);
      if (newStatus === 'Aprovado') {
        setApproved(true);
        setNotification({ message: 'Permissão aprovada com sucesso!', type: 'success' });
        if (requerimentSelected) {
          requerimentSelected.status = newStatus;
        }
      }
      if (newStatus === 'Reprovado') {
        setReproved(true);
        setNotification({ message: 'Permissão reprovada com sucesso!', type: 'warning' });
        if (requerimentSelected) {
          requerimentSelected.status = newStatus;
        }
      }
      setTimeout(() => { window.location.reload(); }, 1000);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      setNotification({ message: 'Erro ao atualizar status da permissão.', type: 'error' });
    }
  };

  const handleDelete = () => {
    setShowConfirm(true);
  };

  const handleConfirmDelete = () => {
    const data = {
      idUser: user?.users?.[0]?._id,
      idRequirements: requerimentSelected._id,
      type: 'permission'
    };
    deleteRequeriment(data);
    setShowConfirm(false);
  };

  const handleCancelDelete = () => setShowConfirm(false);

  const handleEdit = () => setIsEditing(true);

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const data = {
      idRequirements: requerimentSelected._id,
      authorized,
      promoted,
      reason: observation,
      createdAt,
      status,
      crhAnalysis
    };
    await editRequerimentData(data);
    setIsEditing(false);
    window.location.reload();
  };

  function formatLogDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleString('pt-BR');
  }

  // Visualização de formulário preenchido
  if (requerimentSelected) {
    return (
      <div className="flex flex-col items-center w-full">
        <form onSubmit={isEditing ? handleSaveEdit : undefined} className="bg-white rounded shadow border border-gray-200 w-full max-w-3xl mx-auto flex flex-col gap-6 mt-6" style={{padding: 0}}>
          <div className="rounded-t bg-[#14532d] px-6 py-3 text-white font-bold text-lg border-b border-green-900">Efetuar Permissão</div>
          <div className="flex flex-col gap-4 px-6 py-6 pb-2">
            <div className="flex flex-col gap-2">
              <label className="font-semibold">Aplicador:</label>
              <input
                type="text"
                value={!requerimentSelected ? (operator && operator.nickname ? operator.nickname : '') : requerimentSelected.operator}
                disabled
                className="border rounded px-3 py-2 bg-gray-100"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-semibold">Nick do policial autorizado:</label>
              <input type="text" value={authorized} onChange={e => setAuthorized(e.target.value)} disabled={!isEditing} className="border rounded px-3 py-2 bg-white" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-semibold">Nick do policial promovido:</label>
              <input type="text" value={promoted} onChange={e => setPromoted(e.target.value)} disabled={!isEditing} className="border rounded px-3 py-2 bg-white" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-semibold">Observação:</label>
              <textarea value={observation} onChange={e => setObservation(e.target.value)} disabled={!isEditing} className="border rounded px-3 py-2 min-h-[100px] bg-gray-100" />
            </div>
            {isEditing && (
              <>
                <div className="flex flex-col gap-2">
                  <label className="font-semibold">Data e Hora:</label>
                  <input type="datetime-local" value={createdAt} onChange={e => setCreatedAt(e.target.value)} className="border rounded px-3 py-2 bg-white" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-semibold">Status:</label>
                  <select value={status} onChange={e => setStatus(e.target.value)} className="border rounded px-3 py-2 bg-white">
                    <option value="Pendente">Pendente</option>
                    <option value="Aprovado">Aprovado</option>
                    <option value="Reprovado">Reprovado</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-semibold">Análise do CRH:</label>
                  <textarea value={crhAnalysis} onChange={e => setCrhAnalysis(e.target.value)} placeholder="Digite o motivo da análise do CRH" className="border rounded px-3 py-2 min-h-[60px] bg-gray-100" />
                </div>
                <div className="flex justify-end gap-4 px-6 pb-6">
                    <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="w-[120px] h-[40px] flex items-center justify-center gap-2 bg-[#374151] hover:bg-[#4b5563] text-white font-semibold rounded shadow transition-colors duration-200"
                    >
                        <MdDelete /> Cancelar
                    </button>
                    <button
                        type="submit"
                        className="w-[120px] h-[40px] flex items-center justify-center gap-2 bg-[#14532d] hover:bg-[#174422] text-white font-semibold rounded shadow transition-colors duration-200"
                    >
                        <FaFloppyDisk /> Salvar
                    </button>
                </div>
              </>
            )}
            {/* Botões Editar e Excluir sempre visíveis após aprovado/reprovado */}
            {requerimentSelected && (["Aprovado","Reprovado"].includes(requerimentSelected.status)) && !isEditing && (
              <section className='flex row items-center justify-center mt-4 mb-2'>
                <button
                  type="button"
                  onClick={handleEdit}
                  className='flex m-2 items-center justify-center text-white bg-green-700 hover:bg-green-800 text-[14px] h-[30px] w-[120px] rounded-sm font-medium transition duration-300'>
                  <span className='mr-2'><FaCheck /></span>Editar
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className='flex m-2 items-center justify-center text-white bg-red-700 hover:bg-red-800 text-[14px] h-[30px] w-[120px] rounded-sm font-medium'>
                  <span className='mr-2'><MdDelete /></span>Apagar
                </button>
              </section>
            )}
          </div>
          {requerimentSelected && requerimentSelected.status === "Pendente" && !isEditing && (
            <section className='flex row items-center justify-center mt-4 mb-2'>
              <button
                type="button"
                onClick={e => handleStatus(e, "Aprovado")}
                className='flex m-2 items-center justify-center text-white bg-green-700 hover:bg-green-800 text-[14px] h-[30px] w-[120px] rounded-sm font-medium transition duration-300'>
                <span className='mr-2'><FaCheck /></span>Aprovar
              </button>
              <button
                onClick={e => handleStatus(e, "Reprovado")}
                type="button"
                className='flex m-2 items-center justify-center text-white bg-orange-600 hover:bg-orange-700 text-[14px] h-[30px] w-[120px] rounded-sm font-medium transition duration-300'>
                <span className='mr-2'><MdDelete /></span>Reprovado
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className='flex m-2 items-center justify-center text-white bg-red-700 hover:bg-red-800 text-[14px] h-[30px] w-[120px] rounded-sm font-medium'>
                <span className='mr-2'><MdDelete /></span>Excluir
              </button>
            </section>
          )}
        </form>
        {/* Bloco de logs centralizado, logo abaixo do formulário */}
        {logs && logs.length > 0 && (
          <div className="w-full max-w-3xl mx-auto mt-6 bg-white border border-gray-200 rounded shadow">
            <div className="font-bold px-6 py-3 border-b border-gray-100 bg-gray-50">Log</div>
            <div className="flex flex-col gap-0">
              {logs.slice().reverse().map((log, idx) => (
                <div key={idx} className="flex items-center gap-2 text-[15px] px-6 py-3 border-b border-gray-100 text-gray-800">
                  <span className="font-semibold text-blue-700 mr-2 flex items-center gap-1">
                    <MdEdit className="inline-block text-gray-500 text-[17px]" /> {log.user}
                  </span>
                  <span className="mr-2">{log.action} essa(e) {log.type}</span>
                  <span className="text-gray-500 text-[13px]">{formatLogDate(log.date)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {showConfirm && (
          <ConfirmationModal
            open={showConfirm}
            title="Confirmação"
            message={`Tem certeza que deseja excluir o requerimento de permissão para "${authorized}"? Essa ação não poderá ser desfeita.`}
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
            confirmText="Excluir"
            cancelText="Cancelar"
          />
        )}
        {approved && <Notification message="Requerimento aprovado com sucesso." onClose={() => setApproved(false)} type="success" position="bottom-right" />}
        {reproved && <Notification message="Requerimento reprovado com sucesso." onClose={() => setReproved(false)} type="warning" position="bottom-right" />}
      </div>
    );
  }

  // Formulário de criação
  return (
    <div className="flex flex-col items-center w-full">
      {notification && (
        <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}
      <form onSubmit={handleSubmit} className="bg-white rounded shadow border border-gray-200 w-full max-w-3xl mx-auto flex flex-col gap-6 mt-6" style={{padding: 0}}>
        <div className="rounded-t bg-[#14532d] px-6 py-3 text-white font-bold text-lg border-b border-green-900">Aplicar Permissão</div>
        <div className="flex flex-col gap-4 px-6 py-6 pb-2">
          <div className="flex flex-col gap-2">
            <label className="font-semibold">Aplicador:</label>
            <input
              type="text"
              value={!requerimentSelected ? (operator && operator.nickname ? operator.nickname : '') : requerimentSelected.operator}
              disabled
              className="border rounded px-3 py-2 bg-gray-100"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold">Nick do policial autorizado:</label>
            <input type="text" value={authorized} onChange={e => setAuthorized(e.target.value)} required placeholder="Digite o nick do policial autorizado" className="border rounded px-3 py-2 bg-white" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold">Nick do policial promovido:</label>
            <input type="text" value={promoted} onChange={e => setPromoted(e.target.value)} required placeholder="Digite o nick do policial promovido" className="border rounded px-3 py-2 bg-white" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold">Observação <span className="text-red-500">*</span>:</label>
            <textarea value={observation} onChange={e => setObservation(e.target.value)} required placeholder="Digite a sua observação" className="border rounded px-3 py-2 min-h-[100px] bg-gray-100" />
          </div>
        </div>
        {!requerimentSelected && !isEditing && (
          <button
            type="submit"
            className="flex items-center gap-2 bg-[#14532d] hover:bg-[#174422] text-white font-semibold px-5 py-2 rounded shadow transition-colors duration-200 w-fit ml-6 mb-6 mt-2"
          >
            <span><FaFloppyDisk /></span>Publicar
          </button>
        )}
      </form>
    </div>
  );
};

export default FormPermission; 