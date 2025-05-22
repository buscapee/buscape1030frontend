import React, { useContext, useEffect, useState } from 'react';
import { SystemContext } from '../context/SystemContext';
import Preloader from '../assets/preloader.gif';
import { FaMedal } from "react-icons/fa6";

const medalhasImg = [
  'https://i.imgur.com/VpOhegj.png',
  'https://i.imgur.com/VpOhegj.png',
  'https://i.imgur.com/VpOhegj.png'
];
const trofeuImg = 'https://i.imgur.com/5JYhbtS.png';

const OficiaisDoMes = () => {
  const { loading, getSystemDpanel, infoSystemDpanel } = useContext(SystemContext);
  const [loadingInfo, setLoadingInfo] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      await getSystemDpanel();
      setLoadingInfo(false);
    };
    fetchData();
  }, []);

  if (loading || loadingInfo || infoSystemDpanel.length === 0) {
    return <div className='flex items-center justify-center'> <img className='w-[50px]' src={Preloader} alt="Loading..." /></div>;
  }

  const oficiaisMes = infoSystemDpanel[0]?.oficiaisMes || [];

  return (
    <div style={{ marginTop: 28, background: '#fff', borderRadius: 14, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1.2px solid #ececec', padding: '0 0 12px 0', width: '100%' }}>
      <div style={{ background: '#fff', color: '#222', display: 'flex', alignItems: 'center', borderRadius: 8, fontWeight: 700, fontSize: 16, padding: '12px 18px', borderBottom: '1px solid #ececec', marginBottom: 8 }}>
        <h3 style={{ color: '#222', background: 'transparent', fontWeight: 700, fontSize: 16, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}><FaMedal style={{ color: '#facc15', fontSize: 20 }} /> Oficiais do Mês</h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, padding: '0 18px' }}>
        {oficiaisMes.slice(0, 20).map((oficial, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', background: '#f9f9f9', borderRadius: 10, padding: '7px 12px', marginBottom: 6, boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
            {/* Medalha ou número */}
            <div style={{ width: 32, display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 700, fontSize: 16, color: '#ffb300', marginRight: 8 }}>
              {idx < 3 ? (
                <img src={medalhasImg[idx]} alt={`Medalha ${idx+1}`} style={{ width: 26, height: 26 }} />
              ) : (
                <span style={{ color: '#888', fontWeight: 700 }}>{idx+1}º</span>
              )}
            </div>
            {/* Avatar */}
            <img src={`https://www.habbo.com.br/habbo-imaging/avatarimage?img_format=png&user=${oficial.nickname}&direction=2&head_direction=2&size=l&headonly=1`} alt={oficial.nickname} style={{ width: 42, height: 42, borderRadius: 10, marginRight: 10, background: '#eaeaea', border: '1.2px solid #e0e0e0' }} />
            {/* Nickname + troféu */}
            <span style={{ fontWeight: 700, fontSize: 16, color: '#222', marginRight: 6, display: 'flex', alignItems: 'center', gap: 4, minWidth: 0, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
              {oficial.nickname}
              {idx < 3 && <img src={trofeuImg} alt="Troféu" style={{ width: 16, height: 16, marginLeft: 2 }} />}
            </span>
            {/* Nota */}
            <span style={{ marginLeft: 'auto', background: '#ffb300', color: '#fff', fontWeight: 700, fontSize: 15, borderRadius: 8, padding: '2px 12px', minWidth: 32, textAlign: 'center', boxShadow: '0 1px 4px #ffb30022' }}>{oficial.nota}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OficiaisDoMes; 