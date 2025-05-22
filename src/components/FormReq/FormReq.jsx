import React, { useContext, useEffect, useState } from 'react'
import { FaFloppyDisk } from "react-icons/fa6";
import { UserContext } from '../../context/UserContext';
import { RequirementsContext } from '../../context/Requirements';
import { MdDelete } from "react-icons/md";
import { FaCheck } from "react-icons/fa";
import { RhContext } from '../../context/RhContext';
import { SystemContext } from '../../context/SystemContext';
import Notification from '../Notification/Notification';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../ConfirmationModal';
import { MdEdit } from "react-icons/md";

const FormReq = ({ requerimentSelected }) => {
    const [loadingDocs, setLoadingDocs] = useState(false);
    const [promoted, setPromoted] = useState('');
    const [reason, setReason] = useState('');
    const [operator, setOperator] = useState('');
    const [newPatent, setNewPatent] = useState('');
    const [oldPatent, setOldPatent] = useState('');
    const [published, setPublished] = useState(false);
    const [approved, setApproved] = useState(false);
    const [reproved, setReproved] = useState(false);
    const [deleted, setDeleted] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [createdAt, setCreatedAt] = useState('');
    const [status, setStatus] = useState('');
    const [crhAnalysis, setCrhAnalysis] = useState('');
    const [permissor, setPermissor] = useState('');

    const { user, searchAllUsers } = useContext(UserContext);
    const { createRequeriment, editRequerimentData } = useContext(RequirementsContext);
    const { resUser } = user;
    const { rhStatus, messege, deleteRequeriment } = useContext(RhContext);
    const { infoSystem } = useContext(SystemContext);
    const navigate = useNavigate();

    useEffect(() => {
        setOperator(JSON.parse(localStorage.getItem("@Auth:Profile")));

        if (requerimentSelected) {
            setPromoted(requerimentSelected.promoted);
            setReason(requerimentSelected.reason);
            setNewPatent(requerimentSelected.newPatent);
            setOldPatent(requerimentSelected.oldPatent || '');
            setCreatedAt(requerimentSelected.createdAt ? requerimentSelected.createdAt.substring(0, 16) : '');
            setStatus(requerimentSelected.status || '');
            setCrhAnalysis(requerimentSelected.crhAnalysis || '');
        }
    }, [requerimentSelected]);

    useEffect(() => {
        if (!requerimentSelected && user && user.users && user.users[0] && promoted) {
            const currentPatent = user.users[0].patent;
            const paidPositions = infoSystem[0]?.paidPositions || [];
            const patents = infoSystem[0]?.patents || [];
            let idx = -1;
            if (paidPositions.includes(currentPatent)) {
                idx = paidPositions.indexOf(currentPatent);
                if (idx < paidPositions.length - 1) {
                    setNewPatent(paidPositions[idx + 1]);
                } else {
                    setNewPatent(paidPositions[paidPositions.length - 1]);
                }
            } else if (patents.includes(currentPatent)) {
                idx = patents.indexOf(currentPatent);
                if (idx < patents.length - 1) {
                    setNewPatent(patents[idx + 1]);
                } else {
                    setNewPatent(patents[patents.length - 1]);
                }
            } else {
                setNewPatent('');
            }
        } else if (!promoted) {
            setNewPatent('');
        }
    }, [user, infoSystem, promoted, requerimentSelected]);

    const handleSubmit = (e) => {
        e.preventDefault();
        let currentOldPatent = '';
        if (user && user.users && user.users[0]) {
            currentOldPatent = user.users[0].patent;
        }
        const data = {
            idUser: operator._id,
            promoted,
            reason,
            newPatent,
            oldPatent: currentOldPatent,
            permissor
        };
        createRequeriment(data);
        setPromoted('');
        setReason('');
        setNewPatent('');
        setOldPatent('');
        setPublished(true);
    };

    const deleteRequirements = () => {
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

    const handleConfirmDelete = () => {
        setShowConfirm(false);
        deleteRequirements();
    };

    const handleCancelDelete = () => setShowConfirm(false);

    //Aprova reprova ou exclui 
    const atualizaStatus = (e, status) => {
        e.preventDefault()
        const data = {
            idUser: operator._id,
            idRequirements: requerimentSelected._id,
            statusRequirements: status
        }
        rhStatus(data)
        if (status === 'Aprovado') setApproved(true);
        if (status === 'Reprovado') setReproved(true);
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        const data = {
            idRequirements: requerimentSelected._id,
            promoted,
            reason,
            newPatent,
            oldPatent,
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
                <div className="rounded-t bg-[#14532d] px-6 py-3 text-white font-bold text-lg border-b border-green-900">Efetuar Promoção</div>
                <div className="flex flex-col gap-4 px-6 py-6 pb-2">
                    <div className="flex flex-col gap-2">
                        <label className="font-semibold">Promotor:</label>
                        <input type="text" value={!requerimentSelected ? operator.nickname : requerimentSelected.operator} disabled className="border rounded px-3 py-2 bg-gray-100" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="font-semibold">Promovido:</label>
                        <input type="text" value={promoted} onChange={e => { setPromoted(e.target.value); searchAllUsers(e.target.value, "Promoção"); }} disabled={requerimentSelected && !isEditing} required placeholder="Digite o nick do militar que será promovido" className="border rounded px-3 py-2 bg-white" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="font-semibold">Nova Patente:</label>
                        <input type="text" required value={status === 'Reprovado' ? oldPatent : (!requerimentSelected ? newPatent : requerimentSelected.newPatent)} disabled className="border rounded px-3 py-2 bg-white" placeholder="Digite a nova patente" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="font-semibold">Motivo:</label>
                        <textarea value={reason} onChange={e => setReason(e.target.value)} required placeholder="Digite o motivo da promoção" disabled={requerimentSelected && !isEditing} className="border rounded px-3 py-2 min-h-[100px] bg-gray-100" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="font-semibold">Permissor (Opcional):</label>
                        <input type="text"
                            className="border rounded px-3 py-2 bg-white"
                            value={permissor || ''}
                            onChange={e => setPermissor(e.target.value)}
                            placeholder="Digite o nickname do Permissor"
                        />
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
                        </>
                    )}
                </div>
                {/* Botões Editar e Excluir para Admin/Diretor ao visualizar */}
                {requerimentSelected && operator && (operator.userType === 'Admin' || operator.userType === 'Diretor') && (["Aprovado","Reprovado"].includes(requerimentSelected.status)) && !isEditing && (
                    <section className='flex row items-center justify-center mt-4 mb-2'>
                        <button
                            type="button"
                            onClick={handleEdit}
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
                )}
                {!requerimentSelected && !loadingDocs && !isEditing && (
                    <button
                        type="submit"
                        className="flex items-center gap-2 bg-[#14532d] hover:bg-[#174422] text-white font-semibold px-5 py-2 rounded shadow transition-colors duration-200 w-fit ml-6 mb-6 mt-2"
                    >
                        <span><FaFloppyDisk /></span>Publicar
                    </button>
                )}
                {loadingDocs && (
                    <button className='BtnActive BtnActiveDisable btn mb-2' disabled>
                        <span className='SpanBtn'><FaFloppyDisk /></span>Aguarde...
                    </button>
                )}
                {requerimentSelected && requerimentSelected.status === "Pendente" && (
                    <section className='flex row items-center justify-center mt-4 mb-2'>
                        <button
                            type="button"
                            onClick={e => atualizaStatus(e, "Aprovado")}
                            className='flex m-2 items-center justify-center text-white bg-green-700 hover:bg-green-800 text-[14px] h-[30px] w-[120px] rounded-sm font-medium transition duration-300'>
                            <span className='mr-2'><FaCheck /></span>Aprovar
                        </button>
                        <button
                            onClick={e => atualizaStatus(e, "Reprovado")}
                            type="button"
                            className='flex m-2 items-center justify-center text-white bg-orange-600 hover:bg-orange-700 text-[14px] h-[30px] w-[120px] rounded-sm font-medium transition duration-300'>
                            <span className='mr-2'><MdDelete /></span>Reprovado
                        </button>
                        <button
                            type="button"
                            onClick={e => deleteRequirements(e)}
                            className='flex m-2 items-center justify-center text-white bg-red-700 hover:bg-red-800 text-[14px] h-[30px] w-[120px] rounded-sm font-medium'>
                            <span className='mr-2'><MdDelete /></span>Excluir
                        </button>
                    </section>
                )}
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
            {published && (
                <Notification message="Publicado com sucesso." onClose={() => setPublished(false)} />
            )}
            {approved && <Notification message="Requerimento aprovado com sucesso." onClose={() => setApproved(false)} type="success" />}
            {reproved && <Notification message="Requerimento reprovado com sucesso." onClose={() => setReproved(false)} type="warning" />}
            {deleted && <Notification message="Requerimento excluído com sucesso." onClose={() => setDeleted(false)} type="error" />}
            <ConfirmationModal
                open={showConfirm}
                title="Confirmação"
                message={`Tem certeza que deseja excluir o requerimento de promoção para \"${promoted}\"? Essa ação não poderá ser desfeita.`}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                confirmText="Excluir"
                cancelText="Cancelar"
            />
        </div>
    );
};

export default FormReq;
