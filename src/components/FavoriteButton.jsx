import React, { useState, useEffect } from 'react';
import { favoritesAPI } from '../services/features';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

function FavoriteButton({ listingId, userId, onToggle }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkFavoriteStatus();
  }, [listingId, userId]);

  const checkFavoriteStatus = async () => {
    if (!userId || !listingId) return;
    try {
      const { data } = await favoritesAPI.checkFavorite(userId, listingId);
      setIsFavorite(data.isFavorite);
    } catch (err) {
      console.error('Error checking favorite status:', err);
    }
  };

  const toggleFavorite = async () => {
    if (!userId) {
      alert('Please login to add favorites');
      return;
    }

    setLoading(true);
    try {
      if (isFavorite) {
        await favoritesAPI.removeFavorite(userId, listingId);
        setIsFavorite(false);
      } else {
        await favoritesAPI.addFavorite(userId, listingId);
        setIsFavorite(true);
      }
      if (onToggle) onToggle(isFavorite);
    } catch (err) {
      console.error('Error toggling favorite:', err);
      alert('Failed to update favorite');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      style={{
        background: 'none',
        border: 'none',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontSize: '24px',
        color: isFavorite ? '#e74c3c' : '#95a5a6',
        transition: 'color 0.2s'
      }}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      {isFavorite ? <FaHeart /> : <FaRegHeart />}
    </button>
  );
}

export default FavoriteButton;
