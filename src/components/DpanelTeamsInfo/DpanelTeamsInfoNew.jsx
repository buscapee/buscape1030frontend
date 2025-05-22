import { useContext, useState } from "react";
import { TeamsContext } from "../../context/TeamsContext";
import { useNavigate } from "react-router-dom";



const DpanelTeamsInfoNew = ({ team }) => {
    const { createTeams, message, setMessage } = useContext(TeamsContext);
    const [nameTeams, setNameTeams] = useState('');
    const [sigla, setSigla] = useState('');
    const [emblema, setEmblema] = useState('');
    const [status, setStatus] = useState('Ativado');
    const navigate = useNavigate();
    const idUser = JSON.parse(localStorage.getItem("@Auth:ProfileUser"));

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = {
            nameTeams: nameTeams,
            sigla,
            emblema,
            status
        };
        createTeams(data);
        setNameTeams("")
        setSigla("")
        setEmblema("")
        setStatus("Ativado")
    };

    // Função para converter imagem em base64
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setEmblema(reader.result); // base64
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {!team && (
                <>
                    <h2 className="text-2xl font-bold mb-4">Adicionar Função Principal</h2>
                    <div className="bg-white shadow-md rounded-lg p-8">
                        <form onSubmit={handleSubmit}>
                            <div className="flex gap-4 mb-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700">Nome*</label>
                                    <input
                                        type="text"
                                        value={nameTeams}
                                        onChange={(e) => {
                                            setNameTeams(e.target.value)
                                            setMessage('')
                                        }}
                                        placeholder="Nome da Função"
                                        className="mt-1 p-2 block w-full border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div style={{ minWidth: 200 }}>
                                    <label className="block text-sm font-medium text-gray-700">Sigla</label>
                                    <input
                                        type="text"
                                        value={sigla}
                                        onChange={e => setSigla(e.target.value)}
                                        placeholder="Sigla da Função"
                                        className="mt-1 p-2 block w-full border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4 mb-4 items-end">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700">Emblema</label>
                                    <input
                                        type="text"
                                        value={emblema}
                                        onChange={e => setEmblema(e.target.value)}
                                        placeholder="Link da imagem ou base64"
                                        className="mt-1 p-2 block w-full border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                {/* Botão de upload de imagem */}
                                <label className="bg-cyan-500 text-white px-6 py-2 rounded-md mb-1 flex items-center cursor-pointer" style={{height: 40}}>
                                    Enviar <span className="ml-2">⭳</span>
                                    <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                                </label>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Status*</label>
                                <select
                                    value={status}
                                    onChange={e => setStatus(e.target.value)}
                                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                                    required
                                >
                                    <option value="Ativado">Ativado</option>
                                    <option value="Desativado">Desativado</option>
                                </select>
                            </div>
                            {message && <p className="text-red-500">{message.error}</p>}
                            {message && <p className="text-green-500">{message.msg}</p>}
                            <div className="flex justify-center mt-6">
                                <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition">
                                    Criar equipe
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
};

export default DpanelTeamsInfoNew;
