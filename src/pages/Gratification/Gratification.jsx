import React, { useContext, useEffect, useState } from 'react';
import { FaGift, FaListUl } from 'react-icons/fa';
import '../forms.css';
import { RequirementsContext } from '../../context/Requirements';
import TableRequirements from '../../components/TableRequirements/TableRequirements';
import FormReqGratification from '../../components/FormReq/FormReqGratification';

const Gratification = () => {
    const { searchRequerimentsPromotedsUser, requerimentsFilter } = useContext(RequirementsContext);
    const [showForm, setShowForm] = useState(false);
    const typeStatus = 'Gratificação';

    useEffect(() => {
        searchRequerimentsPromotedsUser(typeStatus, '');
        document.title = 'Polícia DME - Gratificações';
    }, []);

    return (
        <div className='BodyForms'>
            <article>
                <div className='contentBodyElement'>
                    <div className='contentBodyElementTitle '>
                        <h3>Menu Rápido</h3>
                    </div>
                    <ul>
                        <li><button className='contentBodyElementMenu' onClick={() => setShowForm(true)}>Requerer Gratificação<span><FaGift /></span></button></li>
                        <li><button className='contentBodyElementMenu' onClick={() => setShowForm(false)}>Todas as Gratificações<span><FaListUl /></span></button></li>
                    </ul>
                </div>
            </article>
            <main>
                {!showForm ? (
                    <>
                        <div className='divMainForms'>
                            <h2><span><FaListUl /></span>Lista de Gratificações</h2>
                        </div>
                        <TableRequirements
                            typeStatus={typeStatus}
                            searchRequerimentsPromotedsUser={searchRequerimentsPromotedsUser}
                            requerimentsFilter={requerimentsFilter}
                        />
                    </>
                ) : (
                    <FormReqGratification />
                )}
            </main>
        </div>
    );
};

export default Gratification; 