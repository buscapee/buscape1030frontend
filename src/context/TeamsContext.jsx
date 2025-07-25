import { createContext, useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../provider/axiosInstance';

const TeamsContext = createContext({});

const TeamsProvider = ({ children }) => {
    const token = localStorage.getItem('@Auth:Token');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [teams, setTeams] = useState([]);
    const [infoTeamsArray, setInfoTeamsArray] = useState([]);
    const navigate = useNavigate();

    const infoTeams = async (teams) => {
        try {
            const res = await axiosInstance.get(`teams/info`, {
                params: {
                    typeRequirement: teams,
                    teams: teams,
                },
            });
            setInfoTeamsArray(res.data);
        } catch (error) {
            setMessage(error.message || 'Erro desconhecido');
        }
    };

    const updateTeam = async (data) => {
        try {
            const response = await axiosInstance.put('teams/update/', data);
            setMessage(response.data);
        } catch (error) {
            setMessage({ error: 'Ocorreu um erro na atualização da equipe.', details: error.response?.data });
        }
    };

    const deleteTeams = async (data) => {
        try {
            const res = await axiosInstance.delete('teams/delete', {
                data: data,
            });
            setMessage(res.data);
        } catch (error) {
            setMessage(error.response?.data || 'Erro ao deletar documento');
        }
    };

    const createTeams = async (data) => {
        try {
            const res = await axiosInstance.post('teams/create', data);
            setMessage(res.data);
            await getTeams();
            navigate("/dpanel");
        } catch (error) {
            setMessage({ error: error.response?.data?.error || 'Não foi possível criar equipe.' });
        }
    };

    const removeMember = async (data) => {
        try {
            const response = await axiosInstance.put('teams/remove', data);
            infoTeams(localStorage.getItem("@Auth:Token"), data.nameTeams);
            setMessage(response.data);
        } catch (error) {
            setMessage({ error: error.response?.data || 'Erro ao remover usuário.' });
        }
    };

    // Função para gerar slug do nome da equipe
    const slugify = (str) => {
        return str
            .normalize('NFD')
            .replace(/[ 0-\u036f]/g, '')
            .replace(/\s+/g, '-')
            .replace(/[^a-zA-Z0-9-]/g, '')
            .toLowerCase();
    };

    const addMember = async (data, team) => {
        setLoading(true);
        try {
            const response = await axiosInstance.put('teams/add', data);
            setMessage(response.data);
            await getTeams();
            const url = team.url ? team.url : slugify(team.nameTeams);
            navigate(`/team/${url}`);
        } catch (error) {
            setMessage(error.response?.data || 'Erro ao adicionar membro.');
        } finally {
            setLoading(false);
        }
    };

    const getTeams = useCallback(async () => {
        try {
            const response = await axiosInstance.get('teams/all');
            setTeams(response.data);
            setMessage(response.data);
        } catch (error) {
            setMessage(error.message || 'Erro desconhecido');
        }
    }, [navigate]);

    useEffect(() => {
        if (token) {
            getTeams(token);
        }
    }, [getTeams, token]);

    // Atualizar hierarquia da equipe
    const updateHierarquia = async (teamId, hierarquia) => {
        try {
            const response = await axiosInstance.patch(`teams/${teamId}/hierarquia`, { hierarquia });
            setMessage(response.data);
            await getTeams();
            return response.data;
        } catch (error) {
            setMessage(error.response?.data || 'Erro ao atualizar hierarquia.');
        }
    };

    return (
        <TeamsContext.Provider
            value={{
                message,
                setMessage,
                teams,
                infoTeamsArray,
                infoTeams,
                removeMember,
                addMember,
                updateTeam,
                getTeams,
                createTeams,
                deleteTeams,
                loading,
                updateHierarquia,
            }}
        >
            {children}
        </TeamsContext.Provider>
    );
};

TeamsProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export { TeamsProvider, TeamsContext };
