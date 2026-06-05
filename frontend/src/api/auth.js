import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api'
})

export async function login(username, password, deviceId) {
  const { data } = await api.post('/auth/login', { username, password, deviceId })
  return data // { token, role, fullName }
}
