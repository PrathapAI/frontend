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
  const [district, setDistrict] = useState(() => {
    const saved = localStorage.getItem('filter_district');
    return saved ? JSON.parse(saved) : [];
  });
  const [mandal, setMandal] = useState(() => {
    const saved = localStorage.getItem('filter_mandal');
    return saved ? JSON.parse(saved) : [];
  });
  const [village, setVillage] = useState(() => {
    const saved = localStorage.getItem('filter_village');
    return saved ? JSON.parse(saved) : [];
  });
  const [listingType, setListingType] = useState(() => localStorage.getItem('filter_listingType') || '');
  
  // Location search state
  const [locationSearch, setLocationSearch] = useState('');
  
  // Accordion state
  const [expandedCategory, setExpandedCategory] = useState(true);
  const [expandedLocation, setExpandedLocation] = useState(true);
  const [expandedSubcategory, setExpandedSubcategory] = useState(null);
  const [expandedState, setExpandedState] = useState(null);
  const [expandedDistrict, setExpandedDistrict] = useState(null);
  const [expandedAdType, setExpandedAdType] = useState(true);
  
  // Mobile filter toggle
  const [showFilters, setShowFilters] = useState(false);
  
  // Prevent body scroll when filters are open
  useEffect(() => {
    if (showFilters) {
      document.body.classList.add('filters-open');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('filters-open');
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.classList.remove('filters-open');
      document.body.style.overflow = 'unset';
    };
  }, [showFilters]);
  
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
    localStorage.setItem('filter_district', JSON.stringify(district));
    localStorage.setItem('filter_mandal', JSON.stringify(mandal));
    localStorage.setItem('filter_village', JSON.stringify(village));
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
    // District filter - match any selected district
    if (district.length > 0 && listing.Location?.district && !district.includes(listing.Location.district)) return false;
    // Mandal filter - match any selected mandal
    if (mandal.length > 0 && listing.Location?.mandal && !mandal.includes(listing.Location.mandal)) return false;
    // Village filter - match any selected village
    if (village.length > 0 && listing.Location?.village && !village.includes(listing.Location.village)) return false;
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
                {/* Location Search */}
                <div style={{ marginBottom: '12px', position: 'relative' }}>
                  <FaSearch style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'rgba(255, 255, 255, 0.4)',
                    fontSize: '14px',
                    pointerEvents: 'none',
                    zIndex: 1
                  }} />
                  <input
                    type="text"
                    placeholder="search by district, mandal, or village..."
                    value={locationSearch}
                    onChange={(e) => setLocationSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 38px',
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#000',
                      fontSize: '13px',
                      outline: 'none',
                      position: 'relative',
                      zIndex: 0
                    }}
                  />
                </div>
                
                {/* States */}
                {[...new Set(locations.map(l => l.state))].filter(s => {
                  if (!locationSearch) return true;
                  const search = locationSearch.toLowerCase();
                  // Check if state name matches
                  if (s.toLowerCase().includes(search)) return true;
                  // Check if any district/mandal/village in this state matches
                  return locations.some(l => 
                    l.state === s && (
                      l.district.toLowerCase().includes(search) ||
                      l.mandal.toLowerCase().includes(search) ||
                      l.village.toLowerCase().includes(search)
                    )
                  );
                }).map(s => {
                  const isStateSelected = state === s;
                  const stateDistricts = [...new Set(locations.filter(l => l.state === s).map(l => l.district))].filter(d => {
                    if (!locationSearch) return true;
                    const search = locationSearch.toLowerCase();
                    // Check if district matches or any mandal/village in district matches
                    if (d.toLowerCase().includes(search)) return true;
                    return locations.some(l =>
                      l.state === s && l.district === d && (
                        l.mandal.toLowerCase().includes(search) ||
                        l.village.toLowerCase().includes(search)
                      )
                    );
                  });
                  
                  return (
                    <div key={s} style={{ marginBottom: '4px' }}>
                      <div
                        onClick={() => {
                          if (isStateSelected) {
                            setState('');
                            setDistrict([]);
                            setMandal([]);
                            setVillage([]);
                          } else {
                            setState(s);
                            setDistrict([]);
                            setMandal([]);
                            setVillage([]);
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
                            const isDistrictSelected = district.includes(d);
                            const districtMandals = [...new Set(locations.filter(l => l.state === s && l.district === d).map(l => l.mandal))].filter(m => {
                              if (!locationSearch) return true;
                              const search = locationSearch.toLowerCase();
                              // Check if mandal matches or any village in mandal matches
                              if (m.toLowerCase().includes(search)) return true;
                              return locations.some(l =>
                                l.state === s && l.district === d && l.mandal === m &&
                                l.village.toLowerCase().includes(search)
                              );
                            });
                            
                            return (
                              <div key={d} style={{ marginBottom: '2px' }}>
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (isDistrictSelected) {
                                      setDistrict(district.filter(item => item !== d));
                                    } else {
                                      setDistrict([...district, d]);
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
                                {district.includes(d) && districtMandals.length > 0 && (
                                  <div style={{ paddingLeft: '16px', marginTop: '2px' }}>
                                    {districtMandals.map(m => {
                                      const isMandalSelected = mandal.includes(m);
                                      const mandalVillages = [...new Set(locations.filter(l => l.state === s && l.district === d && l.mandal === m).map(l => l.village))].filter(v => {
                                        if (!locationSearch) return true;
                                        return v.toLowerCase().includes(locationSearch.toLowerCase());
                                      });
                                      
                                      return (
                                        <div key={m} style={{ marginBottom: '2px' }}>
                                          <div
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (isMandalSelected) {
                                                setMandal(mandal.filter(item => item !== m));
                                              } else {
                                                setMandal([...mandal, m]);
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
                                          {mandal.includes(m) && mandalVillages.length > 0 && (
                                            <div style={{ paddingLeft: '16px', marginTop: '2px' }}>
                                              {mandalVillages.map(v => {
                                                const isVillageSelected = village.includes(v);
                                                return (
                                                  <div
                                                    key={v}
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      setVillage(isVillageSelected 
                                                        ? village.filter(vil => vil !== v) 
                                                        : [...village, v]
                                                      );
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

          {/* Selected Districts Display */}
          {district.length > 0 && (
            <div style={{ padding: '0 20px 12px 20px' }}>
              <div style={{ 
                fontSize: '11px', 
                color: 'rgba(255, 255, 255, 0.6)', 
                marginBottom: '8px',
                fontWeight: '500'
              }}>
                selected districts ({district.length})
              </div>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '6px'
              }}>
                {district.map(d => (
                  <div
                    key={d}
                    style={{
                      background: 'rgba(0, 208, 156, 0.3)',
                      color: '#fff',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>{d}</span>
                    <FaTimes
                      onClick={() => setDistrict(district.filter(item => item !== d))}
                      style={{ 
                        cursor: 'pointer', 
                        fontSize: '9px',
                        opacity: 0.7,
                        color: '#fff'
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selected Mandals Display */}
          {mandal.length > 0 && (
            <div style={{ padding: '0 20px 12px 20px' }}>
              <div style={{ 
                fontSize: '11px', 
                color: 'rgba(255, 255, 255, 0.6)', 
                marginBottom: '8px',
                fontWeight: '500'
              }}>
                selected mandals ({mandal.length})
              </div>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '6px'
              }}>
                {mandal.map(m => (
                  <div
                    key={m}
                    style={{
                      background: 'rgba(0, 208, 156, 0.3)',
                      color: '#fff',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>{m}</span>
                    <FaTimes
                      onClick={() => setMandal(mandal.filter(item => item !== m))}
                      style={{ 
                        cursor: 'pointer', 
                        fontSize: '9px',
                        opacity: 0.7,
                        color: '#fff'
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selected Villages Display */}
          {village.length > 0 && (
            <div style={{ padding: '0 20px 12px 20px' }}>
              <div style={{ 
                fontSize: '11px', 
                color: 'rgba(255, 255, 255, 0.6)', 
                marginBottom: '8px',
                fontWeight: '500'
              }}>
                selected villages ({village.length})
              </div>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '6px'
              }}>
                {village.map(v => (
                  <div
                    key={v}
                    style={{
                      background: 'rgba(0, 208, 156, 0.3)',
                      color: '#fff',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>{v}</span>
                    <FaTimes
                      onClick={() => setVillage(village.filter(vil => vil !== v))}
                      style={{ 
                        cursor: 'pointer', 
                        fontSize: '9px',
                        opacity: 0.7,
                        color: '#fff'
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ padding: '20px' }}>
            <button
              className="cred-btn-danger"
              type="button"
              onClick={() => {
                setCategory('');
                setSubcategory('');
                setState('');
                setDistrict([]);
                setMandal([]);
                setVillage([]);
                setListingType('');
                setLocationSearch('');
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
