import React, { useContext } from 'react'
import style from '../TableTeamsMembers/TableTeamsMembers.module.css';
import { TeamsContext } from '../../context/TeamsContext';

const Confirmation = ({ dataUser , setIsRemove, team, userOk}) => {

    const { removeMember } = useContext(TeamsContext);

    const user = JSON.parse(localStorage.getItem("@Auth:ProfileUser"))

    const handleRemove = () => {
        const data = {
            idUser: user._id, 
            nickMember:dataUser.user.nickname, 
            idTeams: team._id,
            team,
        }
        removeMember(data)
        setIsRemove(false)
        // Notificação de sucesso
        window.dispatchEvent(new CustomEvent('showNotification', { detail: { message: 'Usuário excluído com sucesso.' } }));
        setTimeout(() => window.location.reload(), 1000);
    }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(0,0,0,0.18)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 4px 24px rgba(0,0,0,0.13)',
        padding: '36px 36px 28px 36px',
        minWidth: 340,
        maxWidth: 400,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <h2 style={{ fontWeight: 700, fontSize: 24, marginBottom: 18, color: '#23272e', letterSpacing: 0.2 }}>Confirmação</h2>
        <p style={{ fontSize: 17, marginBottom: 32, color: '#23272e', lineHeight: 1.5, maxWidth: 320 }}>
          Tem certeza que deseja excluir o usuário <span style={{ fontWeight: 700, color: '#031149' }}>&quot;{dataUser.user.nickname}&quot;</span>
          <span style={{ fontWeight: 500, color: '#23272e', margin: '0 4px' }}>
            da equipe
          </span>
          <span style={{ fontWeight: 700, color: '#0c4c69' }}>&quot;{team.nameTeams}&quot;</span>?
          <br />Essa ação não poderá ser desfeita.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', width: '100%' }}>
          <button
            onClick={handleRemove}
            style={{
              background: '#ef4444', color: '#fff', fontWeight: 600, border: 'none', borderRadius: 8, padding: '10px 32px', fontSize: 16, cursor: 'pointer', transition: 'background 0.2s',
            }}
          >
            Excluir
          </button>
          <button
            onClick={() => setIsRemove(false)}
            style={{
              background: '#e5e7eb', color: '#23272e', fontWeight: 600, border: 'none', borderRadius: 8, padding: '10px 32px', fontSize: 16, cursor: 'pointer', transition: 'background 0.2s',
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

export default Confirmation