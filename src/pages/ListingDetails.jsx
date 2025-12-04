import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import FavoriteButton from '../components/FavoriteButton';
import ReviewSection from '../components/ReviewSection';

function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Get userId from token
  const token = localStorage.getItem('token');
  let userId = null;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userId = payload.id;
    } catch {}
  }

  useEffect(() => {
    async function fetchListing() {
      try {
        const res = await API.get(`/listings/${id}`);
        setListing(res.data);
      } catch (err) {
        setError('Failed to load listing details');
      } finally {
        setLoading(false);
      }
    }
    fetchListing();
  }, [id]);

  const [currentImage, setCurrentImage] = useState(0);
  const [showImages, setShowImages] = useState(true);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{color:'red'}}>{error}</div>;
  if (!listing) return <div>Listing not found</div>;

  return (
    <div className="page-bg-blue-accent" style={{ paddingTop: '100px' }}>
      <div className="home-main-container">
        <main className="home-listings-content" style={{ maxWidth: 900, margin: '0 auto', padding: 32 }}>
          <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 700, marginBottom: 16 }}>{listing.title || listing.Title || 'No Title'}</h2>
          {/* Image slider/carousel for multiple images with overlay close */}
          <div style={{ position: 'relative', width: '100%', maxWidth: 900, margin: '0 auto', overflow: 'hidden', marginBottom: 24, minHeight: 320 }}>
            {showImages ? (
              <>
                {(() => {
                  const images = Array.isArray(listing.ListingImages) && listing.ListingImages.length > 0
                    ? listing.ListingImages.map(img => img.ImageURL)
                    : listing.ImageURL
                      ? [listing.ImageURL]
                      : ['/default-no-image.png'];
                  return (
                    <>
                      <img
                        src={images[currentImage]}
                        alt={listing.title}
                        style={{ width: 400, height: 300, objectFit: 'cover', borderRadius: 12, boxShadow: '0 2px 8px rgba(44,44,44,0.10)', background: '#eee', display: 'block', margin: '0 auto' }}
                      />
                      {images.length > 1 && (
                        <>
                          <button
                            style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', background: '#fff', border: 'none', borderRadius: '50%', width: 32, height: 32, fontWeight: 700, fontSize: 18, cursor: 'pointer', opacity: 0.7, zIndex: 5 }}
                            onClick={e => { e.stopPropagation(); setCurrentImage((currentImage - 1 + images.length) % images.length); }}
                            aria-label="Previous image"
                          >&lt;</button>
                          <button
                            style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', background: '#fff', border: 'none', borderRadius: '50%', width: 32, height: 32, fontWeight: 700, fontSize: 18, cursor: 'pointer', opacity: 0.7, zIndex: 5 }}
                            onClick={e => { e.stopPropagation(); setCurrentImage((currentImage + 1) % images.length); }}
                            aria-label="Next image"
                          >&gt;</button>
                          <div style={{ position: 'absolute', bottom: 18, left: '50%', transform: 'translateX(-50%)', background: '#fff', borderRadius: 12, padding: '2px 12px', fontSize: 14, color: '#1976d2', fontWeight: 600, opacity: 0.85 }}>
                            {currentImage + 1} / {images.length}
                          </div>
                        </>
                      )}
                      {/* Close button overlay for images */}
                      <button
                        style={{ position: 'absolute', top: 18, right: 18, background: '#fff', border: 'none', borderRadius: '50%', width: 32, height: 32, fontWeight: 700, fontSize: 18, cursor: 'pointer', opacity: 0.8, zIndex: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
                        onClick={() => setShowImages(false)}
                        aria-label="Close image"
                      >&times;</button>
                    </>
                  );
                })()}
              </>
            ) : (
              <button
                style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#1976d2', color: '#111', border: 'none', borderRadius: 16, padding: '12px 32px', fontWeight: 700, fontSize: 18, cursor: 'pointer', opacity: 0.95, zIndex: 7, boxShadow: '0 2px 8px rgba(25,118,210,0.10)' }}
                onClick={() => setShowImages(true)}
              >Show Images</button>
            )}
            {/* Page close button */}
            <button onClick={() => navigate(-1)} style={{ position: 'absolute', top: 18, left: 18, background: '#fff', color: '#232526', border: '2px solid #232526', borderRadius: 8, padding: '8px 18px', fontWeight: 700, cursor: 'pointer', zIndex: 20 }}>Close</button>
          </div>
          {listing.Listing_Type === 'Business Campaign' ? (
            listing.CampaignStartDate || listing.CampaignEndDate ? (
              <div style={{ fontSize: 18, fontWeight: 600, color: '#3498db', marginBottom: 8, textAlign: 'center' }}>
                Campaign: {listing.CampaignStartDate ? new Date(listing.CampaignStartDate).toLocaleDateString() : 'N/A'} - {listing.CampaignEndDate ? new Date(listing.CampaignEndDate).toLocaleDateString() : 'N/A'}
              </div>
            ) : null
          ) : (
            <div style={{ fontSize: 22, fontWeight: 700, color: '#e65100', marginBottom: 8, textAlign: 'center' }}>
              {listing.Listing_Type === 'Business Offers' 
                ? `${listing.ExpectedPrice || listing.price || 'N/A'}% off`
                : `₹ ${listing.ExpectedPrice || listing.price || 'N/A'}`}
            </div>
          )}
          <div style={{ fontSize: 16, color: '#555', marginBottom: 12 }}><strong>Description:</strong> {listing.Description || listing.description || 'N/A'}</div>
          <div style={{ fontSize: 16, color: '#555', marginBottom: 12 }}>
            <strong>Address:</strong> {
              listing.address
                || (listing.Location && `${listing.Location.village}, ${listing.Location.mandal}, ${listing.Location.district}, ${listing.Location.state}`)
                || `${listing.village || ''}, ${listing.mandal || ''}, ${listing.district || ''}, ${listing.state || ''}`
            }
          </div>
          <div style={{ fontSize: 16, color: '#1976d2', marginBottom: 12 }}><strong>Availability:</strong> {listing.availability ? String(listing.availability) : 'N/A'}</div>
          <div style={{ fontSize: 16, color: '#555', marginBottom: 12 }}><strong>Posted on:</strong> {listing.CreateDate ? new Date(listing.CreateDate).toLocaleDateString() : 'N/A'}</div>
          <div style={{ fontSize: 16, color: '#555', marginBottom: 12 }}>
            <strong>Owner:</strong> {
              (listing.owner?.name || listing.User?.name || listing.User?.Username || 'N/A')
            }
          </div>
          
          {/* Favorite Button */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <FavoriteButton listingId={id} userId={userId} />
          </div>
          
          {/* Reviews Section */}
          <ReviewSection listingId={id} userId={userId} />
        </main>
      </div>
    </div>
  );
}

export default ListingDetails;
