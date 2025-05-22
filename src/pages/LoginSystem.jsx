import React, { useContext, useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import { FaUser, FaLock } from "react-icons/fa";
import LogoDOP from '../assets/logodop.png';
import CreateCont from '../components/CreateCont.jsx';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import style from "./imgLogin.module.css";

const LoginSystem = ({ setLoading }) => {
    const { signIn, message, loadingLogin } = useContext(AuthContext);
    const [nick, setNick] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [stateColorInput, setStateColorInput] = useState(false);
    const [stateColorSecondFocus, setStateColorSecondFocus] = useState(false);
    const [createCont, setCreateCont] = useState(false);
    const [code, setCode]  = useState('');

    useEffect(()=> {
        const genereteCode = Math.ceil(Math.random() * 9999);
        const securityCode = `DME-${genereteCode}`;
        setCode(securityCode);
    }, []);

    const handleSubmitLogin = async (e) => {
        e.preventDefault();
        const dataLogin = { nick, password };
        await signIn(dataLogin);
    };

    const handleCreateCont = (e) => {
        e.preventDefault();
        setCreateCont(!createCont);
    };

    // Se for ativação de conta, renderiza só o card de ativação centralizado
    if (createCont) {
        return (
            <div className={`${style.ImgLogin} min-h-screen flex items-center justify-center`} style={{ minHeight: '100vh', width: '100vw' }}>
                <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center">
                    <CreateCont
                        createCont={createCont}
                        handleCreateCont={handleCreateCont}
                        setCreateCont={setCreateCont}
                        stateColorInput={stateColorInput}
                        setStateColorInput={setStateColorInput}
                        stateColorSecondFocus={stateColorSecondFocus}
                        setStateColorSecondFocus={setStateColorSecondFocus}
                        handleFirstDivFocus={() => setStateColorInput(true)}
                        handleFirstDivBlur={() => setStateColorInput(false)}
                        handleSecondDivFocus={() => setStateColorSecondFocus(true)}
                        handleSecondDivBlur={() => setStateColorSecondFocus(false)}
                        code={code}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className={`${style.ImgLogin} min-h-screen flex items-center justify-center`}
            style={{ minHeight: '100vh', width: '100vw' }}>
            <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row shadow-2xl rounded-lg overflow-hidden bg-opacity-80" style={{background: 'rgba(255,255,255,0.02)'}}>
                {/* Card de Login */}
                <div className="md:w-1/2 w-full flex flex-col justify-center items-center bg-white bg-opacity-90 p-8" style={{backdropFilter: 'blur(2px)'}}>
                    <div className="flex flex-col items-center w-full">
                        <img src={LogoDOP} alt="Logo DME" className="w-24 h-24 mb-4 bg-white object-contain" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-1 text-center">Bem-vindo ao DMESystem</h2>
                        <p className="text-gray-500 mb-4 text-center">Entre com seu usuário e senha</p>
                    </div>
                    <form className="flex flex-col gap-4 w-full max-w-xs" onSubmit={handleSubmitLogin}>
                        <div className={`flex items-center border-b-2 ${stateColorInput ? 'border-yellow-500' : 'border-gray-300'} py-1`}
                            onFocus={() => setStateColorInput(true)}
                            onBlur={() => setStateColorInput(false)}>
                            <FaUser className="text-gray-400 mr-2" />
                            <input
                                tabIndex={1}
                                autoComplete="userDopSystem"
                                onChange={(e) => setNick(e.target.value)}
                                value={nick || ""}
                                className="w-full h-10 outline-none bg-transparent placeholder-gray-400 font-semibold"
                                type="text"
                                name="userDopSystem"
                                id="userDopSystem"
                                placeholder="Usuário"
                            />
                        </div>
                        <div className={`flex items-center border-b-2 ${stateColorSecondFocus ? 'border-yellow-500' : 'border-gray-300'} py-1`}
                            onFocus={() => setStateColorSecondFocus(true)}
                            onBlur={() => setStateColorSecondFocus(false)}>
                            <FaLock className="text-gray-400 mr-2" />
                            <input
                                tabIndex={2}
                                autoComplete="passwordDopSystem"
                                onChange={(e) => setPassword(e.target.value)}
                                value={password || ""}
                                className="w-full h-10 outline-none bg-transparent placeholder-gray-400 font-semibold"
                                type="password"
                                name="passwordDopSystem"
                                id="passwordDopSystem"
                                placeholder="Senha"
                            />
                        </div>
                        <div className="flex items-center justify-between text-xs mt-1">
                            <label className="flex items-center gap-1">
                                <input type="checkbox" className="accent-yellow-500" />
                                Manter conectado
                            </label>
                            <button type="button" onClick={handleCreateCont} className="text-yellow-700 hover:underline">Redefinir minha senha</button>
                        </div>
                        {message && <p className="text-red-600 text-xs text-center">{message.error}</p>}
                        <div className="flex gap-2 mt-2">
                            <Button onClick={handleCreateCont} className="w-1/2 border-yellow-600 text-yellow-700 bg-white hover:bg-yellow-50 font-semibold" variant="outline-warning">Ativar conta</Button>
                            {!loadingLogin && <Button tabIndex={3} type="submit" className="w-1/2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold" variant="warning">Entrar</Button>}
                            {loadingLogin && <Button tabIndex={3} disabled type="submit" className="w-1/2 bg-yellow-500 text-white font-semibold" variant="warning">Aguarde...</Button>}
                        </div>
                    </form>
                </div>
                {/* Área Institucional */}
                <div className="md:w-1/2 w-full flex flex-col justify-center items-center relative p-8 text-white" style={{background: 'rgba(0,0,0,0.35)'}}>
                    <img src={LogoDOP} alt="Logo DME" className="w-40 h-40 mb-6 drop-shadow-lg object-contain" />
                    <h3 className="text-2xl font-bold mb-2 text-center">Seja bem-vindo ao system da Polícia DME!</h3>
                    <div className="flex gap-4 justify-center mb-4">
                        <a href="https://instagram.com/Policiadme" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400"><i className="fab fa-instagram text-2xl"></i></a>
                        <a href="https://twitter.com/Policedme" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400"><i className="fab fa-twitter text-2xl"></i></a>
                        <a href="https://facebook.com/Policedme" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400"><i className="fab fa-facebook text-2xl"></i></a>
                    </div>
                    <span className="text-xs text-center opacity-80 mt-2">Este site é independente, não tem associação com a Sulake Corporation Oy e não faz parte do Habbo Hotel®.</span>
                </div>
            </div>
        </div>
    );
}

export default LoginSystem;
