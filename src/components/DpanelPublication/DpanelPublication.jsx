import React, { useState, useRef, useMemo, useContext, useEffect } from 'react';
import { IoArrowUndo } from "react-icons/io5";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import JoditEditor from 'jodit-react';
import { PublicationContext } from '../../context/PublicationContext';
import ConfirmationModal from '../ConfirmationModal';
import { useNavigate } from 'react-router-dom';

const DpanelPublication = ({ placeholder }) => {
    const { createPublication, getPublication, allPublications, editPublication, deletePublication } = useContext(PublicationContext);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("@Auth:Token");
        getPublication(token);
    }, []);

    useEffect(() => {
        setPublications(allPublications);
    }, [allPublications]);

    //Editor
    const editor = useRef(null);
    const [content, setContent] = useState('');

    const config = useMemo(
        () => ({
            readonly: false,
            placeholder: placeholder || 'Escreva sua mensagem....',
            height: 500,
            width: 1000,
        }),
        [placeholder]
    );

    const handleBlur = (newContent) => {
        setContent(newContent);
    };


    const handleChange = (newContent) => {
        // Você pode adicionar lógica aqui, se necessário
    };


    const [view, setView] = useState('inicio');
    const [publications, setPublications] = useState([]);
    const [title, setTitle] = useState('')
    const [url, setUrl] = useState("")
    const user = JSON.parse(localStorage.getItem("@Auth:Profile"))
    const [editId, setEditId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsPublishing(true);
        const data = {
            idUser: user._id,
            title,
            content,
            linkImg: url
        };
        await createPublication(data);
        await getPublication();
        window.dispatchEvent(new CustomEvent('showNotification', { detail: { message: 'Publicação publicada com sucesso!', type: 'success' } }));
        setTimeout(() => {
            setView('inicio');
            setIsPublishing(false);
        }, 1000);
    };

    const handleEdit = (pub) => {
        setEditId(pub._id);
        setTitle(pub.title);
        setUrl(pub.linkImg || '');
        setContent(pub.content || '');
        setView('editar');
    };

    const handleDelete = (id) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        await deletePublication(deleteId);
        setPublications(prev => prev.filter(pub => pub._id !== deleteId));
        setShowDeleteModal(false);
        setDeleteId(null);
        // Notificação global de sucesso
        window.dispatchEvent(new CustomEvent('showNotification', { detail: { message: 'Publicação excluída com sucesso!', type: 'success' } }));
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setDeleteId(null);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        const data = {
            title,
            content,
            linkImg: url
        };
        await editPublication(editId, data);
        setPublications(prev => prev.map(pub => pub._id === editId ? { ...pub, ...data } : pub));
        setEditId(null);
        setTitle('');
        setUrl('');
        setContent('');
        setView('inicio');
        // Notificação global de sucesso
        window.dispatchEvent(new CustomEvent('showNotification', { detail: { message: 'Publicação atualizada com sucesso.', type: 'success' } }));
    };

    const renderHeader = () => (
        <div className="flex justify-between items-center mb-4">
            {view === 'inicio' && <h2 className="text-2xl font-bold text-gray-800">Publicações</h2>}
            {(view === 'novo' || view === "editar") && (
                <button
                    className="text-gray-600 hover:text-gray-800 transition"
                    onClick={() => setView('inicio')}
                >
                    <IoArrowUndo size={24} />
                </button>
            )}
            {view === 'inicio' && (
                <button
                    className="text-gray-600 hover:text-gray-800 transition"
                    onClick={() => setView('novo')}
                >
                    <FaPlus size={24} />
                </button>
            )}
        </div>
    );

    const renderPublicationsList = () => (
        <ul className="divide-y divide-gray-200">
            {publications.map((pub, index) => (
                <li key={index} className="py-4 flex justify-between items-center">
                    <span className="block text-lg font-semibold text-gray-800">{pub.title}</span>
                    <div className="flex gap-2">
                        <button
                            className="flex items-center px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                            onClick={() => handleEdit(pub)}
                        >
                            <FaEdit className="mr-1" /> Editar
                        </button>
                        <button
                            className="flex items-center px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                            onClick={() => handleDelete(pub._id)}
                        >
                            <FaTrash className="mr-1" /> Apagar
                        </button>
                    </div>
                </li>
            ))}
        </ul>
    );

    const renderForm = (isEdit = false) => (
        <form onSubmit={isEdit ? handleEditSubmit : handleSubmit}>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">Título</label>
                <input
                    type="text"
                    name="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Digite o título"
                />
            </div>

            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="imageUrl">URL da Imagem</label>
                <input
                    type="text"
                    name="imageUrl"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Digite o URL da imagem"
                />
            </div>
            <JoditEditor
                ref={editor}
                value={content}
                config={config}
                tabIndex={1}
                onBlur={handleBlur}
                onChange={handleChange}
            />
            <div className="flex items-center justify-between">
                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    disabled={isPublishing}
                >
                    {isPublishing ? 'Publicando...' : (isEdit ? 'Salvar' : 'Publicar')}
                </button>
                <button
                    type="button"
                    onClick={() => { setView('inicio'); setEditId(null); }}
                    className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
                    disabled={isPublishing}
                >
                    Cancelar
                </button>
            </div>
        </form>
    );

    return (
        <div className="container mx-auto p-4">
            {renderHeader()}
            <div className="bg-white shadow rounded-lg p-4">
                {view === 'inicio' && renderPublicationsList()}
                {view === 'novo' && renderForm(false)}
                {view === 'editar' && renderForm(true)}
            </div>
            <ConfirmationModal
                open={showDeleteModal}
                title="Confirmar exclusão"
                message="Tem certeza que deseja apagar esta publicação? Esta ação não poderá ser desfeita."
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
                confirmText="Excluir"
                cancelText="Cancelar"
            />
        </div>
    );
};

export default DpanelPublication;