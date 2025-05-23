import React, { useState, useContext, useEffect } from 'react';
import { RequirementsContext } from '../../context/Requirements';
import Notification from '../Notification/Notification';
import { RhContext } from '../../context/RhContext';
import { MdDelete } from 'react-icons/md';
import { FaCheck } from 'react-icons/fa';
import { FaFloppyDisk } from 'react-icons/fa6';
import ConfirmationModal from '../ConfirmationModal';

const FormReqGratification = ({ requerimentSelected }) => {
    const { createRequerimentGratification, editRequerimentData } = useContext(RequirementsContext);
    const { rhStatus, deleteRequeriment } = useContext(RhContext);
    const [form, setForm] = useState({
        operator: '',
        gratified: '',
        amount: '',
        reason: '',
    });
    const [published, setPublished] = useState(false);
    const [approved, setApproved] = useState(false);
    const [reproved, setReproved] = useState(false);
    const [deleted, setDeleted] = useState(false);
    const [operator, setOperator] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [createdAt, setCreatedAt] = useState('');
    const [status, setStatus] = useState('');
    const [crhAnalysis, setCrhAnalysis] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("@Auth:Profile"));
        setOperator(user);
        if (requerimentSelected) {
            setForm({
                operator: requerimentSelected.operator || '',
                gratified: requerimentSelected.promoted || '',
                amount: requerimentSelected.amount || '',
                reason: requerimentSelected.reason || '',
            });
            setCreatedAt(requerimentSelected.createdAt ? requerimentSelected.createdAt.substring(0, 16) : '');
            setStatus(requerimentSelected.status || '');
            setCrhAnalysis(requerimentSelected.crhAnalysis || '');
        } else {
            setForm({ operator: user?.nickname || '', gratified: '', amount: '', reason: '' });
            setCreatedAt('');
            setStatus('');
            setCrhAnalysis('');
        }
    }, [requerimentSelected]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await createRequerimentGratification(form);
        setPublished(true);
        setForm({ operator: '', gratified: '', amount: '', reason: '' });
    };

    const handleStatus = (e, status) => {
        e.preventDefault();
        if (!operator) return;
        const data = {
            idUser: operator._id,
            idRequirements: requerimentSelected._id,
            statusRequirements: status
        };
        rhStatus(data);
        if (status === 'Aprovado') setApproved(true);
        if (status === 'Reprovado') setReproved(true);
        setTimeout(() => { window.location.reload(); }, 1000);
    };

    const handleDeleteClick = () => {
        setShowConfirm(true);
    };

    const handleConfirmDelete = () => {
        setShowConfirm(false);
        handleDelete();
    };

    const handleCancelDelete = () => setShowConfirm(false);

    const handleDelete = (e) => {
        e.preventDefault();
        if (!operator) return;
        const data = {
            idUser: operator._id,
            idRequirements: requerimentSelected._id,
            type: 'gratification'
        };
        deleteRequeriment(data);
        setDeleted(true);
        setTimeout(() => { window.location.reload(); }, 1000);
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        const data = {
            idRequirements: requerimentSelected._id,
            operator: form.operator,
            promoted: form.gratified,
            amount: form.amount,
            reason: form.reason,
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

    // Visualização/administração
    if (requerimentSelected) {
        return (
            <div className="flex flex-col items-center w-full">
                <form className="bg-white rounded shadow border border-gray-200 w-full max-w-3xl mx-auto flex flex-col gap-6 mt-6" style={{padding: 0}}>
                    <div className="rounded-t bg-[#14532d] px-6 py-3 text-white font-bold text-lg border-b border-green-900">Detalhes da Gratificação</div>
                    <div className="flex flex-col gap-4 px-6 py-6">
                        <div className="flex flex-col gap-2">
                            <label className="font-semibold">Aplicador:</label>
                            <input type="text" value={form.operator} disabled className="border rounded px-3 py-2 bg-gray-100" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="font-semibold">Gratificado:</label>
                            <input type="text" value={form.gratified} disabled className="border rounded px-3 py-2 bg-white" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="font-semibold">Quantidade:</label>
                            <input type="number" value={form.amount} disabled className="border rounded px-3 py-2 bg-white" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="font-semibold">Motivo:</label>
                            <textarea value={form.reason} disabled className="border rounded px-3 py-2 min-h-[100px] bg-gray-100" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="font-semibold">Data e Hora:</label>
                            <input
                                type="datetime-local"
                                value={createdAt}
                                onChange={e => setCreatedAt(e.target.value)}
                                className="border rounded px-3 py-2 bg-white"
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
                                value={crhAnalysis}
                                onChange={e => setCrhAnalysis(e.target.value)}
                                placeholder="Digite o motivo da análise do CRH"
                                className="border rounded px-3 py-2 min-h-[60px] bg-gray-100"
                                disabled={!isEditing}
                            />
                        </div>
                        {/* Botões para status Pendente */}
                        {status === 'Pendente' && !isEditing && (
                            <div className="flex justify-center gap-4 mt-4">
                                <button
                                    type="button"
                                    onClick={e => handleStatus(e, 'Aprovado')}
                                    className="w-[120px] h-[40px] flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white font-semibold rounded shadow transition-colors duration-200"
                                >
                                    <FaCheck /> Aprovar
                                </button>
                                <button
                                    type="button"
                                    onClick={e => handleStatus(e, 'Reprovado')}
                                    className="w-[120px] h-[40px] flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded shadow transition-colors duration-200"
                                >
                                    <MdDelete /> Reprovado
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDeleteClick}
                                    className="w-[120px] h-[40px] flex items-center justify-center gap-2 bg-red-700 hover:bg-red-800 text-white font-semibold rounded shadow transition-colors duration-200"
                                >
                                    <MdDelete /> Excluir
                                </button>
                            </div>
                        )}
                        {/* Botões Editar e Apagar para Admin/Diretor, dentro do formulário */}
                        {operator && (operator.userType === 'Admin' || operator.userType === 'Diretor') && (['Aprovado','Reprovado'].includes(status)) && !isEditing && (
                            <div className="flex justify-center gap-4 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(true)}
                                    className="w-[120px] h-[40px] flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white font-semibold rounded shadow transition-colors duration-200"
                                >
                                    <FaCheck /> Editar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDeleteClick}
                                    className="w-[120px] h-[40px] flex items-center justify-center gap-2 bg-red-700 hover:bg-red-800 text-white font-semibold rounded shadow transition-colors duration-200"
                                >
                                    <MdDelete /> Apagar
                                </button>
                            </div>
                        )}
                        {isEditing && (
                            <div className="flex justify-end gap-4 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="w-[120px] h-[40px] flex items-center justify-center gap-2 bg-[#374151] hover:bg-[#4b5563] text-white font-semibold rounded shadow transition-colors duration-200"
                                >
                                    <MdDelete /> Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveEdit}
                                    className="w-[120px] h-[40px] flex items-center justify-center gap-2 bg-[#14532d] hover:bg-[#174422] text-white font-semibold rounded shadow transition-colors duration-200"
                                >
                                    <FaFloppyDisk /> Salvar
                                </button>
                            </div>
                        )}
                    </div>
                </form>
                {/* Bloco de logs centralizado, logo abaixo do formulário */}
                {requerimentSelected && requerimentSelected.logs && requerimentSelected.logs.length > 0 && (
                    <div className="w-full max-w-3xl mx-auto mt-6 bg-white border border-gray-200 rounded shadow">
                        <div className="font-bold px-6 py-3 border-b border-gray-100 bg-gray-50">Log</div>
                        <div className="flex flex-col gap-0">
                            {requerimentSelected.logs.slice().reverse().map((log, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-[15px] px-6 py-3 border-b border-gray-100 text-gray-800">
                                    <span className="font-semibold text-blue-700 mr-2">{log.user}</span>
                                    <span className="mr-2">{log.action} essa(e) {log.type}</span>
                                    <span className="text-gray-500 text-[13px]">{formatLogDate(log.date)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {published && <Notification message="Publicado com sucesso." onClose={() => setPublished(false)} />}
                {approved && <Notification message="Requerimento aprovado com sucesso." onClose={() => setApproved(false)} type="success" />}
                {reproved && <Notification message="Requerimento reprovado com sucesso." onClose={() => setReproved(false)} type="warning" />}
                {deleted && <Notification message="Requerimento excluído com sucesso." onClose={() => setDeleted(false)} type="error" />}
                <ConfirmationModal
                    open={showConfirm}
                    title="Confirmação"
                    message={`Tem certeza que deseja excluir o requerimento de gratificação para \"${form.gratified}\"? Essa ação não poderá ser desfeita.`}
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
                <div className="rounded-t bg-[#14532d] px-6 py-3 text-white font-bold text-lg border-b border-green-900">Efetuar Gratificação</div>
                <div className="flex flex-col gap-4 px-6 py-6">
                    <div className="flex flex-col gap-2">
                        <label className="font-semibold">Aplicador:</label>
                        <input type="text" name="operator" value={form.operator} disabled className="border rounded px-3 py-2 bg-gray-100" placeholder="Digite o nick do aplicador" required />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="font-semibold">Gratificado:</label>
                        <input type="text" name="gratified" value={form.gratified} onChange={handleChange} className="border rounded px-3 py-2 bg-white" placeholder="Digite o nick do gratificado" required />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="font-semibold">Quantidade:</label>
                        <input type="number" name="amount" value={form.amount} onChange={handleChange} className="border rounded px-3 py-2 bg-white" placeholder="Digite a quantidade de gratificação" required min="-500" max="50" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="font-semibold">Motivo:</label>
                        <textarea name="reason" value={form.reason} onChange={handleChange} className="border rounded px-3 py-2 min-h-[100px]" placeholder="Digite o motivo da gratificação" required />
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
                {published && (
                    <Notification message="Requerimento de gratificação publicado com sucesso." onClose={() => setPublished(false)} position="bottom-right" />
                )}
            </form>
        </div>
    );
};

export default FormReqGratification; 