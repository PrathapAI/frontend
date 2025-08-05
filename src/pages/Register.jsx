import { useState } from 'react';
import React from 'react';
import API from '../services/api';
import axios from 'axios';
import '../page-ribbon.css';
import '../form-theme.css';
import '../home-theme.css';
import '../form-button.css';
import { FaUserPlus } from 'react-icons/fa';

function Register() {
  const [form, setForm] = useState({ username: '', name: '', email: '',address: '', password: '', phone: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Submitting form:", form); // ✅ Debug log

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, form);
      alert("Registration successful!");
      setForm({ username: '', name: '', email: '', address: '', password: '', phone: '' }); // Clear fields
    } catch (error) {
      console.error("Register failed:", error);
      alert(error.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <>
      {/* ...existing code... */}
      <div className="page-bg-blue-accent">
        <div className="page-center-form">
          <div className="form-box">
               <form onSubmit={handleSubmit}>
                 <input type="text" placeholder="Username" onChange={e => setForm({ ...form, username: e.target.value })} />
                 <input type="text" placeholder="Name" onChange={e => setForm({ ...form, name: e.target.value })} />
                 <input type="email" placeholder="Email" onChange={e => setForm({ ...form, email: e.target.value })} />
                 <input type="text" placeholder="Address" onChange={e => setForm({ ...form, address: e.target.value })} />
                 <input type="password" placeholder="Password" onChange={e => setForm({ ...form, password: e.target.value })} />
                 <input type="text" placeholder="Phone Number" onChange={e => setForm({ ...form, phone: e.target.value })} />
                 <button type="submit"><FaUserPlus /> Register</button>
               </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default Register;
