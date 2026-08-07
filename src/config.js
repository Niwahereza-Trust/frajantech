// While developing locally against the backend in /frajantech-backend,
// this points at its default port. Swap to your deployed URL when you
// host it (e.g. https://api.frajantechunlimited.com).
export const API_BASE = 'https://backend-8pdd.onrender.com'

// The modal POSTs JSON shaped like:
// {
//   type: 'connection' | 'renewal' | 'support',
//   fullName: string,
//   airtelNumber: string,
//   package: string,   // e.g. 'First-time Subscription', 'VIP Package', 'Normal Package'
//   note: string,
// }
export const CONNECT_API_ENDPOINT = `${API_BASE}/api/requests`

// The agent application modal POSTs JSON shaped like:
// { fullName: string, phoneNumber: string, email: string, district: string }
export const AGENT_API_ENDPOINT = `${API_BASE}/api/agents/apply`

// The Check Status form does a GET with ?query=<clientRefOrAirtelNumber>
export const STATUS_API_ENDPOINT = `${API_BASE}/api/status`
