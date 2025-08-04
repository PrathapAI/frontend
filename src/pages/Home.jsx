import React, { useEffect, useState } from 'react';
// Prevent unwanted navigation to login page
// Home page should always be accessible
import API from '../services/api';
import ListingCard from '../components/ListingCard';
import '../home-theme.css';
import '../form-theme.css';
import '../home-sidebar.css';
import { FaSearch } from 'react-icons/fa';

function Home() {
  const [listings, setListings] = useState([]);
  // Home page should not redirect to login, even if not authenticated
  // Persist filter state in localStorage
  const safeGet = (key) => {
    try {
      if (typeof localStorage !== 'undefined' && localStorage !== null) {
        return localStorage.getItem(key) || '';
      }
    } catch {}
    return '';
  };
  const [category, setCategory] = useState(() => safeGet('filter_category'));
  const [subcategory, setSubcategory] = useState(() => safeGet('filter_subcategory'));
  const [state, setState] = useState(() => safeGet('filter_state'));
  const [district, setDistrict] = useState(() => safeGet('filter_district'));
  const [mandal, setMandal] = useState(() => safeGet('filter_mandal'));
  const [village, setVillage] = useState(() => safeGet('filter_village'));
  // Save filter state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('filter_category', category);
    localStorage.setItem('filter_subcategory', subcategory);
    localStorage.setItem('filter_state', state);
    localStorage.setItem('filter_district', district);
    localStorage.setItem('filter_mandal', mandal);
    localStorage.setItem('filter_village', village);
  }, [category, subcategory, state, district, mandal, village]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [mandals, setMandals] = useState([]);
  const [villages, setVillages] = useState([]);

  // Initial fetch
  useEffect(() => {
    async function fetchListings() {
      try {
        const res = await API.get('/api/listings');
        setListings(res.data);
      } catch (error) {
        console.error('Error fetching listings:', error);
      }
    }
    fetchListings();
    API.get('/crud/categories').then(res => {
      setCategories(res.data);
    });
    API.get('/crud/locations').then(res => {
      setLocations(res.data);
    });
    API.get('/crud/subcategories').then(res => {
      setSubcategories(res.data);
    });
  }, []);

  // Fetch subcategories for selected category
  useEffect(() => {
    if (category) {
      API.get(`/crud/subcategories?categoryId=${category}`).then(res => {
        setSubcategories(res.data);
      });
    } else {
      API.get('/crud/subcategories').then(res => {
        setSubcategories(res.data);
      });
    }
    // Do not reset subcategory unless Clear Filters is clicked
    // eslint-disable-next-line
  }, [category]);

  useEffect(() => {
    if (state) {
      setDistricts([...new Set(locations.filter(l => l.state === state).map(l => l.district))]);
    } else {
      setDistricts([]);
    }
    // Do not reset district, mandal, village unless Clear Filters is clicked
  }, [state, locations]);

  useEffect(() => {
    if (state && district) {
      setMandals([...new Set(locations.filter(l => l.state === state && l.district === district).map(l => l.mandal))]);
    } else {
      setMandals([]);
    }
    // Do not reset mandal, village unless Clear Filters is clicked
  }, [district, state, locations]);

  useEffect(() => {
    if (state && district && mandal) {
      setVillages([...new Set(locations.filter(l => l.state === state && l.district === district && l.mandal === mandal).map(l => l.village))]);
    } else {
      setVillages([]);
    }
    // Do not reset village unless Clear Filters is clicked
  }, [mandal, district, state, locations]);

  const filteredListings = listings.filter(listing => {
    // Category filter
    if (category && String(listing.Category?.CategoryID) !== String(category)) return false;
    // Subcategory filter (by ID for consistency)
    if (subcategory && String(listing.SubCategory?.SubCategoryID || listing.SubCategoryID) !== String(subcategory)) return false;
    // Location filters: use listing.Location fields
    if (state && listing.Location?.state && listing.Location.state !== state) return false;
    if (district && listing.Location?.district && listing.Location.district !== district) return false;
    if (mandal && listing.Location?.mandal && listing.Location.mandal !== mandal) return false;
    if (village && listing.Location?.village && listing.Location.village !== village) return false;
    return true;
  });

  return (
    <div className="page-bg-blue-accent">
      <div className="home-main-container">
        <aside className="home-sidebar sticky-sidebar">
          <label htmlFor="search-category">Search Category</label>
          <select id="search-category" value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.CategoryID} value={cat.CategoryID}>{cat.CategoryName}</option>
            ))}
          </select>
          <label htmlFor="subcategory">Subcategory</label>
          <select id="subcategory" value={subcategory} onChange={e => setSubcategory(e.target.value)} style={{marginBottom: '1rem', padding: '0.5rem 1rem', borderRadius: 6, border: '1px solid #bdbdbd', fontSize: '1rem', background: '#fff', color: '#5a4a1b'}}>
            <option value="">All Subcategories</option>
            {subcategories.map(sub => (
              <option key={sub.SubCategoryID} value={sub.SubCategoryID}>{sub.SubCategoryName}</option>
            ))}
          </select>
          <label htmlFor="state">State</label>
          <select id="state" value={state} onChange={e => setState(e.target.value)}>
            <option value="">All States</option>
            {[...new Set(locations.map(l => l.state))].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <label htmlFor="district">District</label>
          <select id="district" value={district} onChange={e => setDistrict(e.target.value)}>
            <option value="">All Districts</option>
            {districts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <label htmlFor="mandal">Mandal</label>
          <select id="mandal" value={mandal} onChange={e => setMandal(e.target.value)}>
            <option value="">All Mandals</option>
            {mandals.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <label htmlFor="village">Village</label>
          <select id="village" value={village} onChange={e => setVillage(e.target.value)}>
            <option value="">All Villages</option>
            {villages.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <button className="home-action-btn" type="button">
            <FaSearch /> Search
          </button>
          <button className="home-action-btn" type="button" style={{marginTop: '0.5rem', background: '#e65100', color: '#fff'}} onClick={() => {
            setCategory('');
            setSubcategory('');
            setState('');
            setDistrict('');
            setMandal('');
            setVillage('');
            localStorage.removeItem('filter_category');
            localStorage.removeItem('filter_subcategory');
            localStorage.removeItem('filter_state');
            localStorage.removeItem('filter_district');
            localStorage.removeItem('filter_mandal');
            localStorage.removeItem('filter_village');
          }}>
            Clear Filters
          </button>
        </aside>
        <main className="home-listings-content">
          {filteredListings.map(listing => {
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
                        name: listing.User.name,
                        phone: listing.User.phone
                      }
                    : undefined,
                  price: displayPrice,
                  subcategory: listing.SubCategory?.SubCategoryName || '',
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
          })}
        </main>
      </div>
    </div>
  );
}

export default Home;
