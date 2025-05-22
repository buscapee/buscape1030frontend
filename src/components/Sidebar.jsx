import { useContext, useEffect, useState, useRef } from "react";
import { NavLink } from "react-router-dom";
import { SlArrowUp } from "react-icons/sl";
import {
  IoSpeedometerOutline,
  IoHomeOutline,
  IoFileTrayFullOutline,
} from "react-icons/io5";
import { MdFormatAlignLeft } from "react-icons/md";
import { CiUser } from "react-icons/ci";
import { MdPostAdd, MdAccessTime } from "react-icons/md";
import { FaRegBuilding, FaShoppingCart } from "react-icons/fa";
import { TbUsersGroup, TbLicense } from "react-icons/tb";
import { ImExit } from "react-icons/im";

import LogoDOP from "../assets/DOP Padrão (com borda).png";
import "../index.css";
import "./style.css";
import { AuthContext } from "../context/AuthContext";
import { DocsContext } from "../context/DocsContext";
import { TeamsContext } from "../context/TeamsContext";
import SidebarSearch from "./SidebarSearch";

const Sidebar = ({ showSidebar, setShowSidebar }) => {
  const { logout } = useContext(AuthContext);
  const { getTeams, teams } = useContext(TeamsContext);
  const { searchDoc } = useContext(DocsContext);

  const [showDocs, setShowDocs] = useState(false);
  const [showClasses, setShowClasses] = useState(false);
  const [showForms, setShowForms] = useState(false);
  const [documents, setDocuments] = useState([]);

  const infoProfileUser = JSON.parse(localStorage.getItem("@Auth:Profile"));
  const infoProfileUserCompleted = JSON.parse(
    localStorage.getItem("@Auth:ProfileUser")
  );

  const sidebarRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      await getTeams(localStorage.getItem("@Auth:Token"));
      const docs = await searchDoc("System");
      setDocuments(Array.isArray(docs) ? docs : []);
    };

    fetchData();
  }, [getTeams]);

  // Fecha o sidebar ao clicar fora dele
  useEffect(() => {
    if (!showSidebar) return;
    function handleClickOutside(event) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setShowSidebar(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSidebar, setShowSidebar]);

  const activeShowDocs = () => {
    setShowDocs(!showDocs);
  };

  const activeShowClasses = () => {
    setShowClasses(!showClasses);
  };

  return (
    <nav
      ref={sidebarRef}
    className={
        (showSidebar
          ? "overflow-y-auto z-10 fixed top-0 left-0 min-h-[100dvh] h-[100dvh] w-[260px] bg-[#181818] text-[#fff] shadow-2xl rounded-b-2xl duration-500 transition-all custom-scrollbar scrollbar-thin scrollbar-thumb-[#333] scrollbar-track-[#232323]"
          : "overflow-y-auto z-10 fixed top-0 left-[-260px] min-h-[100dvh] h-[100dvh] w-[260px] bg-[#181818] text-[#fff] shadow-2xl rounded-b-2xl duration-500 transition-all custom-scrollbar scrollbar-thin scrollbar-thumb-[#333] scrollbar-track-[#232323]") +
        " flex flex-col justify-between"
    }
  >
      {/* Topo com logo e nome alinhados à esquerda */}
      <div className="w-full flex flex-row items-center gap-2 bg-[#232323] py-3 px-4 rounded-t-2xl border-b border-[#222]">
        <NavLink
          onClick={() => setShowSidebar(!showSidebar)}
          className="flex flex-row items-center gap-2 select-none"
          to={"/home"}
        >
          <img className="w-[44px] h-[44px] rounded shadow border-2 border-[#fff] bg-white" src={LogoDOP} alt="Logo Polícia DME" />
        </NavLink>
        <div className="flex flex-col justify-center ml-1">
          <span className="text-[12px] font-bold leading-tight tracking-widest text-[#fff]" style={{letterSpacing: 0.5}}>
            POLÍCIA <span className="text-[#ffe600]">DME</span>
          </span>
          <span className="text-[18px] font-extrabold leading-tight text-[#fff]" style={{letterSpacing: 0.5}}>
            SYSTEM
          </span>
        </div>
      </div>
      {/* Campo de busca */}
      <div className="px-4 pt-2 pb-1 bg-[#232323]">
        <SidebarSearch />
      </div>
      {/* Menu principal */}
      <div className="flex-1 flex flex-col gap-1 px-2 pt-2 pb-4 bg-transparent">
        {/* Título do menu */}
        <div className="text-[11px] font-bold uppercase text-[#bdbdbd] mb-2 tracking-widest pl-2">MENU</div>
        <NavLink
          to={"/home"}
          onClick={() => setShowSidebar(!showSidebar)}
          className="w-full flex flex-row items-center text-[13px] px-3 py-[12px] rounded-md hover:bg-[#232323] transition-colors duration-200"
        >
          <IoHomeOutline className="mr-2 text-[16px]" />
          Home
        </NavLink>
        <NavLink
          to={"/loja"}
          onClick={() => setShowSidebar(!showSidebar)}
          className="w-full flex flex-row items-center text-[13px] px-3 py-[12px] rounded-md hover:bg-[#232323] transition-colors duration-200"
        >
          <FaShoppingCart className="mr-2 text-[16px]" />
          Loja
        </NavLink>
        <NavLink
          to={"/postclasse"}
          onClick={() => setShowSidebar(!showSidebar)}
          className="w-full flex flex-row items-center text-[13px] px-3 py-[12px] rounded-md border-t border-[#232323] hover:bg-[#232323] transition-colors duration-200"
        >
          <MdPostAdd className="mr-2 text-[16px]" />
          Postar Instrução Inicial
        </NavLink>
        <button
  onClick={activeShowDocs}
  className="w-full flex flex-row items-center justify-between text-[13px] px-3 py-[12px] rounded-md border-t border-[#232323] hover:bg-[#232323] transition-colors duration-200"
>
  <div className="flex flex-row items-center">
    <IoFileTrayFullOutline className="mr-2 text-[16px]" />
    Documentos
  </div>
  <SlArrowUp className={`mr-2 transition-transform duration-300 ${showDocs ? "rotate-180" : "rotate-0"}`} />
</button>
<ul
  className={`pl-6 bg-[#181818] text-xs overflow-hidden transition-all duration-300 rounded-lg shadow-lg mt-1 mb-2 ${showDocs ? "max-h-96 py-2" : "max-h-0 py-0"}`}
>
  {Array.isArray(documents) &&
    documents.map((doc, index) => (
      <li
        key={index}
        onClick={() => setShowSidebar(!showSidebar)}
        className="py-2 px-2 italic rounded hover:bg-[#232323] transition-colors duration-200"
      >
        <NavLink to={`/doc/${doc.url}`}>{doc.nameDocs}</NavLink>
      </li>
    ))}
</ul>
        <button
          onClick={() => setShowForms(!showForms)}
          className="w-full flex flex-row items-center justify-between text-[13px] px-3 py-[12px] rounded-md border-t border-[#232323] hover:bg-[#232323] transition-colors duration-200">
          <div className="flex flex-row items-center">
            <FaRegBuilding className="mr-2 text-[16px]" />
            Departamentos
          </div>
          <SlArrowUp className={`mr-2 transition-transform duration-300 ${showForms ? "rotate-180" : "rotate-0"}`} />
        </button>
        <ul className={`pl-6 bg-[#181818] text-xs overflow-hidden transition-all duration-300 rounded-lg shadow-lg mt-1 mb-2 ${showForms ? "max-h-96 py-2" : "max-h-0 py-0"}` }>
          {(() => {
            const centros = [
              { nome: 'Centro de Instrução' },
              { nome: 'Centro de Treinamento' },
              { nome: 'Centro de Supervisão' },
              { nome: 'Centro de Patrulha' }
            ];
            return centros.map((centro, idx) => {
              const equipe = teams && teams.find(team => team.nameTeams.toLowerCase() === centro.nome.toLowerCase());
              const url = equipe ? `/team/${equipe.url}` : '#';
              return (
                <li key={centro.nome} onClick={() => { if (equipe) setShowSidebar(!showSidebar); }} className={`py-2 px-2 italic rounded transition-colors duration-200 ${equipe ? 'hover:bg-[#232323] cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}>
                  {equipe ? (
                    <NavLink to={url}>{centro.nome}</NavLink>
                  ) : (
                    <span>{centro.nome}</span>
                  )}
                </li>
              );
            });
          })()}
          {/* Órgãos e Funções - último item, com ícone de +, agora clicável */}
          <li onClick={() => setShowSidebar(!showSidebar)} className="py-2 px-2 rounded hover:bg-[#232323] transition-colors duration-200 flex items-center gap-2 cursor-pointer">
            <NavLink to="/orgaos-funcoes" className="flex items-center gap-2">
              <span style={{fontSize: 12, display: 'flex', alignItems: 'center', marginRight: 4}}>Órgãos e Funções</span>
            </NavLink>
          </li>
        </ul>
        <button
          onClick={activeShowClasses}
          className="w-full flex flex-row items-center justify-between text-[13px] px-3 py-[12px] rounded-md border-t border-[#232323] hover:bg-[#232323] transition-colors duration-200"
        >
          <div className="flex flex-row items-center">
            <MdFormatAlignLeft className="mr-2 text-[16px]" />
            Requerimentos
          </div>
          <SlArrowUp className={`mr-2 transition-transform duration-300 ${showClasses ? "rotate-180" : "rotate-0"}`} />
        </button>
        <ul
          className={`pl-6 bg-[#181818] text-xs overflow-hidden transition-all duration-300 rounded-lg shadow-lg mt-1 mb-2 ${showClasses ? "max-h-96 py-2" : "max-h-0 py-0"}`}
        >
          <li onClick={() => setShowSidebar(!showSidebar)} className="py-2 px-2 italic rounded hover:bg-[#232323] transition-colors duration-200 w-full">
            <NavLink className={"w-full"} to={`/promotion`}>Promoções</NavLink>
          </li>
          <li onClick={() => setShowSidebar(!showSidebar)} className="py-2 px-2 italic rounded hover:bg-[#232323] transition-colors duration-200 w-full">
            <NavLink to={`/warning`}>Advertências</NavLink>
          </li>
          <li onClick={() => setShowSidebar(!showSidebar)} className="py-2 px-2 italic rounded hover:bg-[#232323] transition-colors duration-200 w-full">
            <NavLink to={`/relegation`}>Rebaixamentos</NavLink>
          </li>
          <li onClick={() => setShowSidebar(!showSidebar)} className="py-2 px-2 italic rounded hover:bg-[#232323] transition-colors duration-200 w-full">
            <NavLink to={`/resignation`}>Demissões</NavLink>
          </li>
          <li onClick={() => setShowSidebar(!showSidebar)} className="py-2 px-2 italic rounded hover:bg-[#232323] transition-colors duration-200 w-full">
            <NavLink to={`/exoneration`}>Exonerações</NavLink>
          </li>
          <li onClick={() => setShowSidebar(!showSidebar)} className="py-2 px-2 italic rounded hover:bg-[#232323] transition-colors duration-200">
            <NavLink to={`/contract`}>Contratos</NavLink>
          </li>
          <li onClick={() => setShowSidebar(!showSidebar)} className="py-2 px-2 italic rounded hover:bg-[#232323] transition-colors duration-200">
            <NavLink to={`/sale`}>Venda de Cargos</NavLink>
          </li>
          <li onClick={() => setShowSidebar(!showSidebar)} className="py-2 px-2 italic rounded hover:bg-[#232323] transition-colors duration-200">
            <NavLink to={`/gratifications`}>Gratificações</NavLink>
          </li>
          <li onClick={() => setShowSidebar(!showSidebar)} className="py-2 px-2 italic rounded hover:bg-[#232323] transition-colors duration-200">
            <NavLink to={`/transfer`}>Transferência</NavLink>
          </li>
          <li onClick={() => setShowSidebar(!showSidebar)} className="py-2 px-2 italic rounded hover:bg-[#232323] transition-colors duration-200">
            <NavLink to={`/permission`}>Permissão</NavLink>
          </li>
          <li onClick={() => setShowSidebar(!showSidebar)} className="py-2 px-2 italic rounded hover:bg-[#232323] transition-colors duration-200">
            <NavLink to={`/cadets`}>Cadetes</NavLink>
          </li>
        </ul>
        <NavLink
          to={"/servicepoint"}
          onClick={() => setShowSidebar(!showSidebar)}
          className="w-full flex flex-row items-center text-[13px] px-3 py-[12px] rounded-md hover:bg-[#232323] transition-colors duration-200"
        >
          <MdAccessTime className="mr-2 text-[16px]" />
          Ponto de serviço
        </NavLink>
        <NavLink
          to={"/members"}
          onClick={() => setShowSidebar(!showSidebar)}
          className="w-full flex flex-row items-center text-[13px] px-3 py-[12px] rounded-md hover:bg-[#232323] transition-colors duration-200"
        >
          <TbUsersGroup className="mr-2 text-[16px]" />
          Listagens
        </NavLink>
        {infoProfileUser &&
          (infoProfileUser.userType === "Admin" ||
            infoProfileUser.userType === "Diretor" ||
            infoProfileUser.userType === "Recursos Humanos") && (
            <NavLink
              to={"/endorsement"}
              onClick={() => setShowSidebar(!showSidebar)}
              className="w-full flex flex-row items-center text-[13px] px-3 py-[12px] rounded-md hover:bg-[#232323] transition-colors duration-200"
            >
              <TbLicense className="mr-2 text-[16px]" />
              Licença
            </NavLink>
          )}
        <NavLink
          to={`/search/${infoProfileUser.nickname}`}
          onClick={() => setShowSidebar(!showSidebar)}
          className="w-full flex flex-row items-center text-[13px] px-3 py-[12px] rounded-md hover:bg-[#232323] transition-colors duration-200"
        >
          <CiUser className="mr-2 text-[16px]" />
          Perfil
        </NavLink>
      </div>
      {/* Rodapé com botão de logout */}
      <div className="h-[56px] w-full flex items-center justify-center bg-[#181818] rounded-b-2xl border-t border-[#232323]">
        <button
          onClick={() => {
            setShowSidebar(!showSidebar);
            logout();
          }}
          className="w-[90%] flex flex-row items-center justify-center text-[13px] px-2 py-[10px] rounded bg-[#232323] hover:bg-[#292929] text-white transition-colors duration-300 shadow"
        >
          <ImExit className="mr-2 text-[16px]" />
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
