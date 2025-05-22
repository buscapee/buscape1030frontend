import React, { useContext, useState } from 'react'
import style from "./form.module.css"
import { TeamsContext } from '../../context/TeamsContext'

export const FormAdd = ({ team }) => {
  // idUser, nickMember, idTeams
  const [nickname, setNickname] = useState("")
  const [office, setOffice] = useState("")
  const { addMember, loading, message } = useContext(TeamsContext);
  const user = JSON.parse(localStorage.getItem("@Auth:ProfileUser"))

  const handleSubmit = (e) => {
    e.preventDefault()
    const data = {
      idUser: user._id,
      nickMember: nickname,
      office,
      idTeams: team._id
    }
    
    addMember(data, team);
    // Notificação de sucesso
    window.dispatchEvent(new CustomEvent('showNotification', { detail: { message: 'Usuário adicionado com sucesso.' } }));
    setTimeout(() => window.location.reload(), 1000);
  }

  return (
    <form className={style.Form} onSubmit={handleSubmit}>
      <label>
        * Nickname
        <input
          type="text"
          onChange={(e) => setNickname(e.target.value)}
          placeholder='Nickname de quem deseja adicionar'
        />
      </label>

      <label>
        * Cargo

        <select onChange={(e) => setOffice(e.target.value)} defaultValue="">
          <option value="" disabled hidden>Selecione</option>
          {Array.isArray(team.hierarquia) && team.hierarquia.map((cargo, idx) => (
            <option key={idx} value={cargo}>{cargo}</option>
          ))}
        </select>

      </label>
      {message.error && <p className="mt-4 text-red-500">{message.error}</p>}
      {!loading && <button type='submit'>Adicionar</button>}
      {loading && <button className='bg-[#368eec9c]' disabled type='button'>Aguarde...</button>}
      
    </form>
  )
}
