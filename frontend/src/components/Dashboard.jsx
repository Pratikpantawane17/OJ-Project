import React, { useState, useEffect } from 'react';
import { CheckCircle, TrendingUp, Calendar, Flame, ArrowRight, Trophy, Clock, Target, Plus, Edit, Settings } from 'lucide-react';
import axios from 'axios';
import Navbar from './Navbar';
import useLogout from '../hooks/useLogout';
import GitHubCalendar from './GitHubCalendar';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';



const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  const { logout } = useLogout();

  const navigate = useNavigate();

  // Logout handler
  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      setUser(null);
      setDashboardData(null);
      setIsAdmin(false);
    }
  };

  // Fetch user data on mount with proper auth handling
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_URL}/user`, { 
          withCredentials: true,
        });
        
        console.log("User response:", response);
        
        if (response.data && response.data.success) {
          setUser(response.data.userData.username || 'User');
          // set admin or not by res.data.userData.role....
          setIsAdmin(response.data.userData.role === 'ADMIN');
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      } 
      catch (error) {
        console.error("Error fetching user:", error);
        // Only set user to null if it's actually an auth error
        if (error.response && error.response.status === 401) {
          setUser(null);
          setIsAdmin(false);
        }
      } finally {
        setAuthLoading(false);
      }
    };
    
    fetchUser();
  }, []);

  // Fetch dashboard data when user is loaded
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const response = await axios.get(`${import.meta.env.VITE_URL}/user/dashboard`, {
          withCredentials: true,
        });

        console.log("Dashboard response:", response);

        if (response.data && response.data.problemData) {
          setDashboardData(response.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user && !authLoading) {
      fetchDashboardData();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, authLoading]);

  // Calculate maximum consecutive submission days
  const calculateMaxStreak = (solvedProblems) => {
    if (!solvedProblems || solvedProblems.length === 0) return 0;
    
    // Get unique sorted dates
    const uniqueDates = [...new Set(solvedProblems.map(p => p.dateSolved))].sort();
    
    let maxStreak = 0;
    let currentStreak = 1;
    
    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(uniqueDates[i - 1]);
      const currentDate = new Date(uniqueDates[i]);
      const diffTime = currentDate - prevDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        currentStreak++;
      } else {
        maxStreak = Math.max(maxStreak, currentStreak);
        currentStreak = 1;
      }
    }
    
    return Math.max(maxStreak, currentStreak);
  };

  // Calculate active days (distinct submission dates)
  const calculateActiveDays = (solvedProblems) => {
    if (!solvedProblems || solvedProblems.length === 0) return 0;
    return new Set(solvedProblems.map(p => p.dateSolved)).size;
  };

  // Generate calendar heatmap data for past year using contribution-like approach
  const generateCalendarData = () => {
    const today = new Date();
    const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    const calendar = [];
    
    // Create submission dates map with counts
    const submissionDates = {};
    if (dashboardData?.problemData?.solvedProblems) {
      dashboardData.problemData.solvedProblems.forEach(problem => {
        const date = problem.dateSolved;
        submissionDates[date] = (submissionDates[date] || 0) + 1;
      });
    }
    
    // Generate calendar grid
    const currentDate = new Date(oneYearAgo);
    while (currentDate <= today) {
      const dateString = currentDate.toISOString().split('T')[0];
      const submissionCount = submissionDates[dateString] || 0;
      
      calendar.push({
        date: dateString,
        count: submissionCount,
        level: submissionCount === 0 ? 0 : Math.min(Math.ceil(submissionCount / 2), 4), // 0-4 levels
        month: currentDate.getMonth(),
        day: currentDate.getDay()
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return calendar;
  };

  // Group problems by difficulty for better display
  const groupProblemsByDifficulty = (solvedProblems) => {
    const grouped = {
      Easy: [],
      Medium: [],
      Hard: []
    };
    
    if (solvedProblems) {
      solvedProblems.forEach(problem => {
        const difficulty = problem.difficulty || 'Easy';
        if (grouped[difficulty]) {
          grouped[difficulty].push(problem);
        }
      });
    }
    
    return grouped;
  };

  // Auth loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    toast.error('You need to log in to access the dashboard.');

    navigate('/login');
    return null;
  }

  // Dashboard loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
        <Navbar 
          isAuthenticated={!!user}
          onLogout={handleLogout}
          onNavigate={navigate}
        />
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <div className="text-white text-xl">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  // If no dashboard data, show error state
  if (!dashboardData || !dashboardData.problemData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
        <Navbar 
          isAuthenticated={!!user}
          onLogout={handleLogout}
          onNavigate={navigate}
        />
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-white text-xl mb-4">Error loading dashboard data</div>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { problemData } = dashboardData;
  const userName = user || user || 'User';
  const calendarData = generateCalendarData();
  const groupedProblems = groupProblemsByDifficulty(problemData.solvedProblems);
  const months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  
  // Get difficulty totals from backend response
  const difficultyTotals = problemData.difficultyTotals || {
    Easy: 0,
    Medium: 0,
    Hard: 0
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <Navbar 
        isAuthenticated={!!user}
        onLogout={handleLogout}
        onNavigate={navigate}
      />
      
      <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                Welcome back, <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">{userName}</span>!
                {isAdmin && <span className="ml-3 px-3 py-1 text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full">Admin</span>}
              </h1>
              <p className="text-gray-400 text-lg">Here's a glance at your achievements. Stay consistent!</p>
            </div>
            
            {/* Admin Controls */}
            {isAdmin && (
              <div className="flex flex-col sm:flex-row items-center sm:space-x-4 space-y-3 sm:space-y-0 w-full sm:w-auto">
                <button
                  onClick={() => navigate('/admin/problem-form')}
                  className="
                    group relative inline-flex items-center justify-center
                    px-4 py-2 text-xs font-semibold w-full sm:w-auto
                    sm:px-6 sm:py-3 sm:text-sm
                    text-white bg-gradient-to-r from-purple-600 to-pink-600
                    rounded-lg hover:from-purple-700 hover:to-pink-700
                    transform hover:scale-105 transition-all duration-300
                    shadow-lg hover:shadow-purple-500/25 cursor-pointer
                  "
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Problem
                </button>

                <button
                  onClick={() => navigate('/problemlist')}
                  className="
                    group relative inline-flex items-center justify-center
                    px-4 py-2 text-xs font-semibold w-full sm:w-auto
                    sm:px-6 sm:py-3 sm:text-sm
                    text-gray-300 bg-gradient-to-r from-gray-700 to-gray-800
                    rounded-lg hover:from-gray-600 hover:to-gray-700
                    transform hover:scale-105 transition-all duration-300
                    shadow-lg border border-gray-600 cursor-pointer
                  "
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Admin Panel
                </button>
              </div>
            )}
            
          </div>
        </div>

        {/* Stats Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Problems Solved */}
          <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-white">
              <div className="text-sm text-gray-400 mb-1">Problems Solved</div>
              <div className="text-3xl font-bold">{problemData.problemCount}</div>
            </div>
          </div>

          {/* Total Submissions */}
          <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-white">
              <div className="text-sm text-gray-400 mb-1">Total Submissions</div>
              <div className="text-3xl font-bold">{problemData.submissionCount}</div>
            </div>
          </div>

          {/* Acceptance Rate */}
          <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-white">
              <div className="text-sm text-gray-400 mb-1">Acceptance Rate</div>
              <div className="text-3xl font-bold">{problemData.acceptanceRate.toFixed(1)}%</div>
            </div>
          </div>

          {/* Max Streak */}
          <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <Flame className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-white">
              <div className="text-sm text-gray-400 mb-1">Max Streak</div>
              <div className="text-3xl font-bold">{calculateMaxStreak(problemData.solvedProblems)} days</div>
            </div>
          </div>
        </div>

        



        <div className="grid lg:grid-cols-3 gap-8 mb-8">
  {/* Enhanced Solved by Difficulty with Reduced Height */}
  <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50 text-sm space-y-4">
    <h3 className="text-lg font-bold text-white mb-4">Solved by Difficulty</h3>
    
    <div className="space-y-4">
      {/* Easy */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-green-400 font-medium">Easy</span>
          </div>
          <span className="text-white font-bold">{problemData.easy} / {difficultyTotals.Easy}</span>
        </div>
        <div className="w-full bg-gray-700/50 rounded-full h-2">
          <div 
            className="h-2 bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${Math.min((problemData.easy / difficultyTotals.Easy) * 100, 100)}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-400">
          {((problemData.easy / difficultyTotals.Easy) * 100).toFixed(1)}% completed
        </div>
      </div>
      
      {/* Medium */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-yellow-400 font-medium">Medium</span>
          </div>
          <span className="text-white font-bold">{problemData.medium} / {difficultyTotals.Medium}</span>
        </div>
        <div className="w-full bg-gray-700/50 rounded-full h-2">
          <div 
            className="h-2 bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${Math.min((problemData.medium / difficultyTotals.Medium) * 100, 100)}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-400">
          {((problemData.medium / difficultyTotals.Medium) * 100).toFixed(1)}% completed
        </div>
      </div>
      
      {/* Hard */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-red-400 font-medium">Hard</span>
          </div>
          <span className="text-white font-bold">{problemData.hard} / {difficultyTotals.Hard}</span>
        </div>
        <div className="w-full bg-gray-700/50 rounded-full h-2">
          <div 
            className="h-2 bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${Math.min((problemData.hard / difficultyTotals.Hard) * 100, 100)}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-400">
          {((problemData.hard / difficultyTotals.Hard) * 100).toFixed(1)}% completed
        </div>
      </div>
    </div>
  </div>

  {/* Enhanced Calendar Heatmap */}
  <div className="lg:col-span-2 bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 overflow-x-auto">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-bold text-white">
        {problemData.submissionCount} submissions in the past one year
      </h3>
      <div className="text-gray-400 text-sm">
        Total active days: {calculateActiveDays(problemData.solvedProblems)}
      </div>
    </div>

    {/* GitHub Calendar Component */}
    <GitHubCalendar
      submissions={problemData.solvedProblems.reduce((acc, cur) => {
        const d = cur.dateSolved;
        const found = acc.find(x => x.dateSolved === d);
        if (found) found.count += 1;
        else acc.push({ dateSolved: d, count: 1 });
        return acc;
      }, [])}
    />
  </div>
</div>

        {/* Enhanced Problems List */}
        <div className="space-y-8">
          {problemData.solvedProblems.length === 0 ? (
            /* Empty State */
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm rounded-2xl p-12 border border-gray-700/50 text-center">
              <div className="mb-6">
                <Trophy className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <div className="text-gray-400 text-xl mb-2">
                  No problems solved yet. Time to get started!
                </div>
                <div className="text-gray-500 text-sm">
                  Start your coding journey and see your progress here
                </div>
              </div>
              <button
                onClick={() => navigate('/problemlist')}
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-full hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-blue-500/25"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300"></span>
                <span className="relative flex items-center">
                  View Problems
                  <ArrowRight className="w-5 h-5 ml-2" />
                </span>
              </button>
            </div>
          ) : (
            /* Enhanced Solved Problems Display */
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                <h3 className="text-2xl font-bold text-white mb-4">Your Achievements</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400 mb-1">{groupedProblems.Easy.length}</div>
                    <div className="text-sm text-gray-400">Easy Problems</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-400 mb-1">{groupedProblems.Medium.length}</div>
                    <div className="text-sm text-gray-400">Medium Problems</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-400 mb-1">{groupedProblems.Hard.length}</div>
                    <div className="text-sm text-gray-400">Hard Problems</div>
                  </div>
                </div>
              </div>

              {/* Problems by Difficulty */}
              {Object.entries(groupedProblems).map(([difficulty, problems]) => {
                if (problems.length === 0) return null;
                
                const difficultyColors = {
                  Easy: { bg: 'from-green-500/10 to-green-600/10', border: 'border-green-500/30', text: 'text-green-400', dot: 'bg-green-500' },
                  Medium: { bg: 'from-yellow-500/10 to-yellow-600/10', border: 'border-yellow-500/30', text: 'text-yellow-400', dot: 'bg-yellow-500' },
                  Hard: { bg: 'from-red-500/10 to-red-600/10', border: 'border-red-500/30', text: 'text-red-400', dot: 'bg-red-500' }
                };
                
                const colors = difficultyColors[difficulty];
                
                return (
                  <div key={difficulty} className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className={`text-xl font-bold ${colors.text} flex items-center`}>
                        <div className={`w-3 h-3 ${colors.dot} rounded-full mr-3`}></div>
                        {difficulty} Problems ({problems.length})
                      </h4>
                    </div>
                    
                    <div className="grid gap-3">
                      {problems.map((problem, index) => (
                        <div
                          key={`${problem.id}-${index}`}
                          className={`group relative bg-gradient-to-r ${colors.bg} backdrop-blur-sm rounded-lg p-4 border ${colors.border} hover:border-opacity-60 transition-all duration-300`}
                           onClick={() => navigate(`/problemlist/${problem.id}`)}
                        >
                          <div className="flex items-center justify-between hover:cursor-pointer">
                            <div className="flex items-center space-x-4 " >
                              <CheckCircle className={`w-5 h-5 ${colors.text}`} />
                              <div>
                                <span 
                                  className="text-white group-hover:text-blue-400 transition-colors duration-300 font-medium cursor-pointer"
                                >
                                  {problem.title}
                                </span>
                                {problem.description && (
                                  <div className="text-xs text-gray-400 mt-1">
                                    {problem.description.substring(0, 100)}...
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              {/* Admin Update Button */}
                              {isAdmin && (
                                <button
                                  onClick={() => navigate(`/admin/problem-form/${problem.id}`)}
                                  className="p-2 text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all duration-300 hover:cursor-pointer"
                                  title="Edit Problem"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              )}
                              <div 
                                onClick={() => navigate(`/problemlist/${problem.id}`)}
                                className="cursor-pointer"
                              >
                                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors duration-300" />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
        
      
    </div>  
  );
};

export default Dashboard;