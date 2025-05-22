import React, { useContext, useEffect, useState } from 'react'
import { FaFloppyDisk } from "react-icons/fa6";
import { UserContext } from '../../context/UserContext';
import { RequirementsContext } from '../../context/Requirements';
import { MdDelete, MdEdit } from "react-icons/md";
import { FaCheck } from "react-icons/fa";
import { RhContext } from '../../context/RhContext';
import Notification from '../Notification/Notification';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../ConfirmationModal';

const FormResignation = ({ requerimentSelected }) => {

    const [loadingDocs, setLoadingDocs] = useState(false)
    const [promoted, setPromoted] = useState('');
    const [reason, setReason] = useState('');
    const [operator, setOperator] = useState('');
    const { user, searchAllUsers } = useContext(UserContext);
    const { createRequerimentResignation, editRequerimentData } = useContext(RequirementsContext)
    const { resUser, newPatents } = user;
    const { rhStatus, messege, deleteRequeriment } = useContext(RhContext);
    const [approved, setApproved] = useState(false);
    const [reproved, setReproved] = useState(false);
    const [deleted, setDeleted] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const navigate = useNavigate();
    const [createdAt, setCreatedAt] = useState('');
    const [status, setStatus] = useState('');
    const [crhAnalysis, setCrhAnalysis] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [permissor, setPermissor] = useState('');
    const [anexoProvas, setAnexoProvas] = useState('');

    useEffect(() => {
        setOperator(JSON.parse(localStorage.getItem("@Auth:Profile")));
        if (requerimentSelected) {
            setPromoted(requerimentSelected.promoted || '');
            setReason(requerimentSelected.reason || '');
            setCreatedAt(requerimentSelected.createdAt ? requerimentSelected.createdAt.substring(0, 16) : '');
            setStatus(requerimentSelected.status || '');
            setCrhAnalysis(requerimentSelected.crhAnalysis || '');
        } else {
            setPromoted('');
            setReason('');
            setCreatedAt('');
            setStatus('');
            setCrhAnalysis('');
        }
    }, [requerimentSelected]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!operator || !operator._id) return;
        const data = {
            idUser: operator._id,
            promoted,
            reason,
            permissor,
            anexoProvas
        };
        createRequerimentResignation(data);
        setPromoted('');
        setReason('');
    };

    const deleteRequirements = () => {
        if (!operator || !operator._id) return;
        const data = {
            idUser: operator._id,
            idRequirements: requerimentSelected._id,
            type: "promotion"
        }
        deleteRequeriment(data)
        setDeleted(true);
        setTimeout(() => { window.location.reload(); }, 1000);
    }

    const handleDeleteClick = () => {
        setShowConfirm(true);
    };

    const handleConfirmDelete = () => setShowConfirm(false);

    const handleCancelDelete = () => setShowConfirm(false);

    //Aprova reprova ou exclui 
    const atualizaStatus = (e, status) => {
        e.preventDefault()
        if (!operator || !operator._id) return;
        const data = {
            idUser: operator._id,
            idRequirements: requerimentSelected._id,
            statusRequirements: status
        }
        rhStatus(data)
        if (status === 'Aprovado') setApproved(true);
        if (status === 'Reprovado') setReproved(true);
        setTimeout(() => { window.location.reload(); }, 1000);
    }

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        const data = {
            idRequirements: requerimentSelected._id,
            promoted,
            reason,
            createdAt,
            status,
            crhAnalysis
        };
        await editRequerimentData(data);
        setIsEditing(false);
        window.location.reload();
    };

    // Função para formatar data/hora do log
    function formatLogDate(dateStr) {
        const d = new Date(dateStr);
        return d.toLocaleString('pt-BR');
    }

    return (
        <div className="flex flex-col items-center w-full">
            <form onSubmit={isEditing ? handleSaveEdit : handleSubmit} className="bg-white rounded shadow border border-gray-200 w-full max-w-3xl mx-auto flex flex-col gap-6 mt-6" style={{padding: 0}}>
                <div className="rounded-t bg-[#14532d] px-6 py-3 text-white font-bold text-lg border-b border-green-900">Aplicar Demissão</div>
                <div className="flex flex-col gap-4 px-6 py-6">
                    <div className="flex flex-col gap-2">
                        <label className="font-semibold">Aplicador:</label>
                        <input type="text"
                            className="border rounded px-3 py-2 bg-gray-100"
                            value={!requerimentSelected ? (operator && operator.nickname ? operator.nickname : '') : requerimentSelected.operator}
                            disabled
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="font-semibold">Demitido:</label>
                        <input type="text"
                            className="border rounded px-3 py-2 bg-white"
                            value={promoted}
                            onChange={(e) => {
                                setPromoted(e.target.value)
                            }}
                            disabled={requerimentSelected && !isEditing}
                            required
                            placeholder="Digite o nick do militar que será demitido"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="font-semibold">Motivo:</label>
                        <textarea
                            className="border rounded px-3 py-2 min-h-[100px] bg-gray-100"
                            value={reason}
                            placeholder="Digite o motivo da demissão"
                            onChange={(e) => setReason(e.target.value)} required
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="font-semibold">Permissor (Opcional):</label>
                        <input type="text"
                            className="border rounded px-3 py-2 bg-white"
                            value={requerimentSelected ? requerimentSelected.permissor || '' : permissor || ''}
                            onChange={e => setPermissor(e.target.value)}
                            placeholder="Digite o nickname do Permissor"
                            disabled={!!requerimentSelected && !isEditing}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="font-semibold">Anexo das Provas</label>
                        <input type="text"
                            className="border rounded px-3 py-2 bg-white"
                            value={requerimentSelected ? requerimentSelected.anexoProvas || '' : anexoProvas || ''}
                            onChange={e => setAnexoProvas(e.target.value)}
                            placeholder="Cole o link das provas"
                            disabled={!!requerimentSelected && !isEditing}
                        />
                    </div>
                </div>
                {!requerimentSelected && !loadingDocs && !isEditing && (
                    <button className="flex items-center gap-2 bg-[#14532d] hover:bg-[#174422] text-white font-semibold px-5 py-2 rounded shadow transition-colors duration-200 w-fit ml-6 mb-6 mt-2" type="submit">
                        <span><FaFloppyDisk /></span>Publicar
                    </button>
                )}
                {loadingDocs && (
                    <button className="flex items-center gap-2 bg-gray-400 text-white font-semibold px-5 py-2 rounded shadow w-fit ml-6 mb-6 mt-2" disabled>
                        <span><FaFloppyDisk /></span>Aguarde...
                    </button>
                )}
                {/* Botões Editar e Excluir para Admin/Diretor ao visualizar */}
                {requerimentSelected && operator && (operator.userType === 'Admin' || operator.userType === 'Diretor') && (['Aprovado','Reprovado'].includes(requerimentSelected.status)) && !isEditing && (
                    <section className='flex row items-center justify-center mt-4'>
                        <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className='flex m-2 items-center justify-center text-white bg-green-700 hover:bg-green-800 text-[14px] h-[30px] w-[120px] rounded-sm font-medium transition duration-300'>
                            <span className='mr-2'><FaCheck /></span>Editar
                        </button>
                        <button
                            type="button"
                            onClick={handleDeleteClick}
                            className='flex m-2 items-center justify-center text-white bg-red-700 hover:bg-red-800 text-[14px] h-[30px] w-[120px] rounded-sm font-medium'>
                            <span className='mr-2'><MdDelete /></span>Apagar
                        </button>
                    </section>
                )}
                {isEditing && (
                    <div className="flex flex-col gap-4 px-6 pb-6">
                        <div className="flex flex-col gap-2">
                            <label className="font-semibold">Data e Hora:</label>
                            <input
                                type="datetime-local"
                                className="border rounded px-3 py-2 bg-white"
                                value={createdAt}
                                onChange={e => setCreatedAt(e.target.value)}
                            />
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
                            <textarea
                                className="border rounded px-3 py-2 min-h-[60px] bg-gray-100"
                                value={crhAnalysis}
                                onChange={e => setCrhAnalysis(e.target.value)}
                                placeholder="Digite o motivo da análise do CRH"
                            />
                        </div>
                        <div className="flex justify-end gap-4">
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
                    </div>
                )}
                {requerimentSelected && requerimentSelected.status === "Pendente" &&
                    <section className='flex row items-center justify-center'>
                        <button
                            type="button"
                            onClick={(e) => atualizaStatus(e, "Aprovado")}
                            className='flex m-2 items-center justify-center text-white bg-green-700 hover:bg-green-800 text-[14px] h-[30px] w-[120px] rounded-sm font-medium transition duration-300'>
                            <span className='mr-2'><FaCheck /></span>Aprovar
                        </button>
                        <button
                            onClick={(e) => atualizaStatus(e, "Reprovado")}
                            type="button"
                            className='flex m-2 items-center justify-center text-white bg-orange-600 hover:bg-orange-700 text-[14px] h-[30px] w-[120px] rounded-sm font-medium transition duration-300'>
                            <span className='mr-2'><MdDelete /></span>Reprovado
                        </button>
                        <button 
                        type="button"
                        onClick={deleteRequirements} className='flex m-2 items-center justify-center text-white bg-red-700 hover:bg-red-800 text-[14px] h-[30px] w-[120px] rounded-sm font-medium'>
                            <span className='mr-2'><MdDelete /></span>Excluir
                        </button>
                    </section>
                }
            </form>
            {/* Bloco de logs centralizado, logo abaixo do formulário */}
            {requerimentSelected && requerimentSelected.logs && requerimentSelected.logs.length > 0 && (
                <div className="w-full max-w-3xl mx-auto mt-6 bg-white border border-gray-200 rounded shadow">
                    <div className="font-bold px-6 py-3 border-b border-gray-100 bg-gray-50">Log</div>
                    <div className="flex flex-col gap-0">
                        {requerimentSelected.logs.slice().reverse().map((log, idx) => (
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
            {approved && <Notification message="Requerimento aprovado com sucesso." onClose={() => setApproved(false)} type="success" />}
            {reproved && <Notification message="Requerimento reprovado com sucesso." onClose={() => setReproved(false)} type="warning" />}
            {deleted && <Notification message="Requerimento excluído com sucesso." onClose={() => setDeleted(false)} type="error" />}
            <ConfirmationModal
                open={showConfirm}
                title="Confirmação"
                message={`Tem certeza que deseja excluir o requerimento de demissão para \"${promoted}\"? Essa ação não poderá ser desfeita.`}
                onConfirm={deleteRequirements}
                onCancel={handleCancelDelete}
                confirmText="Excluir"
                cancelText="Cancelar"
            />
        </div>
    );
}

export default FormResignation;