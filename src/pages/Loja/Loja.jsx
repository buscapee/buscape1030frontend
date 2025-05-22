import React, { useEffect, useState } from "react";
import { FaCoins, FaShoppingCart } from "react-icons/fa";
import axiosInstance from '../../provider/axiosInstance';
import Notification from '../../components/Notification/Notification';
import ConfirmationModal from '../../components/ConfirmationModal';

const Loja = () => {
  const [dragonas, setDragonas] = useState(0);
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [jsError, setJsError] = useState("");
  const [ordem, setOrdem] = useState('Mais nova');
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas as Categorias');
  const moedaImg = 'https://i.imgur.com/V14ZysK.png';
  const [produtosComprados, setProdutosComprados] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [showNoDragonasModal, setShowNoDragonasModal] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setErro("");
      try {
        const [resProdutos, resCategorias, resUser, resComprados] = await Promise.all([
          axiosInstance.get('/shop/products'),
          axiosInstance.get('/shop/categories'),
          axiosInstance.get('/profile'),
          axiosInstance.get('/me/emblemas'),
        ]);
        console.log('Produtos:', resProdutos.data);
        console.log('Categorias:', resCategorias.data);
        setProdutos(Array.isArray(resProdutos.data) ? resProdutos.data : []);
        setCategorias(Array.isArray(resCategorias.data) ? resCategorias.data.map(c => c.name) : []);
        setDragonas(resUser.data.medals || 0);
        setProdutosComprados(Array.isArray(resComprados.data) ? resComprados.data.map(p => p._id) : []);
      } catch (err) {
        setErro("Erro ao carregar a loja. Verifique sua conexão ou se o backend está online.");
        console.error('Erro ao buscar dados da loja:', err);
      }
      setLoading(false);
    };
    fetchAll();
  }, []);

  // Captura erros de renderização JS
  useEffect(() => {
    window.onerror = (msg, url, line, col, error) => {
      setJsError(error ? error.stack : msg);
    };
    return () => { window.onerror = null; };
  }, []);

  const fetchEmblemas = async () => {
    try {
      const res = await axiosInstance.get('/me/emblemas');
      localStorage.setItem('@Auth:Emblemas', JSON.stringify(res.data));
      return res.data;
    } catch {
      return [];
    }
  };

  const comprar = async (produto) => {
    if (dragonas < produto.value) {
      setShowNoDragonasModal(true);
      return;
    }
    try {
      const res = await axiosInstance.post(`/shop/buy/${produto._id}`);
      if (produto.isEmblem) {
        await fetchEmblemas();
      }
      setDragonas(res.data.medals);
      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
        window.location.reload();
      }, 1000);
    } catch (err) {
      alert(err.response?.data?.error || "Erro ao comprar produto. Faça login novamente ou tente mais tarde.");
    }
  };

  // Função para ordenar produtos
  const ordenarProdutos = (produtos) => {
    switch (ordem) {
      case 'Mais nova':
        return [...produtos].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'Mais Antiga':
        return [...produtos].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'Alfabetica':
        return [...produtos].sort((a, b) => a.name.localeCompare(b.name));
      case 'Mais Caro':
        return [...produtos].sort((a, b) => b.value - a.value);
      case 'Mais Barato':
        return [...produtos].sort((a, b) => a.value - b.value);
      default:
        return produtos;
    }
  };

  // Produtos filtrados e ordenados
  const produtosFiltrados = produtos.filter(p => categoriaFiltro === 'Todas as Categorias' || p.category === categoriaFiltro);
  const produtosOrdenados = ordenarProdutos(produtosFiltrados);

  // Agrupar produtos por categoria (após filtro e ordenação)
  const produtosPorCategoria = (categorias || []).reduce((acc, cat) => {
    acc[cat] = produtosOrdenados.filter(p => p.category === cat);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex flex-col items-center py-8">
      <div className="w-full max-w-6xl px-4">
        {/* Notificação de compra */}
        {showNotification && (
          <Notification message="Compra realizada com sucesso." type="success" position="bottom-right" />
        )}
        {/* Modal de dragonas insuficientes */}
        <ConfirmationModal
          open={showNoDragonasModal}
          title="Atenção"
          message="Você não tem dragonas suficiente."
          onConfirm={() => setShowNoDragonasModal(false)}
          onCancel={() => setShowNoDragonasModal(false)}
          confirmText="Ok"
          cancelText=""
        />
        {/* Barra superior personalizada */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 mt-12">
          {/* Esquerda */}
          <div className="flex items-center gap-4">
            <FaShoppingCart className="text-2xl text-gray-700" title="Carrinho" />
            <img src={moedaImg} alt="Moeda" className="w-7 h-7" style={{marginLeft: 4, marginRight: 2}} />
            <span className="font-bold text-lg text-gray-800" title="Suas Dragonas">{dragonas}</span>
          </div>
          {/* Direita */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-600 mb-1">Ordenar</label>
              <select value={ordem} onChange={e => setOrdem(e.target.value)} className="border rounded px-2 py-1 text-sm">
                <option>Mais nova</option>
                <option>Mais Antiga</option>
                <option>Alfabetica</option>
                <option>Mais Caro</option>
                <option>Mais Barato</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-600 mb-1">Filtrar</label>
              <select value={categoriaFiltro} onChange={e => setCategoriaFiltro(e.target.value)} className="border rounded px-2 py-1 text-sm">
                <option>Todas as Categorias</option>
                {categorias.map(cat => (
                  <option key={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {loading && (
          <div className="flex justify-center items-center py-12 text-lg text-gray-500">Carregando loja...</div>
        )}
        {erro && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center">{erro}</div>
        )}
        {jsError && (
          <div className="bg-red-200 border border-red-500 text-red-900 px-4 py-3 rounded mb-4 text-center">
            <b>Erro de JavaScript:</b>
            <pre className="text-xs whitespace-pre-wrap">{jsError}</pre>
          </div>
        )}
        {!loading && !erro && !jsError && categorias.length === 0 && (
          <div className="text-center text-gray-500 py-12">Nenhuma categoria cadastrada.</div>
        )}
        {!loading && !erro && !jsError && categorias.length > 0 && produtos.length === 0 && (
          <div className="text-center text-gray-500 py-12">Nenhum produto cadastrado.</div>
        )}
        {!loading && !erro && !jsError && categorias.map(cat => (
          produtosPorCategoria[cat] && produtosPorCategoria[cat].length > 0 && (
            <div key={cat} className="mb-8">
              <h2 className="text-xl font-bold mb-3">{cat}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                {produtosPorCategoria[cat].map((produto, idx) => (
                  <div
                    key={produto._id || idx}
                    className="bg-white rounded-lg shadow-sm p-2 flex flex-col justify-between border border-gray-100 transition hover:shadow-md hover:-translate-y-1 duration-150 min-h-[160px] max-w-[170px] mx-auto"
                    style={{ minWidth: 0 }}
                  >
                    <div className="flex flex-col items-center mb-1">
                      <span className="font-semibold text-sm mb-1 text-gray-800 truncate w-full text-center" style={{maxWidth: '100%'}}>{produto.name}</span>
                      <img src={produto.image} alt={produto.name} className="w-9 h-9 object-contain mb-1 rounded" />
                      <span className="text-gray-500 text-[11px] text-center mb-1 min-h-[24px] max-h-[24px] overflow-hidden" style={{lineHeight: '1.2'}}>{produto.description}</span>
                    </div>
                    <div className="flex flex-row gap-1 mt-auto items-center justify-between">
                      <span className="text-[13px] font-bold text-yellow-600 flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md border border-gray-200" style={{fontSize: 13}}>
                        <FaCoins className="text-yellow-400" style={{fontSize: 13}} />
                        {produto.value}
                      </span>
                      {(!produto.multiBuy && produtosComprados.includes(produto._id)) ? (
                        <button
                          className="bg-gray-200 text-gray-400 font-medium py-1 px-2 rounded-md cursor-not-allowed text-xs shadow-none"
                          disabled
                        >
                          Indisponível
                        </button>
                      ) : (
                        <button
                          className="bg-green-500 hover:bg-green-600 text-white font-medium py-1 px-3 rounded-md text-xs shadow-sm transition"
                          onClick={() => comprar(produto)}
                        >
                          Comprar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default Loja; 