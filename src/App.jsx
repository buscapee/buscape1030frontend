import React, { useContext, useEffect, useState } from "react";
import {
  Routes,
  Route,
  useParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import LoginSystem from "./pages/LoginSystem";
import Document from "./pages/Document/Document";
import Home from "./pages/Home";
import { AuthContext } from "./context/AuthContext";
import EditDocs from "./pages/EditDocs/EditDocs";
import { DocsContext } from "./context/DocsContext";
import { TeamsContext } from "./context/TeamsContext";
import Teams from "./pages/Teams/Teams";
import Preloader from "./components/Preloader/Preloader";
import Promotion from "./pages/Promotion/Promotion";
import Sale from "./pages/Sales/Sale";
import Warning from "./pages/Warning/Warning";
import Relegation from "./pages/Relegation/Relegation";
import Resignation from "./pages/Resignation/Resignation";
import Exoneration from "./pages/Exoneration/Exoneration";
import Contract from "./pages/Contract/Contract";
import Members from "./pages/members/Members";
import DPanel from "./pages/DPanel/DPanel.jsx";
import NotFound from "./pages/Notfound/NotFound";
import PostClasseInitial from "./pages/PostClasseInitial/PostClasseInitial";
import PageBasic from "./pages/PageBasic/PageBasic";
import Endorsement from "./pages/Endorsement/Endorsement";
import { Analytics } from "@vercel/analytics/react";
import { UserProfile } from "./routes/UserProfiler";
import { EditDocsView } from "./routes/EditDocsView";
import { DocumentView } from "./routes/DocumentView";
import useScrollToTop from "./hooks/useScrollToTop";
import Notification from "./components/Notification/Notification";
import ServicePointPage from "./pages/ServicePoint/ServicePointPage";
import MeusTurnosPage from "./pages/ServicePoint/MeusTurnosPage";
import TodosTurnosPage from "./pages/ServicePoint/TodosTurnosPage";
import OrgaosFuncoes from "./pages/OrgaosFuncoes";
import Loja from "./pages/Loja/Loja";
import Gratification from "./pages/Gratification/Gratification";
import axiosInstance from "./provider/axiosInstance";
import Configuracoes from "./pages/Configuracoes";
import MensagemPrivada from "./pages/MensagemPrivada";
import Permission from "./pages/Permission/Permission";
import Cadets from "./pages/Cadets/Cadets";
import Transfer from "./pages/Transfer/Transfer";

function App() {
  useScrollToTop();
  const { isAuthentication, authProfile } = useContext(AuthContext);
  const location = useLocation();

  // Configurações de equipe
  const { teams } = useContext(TeamsContext);

  // Notificação global
  const [notification, setNotification] = useState(null);
  useEffect(() => {
    const handler = (e) => {
      setNotification(e.detail);
    };
    window.addEventListener("showNotification", handler);
    return () => window.removeEventListener("showNotification", handler);
  }, []);

  useEffect(() => {
    console.log("[DEBUG] isAuthentication:", isAuthentication);
    console.log("[DEBUG] authProfile:", authProfile);
    const sendLocation = async () => {
      if (isAuthentication && authProfile && authProfile.token) {
        console.log(
          "[DEBUG] Enviando localização para backend:",
          location.pathname,
        );
        try {
          await axiosInstance.put(
            "/users/location",
            { location: location.pathname },
            {
              headers: {
                Authorization: `Bearer ${authProfile.token}`,
              },
            },
          );
          console.log(
            "[DEBUG] Localização enviada com sucesso:",
            location.pathname,
          );
        } catch (err) {
          console.error("[DEBUG] Erro ao enviar localização:", err);
        }
      } else {
        console.log(
          "[DEBUG] Usuário não autenticado ou token ausente. Não enviando localização.",
        );
      }
    };
    sendLocation();
  }, [location, isAuthentication, authProfile]);

  return (
    <>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type || "success"}
          onClose={() => setNotification(null)}
        />
      )}
      <Routes>
        <Route path="/" element={<PageBasic />}>
          <Route
            path="/login"
            element={!isAuthentication ? <LoginSystem /> : <Home />}
          />
          <Route
            path="/home"
            element={isAuthentication ? <Home /> : <LoginSystem />}
          />
          <Route
            index
            element={isAuthentication ? <Home /> : <LoginSystem />}
          />

          {/* RODAS DO PAINEL ADMINISTRATIVO */}
          {isAuthentication &&
            (authProfile?.userType === "Admin" ||
              authProfile?.userType === "Diretor") && (
              <Route path="/dpanel" element={<DPanel />} />
            )}

          {/* ROTAS DE EQUIPE */}
          {Array.isArray(teams) &&
            teams
              .filter((team) => {
                if (
                  authProfile &&
                  (authProfile.userType === "Admin" ||
                    authProfile.userType === "Diretor")
                ) {
                  return true;
                }
                // Permitir acesso a qualquer membro da equipe
                return (
                  team.members &&
                  team.members.some(
                    (member) => member.nickname === authProfile?.nickname,
                  )
                );
              })
              .map((team, index) => (
                <Route
                  key={index}
                  path={`/team/${team.url}`}
                  element={
                    isAuthentication ? <Teams team={team} /> : <LoginSystem />
                  }
                />
              ))}

          {Array.isArray(teams) &&
            teams
              .filter((team) => {
                // Verifica se o usuário é Admin ou Diretor
                if (
                  authProfile &&
                  (authProfile.userType === "Admin" ||
                    authProfile.userType === "Diretor")
                ) {
                  return true;
                }
                // Verifica se o usuário é líder da equipe
                return (
                  authProfile &&
                  authProfile.teans &&
                  Array.isArray(authProfile.teans) &&
                  authProfile.teans.includes(team.nameTeams) &&
                  team.leader === authProfile.nickname
                );
              })
              .map((team, index) => (
                <Route
                  key={index}
                  path={`/team/${team.nameTeams}/doc/new`}
                  element={
                    isAuthentication ? (
                      <EditDocs team={team} />
                    ) : (
                      <LoginSystem />
                    )
                  }
                />
              ))}

          {/* ROTAS DE FORMULÁRIO */}
          <Route
            path="/postclasse"
            element={isAuthentication ? <PostClasseInitial /> : <LoginSystem />}
          />
          <Route
            path="/promotion"
            element={isAuthentication ? <Promotion /> : <LoginSystem />}
          />
          <Route
            path="/relegation"
            element={isAuthentication ? <Relegation /> : <LoginSystem />}
          />
          <Route
            path="/warning"
            element={isAuthentication ? <Warning /> : <LoginSystem />}
          />
          <Route
            path="/resignation"
            element={isAuthentication ? <Resignation /> : <LoginSystem />}
          />
          <Route
            path="/exoneration"
            element={isAuthentication ? <Exoneration /> : <LoginSystem />}
          />
          <Route
            path="/contract"
            element={isAuthentication ? <Contract /> : <LoginSystem />}
          />
          <Route
            path="/sale"
            element={isAuthentication ? <Sale /> : <LoginSystem />}
          />
          <Route
            path="/members"
            element={isAuthentication ? <Members /> : <LoginSystem />}
          />
          <Route
            path="/loja"
            element={isAuthentication ? <Loja /> : <LoginSystem />}
          />

          {/*  RODAS DE CONFIGURAÇÃO DE DOCUMENTOS */}

          <Route
            path="/doc/:docUrl"
            element={isAuthentication ? <DocumentView /> : <LoginSystem />}
          />

          <Route
            path={`/editor/:docUrl`}
            element={isAuthentication ? <EditDocsView /> : <LoginSystem />}
          />

          {isAuthentication && (
            <Route path="/search/:nickname" element={<UserProfile />} />
          )}

          {/* Rota de aval */}

          <Route
            path={`/endorsement`}
            element={
              isAuthentication &&
              (authProfile?.userType === "Admin" ||
                authProfile?.userType === "Diretor" ||
                authProfile?.userType === "Recursos Humanos") ? (
                <Endorsement />
              ) : (
                <LoginSystem />
              )
            }
          />

          <Route
            path="/servicepoint"
            element={isAuthentication ? <ServicePointPage /> : <LoginSystem />}
          />
          <Route
            path="/meus-turnos"
            element={isAuthentication ? <MeusTurnosPage /> : <LoginSystem />}
          />
          {isAuthentication &&
            (authProfile?.userType === "Admin" ||
              authProfile?.userType === "Diretor") && (
              <Route path="/todos-turnos" element={<TodosTurnosPage />} />
            )}

          <Route
            path="/orgaos-funcoes"
            element={isAuthentication ? <OrgaosFuncoes /> : <LoginSystem />}
          />

          <Route
            path="/gratifications"
            element={isAuthentication ? <Gratification /> : <LoginSystem />}
          />

          <Route
            path="/configuracoes"
            element={isAuthentication ? <Configuracoes /> : <LoginSystem />}
          />

          <Route
            path="/mensagem-privada"
            element={isAuthentication ? <MensagemPrivada /> : <LoginSystem />}
          />

          <Route
            path="/permission"
            element={isAuthentication ? <Permission /> : <LoginSystem />}
          />

          <Route
            path="/cadets"
            element={isAuthentication ? <Cadets /> : <LoginSystem />}
          />

          <Route
            path="/transfer"
            element={isAuthentication ? <Transfer /> : <LoginSystem />}
          />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <Analytics />
    </>
  );
}

export default App;
