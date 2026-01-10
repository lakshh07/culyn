import axios, { AxiosInstance } from 'axios'

type ApiVersion = 'v1'

const createApiClient = (version: ApiVersion = 'v1'): AxiosInstance => {
  return axios.create({
    baseURL: `/api/${version}`,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
  })
}

export const Api = {
  v1: createApiClient('v1'),
}
