import React, { useContext, useEffect, useState } from "react";
import { FaListUl, FaUserPlus } from "react-icons/fa";
import "../forms.css";
import { RequirementsContext } from "../../context/Requirements";
import TableRequirements from "../../components/TableRequirements/TableRequirements";
import FormCadet from "../../components/FormReq/FormCadet";

const Cadets = () => {
  const { searchRequerimentsPromotedsUser, requerimentsFilter } =
    useContext(RequirementsContext);
  const [showCadetForm, setShowCadetForm] = useState(false);
  const typeStatus = "Cadete";
  useEffect(() => {
    searchRequerimentsPromotedsUser("Cadete", "");
    document.title = "Polícia DME - Cadetes";
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
                onClick={() => setShowCadetForm(true)}
              >
                Cadastrar Cadete
                <span>
                  <FaUserPlus />
                </span>
              </button>
            </li>
            <li>
              <button
                className="contentBodyElementMenu"
                onClick={() => setShowCadetForm(false)}
              >
                Todos os Cadetes
                <span>
                  <FaListUl />
                </span>
              </button>
            </li>
          </ul>
        </div>
      </article>
      <main>
        {!showCadetForm ? (
          <>
            <div className="divMainForms">
              <h2>
                <span>
                  {" "}
                  <FaListUl />
                </span>
                Lista de Cadetes
              </h2>
            </div>
            <TableRequirements
              typeStatus={typeStatus}
              searchRequerimentsPromotedsUser={searchRequerimentsPromotedsUser}
              requerimentsFilter={requerimentsFilter}
            />
          </>
        ) : (
          <FormCadet />
        )}
      </main>
    </div>
  );
};

export default Cadets;
