import { useState, useEffect } from 'react';
import { getCurrentUser } from '@/lib/localStorage';

export interface FavoriteItem {
  id: string;
  userId: string;
  wasteItemId: string;
  createdAt: string;
}

const FAVORITES_KEY = 'eco-marketplace-favorites';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const currentUser = getCurrentUser();

  useEffect(() => {
    if (currentUser) {
      loadFavorites();
    }
  }, [currentUser?.id]);

  const loadFavorites = () => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      const allFavorites = stored ? JSON.parse(stored) : [];
      const userFavorites = allFavorites.filter((fav: FavoriteItem) => fav.userId === currentUser?.id);
      setFavorites(userFavorites);
    } catch (error) {
      console.error('Error loading favorites:', error);
      setFavorites([]);
    }
  };

  const addToFavorites = (wasteItemId: string) => {
    if (!currentUser) return;

    const newFavorite: FavoriteItem = {
      id: `fav_${Date.now()}_${Math.random()}`,
      userId: currentUser.id,
      wasteItemId,
      createdAt: new Date().toISOString()
    };

    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      const allFavorites = stored ? JSON.parse(stored) : [];
      const updatedFavorites = [...allFavorites, newFavorite];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
      setFavorites(prev => [...prev, newFavorite]);
    } catch (error) {
      console.error('Error adding to favorites:', error);
    }
  };

  const removeFromFavorites = (wasteItemId: string) => {
    if (!currentUser) return;

    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      const allFavorites = stored ? JSON.parse(stored) : [];
      const updatedFavorites = allFavorites.filter((fav: FavoriteItem) => 
        !(fav.userId === currentUser.id && fav.wasteItemId === wasteItemId)
      );
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
      setFavorites(prev => prev.filter(fav => fav.wasteItemId !== wasteItemId));
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  };

  const isFavorite = (wasteItemId: string) => {
    return favorites.some(fav => fav.wasteItemId === wasteItemId);
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