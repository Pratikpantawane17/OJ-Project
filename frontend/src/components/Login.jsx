import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Frontend Validation
    if (!loginData.email || !loginData.password) {
      toast.error('Please fill in both fields', {
        position: 'top-right',
        autoClose: 2000,
      });
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(loginData.email)) {
      toast.error('Invalid email format', {
        position: 'top-right',
        autoClose: 2000,
      });
      return;
    }

    try {
        const response = await axios.post(`${import.meta.env.VITE_URL}/login`, loginData, {
        withCredentials: true
      });
      console.log('Login success:', response.data);
      // TODO: Handle token, redirect, toast, etc.

      // ✅ Show Success Toast
      toast.success('Login Successful! Redirecting...', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'colored'
      });

      // ✅ Wait 2 seconds, then navigate
      setTimeout(() => {
        navigate('/user');
      }, 2000);

    } 
    catch (error) {
      console.error('Login error:', error);

      const message = error?.response?.data?.message || "Error while Signin";

      toast.error(message, {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  return (
    <>
  
    

    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">

      <div className="fixed top-4 left-4 sm:top-6 sm:left-6 flex items-center space-x-2 sm:space-x-3 z-50">
        <img
          src="/logo_white.png"
          alt="AlgoArena logo"
          className="h-8 w-8 sm:h-10 sm:w-10"
        />
        <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
          AlgoArena
        </span>
      </div>


      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
        
        
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-gray-800 mt-1">Welcome Back</h1>
          <p className="text-gray-600 text-sm">Please Enter your Details</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="emailID"
              name="email"
              placeholder="Email address"
              value={loginData.email}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Password"
              value={loginData.password}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <label className="flex items-center space-x-2">
              <input type="checkbox" id="rememberMe" />
              <span>Remember me for 30 days</span>
            </label>
            <Link to="/forgot-password" className="text-blue-600 hover:underline">
              Forgot password
            </Link>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200 cursor-pointer"
          >
            Sign In
          </button>

          <p className="text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </div>
      <ToastContainer />
    </div>
    </>
  );
};

export default Login;
