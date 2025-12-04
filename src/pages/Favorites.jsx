import React, { useState, useEffect } from 'react';
import { favoritesAPI } from '../services/features';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaHeart } from 'react-icons/fa';

function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  
  let userId = null;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userId = payload.id;
    } catch {}
  }

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }
    fetchFavorites();
  }, [userId]);

  const fetchFavorites = async () => {
    try {
      const { data } = await favoritesAPI.getUserFavorites(userId);
      setFavorites(data);
    } catch (err) {
      console.error('Error fetching favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (listingId) => {
    if (!confirm('Remove from favorites?')) return;
    
    try {
      await favoritesAPI.removeFavorite(userId, listingId);
      setFavorites(favorites.filter(f => f.ListingID !== listingId));
    } catch (err) {
      console.error('Error removing favorite:', err);
      alert('Failed to remove favorite');
    }
  };

  if (loading) return (
    <div className="cred-page" style={{ paddingTop: '100px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="cred-spinner"></div>
    </div>
  );

  return (
    <div className="cred-page" style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div className="cred-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Page Header */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '48px',
          paddingBottom: '24px',
          borderBottom: '1px solid var(--cred-border)'
        }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '12px',
            marginBottom: '12px'
          }}>
            <FaHeart style={{ fontSize: '32px', color: 'var(--cred-pink)' }} />
            <h1 style={{ 
              fontSize: '2.5rem', 
              fontWeight: 900, 
              margin: 0,
              background: 'linear-gradient(135deg, var(--cred-pink) 0%, var(--cred-orange) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              favorites.
            </h1>
          </div>
          <p style={{ color: 'var(--cred-text-secondary)', fontSize: '14px', margin: 0 }}>
            your saved listings
          </p>
        </div>
      
      {favorites.length === 0 ? (
        <div className="cred-card" style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          background: 'var(--cred-card)'
        }}>
          <FaHeart style={{ fontSize: '48px', color: 'var(--cred-text-tertiary)', marginBottom: '16px' }} />
          <p style={{ fontSize: '18px', color: 'var(--cred-text-secondary)', marginBottom: '8px' }}>no favorites yet</p>
          <p style={{ fontSize: '14px', color: 'var(--cred-text-tertiary)', marginBottom: '24px' }}>start adding listings to your favorites</p>
          <button
            onClick={() => navigate('/')}
            className="cred-btn"
            style={{ margin: '0 auto' }}
          >
            browse listings
          </button>
        </div>
      ) : (
        <div className="cred-grid" style={{ marginTop: '40px' }}>
          {favorites.map((fav, index) => {
            const listing = fav.Listing;
            if (!listing) return null;
            
            const firstImage = listing.ListingImages?.[0]?.ImageURL;
            
            return (
              <div
                key={fav.FavoriteID}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                <div onClick={() => navigate(`/listing/${listing.ListingID}`)}>
                  {firstImage ? (
                    <img
                      src={firstImage}
                      alt={listing.Title}
                      style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '200px', background: '#ecf0f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      No Image
                    </div>
                  )}
                  
                  <div style={{ padding: '15px' }}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>{listing.Title}</h3>
                    <p style={{ color: '#27ae60', fontSize: '20px', fontWeight: 'bold', margin: '0 0 10px 0' }}>
                      ₹{listing.ExpectedPrice}
                    </p>
                    {listing.Location && (
                      <p style={{ color: '#7f8c8d', fontSize: '14px', margin: 0 }}>
                        {listing.Location.village}, {listing.Location.district}
                      </p>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => removeFavorite(listing.ListingID)}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '35px',
                    height: '35px',
                    cursor: 'pointer',
                    color: '#e74c3c',
                    fontSize: '16px'
                  }}
                  title="Remove from favorites"
                >
                  <FaTrash />
                </button>
              </div>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}

export default Favorites;
