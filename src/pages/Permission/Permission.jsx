import React, { useContext, useEffect, useState } from 'react';
import { FaUserShield, FaListUl } from 'react-icons/fa';
import '../forms.css';
import FormPermission from '../../components/FormReq/FormPermission';
import TableRequirements from '../../components/TableRequirements/TableRequirements';
import { RequirementsContext } from '../../context/Requirements';

const Permission = () => {
  const { searchRequerimentsPromotedsUser, requerimentsFilter } = useContext(RequirementsContext);
  const [showForm, setShowForm] = useState(true);
  const typeStatus = 'Permissão';

  useEffect(() => {
    searchRequerimentsPromotedsUser(typeStatus, '');
    document.title = 'Polícia DME - Permissões';
  }, []);

  return (
    <div className='BodyForms'>
      <article>
        <div className='contentBodyElement'>
          <div className='contentBodyElementTitle '>
            <h3>Menu Rápido</h3>
          </div>
          <ul>
            <li><button className='contentBodyElementMenu' onClick={() => setShowForm(true)}>Aplicar Permissão<span><FaUserShield /></span></button></li>
            <li><button className='contentBodyElementMenu' onClick={() => setShowForm(false)}>Todas Permissões<span><FaListUl /></span></button></li>
          </ul>
        </div>
      </article>
      <main>
        {!showForm ? (
          <>
            <div className='divMainForms'>
              <h2><span> <FaListUl /></span>Lista de Permissões</h2>
            </div>
            <TableRequirements
              typeStatus={typeStatus}
              searchRequerimentsPromotedsUser={searchRequerimentsPromotedsUser}
              requerimentsFilter={requerimentsFilter}
            />
          </>
        ) : (
          <FormPermission />
        )}
      </main>
    </div>
  );
};

export default Permission; 