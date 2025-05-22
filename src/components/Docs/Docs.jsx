import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IoIosDocument } from "react-icons/io";
import { SlArrowUp } from "react-icons/sl";

import { DocsContext } from '../../context/DocsContext';
import Preloader from "../../assets/preloader.gif"
const Docs = () => {
  const { searchDoc, docSelected } = useContext(DocsContext);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      await searchDoc("System");
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className='contentBodyElement'>
      <div className='contentBodyElementTitle' style={{ background: '#fff', color: '#222', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 8, fontWeight: 700, fontSize: 16, padding: '12px 18px', borderBottom: '1px solid #ececec' }} onClick={() => setOpen(o => !o)}>
        <h3 className='flex items-center' style={{ color: '#222', background: 'transparent', fontWeight: 700, fontSize: 16, margin: 0 }}> <span className='mr-2'><IoIosDocument /></span> Documentos</h3>
        <SlArrowUp style={{ transition: 'transform 0.3s', transform: open ? 'rotate(0deg)' : 'rotate(180deg)', color: '#222' }} />
      </div>
      {open && (
        loading ? (
        <div className='flex items-center justify-center'> <img className='w-[50px]' src={Preloader} alt="Loading..." /></div>
      ) : (
        <ul>
          {docSelected && Array.isArray(docSelected) && docSelected.map((doc, index) => (
            <li key={index}><Link to={`/doc/${doc.url}`}>{doc.nameDocs}</Link></li>
          ))}
        </ul>
        )
      )}
    </div>
  );
};

export default Docs;
