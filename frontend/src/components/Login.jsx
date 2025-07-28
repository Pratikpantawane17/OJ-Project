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
    rememberMe: false, 
  });

  const handleChange = (e) => {
      const { name, type, value, checked } = e.target;
      setLoginData({
        ...loginData,
        [name]: type === 'checkbox' ? checked : value,
      });
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
        // theme: 'colored'
      });

      // ✅ Wait 2 seconds, then navigate
      setTimeout(() => {
        navigate('/');
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center px-4">

      <div className="fixed top-4 left-4 sm:top-6 sm:left-6 flex items-center space-x-2 sm:space-x-3 z-50 hover:cursor-pointer" onClick={() => navigate('/')}>
        <img
          src="/logo_white.png"
          alt="AlgoArena logo"
          className="h-8 w-8 sm:h-10 sm:w-10"
        />
        <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
          AlgoArena
        </span>
      </div>

      <div className="max-w-md w-full bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 shadow-2xl">
        
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400 text-sm">Please Enter your Details</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input
              type="email"
              id="emailID"
              name="email"
              placeholder="Email address"
              value={loginData.email}
              onChange={handleChange}
              className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Password"
              value={loginData.password}
              onChange={handleChange}
              className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          <div className="flex items-center justify-between text-sm text-gray-400">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="checkbox" 
                id="rememberMe" 
                name="rememberMe"  // add name
                checked={loginData.rememberMe} // control checkbox state
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span>Remember me for 30 days</span>
            </label>
            <Link to="/forgot-password" className="text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-200">
              Forgot password
            </Link>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 font-semibold shadow-lg hover:shadow-blue-500/25 cursor-pointer"
          >
            Sign In
          </button>

          <p className="text-center text-sm text-gray-400">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-200 font-medium">
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