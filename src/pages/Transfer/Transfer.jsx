import React, { useContext, useEffect, useState } from "react";
import { FaListUl, FaUserPlus } from "react-icons/fa";
import "../forms.css";
import { RequirementsContext } from "../../context/Requirements";
import TableRequirements from "../../components/TableRequirements/TableRequirements";
import FormTransfer from "../../components/FormReq/FormTransfer";

const Transfer = () => {
  const { searchRequerimentsPromotedsUser, requerimentsFilter } =
    useContext(RequirementsContext);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const typeStatus = "Transferência";
  
  useEffect(() => {
    searchRequerimentsPromotedsUser("Transferência", "");
    document.title = "Polícia DME - Transferências";
  }, []);

  return (
    <div className="BodyForms">
      <article>
        <div className="contentBodyElement">
          <div className="contentBodyElementTitle ">
            <h3>Menu Rápido</h3>
          </div>
          <ul>
            <li>
              <button
                className="contentBodyElementMenu"
                onClick={() => setShowTransferForm(true)}
              >
                Nova Transferência
                <span>
                  <FaUserPlus />
                </span>
              </button>
            </li>
            <li>
              <button
                className="contentBodyElementMenu"
                onClick={() => setShowTransferForm(false)}
              >
                Todas as Transferências
                <span>
                  <FaListUl />
                </span>
              </button>
            </li>
          </ul>
        </div>
      </article>
      <main>
        {!showTransferForm ? (
          <>
            <div className="divMainForms">
              <h2>
                <span>
                  {" "}
                  <FaListUl />
                </span>
                Lista de Transferências
              </h2>
            </div>
            <TableRequirements
              typeStatus={typeStatus}
              searchRequerimentsPromotedsUser={searchRequerimentsPromotedsUser}
              requerimentsFilter={requerimentsFilter}
            />
          </>
        ) : (
          <FormTransfer />
        )}
      </main>
    </div>
  );
};

export default Transfer; 