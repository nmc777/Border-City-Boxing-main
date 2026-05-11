import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Agents from './pages/Agents';
import AgentEdit from './pages/AgentEdit';
import Calls from './pages/Calls';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/agents" element={<Agents />} />
        <Route path="/agents/new" element={<AgentEdit />} />
        <Route path="/agents/:id" element={<AgentEdit />} />
        <Route path="/calls" element={<Calls />} />
      </Routes>
    </Router>
  );
}

export default App;
