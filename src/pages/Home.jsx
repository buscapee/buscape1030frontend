import { useContext, useEffect, useState } from 'react';
import FastMenu from '../components/FastMenu/FastMenu';
import './Home.css';
import Docs from '../components/Docs/Docs';
import Publication from '../components/Publication/Publication';
import License from '../components/License/License';
import Preloader from '../assets/preloader.gif';
import { AuthContext } from '../context/AuthContext';
import TagModal from '../components/TagModal/TagModal';
import { UserContext } from '../context/UserContext';
import { PublicationContext } from '../context/PublicationContext';
import Highlights from '../components/Highlights/Highlights';
import QuickSearch from '../components/QuickSearch/QuickSearch';
import OficiaisDoMes from '../components/OficiaisDoMes';
import RankTurnos from '../components/RankTurnos';
import { SystemContext } from '../context/SystemContext';

const Home = () => {
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [tag, setTag] = useState('');
  const [isButtonTag, setIsButtonTag] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const { loading: authLoading } = useContext(AuthContext);
  const { createTag, messege } = useContext(UserContext);
  const { getPublication, allPublications, loading: publicationLoading } = useContext(PublicationContext);
  const { infoSystemDpanel, getSystemDpanel } = useContext(SystemContext);
  const [slides, setSlides] = useState([]);

  useEffect(() => {
    document.title = "Polícia DME - Home";
    const userFromLocalStorage = JSON.parse(localStorage.getItem("@Auth:Profile"));
    const token = localStorage.getItem("@Auth:Token")
  
    setUser(userFromLocalStorage);

    if (userFromLocalStorage && userFromLocalStorage.tag === "Vazio") {
      setIsModalOpen(true);
    }

    getPublication(token);
    getSystemDpanel();
  }, []);

  useEffect(() => {
    if (infoSystemDpanel.length > 0 && infoSystemDpanel[0].slides) {
      setSlides(infoSystemDpanel[0].slides);
    }
  }, [infoSystemDpanel]);

  useEffect(() => {
    if (messege.msg) {
      setIsButtonTag(true);
    }
  }, [messege]);

  useEffect(() => {
    if (slides.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [slides]);

  const closeModal = () => setIsModalOpen(false);

  const handleCreateTag = () => {
    const data = {
      idUser: user._id,
      tag: tag
    };
    createTag(data);
    setTag('');
  };

  if (authLoading || publicationLoading || !user) {
    return (
      <div className='preloader'>
        <img src={Preloader} alt="" />
      </div>
    );
  }

  return (
    <div className='body'>
      <div className='one'>
        <FastMenu />
        <OficiaisDoMes />
      </div>
      <div className='two'>
        {slides && slides.length > 0 && (
          <div className="mb-4 flex flex-col items-center w-full" style={{ position: 'relative', zIndex: 1 }}>
            <div className="w-full flex justify-center mb-2" style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 1 }}>
              {slides.length === 1 ? (
                <img
                  src={slides[0].url}
                  alt={`Slide 1`}
                  style={{
                    width: '100%',
                    maxWidth: 900,
                    height: 150,
                    boxShadow: '0 2px 8px #bbb',
                    objectFit: 'cover',
                    margin: 0,
                    display: 'block',
                  }}
                />
              ) : (
                slides.map((slide, idx) => (
                  <img
                    key={idx}
                    src={slide.url}
                    alt={`Slide ${idx + 1}`}
                    style={{
                      width: '100%',
                      maxWidth: 900,
                      height: 150,
                      boxShadow: '0 2px 8px #bbb',
                      objectFit: 'cover',
                      margin: 0,
                      display: idx === currentSlide ? 'block' : 'none',
                      transition: 'opacity 0.5s',
                      opacity: idx === currentSlide ? 1 : 0,
                      position: 'relative',
                    }}
                  />
                ))
              )}
            </div>
          </div>
        )}
        <QuickSearch />
        {/* Removido o card de prévia do perfil do usuário logado abaixo da busca rápida */}
        {allPublications.length > 0 &&  <h1></h1>}
        {allPublications && 
          allPublications.map((publi) => (
          <Publication key={publi._id} publi={publi} />
        ))}
        <Docs />
        {/* <Highlights /> */}
      </div>
      <div className="try">
        <Highlights />
        <RankTurnos />
        {/* <License user={user} /> */}
      </div>
      <TagModal isOpen={isModalOpen} onClose={closeModal}>
        <h2 className="text-2xl font-bold mb-4">Crie sua TAG</h2>
        <p className="mb-2 text-[14px]">A partir de agora, para continuar usando o system, é necessário que você crie sua tag.</p>
        <input
          type="text"
          maxLength={3}
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          className="border w-full border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:border-blue-500"
        />
        <ul className='mb-2'>
          <li className='text-[10px] text-slate-500'>Use apenas 3 caracteres.</li>
          <li className='text-[10px] text-slate-500'>As letras devem fazer parte do seu apelido; caso contrário, o sistema não aceitará.</li>
        </ul>
        {messege && <p className='text-[13px] text-green-700'>{messege.msg}</p>}
        {messege && <p className='text-[13px] text-red-500'>{messege.error}</p>}
        {!isButtonTag && (
          <button
            onClick={handleCreateTag}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Criar
          </button>
        )}
        {isButtonTag && (
          <button
            onClick={closeModal}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Fechar
          </button>
        )}
      </TagModal>
    </div>
  );
};

export default Home;
