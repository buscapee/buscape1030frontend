import React, { useState, useEffect } from "react";
import { FaEye, FaPlus, FaCoins, FaArrowLeft, FaSave } from "react-icons/fa";
import axiosInstance from '../../provider/axiosInstance';
import Notification from '../Notification/Notification';
import ConfirmationModal from '../ConfirmationModal';

const DpanelLoja = () => {
  // Estados principais
  const [busca, setBusca] = useState("");
  const [produtos, setProdutos] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [aba, setAba] = useState("lista"); // 'lista', 'form', 'moedas'
  const [abaTab, setAbaTab] = useState("produtos"); // 'produtos' ou 'moedas'
  const [categorias, setCategorias] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [analytics, setAnalytics] = useState({ totalMoedas: 0, totalProdutos: 0, totalAdquiridos: 0, usuarioMaisRico: '', ultimaMoeda: '' });
  const produtosPorPagina = 10;
  const totalPaginas = Math.max(1, Math.ceil(produtos.length / produtosPorPagina));
  const [usuariosSelecionados, setUsuariosSelecionados] = useState([]);
  const [valorMoedas, setValorMoedas] = useState(0);
  const [buscaUsuario, setBuscaUsuario] = useState("");
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [mostrarComprados, setMostrarComprados] = useState(false);
  const [compradoresMock, setCompradoresMock] = useState([
    { comprador: 'R_0', status: 'Comprado', data: '07/02/2024 00:03' },
    { comprador: '-Jotape-', status: 'Entregue', data: '04/05/2023 12:58' },
    { comprador: 'amsouzan', status: 'Entregue', data: '15/01/2023 00:02' },
    { comprador: 'Leticinha-:-', status: 'Entregue', data: '09/01/2023 21:33' },
    { comprador: '=-MLucas123-=', status: 'Entregue', data: '09/01/2023 20:49' },
    { comprador: 'rafacv', status: 'Entregue', data: '07/01/2023 17:20' },
  ]);
  const [compradores, setCompradores] = useState([]);
  const [nicknameUsuario, setNicknameUsuario] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');
  const [showCoinsHistory, setShowCoinsHistory] = useState(false);
  const [coinsHistory, setCoinsHistory] = useState([]);
  const [coinsHistoryUser, setCoinsHistoryUser] = useState(null);

  // Formulário de adicionar produto
  const [form, setForm] = useState({
    nome: "",
    descricao: "",
    imagem: "",
    categoria: "",
    status: "Visível",
    valor: "",
    desconto: "",
    limite: "",
    emblema: false,
    multi: false,
    banner: false,
  });

  // Buscar produtos, categorias e usuários reais
  useEffect(() => {
    fetchProdutos();
    fetchCategorias();
    fetchUsuarios();
  }, []);

  useEffect(() => {
    if (produtoSelecionado && mostrarComprados) {
      axiosInstance.get(`/shop/purchases/${produtoSelecionado._id}`)
        .then(res => setCompradores(res.data))
        .catch(() => setCompradores([]));
    }
  }, [produtoSelecionado, mostrarComprados]);

  // Funções de busca
  const fetchProdutos = async () => {
    const res = await axiosInstance.get('/shop/products');
    setProdutos(res.data);
    setAnalytics(a => ({ ...a, totalProdutos: res.data.length }));
  };
  const fetchCategorias = async () => {
    const res = await axiosInstance.get('/shop/categories');
    setCategorias(res.data.map(c => c.name));
  };
  const fetchUsuarios = async () => {
    const res = await axiosInstance.get('/all/users?page=1&pageSize=1000');
    setUsuarios(Array.isArray(res.data) ? res.data : res.data?.users || []);
    // Analytics de moedas
    const medalsArr = (Array.isArray(res.data) ? res.data : res.data?.users || []).map(u => u.medals || (u.classes && u.classes[0]?.medals) || 0);
    const maxIdx = medalsArr.indexOf(Math.max(...medalsArr));
    setAnalytics(a => ({
      ...a,
      totalMoedas: medalsArr.reduce((a, b) => a + b, 0),
      usuarioMaisRico: (Array.isArray(res.data) ? res.data : res.data?.users || [])[maxIdx]?.nickname + ' (' + medalsArr[maxIdx] + ')',
    }));
  };

  // CRUD Produtos
  const handleAddProduto = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.nome,
      description: form.descricao,
      image: form.imagem,
      category: form.categoria,
      status: form.status,
      value: Number(form.valor),
      discount: Number(form.desconto),
      limit: Number(form.limite),
      isEmblem: form.emblema,
      multiBuy: form.multi,
      isBanner: form.banner,
    };
    await axiosInstance.post('/shop/products', payload);
    setNotificationMsg('Seu produto foi adicionado com sucesso!');
    setShowNotification(true);
    setAba('lista');
    fetchProdutos();
    setTimeout(() => {
      setShowNotification(false);
    }, 2000);
  };

  // CRUD Categorias
  const handleSalvarCategorias = async (e) => {
    e.preventDefault();
    // Limpa categorias vazias
    const cats = categorias.filter(c => c.trim() !== '');
    // Remove todas as categorias e recria (simples para demo, ideal seria CRUD individual)
    const res = await axiosInstance.get('/shop/categories');
    await Promise.all(res.data.map(cat => axiosInstance.delete(`/shop/categories/${cat._id}`)));
    await Promise.all(cats.map(name => axiosInstance.post('/shop/categories', { name })));
    fetchCategorias();
  };

  // Atualizar medals do usuário
  const handleUpdateMedals = async (userId, medals) => {
    await axiosInstance.put(`/users/${userId}`, { medals: Number(medals) });
    fetchUsuarios();
  };

  // Handlers de formulário/categorias
  const handleFormChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };
  const handleCategoriaChange = (idx, value) => {
    setCategorias(cats => cats.map((cat, i) => i === idx ? value : cat));
  };
  const handleAddCategoria = () => {
    setCategorias(cats => [...cats, ""]);
  };

  // Filtro de busca produtos
  const produtosFiltrados = produtos.filter(p =>
    p.name?.toLowerCase().includes(busca.toLowerCase())
  );

  const handleSubmitMoedas = async (e) => {
    e.preventDefault();
    if (!nicknameUsuario.trim()) {
      alert('Digite o nome do usuário.');
      return;
    }
    if (!valorMoedas || isNaN(valorMoedas)) {
      alert('Digite um valor válido de moedas.');
      return;
    }
    try {
      // Buscar usuário pelo nickname
      const res = await axiosInstance.get(`/all/users?page=1&pageSize=1&nickname=${encodeURIComponent(nicknameUsuario.trim())}`);
      const usuario = Array.isArray(res.data) ? res.data[0] : res.data?.users?.[0];
      if (!usuario) {
        setNotificationMsg('Usuário não encontrado!');
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
        return;
      }
      const novoValor = (usuario.medals || 0) + Number(valorMoedas);
      await axiosInstance.put(`/admin/update`, { idEdit: usuario._id, nickname: usuario.nickname, medals: novoValor });
      setValorMoedas(0);
      setNicknameUsuario("");
      fetchUsuarios();
      setNotificationMsg('Moedas atualizadas com sucesso!');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } catch (err) {
      setNotificationMsg('Erro ao atualizar moedas!');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    }
  };

  const handleSetEntregue = async (purchaseId) => {
    await axiosInstance.patch(`/shop/purchases/${purchaseId}/status`, { status: 'Entregue' });
    if (produtoSelecionado) {
      const res = await axiosInstance.get(`/shop/purchases/${produtoSelecionado._id}`);
      setCompradores(res.data);
    }
  };

  const handleRemoverCompra = async (purchaseId) => {
    await axiosInstance.delete(`/shop/purchases/${purchaseId}`);
    if (produtoSelecionado) {
      const res = await axiosInstance.get(`/shop/purchases/${produtoSelecionado._id}`);
      setCompradores(res.data);
    }
  };

  const handleShowCoinsHistory = async (user) => {
    setCoinsHistoryUser(user);
    try {
      const res = await axiosInstance.get(`/coins-history/${user._id}`);
      setCoinsHistory(res.data);
      setShowCoinsHistory(true);
    } catch {
      setCoinsHistory([]);
      setShowCoinsHistory(true);
    }
  };

  useEffect(() => { setPagina(1); }, [produtosFiltrados.length]);

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Header com abas, busca e botão adicionar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 bg-white p-3 rounded shadow border border-gray-200">
        <div className="flex gap-2 mb-2 md:mb-0">
          <button onClick={() => { setAbaTab("produtos"); setAba("lista"); }} className={`px-4 py-2 rounded-t ${abaTab === "produtos" ? "bg-[#f7f7f7] border-b-2 border-blue-600 font-semibold" : "bg-[#f7f7f7]"}`}>Loja</button>
          <button onClick={() => { setAbaTab("moedas"); setAba("moedas"); }} className={`px-4 py-2 rounded-t flex items-center gap-2 ${abaTab === "moedas" ? "bg-[#f7f7f7] border-b-2 border-blue-600 font-semibold" : "bg-[#f7f7f7]"}`}><FaCoins />Moedas</button>
        </div>
        <div className="flex items-center gap-2">
          {abaTab === "produtos" && aba === "lista" && (
            <>
              <input
                type="text"
                placeholder="Buscar..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
                className="border rounded px-3 py-1 text-sm focus:outline-none"
                style={{ minWidth: 180 }}
              />
              <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded font-semibold text-sm" onClick={() => setAba("form")}> <FaPlus /> Adicionar Produto </button>
            </>
          )}
          {abaTab === "produtos" && aba === "form" && (
            <button className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded font-semibold text-sm" onClick={() => setAba("lista")}> <FaArrowLeft /> Voltar </button>
          )}
        </div>
      </div>
      {/* Conteúdo principal dividido */}
      {abaTab === "produtos" && aba === "lista" ? (
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Tabela de produtos */}
          <div className="flex-1 bg-white rounded shadow border border-gray-200 p-2 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f7f7f7]">
                  <th className="p-2 text-left">#</th>
                  <th className="p-2 text-left">Nome</th>
                  <th className="p-2 text-left">Valor</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {produtosFiltrados.slice((pagina - 1) * produtosPorPagina, pagina * produtosPorPagina).map((p, idx) => (
                  <tr key={p._id} className="border-b last:border-b-0">
                    <td className="p-2">{(pagina - 1) * produtosPorPagina + idx + 1}</td>
                    <td className="p-2">{p.name}</td>
                    <td className="p-2">{p.value}</td>
                    <td className="p-2">{p.status}</td>
                    <td className="p-2 flex gap-2 items-center">
                      <button className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded flex items-center gap-1 text-xs" onClick={() => setProdutoSelecionado(p)}><FaEye /> Ver</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Paginação */}
            <div className="flex items-center justify-center gap-2 mt-2">
              <button className="px-2 py-1 rounded bg-gray-200" disabled={pagina === 1} onClick={() => setPagina(p => Math.max(1, p - 1))}>{"<"}</button>
              <span>{pagina} de {totalPaginas} Página{totalPaginas > 1 ? 's' : ''}</span>
              <button className="px-2 py-1 rounded bg-gray-200" disabled={pagina === totalPaginas} onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}>{">"}</button>
            </div>
          </div>
          {/* Analytics e categorias */}
          <div className="flex flex-col gap-4 w-full lg:w-[420px]">
            <div className="bg-white rounded shadow border border-gray-200 p-3">
              <div className="font-semibold mb-2">Loja Analytics</div>
              <div className="grid grid-cols-1 gap-1 text-sm">
                <div className="flex justify-between"><span>Total de Moedas</span><span>{analytics.totalMoedas}</span></div>
                <div className="flex justify-between"><span>Total de Produtos</span><span>{analytics.totalProdutos}</span></div>
                <div className="flex justify-between"><span>Total de Produtos Adquiridos</span><span>{analytics.totalAdquiridos}</span></div>
                <div className="flex justify-between"><span>Usuário mais rico</span><span>{analytics.usuarioMaisRico}</span></div>
                <div className="flex justify-between"><span>Última moeda adicionada</span><span>{analytics.ultimaMoeda}</span></div>
              </div>
            </div>
            <div className="bg-white rounded shadow border border-gray-200 p-3">
              <div className="font-semibold mb-2">Configurar Categoria</div>
              <form onSubmit={handleSalvarCategorias} className="flex flex-col gap-2">
                {categorias.map((cat, idx) => (
                  <div key={idx} className="flex items-center">
                    <span className="w-6 text-right mr-2 text-gray-600">{idx}.</span>
                    <input
                      className="border rounded px-2 py-1 flex-1"
                      value={cat}
                      onChange={e => handleCategoriaChange(idx, e.target.value)}
                    />
                  </div>
                ))}
                <div className="flex gap-4 justify-center mt-4">
                  <button type="button" onClick={handleAddCategoria} className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded font-semibold flex items-center gap-2"><FaPlus /> Adicionar</button>
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold flex items-center gap-2"><FaSave /> Salvar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : abaTab === "produtos" && aba === "form" ? (
        <form className="bg-white rounded shadow border border-gray-200 p-4 w-full max-w-5xl mx-auto flex flex-col gap-4" onSubmit={handleAddProduto}>
          <div className="font-semibold text-lg mb-2">Informações Básicas</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-medium">Nome *</label>
              <input name="nome" value={form.nome} onChange={handleFormChange} className="border rounded px-3 py-2" placeholder="Nome do Produto" required />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium">Descrição</label>
              <input name="descricao" value={form.descricao} onChange={handleFormChange} className="border rounded px-3 py-2" placeholder="Descrição do Produto" />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="font-medium">Imagem *</label>
              <input name="imagem" value={form.imagem} onChange={handleFormChange} className="border rounded px-3 py-2" placeholder="Cole o link da imagem em destaque" required />
              <span className="text-xs text-gray-500">Envie via <a href="https://imgur.com" target="_blank" rel="noopener noreferrer" className="underline">imgur.com</a> e cole o link da imagem.</span>
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium">Categoria</label>
              <select name="categoria" value={form.categoria} onChange={handleFormChange} className="border rounded px-3 py-2">
                {categorias.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium">Status *</label>
              <select name="status" value={form.status} onChange={handleFormChange} className="border rounded px-3 py-2">
                <option value="Visível">Visível</option>
                <option value="Oculto">Oculto</option>
              </select>
            </div>
          </div>
          <div className="font-semibold text-lg mt-4 mb-2">Configuração do Produto</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-medium">Valor *</label>
              <input name="valor" value={form.valor} onChange={handleFormChange} className="border rounded px-3 py-2" placeholder="Digite o valor do Produto" required />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium">Desconto em %</label>
              <input name="desconto" value={form.desconto} onChange={handleFormChange} className="border rounded px-3 py-2" placeholder="Digite o desconto em %" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium">Limite</label>
              <input name="limite" value={form.limite} onChange={handleFormChange} className="border rounded px-3 py-2" placeholder="Digite o limite do produto" />
              <span className="text-xs text-gray-500">Se não tiver limite, preencha com -1</span>
            </div>
          </div>
          <div className="font-semibold text-lg mt-4 mb-2">Configuração Adicional</div>
          <div className="flex flex-col md:flex-row gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="emblema" checked={form.emblema} onChange={handleFormChange} /> É um emblema
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="multi" checked={form.multi} onChange={handleFormChange} /> Pode ser comprado várias vezes
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="banner" checked={form.banner} onChange={handleFormChange} /> É um banner
            </label>
          </div>
          <div className="flex justify-center mt-4">
            <button type="submit" className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded font-semibold flex items-center gap-2">
              <FaPlus /> Adicionar
            </button>
          </div>
        </form>
      ) : abaTab === "moedas" ? (
        <div className="bg-white rounded shadow border border-gray-200 p-4 w-full max-w-5xl mx-auto flex flex-col gap-6">
          <div className="font-semibold text-lg mb-2">Adicionar Moedas</div>
          <form className="flex flex-col gap-4" onSubmit={handleSubmitMoedas}>
            <div className="flex flex-col gap-2">
              <label className="font-medium">Usuário</label>
              <input
                type="text"
                className="border rounded px-3 py-2 mb-2"
                placeholder="Digite o nome exato do usuário..."
                value={nicknameUsuario}
                onChange={e => setNicknameUsuario(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium">Número de Moedas</label>
              <input className="border rounded px-3 py-2" placeholder="0" type="number" value={valorMoedas} onChange={e => setValorMoedas(e.target.value)} />
              <span className="text-xs text-gray-500">Use números negativos para remover e positivos para adicionar.</span>
            </div>
            <div>
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold flex items-center gap-2"><FaPlus /> Salvar</button>
            </div>
          </form>
          <div className="font-semibold text-lg mt-6 mb-2">Usuário</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f7f7f7]">
                  <th className="p-2 text-left">Usuário</th>
                  <th className="p-2 text-left">Valor</th>
                  <th className="p-2 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u, idx) => (
                  <tr key={u._id} className="border-b last:border-b-0">
                    <td className="p-2">{u.nickname}</td>
                    <td className="p-2">{u.medals || (u.classes && u.classes[0]?.medals) || 0}</td>
                    <td className="p-2">
                      <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1 text-xs" onClick={() => handleShowCoinsHistory(u)}><FaArrowLeft style={{ transform: 'rotate(180deg)' }} /> Histórico</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
      {/* Renderização do painel/modal de detalhes do produto */}
      {produtoSelecionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl relative overflow-y-auto max-h-[90vh]">
            <button onClick={() => { setProdutoSelecionado(null); setModoEdicao(false); setMostrarComprados(false); }} className="absolute top-3 right-3 text-gray-500 hover:text-red-600 text-2xl font-bold">&times;</button>
            <div className="flex gap-2 mb-4">
              <button onClick={() => { setModoEdicao(false); setMostrarComprados(false); }} className={`px-4 py-2 rounded font-semibold ${!modoEdicao && !mostrarComprados ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>Visualizar</button>
              <button onClick={() => { setModoEdicao(true); setMostrarComprados(false); }} className={`px-4 py-2 rounded font-semibold ${modoEdicao ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'}`}>Editar</button>
              <button onClick={() => { setMostrarComprados(true); setModoEdicao(false); }} className={`px-4 py-2 rounded font-semibold ${mostrarComprados ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>Comprados</button>
            </div>
            {!mostrarComprados ? (
              <>
                <div className="font-semibold text-lg mb-4">Informações Básicas</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex flex-col gap-2">
                    <label className="font-medium">Nome *</label>
                    <input value={produtoSelecionado.name} disabled={!modoEdicao} className="border rounded px-3 py-2 bg-gray-100" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-medium">Descrição</label>
                    <input value={produtoSelecionado.description || ''} disabled={!modoEdicao} className="border rounded px-3 py-2 bg-gray-100" />
                  </div>
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="font-medium">Imagem *</label>
                    <input value={produtoSelecionado.image} disabled={!modoEdicao} className="border rounded px-3 py-2 bg-gray-100" />
                    <img src={produtoSelecionado.image} alt={produtoSelecionado.name} className="w-32 h-32 object-contain mt-2 border rounded bg-white" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-medium">Categoria</label>
                    <input value={produtoSelecionado.category || ''} disabled={!modoEdicao} className="border rounded px-3 py-2 bg-gray-100" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-medium">Status *</label>
                    <input value={produtoSelecionado.status} disabled={!modoEdicao} className="border rounded px-3 py-2 bg-gray-100" />
                  </div>
                </div>
                <div className="font-semibold text-lg mb-4">Configuração do Produto</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex flex-col gap-2">
                    <label className="font-medium">Valor *</label>
                    <input value={produtoSelecionado.value} disabled={!modoEdicao} className="border rounded px-3 py-2 bg-gray-100" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-medium">Desconto em %</label>
                    <input value={produtoSelecionado.discount} disabled={!modoEdicao} className="border rounded px-3 py-2 bg-gray-100" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-medium">Limite</label>
                    <input value={produtoSelecionado.limit} disabled={!modoEdicao} className="border rounded px-3 py-2 bg-gray-100" />
                  </div>
                </div>
                <div className="font-semibold text-lg mb-2">Configuração Adicional</div>
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={!!produtoSelecionado.isEmblem} disabled={!modoEdicao} readOnly /> É um emblema
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={!!produtoSelecionado.multiBuy} disabled={!modoEdicao} readOnly /> Pode ser comprado várias vezes
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={!!produtoSelecionado.isBanner} disabled={!modoEdicao} readOnly /> É um banner
                  </label>
                </div>
              </>
            ) : (
              <div>
                <div className="font-semibold text-lg mb-2">Compradores</div>
                <div className="mb-2 text-sm text-gray-700"><b>O que é Entregue e Comprado?</b> Alguns produtos que você pode vender na loja, podem ser produtos do próprio jogo, então oferecemos uma ferramenta para você controlar quem <i>comprou</i> e quem já <i>recebeu</i>.</div>
                <table className="w-full text-sm border mb-4">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-2 text-left">Comprador</th>
                      <th className="p-2 text-left">Status</th>
                      <th className="p-2 text-left">Data</th>
                      <th className="p-2 text-left">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {compradores.length === 0 && (
                      <tr><td colSpan={4} className="text-center p-4 text-gray-400">Nenhuma compra registrada para este produto.</td></tr>
                    )}
                    {compradores.map((c, idx) => (
                      <tr key={c._id || idx} className="border-b last:border-b-0">
                        <td className="p-2">{c.buyer?.nickname || '-'}</td>
                        <td className="p-2">
                          {c.status === 'Comprado' ? (
                            <span className="bg-green-500 text-white px-3 py-1 rounded">Comprado</span>
                          ) : (
                            <span className="bg-blue-500 text-white px-3 py-1 rounded">Entregue</span>
                          )}
                        </td>
                        <td className="p-2">{new Date(c.createdAt).toLocaleString('pt-BR')}</td>
                        <td className="p-2 flex gap-2">
                          {c.status === 'Comprado' && (
                            <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs" onClick={() => handleSetEntregue(c._id)}>Pago</button>
                          )}
                          <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs" onClick={() => handleRemoverCompra(c._id)}>Remover</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <button className="px-2 py-1 rounded bg-gray-200" disabled>{'<'}</button>
                  <span>1 de 1 Páginas</span>
                  <button className="px-2 py-1 rounded bg-gray-200" disabled>{'>'}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {showNotification && (
        <div style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 9999 }}>
          <Notification message={notificationMsg} onClose={() => setShowNotification(false)} />
        </div>
      )}
      {showCoinsHistory && (
        <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 340, maxWidth: 600, width: '100%', boxShadow: '0 8px 32px #0002', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => setShowCoinsHistory(false)} style={{ position: 'absolute', top: 12, right: 18, fontSize: 28, color: '#888', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>&times;</button>
            <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18, color: '#222', textAlign: 'center' }}>Histórico de moedas de {coinsHistoryUser?.nickname}</h2>
            <table className="w-full text-sm mb-2">
              <thead>
                <tr className="bg-[#f7f7f7]">
                  <th className="p-2 text-left">Operador</th>
                  <th className="p-2 text-left">Valor</th>
                  <th className="p-2 text-left">Data</th>
                </tr>
              </thead>
              <tbody>
                {coinsHistory.length === 0 && (
                  <tr><td colSpan={3} className="text-center p-4 text-gray-400">Nenhum registro encontrado.</td></tr>
                )}
                {coinsHistory.map((h, idx) => (
                  <tr key={idx} className="border-b last:border-b-0">
                    <td className="p-2">{h.operator}</td>
                    <td className="p-2">{h.value > 0 ? '+' : ''}{h.value}</td>
                    <td className="p-2">{new Date(h.date).toLocaleString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DpanelLoja; 