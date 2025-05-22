import React, { useContext, useState, useEffect } from 'react';
import { FaFloppyDisk, FaListUl, FaPlus } from "react-icons/fa6";
import style from './PostClasseInitial.module.css';
import { ClassesContext } from '../../context/ClassesContext';
import { RequirementsContext } from '../../context/Requirements';
import { TeamsContext } from '../../context/TeamsContext';

const PostClasseInitial = () => {
    const [student, setStudent] = useState('');
    const [reason, setReason] = useState('');
    const { loading, postCI, message } = useContext(ClassesContext);
    const { searchRequerimentsPromotedsUser, requerimentsFilter, formatarDataHora } = useContext(RequirementsContext);
    const user = JSON.parse(localStorage.getItem("@Auth:Profile"));
    const [showAll, setShowAll] = useState(false);
    const { teams } = useContext(TeamsContext);
    const [status, setStatus] = useState('Aprovado');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filtra apenas instruções iniciais
    const instrucoesIniciais = (requerimentsFilter || []).filter(req => req.classe && req.classe.toLowerCase().includes('instrução inicial'));
    const totalPages = Math.ceil(instrucoesIniciais.length / itemsPerPage);
    const paginatedInstrucoes = instrucoesIniciais.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => {
        if (showAll) {
            searchRequerimentsPromotedsUser('Aula', '');
        }
    }, [showAll, searchRequerimentsPromotedsUser]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = {
            student,
            reason,
            status
        };
        postCI(data);
    };

    // Função para buscar a equipe do instrutor
    function getEquipeDoInstrutor(nickname) {
        if (!teams || teams.length === 0) return '-';
        // Procura o instrutor como líder, vice-líder ou membro
        for (const team of teams) {
            if (team.leader === nickname || team.viceLeader === nickname) {
                return team.nameTeams;
            }
            if (Array.isArray(team.members) && team.members.some(m => m.nickname === nickname)) {
                return team.nameTeams;
            }
        }
        return '-';
    }

    return (
        <div className='BodyForms'>
            <article>
                <div className='contentBodyElement'>
                    <div className='contentBodyElementTitle '>
                        <h3>Menu Rápido</h3>
                    </div>
                    <ul>
                        <li><button className='contentBodyElementMenu' onClick={() => setShowAll(false)}>Postar Instrução<span><FaPlus /></span></button></li>
                        <li><button className='contentBodyElementMenu' onClick={() => setShowAll(true)}>Todas as Instruções<span><FaListUl /></span></button></li>
                    </ul>
                </div>
            </article>
            <main>
                {!showAll ? (
                    <div className='DivForm'>
                        <div>
                            <h2>Postar aula</h2>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <label>
                                * Aluno:
                                <input type="text"
                                    value={student}
                                    onChange={(e) => setStudent(e.target.value)}
                                    required
                                    placeholder='Digite o nick do militar que teve aula.'
                                />
                            </label>
                            <label>
                                * Aula:
                                <input type="text"
                                    value={`Instrução Inicial`}
                                    required
                                    disabled
                                    placeholder='Digite o nick do militar que teve aula.'
                                />
                            </label>
                            <label>
                                * Observação:
                                <textarea placeholder='Digite as observações da aula'
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                >
                                </textarea>
                            </label>
                            <label>
                                Situação
                                <select onChange={e => setStatus(e.target.value)} value={status} required>
                                    <option value="Aprovado">Aprovado</option>
                                    <option value="Reprovado">Reprovado</option>
                                </select>
                            </label>
                            {message && <p>{message.msg}</p>}
                            {message && <p>{message.error}</p>}
                            {!loading && <button className='BtnActive btn' type="submit"> <span className='SpanBtn'><FaFloppyDisk /></span>Publicar</button>}
                            {loading && <button className='BtnActive BtnActiveDisable btn' disabled> <span className='SpanBtn'><FaFloppyDisk /></span>Aguarde...</button>}
                        </form>
                    </div>
                ) : (
                    <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 12px #e0e7ef', padding: 32, maxWidth: 1400, margin: '0 auto', marginTop: 24 }}>
                        <div className='divMainForms'>
                            <h2><span> <FaListUl /></span>Lista de Instruções Iniciais</h2>
                        </div>
                        {instrucoesIniciais.length === 0 ? (
                            <div style={{ color: '#888', fontWeight: 500, fontSize: 17, padding: 24 }}>Nenhuma instrução inicial encontrada.</div>
                        ) : (
                            <>
                            <table className='table table-striped table-bordered table-hover' style={{ width: '100%', background: '#fff', fontSize: 16, borderRadius: 10, overflow: 'hidden', marginTop: 12 }}>
                                <thead style={{ background: '#f5f5f5' }}>
                                    <tr>
                                        <th style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 700 }}>#</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 700 }}>Instrutor</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 700 }}>Aluno</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 700 }}>Data</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 700 }}>Observação</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 700 }}>Equipe</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 700 }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedInstrucoes.map((req, idx) => (
                                        <tr key={idx} style={{ background: ((currentPage - 1) * itemsPerPage + idx) % 2 === 0 ? '#fff' : '#f7f7f7' }}>
                                            <td style={{ textAlign: 'center', fontWeight: 600 }}>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                                            <td>{req.operator}</td>
                                            <td>{req.promoted}</td>
                                            <td>{formatarDataHora(req.createdAt)}</td>
                                            <td>{req.reason}</td>
                                            <td>{getEquipeDoInstrutor(req.operator)}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                {req.status === 'Aprovado' ? (
                                                    <span className='TagAprovado' style={{ minWidth: 100, display: 'inline-block', textAlign: 'center', padding: '6px 0' }}>{req.status}</span>
                                                ) : (
                                                    <span className='TagReprovado' style={{ minWidth: 100, display: 'inline-block', textAlign: 'center', padding: '6px 0' }}>{req.status}</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {totalPages > 1 && (
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 24 }}>
                                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={{ padding: '6px 18px', borderRadius: 6, border: 'none', background: '#5b714a', color: '#fff', fontWeight: 600, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}>Anterior</button>
                                    <span style={{ fontWeight: 700, fontSize: 16 }}>Página {currentPage} de {totalPages}</span>
                                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{ padding: '6px 18px', borderRadius: 6, border: 'none', background: '#5b714a', color: '#fff', fontWeight: 600, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}>Próxima</button>
                                </div>
                            )}
                            </>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default PostClasseInitial;