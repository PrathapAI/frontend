import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import FavoriteButton from '../components/FavoriteButton';
import ReviewSection from '../components/ReviewSection';
import BackButton from '../components/BackButton';
import useAndroidBackButton from '../hooks/useAndroidBackButton';
import ChatWindow from '../components/ChatWindow';

function ListingDetails() {
  // Sync with Android back button
  useAndroidBackButton();
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [similarAds, setSimilarAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showChat, setShowChat] = useState(false);
  
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
        
        // Fetch similar ads from same category
        if (res.data.CategoryID) {
          try {
            const similarRes = await API.get('/listings', {
              params: { 
                category: res.data.CategoryID,
                limit: 3 
              }
            });
            // Filter out current listing and take only 2 ads
            const filtered = similarRes.data.filter(ad => ad.ListingID !== parseInt(id)).slice(0, 2);
            setSimilarAds(filtered);
          } catch (err) {
            console.error('Error fetching similar ads:', err);
          }
        }
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
      <BackButton />
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
          
          {/* Call and Message Buttons - Show for all users except the owner */}
          {(!userId || userId !== (listing.User?.UserID || listing.owner?.UserID || listing.UserID)) && (
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '24px', marginBottom: '24px' }}>
              <button
                style={{
                  background: '#1565c0',
                  color: '#000',
                  border: 'none',
                  borderRadius: 12,
                  padding: '12px 32px',
                  fontWeight: 700,
                  fontSize: '16px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(21,101,192,0.3)',
                  transition: 'background 0.2s'
                }}
                onClick={() => {
                  const phone = listing.owner?.phone || listing.User?.phone;
                  if (phone) {
                    alert(`📞 ${phone}`);
                  } else {
                    alert('Phone number not available');
                  }
                }}
              >
                📞 Call
              </button>
              <button
                style={{
                  background: '#ff9800',
                  color: '#000',
                  border: 'none',
                  borderRadius: 12,
                  padding: '12px 32px',
                  fontWeight: 700,
                  fontSize: '16px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(255,152,0,0.3)',
                  transition: 'background 0.2s'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!userId) {
                    alert('Login to chat');
                  } else {
                    const recipientId = listing.User?.UserID || listing.owner?.UserID || listing.UserID;
                    if (!recipientId) {
                      alert('Owner information not available');
                      return;
                    }
                    setShowChat(true);
                  }
                }}
              >
                💬 Message
              </button>
            </div>
          )}
          
          {/* Favorite Button */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <FavoriteButton listingId={id} userId={userId} />
          </div>
          
          {/* Reviews Section */}
          <ReviewSection listingId={id} userId={userId} />
          
          {/* Similar Ads Section */}
          {similarAds.length > 0 && (
            <div style={{ marginTop: '48px', borderTop: '2px solid #e0e0e0', paddingTop: '32px' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '24px', textAlign: 'center' }}>
                Similar Ads
              </h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)', 
                gap: '16px',
                maxWidth: '800px',
                margin: '0 auto'
              }}>
                {similarAds.map(ad => {
                  const image = ad.ListingImages?.[0]?.ImageURL || ad.ImageURL || '/default-no-image.png';
                  return (
                    <div
                      key={ad.ListingID}
                      onClick={() => {
                        window.scrollTo(0, 0);
                        navigate(`/listing/${ad.ListingID}`);
                      }}
                      style={{
                        background: '#fff',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                      }}
                    >
                      <img
                        src={image}
                        alt={ad.Title}
                        style={{
                          width: '100%',
                          height: '180px',
                          objectFit: 'cover'
                        }}
                      />
                      <div style={{ padding: '12px' }}>
                        <h4 style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          marginBottom: '8px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {ad.Title}
                        </h4>
                        <div style={{
                          fontSize: '16px',
                          fontWeight: 700,
                          color: '#e65100',
                          marginBottom: '4px'
                        }}>
                          {ad.Listing_Type === 'Business Offers' 
                            ? `${ad.ExpectedPrice || 'N/A'}% off`
                            : `₹ ${ad.ExpectedPrice || 'N/A'}`}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#666',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {ad.Location?.village || ad.village || ''}, {ad.Location?.district || ad.district || ''}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>
      
      {/* Chat Window */}
      {showChat && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '500px',
            height: '80vh',
            maxHeight: '600px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <button
              onClick={() => setShowChat(false)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: '#ff5252',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                cursor: 'pointer',
                zIndex: 10000,
                fontSize: '18px',
                fontWeight: 'bold'
              }}
            >
              ×
            </button>
            <ChatWindow
              recipientId={listing.User?.UserID || listing.owner?.UserID || listing.UserID}
              recipientName={listing.owner?.name || listing.User?.name || listing.User?.Username || 'User'}
              listingId={listing.ListingID}
              listingTitle={listing.Title || listing.title}
              onClose={() => setShowChat(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ListingDetails;
