import React, { useState, useEffect } from 'react';
import axiosInstance from '../provider/axiosInstance';
import { FaUser, FaStar, FaPen, FaImage } from 'react-icons/fa';
import Notification from '../components/Notification/Notification';

const Configuracoes = () => {
  const user = JSON.parse(localStorage.getItem('@Auth:Profile'));
  const [aba, setAba] = useState('conta');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [emblemas, setEmblemas] = useState([]);
  const [emblemasExibidos, setEmblemasExibidos] = useState([]);
  const [salvando, setSalvando] = useState(false);
  const [msgEmblemas, setMsgEmblemas] = useState('');
  const [banners, setBanners] = useState([]);
  const [bannersExibidos, setBannersExibidos] = useState([]);
  const [salvandoBanners, setSalvandoBanners] = useState(false);
  const [msgBanners, setMsgBanners] = useState('');
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (aba === 'emblemas') {
      axiosInstance.get('/me/emblemas')
        .then(res => setEmblemas(res.data))
        .catch(() => setEmblemas([]));
      axiosInstance.get('/me/emblemas-exibidos')
        .then(res => setEmblemasExibidos(res.data.map(e => e._id)))
        .catch(() => setEmblemasExibidos([]));
    } else if (aba === 'banners') {
      axiosInstance.get('/me/banners')
        .then(res => setBanners(res.data))
        .catch(() => setBanners([]));
      axiosInstance.get('/me/banners-exibidos')
        .then(res => setBannersExibidos(res.data.map(e => e._id)))
        .catch(() => setBannersExibidos([]));
    }
  }, [aba]);

  const handleToggleEmblema = (id) => {
    setEmblemasExibidos(prev =>
      prev.includes(id) ? prev.filter(eid => eid !== id) : [...prev, id]
    );
  };

  const handleSalvarEmblemas = async () => {
    setSalvando(true);
    setMsgEmblemas('');
    try {
      await axiosInstance.put('/me/emblemas-exibidos', { emblemasExibidos });
      setNotification({ message: 'Emblema alterado com sucesso.', type: 'success' });
    } catch {
      setNotification({ message: 'Erro ao salvar emblemas exibidos.', type: 'error' });
    }
    setSalvando(false);
  };

  const handleToggleBanner = (id) => {
    setBannersExibidos(prev =>
      prev.length === 1 && prev[0] === id ? [] : [id]
    );
  };

  const handleSalvarBanners = async () => {
    setSalvandoBanners(true);
    setMsgBanners('');
    try {
      await axiosInstance.put('/me/banners-exibidos', { bannersExibidos });
      setNotification({ message: 'Banner alterado com sucesso.', type: 'success' });
    } catch {
      setNotification({ message: 'Erro ao salvar banners exibidos.', type: 'error' });
    }
    setSalvandoBanners(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem('');
    setErro('');
    if (!novaSenha || !confirmarSenha || !senhaAtual) {
      setErro('Preencha todos os campos.');
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }
    setLoading(true);
    try {
      const res = await axiosInstance.post('/change-password', {
        currentPassword: senhaAtual,
        newPassword: novaSenha,
        newPasswordConf: confirmarSenha,
      });
      setMensagem('Senha alterada com sucesso!');
      setNovaSenha('');
      setConfirmarSenha('');
      setSenhaAtual('');
    } catch (err) {
      setErro(err.response?.data?.msg || 'Erro ao alterar senha.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#f7f7f7] py-10">
      <div className="flex w-full max-w-4xl mt-16 gap-6">
        {/* Menu lateral */}
        <div className="bg-white rounded shadow p-4 min-w-[200px] max-w-[220px] flex flex-col gap-1 h-fit">
          <div className="font-bold text-lg mb-2">Configuração</div>
          <button onClick={() => setAba('conta')} className={`flex items-center justify-between w-full px-3 py-2 rounded text-sm font-medium ${aba === 'conta' ? 'bg-gray-100 font-bold' : 'hover:bg-gray-50'}`}>
            Conta <FaUser />
          </button>
          <button onClick={() => setAba('emblemas')} className={`flex items-center justify-between w-full px-3 py-2 rounded text-sm font-medium ${aba === 'emblemas' ? 'bg-gray-100 font-bold' : 'hover:bg-gray-50'}`}>
            Emblemas <FaStar />
          </button>
          <button onClick={() => setAba('banners')} className={`flex items-center justify-between w-full px-3 py-2 rounded text-sm font-medium ${aba === 'banners' ? 'bg-gray-100 font-bold' : 'hover:bg-gray-50'}`}>
            Banners <FaImage />
          </button>
          <button onClick={() => setAba('assinatura')} className={`flex items-center justify-between w-full px-3 py-2 rounded text-sm font-medium ${aba === 'assinatura' ? 'bg-gray-100 font-bold' : 'hover:bg-gray-50'}`}>
            Assinatura <FaPen />
          </button>
        </div>
        {/* Conteúdo da aba */}
        <div className="flex-1 bg-white rounded shadow p-8">
          {aba === 'conta' && (
            <>
              <h1 className="text-2xl font-bold mb-4">Configuração da Conta</h1>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Nickname</label>
                  <input type="text" value={user.nickname} disabled className="w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">TAG</label>
                  <input type="text" value={user.tag || ''} disabled className="w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed" />
                  <span className="text-xs text-gray-500">A TAG não pode ser modificada.</span>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Nova Senha</label>
                  <input type="password" value={novaSenha} onChange={e => setNovaSenha(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Digite a nova senha" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Confirmar Nova Senha</label>
                  <input type="password" value={confirmarSenha} onChange={e => setConfirmarSenha(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Confirme a nova senha" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Senha Atual</label>
                  <input type="password" value={senhaAtual} onChange={e => setSenhaAtual(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Digite sua senha atual para confirmar" />
                </div>
                {mensagem && <div className="text-green-600 text-sm font-semibold">{mensagem}</div>}
                {erro && <div className="text-red-600 text-sm font-semibold">{erro}</div>}
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2" disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
              </form>
            </>
          )}
          {aba === 'emblemas' && (
            <div>
              <h1 className="text-2xl font-bold mb-4">Emblemas</h1>
              <div className="flex flex-wrap gap-4 items-center mb-4">
                {emblemas.filter(e => e.isEmblem).length === 0 ? (
                  <span className="text-gray-600">Nenhum emblema encontrado.</span>
                ) : (
                  emblemas.filter(e => e.isEmblem).map(emblema => (
                    <label key={emblema._id} className={`flex flex-col items-center border rounded p-2 bg-gray-50 shadow-sm cursor-pointer ${emblemasExibidos.includes(emblema._id) ? 'ring-2 ring-blue-500' : ''}`} style={{ minWidth: 80 }}>
                      <input
                        type="checkbox"
                        checked={emblemasExibidos.includes(emblema._id)}
                        onChange={() => handleToggleEmblema(emblema._id)}
                        className="mb-1"
                      />
                      <img src={emblema.image} alt={emblema.name} className="w-14 h-14 object-contain mb-1" />
                      <span className="text-xs font-semibold text-gray-700">{emblema.name}</span>
                      <span className="text-[10px] text-gray-400">{emblema.category}</span>
                    </label>
                  ))
                )}
              </div>
              <button onClick={handleSalvarEmblemas} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" disabled={salvando}>
                {salvando ? 'Salvando...' : 'Salvar emblemas do perfil'}
              </button>
            </div>
          )}
          {aba === 'banners' && (
            <div>
              <h1 className="text-2xl font-bold mb-4">Banners</h1>
              <div className="flex flex-wrap gap-4 items-center mb-4">
                {banners.filter(b => b.isBanner).length === 0 ? (
                  <span className="text-gray-600">Nenhum banner encontrado.</span>
                ) : (
                  banners.filter(b => b.isBanner).map(banner => (
                    <label key={banner._id} className={`flex flex-col items-center border rounded p-2 bg-gray-50 shadow-sm cursor-pointer ${bannersExibidos.includes(banner._id) ? 'ring-2 ring-blue-500' : ''}`} style={{ minWidth: 80 }}>
                      <input
                        type="radio"
                        checked={bannersExibidos.includes(banner._id)}
                        onChange={() => handleToggleBanner(banner._id)}
                        className="mb-1"
                      />
                      <img src={banner.image} alt={banner.name} className="w-20 h-20 object-contain mb-1" />
                      <span className="text-xs font-semibold text-gray-700">{banner.name}</span>
                      <span className="text-[10px] text-gray-400">{banner.category}</span>
                    </label>
                  ))
                )}
              </div>
              <button onClick={handleSalvarBanners} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" disabled={salvandoBanners}>
                {salvandoBanners ? 'Salvando...' : 'Salvar banners do perfil'}
              </button>
            </div>
          )}
          {aba === 'assinatura' && (
            <div>
              <h1 className="text-2xl font-bold mb-4">Assinatura</h1>
              <p className="text-gray-600">Em breve você poderá gerenciar sua assinatura aqui.</p>
            </div>
          )}
        </div>
      </div>
      {notification && (
        <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}
    </div>
  );
};

export default Configuracoes; 