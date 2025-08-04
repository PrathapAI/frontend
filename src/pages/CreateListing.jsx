import { useState, useEffect } from 'react';
import API from '../services/api';
import axios from 'axios';
import React from 'react';
import '../page-ribbon.css';
import '../form-theme.css';
import '../home-theme.css';
import '../form-button.css';
import { FaPlusCircle } from 'react-icons/fa';

function CreateListing() {
  const [form, setForm] = useState({
    title: '',
    price: '',
    description: '',
    images: [], // allow multiple images
    category: '',
    subcategory: '',
    state: '',
    district: '',
    mandal: '',
    village: ''
  });
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [mandals, setMandals] = useState([]);
  const [villages, setVillages] = useState([]);
  // Add states array derived from locations
  const states = [...new Set(locations.map(l => l.state))];

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    let token = '';
    try {
      if (typeof localStorage !== 'undefined' && localStorage !== null) {
        token = localStorage.getItem('token');
      }
    } catch (e) {
      token = '';
    }
    let userId = null;
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload.id;
      } catch {}
    }

    // 1. Get Cloudinary signature and timestamp from backend
    const { data: signData } = await API.get('/api/listings/cloudinary/signature', {
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
    if (!form.category) {
      alert('Please select a category.');
      return;
    }
    if (!form.title) {
      alert('Please enter a title.');
      return;
    }
    if (!form.price) {
      alert('Please enter a price.');
      return;
    }
    if (!form.state || !form.district || !form.mandal || !form.village) {
      alert('Please select a valid location.');
      return;
    }

    try {
      await API.post('/api/listings', {
        UserID: userId,
        CategoryID: Number(form.category),
        SubCategoryID: form.subcategory ? Number(form.subcategory) : undefined,
        Title: form.title,
        Description: form.description,
        ExpectedPrice: form.price,
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
        title: '',
        price: '',
        description: '',
        images: [],
        category: '',
        subcategory: '',
        state: '',
        district: '',
        mandal: '',
        village: ''
      });
    } catch (error) {
      console.error("Backend Error:", error.response?.data);
      alert(error.response?.data?.error || 'Failed to create listing');
    }
  };

  return (
    <div className="page-bg-blue-accent">
      <div className="page-center-form">
        <div className="form-box">
          <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <input type="number" placeholder="Price" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
            <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.CategoryID} value={cat.CategoryID}>{cat.CategoryName}</option>
              ))}
            </select>
            <select value={form.subcategory} onChange={e => setForm({ ...form, subcategory: e.target.value })}>
              <option value="">Select Subcategory</option>
              {subcategories.map(sub => (
                <option key={sub.SubCategoryID} value={sub.SubCategoryID}>{sub.SubCategoryName}</option>
              ))}
            </select>
            <select value={form.state} onChange={e => setForm({ ...form, state: e.target.value })}>
              <option value="">Select State</option>
              {states.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select value={form.district} onChange={e => setForm({ ...form, district: e.target.value })}>
              <option value="">Select District</option>
              {districts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <select value={form.mandal} onChange={e => setForm({ ...form, mandal: e.target.value })}>
              <option value="">Select Mandal</option>
              {mandals.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <select value={form.village} onChange={e => setForm({ ...form, village: e.target.value })}>
              <option value="">Select Village</option>
              {villages.map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
            <input type="file" multiple onChange={e => setForm({ ...form, images: Array.from(e.target.files) })} />
            <button type="submit"><FaPlusCircle /> Create</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateListing;
