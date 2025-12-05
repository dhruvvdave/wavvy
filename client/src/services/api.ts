import axios from 'axios';
import { Beat, PatternData } from '../types';

const API_URL = '/api';

export const beatsService = {
  // Get all beats
  async getBeats(): Promise<Beat[]> {
    const response = await axios.get(`${API_URL}/beats`);
    return response.data.beats;
  },

  // Get beat by ID
  async getBeat(id: string): Promise<Beat> {
    const response = await axios.get(`${API_URL}/beats/${id}`);
    return response.data.beat;
  },

  // Create new beat
  async createBeat(data: {
    title: string;
    description?: string;
    bpm: number;
    pattern_data: PatternData;
  }): Promise<Beat> {
    const response = await axios.post(`${API_URL}/beats`, data);
    return response.data.beat;
  },

  // Update beat
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

  // Delete beat
  async deleteBeat(id: string): Promise<void> {
    await axios.delete(`${API_URL}/beats/${id}`);
  },
};

export const audioService = {
  // Upload audio file
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
  // Register user
  async register(data: {
    username: string;
    email: string;
    password: string;
  }): Promise<{ token: string; user: any }> {
    const response = await axios.post(`${API_URL}/auth/register`, data);
    return response.data;
  },

  // Login user
  async login(data: {
    email: string;
    password: string;
  }): Promise<{ token: string; user: any }> {
    const response = await axios.post(`${API_URL}/auth/login`, data);
    return response.data;
  },

  // Set auth token
  setAuthToken(token: string) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  },

  // Clear auth token
  clearAuthToken() {
    delete axios.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  },

  // Load token from storage
  loadToken() {
    const token = localStorage.getItem('token');
    if (token) {
      this.setAuthToken(token);
    }
    return token;
  },
};
