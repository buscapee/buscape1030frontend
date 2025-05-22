import React, { useContext, useEffect, useState } from 'react';
import style from './teams.module.css';
import { RiTeamFill } from "react-icons/ri";
import { MdEditDocument } from "react-icons/md";
import { FaUsersCog, FaAddressBook, FaListUl, FaPlus, FaUsers, FaFolderOpen } from "react-icons/fa";
import { GiArchiveRegister } from "react-icons/gi";
import { IoIosDocument } from "react-icons/io";
import { IoArrowUndo } from "react-icons/io5";
import { Link } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import { DocsContext } from '../../context/DocsContext';
import TableTeamsMembers from '../../components/TableTeamsMembers/TableTeamsMembers';
import DocsTeams from '../../components/DocsTeams/DocsTeams';
import { TeamsContext } from '../../context/TeamsContext';
import { FormAdd } from '../../components/FormTeams/FormAdd';
import FormClasses from '../../components/FormTeams/FormClasses';
import TableClasses from '../../components/TableClasses/TableClasses';
import "../forms.css"
import ForumEquipe from './ForumEquipe';
import GerenciarGrupos from '../../components/GerenciarGrupos/GerenciarGrupos';
import { SlArrowUp } from "react-icons/sl";
import { FaStackOverflow } from "react-icons/fa";
import { RequirementsContext } from '../../context/Requirements';
import { FaStar } from 'react-icons/fa';

