import React, { useEffect, useState } from 'react';
import API from '../services/api';
import ListingCard from '../components/ListingCard';

function MyListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    let userId = null;
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload.id;
      } catch {}
    }
    if (userId) {
      API.get(`/listings/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => setListings(res.data))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <div className="page-bg-blue-accent">
      <div className="page-ribbon">My Listings</div>
      <div className="home-listings-content">
        {loading ? (
          <div>Loading...</div>
        ) : listings.length === 0 ? (
          <div>No listings found.</div>
        ) : (
          listings.map(listing => {
            let imageUrl = '';
            if (listing.ListingImages && listing.ListingImages.length > 0) {
              imageUrl = listing.ListingImages[0].ImageURL;
            }
            let displayPrice = (listing.ExpectedPrice !== undefined && listing.ExpectedPrice !== null && listing.ExpectedPrice !== '') ? listing.ExpectedPrice : 'N/A';
            return (
              <ListingCard
                key={listing.ListingID}
                listing={{
                  ListingID: listing.ListingID,
                  title: listing.Title,
                  description: listing.Description,
                  image: imageUrl,
                  ImageURL: listing.ImageURL || imageUrl,
                  owner: listing.User
                    ? {
                        name: listing.User.name
                      }
                    : undefined,
                  price: displayPrice,
                  // subcategory and subcategoryFull removed
                  state: listing.Location?.state,
                  district: listing.Location?.district,
                  mandal: listing.Location?.mandal,
                  village: listing.Location?.village,
                  availability: listing.availability,
                  postedDate: listing.CreateDate,
                  Category: listing.Category // Pass Category object for name
                }}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

export default MyListings;