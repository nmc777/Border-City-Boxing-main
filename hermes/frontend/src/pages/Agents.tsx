import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAgents, deleteAgent } from '../api/client';

interface Agent {
  id: number;
  name: string;
  phone_number: string;
  provider: string;
  created_at: string;
}

export default function Agents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      setLoading(true);
      const data = await getAgents();
      setAgents(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this agent?')) return;
    try {
      await deleteAgent(String(id));
      loadAgents();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete agent');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>📞 Agents</h1>
        <Link to="/agents/new" style={{ padding: '0.5rem 1rem', background: '#0066cc', color: 'white', borderRadius: '4px', textDecoration: 'none' }}>
          + Create Agent
        </Link>
      </div>

      {error && <div style={{ padding: '1rem', background: '#fee', color: '#c33', borderRadius: '4px', marginBottom: '1rem' }}>{error}</div>}

      {loading ? (
        <p>Loading...</p>
      ) : agents.length === 0 ? (
        <p>No agents yet. <Link to="/agents/new">Create one</Link></p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd' }}>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Name</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Phone</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Provider</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Created</th>
              <th style={{ textAlign: 'center', padding: '0.5rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {agents.map(agent => (
              <tr key={agent.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.5rem' }}><strong>{agent.name}</strong></td>
                <td style={{ padding: '0.5rem' }}>{agent.phone_number || '-'}</td>
                <td style={{ padding: '0.5rem' }}>{agent.provider}</td>
                <td style={{ padding: '0.5rem' }}>{new Date(agent.created_at).toLocaleDateString()}</td>
                <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                  <Link to={`/agents/${agent.id}`} style={{ marginRight: '1rem' }}>Edit</Link>
                  <button
                    onClick={() => handleDelete(agent.id)}
                    style={{ padding: '0.25rem 0.5rem', background: '#f44', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
