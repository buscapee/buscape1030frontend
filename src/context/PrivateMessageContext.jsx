import { createContext, useState } from 'react';
import PropTypes from 'prop-types';
import axiosInstance from '../provider/axiosInstance';

const PrivateMessageContext = createContext("");

const PrivateMessageProvider = ({ children }) => {
  const [inbox, setInbox] = useState([]);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInbox = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/private-message/inbox');
      setInbox(res.data);
    } catch (err) {
      setError('Erro ao buscar inbox');
    }
    setLoading(false);
  };

  const fetchSent = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/private-message/sent');
      setSent(res.data);
    } catch (err) {
      setError('Erro ao buscar enviadas');
    }
    setLoading(false);
  };

  const sendMessage = async (data) => {
    setLoading(true);
    try {
      await axiosInstance.post('/private-message', data);
      await fetchSent();
    } catch (err) {
      setError('Erro ao enviar mensagem');
    }
    setLoading(false);
  };

  const markAsRead = async (id) => {
    try {
      await axiosInstance.put(`/private-message/${id}/read`);
      await fetchInbox();
    } catch (err) {
      setError('Erro ao marcar como lida');
    }
  };

  const deleteMessage = async (id, tipo = 'inbox') => {
    try {
      await axiosInstance.delete(`/private-message/${id}`);
      if (tipo === 'inbox') await fetchInbox();
      else await fetchSent();
    } catch (err) {
      setError('Erro ao apagar mensagem');
    }
  };

  return (
    <PrivateMessageContext.Provider value={{ inbox, sent, loading, error, fetchInbox, fetchSent, sendMessage, markAsRead, deleteMessage }}>
      {children}
    </PrivateMessageContext.Provider>
  );
};

PrivateMessageProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { PrivateMessageProvider, PrivateMessageContext }; 