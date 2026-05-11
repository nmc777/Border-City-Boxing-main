const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export async function apiRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
  body?: Record<string, any>
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
}

// Agent API
export async function getAgents() {
  return apiRequest('/agents');
}

export async function getAgent(id: string) {
  return apiRequest(`/agents/${id}`);
}

export async function createAgent(data: any) {
  return apiRequest('/agents', 'POST', data);
}

export async function updateAgent(id: string, data: any) {
  return apiRequest(`/agents/${id}`, 'PUT', data);
}

export async function deleteAgent(id: string) {
  return apiRequest(`/agents/${id}`, 'DELETE');
}

// Call API
export async function getCalls(limit = 50, offset = 0) {
  return apiRequest(`/calls?limit=${limit}&offset=${offset}`);
}

export async function getCall(id: string) {
  return apiRequest(`/calls/${id}`);
}

export async function createCall(data: any) {
  return apiRequest('/calls', 'POST', data);
}

export async function addMessage(callId: string, role: string, content: string) {
  return apiRequest(`/calls/${callId}/messages`, 'POST', { role, content });
}
