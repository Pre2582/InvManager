import { useState, useCallback } from 'react';
import * as slidesApi from '@/api/slides';
import useToast from '@/hooks/useToast';

const useSlides = ({ adminMode = false } = {}) => {
  const [slides, setSlides]   = useState([]);
  const [loading, setLoading] = useState(false);
  const toast                 = useToast();

  const fetchSlides = useCallback(async () => {
    setLoading(true);
    try {
      const data = adminMode ? await slidesApi.getAllSlides() : await slidesApi.getActiveSlides();
      setSlides(data);
    } catch (err) {
      toast.error(err.message || 'Failed to load slides.');
    } finally {
      setLoading(false);
    }
  }, [adminMode, toast.error]);

  const createSlide = useCallback(async (payload) => {
    const slide = await slidesApi.createSlide(payload);
    setSlides((prev) => [...prev, slide].sort((a, b) => a.sort_order - b.sort_order));
    toast.success('Slide created.');
    return slide;
  }, []);

  const updateSlide = useCallback(async (id, payload) => {
    const updated = await slidesApi.updateSlide(id, payload);
    setSlides((prev) => prev.map((s) => s.id === id ? updated : s).sort((a, b) => a.sort_order - b.sort_order));
    toast.success('Slide updated.');
    return updated;
  }, []);

  const deleteSlide = useCallback(async (id) => {
    await slidesApi.deleteSlide(id);
    setSlides((prev) => prev.filter((s) => s.id !== id));
    toast.success('Slide deleted.');
  }, []);

  return { slides, loading, fetchSlides, createSlide, updateSlide, deleteSlide };
};

export default useSlides;
