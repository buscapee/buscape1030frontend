import React, { useContext, useEffect, useState, useRef, useMemo } from 'react';
import { PrivateMessageContext } from '../context/PrivateMessageContext';
import { UserContext } from '../context/UserContext';
import JoditEditor from 'jodit-react';
import { FaInbox, FaPaperPlane, FaUpload, FaFileAlt, FaTrash, FaCheck, FaPlus, FaUserCircle, FaRegEnvelopeOpen, FaRegEnvelope } from 'react-icons/fa';
import ConfirmationModal from '../components/ConfirmationModal';

const abas = [
  { label: 'Caixa de entrada', tipo: 'inbox', icon: <FaInbox className="mr-2" /> },
  { label: 'Mensagens enviadas', tipo: 'sent', icon: <FaPaperPlane className="mr-2" /> },
  { label: 'Caixa de envio', tipo: 'outbox', icon: <FaUpload className="mr-2" /> }, // Placeholder
  { label: 'Arquivos', tipo: 'files', icon: <FaFileAlt className="mr-2" /> }, // Placeholder
];

const MensagemPrivada = () => {
  const [abaAtiva, setAbaAtiva] = useState(0);
  const [selecionados, setSelecionados] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [destinatario, setDestinatario] = useState('');
  const [assunto, setAssunto] = useState('');
  const [corpo, setCorpo] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [msgDetalhe, setMsgDetalhe] = useState(null);
  const [showDetalhe, setShowDetalhe] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const { inbox, sent, fetchInbox, fetchSent, sendMessage, deleteMessage, markAsRead, loading } = useContext(PrivateMessageContext);
  const { searchAllUsers, user } = useContext(UserContext);

  // Jodit config
  const editor = useRef(null);
  const config = useMemo(
    () => ({
      readonly: false,
      placeholder: 'Escreva sua mensagem....',
      height: 400,
      width: '100%',
      minHeight: 350,
      style: { minHeight: 350, width: '100%' },
      toolbarAdaptive: false,
      toolbarSticky: false,
      buttons: [
        'bold', 'italic', 'underline', 'strikethrough', '|',
        'ul', 'ol', '|',
        'outdent', 'indent', '|',
        'font', 'fontsize', 'brush', 'paragraph', '|',
        'image', 'table', 'link', '|',
        'align', 'undo', 'redo', '|',
        'hr', 'eraser', 'copyformat', 'fullsize', 'selectall', 'print'
      ],
      askBeforePasteHTML: false,
      askBeforePasteFromWord: false,
      defaultActionOnPaste: 'insert_as_html',
      uploader: { insertImageAsBase64URI: true },
      showCharsCounter: true,
      showWordsCounter: true,
      showXPathInStatusbar: false,
    }),
    []
  );

  // Controle de timeout para dropdown
  const blurTimeout = useRef();

  useEffect(() => {
    if (abas[abaAtiva].tipo === 'inbox') fetchInbox();
    if (abas[abaAtiva].tipo === 'sent') fetchSent();
    // eslint-disable-next-line
  }, [abaAtiva]);

  // Atualiza resultados do autocomplete
  useEffect(() => {
    if (userSearch.length > 1) {
      searchAllUsers(userSearch);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [userSearch, searchAllUsers]);

  useEffect(() => {
    if (user && user.users) setUserResults(user.users);
  }, [user]);

  const mensagens =
    abas[abaAtiva].tipo === 'inbox' ? inbox :
    abas[abaAtiva].tipo === 'sent' ? sent : [];

  const toggleSelecionado = (id) => {
    setSelecionados((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const selecionarTudo = () => {
    setSelecionados(mensagens.map((m) => m._id));
  };
  const desmarcarTudo = () => {
    setSelecionados([]);
  };

  const handleDeleteSelecionados = async () => {
    setShowConfirmDelete(true);
  };

  const confirmDeleteSelecionados = async () => {
    for (const id of selecionados) {
      await deleteMessage(id, abas[abaAtiva].tipo);
    }
    setSelecionados([]);
    setShowConfirmDelete(false);
    if (abas[abaAtiva].tipo === 'inbox') fetchInbox();
    if (abas[abaAtiva].tipo === 'sent') fetchSent();
    window.dispatchEvent(new CustomEvent('showNotification', { detail: { message: 'Mensagens apagadas com sucesso.', type: 'success' } }));
  };

  const cancelDeleteSelecionados = () => {
    setShowConfirmDelete(false);
  };

  const handleMarcarComoLida = async () => {
    for (const id of selecionados) {
      await markAsRead(id);
    }
    setSelecionados([]);
    fetchInbox();
  };

  const handleEnviar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    await sendMessage({ destinatario, assunto, corpo });
    setShowModal(false);
    setDestinatario('');
    setAssunto('');
    setCorpo('');
    setUserSearch('');
    setEnviando(false);
    fetchSent();
    // Notificação de sucesso
    window.dispatchEvent(new CustomEvent('showNotification', { detail: { message: 'Mensagem enviada com sucesso.', type: 'success' } }));
  };

  // Visualização detalhada da mensagem
  const abrirDetalhe = async (msg) => {
    setMsgDetalhe(msg);
    setShowDetalhe(true);
    // Se for inbox e não lida, marcar como lida
    if (abas[abaAtiva].tipo === 'inbox' && !msg.lida) {
      await markAsRead(msg._id);
      fetchInbox();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e9eaf3] to-[#f7f8fa] flex flex-col items-center py-8">
      <div className="w-full max-w-4xl mt-16">
        {/* Abas */}
        <div className="flex bg-white rounded-t-2xl shadow-lg overflow-x-auto border-b-2 border-gray-100">
          {abas.map((aba, idx) => (
            <button
              key={aba.label}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-base font-semibold border-b-4 transition-colors duration-200 focus:outline-none ${
                abaAtiva === idx
                  ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-inner'
                  : 'border-transparent bg-white text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => { setAbaAtiva(idx); setSelecionados([]); }}
            >
              {aba.icon} {aba.label}
            </button>
          ))}
        </div>

        {/* Barra de progresso e filtro */}
        <div className="bg-white shadow px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full max-w-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-700">Caixa de entrada</span>
              <span className="text-xs text-blue-600 font-bold">2% cheia</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-2 bg-blue-500 transition-all duration-500" style={{ width: '2%' }}></div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Mostrar desde:</span>
            <select className="border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-200">
              <option>Todas as mensagens</option>
              <option>Última semana</option>
              <option>Último mês</option>
            </select>
            <button className="ml-2 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded shadow flex items-center gap-1"><FaCheck /> Ir</button>
          </div>
        </div>

        {/* Lista de mensagens */}
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden mt-6">
          <div className="flex justify-between items-center bg-gradient-to-r from-blue-900 to-blue-700 text-white px-6 py-3 text-lg font-semibold">
            <span>Assunto</span>
            <span>Selecionar</span>
          </div>
          <div>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Carregando...</div>
            ) : mensagens.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Nenhuma mensagem encontrada.</div>
            ) : (
              mensagens.map((msg) => (
                <div key={msg._id} className={`flex items-center px-6 py-4 border-b last:border-b-0 transition group hover:bg-blue-50 ${!msg.lida && abas[abaAtiva].tipo === 'inbox' ? 'bg-blue-50/50' : ''}` }>
                  <div className="flex-1 flex items-center gap-4">
                    <img
                      src={`https://www.habbo.com.br/habbo-imaging/avatarimage?&user=${abas[abaAtiva].tipo === 'inbox' ? msg.remetente : msg.destinatario}&action=std&direction=3&head_direction=3&img_format=png&gesture=sml&headonly=1&size=b`}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full border border-gray-200 bg-white object-cover"
                      style={{ minWidth: 40, minHeight: 40 }}
                    />
                    <div>
                      <div
                        className="font-bold text-gray-800 cursor-pointer hover:underline text-base flex items-center gap-2"
                        onClick={() => abrirDetalhe(msg)}
                      >
                        {abas[abaAtiva].tipo === 'inbox' && !msg.lida ? <FaRegEnvelope className="text-blue-500" /> : <FaRegEnvelopeOpen className="text-gray-400" />} {msg.assunto}
                      </div>
                      <div className="text-gray-600 text-xs mt-1">{new Date(msg.createdAt).toLocaleString('pt-BR')}</div>
                      {abas[abaAtiva].tipo === 'inbox' && !msg.lida && (
                        <span className="inline-block text-xs text-blue-600 font-bold ml-1">(Não lida)</span>
                      )}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selecionados.includes(msg._id)}
                    onChange={() => toggleSelecionado(msg._id)}
                    className="w-5 h-5 accent-blue-500"
                  />
                </div>
              ))
            )}
          </div>
          <div className="flex justify-end items-center px-6 py-2 text-sm text-gray-600 bg-gray-50 border-t gap-2">
            <button className="underline hover:text-blue-700" onClick={selecionarTudo}>Selecionar tudo</button>
            <span>::</span>
            <button className="underline hover:text-blue-700" onClick={desmarcarTudo}>Desmarcar tudo</button>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex flex-wrap gap-4 justify-center mt-8">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow flex items-center gap-2 font-semibold transition" onClick={() => setShowModal(true)}><FaPlus /> Nova mensagem</button>
          {abas[abaAtiva].tipo === 'inbox' && (
            <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg shadow flex items-center gap-2 font-semibold transition" onClick={handleMarcarComoLida}><FaCheck /> Marcar como lida</button>
          )}
          <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg shadow flex items-center gap-2 font-semibold transition" onClick={handleDeleteSelecionados}><FaTrash /> Apagar selecionados</button>
        </div>

        {/* Pop-up de confirmação de exclusão */}
        <ConfirmationModal
          open={showConfirmDelete}
          title="Confirmar exclusão"
          message="Tem certeza que deseja apagar as mensagens selecionadas? Essa ação não poderá ser desfeita."
          onConfirm={confirmDeleteSelecionados}
          onCancel={cancelDeleteSelecionados}
          confirmText="Excluir"
          cancelText="Cancelar"
        />

        {/* Modal de nova mensagem */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 transition-all duration-200">
            <form className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl min-h-[500px] relative flex flex-col justify-center p-10" onSubmit={handleEnviar}>
              <button type="button" className="absolute top-4 right-8 text-gray-500 hover:text-red-600 text-2xl" onClick={() => setShowModal(false)}>&times;</button>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><FaPlus className="text-blue-500" /> Nova mensagem</h2>
              <div className="mb-4 relative">
                <label className="block text-sm font-medium mb-1">Destinatário</label>
                <input
                  type="text"
                  className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-200"
                  value={userSearch || destinatario}
                  onChange={e => { setUserSearch(e.target.value); setDestinatario(e.target.value); setShowSuggestions(true); }}
                  placeholder="Digite o nickname do usuário"
                  autoFocus
                  autoComplete="off"
                  onBlur={() => { blurTimeout.current = setTimeout(() => setShowSuggestions(false), 80); }}
                  onFocus={() => { if (userSearch.length > 1 && userResults.length > 0) setShowSuggestions(true); }}
                />
                {showSuggestions && userSearch.length > 1 && userResults.length > 0 && (
                  <div
                    className="absolute left-0 right-0 max-w-full z-50 mt-1 bg-white border border-gray-200 rounded shadow-lg"
                    style={{ maxHeight: 220, overflowY: 'auto', boxShadow: '0 4px 16px #0001' }}
                  >
                    {userResults.map(u => (
                      <div
                        key={u._id}
                        className="px-3 py-2 hover:bg-blue-50 cursor-pointer transition-colors flex items-center gap-2"
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => {
                          setDestinatario(u.nickname);
                          setUserSearch('');
                          setShowSuggestions(false);
                          clearTimeout(blurTimeout.current);
                        }}
                      >
                        <FaUserCircle className="text-lg text-blue-400" /> {u.nickname} <span className="text-xs text-gray-500">({u.patent})</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Assunto</label>
                <input
                  type="text"
                  className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-200"
                  value={assunto}
                  onChange={e => setAssunto(e.target.value)}
                  required
                  onFocus={() => { setShowSuggestions(false); clearTimeout(blurTimeout.current); }}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Mensagem</label>
                <div style={{minHeight: 200, maxHeight: 400, overflowY: 'auto'}}>
                  <JoditEditor
                    ref={editor}
                    value={corpo}
                    config={config}
                    tabIndex={1}
                    onBlur={setCorpo}
                    onChange={setCorpo}
                    onFocus={() => { setShowSuggestions(false); clearTimeout(blurTimeout.current); }}
                  />
                </div>
              </div>
              <div className="w-full bg-white pt-2 flex-shrink-0 z-10">
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg w-full font-semibold text-lg transition" disabled={enviando}>{enviando ? 'Enviando...' : 'Enviar'}</button>
              </div>
            </form>
          </div>
        )}

        {/* Modal de detalhe da mensagem */}
        {showDetalhe && msgDetalhe && (
          <div className="fixed inset-0 bg-black/30 flex items-start justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-2xl relative mt-20">
              <button type="button" className="absolute top-4 right-6 text-gray-500 hover:text-red-600 text-2xl" onClick={() => setShowDetalhe(false)}>&times;</button>
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2"><FaFileAlt className="text-blue-500" /> {msgDetalhe.assunto}</h2>
              <div className="mb-4 text-sm text-gray-700 flex flex-col gap-1">
                <span><span className="font-semibold">De:</span> {msgDetalhe.remetente}</span>
                <span><span className="font-semibold">Para:</span> {msgDetalhe.destinatario}</span>
                <span><span className="font-semibold">Data:</span> {new Date(msgDetalhe.createdAt).toLocaleString('pt-BR')}</span>
              </div>
              <div className="border-t pt-4 text-gray-800 whitespace-normal break-words min-h-[60px] max-h-[400px] overflow-auto text-base leading-relaxed" style={{wordBreak: 'break-word', overflowWrap: 'anywhere'}} dangerouslySetInnerHTML={{ __html: msgDetalhe.corpo }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MensagemPrivada; 