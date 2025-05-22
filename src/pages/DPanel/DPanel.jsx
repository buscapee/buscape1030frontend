import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { RiSettings5Fill } from 'react-icons/ri';
import { FaDatabase, FaUsersCog, FaBlogger, FaHome, FaShoppingCart, FaStar, FaUser, FaEye } from 'react-icons/fa';
import { IoIosMegaphone } from 'react-icons/io';
import { GrDocumentConfig } from 'react-icons/gr';
import { BsMicrosoftTeams } from 'react-icons/bs';
import { GoPasskeyFill } from "react-icons/go";
import { CiImageOn } from "react-icons/ci";

import Logger from '../../components/Logger/Logger';
import DocsDpanel from '../../components/DocsDpanel/DocsDpanel';
import DpanelTeams from '../../components/DpanelTeams/DpanelTeams';
import DpanelUsers from '../../components/DpanelUsers/DpanelUsers';
import styles from "./DPanel.module.css";
import DpanelPublication from '../../components/DpanelPublication/DpanelPublication';
import DpanelInfo from '../../components/DpanelInfo/DpanelInfo';
import DpanelPermissions from '../../components/DpanelPermissions/DpanelPermissions';
import DpanelLoja from '../../components/DpanelLoja/DpanelLoja';
import axiosInstance from '../../provider/axiosInstance';

