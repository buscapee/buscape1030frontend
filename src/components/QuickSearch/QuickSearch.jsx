import React, { useContext, useState, useCallback } from 'react';
import style from './quickSearch.module.css';
import Logo from '../../assets/DOP Padrão (com borda).png';
import { CiSearch } from "react-icons/ci";
import { FaAddressBook, FaSearch, FaRegCopy } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import { RequirementsContext } from '../../context/Requirements';
import Notification from '../Notification/Notification';



const QuickSearch = () => {
  const { searchAllUsers, user } = useContext(UserContext);
  const { formatarDataHora } = useContext(RequirementsContext);
  const [search, setSearch] = useState("");
  const [abortController, setAbortController] = useState(null);
  const [copied, setCopied] = useState(false);
  const userLogged = JSON.parse(localStorage.getItem("@Auth:Profile"));
  const [showSuggestions, setShowSuggestions] = useState(false);

  const firstUser = search
    ? (user && user.users && user.users.length > 0 ? user.users[0] : null)
    : userLogged;

  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearch(value);
    setShowSuggestions(!!value);

    if (abortController) {
      abortController.abort();
    }
    const newAbortController = new AbortController();
    setAbortController(newAbortController);
    if (value) {
      searchAllUsers(value, { signal: newAbortController.signal });
    }
  }, [abortController, searchAllUsers]);

  const handleCopy = () => {
    navigator.clipboard.writeText(firstUser.code || '[Sem cadastro]');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`contentBodyElement ${style.QuickSearch}`} style={{ position: 'relative' }}>
      <div className='contentBodyElementTitle' style={{ background: '#fff', color: '#222', display: 'flex', alignItems: 'center', borderRadius: 8, fontWeight: 700, fontSize: 16, padding: '12px 18px', borderBottom: '1px solid #ececec' }}>
        <h3 className=' flex items-center' style={{ color: '#222', background: 'transparent', fontWeight: 700, fontSize: 16, margin: 0 }}> <span className='mr-2'><FaSearch /></span> Busca Rápida</h3>
      </div>

      <div className={`${style.QuickSearchInfo}`}>
        <div className={style.QuickSearchInput} style={{ position: 'relative' }}>
          <input
            type="text"
            name="search"
            value={search}
            id="search"
            placeholder='Digite a identificação do militar.'
            onChange={handleSearchChange}
            onFocus={() => setShowSuggestions(!!search)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            autoComplete="off"
          />
          <button><CiSearch /></button>
          {showSuggestions && user && user.users && user.users.length > 0 && (
            <ul style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              width: '100%',
              background: '#fff',
              border: '1px solid #ccc',
              borderTop: 'none',
              borderRadius: '0 0 8px 8px',
              zIndex: 10,
              maxHeight: 180,
              overflowY: 'auto',
              margin: 0,
              padding: 0,
              listStyle: 'none',
              boxShadow: '0 4px 16px #0001',
            }}>
              {user.users.map(u => (
                <li
                  key={u._id}
                  style={{
                    padding: '10px 16px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f3f3f3',
                    fontSize: 16,
                  }}
                  onMouseDown={() => {
                    window.location.href = `/search/${u.nickname}`;
                  }}
                >
                  {u.nickname}
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Divider visual */}
        <div style={{ width: '100%', height: 1, background: '#e4e4e4', margin: '12px 0 16px 0' }} />
        {firstUser && (
          <>
            <div className={style.header}></div>
            <div className={style.QuickSearchInfoBody} style={{ gap: 12, padding: '8px 0' }}>
              <div className={style.img}>
                <img src={`https://www.habbo.com.br/habbo-imaging/avatarimage?img_format=png&user=${firstUser ? firstUser.nickname : ''}&direction=3&head_direction=3&size=l&action=std`} alt="" />
              </div>
              <div className={style.info} style={{ gap: 2 }}>
                <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500, fontSize: 15, margin: 0 }}>
                  <span>{firstUser.nickname}</span>
                  {firstUser && <Link to={`/search/${firstUser.nickname}`}><FaAddressBook /></Link>}
                </p>
                <p style={{ margin: '2px 0', fontWeight: 400, fontSize: 14 }}><span>Patente: </span>{firstUser.patent}</p>
                <p style={{ margin: '2px 0', fontWeight: 400, fontSize: 14 }}><span>TAG: </span>[{firstUser.tag}]</p>
                <p style={{ margin: '2px 0', fontWeight: 400, fontSize: 14 }}><span>Status: </span>{firstUser.status}</p>
                <div style={{ display: 'flex', alignItems: 'center', margin: '2px 0', fontWeight: 400, fontSize: 14 }}>
                  <span>Cadastro: </span>
                  <span style={{ marginLeft: 4, fontWeight: 400 }}>{firstUser.code || ''}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(firstUser.code || '[Sem cadastro]');
                      setCopied(true);
                    }}
                    style={{background: '#f3f3f3', border: '1px solid #e4e4e4', borderRadius: 5, color: '#23272e', fontSize: 13, padding: 3, cursor: 'pointer', marginLeft: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 400}}
                    title="Copiar cadastro"
                    onMouseDown={e => e.preventDefault()}
                  >
                    <FaRegCopy size={15} color="#23272e" />
                  </button>
                </div>
                <p style={{ margin: '2px 0', fontWeight: 400, fontSize: 13 }}><span>Admissão: </span>{firstUser.createdAt ? formatarDataHora(firstUser.createdAt) : ''}</p>
              </div>
            </div>
          </>
        )}
      </div>
      {copied && (
        <Notification message="Cadastro copiado com sucesso!" onClose={() => setCopied(false)} />
      )}
    </div>
  );
};

export default QuickSearch;
