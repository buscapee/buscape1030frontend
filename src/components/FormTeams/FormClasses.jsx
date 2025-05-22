import React, { useContext, useEffect, useState } from 'react';
import { FaFloppyDisk } from "react-icons/fa6";
import { SystemContext } from '../../context/SystemContext';
import { ClassesContext } from '../../context/ClassesContext';
import { useNavigate } from 'react-router-dom';
import Notification from '../Notification/Notification';

const FormClasses = ({ team, userLocalStorage }) => {
    const [student, setStudent] = useState('');
    const [reason, setReason] = useState('');
    const [operator, setOperator] = useState('');
    const [classeRecebida, setClasseRecebida] = useState('');
    const [status, setStatus] = useState('Aprovado');
    const { infoSystem, getSystem } = useContext(SystemContext);


    const { Classes, createClasseRequeriment, loading, message } = useContext(ClassesContext);
    const newArrayClasses = Classes.filter(classes => classes.team === team.nameTeams);
    
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMsg, setNotificationMsg] = useState('');

    useEffect(() => {
        setOperator(JSON.parse(localStorage.getItem("@Auth:Profile")));
        getSystem();
    }, [getSystem]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = {
            idUser: operator._id,
            promoted: student,
            reason: reason,
            classe: classeRecebida,
            team: team.nameTeams,
            status: status
        };

        createClasseRequeriment(data);
        setStudent("");
        setReason("");
        setClasseRecebida("");
        const sigla = classeRecebida ? classeRecebida.slice(0, 3) : '';
        setNotificationMsg(`${sigla} foi aplicada com sucesso.`);
        setShowNotification(true);
        setTimeout(() => {
            setShowNotification(false);
            window.location.reload();
        }, 2000);
    };

    return (
        <div className='DivForm'>
            <div>
                <h2>Postar aula</h2>
            </div>

            <form onSubmit={handleSubmit}>
                <label>
                    * Aluno:
                    <input type="text"
                        onChange={(e) => {
                            setStudent(e.target.value);
                        }}
                        required
                        placeholder='Digite o nick do militar que teve aula.'
                        value={student}
                    />
                </label>
                <label>
                    * Aula
                    <select onChange={(e) => setClasseRecebida(e.target.value)} value={classeRecebida}>
                        <option value="" disabled hidden>Selecione</option>
                        {[...new Map((newArrayClasses || []).map(classe => [classe.nameClasse, classe])).values()].map((classe) => (
                            <option key={classe._id} value={classe.nameClasse}>{classe.nameClasse}</option>
                        ))}
                    </select>
                </label>
                <label>
                    * Situação
                    <select onChange={e => setStatus(e.target.value)} value={status} required>
                        <option value="Aprovado">Aprovado</option>
                        <option value="Reprovado">Reprovado</option>
                    </select>
                </label>
                <label>
                    * Observação:
                    <textarea placeholder='Digite as observações da aula' onChange={(e) => setReason(e.target.value)} required value={reason}>
                    </textarea>
                </label>
                {message && <p>{message.msg}</p>}
                {!loading && <button className='BtnActive btn' type="submit"> <span className='SpanBtn'><FaFloppyDisk /></span>Publicar</button>}
                {loading && <button className='BtnActive BtnActiveDisable btn' disabled> <span className='SpanBtn'><FaFloppyDisk /></span>Aguarde...</button>}
            </form>
            {showNotification && (
                <Notification
                    message={notificationMsg}
                    onClose={() => setShowNotification(false)}
                    type="success"
                    position="bottom-right"
                />
            )}
        </div>
    );
}

export default FormClasses;
