import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getFavorites, addToFavorites as addFavorite, removeFromFavorites as removeFavorite } from '@/lib/supabase';

export interface FavoriteItem {
  id: string;
  userId: string;
  wasteItemId: string;
  createdAt: string;
}

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadFavorites();
    } else {
      setFavorites([]);
    }
  }, [user?.id]);

  const loadFavorites = async () => {
    try {
      if (!user) return;
      setIsLoading(true);
      const userFavorites = await getFavorites(user.id);
      setFavorites(userFavorites || []);
    } catch (error) {
      console.error('Error loading favorites:', error);
      setFavorites([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addToFavorites = async (wasteItemId: string) => {
    if (!user) return;

    // Optimistic update
    const newFavorite = { waste_item_id: wasteItemId, user_id: user.id, id: Date.now().toString() };
    setFavorites(prev => [...prev, newFavorite]);

    try {
      await addFavorite(user.id, wasteItemId);
    } catch (error) {
      console.error('Error adding to favorites:', error);
      // Revert optimistic update on error
      setFavorites(prev => prev.filter(fav => fav.waste_item_id !== wasteItemId));
      throw error;
    }
  };

  const removeFromFavorites = async (wasteItemId: string) => {
    if (!user) return;

    // Optimistic update
    const originalFavorites = favorites;
    setFavorites(prev => prev.filter(fav => fav.waste_item_id !== wasteItemId));

    try {
      await removeFavorite(user.id, wasteItemId);
    } catch (error) {
      console.error('Error removing from favorites:', error);
      // Revert optimistic update on error
      setFavorites(originalFavorites);
      throw error;
    }
  };

  const isFavorite = (wasteItemId: string) => {
    return favorites.some(fav => fav.waste_item_id === wasteItemId);
  };

  const toggleFavorite = async (wasteItemId: string) => {
    if (isFavorite(wasteItemId)) {
      await removeFromFavorites(wasteItemId);
    } else {
      await addToFavorites(wasteItemId);
    }
  };

  return {
    favorites,
    isLoading,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
    reloadFavorites: loadFavorites
  };
};