import axios from 'axios';
import { Beat, PatternData } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface AuthUser {
  id: string;
  username: string;
  email: string;
}

interface AuthResponse {
  token: string;
  user: AuthUser;
}

export const beatsService = {
  async getBeats(): Promise<Beat[]> {
    const response = await axios.get(`${API_URL}/beats`);
    return response.data.beats;
  },

  async getBeat(id: string): Promise<Beat> {
    const response = await axios.get(`${API_URL}/beats/${id}`);
    return response.data.beat;
  },

  async createBeat(data: {
    title: string;
    description?: string;
    bpm: number;
    pattern_data: PatternData;
  }): Promise<Beat> {
    const response = await axios.post(`${API_URL}/beats`, data);
    return response.data.beat;
  },

  async updateBeat(
    id: string,
    data: Partial<{
      title: string;
      description: string;
      bpm: number;
      pattern_data: PatternData;
    }>
  ): Promise<Beat> {
    const response = await axios.put(`${API_URL}/beats/${id}`, data);
    return response.data.beat;
  },

  async deleteBeat(id: string): Promise<void> {
    await axios.delete(`${API_URL}/beats/${id}`);
  },
};

export const audioService = {
  async uploadFile(file: File): Promise<{ filename: string; url: string }> {
    const formData = new FormData();
    formData.append('audio', file);

    const response = await axios.post(`${API_URL}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data.file;
  },
};

export const authService = {
  async register(data: {
    username: string;
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/auth/register`, data);
    return response.data;
  },

  async login(data: {
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/auth/login`, data);
    return response.data;
  },

  setAuthToken(token: string) {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    localStorage.setItem('token', token);
  },

  clearAuthToken() {
    delete axios.defaults.headers.common.Authorization;
    localStorage.removeItem('token');
  },

  loadToken() {
    const token = localStorage.getItem('token');
    if (token) {
      this.setAuthToken(token);
    }
    return token;
  },
};
