import React, { useContext, useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button';
import { useForm } from "react-hook-form";
import Alert from 'react-bootstrap/Alert';
import { FaUser, FaLock } from "react-icons/fa";
import { AuthContext } from '../context/AuthContext';
import LogoDOP from '../assets/logodop.png';

const CreateCont = ({
    createCont,
    handleCreateCont,
    setCreateCont,
    stateColorInput,
    setStateColorInput,
    stateColorSecondFocus,
    setStateColorSecondFocus,
    handleFirstDivFocus,
    handleFirstDivBlur,
    handleSecondDivFocus,
    handleSecondDivBlur,
    code }) => {

    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm();
    const [handleTriDivBlur, seThandleTriDivBlur] = useState(false);
    const { handleActiveCout, message, setMessage } = useContext(AuthContext)

    const onSubmit = (data) => {
        handleActiveCout(data, code);
        setValue("newUserDopSystem", "")
        setValue("newPasswordDopSystem", "")
        setValue("newPasswordDopSystemConf", "")
        useEffect(() => {
            setTimeout(() => {
                setMessage('');
            }, 5000);
        }, [message]);
    };

    const handleTresDivBlur = () => {
        seThandleTriDivBlur(true)
    }
    const handleTresDivFocus = () => {
        seThandleTriDivBlur(false)
    }
    const watchPassword = watch("newPasswordDopSystem")

    return (
        <div className="w-full flex flex-col items-center justify-center">
            <div className="flex flex-col items-center w-full max-w-md mx-auto bg-white bg-opacity-90 p-6 rounded-lg shadow-2xl" style={{backdropFilter: 'blur(2px)'}}>
                <img src={LogoDOP} alt="Logo RCC" className="w-20 h-20 mb-3 bg-white object-contain" />
                <h2 className="text-xl font-bold text-gray-800 mb-1 text-center">Bem-vindo ao DMESystem</h2>
                <p className="text-gray-500 mb-3 text-center text-base">Ative sua conta preenchendo os campos abaixo</p>
                <form className="flex flex-col gap-3 w-full" onSubmit={handleSubmit(onSubmit)}>
                    <div className={`flex items-center border-b-2 ${stateColorInput ? 'border-yellow-500' : 'border-gray-300'} py-1`}
                        onFocus={handleFirstDivFocus}
                        onBlur={handleFirstDivBlur}>
                        <FaUser className="text-gray-400 mr-2" />
                        <input
                            tabIndex={1}
                            autoComplete="newUserDopSystem"
                            className="w-full h-9 outline-none bg-transparent placeholder-gray-400 font-semibold text-base"
                            type="text"
                            name="newUserDopSystem"
                            id="newUserDopSystem"
                            placeholder="Usuário"
                            {...register("newUserDopSystem", { required: true })}
                        />
                    </div>
                    {errors?.newUserDopSystem && <p className="text-xs p-0 m-0 text-red-500 ">Adicione o nome de usuário.</p>}
                    <div className={`flex items-center border-b-2 ${stateColorSecondFocus ? 'border-yellow-500' : 'border-gray-300'} py-1`}
                        onFocus={handleSecondDivFocus}
                        onBlur={handleSecondDivBlur}>
                        <FaLock className="text-gray-400 mr-2" />
                        <input
                            tabIndex={2}
                            autoComplete="newPasswordDopSystem"
                            className="w-full h-9 outline-none bg-transparent placeholder-gray-400 font-semibold text-base"
                            type="password"
                            name="newPasswordDopSystem"
                            id="newPasswordDopSystem"
                            placeholder="Senha"
                            {...register("newPasswordDopSystem", {
                                minLength: 8,
                                required: true
                            })}
                        />
                    </div>
                    {errors?.newPasswordDopSystem && <p className=" text-xs p-0 m-0 text-red-500 ">A senha deve ter no minimo 8 caracteres.</p>}
                    <div className={`flex items-center border-b-2 ${handleTriDivBlur ? 'border-yellow-500' : 'border-gray-300'} py-1`}
                        onFocus={handleTresDivBlur}
                        onBlur={handleTresDivFocus}>
                        <FaLock className="text-gray-400 mr-2" />
                        <input
                            tabIndex={3}
                            autoComplete="newPasswordDopSystemConf"
                            className="w-full h-9 outline-none bg-transparent placeholder-gray-400 font-semibold text-base"
                            type="password"
                            name="newPasswordDopSystemConf"
                            id="newPasswordDopSystemConf"
                            placeholder="Confirme a senha"
                            {...register("newPasswordDopSystemConf", {
                                required: true,
                                minLength: 8,
                                validate: (value) => value === watchPassword
                            })}
                        />
                    </div>
                    {errors?.newPasswordDopSystemConf && <p className=" text-xs p-0 m-0  text-red-500 ">As senhas digitadas não coincidem.</p>}
                    <div className="flex flex-col items-center w-full mt-1 mb-1">
                        <span className="text-xs text-gray-500 text-center">Coloque na sua missão o código:</span>
                        <span className="font-bold text-sm text-gray-700">{code}</span>
                    </div>
                    {message && <Alert variant='warning' className='h-[15px] flex items-center mt-2'>
                        <p className='text-[13px] text-center'>{message ? message .msg: ''}</p>
                    </Alert>}
                    <div className="flex gap-2 mt-2">
                        <Button onClick={handleCreateCont} className="w-1/2 border-yellow-600 text-yellow-700 bg-white hover:bg-yellow-50 font-semibold" variant="outline-warning">Voltar</Button>
                        <Button tabIndex={4} type='submit' className="w-1/2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold" variant="warning">Ativar</Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CreateCont