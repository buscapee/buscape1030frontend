import React, { useContext, useEffect, useState } from 'react';
import { FaListUl } from "react-icons/fa";
import { TbLicense, TbLicenseOff } from "react-icons/tb";
import { MdOutlinePendingActions } from "react-icons/md";
import '../forms.css'
import TableEndorsement from '../../components/TableEndorsement/TableEndorsement';
import { EndorsementContext } from '../../context/EndorsementContext';
import License from '../../components/License/License';

const Endorsement = () => {
    const [showPromotions, setShowPromotions] = useState("Avais")
    const { getEndorsement } = useContext(EndorsementContext);
    const user = JSON.parse(localStorage.getItem("@Auth:ProfileUser"));

    useEffect(() => {
        getEndorsement();
        document.title = "Polícia DME - Avais";
    }, [])

    return (
        <div className='BodyForms' style={{display: 'flex', flexDirection: 'row', gap: '24px'}}>
            <article style={{minWidth: 320}}>
                <div className='contentBodyElement'>
                    <div className='contentBodyElementTitle '>
                        <h3>Menu Rápido</h3>
                    </div>
                    <ul>
                        <li><button className='contentBodyElementMenu' onClick={() => {
                            setShowPromotions("Solicitar Licença")
                            getEndorsement()
                            }}>Solicitar Licença<span><MdOutlinePendingActions /></span></button></li>

                        <li><button className='contentBodyElementMenu' onClick={() => {
                            setShowPromotions("Avais")
                            getEndorsement()
                            }}>Avais<span><MdOutlinePendingActions /></span></button></li>

                        <li><button className='contentBodyElementMenu' onClick={() => {
                            setShowPromotions("Avais Ativos")
                            getEndorsement()
                        }}>Avais ativos<span><TbLicense /></span></button></li>

                        <li><button className='contentBodyElementMenu' onClick={() => {
                            setShowPromotions("Avais Encerrados")
                            getEndorsement()
                            }}>Avais encerrados<span><TbLicenseOff /></span></button></li>
                    </ul>
                </div>
            </article>
            <main style={{flex: 1}}>
                {showPromotions === "Solicitar Licença" &&
                    <License user={user} />
                }
                {showPromotions === "Avais" &&
                    <>
                        <div className='divMainForms'>
                            <h2><span> <FaListUl /></span>Lista de Avais</h2>
                        </div>
                        <TableEndorsement
                            typeStatus={"Avais"}
                        />
                    </>
                }

                {showPromotions === "Avais Ativos" &&
                    <>
                        <div className='divMainForms'>
                            <h2><span> <FaListUl /></span>Lista de Avais Ativos</h2>
                        </div>
                        <TableEndorsement
                            typeStatus={"Avais Ativos"}
                        />
                    </>
                }

                {showPromotions === "Avais Encerrados" &&
                    <>
                        <div className='divMainForms'>
                            <h2><span> <FaListUl /></span>Lista de Avais Encerrados</h2>
                        </div>
                        <TableEndorsement
                            typeStatus={"Avais Encerrados"}
                        />
                    </>
                }
            </main>
        </div>
    )
}

export default Endorsement;
