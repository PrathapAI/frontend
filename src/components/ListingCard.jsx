import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ListingCard({ listing }) {
  console.log('ListingCard listing:', listing);
  console.log('ListingCard ImageURL:', listing.ImageURL);
  console.log('ListingCard image:', listing.image);
  const [showPhone, setShowPhone] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const navigate = useNavigate();
  // Robust field mapping
  const title = listing.title || listing.Title || '';
  // Get all images from ListingImages array (or fallback to single ImageURL)
  const images = Array.isArray(listing.ListingImages) && listing.ListingImages.length > 0
    ? listing.ListingImages.map(img => img.ImageURL)
    : listing.ImageURL
      ? [listing.ImageURL]
      : ['/default-no-image.png'];
  const [currentImage, setCurrentImage] = useState(0);
  const [showImages, setShowImages] = useState(true);
  // Remove category and subcategory name display
  // const categoryName = ...
  // const subcategoryFull = ...
  const ownerName = listing.owner?.name || listing.User?.name || listing.User?.Username || 'N/A';
  // Phone number removed
  const postedDate = listing.postedDate || listing.CreateDate;
  const price = (listing.price !== undefined && listing.price !== null && listing.price !== '') ? String(listing.price) : (listing.ExpectedPrice !== undefined && listing.ExpectedPrice !== null && listing.ExpectedPrice !== '') ? String(listing.ExpectedPrice) : 'N/A';
  const address = listing.address
    || (listing.Location && (listing.Location.village || listing.Location.state || listing.Location.district || listing.Location.mandal))
    || `${listing.state || ''} ${listing.district || ''} ${listing.mandal || ''} ${listing.village || ''}`;

  return (
    <div style={{
      maxWidth: 900,
      margin: '32px auto',
      borderRadius: 20,
      boxShadow: '0 4px 16px rgba(0,0,0,0.14)',
      overflow: 'hidden',
      background: '#fff',
      fontFamily: 'sans-serif',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'stretch',
      minHeight: 320,
      position: 'relative'
    }}>
      <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Top left: Username and posted date */}
        <div style={{ position: 'absolute', top: 20, left: 20, textAlign: 'left', zIndex: 2 }}>
          <div style={{ fontWeight: 600 }}>{ownerName}</div>
          <div style={{ fontSize: 12, color: '#888' }}>
            Posted on {postedDate ? new Date(postedDate).toLocaleDateString() : 'N/A'}
          </div>
        </div>
        {/* Title at top center */}
        <div
          style={{
            textAlign: 'center',
            fontSize: '1.5rem',
            fontWeight: 700,
            marginBottom: 10,
            color: '#1976d2',
            cursor: 'pointer',
            textDecoration: 'underline',
            marginTop: 20
          }}
          onClick={() => navigate(`/listing/${listing.ListingID || listing.id}`)}
        >
          {title}
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#e65100', marginBottom: 8, textAlign: 'center' }}>
          ₹ {price}
        </div>
        {/* Address row */}
        <div style={{ fontSize: 15, color: '#555', marginBottom: 12, fontWeight: 500, textAlign: 'center' }}>
          {address}
        </div>
        {/* Bottom row absolutely positioned to bottom of card */}
        <div style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          padding: '0 32px 18px 32px',
          width: '100%',
          background: 'rgba(255,255,255,0.97)',
          zIndex: 3
        }}>
          <div style={{ fontSize: 15, color: '#1976d2', fontWeight: 600 }}>
            Availability: <span style={{ color: '#222' }}>{listing.availability ? String(listing.availability) : 'N/A'}</span>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            <button
              style={{
                background: '#1565c0',
                color: '#111',
                border: 'none',
                borderRadius: 16,
                padding: '14px 36px',
                fontWeight: 'bold',
                fontSize: '1.12rem',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(21,101,192,0.10)',
                letterSpacing: '0.03em',
                transition: 'background 0.2s, border 0.2s',
                opacity: 1
              }}
              onClick={() => setShowPhone(prev => !prev)}
            >Call</button>
            <button
              style={{
                background: '#ff9800',
                color: '#111',
                border: 'none',
                borderRadius: 16,
                padding: '14px 36px',
                fontWeight: 'bold',
                fontSize: '1.12rem',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(255,152,0,0.10)',
                letterSpacing: '0.03em',
                transition: 'background 0.2s, border 0.2s',
                opacity: 1
              }}
              onClick={() => setShowChat(prev => !prev)}
            >Message</button>
          </div>
        </div>
        {/* Phone and chat popups */}
        {showPhone && (
          <div style={{ marginTop: 12, textAlign: 'center', color: '#e65100', fontWeight: 600, fontSize: 18 }}>
            Phone: {listing.owner?.phone ? String(listing.owner.phone) : 'Not available'}
          </div>
        )}
        {showChat && (
          <div style={{ marginTop: 12, textAlign: 'center', border: '1px solid #eee', borderRadius: 8, padding: 12, background: '#f9f9f9', minWidth: 260 }}>
            <div style={{ marginBottom: 8, fontWeight: 600 }}>Chat with {listing.owner?.name ? String(listing.owner.name) : 'User'}</div>
            <textarea rows={3} style={{ width: '100%', borderRadius: 6, border: '1px solid #ccc', padding: 8, marginBottom: 8 }} placeholder="Type your message..." />
            <button style={{ background: '#ff9800', color: '#111', border: 'none', borderRadius: 16, padding: '6px 18px', fontWeight: 600, marginBottom: 8, marginTop: 4, width: '100%' }}>Send</button>
            <button style={{ background: '#fff', color: '#888', border: '1px solid #ccc', borderRadius: 16, padding: '6px 18px', fontWeight: 600, width: '100%' }} onClick={() => setShowChat(false)}>Close</button>
          </div>
        )}
      </div>
      <div style={{ flex: '0 0 260px', height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#3d1515ff', borderLeft: '1px solid #eee', position: 'relative', overflow: 'hidden' }}>
        {showImages && (
          <>
            <img
              src={images[currentImage]}
              alt={title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12, background: '#fff', display: 'block' }}
            />
            {/* Slider controls if multiple images */}
            {images.length > 1 && (
              <>
                <button
                  style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', background: '#fff', border: 'none', borderRadius: '50%', width: 32, height: 32, fontWeight: 700, fontSize: 18, cursor: 'pointer', opacity: 0.7, zIndex: 5 }}
                  onClick={e => { e.stopPropagation(); setCurrentImage((currentImage - 1 + images.length) % images.length); }}
                  aria-label="Previous image"
                >&lt;</button>
                <button
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: '#fff', border: 'none', borderRadius: '50%', width: 32, height: 32, fontWeight: 700, fontSize: 18, cursor: 'pointer', opacity: 0.7, zIndex: 5 }}
                  onClick={e => { e.stopPropagation(); setCurrentImage((currentImage + 1) % images.length); }}
                  aria-label="Next image"
                >&gt;</button>
                <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', background: '#fff', borderRadius: 12, padding: '2px 12px', fontSize: 14, color: '#1976d2', fontWeight: 600, opacity: 0.85 }}>
                  {currentImage + 1} / {images.length}
                </div>
              </>
            )}
            {/* Close button overlay */}
            <button
              style={{ position: 'absolute', top: 12, right: 12, background: '#fff', border: 'none', borderRadius: '50%', width: 32, height: 32, fontWeight: 700, fontSize: 18, cursor: 'pointer', opacity: 0.8, zIndex: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
              onClick={() => setShowImages(false)}
              aria-label="Close image"
            >&times;</button>
          </>
        )}
        {!showImages && (
          <button
            style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#1976d2', color: '#111', border: 'none', borderRadius: 16, padding: '12px 32px', fontWeight: 700, fontSize: 18, cursor: 'pointer', opacity: 0.95, zIndex: 7, boxShadow: '0 2px 8px rgba(25,118,210,0.10)' }}
            onClick={() => setShowImages(true)}
          >Show Images</button>
        )}
      </div>
    </div>
  );
}

export default ListingCard;