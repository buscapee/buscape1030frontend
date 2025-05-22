import React, { useContext, useEffect, useState } from 'react';
import { FaUserSlash, FaListUl } from 'react-icons/fa';
import '../forms.css';
import { RequirementsContext } from '../../context/Requirements';
import TableRequirements from '../../components/TableRequirements/TableRequirements';
import FormExoneration from '../../components/FormReq/FormExoneration';

const Exoneration = () => {
  const { searchRequerimentsPromotedsUser, requerimentsFilter } = useContext(RequirementsContext);
  const [showExonerationForm, setShowExonerationForm] = useState(false);
  const typeStatus = 'Exoneração';

  useEffect(() => {
    searchRequerimentsPromotedsUser('Exoneração', '');
    document.title = 'Polícia DME - Exoneração';
  }, []);

  return (
    <div className='BodyForms'>
      <article>
        <div className='contentBodyElement'>
          <div className='contentBodyElementTitle '>
            <h3>Menu Rápido</h3>
          </div>
          <ul>
            <li><button className='contentBodyElementMenu' onClick={() => setShowExonerationForm(true)}>Exonerar<span><FaUserSlash /></span></button></li>
            <li><button className='contentBodyElementMenu' onClick={() => setShowExonerationForm(false)}>Todas as Exonerações<span><FaListUl /></span></button></li>
          </ul>
        </div>
      </article>
      <main>
        {!showExonerationForm ? (
          <>
            <div className='divMainForms'>
              <h2><span><FaListUl /></span>Lista de Exonerações</h2>
            </div>
            <TableRequirements
              typeStatus={typeStatus}
              searchRequerimentsPromotedsUser={searchRequerimentsPromotedsUser}
              requerimentsFilter={requerimentsFilter}
            />
          </>
        ) : (
          <FormExoneration />
        )}
      </main>
    </div>
  );
};

export default Exoneration; 