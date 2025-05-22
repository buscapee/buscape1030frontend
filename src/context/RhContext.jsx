import { createContext, useState } from 'react';
import PropTypes from 'prop-types';
import axiosInstance from '../provider/axiosInstance'; 

const RhContext = createContext("");

const RhProvider = ({ children }) => {
    const [messege, setMessege] = useState("");

    const rhStatus = async (data) => {
        try {
            const response = await axiosInstance.put('update/status', data);

            if (response.status === 200) {
                setMessege(response.data);
                return response.data;
            } else {
                setMessege(response.data);
                throw new Error(response.data.msg || 'Erro ao atualizar status');
            }
        } catch (error) {
            console.error('Erro ao atualizar status', error);
            throw error;
        }
    };

    const deleteRequeriment = async (data) => {
        try {
            const response = await axiosInstance.delete('delete/status', {
                data: data,
            });

            if (response.status === 200) {
                setMessege(response.data);
                window.location.reload(`${data.type}`);
            } else {
                setMessege(response.data);
            }
        } catch (error) {
            console.error('Erro ao deletar documento', error);
        }
    };

    return (
        <RhContext.Provider
            value={{
                rhStatus,
                messege,
                setMessege,
                deleteRequeriment
            }}
        >
            {children}
        </RhContext.Provider>
    );
};

RhProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export { RhProvider, RhContext };
