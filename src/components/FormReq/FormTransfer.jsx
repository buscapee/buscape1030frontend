import React, { useContext, useEffect, useState } from "react";
import { RequirementsContext } from "../../context/Requirements";
import { SystemContext } from "../../context/SystemContext";
import { RhContext } from "../../context/RhContext";
import { FaFloppyDisk, FaEye } from "react-icons/fa6";
import { FaCheck } from "react-icons/fa";
import { MdDelete, MdEdit } from "react-icons/md";
import ConfirmationModal from "../ConfirmationModal";
import Notification from "../Notification/Notification";

const FormTransfer = ({ requerimentSelected }) => {
  const {
    createRequerimentTransfer,
    deleteRequerimentTransfer,
    editRequerimentTransfer,
    loadingDocs,
  } = useContext(RequirementsContext);
  const { rhStatus } = useContext(RhContext);
  const { infoSystem } = useContext(SystemContext);
  const [operator, setOperator] = useState({});
  const [transferido, setTransferido] = useState("");
  const [patent, setPatent] = useState("");
  const [reason, setReason] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [status, setStatus] = useState("");
  const [crhAnalysis, setCrhAnalysis] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [approved, setApproved] = useState(false);
  const [reproved, setReproved] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [envolvido, setEnvolvido] = useState("");
  const [nickNovo, setNickNovo] = useState("");
  const [tagNova, setTagNova] = useState("");
  const [tipoTransferencia, setTipoTransferencia] = useState("Transferência de Conta");

  useEffect(() => {
    setOperator(JSON.parse(localStorage.getItem("@Auth:Profile")));
    if (requerimentSelected) {
      setTransferido(requerimentSelected.transferido || "");
      setTagNova(requerimentSelected.tagNova || "");
      setPatent(requerimentSelected.patent || "");
      setReason(requerimentSelected.reason || "");
      setNickNovo(requerimentSelected.nickNovo || "");
      setEnvolvido(requerimentSelected.transferido || "");
      setCreatedAt(
        requerimentSelected.createdAt
          ? requerimentSelected.createdAt.substring(0, 16)
          : ""
      );
      setStatus(requerimentSelected.status || "");
      setCrhAnalysis(requerimentSelected.crhAnalysis || "");
    } else {
      setTransferido("");
      setTagNova("");
      setPatent("");
      setReason("");
      setNickNovo("");
      setEnvolvido("");
      setCreatedAt("");
      setStatus("");
      setCrhAnalysis("");
    }
  }, [requerimentSelected]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validação dos campos obrigatórios
    if (!envolvido.trim() || !reason.trim()) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }
    const data = {
      transferido: envolvido.trim(),
      reason: reason.trim(),
      nickNovo: nickNovo || "",
      tagNova: tagNova || "",
      tipoTransferencia: tipoTransferencia || "Transferência de Conta",
    };
    createRequerimentTransfer(data);
    setEnvolvido("");
    setNickNovo("");
    setTagNova("");
    setPatent("");
    setReason("");
    setTipoTransferencia("Transferência de Conta");
  };

  const deleteRequirements = () => {
    const data = {
      idUser: operator._id,
      idRequirements: requerimentSelected._id,
    };
    deleteRequerimentTransfer(data);
    setDeleted(true);
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleDeleteClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmDelete = () => {
    setShowConfirm(false);
    deleteRequirements();
  };

  const handleCancelDelete = () => setShowConfirm(false);

  const atualizaStatus = async (e, status) => {
    e.preventDefault();
    const data = {
      idUser: operator._id,
      idRequirements: requerimentSelected._id,
      statusRequirements: status,
    };
    await rhStatus(data);
    if (status === "Aprovado") setApproved(true);
    if (status === "Reprovado") setReproved(true);
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const data = {
      idRequirements: requerimentSelected._id,
      transferido: envolvido,
      nickNovo,
      tagNova,
      tipoTransferencia,
      reason,
      statusRequirements: status,
      crhAnalysis,
      createdAt,
    };
    await editRequerimentTransfer(data);
    setIsEditing(false);
    window.location.reload();
  };

  function formatLogDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleString("pt-BR");
  }

  return (
    <div className="flex flex-col items-center w-full">
      <form
        onSubmit={isEditing ? handleSaveEdit : handleSubmit}
        className="bg-white rounded shadow border border-gray-200 w-full max-w-3xl mx-auto flex flex-col gap-6 mt-6"
        style={{ padding: 0 }}
      >
        <div className="rounded-t bg-[#14532d] px-6 py-3 text-white font-bold text-lg border-b border-green-900">
          Efetuar Transferência
        </div>
        <div className="flex flex-col gap-4 px-6 py-6 pb-2">
          <div className="flex flex-col gap-2">
            <label className="font-semibold">Operador:</label>
            <input
              type="text"
              className="border rounded px-3 py-2 bg-gray-100"
              value={
                !requerimentSelected
                  ? operator.nickname
                  : requerimentSelected.operator
              }
              disabled
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold">Nick do Envolvido</label>
            <input
              type="text"
              className="border rounded px-3 py-2 bg-white"
              value={requerimentSelected ? (requerimentSelected.promoted || requerimentSelected.transferido || "") : envolvido || ""}
              onChange={e => setEnvolvido(e.target.value)}
              required
              placeholder="Digite o nick do envolvido"
              disabled={requerimentSelected && !isEditing}
            />
          </div>
          <div className="flex flex-row gap-4">
            <div className="flex flex-col gap-2 w-1/2">
              <label className="font-semibold">Nick Novo</label>
              <input
                type="text"
                className="border rounded px-3 py-2 bg-white"
                value={nickNovo || ""}
                onChange={e => setNickNovo(e.target.value)}
                placeholder="Digite o novo nick"
                disabled={requerimentSelected && !isEditing}
              />
            </div>
            <div className="flex flex-col gap-2 w-1/2">
              <label className="font-semibold">Tag Nova</label>
              <input
                type="text"
                className="border rounded px-3 py-2 bg-white"
                value={tagNova || ""}
                onChange={e => setTagNova(e.target.value)}
                placeholder="Digite a nova tag"
                disabled={requerimentSelected && !isEditing}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold">Tipo de Transferência</label>
            <select
              className="border rounded px-3 py-2 bg-white"
              value={tipoTransferencia}
              onChange={e => setTipoTransferencia(e.target.value)}
              disabled={requerimentSelected && !isEditing}
            >
              <option value="Transferência de Conta">Transferência de Conta</option>
              <option value="Transferência de nick">Transferência de nick</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold">Motivo:</label>
            <textarea
              className="border rounded px-3 py-2 min-h-[100px] bg-gray-100"
              value={reason || ""}
              placeholder="Digite o motivo da transferência"
              onChange={(e) => setReason(e.target.value)}
              required
              disabled={requerimentSelected && !isEditing}
            />
          </div>
          {isEditing && (
            <>
              <div className="flex flex-col gap-2">
                <label className="font-semibold">Data e Hora:</label>
                <input
                  type="datetime-local"
                  value={createdAt || ""}
                  onChange={(e) => setCreatedAt(e.target.value)}
                  className="border rounded px-3 py-2 bg-white"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-semibold">Status:</label>
                <select
                  value={status || ""}
                  onChange={(e) => setStatus(e.target.value)}
                  className="border rounded px-3 py-2 bg-white"
                >
                  <option value="Pendente">Pendente</option>
                  <option value="Aprovado">Aprovado</option>
                  <option value="Reprovado">Reprovado</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-semibold">Análise do CRH:</label>
                <textarea
                  className="border rounded px-3 py-2 min-h-[60px] bg-gray-100"
                  value={crhAnalysis || ""}
                  placeholder="Digite o motivo da análise do CRH"
                  onChange={(e) => setCrhAnalysis(e.target.value)}
                />
              </div>
            </>
          )}
        </div>
        {/* Botões de ação conforme status */}
        {!requerimentSelected && !loadingDocs && !isEditing && (
          <button
            className="flex items-center gap-2 bg-[#14532d] hover:bg-[#174422] text-white font-semibold px-5 py-2 rounded shadow transition-colors duration-200 w-fit ml-6 mb-6 mt-2"
            type="submit"
          >
            <span>
              <FaFloppyDisk />
            </span>
            Publicar
          </button>
        )}
        {loadingDocs && (
          <button className="BtnActive BtnActiveDisable btn mb-2" disabled>
            <span className="SpanBtn">
              <FaFloppyDisk />
            </span>
            Aguarde...
          </button>
        )}
        {/* Pendente */}
        {requerimentSelected && requerimentSelected.status === "Pendente" && !isEditing && (
          <section className="flex row items-center justify-center mt-4 mb-2">
            <button
              type="button"
              onClick={(e) => atualizaStatus(e, "Aprovado")}
              className="flex m-2 items-center justify-center text-white bg-green-700 hover:bg-green-800 text-[14px] h-[30px] w-[120px] rounded-sm font-medium transition duration-300"
            >
              <span className="mr-2">
                <FaCheck />
              </span>
              Aprovar
            </button>
            <button
              type="button"
              onClick={(e) => atualizaStatus(e, "Reprovado")}
              className="flex m-2 items-center justify-center text-white bg-orange-600 hover:bg-orange-700 text-[14px] h-[30px] w-[120px] rounded-sm font-medium transition duration-300"
            >
              <span className="mr-2">
                <MdDelete />
              </span>
              Reprovado
            </button>
            <button
              type="button"
              onClick={handleDeleteClick}
              className="flex m-2 items-center justify-center text-white bg-red-700 hover:bg-red-800 text-[14px] h-[30px] w-[120px] rounded-sm font-medium"
            >
              <span className="mr-2">
                <MdDelete />
              </span>
              Excluir
            </button>
          </section>
        )}
        {/* Aprovado ou Reprovado */}
        {requerimentSelected && ["Aprovado", "Reprovado"].includes(requerimentSelected.status) && !isEditing && (
          <section className="flex row items-center justify-center mt-4 mb-2">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="flex m-2 items-center justify-center text-white bg-green-700 hover:bg-green-800 text-[14px] h-[30px] w-[120px] rounded-sm font-medium transition duration-300"
            >
              <span className="mr-2">
                <FaCheck />
              </span>
              Editar
            </button>
            <button
              type="button"
              onClick={handleDeleteClick}
              className="flex m-2 items-center justify-center text-white bg-red-700 hover:bg-red-800 text-[14px] h-[30px] w-[120px] rounded-sm font-medium"
            >
              <span className="mr-2">
                <MdDelete />
              </span>
              Apagar
            </button>
          </section>
        )}
        {/* Edição */}
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
      <ConfirmationModal
        open={showConfirm}
        title="Confirmação"
        message={`Tem certeza que deseja excluir o requerimento de transferência para "${transferido}"? Essa ação não poderá ser desfeita.`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Excluir"
        cancelText="Cancelar"
      />
      {/* Notificações de feedback */}
      {approved && (
        <Notification message="Requerimento aprovado com sucesso." onClose={() => setApproved(false)} type="success" />
      )}
      {reproved && (
        <Notification message="Requerimento reprovado com sucesso." onClose={() => setReproved(false)} type="warning" />
      )}
      {deleted && (
        <Notification message="Requerimento excluído com sucesso." onClose={() => setDeleted(false)} type="error" />
      )}
    </div>
  );
};

export default FormTransfer; 