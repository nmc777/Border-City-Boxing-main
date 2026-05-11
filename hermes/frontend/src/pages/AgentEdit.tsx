import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAgent, createAgent, updateAgent } from '../api/client';

export default function AgentEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    system_prompt: '',
    phone_number: '',
    provider: 'twilio',
    n8n_webhooks: {},
  });
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadAgent();
    }
  }, [id]);

  const loadAgent = async () => {
    try {
      const agent = await getAgent(id!);
      setFormData({
        name: agent.name,
        system_prompt: agent.system_prompt,
        phone_number: agent.phone_number || '',
        provider: agent.provider,
        n8n_webhooks: agent.n8n_webhooks || {},
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load agent');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (id) {
        await updateAgent(id, formData);
      } else {
        await createAgent(formData);
      }
      navigate('/agents');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save agent');
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>{id ? 'Edit Agent' : 'Create New Agent'}</h1>

      {error && <div style={{ padding: '1rem', background: '#fee', color: '#c33', borderRadius: '4px', marginBottom: '1rem' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Agent Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            System Prompt
          </label>
          <textarea
            name="system_prompt"
            value={formData.system_prompt}
            onChange={handleChange}
            required
            rows={8}
            style={{ width: '100%', padding: '0.5rem', fontFamily: 'monospace' }}
          />
          <small style={{ color: '#666' }}>Define the agent's role, personality, and instructions</small>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Phone Number
          </label>
          <input
            type="text"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            placeholder="e.g., +1234567890"
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Phone Provider
          </label>
          <select
            name="provider"
            value={formData.provider}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5rem' }}
          >
            <option value="twilio">Twilio</option>
            <option value="retell">Retell AI</option>
            <option value="mock">Mock (Testing)</option>
          </select>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <button
            type="submit"
            style={{
              padding: '0.75rem 1.5rem',
              background: '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            {id ? 'Update Agent' : 'Create Agent'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/agents')}
            style={{
              marginLeft: '1rem',
              padding: '0.75rem 1.5rem',
              background: '#ddd',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