const DPanel = () => {
  const [selectFunction, setSelectFunction] = useState('System');
  const [user, setUser] = useState([])
  const [honrarias, setHonrarias] = useState([]);
  const nomeRef = useRef();
  const imagemRef = useRef();
  const [editIndex, setEditIndex] = useState(null);
  const [editNome, setEditNome] = useState("");
  const [editImagem, setEditImagem] = useState("");
  const [showUsersDrop, setShowUsersDrop] = useState(false);
  const [ipTab, setIpTab] = useState('ip');
  const [searchIp, setSearchIp] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [ipList, setIpList] = useState([
    { ip: '177.54.157.16', total: 9 },
    { ip: '45.164.209.18', total: 8 },
    { ip: '45.164.211.76', total: 8 },
    { ip: '172.71.234.63', total: 8 },
    { ip: '177.54.147.116', total: 7 },
    { ip: '172.71.234.154', total: 7 },
  ]);
  const [filteredIpList, setFilteredIpList] = useState(ipList);
  const [userTabSearch, setUserTabSearch] = useState('');
  const [userTabDateFrom, setUserTabDateFrom] = useState('');
  const [userTabDateTo, setUserTabDateTo] = useState('');
  const [userTabStatus, setUserTabStatus] = useState('Todos');
  const [userList, setUserList] = useState([
    { usuario: 'audxz', total: 12273 },
    { usuario: '-Jotape-', total: 1866 },
    { usuario: '_.Bruna._', total: 1196 },
    { usuario: '-Nathan-', total: 1034 },
    { usuario: '._JrN', total: 1016 },
  ]);
  const [filteredUserList, setFilteredUserList] = useState(userList);
  const [loadingIp, setLoadingIp] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);
  const [showUserIpResult, setShowUserIpResult] = useState(false);
  const [userIpResult, setUserIpResult] = useState({ nickname: '', ips: [] });
  const [loadingUserIp, setLoadingUserIp] = useState(false);
  const [userIpsCount, setUserIpsCount] = useState({});
  const [ipUsersCount, setIpUsersCount] = useState([]);
  const [showIpUsersResult, setShowIpUsersResult] = useState(false);
  const [ipUsersResult, setIpUsersResult] = useState({ ip: '', users: [] });
  const [loadingIpUsers, setLoadingIpUsers] = useState(false);

  useEffect(() => {
    document.title = `Painel de Controle`;
    setUser(JSON.parse(localStorage.getItem('@Auth:Profile')))
  }, []);

  useEffect(() => {
    if (selectFunction === 'Honrarias') {
      axiosInstance.get('honrarias')
        .then(res => setHonrarias(res.data))
        .catch(() => setHonrarias([]));
    }
  }, [selectFunction]);

  const handleAddHonraria = async (e) => {
    e.preventDefault();
    const nome = nomeRef.current.value.trim();
    const imagem = imagemRef.current.value.trim();
    if (!nome || !imagem) return;
    try {
      const res = await axiosInstance.post('honrarias', { nome, imagem });
      setHonrarias(res.data.honrarias);
      nomeRef.current.value = '';
      imagemRef.current.value = '';
    } catch {
      // erro ao adicionar
    }
  };

  const handleEdit = (idx) => {
    setEditIndex(idx);
    setEditNome(honrarias[idx].nome);
    setEditImagem(honrarias[idx].imagem);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.put('honrarias/edit', { index: editIndex, nome: editNome, imagem: editImagem });
      setHonrarias(res.data.honrarias);
      setEditIndex(null);
      setEditNome("");
      setEditImagem("");
    } catch {}
  };

  const handleRemove = async (idx) => {
    if (!window.confirm('Tem certeza que deseja remover esta honraria?')) return;
    try {
      const res = await axiosInstance.delete('honrarias/delete', { data: { index: idx } });
      setHonrarias(res.data.honrarias);
    } catch {}
  };

  const handleSearchIp = async () => {
    setLoadingIp(true);
    try {
      const res = await axiosInstance.get('/ips', {
        params: {
          ip: searchIp,
          from: dateFrom,
          to: dateTo
        }
      });
      setFilteredIpList(res.data || []);
    } catch {
      setFilteredIpList([]);
    }
    setLoadingIp(false);
  };

  const handleResetIp = async () => {
    setSearchIp('');
    setDateFrom('');
    setDateTo('');
    setLoadingIp(true);
    try {
      const res = await axiosInstance.get('/ips');
      setFilteredIpList(res.data || []);
    } catch {
      setFilteredIpList([]);
    }
    setLoadingIp(false);
  };

  const handleSearchUser = async () => {
    setLoadingUser(true);
    try {
      const res = await axiosInstance.get('/all/users', {
        params: {
          page: 1,
          pageSize: 10000,
          nickname: userTabSearch
        }
      });
      setFilteredUserList((res.data || []).map(u => ({ usuario: u.nickname, totalIps: Array.isArray(u.ips) ? new Set(u.ips).size : 0 })));
    } catch {
      setFilteredUserList([]);
    }
    setLoadingUser(false);
  };

  const handleResetUser = async () => {
    setUserTabSearch('');
    setUserTabDateFrom('');
    setUserTabDateTo('');
    setUserTabStatus('Todos');
    setLoadingUser(true);
    try {
      const res = await axiosInstance.get('/all/users', {
        params: {
          page: 1,
          pageSize: 10000
        }
      });
      setFilteredUserList((res.data || []).map(u => ({ usuario: u.nickname, totalIps: Array.isArray(u.ips) ? new Set(u.ips).size : 0 })));
    } catch {
      setFilteredUserList([]);
    }
    setLoadingUser(false);
  };

  const handleViewUserIps = async (usuario) => {
    setShowUserIpResult(false);
    setShowIpUsersResult(false);
    setLoadingUserIp(true);
    try {
      const adminNickname = user?.nickname;
      const response = await axiosInstance.get('/loggers', { params: { nickname: usuario, adminNickname, limit: 999999 } });
      const ipMap = {};
      (response.data.logs || []).forEach(log => {
        if (!ipMap[log.ip]) {
          ipMap[log.ip] = { count: 0, lastDate: log.createdAt };
        }
        ipMap[log.ip].count += 1;
        if (new Date(log.createdAt) > new Date(ipMap[log.ip].lastDate)) {
          ipMap[log.ip].lastDate = log.createdAt;
        }
      });
      const ipsArr = Object.entries(ipMap).map(([ip, data]) => ({ ip, count: data.count, lastDate: data.lastDate }));
      ipsArr.sort((a, b) => new Date(b.lastDate) - new Date(a.lastDate));
      setUserIpResult({ nickname: usuario, ips: ipsArr });
      setShowUserIpResult(true);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setUserIpResult({ nickname: usuario, ips: [] });
      } else {
        setUserIpResult({ nickname: usuario, ips: [] });
        // Se quiser, pode exibir um toast/alerta aqui
      }
      setShowUserIpResult(true);
    }
    setLoadingUserIp(false);
  };

  const handleBackToUserList = () => {
    setShowUserIpResult(false);
    setUserIpResult({ nickname: '', ips: [] });
  };

  const handleViewIpUsers = async (ip) => {
    setShowIpUsersResult(false);
    setShowUserIpResult(false);
    setLoadingIpUsers(true);
    try {
      const adminNickname = user?.nickname;
      const response = await axiosInstance.get('/loggers', { params: { adminNickname } });
      const userMap = {};
      (response.data.logs || []).forEach(log => {
        if (log.ip === ip) {
          if (!userMap[log.user]) {
            userMap[log.user] = { count: 0, lastDate: log.createdAt };
          }
          userMap[log.user].count += 1;
          if (new Date(log.createdAt) > new Date(userMap[log.user].lastDate)) {
            userMap[log.user].lastDate = log.createdAt;
          }
        }
      });
      const usersArr = Object.entries(userMap).map(([user, data]) => ({ user, count: data.count, lastDate: data.lastDate }));
      usersArr.sort((a, b) => new Date(b.lastDate) - new Date(a.lastDate));
      setIpUsersResult({ ip: ip, users: usersArr });
      setShowIpUsersResult(true);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setIpUsersResult({ ip: ip, users: [] });
      } else {
        setIpUsersResult({ ip: ip, users: [] });
        // Se quiser, pode exibir um toast/alerta aqui
      }
      setShowIpUsersResult(true);
    }
    setLoadingIpUsers(false);
  };

  const handleBackToIpList = () => {
    setShowIpUsersResult(false);
    setIpUsersResult({ ip: '', users: [] });
  };

  // Buscar dados reais ao abrir cada aba
  useEffect(() => {
    if (selectFunction === 'UsersIPs' && ipTab === 'ip') handleResetIp();
    if (selectFunction === 'UsersIPs' && ipTab === 'user') handleResetUser();
    // eslint-disable-next-line
  }, [selectFunction, ipTab]);

  // Buscar IPs distintos para todos os usuários listados
  useEffect(() => {
    const fetchIpsCount = async () => {
      if (!filteredUserList.length) return;
      const counts = {};
      for (const userItem of filteredUserList) {
        try {
          const adminNickname = user?.nickname;
          const response = await axiosInstance.get('/loggers', { params: { adminNickname } });
          const ips = new Set((response.data.logs || []).filter(log => log.user === userItem.usuario).map(log => log.ip));
          counts[userItem.usuario] = ips.size;
        } catch (err) {
          if (err.response && err.response.status === 404) {
            counts[userItem.usuario] = 0;
          } else {
            counts[userItem.usuario] = 0;
            // Se quiser, pode exibir um toast/alerta aqui
          }
        }
        setUserIpsCount(prevCounts => ({ ...prevCounts, [userItem.usuario]: counts[userItem.usuario] }));
      }
    };
    fetchIpsCount();
    // eslint-disable-next-line
  }, [filteredUserList]);

  // Buscar IPs duplicados e quantidade de usuários distintos para cada IP
  const fetchIpUsersCount = async () => {
    setLoadingIp(true);
    try {
      const adminNickname = user?.nickname;
      const res = await axiosInstance.get('/loggers/duplicated-ips', { params: { adminNickname } });
      const arr = (res.data.duplicatedIPs || []).map(item => ({ ip: item.ip, total: item.total }));
      setIpUsersCount(arr);
      setFilteredIpList(arr);
    } catch {
      setIpUsersCount([]);
      setFilteredIpList([]);
    }
    setLoadingIp(false);
  };

  // Buscar IPs duplicados ao abrir a aba ou ao resetar
  useEffect(() => {
    if (selectFunction === 'UsersIPs' && ipTab === 'ip') fetchIpUsersCount();
    // eslint-disable-next-line
  }, [selectFunction, ipTab]);

  // Limpeza de estados de IPs/Usuários ao sair da aba de IPs
  useEffect(() => {
    if (selectFunction !== 'UsersIPs') {
      setIpTab('ip');
      setSearchIp('');
      setDateFrom('');
      setDateTo('');
      setFilteredIpList([]);
      setLoadingIp(false);
      setUserTabSearch('');
      setUserTabDateFrom('');
      setUserTabDateTo('');
      setUserTabStatus('Todos');
      setFilteredUserList([]);
      setLoadingUser(false);
      setShowUserIpResult(false);
      setUserIpResult({ nickname: '', ips: [] });
      setLoadingUserIp(false);
      setUserIpsCount({});
      setIpUsersCount([]);
      setShowIpUsersResult(false);
      setIpUsersResult({ ip: '', users: [] });
      setLoadingIpUsers(false);
    }
  }, [selectFunction]);

  return (
    <div className={`flex min-h-screen bg-gray-100 ${styles.contentDpanel}`}>
      {/* Sidebar fixa do DPanel */}
      <aside
        className="w-56 min-h-screen flex flex-col py-4 px-2 gap-1 fixed left-0 top-0 z-30"
        style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(8px)',
          borderRadius: '18px',
          boxShadow: '0 6px 32px rgba(25, 118, 210, 0.10)',
          border: '1.5px solid #e4e4e4',
          margin: 16
        }}
      >
        <nav>
          <Link
            to="/home"
            className="flex items-center gap-2 text-gray-700 hover:text-blue-700 mb-2 px-3 py-2 rounded-lg transition-all font-semibold"
            style={{ fontSize: 16 }}
          >
            <FaHome style={{ fontSize: 22 }} /> Voltar ao System
          </Link>
          <button
            className={`flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg mb-1 transition-all font-medium ${selectFunction === 'System' ? 'bg-blue-500 text-white shadow' : 'bg-transparent hover:bg-blue-50 hover:text-blue-700'}`}
            style={{ fontSize: 16 }}
            onClick={() => setSelectFunction('System')}
          >
            <FaDatabase style={{ fontSize: 21 }} /> System
          </button>
          <button
            className={`flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg mb-1 transition-all font-medium ${selectFunction === 'DocsEdit' ? 'bg-blue-500 text-white shadow' : 'bg-transparent hover:bg-blue-50 hover:text-blue-700'}`}
            style={{ fontSize: 16 }}
            onClick={() => setSelectFunction('DocsEdit')}
          >
            <GrDocumentConfig style={{ fontSize: 21 }} /> Documentos
          </button>
          <Link
            to="#"
            onClick={e => { e.preventDefault(); setSelectFunction('Teams'); }}
            className={`flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg mb-1 transition-all font-medium ${selectFunction === 'Teams' ? 'bg-blue-500 text-white shadow' : 'bg-transparent hover:bg-blue-50 hover:text-blue-700'}`}
            style={{ textDecoration: 'none', fontSize: 16 }}
          >
            <BsMicrosoftTeams style={{ fontSize: 21 }} /> Equipes
          </Link>
          <Link
            to="#"
            onClick={e => { e.preventDefault(); setSelectFunction('Honrarias'); }}
            className={`flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg mb-1 transition-all font-medium ${selectFunction === 'Honrarias' ? 'bg-blue-500 text-white shadow' : 'bg-transparent hover:bg-blue-50 hover:text-blue-700'}`}
            style={{ textDecoration: 'none', fontSize: 16 }}
          >
            <FaStar style={{ fontSize: 21 }} /> Honrarias
          </Link>
          {/* Dropdown Usuários */}
          <div className="relative">
            <button
              className={`flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg mb-1 transition-all font-medium ${selectFunction.startsWith('Users') ? 'bg-blue-500 text-white shadow' : 'bg-transparent hover:bg-blue-50 hover:text-blue-700'}`}
              style={{ fontSize: 16 }}
              onClick={() => setShowUsersDrop(v => !v)}
          >
            <FaUsersCog style={{ fontSize: 21 }} /> Usuários
          </button>
            {showUsersDrop && (
              <div className="flex flex-col rounded-lg shadow-lg mt-0.5 ml-0 border border-gray-200 bg-white overflow-hidden">
                <button
                  className={`w-full text-left px-3 py-2 text-[15px] font-medium transition-colors ${selectFunction === 'Users' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}`}
                  style={{ borderBottom: '1px solid #e4e4e4', fontWeight: 600 }}
                  onClick={() => { setSelectFunction('Users'); setShowUsersDrop(false); }}
                >Usuários</button>
                <button
                  className={`w-full text-left px-3 py-2 text-[15px] font-medium transition-colors ${selectFunction === 'UsersIPs' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}`}
                  style={{ fontWeight: 600 }}
                  onClick={() => { setSelectFunction('UsersIPs'); setShowUsersDrop(false); }}
                >IPs</button>
              </div>
            )}
          </div>
          <button
            className={`flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg mb-1 transition-all font-medium ${selectFunction === 'Permissions' ? 'bg-blue-500 text-white shadow' : 'bg-transparent hover:bg-blue-50 hover:text-blue-700'}`}
            style={{ fontSize: 16 }}
            onClick={() => setSelectFunction('Permissions')}
          >
            <GoPasskeyFill style={{ fontSize: 21 }} /> Permissões Especiais
          </button>
          <button
            className={`flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg mb-1 transition-all font-medium ${selectFunction === 'Publication' ? 'bg-blue-500 text-white shadow' : 'bg-transparent hover:bg-blue-50 hover:text-blue-700'}`}
            style={{ fontSize: 16 }}
            onClick={() => setSelectFunction('Publication')}
          >
            <IoIosMegaphone style={{ fontSize: 21 }} /> Publicações
          </button>
          <Link
            to="#"
            onClick={e => { e.preventDefault(); setSelectFunction('Loja'); }}
            className={`flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg mb-1 transition-all font-medium ${selectFunction === 'Loja' ? 'bg-blue-500 text-white shadow' : 'bg-transparent hover:bg-blue-50 hover:text-blue-700'}`}
            style={{ textDecoration: 'none', fontSize: 16 }}
          >
            <FaShoppingCart style={{ fontSize: 21 }} /> Loja
          </Link>
          <button
            className={`flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg mb-1 transition-all font-medium ${selectFunction === 'Logger' ? 'bg-blue-500 text-white shadow' : 'bg-transparent hover:bg-blue-50 hover:text-blue-700'}`}
            style={{ fontSize: 16 }}
            onClick={() => setSelectFunction('Logger')}
          >
            <FaBlogger style={{ fontSize: 21 }} /> Logs
          </button>
        </nav>
      </aside>
      {/* Conteúdo principal do DPanel */}
      <main className="flex-1 ml-64 p-8">
          {selectFunction === 'System' && <DpanelInfo />}
          {selectFunction === 'DocsEdit' && <DocsDpanel />}
          {selectFunction === 'Logger' && <Logger />}
          {selectFunction === 'Teams' && <DpanelTeams />}
          {selectFunction === 'Honrarias' && (
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">Gerenciar Honrarias</h2>
              <form onSubmit={handleAddHonraria} className="flex flex-col md:flex-row gap-4 mb-8 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Honraria</label>
                  <input ref={nomeRef} type="text" className="border border-gray-300 rounded-md px-3 py-2 w-full" placeholder="Digite o nome da honraria" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Imagem (URL)</label>
                  <input ref={imagemRef} type="text" className="border border-gray-300 rounded-md px-3 py-2 w-full" placeholder="Cole o link da imagem" />
                </div>
                <button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-6 rounded">Adicionar honraria</button>
              </form>
              <div className="flex flex-col gap-4">
                {honrarias.length === 0 ? (
                  <span className="text-gray-500">Nenhuma honraria cadastrada.</span>
                ) : (
                  honrarias.map((h, idx) => (
                    <div key={idx} className="flex flex-row items-center bg-white rounded-lg shadow p-2 border border-gray-200 mb-2" style={{minHeight: 56}}>
                      {editIndex === idx ? (
                        <form onSubmit={handleEditSubmit} className="flex flex-row items-center gap-2 w-full">
                          <img src={editImagem} alt={editNome} className="w-10 h-10 object-contain rounded border mr-2" />
                          <input type="text" value={editNome} onChange={e => setEditNome(e.target.value)} className="border border-gray-300 rounded-md px-2 py-1 text-sm flex-1" />
                          <input type="text" value={editImagem} onChange={e => setEditImagem(e.target.value)} className="border border-gray-300 rounded-md px-2 py-1 text-sm flex-1" />
                          <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded text-xs">Salvar</button>
                          <button type="button" onClick={() => setEditIndex(null)} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-1 px-2 rounded text-xs">Cancelar</button>
                        </form>
                      ) : (
                        <>
                          <img src={h.imagem} alt={h.nome} title={h.nome} className="w-10 h-10 object-contain rounded border mr-2" />
                          <span className="font-medium text-base text-gray-800 flex-1 truncate">{h.nome}</span>
                          <button onClick={() => handleEdit(idx)} className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-1 px-2 rounded text-xs mr-1">Editar</button>
                          <button onClick={() => handleRemove(idx)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded text-xs">Remover</button>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
          {selectFunction === 'Users' && <DpanelUsers />}
          {selectFunction === 'UsersIPs' && (
            <div className="w-full max-w-full">
              <div style={{ display: 'flex', width: '100%', gap: 0, marginBottom: 24 }}>
                <button
                  style={{ flex: 1, background: ipTab === 'ip' ? '#cfcfd1' : '#edeef0', border: 'none', borderRadius: '6px 0 0 6px', padding: '8px 0', fontWeight: 600, color: '#222', fontSize: 15, outline: 'none', cursor: 'pointer' }}
                  onClick={() => setIpTab('ip')}
                >Filtrar por IP</button>
                <button
                  style={{ flex: 1, background: ipTab === 'user' ? '#cfcfd1' : '#edeef0', border: 'none', borderRadius: '0 6px 6px 0', padding: '8px 0', fontWeight: 600, color: '#222', fontSize: 15, outline: 'none', cursor: 'pointer' }}
                  onClick={() => setIpTab('user')}
                >Filtrar por Usuário</button>
              </div>
              {ipTab === 'ip' && (
                <div style={{ background: 'none', width: '100%' }}>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
                    <div style={{ flex: 2, display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontWeight: 500, fontSize: 14, marginBottom: 2 }}>Buscar</label>
                      <input
                        type="text"
                        placeholder="Pesquise pelo IP"
                        value={searchIp}
                        onChange={e => setSearchIp(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 4, border: '1px solid #ddd', fontSize: 15, background: '#fff' }}
                      />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontWeight: 500, fontSize: 14, marginBottom: 2 }}>De</label>
                      <input
                        type="date"
                        value={dateFrom}
                        onChange={e => setDateFrom(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 4, border: '1px solid #ddd', fontSize: 15, background: '#fff' }}
                      />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontWeight: 500, fontSize: 14, marginBottom: 2 }}>Até</label>
                      <input
                        type="date"
                        value={dateTo}
                        onChange={e => setDateTo(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 4, border: '1px solid #ddd', fontSize: 15, background: '#fff' }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 0, marginBottom: 18 }}>
                    <button
                      style={{ flex: 1, background: '#edeef0', border: 'none', borderRadius: '6px 0 0 6px', padding: '10px 0', fontWeight: 600, color: '#222', fontSize: 15, outline: 'none', cursor: 'pointer' }}
                      onClick={handleResetIp}
                    >Resetar</button>
                    <button
                      style={{ flex: 3, background: '#2176d1', border: 'none', borderRadius: '0 6px 6px 0', padding: '10px 0', fontWeight: 600, color: '#fff', fontSize: 15, outline: 'none', cursor: 'pointer' }}
                      onClick={handleSearchIp}
                    >Procurar</button>
                  </div>
                  <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 6px #ececec', padding: 0, marginTop: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: 20, color: '#222', padding: '18px 0 0 18px' }}>IP's Iguais</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
                      <thead>
                        <tr style={{ background: '#f5f5f5', fontWeight: 700, fontSize: 15, color: '#222' }}>
                          <th style={{ textAlign: 'left', padding: '10px 12px' }}>IP</th>
                          <th style={{ textAlign: 'left', padding: '10px 12px' }}>Total</th>
                          <th style={{ textAlign: 'left', padding: '10px 12px' }}>Ver</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loadingIp ? (
                          <tr><td colSpan={3} style={{ textAlign: 'center', color: '#888', padding: 18 }}>Carregando...</td></tr>
                        ) : filteredIpList.length === 0 ? (
                          <tr><td colSpan={3} style={{ textAlign: 'center', color: '#888', padding: 18 }}>Nenhum IP encontrado.</td></tr>
                        ) : filteredIpList.map((item, idx) => (
                          <tr key={item.ip} style={{ borderBottom: '1px solid #ececec', background: idx % 2 === 0 ? '#fff' : '#f8f9fa' }}>
                            <td style={{ padding: '10px 12px', fontSize: 15 }}>{item.ip}</td>
                            <td style={{ padding: '10px 12px', fontSize: 15 }}>{item.total}</td>
                            <td style={{ padding: '10px 12px' }}>
                              <button style={{ background: '#2176d1', border: 'none', borderRadius: 6, padding: '6px 12px', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
                                onClick={() => handleViewIpUsers(item.ip)}
                              >
                                <FaEye />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {ipTab === 'user' && (
                <div style={{ background: 'none', width: '100%' }}>
                  {/* Campos de busca/filtros */}
                  <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
                    <div style={{ flex: 2, display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontWeight: 500, fontSize: 14, marginBottom: 2 }}>Buscar</label>
                      <input
                        type="text"
                        placeholder="Pesquise pelo IP ou pelo usuário"
                        value={userTabSearch}
                        onChange={e => setUserTabSearch(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 4, border: '1px solid #ddd', fontSize: 15, background: '#fff' }}
                      />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontWeight: 500, fontSize: 14, marginBottom: 2 }}>De</label>
                      <input
                        type="date"
                        value={userTabDateFrom}
                        onChange={e => setUserTabDateFrom(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 4, border: '1px solid #ddd', fontSize: 15, background: '#fff' }}
                      />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontWeight: 500, fontSize: 14, marginBottom: 2 }}>Até</label>
                      <input
                        type="date"
                        value={userTabDateTo}
                        onChange={e => setUserTabDateTo(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 4, border: '1px solid #ddd', fontSize: 15, background: '#fff' }}
                      />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontWeight: 500, fontSize: 14, marginBottom: 2 }}>Status</label>
                      <select
                        value={userTabStatus}
                        onChange={e => setUserTabStatus(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 4, border: '1px solid #ddd', fontSize: 15, background: '#fff' }}
                      >
                        <option value="Todos">Todos</option>
                        <option value="Ativo">Ativo</option>
                        <option value="Banido">Banido</option>
                        <option value="Inativo">Inativo</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 0, marginBottom: 18 }}>
                    <button
                      style={{ flex: 1, background: '#edeef0', border: 'none', borderRadius: '6px 0 0 6px', padding: '10px 0', fontWeight: 600, color: '#222', fontSize: 15, outline: 'none', cursor: 'pointer' }}
                      onClick={handleResetUser}
                    >Resetar</button>
                    <button
                      style={{ flex: 3, background: '#2176d1', border: 'none', borderRadius: '0 6px 6px 0', padding: '10px 0', fontWeight: 600, color: '#fff', fontSize: 15, outline: 'none', cursor: 'pointer' }}
                      onClick={handleSearchUser}
                    >Procurar</button>
                  </div>
                  {/* Tabela de usuários só aparece se não estiver mostrando resultado de IP */}
                  {!showUserIpResult && (
                    <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 6px #ececec', padding: 0, marginTop: 8 }}>
                      <div style={{ fontWeight: 700, fontSize: 20, color: '#222', padding: '18px 0 0 18px' }}>Usuários</div>
                      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
                        <thead>
                          <tr style={{ background: '#f5f5f5', fontWeight: 700, fontSize: 15, color: '#222' }}>
                            <th style={{ textAlign: 'left', padding: '10px 12px' }}>Usuário</th>
                            <th style={{ textAlign: 'left', padding: '10px 12px' }}>Total</th>
                            <th style={{ textAlign: 'left', padding: '10px 12px' }}>Ver</th>
                          </tr>
                        </thead>
                        <tbody>
                          {loadingUser ? (
                            <tr><td colSpan={3} style={{ textAlign: 'center', color: '#888', padding: 18 }}>Carregando...</td></tr>
                          ) : filteredUserList.length === 0 ? (
                            <tr><td colSpan={3} style={{ textAlign: 'center', color: '#888', padding: 18 }}>Nenhum usuário encontrado.</td></tr>
                          ) : filteredUserList.map((item, idx) => (
                            <tr key={item.usuario} style={{ borderBottom: '1px solid #ececec', background: idx % 2 === 0 ? '#fff' : '#f8f9fa' }}>
                              <td style={{ padding: '10px 12px', fontSize: 15 }}>{item.usuario}</td>
                              <td style={{ padding: '10px 12px', fontSize: 15 }}>{userIpsCount[item.usuario] ?? '-'}</td>
                              <td style={{ padding: '10px 12px' }}>
                                <button style={{ background: '#2176d1', border: 'none', borderRadius: 6, padding: '6px 12px', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
                                  onClick={() => handleViewUserIps(item.usuario)}
                                >
                                  <FaEye />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {selectFunction === 'Publication' && <DpanelPublication />}
          {selectFunction === 'Permissions' && <DpanelPermissions />}
          {selectFunction === 'Loja' && <DpanelLoja />}
          {showUserIpResult && (
            <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 6px #ececec', padding: 0, marginTop: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 18px 0 18px' }}>
                <div style={{ fontWeight: 700, fontSize: 20, color: '#222' }}>
                  Resultado da Pesquisa ({userIpResult.nickname})
                </div>
                <button onClick={handleBackToUserList} style={{ background: '#2176d1', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 18px', fontWeight: 600, cursor: 'pointer', fontSize: 15 }}>Voltar</button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
                <thead>
                  <tr style={{ background: '#f5f5f5', fontWeight: 700, fontSize: 15, color: '#222' }}>
                    <th style={{ textAlign: 'left', padding: '10px 12px' }}>IP</th>
                    <th style={{ textAlign: 'left', padding: '10px 12px' }}>Total</th>
                    <th style={{ textAlign: 'left', padding: '10px 12px' }}>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingUserIp ? (
                    <tr><td colSpan={3} style={{ textAlign: 'center', color: '#888', padding: 18 }}>Carregando...</td></tr>
                  ) : userIpResult.ips.length === 0 ? (
                    <tr><td colSpan={3} style={{ textAlign: 'center', color: '#888', padding: 18 }}>Nenhum IP encontrado.</td></tr>
                  ) : userIpResult.ips.map((ipItem, idx) => (
                    <tr key={ipItem.ip} style={{ borderBottom: '1px solid #ececec', background: idx % 2 === 0 ? '#fff' : '#f8f9fa' }}>
                      <td style={{ padding: '10px 12px', fontSize: 15 }}>{ipItem.ip}</td>
                      <td style={{ padding: '10px 12px', fontSize: 15 }}>{ipItem.count}</td>
                      <td style={{ padding: '10px 12px', fontSize: 15 }}>{new Date(ipItem.lastDate).toLocaleString('pt-BR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {showIpUsersResult && (
            <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 6px #ececec', padding: 0, marginTop: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 18px 0 18px' }}>
                <div style={{ fontWeight: 700, fontSize: 20, color: '#222' }}>
                  Usuários conectados ao IP {ipUsersResult.ip}
                </div>
                <button onClick={handleBackToIpList} style={{ background: '#2176d1', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 18px', fontWeight: 600, cursor: 'pointer', fontSize: 15 }}>Voltar</button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
                <thead>
                  <tr style={{ background: '#f5f5f5', fontWeight: 700, fontSize: 15, color: '#222' }}>
                    <th style={{ textAlign: 'left', padding: '10px 12px' }}>Usuário</th>
                    <th style={{ textAlign: 'left', padding: '10px 12px' }}>Total</th>
                    <th style={{ textAlign: 'left', padding: '10px 12px' }}>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingIpUsers ? (
                    <tr><td colSpan={3} style={{ textAlign: 'center', color: '#888', padding: 18 }}>Carregando...</td></tr>
                  ) : ipUsersResult.users.length === 0 ? (
                    <tr><td colSpan={3} style={{ textAlign: 'center', color: '#888', padding: 18 }}>Nenhum usuário encontrado.</td></tr>
                  ) : ipUsersResult.users.map((userItem, idx) => (
                    <tr key={userItem.user} style={{ borderBottom: '1px solid #ececec', background: idx % 2 === 0 ? '#fff' : '#f8f9fa' }}>
                      <td style={{ padding: '10px 12px', fontSize: 15 }}>{userItem.user}</td>
                      <td style={{ padding: '10px 12px', fontSize: 15 }}>{userItem.count}</td>
                      <td style={{ padding: '10px 12px', fontSize: 15 }}>{new Date(userItem.lastDate).toLocaleString('pt-BR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
    </div>
  );
};

export default DPanel;
