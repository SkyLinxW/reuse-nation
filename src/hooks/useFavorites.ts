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
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user?.id]);

  const loadFavorites = async () => {
    try {
      if (!user) return;
      const userFavorites = await getFavorites(user.id);
      setFavorites(userFavorites || []);
    } catch (error) {
      console.error('Error loading favorites:', error);
      setFavorites([]);
    }
  };

  const addToFavorites = async (wasteItemId: string) => {
    if (!user) return;

    try {
      await addFavorite(user.id, wasteItemId);
      loadFavorites(); // Reload favorites
    } catch (error) {
      console.error('Error adding to favorites:', error);
    }
  };

  const removeFromFavorites = async (wasteItemId: string) => {
    if (!user) return;

    try {
      await removeFavorite(user.id, wasteItemId);
      loadFavorites(); // Reload favorites
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  };

  const isFavorite = (wasteItemId: string) => {
    return favorites.some(fav => fav.waste_item_id === wasteItemId);
  };

  const toggleFavorite = (wasteItemId: string) => {
    if (isFavorite(wasteItemId)) {
      removeFromFavorites(wasteItemId);
    } else {
      addToFavorites(wasteItemId);
    }
  };

  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite
  };
};