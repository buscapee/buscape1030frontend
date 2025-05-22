import React, { useContext } from 'react'
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer/Footer'
import { AuthContext } from '../../context/AuthContext'
import style from "./PageBasic.module.css"
import { Outlet, useLocation } from 'react-router-dom'

const PageBasic = () => {
    const { isAuthentication } = useContext(AuthContext);
    const location = useLocation();

  return (
    <>
     {isAuthentication && <Navbar />} 
        <div
          className={style.basic}
          style={isAuthentication ? { marginTop: 33 } : {}}
        >
            <Outlet />
        </div>
        {/* Footer só aparece se não estiver na tela de login, criar conta ou DPanel */}
        {location.pathname !== '/login' && 
         location.pathname !== '/createaccount' && 
         location.pathname !== '/dpanel' && 
         <Footer />}
    </>
  )
}

export default PageBasic