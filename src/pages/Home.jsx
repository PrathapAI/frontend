import React, { useEffect, useState } from 'react';
// Prevent unwanted navigation to login page
// Home page should always be accessible
import API from '../services/api';
import ListingCard from '../components/ListingCard';
import '../home-theme.css';
import '../form-theme.css';
import '../home-sidebar.css';
import { FaSearch, FaChevronDown, FaChevronUp, FaTimes, FaFilter, FaSlidersH } from 'react-icons/fa';

function Home() {
  const [listings, setListings] = useState([]);
  // Home page should not redirect to login, even if not authenticated
  // Persist filter state in localStorage
  const [category, setCategory] = useState(() => localStorage.getItem('filter_category') || '');
  const [subcategory, setSubcategory] = useState(() => localStorage.getItem('filter_subcategory') || '');
  const [state, setState] = useState(() => localStorage.getItem('filter_state') || '');
  const [district, setDistrict] = useState(() => localStorage.getItem('filter_district') || '');
  const [mandal, setMandal] = useState(() => localStorage.getItem('filter_mandal') || '');
  const [village, setVillage] = useState(() => localStorage.getItem('filter_village') || '');
  const [listingType, setListingType] = useState(() => localStorage.getItem('filter_listingType') || '');
  
  // Accordion state
  const [expandedCategory, setExpandedCategory] = useState(true);
  const [expandedLocation, setExpandedLocation] = useState(true);
  const [expandedSubcategory, setExpandedSubcategory] = useState(null);
  const [expandedState, setExpandedState] = useState(null);
  const [expandedDistrict, setExpandedDistrict] = useState(null);
  const [expandedAdType, setExpandedAdType] = useState(true);
  
  // Mobile filter toggle
  const [showFilters, setShowFilters] = useState(false);
  
  // Close filters when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showFilters && !event.target.closest('.home-sidebar') && !event.target.closest('.mobile-filter-toggle')) {
        setShowFilters(false);
      }
    };
    
    if (showFilters) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showFilters]);
  
  // Save filter state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('filter_category', category);
    localStorage.setItem('filter_subcategory', subcategory);
    localStorage.setItem('filter_state', state);
    localStorage.setItem('filter_district', district);
    localStorage.setItem('filter_mandal', mandal);
    localStorage.setItem('filter_village', village);
    localStorage.setItem('filter_listingType', listingType);
  }, [category, subcategory, state, district, mandal, village, listingType]);
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
        const res = await API.get('/listings');
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
    // Only show active listings on home page
    if (!listing.IsActive) return false;
    // Category filter
    if (category && String(listing.Category?.CategoryID) !== String(category)) return false;
    // Subcategory filter (by ID for consistency)
    if (subcategory && String(listing.SubCategory?.SubCategoryID || listing.SubCategoryID) !== String(subcategory)) return false;
    // Location filters: use listing.Location fields
    if (state && listing.Location?.state && listing.Location.state !== state) return false;
    if (district && listing.Location?.district && listing.Location.district !== district) return false;
    if (mandal && listing.Location?.mandal && listing.Location.mandal !== mandal) return false;
    if (village && listing.Location?.village && listing.Location.village !== village) return false;
    // Listing Type filter
    if (listingType && listing.Listing_Type !== listingType) return false;
    return true;
  });

  return (
    <div className="cred-page" style={{ paddingTop: '100px' }}>
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
          color: 'var(--cred-accent)'
        }}>
          <FaSearch />
        </div>
        <h1 style={{
          fontSize: '36px',
          fontWeight: '900',
          margin: '0',
          background: 'linear-gradient(135deg, var(--cred-accent) 0%, var(--cred-blue) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textTransform: 'lowercase'
        }}>
          discover listings.
        </h1>
      </div>

      {/* Mobile Filter Toggle Button */}
      <button
        className="mobile-filter-toggle"
        onClick={(e) => {
          e.stopPropagation();
          setShowFilters(!showFilters);
        }}
        style={{
          position: 'fixed',
          left: '12px',
          top: '120px',
          zIndex: 1000,
          background: showFilters ? '#ff4444' : 'var(--cred-accent)',
          border: 'none',
          borderRadius: '20px',
          padding: '10px 16px',
          display: 'none',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0, 208, 156, 0.4)',
          color: '#000',
          fontSize: '12px',
          fontWeight: '600',
          transition: 'all 0.3s',
          whiteSpace: 'nowrap'
        }}
      >
        {showFilters ? <FaTimes /> : <FaSlidersH />}
        <span>{showFilters ? 'Close' : 'Filters'}</span>
      </button>

      <div className="home-main-container">
        <aside className={`home-sidebar sticky-sidebar ${showFilters ? 'show-filters' : ''}`} style={{ background: 'var(--cred-card)', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
          
          {/* AD TYPE Section */}
          <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <button
              onClick={() => setExpandedAdType(!expandedAdType)}
              style={{
                width: '100%',
                padding: '16px 20px',
                background: '#000',
                border: 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '700',
                color: '#fff',
                textAlign: 'left',
                textTransform: 'lowercase',
                borderRadius: '8px',
                marginBottom: '8px'
              }}
            >
              <span>ad type</span>
              <span style={{ color: '#fff' }}>{expandedAdType ? <FaChevronUp /> : <FaChevronDown />}</span>
            </button>
            
            {expandedAdType && (
              <div style={{ padding: '0 20px 16px' }}>
                {['All', 'Resell', 'Business Offers', 'Business Campaign'].map(type => {
                  const isSelected = listingType === type || (type === 'All' && !listingType);
                  return (
                    <div
                      key={type}
                      onClick={() => setListingType(type === 'All' ? '' : type)}
                      style={{
                        padding: '10px 12px',
                        cursor: 'pointer',
                        borderLeft: isSelected ? '3px solid var(--cred-accent)' : '3px solid transparent',
                        background: isSelected ? 'rgba(0, 208, 156, 0.1)' : 'transparent',
                        marginBottom: '4px',
                        fontWeight: isSelected ? '600' : '400',
                        color: '#fff',
                        transition: 'all 0.2s',
                        borderRadius: '6px',
                        textTransform: 'lowercase'
                      }}
                      onMouseEnter={(e) => !isSelected && (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)')}
                      onMouseLeave={(e) => !isSelected && (e.currentTarget.style.background = 'transparent')}
                    >
                      {type}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* CATEGORIES Section */}
          <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <button
              onClick={() => setExpandedCategory(!expandedCategory)}
              style={{
                width: '100%',
                padding: '16px 20px',
                background: '#000',
                border: 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '700',
                color: '#fff',
                textAlign: 'left',
                textTransform: 'lowercase',
                borderRadius: '8px',
                marginBottom: '8px'
              }}
            >
              <span>categories</span>
              <span style={{ color: '#fff' }}>{expandedCategory ? <FaChevronUp /> : <FaChevronDown />}</span>
            </button>
            
            {expandedCategory && (
              <div style={{ padding: '0 20px 16px' }}>
                {/* All Categories */}
                <div
                  onClick={() => {
                    setCategory('');
                    setSubcategory('');
                  }}
                  style={{
                    padding: '10px 12px',
                    cursor: 'pointer',
                    borderLeft: category === '' ? '3px solid var(--cred-accent)' : '3px solid transparent',
                    background: category === '' ? 'rgba(0, 208, 156, 0.1)' : 'transparent',
                    marginBottom: '4px',
                    fontWeight: category === '' ? '600' : '400',
                    color: '#fff',
                    transition: 'all 0.2s',
                    borderRadius: '6px',
                    textTransform: 'lowercase'
                  }}
                  onMouseEnter={(e) => !category && (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)')}
                  onMouseLeave={(e) => !category && (e.currentTarget.style.background = 'transparent')}
                >
                  all categories
                </div>
                
                {/* Category List */}
                {categories.map(cat => {
                  const isSelected = String(category) === String(cat.CategoryID);
                  const categorySubcategories = subcategories.filter(sub => String(sub.CategoryID) === String(cat.CategoryID));
                  
                  return (
                    <div key={cat.CategoryID} style={{ marginBottom: '4px' }}>
                      <div
                        onClick={() => {
                          if (isSelected) {
                            setCategory('');
                            setSubcategory('');
                          } else {
                            setCategory(cat.CategoryID);
                            setSubcategory('');
                          }
                        }}
                        style={{
                          padding: '10px 12px',
                          cursor: 'pointer',
                          borderLeft: isSelected ? '3px solid var(--cred-accent)' : '3px solid transparent',
                          background: isSelected ? 'rgba(0, 208, 156, 0.1)' : 'transparent',
                          fontWeight: isSelected ? '600' : '400',
                          color: '#fff',
                          transition: 'all 0.2s',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderRadius: '6px',
                          textTransform: 'lowercase'
                        }}
                        onMouseEnter={(e) => !isSelected && (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)')}
                        onMouseLeave={(e) => !isSelected && (e.currentTarget.style.background = 'transparent')}
                      >
                        <span style={{ color: '#fff' }}>{cat.CategoryName}</span>
                        {isSelected && categorySubcategories.length > 0 && (
                          <span style={{ fontSize: '12px', color: '#bbb' }}>
                            ({categorySubcategories.length})
                          </span>
                        )}
                      </div>
                      
                      {/* Subcategories - show only when category is selected */}
                      {isSelected && categorySubcategories.length > 0 && (
                        <div style={{ paddingLeft: '16px', marginTop: '4px' }}>
                          {categorySubcategories.map(sub => {
                            const isSubSelected = String(subcategory) === String(sub.SubCategoryID);
                            return (
                              <div
                                key={sub.SubCategoryID}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSubcategory(isSubSelected ? '' : sub.SubCategoryID);
                                }}
                                style={{
                                  padding: '8px 12px',
                                  cursor: 'pointer',
                                  background: isSubSelected ? 'rgba(0, 208, 156, 0.2)' : 'transparent',
                                  color: '#fff',
                                  fontSize: '13px',
                                  borderRadius: '6px',
                                  marginBottom: '2px',
                                  transition: 'all 0.2s',
                                  textTransform: 'lowercase'
                                }}
                                onMouseEnter={(e) => !isSubSelected && (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)')}
                                onMouseLeave={(e) => !isSubSelected && (e.currentTarget.style.background = 'transparent')}
                              >
                                {sub.SubCategoryName}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* LOCATIONS Section */}
          <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <button
              onClick={() => setExpandedLocation(!expandedLocation)}
              style={{
                width: '100%',
                padding: '16px 20px',
                background: '#000',
                border: 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '700',
                color: '#fff',
                textAlign: 'left',
                textTransform: 'lowercase',
                borderRadius: '8px',
                marginBottom: '8px'
              }}
            >
              <span>locations</span>
              <span style={{ color: '#fff' }}>{expandedLocation ? <FaChevronUp /> : <FaChevronDown />}</span>
            </button>
            
            {expandedLocation && (
              <div style={{ padding: '0 20px 16px' }}>
                {/* States */}
                {[...new Set(locations.map(l => l.state))].map(s => {
                  const isStateSelected = state === s;
                  const stateDistricts = [...new Set(locations.filter(l => l.state === s).map(l => l.district))];
                  
                  return (
                    <div key={s} style={{ marginBottom: '4px' }}>
                      <div
                        onClick={() => {
                          if (isStateSelected) {
                            setState('');
                            setDistrict('');
                            setMandal('');
                            setVillage('');
                          } else {
                            setState(s);
                            setDistrict('');
                            setMandal('');
                            setVillage('');
                          }
                        }}
                        style={{
                          padding: '10px 12px',
                          cursor: 'pointer',
                          borderLeft: isStateSelected ? '3px solid var(--cred-accent)' : '3px solid transparent',
                          background: isStateSelected ? 'rgba(0, 208, 156, 0.1)' : 'transparent',
                          fontWeight: isStateSelected ? '600' : '400',
                          color: '#fff',
                          transition: 'all 0.2s',
                          borderRadius: '6px',
                          textTransform: 'lowercase'
                        }}
                        onMouseEnter={(e) => !isStateSelected && (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)')}
                        onMouseLeave={(e) => !isStateSelected && (e.currentTarget.style.background = 'transparent')}
                      >
                        {s}
                      </div>
                      
                      {/* Districts - show only when state is selected */}
                      {isStateSelected && stateDistricts.length > 0 && (
                        <div style={{ paddingLeft: '16px', marginTop: '4px' }}>
                          {stateDistricts.map(d => {
                            const isDistrictSelected = district === d;
                            const districtMandals = [...new Set(locations.filter(l => l.state === s && l.district === d).map(l => l.mandal))];
                            
                            return (
                              <div key={d} style={{ marginBottom: '2px' }}>
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (isDistrictSelected) {
                                      setDistrict('');
                                      setMandal('');
                                      setVillage('');
                                    } else {
                                      setDistrict(d);
                                      setMandal('');
                                      setVillage('');
                                    }
                                  }}
                                  style={{
                                    padding: '8px 12px',
                                    cursor: 'pointer',
                                    background: isDistrictSelected ? 'rgba(0, 208, 156, 0.2)' : 'transparent',
                                    color: '#fff',
                                    fontSize: '13px',
                                    borderRadius: '6px',
                                    fontWeight: isDistrictSelected ? '600' : '400',
                                    transition: 'all 0.2s',
                                    textTransform: 'lowercase'
                                  }}
                                  onMouseEnter={(e) => !isDistrictSelected && (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)')}
                                  onMouseLeave={(e) => !isDistrictSelected && (e.currentTarget.style.background = 'transparent')}
                                >
                                  {d}
                                </div>
                                
                                {/* Mandals */}
                                {isDistrictSelected && districtMandals.length > 0 && (
                                  <div style={{ paddingLeft: '16px', marginTop: '2px' }}>
                                    {districtMandals.map(m => {
                                      const isMandalSelected = mandal === m;
                                      const mandalVillages = [...new Set(locations.filter(l => l.state === s && l.district === d && l.mandal === m).map(l => l.village))];
                                      
                                      return (
                                        <div key={m} style={{ marginBottom: '2px' }}>
                                          <div
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (isMandalSelected) {
                                                setMandal('');
                                                setVillage('');
                                              } else {
                                                setMandal(m);
                                                setVillage('');
                                              }
                                            }}
                                            style={{
                                              padding: '6px 10px',
                                              cursor: 'pointer',
                                              background: isMandalSelected ? 'rgba(0, 208, 156, 0.3)' : 'transparent',
                                              color: '#fff',
                                              fontSize: '12px',
                                              borderRadius: '6px',
                                              fontWeight: isMandalSelected ? '600' : '400',
                                              transition: 'all 0.2s',
                                              textTransform: 'lowercase'
                                            }}
                                            onMouseEnter={(e) => !isMandalSelected && (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)')}
                                            onMouseLeave={(e) => !isMandalSelected && (e.currentTarget.style.background = 'transparent')}
                                          >
                                            {m}
                                          </div>
                                          
                                          {/* Villages */}
                                          {isMandalSelected && mandalVillages.length > 0 && (
                                            <div style={{ paddingLeft: '16px', marginTop: '2px' }}>
                                              {mandalVillages.map(v => {
                                                const isVillageSelected = village === v;
                                                return (
                                                  <div
                                                    key={v}
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      setVillage(isVillageSelected ? '' : v);
                                                    }}
                                                    style={{
                                                      padding: '6px 10px',
                                                      cursor: 'pointer',
                                                      background: isVillageSelected ? 'rgba(0, 208, 156, 0.4)' : 'transparent',
                                                      color: '#fff',
                                                      fontSize: '11px',
                                                      borderRadius: '6px',
                                                      marginBottom: '2px',
                                                      transition: 'all 0.2s',
                                                      textTransform: 'lowercase'
                                                    }}
                                                    onMouseEnter={(e) => !isVillageSelected && (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)')}
                                                    onMouseLeave={(e) => !isVillageSelected && (e.currentTarget.style.background = 'transparent')}
                                                  >
                                                    {v}
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ padding: '20px' }}>
            <button
              className="cred-btn-danger"
              type="button"
              onClick={() => {
                setCategory('');
                setSubcategory('');
                setState('');
                setDistrict('');
                setMandal('');
                setVillage('');
                setListingType('');
                localStorage.removeItem('filter_category');
                localStorage.removeItem('filter_subcategory');
                localStorage.removeItem('filter_state');
                localStorage.removeItem('filter_district');
                localStorage.removeItem('filter_mandal');
                localStorage.removeItem('filter_village');
                localStorage.removeItem('filter_listingType');
              }}
            >
              <FaTimes /> clear filters
            </button>
          </div>
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
                        UserID: listing.User.UserID,
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
                  Category: listing.Category, // Pass Category object for name
                  Listing_Type: listing.Listing_Type,
                  CampaignStartDate: listing.CampaignStartDate,
                  CampaignEndDate: listing.CampaignEndDate
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
