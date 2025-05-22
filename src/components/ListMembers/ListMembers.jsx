import React, { useContext, useEffect, useState } from 'react'
import style from './ListMembers.module.css'
import { Link } from 'react-router-dom'
import { SystemContext } from '../../context/SystemContext';
import { UserContext } from '../../context/UserContext';
import { FaList, FaThLarge } from 'react-icons/fa';
import { RequirementsContext } from '../../context/Requirements';

const ListMembers = ({ infoSystem, select }) => {
    const { getAll } = useContext(UserContext);
    const { searchRequerimentsPromotedsUser, requerimentsFilter } = useContext(RequirementsContext);
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('card'); // 'card' ou 'list'

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            // Busca todos os usuários (até 1000 por vez)
            const data = await getAll(1, 1000);
            setAllUsers(Array.isArray(data) ? data : data?.users || []);
            setLoading(false);
        };
        fetchUsers();
    }, [getAll]);

    useEffect(() => {
        if (select === 'Exonerados') {
            searchRequerimentsPromotedsUser('Exoneração', 'Aprovado');
        }
    }, [select, searchRequerimentsPromotedsUser]);

    // Determina as patentes/cargos a exibir
    let patentes = select === 'Militares' ? infoSystem[0]?.patents : infoSystem[0]?.paidPositions;
    if (select === 'AltoComandoSupremo') {
        patentes = infoSystem[0]?.supremes || [];
    }

    // Agrupa os usuários por patente/cargo
    const usersByPatent = _.groupBy(allUsers, 'patent');

    // Função para formatar a data de admissão
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
        return `${dia} de ${mes} de ${ano}`;
    }

    if (select === 'Exonerados') {
        const exonereds = infoSystem[0]?.exonereds || [];
        // Monta um dicionário: { nickname: { tag, data } }
        const exonerationInfo = {};
        requerimentsFilter?.forEach(req => {
            if (req.typeRequirement === 'Exoneração' && req.status === 'Aprovado' && exonereds.includes(req.promoted)) {
                exonerationInfo[req.promoted] = {
                    tag: req.operator ? req.operator : '',
                    date: req.createdAt ? new Date(req.createdAt) : null
                };
            }
        });
        return (
            <div className={style.ListMembers}>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 8}}>
                    <h2 style={{margin: 0}}>Lista de Exonerados</h2>
                    <button
                        style={{
                            background: '#031149', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s',
                        }}
                        title={viewMode === 'card' ? 'Visualizar em lista' : 'Visualizar em cards'}
                        onClick={() => setViewMode(viewMode === 'card' ? 'list' : 'card')}
                    >
                        {viewMode === 'card' ? <FaList /> : <FaThLarge />}
                    </button>
                </div>
                <div className={style.PatentGroups}>
                    <div className={style.PatentBlock}>
                        <h3 className={style.PatentTitle}>Exonerados</h3>
                        {viewMode === 'card' ? (
                            <ul className={style.CardUser}>
                                {exonereds.length > 0 ? (
                                    exonereds.map((nickname) => (
                                        <li key={nickname}>
                                            <Link to={`/search/${nickname}`}>
                                                <div>
                                                    <img src={`https://www.habbo.com.br/habbo-imaging/avatarimage?img_format=png&user=${nickname}&direction=3&head_direction=3&size=m&action=std`} alt={nickname} />
                                                </div>
                                                {nickname}
                                            </Link>
                                        </li>
                                    ))
                                ) : (
                                    <li className={style.NoUser}>Nenhum exonerado registrado</li>
                                )}
                            </ul>
                        ) : (
                            <ul style={{width: '100%', padding: 0, margin: 0, listStyle: 'none'}}>
                                {exonereds.length > 0 ? (
                                    exonereds.map((nickname) => {
                                        const info = exonerationInfo[nickname];
                                        let tag = '';
                                        if (info && info.tag) {
                                            const operador = allUsers.find(u => u.nickname === info.tag);
                                            tag = operador && operador.tag ? operador.tag : '';
                                        }
                                        return (
                                            <li key={nickname} style={{
                                                padding: '8px 0',
                                                borderBottom: '1px solid #f3f3f3',
                                                fontSize: 16,
                                                color: '#14532d',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 0,
                                                fontWeight: 600
                                            }}>
                                                {nickname}
                                                {info && (
                                                    <span style={{
                                                        color: '#14532d',
                                                        fontWeight: 600,
                                                        marginLeft: 4
                                                    }}>
                                                        [{tag}] {formatarData(info.date)}
                                                    </span>
                                                )}
                                            </li>
                                        );
                                    })
                                ) : (
                                    <li className={style.NoUser}>Nenhum exonerado registrado</li>
                                )}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (select === 'Cadetes') {
        const cadetes = allUsers.filter(u => u.patent && u.patent.toLowerCase().includes('cadete'));
        return (
            <div className={style.ListMembers}>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 8}}>
                    <h2 style={{margin: 0}}>Lista de Cadetes</h2>
                    <button
                        style={{
                            background: '#031149', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s',
                        }}
                        title={viewMode === 'card' ? 'Visualizar em lista' : 'Visualizar em cards'}
                        onClick={() => setViewMode(viewMode === 'card' ? 'list' : 'card')}
                    >
                        {viewMode === 'card' ? <FaList /> : <FaThLarge />}
                    </button>
                </div>
                <div className={style.PatentGroups}>
                    <div className={style.PatentBlock}>
                        <h3 className={style.PatentTitle}>Cadetes</h3>
                        {viewMode === 'card' ? (
                            <ul className={style.CardUser}>
                                {cadetes.length > 0 ? (
                                    cadetes.map((user) => (
                                        <li key={user._id}>
                                            <Link to={`/search/${user.nickname}`}>
                                                <div>
                                                    <img src={`https://www.habbo.com.br/habbo-imaging/avatarimage?img_format=png&user=${user.nickname}&direction=3&head_direction=3&size=m&action=std`} alt={user.nickname} />
                                                </div>
                                                {user.nickname}
                                            </Link>
                                        </li>
                                    ))
                                ) : (
                                    <li className={style.NoUser}>Nenhum cadete registrado</li>
                                )}
                            </ul>
                        ) : (
                            <ul style={{width: '100%', padding: 0, margin: 0, listStyle: 'none'}}>
                                {cadetes.length > 0 ? (
                                    cadetes.map((user) => (
                                        <li key={user._id} style={{padding: '8px 0', borderBottom: '1px solid #f3f3f3', fontSize: 16, color: '#031149', display: 'flex', alignItems: 'center', gap: 8}}>
                                            {user.code ? (
                                                <span style={{color: '#14532d', fontWeight: 600, fontSize: 15}}>{user.code}</span>
                                            ) : (
                                                <span style={{color: '#14532d', fontWeight: 600, fontSize: 15}}>{user.nickname} [sem cadastro]</span>
                                            )}
                                        </li>
                                    ))
                                ) : (
                                    <li className={style.NoUser}>Nenhum cadete registrado</li>
                                )}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={style.ListMembers}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 8}}>
                <h2 style={{margin: 0}}>Lista de Membros</h2>
                <button
                    style={{
                        background: '#031149', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s',
                    }}
                    title={viewMode === 'card' ? 'Visualizar em lista' : 'Visualizar em cards'}
                    onClick={() => setViewMode(viewMode === 'card' ? 'list' : 'card')}
                >
                    {viewMode === 'card' ? <FaList /> : <FaThLarge />}
                </button>
            </div>
            {loading ? (
                <p>Carregando membros...</p>
            ) : (
                <div className={style.PatentGroups}>
                    {patentes && patentes.map((patent) => (
                        <div key={patent} className={style.PatentBlock}>
                            <h3 className={style.PatentTitle}>{patent}</h3>
                            {viewMode === 'card' ? (
                                <ul className={style.CardUser}>
                                    {usersByPatent[patent] && usersByPatent[patent].filter(user => user.patent !== "Exonerado").length > 0 ? (
                                        usersByPatent[patent]
                                            .filter(user => user.patent !== "Exonerado")
                                            .map((user) => (
                                                <li key={user._id}>
                                                    <Link to={`/search/${user.nickname}`}>
                                                        <div>
                                                            <img src={`https://www.habbo.com.br/habbo-imaging/avatarimage?img_format=png&user=${user.nickname}&direction=3&head_direction=3&size=m&action=std`} alt={user.nickname} />
                                                        </div>
                                                        {user.nickname}
                                                    </Link>
                                                </li>
                                            ))
                                    ) : (
                                        <li className={style.NoUser}>Nenhum membro nesta patente</li>
                                    )}
                                </ul>
                            ) : (
                                <ul style={{width: '100%', padding: 0, margin: 0, listStyle: 'none'}}>
                                    {usersByPatent[patent] && usersByPatent[patent].filter(user => user.patent !== "Exonerado").length > 0 ? (
                                        usersByPatent[patent]
                                            .filter(user => user.patent !== "Exonerado")
                                            .map((user) => (
                                                <li key={user._id} style={{padding: '8px 0', borderBottom: '1px solid #f3f3f3', fontSize: 16, color: '#031149', display: 'flex', alignItems: 'center', gap: 8}}>
                                                    {user.code ? (
                                                        <span style={{color: '#14532d', fontWeight: 600, fontSize: 15}}>{user.code}</span>
                                                    ) : (
                                                        <span style={{color: '#14532d', fontWeight: 600, fontSize: 15}}>{user.nickname} [sem cadastro]</span>
                                                    )}
                                                </li>
                                            ))
                                    ) : (
                                        <li className={style.NoUser}>Nenhum membro nesta patente</li>
                                    )}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ListMembers
