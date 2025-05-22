import React, { useContext, useEffect, useState } from 'react'
import { FaArrowLeft } from "react-icons/fa";

import style from './members.module.css'
import ListMembers from '../../components/ListMembers/ListMembers';
import { AuthContext } from '../../context/AuthContext';
import { SystemContext } from '../../context/SystemContext';
import { UserContext } from '../../context/UserContext';

const Members = () => {
    
    const { getAll, user} = useContext(UserContext)
    const { infoSystem, setPatents } = useContext(SystemContext)
    const [select, setSelect] = useState('menu');

    useEffect(() => {
        document.title = "Polícia DME - Membros";
    }, []);




    return (
        <div className={style.Members}>
            {select && select === "menu" &&

                <>
                    <h2>Escolha uma hierarquia</h2>
                    <div className={style.btns}>
                        <button onClick={() => {setSelect("Militares")
                            setPatents('');
                        }} >Corpo Militar</button>
                        <button onClick={() => {setSelect("Executivos")
                            setPatents('')
                        }}>Corpo Empresarial</button>
                        <button onClick={() => setSelect("Cadetes")}>Cadetes</button>
                        {infoSystem[0]?.supremes && infoSystem[0].supremes.length > 0 && (
                            <button onClick={() => {setSelect("AltoComandoSupremo")
                                setPatents('')
                            }}>Alto Comando Supremo</button>
                        )}
                        <button onClick={() => setSelect("Exonerados")}>Exonerados</button>
                    </div>
                </>
            }

           { (select === "Militares" || select === "Executivos" || select === "AltoComandoSupremo" || select === "Exonerados" || select === "Cadetes") && 
           <main>
                <button onClick={() => setSelect("menu")}> <FaArrowLeft /> Voltar</button>

                <ListMembers
                    infoSystem={infoSystem}
                    select={select}
                />
            </main>}




        </div>
    )
}

export default Members