import React, { useContext, useEffect, useState } from 'react';
import { FaStar } from "react-icons/fa6";
import style from './Highlights.module.css';
import { Link } from 'react-router-dom';
import { SystemContext } from '../../context/SystemContext';
import Preloader from '../../assets/preloader.gif';
import emblemaInstrucao from '../../assets/emblema_instrucao.png';
import emblemaTreinamento from '../../assets/emblema_treinamento.png';
import emblemaSupervisao from '../../assets/emblema_supervisao.png';
import emblemaPatrulha from '../../assets/emblema_patrulha.png';

const medalhasImg = [
  'https://i.imgur.com/VpOhegj.png',
  'https://i.imgur.com/VpOhegj.png',
  'https://i.imgur.com/VpOhegj.png'
];
const trofeuImg = 'https://i.imgur.com/5JYhbtS.png';

const Highlights = () => {
    const { loading, getSystemDpanel, infoSystemDpanel } = useContext(SystemContext);
    const [loadingInfo, setLoadingInfo] = useState(true);
    const [selected, setSelected] = useState(null);

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

    // Dados dos centros e emblemas
    const destaques = [
        {
            setor: 'Centro de Instrução',
            emblema: emblemaInstrucao,
            nick: infoSystemDpanel[0]['destaques1']
        },
        {
            setor: 'Centro de Treinamento',
            emblema: emblemaTreinamento,
            nick: infoSystemDpanel[0]['destaques2']
        },
        {
            setor: 'Centro de Supervisão',
            emblema: emblemaSupervisao,
            nick: infoSystemDpanel[0]['destaques3']
        },
        {
            setor: 'Centro de Patrulha',
            emblema: emblemaPatrulha,
            nick: infoSystemDpanel[0]['destaques4']
        }
    ];

    return (
        <div className='contentBodyElement'>
            <div className='contentBodyElementTitle' style={{ background: '#fff', color: '#222', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: 8, fontWeight: 700, fontSize: 16, padding: '12px 18px', borderBottom: '1px solid #ececec' }}>
                <h3 className={style.title} style={{ width: '100%', textAlign: 'center', fontSize: 20, fontWeight: 700, color: '#222', background: 'transparent', margin: 0 }}><span><FaStar /></span> Destaques Semanais</h3>
            </div>
            {/* Emblemas alinhados */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24, margin: '18px 0 10px 0' }}>
                {destaques.map(({ emblema }, idx) => (
                    <button
                        key={idx}
                        onClick={() => setSelected(selected === idx ? null : idx)}
                        style={{
                            background: selected === idx ? '#facc15' : '#fff',
                            border: selected === idx ? '2.5px solid #facc15' : '1.5px solid #ececec',
                            borderRadius: 12,
                            padding: 6,
                            boxShadow: selected === idx ? '0 4px 16px #facc1533' : '0 1px 6px #ececec',
                            outline: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.18s',
                            width: 64,
                            height: 64,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        aria-label={`Selecionar destaque ${idx+1}`}
                    >
                        <img src={emblema} alt={`Emblema ${idx+1}`} style={{ width: 44, height: 44, borderRadius: 8, background: '#fff', border: '1px solid #e0e0e0' }} />
                    </button>
                ))}
            </div>
            {/* Destaque selecionado */}
            {selected !== null && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 28 }}>
                    <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 10px rgba(0,0,0,0.04)', border: '1.5px solid #ececec', padding: '18px 32px', display: 'flex', alignItems: 'center', gap: 18, minWidth: 220, maxWidth: 400 }}>
                        <img src={`https://www.habbo.com.br/habbo-imaging/avatarimage?img_format=png&user=${destaques[selected].nick}&direction=2&head_direction=2&size=l&headonly=1`} alt={destaques[selected].nick} style={{ width: 54, height: 54, borderRadius: 10, marginRight: 12 }} />
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}>
                            <span style={{ fontWeight: 700, fontSize: 18, color: '#031149', marginBottom: 2 }}>{destaques[selected].nick}</span>
                            <span style={{ fontSize: 14, color: '#888', fontWeight: 500 }}>{destaques[selected].setor}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Highlights;
