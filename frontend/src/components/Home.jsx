import React, { useState, useEffect } from 'react';
import { Code, Shield, Cpu, Brain, Lock, Settings, Terminal, Users } from 'lucide-react';
import Navbar from './Navbar';
import useLogout from '../hooks/useLogout';
import Footer from './Footer'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Homepage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    problems: 0,
    users: 0,
    submissions: 0
  });
  const { logout } = useLogout();

  const isAuthenticated = !!user;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_URL}/user`, { 
          withCredentials: true,
        });
        
        console.log(response);


        // Fixed: Use response.data instead of response directly
        if (response.data.success) {
          setUser(response.data.user || true); // Set user as true since backend returns user: true
       
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, []);


  useEffect(() => {
  const fetchStats = async () => {
    try {
      // Fetch stats from single endpoint
      const response = await axios.get(`${import.meta.env.VITE_URL}/stats`, {
        withCredentials: true,
      });

      console.log(response?.data)

      if (response.data.success) {
        setStats({
          problems: response.data.data.problems || 0,
          users: response.data.data.users || 0,
          submissions: response.data.data.submissions || 0
        });
      } else {
        setStats({
          problems: 0,
          users: 0,
          submissions: 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({
        problems: 0,
        users: 0,
        submissions: 0
      });
    }
  };

  fetchStats();
}, []);


  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      setUser(null);
    }
  };


  const handleCTAClick = () => {
    if (isAuthenticated) {
      navigate('/problemlist');
    } else {
      navigate('/login');
    }
  };

  const features = [
    {
      icon: Code,
      title: "Code Conquers",
      subtitle: "Multi-Language Support",
      description: "Write solutions in Python, C++, Java, and more with full syntax highlighting and IntelliSense.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Terminal,
      title: "Battlefield Ready",
      subtitle: "Clean Problem UI",
      description: "Markdown-based problem statements with interactive examples and clear constraints.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Cpu,
      title: "Smart Editor",
      subtitle: "Monaco Editor",
      description: "Industry-standard code editor with autocomplete, debugging, and customizable themes.",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: Brain,
      title: "AI Companion",
      subtitle: "AI Code Review",
      description: "Get intelligent feedback on your solutions and optimization suggestions powered by AI.",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: Lock,
      title: "Secure Entry",
      subtitle: "Auth System",
      description: "Robust authentication with secure login, registration, and profile management.",
      gradient: "from-indigo-500 to-purple-500"
    },
    {
      icon: Settings,
      title: "Admin Armory",
      subtitle: "Management Tools",
      description: "Comprehensive admin dashboard for managing problems, users, and platform analytics.",
      gradient: "from-teal-500 to-cyan-500"
    },
    {
      icon: Shield,
      title: "Safe Zone",
      subtitle: "Docker Execution",
      description: "Secure, isolated code execution environment using containerized Docker technology.",
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      icon: Users,
      title: "Community Hub",
      subtitle: "Collaborative Learning",
      description: "Connect with fellow coders, share solutions, and participate in coding competitions.",
      gradient: "from-rose-500 to-pink-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <Navbar 
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        onNavigate={navigate}
      />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6">
                <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  Algo
                </span>
                <span className="text-white">Arena</span>
              </h1>
              <p className="text-xl font-bold lg:text-2xl text-gray-100 mb-8 font-light">
                Code. Submit. Compete.
              </p>
              <p className="text-lg text-gray-400 mb-10 max-w-xl">
                Master algorithms, sharpen your coding skills, and compete with developers worldwide in our comprehensive online judge platform.
              </p>
              
              {!loading && (
                <button
                  onClick={handleCTAClick}
                  className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-full hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 cursor-pointer"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300"></span>
                  <span className="relative">
                    {isAuthenticated ? "Get Started" : "Login to Start Solving"}
                  </span>
                </button>
              )}
            </div>
            
            <div className="hidden lg:block">
              <div className="relative">
                <div className="w-full h-96 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 shadow-2xl">
                  <div className="flex items-center space-x-2 mb-6">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="space-y-4 text-sm">
                    <div className="text-blue-400">def solve(nums):</div>
                    <div className="text-gray-300 ml-4"># Your algorithm here</div>
                    <div className="text-purple-400 ml-4">result = []</div>
                    <div className="text-green-400 ml-4">for num in nums:</div>
                    <div className="text-yellow-400 ml-8">result.append(num * 2)</div>
                    <div className="text-purple-400 ml-4">return result</div>
                    <div className="text-gray-500 mt-6"># Test case passed ✓</div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full opacity-20 animate-bounce"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-gray-900/20 to-purple-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-blue-400 mb-2">{stats.problems}+</div>
              <div className="text-gray-300 text-lg">Problems</div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-purple-400 mb-2">{stats.users}+</div>
              <div className="text-gray-300 text-lg">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-green-400 mb-2">{stats.submissions}+</div>
              <div className="text-gray-300 text-lg">Submissions Judged</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-transparent to-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Platform Features
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Everything you need to excel in competitive programming and algorithmic problem solving
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group relative bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:transform hover:scale-105 cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-800/20 to-gray-900/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative">
                    <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-sm font-semibold text-gray-400 mb-3">
                      {feature.subtitle}
                    </p>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
      
    </div>
  );
};

export default Homepage;