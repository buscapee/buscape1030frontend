import { Routes, Route } from 'react-router-dom';
import OrgaosFuncoes from '../pages/OrgaosFuncoes';
import Home from '../pages/Home'; // Substitua pelo caminho correto da sua Home se necessário
import Configuracoes from '../pages/Configuracoes';
import Exoneration from '../pages/Exoneration/Exoneration';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/orgaos-funcoes" element={<OrgaosFuncoes />} />
      <Route path="/configuracoes" element={<Configuracoes />} />
      <Route path="/exoneration" element={<Exoneration />} />
      {/* Outras rotas aqui */}
    </Routes>
  );
} 