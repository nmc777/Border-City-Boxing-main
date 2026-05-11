import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🤖 Hermes</h1>
        <p style={{ color: '#666', fontSize: '1.1rem' }}>AI Phone Agent Platform</p>
      </header>

      <nav style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '3rem',
        padding: '1rem',
        background: '#f5f5f5',
        borderRadius: '4px'
      }}>
        <Link to="/agents" style={{ padding: '0.5rem 1rem', background: '#fff', borderRadius: '4px', textDecoration: 'none' }}>
          📞 Agents
        </Link>
        <Link to="/calls" style={{ padding: '0.5rem 1rem', background: '#fff', borderRadius: '4px', textDecoration: 'none' }}>
          📱 Calls
        </Link>
      </nav>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        <Card
          title="👤 Agents"
          description="Manage your AI phone agents"
          action={<Link to="/agents">Go to Agents →</Link>}
        />
        <Card
          title="📞 Calls"
          description="View call history and transcripts"
          action={<Link to="/calls">View Calls →</Link>}
        />
        <Card
          title="⚙️ Settings"
          description="Configure Hermes"
          action="Coming soon"
          disabled
        />
      </div>

      <section style={{ marginTop: '3rem', padding: '2rem', background: '#f9f9f9', borderRadius: '4px' }}>
        <h2>Getting Started</h2>
        <ol style={{ lineHeight: '1.8' }}>
          <li><strong>Create an Agent:</strong> Define a phone agent with a system prompt</li>
          <li><strong>Configure Phone:</strong> Add Twilio or Retell AI credentials</li>
          <li><strong>Connect Data:</strong> Link n8n workflows for business data</li>
          <li><strong>Make Calls:</strong> Start inbound/outbound calling</li>
        </ol>
      </section>
    </div>
  );
}

function Card({ title, description, action, disabled }: any) {
  return (
    <div style={{
      padding: '1.5rem',
      background: '#fff',
      border: '1px solid #ddd',
      borderRadius: '4px',
      opacity: disabled ? 0.5 : 1,
      pointerEvents: disabled ? 'none' : 'auto'
    }}>
      <h3 style={{ marginBottom: '0.5rem' }}>{title}</h3>
      <p style={{ color: '#666', marginBottom: '1rem' }}>{description}</p>
      <div style={{ color: '#0066cc' }}>{action}</div>
    </div>
  );
}
