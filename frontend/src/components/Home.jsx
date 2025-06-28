import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Home = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('Loading...');
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_URL}/user`, { withCredentials: true })
      .then(res => {
        setMessage(res.data.message || "Welcome to AlgoArena!");
        setUser(res.data.user || null);
      })
      .catch(err => {
        const status = err?.response?.status;
        if (status === 401) {
          navigate('/login');
        } else if (status === 403) {
          navigate('/user/unauthorized');
        } else {
          toast.error("Something went wrong!");
        }
      });
  }, [navigate]);

  const handleActionClick = () => {
    if (user) {
      navigate('/user/problemlist');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 text-gray-900 transition-colors duration-300 ease-in-out">
      <ToastContainer />

      {/* Logo & Header */}
      <header className="flex items-center px-6 py-4 space-x-3">
        <img
          src="/logo_white.png"
          alt="AlgoArena Logo"
          className="w-10 h-10"
        />
        <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
          AlgoArena
        </span>
      </header>

      {/* Hero Section */}
      <section className="w-full px-6 py-12 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-700 mb-4">Welcome to 
          {" "}<span className="text-700 font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
          AlgoArena
        </span>{" "}
         – The Smarter Online Judge!</h1>
         
        <p className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-700 mb-8">
          Solve coding problems, get real-time feedback, and prepare for your next coding interview with AlgoArena.
        </p>
        <button
          onClick={handleActionClick}
          className="px-6 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-all shadow-lg"
        >
          {user ? "Start Solving" : "Login to Start Solving"}
        </button>
      </section>

      {/* Features Section */}
      <section className="px-4 sm:px-10 py-12 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          <FeatureCard
            title="⚡ Real-Time Compiler Feedback"
            desc="Compile and run your code in real-time with instant result display."
          />
          <FeatureCard
            title="🤖 AI Suggestions (Coming Soon)"
            desc="AI-powered hints and code insights when your submissions fail."
          />
          <FeatureCard
            title="📈 Submission History"
            desc="Track all your past attempts, correct answers, and wrong submissions easily."
          />
          <FeatureCard
            title="🌐 Multi-Language Support"
            desc="Write and submit code in multiple programming languages effortlessly."
          />
        </div>
      </section>

      {/* Coming Soon Placeholder */}
      <section className="bg-blue-50 px-6 py-10">
        <div className="max-w-4xl mx-auto text-center border-2 border-dashed border-purple-300 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-purple-700 mb-2">Coming Soon 🚀</h2>
          <p className="text-gray-700">AI-powered debugging help, smarter problem recommendations, and much more.</p>
        </div>
      </section>

      {/* Notification Area Placeholder */}
      <section className="px-6 py-10 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold text-blue-600 mb-2">📢 Latest Announcements</h2>
          <div className="text-gray-600 italic">No new announcements. Stay tuned for upcoming contests!</div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 bg-gray-100 text-gray-500 text-sm">
        {user ? `Logged in as ${user.name}` : "You are not logged in."} • © 2025 AlgoArena
      </footer>
    </div>
  );
};

const FeatureCard = ({ title, desc }) => (
  <div className="bg-gray-50 p-6 rounded-xl shadow-md hover:shadow-xl transition duration-300 ease-in-out">
    <h3 className="text-xl font-semibold mb-2 text-blue-700">{title}</h3>
    <p className="text-gray-700">{desc}</p>
  </div>
);

export default Home;
