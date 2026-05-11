import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCalls } from '../api/client';

interface Call {
  id: number;
  agent_id: number;
  direction: 'inbound' | 'outbound';
  customer_phone: string;
  customer_email: string | null;
  duration_seconds: number | null;
  status: string;
  created_at: string;
}

export default function Calls() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    loadCalls();
  }, [offset]);

  const loadCalls = async () => {
    try {
      setLoading(true);
      const data = await getCalls(50, offset);
      setCalls(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load calls');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>📱 Call History</h1>

      {error && <div style={{ padding: '1rem', background: '#fee', color: '#c33', borderRadius: '4px', marginBottom: '1rem' }}>{error}</div>}

      {loading ? (
        <p>Loading...</p>
      ) : calls.length === 0 ? (
        <p>No calls yet</p>
      ) : (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Type</th>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Customer</th>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Duration</th>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Time</th>
                <th style={{ textAlign: 'center', padding: '0.5rem' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {calls.map(call => (
                <tr key={call.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '0.5rem' }}>
                    {call.direction === 'inbound' ? '📥 Inbound' : '📤 Outbound'}
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    {call.customer_email || call.customer_phone}
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '3px',
                      background: call.status === 'completed' ? '#efe' : call.status === 'failed' ? '#fee' : '#eef',
                      color: call.status === 'completed' ? '#060' : call.status === 'failed' ? '#c33' : '#06c',
                    }}>
                      {call.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    {formatDuration(call.duration_seconds)}
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    {new Date(call.created_at).toLocaleString()}
                  </td>
                  <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                    <Link to={`/calls/${call.id}`}>View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              onClick={() => setOffset(Math.max(0, offset - 50))}
              disabled={offset === 0}
              style={{ padding: '0.5rem 1rem' }}
            >
              ← Previous
            </button>
            <span>Page {Math.floor(offset / 50) + 1}</span>
            <button
              onClick={() => setOffset(offset + 50)}
              disabled={calls.length < 50}
              style={{ padding: '0.5rem 1rem' }}
            >
              Next →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
