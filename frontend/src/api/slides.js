import client from './client';

export const getActiveSlides = () => client.get('/slides');
export const getAllSlides    = () => client.get('/slides/all');
export const createSlide    = (data) => client.post('/slides', data);
export const updateSlide    = (id, data) => client.put(`/slides/${id}`, data);
export const deleteSlide    = (id) => client.delete(`/slides/${id}`);
