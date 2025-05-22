import React, { useContext, useEffect } from 'react';
import { UserContext } from '../../context/UserContext';
import Preloader from "../../assets/preloader.gif"
import { FaCrown } from "react-icons/fa";

const DpanelPermissions = () => {
    const { listPermissions, loading, setLoading, usersPermissions } = useContext(UserContext);

    useEffect(() => {
        setLoading(true);
        listPermissions();
    }, []);

    {/* Filtra administradores com nickname DOPSystem */ }
    const dopSystemAdmin = usersPermissions.filter(admin => admin.userType === "Admin" && admin.nickname === "DMESystem");

    {/* Filtra outros administradores */ }
    const otherAdmins = usersPermissions.filter(admin => admin.userType === "Admin" && admin.nickname !== "DMESystem");

    {/* Combina as duas listas, colocando DOPSystem primeiro */ }
    const combinedAdmins = [...dopSystemAdmin, ...otherAdmins];
    // Renderiza o carregador enquanto espera pela resposta da API
    if (loading) {
        return (
            <div className='flex w-full items-center justify-center h-full'>
                <img src={Preloader} alt="Loading..." />
            </div>
        );
    }



    return (
        <>
            {!loading && (
                <div className="flex flex-col items-center p-4 sm:p-8">
                    <h1 className="text-2xl font-bold mb-4">Controle de Permissões</h1>

                    {/* Admins */}
                    <div className="w-full max-w-lg mb-8">
                        <h2 className="text-xl font-semibold mb-2">Admins</h2>
                        <p className="text-gray-600 text-[13px] mb-2">
                            Administradores têm acesso completo ao sistema e podem realizar todas as operações.
                        </p>
                        <p className='text-gray-600 text-[13px] mb-2'>
                            <span className='font-bold'>Observação:</span> A conta Master não pode ser excluída ou editada por questões de segurança.
                        </p>
                        <ul className="space-y-4">
                            {combinedAdmins.map(admin => (
                                <li key={admin.id} className="p-4 border rounded-lg shadow-md bg-[#fff] flex items-center gap-4">
                                    <img src={`https://www.habbo.com.br/habbo-imaging/avatarimage?img_format=png&user=${admin.nickname}&headonly=1&direction=3&head_direction=3&size=m`} alt={admin.nickname} className="w-12 h-12 rounded-full border border-gray-200" />
                                    <div>
                                        <h3 className="text-lg font-semibold flex items-center">
                                        {admin.nickname === "DMESystem" ? (
                                            <>
                                                {admin.nickname} <span className='text-amber-600 relative bottom-[6px] left-[-5px] rotate-[40deg]'><FaCrown /></span>
                                            </>
                                        ) : (
                                            admin.nickname
                                        )}
                                    </h3>
                                    <p className="text-gray-600">{admin.patent}</p>
                                    </div>
                                </li>
                            ))}


                        </ul>
                    </div>

                    {/* Setor de Inteligência */}
                    <div className="w-full max-w-lg mb-8">
                        <h2 className="text-xl font-semibold mb-2">Setor de Inteligência</h2>
                        <p className="text-gray-600 text-[13px] mb-2">
                            O Setor de Inteligência tem permissões elevadas para gerenciar recursos em todas as equipes criando aulas, documentos e afins, promover para todos os cargos independentemente da regra, excluir requerimentos.
                        </p>
                        <ul className="space-y-4">
                            {usersPermissions.filter(user => user.userType === "Diretor" || user.userType === "Setor de Inteligência")
                                .map(user => (
                                    <li key={user.id} className="p-4 border rounded-lg shadow-md bg-[#fff] flex items-center gap-4">
                                        <img src={`https://www.habbo.com.br/habbo-imaging/avatarimage?img_format=png&user=${user.nickname}&headonly=1&direction=3&head_direction=3&size=m`} alt={user.nickname} className="w-12 h-12 rounded-full border border-gray-200" />
                                        <div>
                                            <h3 className="text-lg font-semibold">{user.nickname}</h3>
                                            <p className="text-gray-600">{user.patent}</p>
                                        </div>
                                    </li>
                                ))}
                        </ul>
                    </div>

                    {/* Recursos Humanos */}
                    <div className="w-full max-w-lg mb-8">
                        <h2 className="text-xl font-semibold mb-2">Centro de Recursos Humanos</h2>
                        <p className="text-gray-600 text-[13px] mb-2">
                            O Centro de Recursos Humanos gerencia questões relacionadas aos funcionários e políticas da empresa.
                        </p>
                        <ul className="space-y-4">
                            {usersPermissions.filter(rh => rh.userType === "Recursos Humanos")
                                .map(rh => (
                                    <li key={rh.id} className="p-4 border rounded-lg shadow-md bg-[#fff] flex items-center gap-4">
                                        <img src={`https://www.habbo.com.br/habbo-imaging/avatarimage?img_format=png&user=${rh.nickname}&headonly=1&direction=3&head_direction=3&size=m`} alt={rh.nickname} className="w-12 h-12 rounded-full border border-gray-200" />
                                        <div>
                                        <h3 className="text-lg font-semibold">{rh.nickname}</h3>
                                        <p className="text-gray-600">{rh.patent}</p>
                                        </div>
                                    </li>
                                ))}

                        </ul>
                    </div>
                </div>
            )}
        </>
    );
}

export default DpanelPermissions;
