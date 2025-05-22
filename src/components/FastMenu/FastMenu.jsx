import React, { useState } from 'react'
import {
  FaArrowAltCircleUp,
  FaArrowCircleDown,
  FaExclamationTriangle,
  FaSuitcase,
  FaDollarSign,
  FaStackOverflow,
  FaRegHandshake,
  FaAddressCard,
  FaUserSlash
} from "react-icons/fa";
import { TbLicense } from "react-icons/tb";
import { Link } from 'react-router-dom';
import { MdPostAdd } from "react-icons/md";
import { GiExitDoor } from "react-icons/gi";
import { IoIosSpeedometer } from "react-icons/io";
import License from '../License/License';
import TagModal from '../TagModal/TagModal';
import { SlArrowUp } from "react-icons/sl";

const FastMenu = () => {
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [open, setOpen] = useState(true);
  const user = JSON.parse(localStorage.getItem("@Auth:ProfileUser"));

  return (
    <div className='contentBodyElement'>
      <div className='contentBodyElementTitle' style={{ background: '#fff', color: '#222', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 8, fontWeight: 700, fontSize: 16, padding: '12px 18px', borderBottom: '1px solid #ececec' }} onClick={() => setOpen(o => !o)}>
        <h3 className='flex items-center' style={{ color: '#222', background: 'transparent', fontWeight: 700, fontSize: 16, margin: 0 }}><span className='mr-2'><FaStackOverflow/></span> Menu Rápido</h3>
        <SlArrowUp style={{ transition: 'transform 0.3s', transform: open ? 'rotate(0deg)' : 'rotate(180deg)', color: '#222' }} />
      </div>
      {open && (
      <ul>
        {user && user.userType === "Admin" && <li><Link to='/dpanel'>DPanel <span><IoIosSpeedometer /></span></Link></li>}
        <li><Link to={'/postclasse'}>Postar Instrução Inicial<span><MdPostAdd /></span> </Link></li>
        <li><Link to={'/promotion'}>Promoções <span><FaArrowAltCircleUp /></span> </Link></li>
        <li><Link to='/warning'>Advertências <span><FaExclamationTriangle /></span></Link></li>
        <li><Link to='/relegation'>Rebaixamento <span><FaArrowCircleDown /></span></Link></li>
        <li><Link to='/resignation'>Demissão <span> <GiExitDoor /></span></Link></li>
        <li><Link to='/exoneration'>Exoneração <span><FaUserSlash /></span></Link></li>
        <li><Link to='/contract'>Contratos <span><FaSuitcase /></span> </Link></li>
        <li>
          <Link to="#" onClick={e => { e.preventDefault(); setShowLicenseModal(true); }}>
            Solicitar Aval <span><FaAddressCard/></span>
          </Link>
        </li>
        {(user && (user.userType === "Admin" || user.userType === "Diretor" || user.userType === "Recursos Humanos")) &&
          <li><Link to='/endorsement'>Avais <span><TbLicense /></span></Link></li>}
        {(user && (user.userType === "Admin" || user.userType === "Diretor")) &&
          <li><Link to='/sale'>Vendas <span><FaDollarSign /></span></Link></li>}
      </ul>
      )}
      <TagModal isOpen={showLicenseModal} onClose={() => setShowLicenseModal(false)}>
        <License user={user} />
      </TagModal>
    </div>
  )
}

export default FastMenu