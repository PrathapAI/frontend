import { useState, useEffect } from 'react';
import API from '../services/api';
import axios from 'axios';
import React from 'react';
import '../page-ribbon.css';
import '../form-theme.css';
import '../home-theme.css';
import '../form-button.css';
import { FaPlusCircle } from 'react-icons/fa';
import BackButton from '../components/BackButton';
import useAndroidBackButton from '../hooks/useAndroidBackButton';

function CreateListing() {
  // Sync with Android back button
  useAndroidBackButton();
  const [form, setForm] = useState({
    listingType: '',
    title: '',
    price: '',
    description: '',
    images: [], // allow multiple images
    category: '',
    subcategory: '',
    state: '',
    district: '',
    mandal: '',
    village: '',
    campaignStartDate: '',
    campaignEndDate: ''
  });
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [mandals, setMandals] = useState([]);
  const [villages, setVillages] = useState([]);
  
  // Modal states for adding new items
  const [showNewMandalModal, setShowNewMandalModal] = useState(false);
  const [showNewVillageModal, setShowNewVillageModal] = useState(false);
  const [newMandalName, setNewMandalName] = useState('');
  const [newVillageName, setNewVillageName] = useState('');
  
  const handleListingTypeChange = (e) => {
    const listingType = e.target.value;
    setForm(prevForm => ({
      ...prevForm,
      listingType: listingType,
      price: (listingType === 'Business Offers' || listingType === 'Business Campaign') ? '' : prevForm.price,
      campaignStartDate: listingType === 'Business Campaign' ? prevForm.campaignStartDate : '',
      campaignEndDate: listingType === 'Business Campaign' ? prevForm.campaignEndDate : ''
    }));
  };

  // Add states array derived from locations
  const states = [...new Set(locations.map(l => l.state))].filter(Boolean);

  // Initial fetch
  useEffect(() => {
    API.get('/crud/categories').then(res => {
      setCategories(res.data);
    });
    API.get('/crud/locations').then(res => {
      setLocations(res.data);
    });
    API.get('/crud/subcategories').then(res => {
      setSubcategories(res.data);
    });
    
    // Auto-populate location from user data
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.id;
        
        API.get(`/crud/users/${userId}`).then(res => {
          const userData = res.data;
          if (userData.state) {
            setForm(prevForm => ({
              ...prevForm,
              state: userData.state || '',
              district: userData.district || '',
              mandal: userData.mandal || '',
              village: userData.village || ''
            }));
          }
        }).catch(err => {
          console.error('Error fetching user data:', err);
        });
      } catch (err) {
        console.error('Error parsing token:', err);
      }
    }
  }, []);

  // Fetch subcategories for selected category
  useEffect(() => {
    if (form.category) {
      API.get(`/crud/subcategories?categoryId=${form.category}`).then(res => {
        setSubcategories(res.data);
      });
    } else {
      API.get('/crud/subcategories').then(res => {
        setSubcategories(res.data);
      });
    }
    setForm(f => ({ ...f, subcategory: '' }));
    // eslint-disable-next-line
  }, [form.category]);

  // Update districts, mandals, villages when state changes
  useEffect(() => {
    if (form.state) {
      setDistricts([...new Set(locations.filter(l => l.state === form.state).map(l => l.district))]);
    } else {
      setDistricts([]);
    }
    setForm(f => ({ ...f, district: '', mandal: '', village: '' }));
  }, [form.state, locations]);

  useEffect(() => {
    if (form.state && form.district) {
      setMandals([...new Set(locations.filter(l => l.state === form.state && l.district === form.district).map(l => l.mandal))]);
    } else {
      setMandals([]);
    }
    setForm(f => ({ ...f, mandal: '', village: '' }));
  }, [form.district, form.state, locations]);

  useEffect(() => {
    if (form.state && form.district && form.mandal) {
      setVillages([...new Set(locations.filter(l => l.state === form.state && l.district === form.district && l.mandal === form.mandal).map(l => l.village))]);
    } else {
      setVillages([]);
    }
    setForm(f => ({ ...f, village: '' }));
  }, [form.mandal, form.district, form.state, locations]);

  // Add new mandal
  const handleAddMandal = async () => {
    if (!newMandalName.trim()) {
      alert('Please enter a mandal name');
      return;
    }
    if (!form.state || !form.district) {
      alert('Please select state and district first');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await API.post('/crud/locations',
        { state: form.state, district: form.district, mandal: newMandalName.trim(), village: '' },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      // Refresh locations
      const res = await API.get('/crud/locations');
      setLocations(res.data);
      setForm({ ...form, mandal: newMandalName.trim() });
      setNewMandalName('');
      setShowNewMandalModal(false);
      alert('Mandal added successfully!');
    } catch (err) {
      console.error('Error adding mandal:', err);
      alert(err.response?.data?.error || 'Failed to add mandal');
    }
  };

  // Add new village
  const handleAddVillage = async () => {
    if (!newVillageName.trim()) {
      alert('Please enter a village name');
      return;
    }
    if (!form.state || !form.district || !form.mandal) {
      alert('Please select state, district, and mandal first');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await API.post('/crud/locations',
        { state: form.state, district: form.district, mandal: form.mandal, village: newVillageName.trim() },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      // Refresh locations
      const res = await API.get('/crud/locations');
      setLocations(res.data);
      setForm({ ...form, village: newVillageName.trim() });
      setNewVillageName('');
      setShowNewVillageModal(false);
      alert('Village added successfully!');
    } catch (err) {
      console.error('Error adding village:', err);
      alert(err.response?.data?.error || 'Failed to add village');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    let userId = null;
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload.id;
      } catch {}
    }

    // 1. Get Cloudinary signature and timestamp from backend
    const { data: signData } = await API.get('/api/cloudinary/signature', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const { signature, timestamp, apiKey: cloudinaryApiKey, uploadUrl: cloudinaryUploadUrl } = signData;

    // 2. Upload images to Cloudinary
    console.log('Cloudinary Upload Debug:');
    console.log('cloudinaryApiKey:', cloudinaryApiKey);
    console.log('signature:', signature);
    console.log('timestamp:', timestamp);
    console.log('cloudinaryUploadUrl:', cloudinaryUploadUrl);
    console.log('folder:', 'classified_uploads');
    const imageURLs = [];
    if (form.images && form.images.length > 0) {
      for (const file of form.images) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('timestamp', timestamp);
        formData.append('api_key', cloudinaryApiKey);
        formData.append('signature', signature);
        formData.append('folder', 'classified_uploads');
        const res = await axios.post(cloudinaryUploadUrl, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        imageURLs.push(res.data.secure_url);
      }
    }

    // Find LocationID from locations array and ensure it is always set
    let locationId = null;
    if (form.state && form.district && form.mandal && form.village) {
      const foundLocation = locations.find(
        l =>
          l.state === form.state &&
          l.district === form.district &&
          l.mandal === form.mandal &&
          l.village === form.village
      );
      if (foundLocation) locationId = foundLocation.LocationID;
    }
    if (locationId === null || locationId === undefined) {
      alert('Please select a valid location. LocationID not found.');
      return;
    }

    // Validation checks
    if (!userId) {
      alert('You must be logged in to create a listing.');
      return;
    }
    if (!form.listingType) {
      alert('Please select a listing type (Resell, Business Offers, or Business Campaign).');
      return;
    }
    if (!form.category) {
      alert('Please select a category.');
      return;
    }
    if (!form.title) {
      alert('Please enter a title.');
      return;
    }
    if (!form.category) {
      alert('Please select a category.');
      return;
    }
    if ((form.listingType === 'Resell' || form.listingType === 'Business Promotions' || form.listingType === 'Business Offers' || form.listingType === 'New Sale') && !form.price) {
      alert('Please enter a price or offer percentage.');
      return;
    }
    if (form.listingType === 'Business Campaign' && (!form.campaignStartDate || !form.campaignEndDate)) {
      alert('Please enter campaign start and end dates.');
      return;
    }
    if (!form.state || !form.district || !form.mandal || !form.village) {
      alert('Please select a valid location.');
      return;
    }

    try {
      console.log('imageURLs:', imageURLs);
      const res = await API.post('/crud/listings', {
        UserID: userId,
        CategoryID: Number(form.category),
        SubCategoryID: form.subcategory ? Number(form.subcategory) : undefined,
        Listing_Type: form.listingType,
        Title: form.title,
        Description: form.description,
        ExpectedPrice: (form.listingType === 'Business Offers' || form.listingType === 'Resell' || form.listingType === 'Business Promotions' || form.listingType === 'New Sale') ? form.price : null,
        CampaignStartDate: form.listingType === 'Business Campaign' ? form.campaignStartDate : null,
        CampaignEndDate: form.listingType === 'Business Campaign' ? form.campaignEndDate : null,
        IsPriceNegotiable: false,
        IsActive: true,
        IsSeller: true,
        IsIndividual: true,
        LocationID: Number(locationId),
        ImageURLs: imageURLs
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      alert('Listing created!');
      setForm({
        listingType: '',
        title: '',
        price: '',
        description: '',
        images: [],
        category: '',
        subcategory: '',
        state: '',
        district: '',
        mandal: '',
        village: '',
        campaignStartDate: '',
        campaignEndDate: ''
      });
    } catch (error) {
      console.error("Backend Error:", error.response?.data);
      alert(error.response?.data?.error || 'Failed to create listing');
    }
  };

  return (
    <div className="cred-page" style={{ paddingTop: '100px' }}>
      <BackButton />
      {/* Header */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '40px',
        paddingBottom: '24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ 
          fontSize: '32px', 
          marginBottom: '8px',
          color: 'var(--cred-blue)'
        }}>
          <FaPlusCircle />
        </div>
        <h1 style={{
          fontSize: '36px',
          fontWeight: '900',
          margin: '0',
          background: 'linear-gradient(135deg, var(--cred-blue) 0%, var(--cred-purple) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textTransform: 'lowercase'
        }}>
          post your ad.
        </h1>
      </div>

      <div className="page-center-form">
        <div className="cred-card" style={{ maxWidth: '600px', margin: '0 auto', padding: '32px' }}>
          <form onSubmit={handleSubmit}>
            <select
              className="cred-input"
              value={form.listingType}
              onChange={handleListingTypeChange}
            >
              <option value="">select listing type</option>
              <option value="Resell">Resell</option>
              <option value="Business Promotions">Business Promotions</option>
              <option value="Business Offers">Business Offers</option>
              <option value="Business Campaign">Business Campaign</option>
              <option value="New Sale">New Sale</option>
            </select>
            <input
              className="cred-input"
              type="text"
              placeholder="title"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />
            {form.listingType === 'Resell' && (
              <input
                className="cred-input"
                type="number"
                placeholder="price"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
              />
            )}
            {form.listingType === 'Business Promotions' && (
              <input
                className="cred-input"
                type="number"
                placeholder="price"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
              />
            )}
            {form.listingType === 'Business Offers' && (
              <input
                className="cred-input"
                type="number"
                placeholder="Offer Percentage (%)"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
              />
            )}
            {form.listingType === 'New Sale' && (
              <input
                className="cred-input"
                type="number"
                placeholder="price"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
              />
            )}
            {form.listingType === 'Business Campaign' && (
              <>
                <input
                  className="cred-input"
                  type="date"
                  placeholder="Campaign Start Date"
                  value={form.campaignStartDate}
                  onChange={e => setForm({ ...form, campaignStartDate: e.target.value })}
                />
                <input
                  className="cred-input"
                  type="date"
                  placeholder="Campaign End Date"
                  value={form.campaignEndDate}
                  onChange={e => setForm({ ...form, campaignEndDate: e.target.value })}
                />
              </>
            )}
            <textarea 
              className="cred-input"
              placeholder="description" 
              value={form.description} 
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows="4"
            />
            
            <select className="cred-input" style={{ width: '100%' }} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              <option value="">select category</option>
              {categories.map(cat => (
                <option key={cat.CategoryID} value={cat.CategoryID}>{cat.CategoryName}</option>
              ))}
            </select>
            
            <select className="cred-input" style={{ width: '100%' }} value={form.subcategory} onChange={e => setForm({ ...form, subcategory: e.target.value })}>
              <option value="">select subcategory</option>
              {subcategories.map(sub => (
                <option key={sub.SubCategoryID} value={sub.SubCategoryID}>{sub.SubCategoryName}</option>
              ))}
            </select>
            
            <select className="cred-input" style={{ width: '100%' }} value={form.state} onChange={e => setForm({ ...form, state: e.target.value })}>
              <option value="">select state</option>
              {states.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            
            <select className="cred-input" style={{ width: '100%' }} value={form.district} onChange={e => setForm({ ...form, district: e.target.value })}>
              <option value="">select district</option>
              {districts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            
            <select className="cred-input" style={{ width: '100%' }} value={form.mandal} onChange={e => setForm({ ...form, mandal: e.target.value })}>
              <option value="">select mandal</option>
              {mandals.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            {form.state && form.district && (
              <button 
                type="button"
                onClick={() => { setNewMandalName(''); setShowNewMandalModal(true); }} 
                style={{ 
                  width: '100%',
                  padding: '12px',
                  background: 'var(--cred-accent)', 
                  color: '#000',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  textTransform: 'lowercase',
                  marginTop: '-12px',
                  marginBottom: '12px'
                }}
              >
                + add new mandal
              </button>
            )}
            
            <select className="cred-input" style={{ width: '100%' }} value={form.village} onChange={e => setForm({ ...form, village: e.target.value })}>
              <option value="">select village</option>
              {villages.map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
            {form.state && form.district && form.mandal && (
              <button 
                type="button"
                onClick={() => { setNewVillageName(''); setShowNewVillageModal(true); }} 
                style={{ 
                  width: '100%',
                  padding: '12px',
                  background: 'var(--cred-accent)', 
                  color: '#000',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  textTransform: 'lowercase',
                  marginTop: '-12px',
                  marginBottom: '12px'
                }}
              >
                + add new village
              </button>
            )}
            <input 
              className="cred-input"
              type="file" 
              multiple 
              onChange={e => setForm({ ...form, images: Array.from(e.target.files) })}
              style={{ padding: '12px' }}
            />
            <button className="cred-btn" type="submit" style={{ width: '100%', marginTop: '8px', textTransform: 'lowercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <FaPlusCircle /> 
              <span>
                {form.listingType === 'Resell' && 'Post Ad'}
                {form.listingType === 'Business Promotions' && 'Post Promotion'}
                {form.listingType === 'Business Offers' && 'Post Offer'}
                {form.listingType === 'Business Campaign' && 'Start Campaign'}
                {!form.listingType && 'Create Listing'}
              </span>
            </button>
          </form>
        </div>
      </div>

      {/* Add New Mandal Modal */}
      {showNewMandalModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
          <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', minWidth: '400px', maxWidth: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <h3 style={{ marginTop: 0, color: '#000', fontSize: '24px', fontWeight: '700', textTransform: 'lowercase', marginBottom: '16px' }}>add new mandal</h3>
            <div style={{ marginBottom: '20px', padding: '12px', background: 'rgba(0, 208, 156, 0.1)', borderRadius: '8px', border: '1px solid var(--cred-accent)' }}>
              <div style={{ marginBottom: '8px' }}><strong style={{ color: '#000', textTransform: 'lowercase' }}>state:</strong> <span style={{ color: '#000' }}>{form.state}</span></div>
              <div><strong style={{ color: '#000', textTransform: 'lowercase' }}>district:</strong> <span style={{ color: '#000' }}>{form.district}</span></div>
            </div>
            <input
              className="cred-input"
              type="text"
              placeholder="mandal name"
              value={newMandalName}
              onChange={e => setNewMandalName(e.target.value)}
              style={{ width: '100%', marginBottom: '24px' }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                className="cred-btn-secondary"
                onClick={() => { setShowNewMandalModal(false); setNewMandalName(''); }} 
                style={{ textTransform: 'lowercase' }}
              >
                cancel
              </button>
              <button 
                className="cred-btn"
                onClick={handleAddMandal} 
                style={{ textTransform: 'lowercase' }}
              >
                add mandal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Village Modal */}
      {showNewVillageModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
          <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', minWidth: '400px', maxWidth: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <h3 style={{ marginTop: 0, color: '#000', fontSize: '24px', fontWeight: '700', textTransform: 'lowercase', marginBottom: '16px' }}>add new village</h3>
            <div style={{ marginBottom: '20px', padding: '12px', background: 'rgba(0, 208, 156, 0.1)', borderRadius: '8px', border: '1px solid var(--cred-accent)' }}>
              <div style={{ marginBottom: '8px' }}><strong style={{ color: '#000', textTransform: 'lowercase' }}>state:</strong> <span style={{ color: '#000' }}>{form.state}</span></div>
              <div style={{ marginBottom: '8px' }}><strong style={{ color: '#000', textTransform: 'lowercase' }}>district:</strong> <span style={{ color: '#000' }}>{form.district}</span></div>
              <div><strong style={{ color: '#000', textTransform: 'lowercase' }}>mandal:</strong> <span style={{ color: '#000' }}>{form.mandal}</span></div>
            </div>
            <input
              className="cred-input"
              type="text"
              placeholder="village name"
              value={newVillageName}
              onChange={e => setNewVillageName(e.target.value)}
              style={{ width: '100%', marginBottom: '24px' }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                className="cred-btn-secondary"
                onClick={() => { setShowNewVillageModal(false); setNewVillageName(''); }} 
                style={{ textTransform: 'lowercase' }}
              >
                cancel
              </button>
              <button 
                className="cred-btn"
                onClick={handleAddVillage} 
                style={{ textTransform: 'lowercase' }}
              >
                add village
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateListing;