const Teams = ({ team }) => {
  const storedUser = localStorage.getItem("@Auth:ProfileUser");
  const userLocalStorage = storedUser ? JSON.parse(storedUser) : {};

  const { searchAllUsers, user } = useContext(UserContext);
  const { searchDoc, docSelected } = useContext(DocsContext);
  const { infoTeamsArray, infoTeams, getTeams, teams } = useContext(TeamsContext);
  const { requerimentsClasses, searchRequerimentsClasses } = useContext(RequirementsContext);

  const [DocsScripts, setDocsScripts] = useState([]);
  const [userOk, setUserOK] = useState([]);
  const [typeMenu, setTypeMenu] = useState("members");
  const [addMember, setAddMember] = useState(false);
  const [openMenuRapido, setOpenMenuRapido] = useState(true);
  const [openLideranca, setOpenLideranca] = useState(true);
  const [openForum, setOpenForum] = useState(true);
  const [weekStart, setWeekStart] = useState(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // segunda-feira
    return new Date(now.setDate(diff));
  });
  const [weekEnd, setWeekEnd] = useState(() => {
    const start = new Date(weekStart);
    return new Date(start.setDate(start.getDate() + 6));
  });
  const [classesWeek, setClassesWeek] = useState([]);
  const [ranking, setRanking] = useState([]);

  const newDocFilter = Array.isArray(DocsScripts) ? DocsScripts.filter((doc) => doc.script === true) : [];

  useEffect(() => {
    const updatePage = async () => {
      document.title = `Polícia DME - ${team.nameTeams}`;
      await getTeams();
      await infoTeams(team.nameTeams);
      await searchDoc(team.nameTeams);
    }
    updatePage();
  }, [team]);

  useEffect(() => {
    const equipeAtualizada = teams.find(t => t._id === team._id);
    if (equipeAtualizada) {
      team.nameTeams = equipeAtualizada.nameTeams;
      team.leader = equipeAtualizada.leader;
      team.viceLeader = equipeAtualizada.viceLeader;
      team.members = equipeAtualizada.members;
      team.hierarquia = equipeAtualizada.hierarquia;
      team.emblema = equipeAtualizada.emblema;
    }
  }, [teams, team]);

  useEffect(() => {
    const updatePage = async () => {
      await setDocsScripts(docSelected);
    }
    updatePage()

  }, [docSelected]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (userLocalStorage && userLocalStorage.nickname) {
          await searchAllUsers(userLocalStorage.nickname);
        } else {
          console.warn('No nickname found in localStorage');
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (user && user.users) {
      setUserOK(user.users);
    }
  }, [user]);

  useEffect(() => {
    // Buscar aulas da semana para o time
    const fetchClassesWeek = async () => {
      const page = 1;
      const limit = 100;
      await searchRequerimentsClasses(team.nameTeams, page, limit);
    };
    fetchClassesWeek();
  }, [team.nameTeams, weekStart, weekEnd]);

  useEffect(() => {
    // Filtrar aulas da semana
    if (requerimentsClasses && requerimentsClasses.requirements) {
      const start = new Date(weekStart);
      start.setHours(0,0,0,0);
      const end = new Date(weekEnd);
      end.setHours(23,59,59,999);
      const filtered = requerimentsClasses.requirements.filter(classe => {
        const date = new Date(classe.createdAt);
        return date >= start && date <= end;
      });
      setClassesWeek(filtered);
      // Ranking
      const rankingMap = {};
      filtered.forEach(classe => {
        if (!rankingMap[classe.operator]) rankingMap[classe.operator] = 0;
        rankingMap[classe.operator] += 1;
      });
      const rankingArr = Object.entries(rankingMap).map(([operator, total]) => ({ operator, total }));
      rankingArr.sort((a, b) => b.total - a.total);
      setRanking(rankingArr);
    }
  }, [requerimentsClasses, weekStart, weekEnd]);

  const handlePrevWeek = () => {
    const prevStart = new Date(weekStart);
    prevStart.setDate(prevStart.getDate() - 7);
    setWeekStart(prevStart);
    const prevEnd = new Date(prevStart);
    prevEnd.setDate(prevStart.getDate() + 6);
    setWeekEnd(prevEnd);
  };
  const handleNextWeek = () => {
    const nextStart = new Date(weekStart);
    nextStart.setDate(nextStart.getDate() + 7);
    setWeekStart(nextStart);
    const nextEnd = new Date(nextStart);
    nextEnd.setDate(nextStart.getDate() + 6);
    setWeekEnd(nextEnd);
  };

  const renderMembers = (members, office) => (
    members && members
      .filter(user => user.office === office)
      .map(user => (
        <li key={user.nickname}>
          <Link to={`/search/${user.nickname}`}>
            <div>
              <img src={`https://www.habbo.com.br/habbo-imaging/avatarimage?img_format=png&user=${user.nickname}&direction=3&head_direction=3&size=m&action=std`} alt="" />
            </div>
            {user.nickname}
          </Link>
        </li>
      ))
  );

  // Funções utilitárias para labels customizados
  const departamentosCoordenador = [
    "Corregedoria",
    "Agência Brasileira de Inteligência",
    "Grupo de Operações Especiais",
    "Corpo de Oficiais Generais"
  ];
  function getLeaderLabel(team) {
    if (departamentosCoordenador.includes(team.nameTeams)) return "Coordenador";
    return "Líder";
  }
  function getViceLeaderLabel(team) {
    if (departamentosCoordenador.includes(team.nameTeams)) return "Vice-Coordenador";
    return "Vice-líder";
  }

  const departamentosDiretor = [
    "Centro de Recursos Humanos",
    "Academia Publicitária Militar"
  ];
  function getLeaderLabel(team) {
    if (departamentosDiretor.includes(team.nameTeams)) return "Diretor";
    return "Líder";
  }
  function getViceLeaderLabel(team) {
    if (departamentosDiretor.includes(team.nameTeams)) return "Vice-Diretor";
    return "Vice-líder";
  }

  return (
    <div className={style.Teams}>
      <div className={style.TeamsHeader}>
        <h2 className='font-semibold'>{team.emblema ? <><img className='w-[45px] mr-2' src={team.emblema} alt="" /></> : <RiTeamFill />} {team.nameTeams}</h2>
        <span>Membros: {infoTeamsArray.length}</span>
      </div>
      <div className={style.TeamsBody}>
        <main>
          {typeMenu === "members" && (
            <div className={style.members}>
              <div className='divMainForms'>
                <h2><span><FaListUl /></span>Lista de Membros</h2>
              </div>
              <h3>{getLeaderLabel(team)}</h3>
              <ul className={style.ListMembers}>
                <li>
                  <Link to={`/search/${team.leader}`}>
                    <div>
                      <img src={`https://www.habbo.com.br/habbo-imaging/avatarimage?img_format=png&user=${team.leader}&direction=3&head_direction=3&size=m&action=std`} alt="" />
                    </div>
                    {team.leader}
                  </Link>
                </li>
              </ul>
              <h3>{getViceLeaderLabel(team)}</h3>
              <ul className={style.ListMembers}>
                <li>
                  <Link to={`/search/${team.viceLeader}`}>
                    <div>
                      <img src={`https://www.habbo.com.br/habbo-imaging/avatarimage?img_format=png&user=${team.viceLeader}&direction=3&head_direction=3&size=m&action=std`} alt="" />
                    </div>
                    {team.viceLeader}
                  </Link>
                </li>
              </ul>
              {/* Exibir membros agrupados por cargos da hierarquia dinâmica */}
              {Array.isArray(team.hierarquia) && team.hierarquia.map((cargo, idx) => (
                <React.Fragment key={cargo}>
                  <h3>{cargo}</h3>
                  <ul className={style.ListMembers}>
                    {team.members && team.members.filter(user => user.office === cargo).map(user => (
                      <li key={user.nickname}>
                        <Link to={`/search/${user.nickname}`}>
                          <div>
                            <img src={`https://www.habbo.com.br/habbo-imaging/avatarimage?img_format=png&user=${user.nickname}&direction=3&head_direction=3&size=m&action=std`} alt="" />
                          </div>
                          {user.nickname}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </React.Fragment>
              ))}
            </div>
          )}
          {typeMenu === "docs" && (
            <div className={style.docs}>
              <div className='divMainForms'>
                <h2><span> <FaListUl /></span>Lista de Documentos</h2>
              </div>
              <div className="contentBodyElement">
                <div className="contentBodyElementTitle">
                  <h3>Documentos</h3>
                </div>
                <ul>
                  {Array.isArray(DocsScripts) && DocsScripts.filter((doc) => doc.script === false).map((doc) => (
                    <li key={doc._id}>
                      <Link to={`/doc/${doc.url}`}>{doc.nameDocs}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {typeMenu === "scripts" && (
            <div className={style.docs}>
              <div className='divMainForms'>
                <h2><span> <FaListUl /></span>Lista de Documentos</h2>
              </div>
              <div className="contentBodyElement">
                <div className="contentBodyElementTitle">
                  <h3>Scripts</h3>
                </div>
                <ul>
                  {newDocFilter.map((doc) => (
                    <li key={doc._id}>
                      <Link to={`/doc/${doc.url}`}>{doc.nameDocs}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {typeMenu === "editDocs" && (
            <div className={style.docs}>
              <div className='divMainForms'>
                <h2><span> <FaListUl /></span>Gerenciar documentação</h2>
                <Link to={`/team/${team.url}/doc/new`} className={style.btnDocs}><FaPlus /></Link>
              </div>
              <DocsTeams
                DocsScripts={DocsScripts}
                team={team}
                userOk={userOk}
              />
            </div>
          )}

          {typeMenu === "classes" && (
            <div className={style.ListMembersEdit}>
              <div className='divMainForms'>
                <h2><span> <FaListUl /></span>Postar Aula</h2>
                <button onClick={() => setAddMember(!addMember)} className={style.btnDocs}>{!addMember ? <FaPlus /> : <IoArrowUndo />}</button>
              </div>
              <FormClasses
              userLocalStorage={userLocalStorage}
                team={team}
              />
            </div>
          )}

{typeMenu === "TableClasses" && (
            <div className={style.ListMembersEdit}>
              <div className='divMainForms'>
                <h2><span> <FaListUl /></span>Postar Aula</h2>
                <button onClick={() => setAddMember(!addMember)} className={style.btnDocs}>{!addMember ? <FaPlus /> : <IoArrowUndo />}</button>
              </div>
              <TableClasses
              userLocalStorage={userLocalStorage}
                team={team}
              />
            </div>
          )}

          {typeMenu === "Controle de Membros" && (
            <div className={style.ListMembersEdit}>
              <div className='divMainForms'>
                <h2><span> <FaListUl /></span>Gerenciar Membros</h2>
                <button onClick={() => setAddMember(!addMember)} className={style.btnDocs}>{!addMember ? <FaPlus /> : <IoArrowUndo />}</button>
              </div>
              {!addMember ? (
                <TableTeamsMembers team={team} />
              ) : (
                <FormAdd team={team} />
              )}
            </div>
          )}

          {typeMenu === "forum" && (
            <ForumEquipe team={team} />
          )}

          {typeMenu === "grupo" && (
            <GerenciarGrupos team={team} />
          )}

          {typeMenu === "metaSemanal" && (
            <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #e0e7ef', padding: 24, marginBottom: 32, maxWidth: 900, margin: '0 auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 20, marginBottom: 18, color: '#222', letterSpacing: 1 }}>
                <button onClick={handlePrevWeek} style={{ background: '#f2f6fa', border: 'none', fontSize: 18, cursor: 'pointer', marginRight: 18, borderRadius: 6, padding: '3px 10px', color: '#5b714a' }}>{'<'}</button>
                <span style={{ color: '#000', fontWeight: 800, fontSize: 20, margin: '0 8px' }}>{weekStart.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} - {weekEnd.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
                <button onClick={handleNextWeek} style={{ background: '#f2f6fa', border: 'none', fontSize: 18, cursor: 'pointer', marginLeft: 18, borderRadius: 6, padding: '3px 10px', color: '#5b714a' }}>{'>'}</button>
              </div>
              <div style={{ margin: '0 0 18px 0', fontWeight: 700, fontSize: 17, color: '#5b714a', display: 'flex', alignItems: 'center', gap: 8 }}>
                <FaStar style={{ color: '#f7b731', fontSize: 18 }} /> Ranking da Semana
              </div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 18 }}>
                {ranking.length === 0 ? (
                  <div style={{ color: '#888', fontWeight: 500, fontSize: 15, margin: '0 auto' }}>Nenhum registro nesta semana.</div>
                ) : ranking.slice(0, 3).map((item, idx) => (
                  <div key={item.operator} style={{
                    background: '#f7f7f7',
                    color: '#222',
                    borderRadius: 8,
                    boxShadow: idx === 0 ? '0 2px 8px #b2e0e6' : '0 1px 4px #e0e7ef',
                    padding: '14px 22px',
                    minWidth: 170,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    fontWeight: 700,
                    fontSize: 16,
                    border: idx === 0 ? '2px solid #2176d1' : '1px solid #e0e7ef',
                    position: 'relative',
                    marginTop: 0
                  }}>
                    <img src={`https://www.habbo.com.br/habbo-imaging/avatarimage?img_format=png&user=${item.operator}&direction=3&head_direction=3&size=m&action=std`} alt="avatar" style={{ width: 48, height: 48, borderRadius: '50%', marginBottom: 6, border: '2px solid #e0e7ef', objectFit: 'cover', objectPosition: 'top' }} />
                    <span style={{ fontSize: 13, fontWeight: 600, opacity: 0.85, marginBottom: 2 }}>{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}</span>
                    <span style={{ fontSize: 16, fontWeight: 700 }}>{item.operator}</span>
                    <span style={{ fontSize: 13, marginTop: 4, fontWeight: 500, opacity: 0.9 }}>Aulas: <b>{item.total}</b></span>
                  </div>
                ))}
              </div>
              {ranking.length > 0 && (
                <div style={{ margin: '0 0 24px 0', background: '#f7f7f7', borderRadius: 8, boxShadow: '0 1px 4px #e0e7ef', padding: '10px 0' }}>
                  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, minWidth: 400 }}>
                    <thead>
                      <tr style={{ background: '#5b714a', color: '#fff', fontWeight: 700, fontSize: 15 }}>
                        <th style={{ textAlign: 'center', padding: '10px 8px', borderTopLeftRadius: 8 }}>Posição</th>
                        <th style={{ textAlign: 'center', padding: '10px 8px' }}>Aplicador</th>
                        <th style={{ textAlign: 'center', padding: '10px 8px' }}>Aulas Aplicadas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ranking.map((item, idx) => (
                        <tr key={item.operator} style={{ background: idx % 2 === 0 ? '#fff' : '#f2f6fa', fontSize: 15 }}>
                          <td style={{ textAlign: 'center', padding: '8px 0', fontWeight: 700 }}>{idx + 1}</td>
                          <td style={{ textAlign: 'center', padding: '8px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            <img src={`https://www.habbo.com.br/habbo-imaging/avatarimage?img_format=png&user=${item.operator}&direction=3&head_direction=3&size=m&action=std`} alt="avatar" style={{ width: 32, height: 32, borderRadius: '50%', marginRight: 6, border: '1.5px solid #e0e7ef', objectFit: 'cover', objectPosition: 'top' }} />
                            <span>{item.operator}</span>
                          </td>
                          <td style={{ textAlign: 'center', padding: '8px 0', fontWeight: 600 }}>{item.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div style={{ fontWeight: 700, fontSize: 17, color: '#5b714a', margin: '0 0 12px 0', letterSpacing: 0.5 }}>Aulas da Semana</div>
              <div style={{ overflowX: 'auto', borderRadius: 8, boxShadow: '0 1px 4px #e0e7ef', background: '#f9fbfd' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, minWidth: 650 }}>
                  <thead>
                    <tr style={{ background: '#5b714a', color: '#fff', fontWeight: 700, fontSize: 15 }}>
                      <th style={{ textAlign: 'left', padding: '10px 12px', borderTopLeftRadius: 8 }}>Instrutor</th>
                      <th style={{ textAlign: 'left', padding: '10px 12px' }}>Aluno</th>
                      <th style={{ textAlign: 'left', padding: '10px 12px' }}>Aula</th>
                      <th style={{ textAlign: 'left', padding: '10px 12px' }}>Data</th>
                      <th style={{ textAlign: 'left', padding: '10px 12px', borderTopRightRadius: 8 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classesWeek.length === 0 ? (
                      <tr><td colSpan={5} style={{ textAlign: 'center', color: '#888', padding: 18, fontSize: 15 }}>Nenhuma aula registrada nesta semana.</td></tr>
                    ) : classesWeek.map((classe, idx) => (
                      <tr key={classe._id || idx} style={{ background: idx % 2 === 0 ? '#fff' : '#f2f6fa', fontSize: 15 }}>
                        <td style={{ padding: '10px 12px', fontWeight: 600 }}>{classe.operator}</td>
                        <td style={{ padding: '10px 12px' }}>{classe.promoted}</td>
                        <td style={{ padding: '10px 12px' }}>{classe.classe}</td>
                        <td style={{ padding: '10px 12px' }}>{new Date(classe.createdAt).toLocaleString('pt-BR')}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '5px 14px',
                            borderRadius: 6,
                            fontWeight: 700,
                            color: classe.status === "Aprovado" ? '#fff' : '#fff',
                            background: classe.status === "Aprovado" ? '#16a34a' : '#dc2626',
                            fontSize: 14,
                            letterSpacing: 0.5
                          }}>{classe.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
        <article>
          {/* Menu Rápido */}
          <div className='contentBodyElement'>
            <div className='contentBodyElementTitle' style={{ background: '#fff', color: '#222', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 8, fontWeight: 700, fontSize: 16, padding: '12px 18px', borderBottom: '1px solid #ececec' }} onClick={() => setOpenMenuRapido(o => !o)}>
              <h3 className='flex items-center' style={{ color: '#222', background: 'transparent', fontWeight: 700, fontSize: 16, margin: 0 }}><span className='mr-2'><FaStackOverflow/></span> Menu Rápido</h3>
              <SlArrowUp style={{ transition: 'transform 0.3s', transform: openMenuRapido ? 'rotate(0deg)' : 'rotate(180deg)', color: '#222' }} />
            </div>
            {openMenuRapido && (
              <ul>
                <li><button onClick={() => setTypeMenu('members')}>Membros <span><FaUsers /></span></button></li>
                <li><button onClick={() => setTypeMenu('metaSemanal')}>Meta Semanal <span><FaListUl /></span></button></li>
                <li><button onClick={() => setTypeMenu('docs')}>Documentos<span><IoIosDocument /></span></button></li>
                <li><button onClick={() => setTypeMenu('scripts')}>Scripts<span><IoIosDocument /></span></button></li>
                <li><button onClick={() => setTypeMenu('classes')}>Postar Aula <span>< FaAddressBook /></span></button></li>
              </ul>
            )}
          </div>
          {/* Liderança */}
          {userOk.length > 0 && (team.leader === userOk[0].nickname || team.viceLeader === userOk[0].nickname || ["Admin", "Diretor"].includes(userOk[0].userType)) && (
            <div className='contentBodyElement'>
              <div className='contentBodyElementTitle' style={{ background: '#fff', color: '#222', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 8, fontWeight: 700, fontSize: 16, padding: '12px 18px', borderBottom: '1px solid #ececec' }} onClick={() => setOpenLideranca(o => !o)}>
                <h3 className='flex items-center' style={{ color: '#222', background: 'transparent', fontWeight: 700, fontSize: 16, margin: 0 }}><span className='mr-2'><FaUsersCog/></span> Liderança</h3>
                <SlArrowUp style={{ transition: 'transform 0.3s', transform: openLideranca ? 'rotate(0deg)' : 'rotate(180deg)', color: '#222' }} />
              </div>
              {openLideranca && (
                <ul>
                  <li><button onClick={() => setTypeMenu("TableClasses")}>Registro de Aulas<span><GiArchiveRegister /></span></button></li>
                  <li><button onClick={() => setTypeMenu('Controle de Membros')}>Controle de membros<span><FaUsersCog /></span></button></li>
                  <li><button onClick={() => setTypeMenu("editDocs")}>Editar documento<span><MdEditDocument /></span></button></li>
                  <li><button onClick={() => setTypeMenu("grupo")}>Grupo<span><FaUsers style={{ color: '#222' }}/></span></button></li>
                </ul>
              )}
            </div>
          )}
          {/* Fórum */}
          <div className='contentBodyElement'>
            <div className='contentBodyElementTitle' style={{ background: '#fff', color: '#222', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 8, fontWeight: 700, fontSize: 16, padding: '12px 18px', borderBottom: '1px solid #ececec' }} onClick={() => setOpenForum(o => !o)}>
              <h3 className='flex items-center' style={{ color: '#222', background: 'transparent', fontWeight: 700, fontSize: 16, margin: 0 }}><span className='mr-2'><FaFolderOpen style={{ color: '#222' }}/></span> Fórum</h3>
              <SlArrowUp style={{ transition: 'transform 0.3s', transform: openForum ? 'rotate(0deg)' : 'rotate(180deg)', color: '#222' }} />
            </div>
            {openForum && (
              <ul>
                <li><button onClick={() => setTypeMenu('forum')}>Acessar Fórum <span><FaFolderOpen style={{ color: '#222' }}/></span></button></li>
              </ul>
            )}
          </div>
        </article>
      </div>
    </div>
  );
};

export default Teams;
