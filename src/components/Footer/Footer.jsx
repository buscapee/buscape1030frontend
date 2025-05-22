import React from 'react';
import style from './footer.module.css';

const Footer = () => {
  return (
    <footer className={style.footer}>
      <div className={style.container}>
        <div className={style.topSection}>
          {/* Logo e Links */}
          <div className={style.brandLinks}>
            <div className={style.brand}>
              <div className={style.logoBox}>
                {/* Ícone de desenvolvedor (</>) com cor #14532d */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#14532d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
              </div>
              <div className={style.brandText}>
                <a href="/" className={style.brandName}>DMESystem</a>
                <span className={style.year}>© {new Date().getFullYear()}</span>
              </div>
            </div>
            <div style={{ color: '#bdbdbd', fontSize: 13, fontWeight: 500 }}>
              Departamento Militar de Elite 2015 ~ {new Date().getFullYear()} ©
            </div>
          </div>
        </div>
        {/* Créditos */}
        <div className={style.bottomSection}>
          <div style={{
            width: '100%',
            textAlign: 'center',
            color: '#fff',
            fontFamily: 'Industry, sans-serif',
            fontWeight: 700,
            fontSize: 14,
            marginTop: 8
          }}>
            <span style={{ color: '#fff', fontWeight: 700, fontFamily: 'Industry, sans-serif' }}>Desenvolvido por Davi Morais (punkbolak) & Rhuan Rodrigues (Igz).</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;