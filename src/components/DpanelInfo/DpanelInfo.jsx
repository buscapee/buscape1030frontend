import { useContext, useEffect, useState } from 'react';
import { SystemContext } from '../../context/SystemContext';
import Preloader from '../../assets/preloader.gif';
import Notification from '../Notification/Notification';

const DpanelInfo = () => {
  const { getSystemDpanel, infoSystemDpanel, info, loading, updateSystem, messege } = useContext(SystemContext);

  const [nameOrganization, setNameOrganization] = useState("");
  const [name, setName] = useState("")
  const [destaque1, setDestaque1] = useState("");
  const [destaque2, setDestaque2] = useState("");
  const [destaque3, setDestaque3] = useState("");
  const [destaque4, setDestaque4] = useState("");
  const [oficiaisMes, setOficiaisMes] = useState([]);
  const [slides, setSlides] = useState([]);

  useEffect(() => {
    getSystemDpanel();
  }, []);

  useEffect(() => {
    if (infoSystemDpanel.length > 0) {
      setName(infoSystemDpanel[0].name)
      setNameOrganization(infoSystemDpanel[0].nameOrganization)
      setDestaque1(infoSystemDpanel[0].destaques1)
      setDestaque2(infoSystemDpanel[0].destaques2)
      setDestaque3(infoSystemDpanel[0].destaques3)
      setDestaque4(infoSystemDpanel[0].destaques4)
      setOficiaisMes(infoSystemDpanel[0].oficiaisMes || [])
      setSlides(infoSystemDpanel[0].slides || [])
    }
  }, [infoSystemDpanel]);

  const handleAddOficial = () => {
    if (oficiaisMes.length < 20) {
      setOficiaisMes([...oficiaisMes, { nickname: '', nota: '' }]);
    }
  };

  const handleRemoveOficial = (idx) => {
    setOficiaisMes(oficiaisMes.filter((_, i) => i !== idx));
  };

  const handleChangeOficial = (idx, field, value) => {
    const novos = [...oficiaisMes];
    novos[idx][field] = value;
    setOficiaisMes(novos);
  };

  const handleAddSlide = () => {
    if (slides.length < 10) {
      setSlides([...slides, { url: '' }]);
    }
  };

  const handleRemoveSlide = (idx) => {
    setSlides(slides.filter((_, i) => i !== idx));
  };

  const handleChangeSlide = (idx, value) => {
    const novos = [...slides];
    novos[idx].url = value;
    setSlides(novos);
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = {
      destaque1, 
      destaque2, 
      destaque3, 
      destaque4,
      oficiaisMes,
      slides
    }
    const result = await updateSystem(data);
    // Notificação global de sucesso
    window.dispatchEvent(new CustomEvent('showNotification', { detail: { message: 'System atualizado com sucesso!', type: 'success' } }));
  }


  if (loading) {
    return <div className='flex items-center justify-center h-full'> <img src={Preloader} alt="Loading..." /></div>;
  }
  return (
    <div className="flex justify-center items-center w-full">
      <div className="w-full">
        <h1 className="text-2xl font-bold text-center mb-6">Informações do Sistema</h1>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Dados Gerais</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white shadow rounded">
              <h3 className="text-lg font-semibold">Militares na Ativa</h3>
              <p className="text-2xl">{info.users}</p>
            </div>
            <div className="p-4 bg-white shadow rounded">
              <h3 className="text-lg font-semibold">Militares Registrados</h3>
              <p className="text-2xl">{info.usersTotal}</p>
            </div>
            <div className="p-4 bg-white shadow rounded">
              <h3 className="text-lg font-semibold">Departamentos Registradas</h3>
              <p className="text-2xl">{info.teams}</p>
            </div>
            <div className="p-4 bg-white shadow rounded">
              <h3 className="text-lg font-semibold">Total de Documentos</h3>
              <p className="text-2xl">{info.docs}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className='w-full'>
          <div className="mb-4">
            <label htmlFor="nameOrganization" className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Organização
            </label>
            <input
              type="text"
              id="nameOrganization"
              name="nameOrganization"
              value={nameOrganization}
              className="w-full p-2 border border-gray-300 rounded"
              disabled
            />
          </div>

          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Sigla
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              className="w-full p-2 border border-gray-300 rounded"
              disabled
            />
          </div>

          <div className="mb-4">
            <label htmlFor="emblema" className="block text-sm font-medium text-gray-700 mb-2">
              Emblema
            </label>
            <input
              type="text"
              id="emblema"
              name="emblema"
              className="w-full p-2 border border-gray-300 rounded"
              placeholder='Adicione a url do emblema.'
              disabled
            />
          </div>

          <div className="mb-4">
            <label htmlFor="destaques1" className="block text-sm font-medium text-gray-700 mb-2">
              Destaque do Centro de Instrução
            </label>
            <input
              type="text"
              id="destaques1"
              name="destaques1"
              value={destaque1}
              onChange={(e) => setDestaque1(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="destaques2" className="block text-sm font-medium text-gray-700 mb-2">
              Destaque do Centro de Treinamento
            </label>
            <input
              type="text"
              id="destaques2"
              name="destaques2"
              value={destaque2}
              onChange={(e) => setDestaque2(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="destaques3" className="block text-sm font-medium text-gray-700 mb-2">
              Destaque do Centro de Supervisão
            </label>
            <input
              type="text"
              id="destaques3"
              name="destaques3"
              value={destaque3}
              onChange={(e) => setDestaque3(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="destaques4" className="block text-sm font-medium text-gray-700 mb-2">
              Destaque do Centro de Patrulha
            </label>
            <input
              type="text"
              id="destaques4"
              name="destaques4"
              value={destaque4}
              onChange={(e) => setDestaque4(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Oficiais do Mês
            </label>
            {oficiaisMes.map((oficial, idx) => (
              <div key={idx} className="flex gap-2 mb-2 items-center">
                <input
                  type="text"
                  placeholder="Nickname"
                  value={oficial.nickname}
                  onChange={e => handleChangeOficial(idx, 'nickname', e.target.value)}
                  className="p-2 border border-gray-300 rounded w-1/2"
                />
                <input
                  type="text"
                  placeholder="Nota"
                  value={oficial.nota}
                  onChange={e => handleChangeOficial(idx, 'nota', e.target.value)}
                  className="p-2 border border-gray-300 rounded w-1/4"
                />
                <button type="button" onClick={() => handleRemoveOficial(idx)} className="text-red-500 font-bold">Remover</button>
              </div>
            ))}
            {oficiaisMes.length < 20 && (
              <button type="button" onClick={handleAddOficial} className="mt-2 px-4 py-1 bg-green-500 text-white rounded">Adicionar Oficial</button>
            )}
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slides (Imagens para exibir na Home)
            </label>
            {slides.map((slide, idx) => (
              <div key={idx} className="flex gap-2 mb-2 items-center">
                <input
                  type="text"
                  placeholder="URL da imagem"
                  value={slide.url}
                  onChange={e => handleChangeSlide(idx, e.target.value)}
                  className="p-2 border border-gray-300 rounded w-3/4"
                />
                <button type="button" onClick={() => handleRemoveSlide(idx)} className="text-red-500 font-bold">Remover</button>
              </div>
            ))}
            {slides.length < 10 && (
              <button type="button" onClick={handleAddSlide} className="mt-2 px-4 py-1 bg-green-500 text-white rounded">Adicionar Slide</button>
            )}
          </div>
          {messege && <p className="mt-4 text-green-500">{messege.msg}</p>}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-200"
          >
            Atualizar
          </button>
        </form>
      </div>
    </div>
  );
};

export default DpanelInfo;
