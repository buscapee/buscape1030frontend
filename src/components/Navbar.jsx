import { useContext, useState, useRef, useEffect } from "react";
import { RxHamburgerMenu } from "react-icons/rx";
import { IoMdClose, IoMdMail } from "react-icons/io";
import { CiSearch } from "react-icons/ci";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { UserContext } from "../context/UserContext";
import LogoDOP from '../assets/logodop.png';
import { AuthContext } from "../context/AuthContext";
import { FaUser } from 'react-icons/fa';

const Navbar = () => {
  const infoProfileUser = JSON.parse(localStorage.getItem("@Auth:Profile"));
  const [showSidebar, setShowSidebar] = useState(false);
  const activeSidebar = () => setShowSidebar(!showSidebar);
  const location = useLocation();
  const navigate = useNavigate();

  const { searchAllUsers, user } = useContext(UserContext);
  const [search, setSearch] = useState("");

  // Dropdown de perfil
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { logout } = useContext(AuthContext);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (location.pathname === "/dpanel") {
    return null; // Não renderiza o Header
  }

  return (
    <>
      <div className="h-[61px] w-[100vw] bg-[#181818] fixed top-0 left-0 z-10 flex items-center">
        <header className="w-full h-full flex flex-row items-center justify-between px-4">
          {/* Botão de menu flutuante no canto superior esquerdo */}
          {!showSidebar && (
          <button
            className="absolute top-2 left-4 z-20 p-2 bg-[#151515] text-white rounded-md shadow-md focus:outline-none transition"
            onClick={activeSidebar}
          >
              <RxHamburgerMenu size={24} />
          </button>
          )}
          {/* Logo e nome do sistema, agora com margem à esquerda para não sobrepor o botão */}
          <div className="flex items-center ml-16">
            <NavLink to="/home" className="flex items-center gap-2 select-none" style={{ textDecoration: 'none' }}>
              <img src={LogoDOP} alt="Logo DME" style={{ width: 38, height: 38 }} />
              <span style={{ fontWeight: 700, fontSize: 22, letterSpacing: 0.5 }}>
                <span style={{ color: '#fff' }}>DME</span><span style={{ color: '#fff' }}>System</span>
              </span>
            </NavLink>
          </div>
          {/* Conteúdo central da navbar */}
          <div className="w-[60%] flex items-center justify-center "></div>

          {/* Input de pesquisa e perfil do usuário */}
          <div className="flex items-center">
            {infoProfileUser && (
              <div className="flex items-center mr-10 relative" ref={dropdownRef}>
                {/* Ícone de mensagem ao lado do avatar */}
                <button
                  className="flex items-center justify-center mr-2 bg-transparent border-none outline-none cursor-pointer"
                  style={{ padding: 0 }}
                  onClick={() => navigate('/mensagem-privada')}
                  title="Mensagens"
                >
                  <IoMdMail size={28} color="#fff" />
                </button>
                <button
                  className="flex flex-col items-center justify-center mr-2 bg-transparent border-none outline-none cursor-pointer"
                  style={{ padding: 0 }}
                  onClick={() => setDropdownOpen((open) => !open)}
                >
                  <h2 className="m-0 font-bold text-sm leading-[10px] text-left w-full text-white">
                    {infoProfileUser.nickname}
                  </h2>
                  <span className="text-xs text-left w-full text-white">{infoProfileUser.patent}</span>
                </button>
                <div
                  className="imgSidebar border rounded-full overflow-hidden min-w-14 max-w-6 min-h-14 max-h-10 bg-[url('../')] bg-cover bg-center cursor-pointer"
                  onClick={() => setDropdownOpen((open) => !open)}
                >
                  <img
                    className="m-0 relative bottom-3"
                    src={`https://www.habbo.com.br/habbo-imaging/avatarimage?&user=${infoProfileUser.nickname}&action=std&direction=3&head_direction=3&img_format=png&gesture=sml&headonly=0&size=b`}
                    alt="Avatar"
                  />
                </div>
                {dropdownOpen && (
                  <div className="absolute right-0 top-12 bg-white shadow-lg rounded-lg z-20 min-w-[140px] border border-gray-200">
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate(`/search/${infoProfileUser.nickname}`);
                      }}
                    >Meu perfil</button>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm border-t border-gray-100"
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate('/configuracoes');
                      }}
                    >Configurações</button>
                    {/* Remover botão Mensagem Privada do dropdown */}
                    {/* Botão DPanel para Admin e Diretor */}
                    {(infoProfileUser.userType === "Admin" || infoProfileUser.userType === "Diretor") && (
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-blue-100 text-sm text-blue-700 border-t border-gray-100"
                        onClick={() => {
                          setDropdownOpen(false);
                          navigate('/dpanel');
                        }}
                      >DPanel</button>
                    )}
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-red-100 text-sm text-red-600 border-t border-gray-100"
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                    >Logout</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Sidebar */}
        <Sidebar showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
      </div>
      {/* Banner de boas-vindas */}
      {infoProfileUser && (
        <div style={{
          width: '100vw',
          background: 'linear-gradient(90deg, rgb(48 85 19 / 74%) 0%, rgb(20 22 19 / 88%) 100%)',
          color: '#fff',
          fontWeight: 500,
          fontSize: 17,
          textAlign: 'center',
          padding: '4px 0',
          zIndex: 9,
          position: 'fixed',
          top: 61,
          left: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <FaUser style={{ marginRight: 6, fontSize: 20 }} />Olá, <span style={{ fontWeight: 600, margin: '0 6px' }}>{infoProfileUser.nickname}!</span>Seja bem-vindo ao System do Departamento Militar de Elite.
        </div>
      )}
    </>
  );
};

export default Navbar;
