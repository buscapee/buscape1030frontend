import React, { useContext, useEffect, useState } from 'react';
import { DocsContext } from '../../context/DocsContext';
import { IoArrowUndo } from "react-icons/io5";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import DpanelEditor from '../DpanelEditor/DpanelEditor';
import Preloader from "../../assets/preloader.gif";
import Notification from '../Notification/Notification';

const DocsDpanel = () => {
    const { Documents, setMessage: setMessageBack, getDocuments, loadingDocs, deleteDoc } = useContext(DocsContext);
    const [editDoc, setEditDoc] = useState(false);
    const [doc, setDoc] = useState([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(15); // Defina o limite de documentos por página aqui
    const [searchTerm, setSearchTerm] = useState(''); // Novo estado para termo de busca
    const [showModal, setShowModal] = useState(false);
    const [docToDelete, setDocToDelete] = useState(null);
    const [showNotification, setShowNotification] = useState(false);
    const [filteredDocs, setFilteredDocs] = useState([]);

    useEffect(() => {
        getDocuments(page, limit);
    }, [page, limit]);

    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredDocs(Documents);
        } else {
            setFilteredDocs(
                Documents.filter(doc =>
                    doc.nameDocs && doc.nameDocs.toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }
    }, [searchTerm, Documents]);

    const showDOC = (doc) => {
        setMessageBack('');
        setEditDoc(!editDoc);
        setDoc(doc);
    };

    const newDOC = () => {
        setMessageBack('');
        setDoc(false);
        setEditDoc(true);
    };

    const nextPage = () => {
        setPage(page + 1);
    };

    const prevPage = () => {
        if (page > 1) {
            setPage(page - 1);
        }
    };

    const handleDelete = async () => {
        if (docToDelete) {
            const profileUser = JSON.parse(localStorage.getItem('@Auth:Profile'));
            const data = {
                idUser: profileUser._id,
                idDoc: docToDelete._id
            };
            await deleteDoc(data);
            setShowModal(false);
            setDocToDelete(null);
            getDocuments(page, limit);
            setShowNotification(true);
        }
    };

    return (
        <div className="w-full px-0 py-8">
            <h1 className="text-3xl font-bold mb-6">Documentos</h1>
            <div className="flex justify-end items-center mb-4">
                    <button 
                    onClick={newDOC}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-semibold"
                    >
                    <FaPlus size={16} /> Adicionar
                    </button>
            </div>
            <input
                type="text"
                placeholder="Buscar documento"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-4 p-3 border rounded w-full text-lg"
            />
            <div className="bg-white shadow rounded-lg p-6 w-full">
                {loadingDocs && (
                    <div className='flex w-full items-center justify-center h-[300px]'>
                        <img src={Preloader} alt="Loading..." />
                    </div>
                )}

                {!loadingDocs && !editDoc && (
                    <>
                        <div className="overflow-x-auto">
                          <table className="min-w-full w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-2 font-semibold">#</th>
                                <th className="px-4 py-2 font-semibold">Título</th>
                                <th className="px-4 py-2 font-semibold">Função</th>
                                <th className="px-4 py-2 font-semibold">Status</th>
                                <th className="px-4 py-2 font-semibold">Ações</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredDocs && filteredDocs.length > 0 ? filteredDocs.map((doc, idx) => (
                                <tr key={doc._id} className="border-b hover:bg-gray-100 transition">
                                  <td className="px-4 py-2">{idx + 1 + (page - 1) * limit}</td>
                                  <td className="px-4 py-2">{doc.nameDocs}</td>
                                  <td className="px-4 py-2">{doc.docsType}</td>
                                  <td className="px-4 py-2">{doc.status}</td>
                                  <td className="px-4 py-2 flex gap-2">
                                    <button onClick={() => showDOC(doc)} className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition font-semibold"><FaEdit size={16} /> Editar</button>
                                    <button onClick={() => { setDocToDelete(doc); setShowModal(true); }} className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition font-semibold"><FaTrash size={16} /> Apagar</button>
                                  </td>
                                </tr>
                              )) : (
                                <tr>
                                  <td colSpan={5} className="text-center py-6 text-gray-600">Nenhum documento encontrado</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                                        </div>
                        <div className="flex justify-between mt-4">
                            <button 
                                className="p-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition" 
                                onClick={prevPage}
                            >
                                Anterior
                            </button>
                            <button 
                                className="p-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition" 
                                onClick={nextPage}
                            >
                                Próxima
                            </button>
                        </div>
                    </>
                )}
                {editDoc && (
                    <>
                        <button
                            onClick={() => setEditDoc(false)}
                            className="mb-6 flex items-center text-gray-700 hover:text-gray-900 transition text-2xl"
                            title="Voltar para a listagem"
                        >
                            <IoArrowUndo />
                        </button>
                    <DpanelEditor doc={doc} />
                    </>
                )}
                {/* Modal de confirmação de exclusão */}
                {showModal && (
                  <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.01)' }}>
                    <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-center">
                      <h2 className="text-xl font-bold mb-4">Confirmação</h2>
                      <p className="mb-6">Tem certeza que deseja excluir o documento <span className="font-semibold">"{docToDelete?.nameDocs}"</span>? Essa ação não poderá ser desfeita.</p>
                      <div className="flex justify-center gap-4">
                        <button
                          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                          onClick={handleDelete}
                        >
                          Excluir
                        </button>
                        <button
                          className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
                          onClick={() => setShowModal(false)}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                )}
            </div>
            {showNotification && (
              <Notification message="Documento excluído com sucesso." onClose={() => setShowNotification(false)} type="success" />
            )}
        </div>
    );
};

export default DocsDpanel;
