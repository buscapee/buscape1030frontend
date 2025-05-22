import React, { useContext, useState, useEffect } from 'react'
import Table from 'react-bootstrap/Table';
import { FaEye } from "react-icons/fa";
import FormReq from '../FormReq/FormReq';
import FormRelegation from '../FormReq/FormRelegation';
import FormWarning from '../FormReq/FormWarning';
import FormSale from '../FormReq/FormSale';
import FormContract from '../FormReq/FormContract';
import FormResignation from '../FormReq/FormResignation'
import { RhContext } from '../../context/RhContext';
import { json } from 'react-router-dom';
import { RequirementsContext } from '../../context/Requirements';
import Preloader from "../../assets/preloader.gif"
import avatarPadrao from '../../assets/DOP Padrão (com borda).png';
import { UserContext } from '../../context/UserContext';
import FormReqGratification from '../FormReq/FormReqGratification';
import FormExoneration from '../FormReq/FormExoneration';
import FormPermission from '../FormReq/FormPermission';
import FormTransfer from '../FormReq/FormTransfer';
import FormCadet from '../FormReq/FormCadet';

const TableRequirements = ({ requerimentsFilter, typeStatus }) => {

    const [requerimentSelected, RequerimentSelected] = useState([]);
    const [stateRequeri, setStateRequeri] = useState(false);
    const localStoregeUser = JSON.parse(localStorage.getItem("@Auth:Profile"))
    const { setMessege } = useContext(RhContext);
    const { loadingReq } = useContext(RequirementsContext)
    const { user, searchAllUsers } = useContext(UserContext);

    // Função para buscar a patente atual do promovido/rebaixado
    const getPatenteAtual = (nickname) => {
        if (user && user.users && Array.isArray(user.users)) {
            const found = user.users.find(u => u.nickname === nickname);
            return found ? found.patent : '';
        }
        return '';
    };

    // Buscar informações do promovido/rebaixado ao montar os cards de promoção/rebaixamento
    useEffect(() => {
        if (requerimentsFilter && requerimentsFilter.length > 0) {
            // Busca para todos os promovidos/rebaixados únicos
            const nicks = Array.from(new Set(
                requerimentsFilter
                    .filter(req => req.promoted)
                    .map(req => req.promoted)
            ));
            nicks.forEach(nick => {
                searchAllUsers(nick);
            });
        }
        // eslint-disable-next-line
    }, [requerimentsFilter]);

    return (
        <>
            {!stateRequeri && !loadingReq && (
                <div className="flex flex-col gap-6 w-full max-w-7xl ml-0 py-4">
                    {requerimentsFilter &&
                        [...requerimentsFilter].reverse().map((requirement, index) => (
                            <div key={index} className="flex flex-row bg-white dark:bg-[#181818] rounded-xl shadow-lg border border-gray-200 dark:border-[#232323] p-4 gap-4 items-start relative">
                                {/* Avatar do usuário do Habbo (operador/promotor) */}
                                <div className="flex-shrink-0">
                                    <img
                                        src={`https://www.habbo.com.br/habbo-imaging/avatarimage?img_format=png&user=${requirement.operator || ''}&direction=3&head_direction=3&size=l&action=std`}
                                        alt={requirement.operator}
                                        className="w-20 h-20 rounded-lg object-cover border-2 border-[#14532d] bg-white"
                                        onError={e => { if (e.target.src !== avatarPadrao) e.target.src = avatarPadrao; }}
                                    />
                                </div>
                                {/* Conteúdo do requerimento */}
                                <div className="flex-1 flex flex-col gap-2">
                                    <div className="flex flex-row items-center gap-2">
                                        <span className="font-bold text-lg text-[#14532d]">{requirement.operator}</span>
                                        {requirement.operatorTag && (
                                            <span className="text-xs bg-gray-200 dark:bg-[#232323] text-gray-700 dark:text-gray-200 px-2 py-0.5 rounded">{requirement.operatorTag}</span>
                                        )}
                                        {requirement.patentOperador && (
                                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">{requirement.patentOperador}</span>
                                        )}
                                    </div>
                                    {/* Título do requerimento */}
                                    <div className="flex flex-row items-center gap-2">
                                        <span className="font-semibold text-base text-[#222] dark:text-gray-100">
                                            {typeStatus === 'Promoção' && 'Promoção'}
                                            {typeStatus === 'Advertência' && 'Advertência'}
                                            {typeStatus === 'Rebaixamento' && 'Rebaixamento'}
                                            {typeStatus === 'Demissão' && 'Demissão'}
                                            {typeStatus === 'Venda' && 'Venda de Cargo'}
                                            {typeStatus === 'Contrato' && 'Contrato'}
                                            {typeStatus === 'Gratificação' && 'Gratificação'}
                                            {typeStatus === 'Permissão' && 'Permissão'}
                                            {typeStatus === 'Transferência' && 'Transferência'}
                                            {typeStatus === 'Cadete' && 'Cadete'}
                                        </span>
                                        {requirement.createdAt && (
                                            <span className="text-xs text-gray-500 ml-2">{new Date(requirement.createdAt).toLocaleString('pt-BR')}</span>
                                        )}
                                    </div>
                                    {/* Informações detalhadas */}
                                    <div className="text-sm text-gray-700 dark:text-gray-200">
                                        {typeStatus === 'Promoção' && (
                                            <>
                                                <div><b>Nick do promovido:</b> {requirement.promoted}</div>
                                                <div><b>Antiga patente:</b> {requirement.oldPatent}</div>
                                                <div><b>Nova patente:</b> {requirement.newPatent}</div>
                                                <div><b>Motivos:</b> {requirement.reason}</div>
                                                {requirement.permission && <div><b>Permissão:</b> {requirement.permission}</div>}
                                            </>
                                        )}
                                        {typeStatus === 'Advertência' && (
                                            <>
                                                <div><b>Advertido:</b> {requirement.promoted}</div>
                                                <div><b>Motivo:</b> {requirement.reason}</div>
                                            </>
                                        )}
                                        {typeStatus === 'Rebaixamento' && (
                                            <>
                                                <div><b>Rebaixado:</b> {requirement.promoted}</div>
                                                <div><b>Antiga patente:</b> {requirement.oldPatent}</div>
                                                <div><b>Nova patente:</b> {requirement.newPatent}</div>
                                                <div><b>Motivo:</b> {requirement.reason}</div>
                                            </>
                                        )}
                                        {typeStatus === 'Exoneração' && (
                                            <>
                                                <div><b>Exonerado:</b> {requirement.promoted}</div>
                                                <div><b>Motivo:</b> {requirement.reason}</div>
                                                {requirement.banidoAte && <div><b>Banido até:</b> {new Date(requirement.banidoAte).toLocaleString()}</div>}
                                                {requirement.permissor && <div><b>Permissor:</b> {requirement.permissor}</div>}
                                                {requirement.anexoProvas && <div><b>Anexo das Provas:</b> {requirement.anexoProvas}</div>}
                                            </>
                                        )}
                                        {typeStatus === 'Demissão' && (
                                            <>
                                                <div><b>Demitido:</b> {requirement.promoted}</div>
                                                <div><b>Motivo:</b> {requirement.reason}</div>
                                            </>
                                        )}
                                        {typeStatus === 'Venda' && (
                                            <>
                                                <div><b>Comprador:</b> {requirement.promoted}</div>
                                                <div><b>Nova patente:</b> {requirement.newPatent}</div>
                                                <div><b>Valor:</b> {requirement.price}</div>
                                                <div><b>Motivo:</b> {requirement.reason}</div>
                                            </>
                                        )}
                                        {typeStatus === 'Contrato' && (
                                            <>
                                                <div><b>Contratado:</b> {requirement.promoted}</div>
                                                <div><b>Nova patente:</b> {requirement.newPatent}</div>
                                                <div><b>Motivo:</b> {requirement.reason}</div>
                                            </>
                                        )}
                                        {typeStatus === 'Gratificação' && (
                                            <>
                                                <div><b>Aplicador:</b> {requirement.operator}</div>
                                                <div><b>Gratificado:</b> {requirement.promoted}</div>
                                                <div><b>Quantidade:</b> {requirement.amount}</div>
                                                <div><b>Motivo:</b> {requirement.reason}</div>
                                            </>
                                        )}
                                        {typeStatus === 'Permissão' && (
                                            <>
                                                <div><b>Aplicador:</b> {requirement.operator}</div>
                                                <div><b>Nick do policial autorizado:</b> {requirement.authorized}</div>
                                                <div><b>Nick do policial promovido:</b> {requirement.promoted}</div>
                                                <div><b>Observação:</b> {requirement.reason}</div>
                                            </>
                                        )}
                                        {typeStatus === 'Cadete' && (
                                            <>
                                                <div><b>Contratante:</b> {requirement.operator}</div>
                                                <div><b>Cadete:</b> {requirement.promoted}</div>
                                                <div><b>Patente:</b> {requirement.patent || 'Cadete'}</div>
                                                <div><b>Motivo:</b> {requirement.reason}</div>
                                            </>
                                        )}
                                        {typeStatus === 'Transferência' && (
                                            <>
                                                <div><b>Nick do Envolvido:</b> {requirement.promoted || requirement.transferido}</div>
                                                <div><b>Novo Nick:</b> {requirement.nickNovo}</div>
                                                <div><b>Nova Tag:</b> {requirement.tagNova}</div>
                                                <div><b>Tipo de Transferência:</b> {requirement.tipoTransferencia}</div>
                                                <div><b>Motivo:</b> {requirement.reason}</div>
                                            </>
                                        )}
                                    </div>
                                    {/* Status */}
                                    <div className="mt-2">
                                        {requirement.status === "Pendente" ? (
                                            <span className="TagPendente">{requirement.status}</span>
                                        ) : requirement.status === "Aprovado" ? (
                                            <span className="TagAprovado">{requirement.status}</span>
                                        ) : (
                                            <span className="TagReprovado">{requirement.status}</span>
                                        )}
                                    </div>
                                </div>
                                {/* Botão de ver detalhes */}
                                {localStoregeUser && (localStoregeUser.userType === "Admin" || localStoregeUser.userType === "Diretor" || localStoregeUser.userType === "Recursos Humanos") && (
                                    <button
                                        onClick={() => {
                                            setStateRequeri(true);
                                            RequerimentSelected(requirement);
                                            setMessege('');
                                        }}
                                        className="absolute top-4 right-4 bg-[#14532d] hover:bg-[#166534] text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition-all duration-200"
                                    >
                                        <FaEye /> Ver
                                    </button>
                                )}
                            </div>
                        ))}
                </div>
            )}

            {stateRequeri && typeStatus === "Promoção" && <FormReq
                requerimentSelected={requerimentSelected}
            />}

            {stateRequeri && typeStatus === "Rebaixamento" && <FormRelegation
                requerimentSelected={requerimentSelected}
            />}

            {stateRequeri && typeStatus === "Advertência" && <FormWarning
                requerimentSelected={requerimentSelected}
            />}


            {stateRequeri && typeStatus === "Venda" && <FormSale
                requerimentSelected={requerimentSelected}
            />}


            {stateRequeri && typeStatus === "Demissão" && <FormResignation
                requerimentSelected={requerimentSelected}
            />}


            {stateRequeri && typeStatus === "Contrato" && <FormContract
                requerimentSelected={requerimentSelected}
            />}

            {stateRequeri && typeStatus === "Gratificação" && <FormReqGratification
                requerimentSelected={requerimentSelected}
            />}

            {stateRequeri && typeStatus === "Exoneração" && <FormExoneration
                requerimentSelected={requerimentSelected}
            />}

            {stateRequeri && typeStatus === "Permissão" && <FormPermission
                requerimentSelected={requerimentSelected}
            />}

            {stateRequeri && typeStatus === "Transferência" && <FormTransfer
                requerimentSelected={requerimentSelected}
            />}

            {stateRequeri && typeStatus === "Cadete" && <FormCadet
                requerimentSelected={requerimentSelected}
            />}

            {loadingReq &&
                <div className='h-full w-full flex items-center justify-center'>
                    <img src={Preloader} alt="Loading..." />
                </div>


            }
        </>
    )
}
export default TableRequirements
