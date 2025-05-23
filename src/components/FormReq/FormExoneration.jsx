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

const FormExoneration = ({ requerimentSelected }) => {
    const [loadingDocs, setLoadingDocs] = useState(false)
    const [envolvido, setEnvolvido] = useState('');
    const [reason, setReason] = useState('');
    const [operator, setOperator] = useState('');
    const [banidoAte, setBanidoAte] = useState('');
    const { user, searchAllUsers } = useContext(UserContext);
    const { createRequerimentExoneration, editRequerimentData } = useContext(RequirementsContext)
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
            setEnvolvido(requerimentSelected.promoted || '');
            setReason(requerimentSelected.reason || '');
            setCreatedAt(requerimentSelected.createdAt ? requerimentSelected.createdAt.substring(0, 16) : '');
            setStatus(requerimentSelected.status || '');
            setCrhAnalysis(requerimentSelected.crhAnalysis || '');
            setBanidoAte(formatDatetimeLocal(requerimentSelected.banidoAte));
        } else {
            setEnvolvido('');
            setReason('');
            setCreatedAt('');
            setStatus('');
            setCrhAnalysis('');
            setBanidoAte('');
        }
    }, [requerimentSelected]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!operator || !operator._id) return;
        const data = {
            idUser: operator._id,
            envolvido,
            observacao: reason,
            anexoProvas,
            banidoAte,
            aplicador: operator.nickname,
            promoted: envolvido
        };
        createRequerimentExoneration(data);
        setEnvolvido('');
        setReason('');
        setBanidoAte('');
    };

    const deleteRequirements = () => {
        if (!operator || !operator._id) return;
        const data = {
            idUser: operator._id,
            idRequirements: requerimentSelected._id,
            type: "exoneration"
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

    const atualizaStatus = (e, status) => {
        e.preventDefault();
        if (!operator || !operator._id) return;
        const data = {
            idUser: operator._id,
            idRequirements: requerimentSelected._id,
            statusRequirements: status
        };
        rhStatus(data);
        if (status === 'Aprovado') setApproved(true);
        if (status === 'Reprovado') setReproved(true);
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    };

    const handleSaveEdit = (e) => {
        e.preventDefault();
        if (!operator || !operator._id) return;
        const data = {
            idUser: operator._id,
            idRequirements: requerimentSelected._id,
            promoted: envolvido,
            reason,
            status,
            crhAnalysis,
            createdAt,
            permissor,
            anexoProvas,
            banidoAte
        };
        editRequerimentData(data);
        setIsEditing(false);
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    };

    // Função para formatar a data no padrão brasileiro
    function formatarData(data) {
        if (!data) return '';
        const meses = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        const d = new Date(data);
        const dia = String(d.getDate()).padStart(2, '0');
        const mes = meses[d.getMonth()];
        const ano = d.getFullYear();
        const hora = String(d.getHours()).padStart(2, '0');
        const min = String(d.getMinutes()).padStart(2, '0');
        const seg = String(d.getSeconds()).padStart(2, '0');
        return `${dia} de ${mes} de ${ano} ${hora}:${min}:${seg}`;
    }

    // Função para formatar para o padrão do input datetime-local
    function formatDatetimeLocal(dateString) {
        if (!dateString) return '';
        const d = new Date(dateString);
        // Ajusta para o fuso horário local
        const off = d.getTimezoneOffset();
        const local = new Date(d.getTime() - (off*60*1000));
        return local.toISOString().slice(0,16);
    }

    // Visualização/administração
    if (requerimentSelected) {
        return (
            <div className="flex flex-col items-center w-full">
                <form onSubmit={isEditing ? handleSaveEdit : handleSubmit} className="bg-white rounded shadow border border-gray-200 w-full max-w-3xl mx-auto flex flex-col gap-6 mt-6" style={{padding: 0}}>
                    <div className="rounded-t bg-[#14532d] px-6 py-3 text-white font-bold text-lg border-b border-green-900">Detalhes da Exoneração</div>
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
                            <label className="font-semibold">Exonerado:</label>
                            <input type="text"
                                className="border rounded px-3 py-2 bg-white"
                                value={envolvido}
                                onChange={(e) => setEnvolvido(e.target.value)}
                                disabled={requerimentSelected && !isEditing}
                                required
                                placeholder="Digite o nick do militar que será exonerado"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="font-semibold">Motivo:</label>
                            <textarea
                                className="border rounded px-3 py-2 min-h-[100px] bg-gray-100"
                                value={reason}
                                placeholder="Digite o motivo da exoneração"
                                onChange={(e) => setReason(e.target.value)}
                                disabled={requerimentSelected && !isEditing}
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="font-semibold">Banido até:</label>
                            <input type="datetime-local"
                                className="border rounded px-3 py-2 bg-white"
                                value={banidoAte}
                                onChange={(e) => setBanidoAte(e.target.value)}
                                disabled={requerimentSelected && !isEditing}
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

                    {requerimentSelected && requerimentSelected.status === "Pendente" && !isEditing && (
                        <section className='flex row items-center justify-center pb-6'>
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
                                <span className='mr-2'><MdDelete /></span>Reprovar
                            </button>
                            <button 
                                type="button"
                                onClick={handleDeleteClick}
                                className='flex m-2 items-center justify-center text-white bg-red-700 hover:bg-red-800 text-[14px] h-[30px] w-[120px] rounded-sm font-medium'>
                                <span className='mr-2'><MdDelete /></span>Excluir
                            </button>
                        </section>
                    )}

                    {/* Botões Editar e Excluir para Admin/Diretor ao visualizar */}
                    {requerimentSelected && operator && (operator.userType === 'Admin' || operator.userType === 'Diretor') && (['Aprovado','Reprovado'].includes(requerimentSelected.status)) && !isEditing && (
                        <section className='flex row items-center justify-center mt-4 mb-2'>
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
                </form>

                {/* Bloco de LOG igual ao de promoções */}
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
                                    <span className="text-gray-500 text-[13px]">{new Date(log.date).toLocaleString('pt-BR')}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {approved && <Notification message="Exoneração aprovada com sucesso." onClose={() => setApproved(false)} type="success" />}
                {reproved && <Notification message="Exoneração reprovada com sucesso." onClose={() => setReproved(false)} type="error" />}
                {deleted && <Notification message="Exoneração excluída com sucesso." onClose={() => setDeleted(false)} type="error" />}
                <ConfirmationModal
                    open={showConfirm}
                    title="Confirmação"
                    message={`Tem certeza que deseja excluir o requerimento de exoneração para \"${envolvido}\"? Essa ação não poderá ser desfeita.`}
                    onConfirm={handleConfirmDelete}
                    onCancel={handleCancelDelete}
                    confirmText="Excluir"
                    cancelText="Cancelar"
                />
            </div>
        );
    }

    // Cadastro
    return (
        <div className="flex justify-center w-full">
            <form className="bg-white rounded shadow border border-gray-200 w-full max-w-5xl mx-auto flex flex-col gap-6 mt-6" onSubmit={handleSubmit} style={{padding: 0}}>
                <div className="rounded-t bg-[#14532d] px-6 py-3 text-white font-bold text-lg border-b border-green-900">Efetuar Exoneração</div>
                <div className="flex flex-col gap-4 px-6 py-6">
                    <div className="flex flex-col gap-2">
                        <label className="font-semibold">Exonerado:</label>
                        <input type="text"
                            className="border rounded px-3 py-2 bg-white"
                            value={envolvido}
                            onChange={(e) => setEnvolvido(e.target.value)}
                            required
                            placeholder="Digite o nick do militar que será exonerado"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="font-semibold">Motivo:</label>
                        <textarea
                            className="border rounded px-3 py-2 min-h-[100px]"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            required
                            placeholder="Digite o motivo da exoneração"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="font-semibold">Banido até (Opcional):</label>
                        <input type="datetime-local"
                            className="border rounded px-3 py-2 bg-white"
                            value={banidoAte}
                            onChange={(e) => setBanidoAte(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="font-semibold">Permissor (Opcional):</label>
                        <input type="text"
                            className="border rounded px-3 py-2 bg-white"
                            value={permissor}
                            onChange={e => setPermissor(e.target.value)}
                            placeholder="Digite o nickname do Permissor"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="font-semibold">Anexo das Provas</label>
                        <input type="text"
                            className="border rounded px-3 py-2 bg-white"
                            value={anexoProvas}
                            onChange={e => setAnexoProvas(e.target.value)}
                            placeholder="Cole o link das provas"
                        />
                    </div>
                </div>
                {!requerimentSelected && !loadingDocs && !isEditing && (
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
}

export default FormExoneration; 