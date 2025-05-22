import React, { useContext, useEffect, useState } from 'react'
import { FaExclamationTriangle  , FaListUl } from "react-icons/fa";
import '../forms.css'
import { RequirementsContext } from '../../context/Requirements';
import TableRequirements from '../../components/TableRequirements/TableRequirements';

import FormWarning from '../../components/FormReq/FormWarning';

const Warning = () => {
    const { searchRequerimentsPromotedsUser, requerimentsFilter } = useContext(RequirementsContext);
    const [showPromotions, setShowPromotions] = useState(false);
    const typeStatus = "Advertência"
    useEffect(() => {
        searchRequerimentsPromotedsUser("Advertência", "")
        document.title = "Polícia DME - Advertências";
    }, [])

    return (
        <div className='BodyForms'>
            <article>
                <div className='contentBodyElement'>
                    <div className='contentBodyElementTitle '>
                        <h3>Menu Rápido</h3>
                    </div>
                    <ul>
                        <li><button className='contentBodyElementMenu' onClick={() => setShowPromotions(true)}>Advertir<span><FaExclamationTriangle /></span></button></li>
                        <li><button className='contentBodyElementMenu' onClick={() => setShowPromotions(false)}>Todos as Advetências<span><FaListUl /></span></button></li>
                    </ul>
                </div>
            </article>
            <main>
                {!showPromotions ? (
                    <>

                        <div className='divMainForms'>
                            <h2><span> <FaListUl /></span>Lista de Advertências</h2>
                        </div>
                        <TableRequirements
                            typeStatus={typeStatus}
                            searchRequerimentsPromotedsUser={searchRequerimentsPromotedsUser}
                            requerimentsFilter={requerimentsFilter}
                        />
                         </>)
                   : (

                    <FormWarning
                    
                    />

                )}
            </main>
        </div>
    )
}

export default Warning;