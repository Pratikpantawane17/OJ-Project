import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Moon, Sun, Download, Timer, Play, Send, RotateCcw,ChevronDown,ChevronRight,Tag,Clock,Lightbulb,Code,FileText,Users,MessageSquare,Loader2,AlertCircle
} from 'lucide-react';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal'; // Adjust path if needed
import { useParams, useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaArrowRight } from 'react-icons/fa';

// Monaco Editor Component (simplified for demo)
const MonacoEditor = ({ value, onChange, language, theme }) => {
  return (
    <div className="w-full h-full bg-gray-900 text-gray-100 font-mono text-sm p-4 rounded-lg border border-gray-700">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full bg-transparent resize-none outline-none"
        placeholder={`// Write your ${language} code here...
#include <iostream>
using namespace std;

int main() {
    // Your solution here
    return 0;
}`}
      />
    </div>
  );
};

// Countdown Timer Component
const CountdownTimer = ({ targetTime = "2024-12-31T23:59:59" }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(targetTime).getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetTime]);

  return (
    <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-4 py-2 rounded-lg border border-blue-500/30">
      <Timer className="w-4 h-4 text-blue-400" />
      <span className="text-sm font-mono text-blue-300">
        {String(timeLeft.hours).padStart(2, '0')}:
        {String(timeLeft.minutes).padStart(2, '0')}:
        {String(timeLeft.seconds).padStart(2, '0')}
      </span>
    </div>
  );
};

// Collapsible Section Component
const CollapsibleSection = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-700 rounded-lg bg-gray-800/50 backdrop-blur-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-700/30 transition-colors"
      >
        <h3 className="font-semibold text-gray-200">{title}</h3>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-400" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 text-gray-300 border-t border-gray-700">
          {children}
        </div>
      )}
    </div>
  );
};

// Main Problem Page Component
const ProblemPage = ({ id }) => {
  const params = useParams(); // ✅ Correct usage
  const problemId = params?.id || id;  
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedProblemId, setSelectedProblemId] = useState(null);

  const [outputResult, setOutputResult] = useState('');


  const [isDarkMode, setIsDarkMode] = useState(true);
  const [leftPanelWidth, setLeftPanelWidth] = useState(50);
  const [activeLeftTab, setActiveLeftTab] = useState('Description');
  const [activeRightTab, setActiveRightTab] = useState('Code Editor');
  const [selectedLanguage, setSelectedLanguage] = useState('cpp');
  const [code, setCode] = 
  useState(`#include <iostream>
using namespace std;

int main() {
        
    cout << "Hello World!" << endl;
      
  return 0;
}`);

  const [isResizing, setIsResizing] = useState(false);
  const [problemData, setProblemData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const containerRef = useRef(null);

  // Fetch problem data from backend
  useEffect(() => {
    const fetchProblemData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`${import.meta.env.VITE_URL}/user/problemlist/${problemId}`, {
          withCredentials: true,
        });


        if (response.data.success) {
          setProblemData(response.data.problem);
          if (response.data.role === "ADMIN") setIsAdmin(true); 
        } 
        else {
          setError('Failed to fetch problem data');
        }
      } catch (error) {
        console.error('Error fetching problem:', error);
        setError(error.response?.data?.message || 'Failed to load problem');
      } finally {
        setLoading(false);
      }
    };

    fetchProblemData();
  }, [id]);

  // language
  const languages = [
    { value: 'cpp', label: 'C++' },
    { value: 'java', label: 'Java' },
    { value: 'py', label: 'Python' },
    { value: 'js', label: 'JavaScript' }
  ];

  const leftTabs = [
    { id: 'Description', icon: FileText },
    { id: 'Editorial', icon: Lightbulb },
    { id: 'Submissions', icon: Code },
    { id: 'Discussion', icon: MessageSquare }
  ];

  const rightTabs = [
    { id: 'Code Editor', icon: Code },
    { id: 'Test Cases', icon: FileText },
    { id: 'Output', icon: Users }
  ];

  // Handle panel resizing
  const handleMouseDown = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isResizing || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    
    if (newWidth >= 20 && newWidth <= 80) {
      setLeftPanelWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  const handleRun = async () => {
    // send a req -> i.e. axios.post with language & code sampletestcase .... 
    // redirect only left part to Output (section) 
    // Show the output of that res from backend....
    try {
      const response = await axios.post(`${import.meta.env.VITE_COMPILER_URL}/run`, {
        language: selectedLanguage,
        code: code,
        // testcase : problem.testcase;   //sample testcase from problemschema
      });
  
      setOutputResult(response.data.output || "No output received.");
      setActiveRightTab('Output');
    } 
    catch (error) {
      setOutputResult(error.response?.data?.message || "Compilation error or server issue.");
      setActiveRightTab('Output');
    }
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'hard': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };


  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white' 
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900'
    }`}>
      {/* Header */}
      <header className={`flex items-center justify-between px-6 py-4 border-b ${
        isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white/50'
      } backdrop-blur-sm` } >

        {/* Logo */}
        <div className="flex items-center space-x-3 hover:cursor-pointer" onClick={() => navigate('/user')}>
          <img src="/logo_white.png" alt="AlgoArena Logo" className="w-10 h-10"/>
          <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            AlgoArena
          </span>
        </div>

        {/* Center - Countdown Timer */}
        <div className="hidden md:block">
          <CountdownTimer />
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">

           {/* Edit/Delete Icons (visible only for Admin) */}
           {isAdmin && (
            <div className="flex items-center space-x-4">
                <FaEdit
                  className="hover:text-blue-400 cursor-pointer"
                  title="Edit"
                  onClick={() => handleEdit(problemData._id)}
                />
                <FaTrash
                  className="hover:text-red-500 cursor-pointer"
                  title="Delete"
                  onClick={() => {
                    setSelectedProblemId(problemData._id);
                    setShowConfirmModal(true);
                  }}
                />
              </div>
            )}


          {/* Dark Mode Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
              isDarkMode ? 'bg-blue-600' : 'bg-yellow-400'
            }`}
          >
            <div className={`absolute top-0.5 w-5 h-5 rounded-full transition-all duration-300 flex items-center justify-center ${
              isDarkMode 
                ? 'left-0.5 bg-gray-800 text-blue-400' 
                : 'left-6 bg-white text-yellow-600'
            }`}>
              {isDarkMode ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
            </div>
          </button>

          {/* Download Code Button */}
          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download</span>
          </button>
          
         
          </div>
      </header>

      {/* Main Content */}
      <div 
        ref={containerRef}
        className="flex h-[calc(100vh-80px)] relative"
      >
        {/* Left Panel - Problem Details */}
        <div 
          className="flex flex-col overflow-hidden"
          style={{ width: `${leftPanelWidth}%` }}
        >
          {/* Left Tabs */}
          <div className={`flex border-b ${isDarkMode ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50/30'}`}>
            {leftTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveLeftTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeLeftTab === tab.id
                    ? isDarkMode
                      ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/10'
                      : 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : isDarkMode
                      ? 'text-gray-400 hover:text-gray-200'
                      : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.id}</span>
              </button>
            ))}
          </div>

          {/* Problem Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center space-y-4">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                  <p className="text-gray-400">Loading problem data...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center space-y-4 text-center">
                  <AlertCircle className="w-16 h-16 text-red-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-red-400 mb-2">Error Loading Problem</h3>
                    <p className="text-gray-400">{error}</p>
                  </div>
                </div>
              </div>
            ) : problemData && activeLeftTab === 'Description' ? (
              <>
                {/* Problem Title */}
                <div>
                  <h1 className="text-2xl font-bold mb-4">{problemData.title}</h1>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    {problemData.difficulty && (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(problemData.difficulty)}`}>
                        {problemData.difficulty}
                      </span>
                    )}
                    
                    {problemData.tags && problemData.tags.length > 0 && problemData.tags.map((tag, index) => (
                      <span key={index} className="flex items-center space-x-1 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs border border-purple-500/30">
                        <Tag className="w-3 h-3" />
                        <span>{tag}</span>
                      </span>
                    ))}
                    
                    {problemData.hints && problemData.hints.length > 0 && (
                      <span className="flex items-center space-x-1 px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs border border-amber-500/30">
                        <Lightbulb className="w-3 h-3" />
                        <span>Hint</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Problem Description */}
                {problemData.statement && (
                  <CollapsibleSection title="Problem Description">
                    <p className="leading-relaxed whitespace-pre-wrap">{problemData.statement}</p>
                  </CollapsibleSection>
                )}

                {/* Examples */}
                {problemData.examples && problemData.examples.length > 0 && (
                  <CollapsibleSection title="Examples">
                    {problemData.examples.map((example, index) => (
                      <div key={index} className="mb-4 last:mb-0">
                        <h4 className="font-semibold mb-2 text-blue-400">Example {index + 1}:</h4>
                        <div className="bg-gray-900/50 p-3 rounded border border-gray-600 font-mono text-sm space-y-2">
                          {example.input && (
                            <div><span className="text-green-400">Input:</span> {example.input}</div>
                          )}
                          {example.output && (
                            <div><span className="text-blue-400">Output:</span> {example.output}</div>
                          )}
                          {example.explanation && (
                            <div><span className="text-purple-400">Explanation:</span> {example.explanation}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </CollapsibleSection>
                )}

                {/* Constraints */}
                {problemData.constraints && problemData.constraints.length > 0 && (
                  <CollapsibleSection title="Constraints">
                    <ul className="space-y-1">
                      {problemData.constraints.map((constraint, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-blue-400 mt-1">•</span>
                          <code className="text-sm bg-gray-900/50 px-2 py-1 rounded">{constraint}</code>
                        </li>
                      ))}
                    </ul>
                  </CollapsibleSection>
                )}

                {/* Input Format */}
                {problemData.inputFormat && (
                  <CollapsibleSection title="Input Format">
                    <p className="font-mono text-sm bg-gray-900/50 p-3 rounded border border-gray-600 whitespace-pre-wrap">
                      {problemData.inputFormat}
                    </p>
                  </CollapsibleSection>
                )}

                {/* Output Format */}
                {problemData.outputFormat && (
                  <CollapsibleSection title="Output Format">
                    <p className="font-mono text-sm bg-gray-900/50 p-3 rounded border border-gray-600 whitespace-pre-wrap">
                      {problemData.outputFormat}
                    </p>
                  </CollapsibleSection>
                )}

                {/* Hints */}
                {problemData.hints && problemData.hints.length > 0 && (
                  <CollapsibleSection title="Hints" defaultOpen={false}>
                    <ul className="space-y-2">
                      {problemData.hints.map((hint, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <span className="text-amber-400 mt-1">💡</span>
                          <span>{hint}</span>
                        </li>
                      ))}
                    </ul>
                  </CollapsibleSection>
                )}
              </>
            ) : activeLeftTab === 'Description' && !problemData ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-400">No problem data available</p>
                </div>
              </div>
            ) : null}

            {activeLeftTab === 'Editorial' && (
              problemData.editorial && problemData.editorial.length > 0 ? (
                <div className='whitespace-pre-wrap'>{problemData.editorial}</div>
              ) : (
                <div className="text-center py-12">
                  <Lightbulb className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-400">Editorial will be available soon.</p>
                </div>
              )
            )}

            {/* {activeLeftTab === 'Submissions' && (
              condition ? ()
              : (<div className="text-center py-12">
                <Code className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-400">Your submissions will appear here.</p>
              </div>)
            )} */}
            {/* OR you can create a separate function too for the same and return the HTML with Tailwind.... */}

            {activeLeftTab === 'Submissions' && (
              <div className="text-center py-12">
                <Code className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-400">Your submissions will appear here.</p>
              </div>
            )}

            {activeLeftTab === 'Discussion' && (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-400">Join the discussion with other participants.</p>
              </div>
            )}
          </div>
        </div>

        {/* Resize Handle */}
        <div
          className={`w-1 cursor-col-resize transition-colors hover:bg-blue-500 ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
          } ${isResizing ? 'bg-blue-500' : ''}`}
          onMouseDown={handleMouseDown}
        />



        {/* Right Panel - Code Editor */}
        <div 
          className="flex flex-col overflow-hidden"
          style={{ width: `${100 - leftPanelWidth}%` }}
        >
          {/* Right Tabs */}
          <div className={`flex border-b ${isDarkMode ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50/30'}`}>
            {rightTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveRightTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeRightTab === tab.id
                    ? isDarkMode
                      ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/10'
                      : 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : isDarkMode
                      ? 'text-gray-400 hover:text-gray-200'
                      : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.id}</span>
              </button>
            ))}

             {/* Edit/Delete Icons (visible only for Admin) */}
              {/* {isAdmin && (
                <div className="flex items-center space-x-4 mr-0">
                  <FaEdit
                    className="hover:text-blue-400 cursor-pointer"
                    title="Edit"
                    onClick={() => handleEdit(problemData._id)}
                  />
                  <FaTrash
                    className="hover:text-red-500 cursor-pointer"
                    title="Delete"
                    onClick={() => {
                      setSelectedProblemId(problemData._id);
                      setShowConfirmModal(true);
                    }}
                  />
                </div>
              )} */}

          </div>


          {/* Editor Controls */}
          <div className={`flex items-center justify-between p-4 border-b ${
            isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50/50'
          }`}>
            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <div className="relative">
                <select
                  value={selectedLanguage}
                  onChange={(e) => {
                    const newLang = e.target.value;
                    setSelectedLanguage(newLang);
                    handleChangeLanguageToSetCode(newLang);
                  }}
                  className={`appearance-none px-3 py-2 pr-8 rounded-lg border text-sm font-medium cursor-pointer ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-gray-200'
                      : 'bg-white border-gray-300 text-gray-700'
                  }`}
                >
                  {languages.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none" />
              </div>

              {/* Reset Code Button */}
              <button className="flex items-center space-x-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors text-sm hover:cursor-pointer">
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Code Editor Area */}
          <div className="flex-1 p-4">
            {activeRightTab === 'Code Editor' && (
              <MonacoEditor
                value={code}
                onChange={setCode}
                language={selectedLanguage}
                theme={isDarkMode ? 'vs-dark' : 'vs-light'}
              />
            )}
            
            {activeRightTab === 'Test Cases' && (
              <div className={`h-full rounded-lg border ${
                isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
              } flex items-center justify-center`}>
                <p className="text-gray-400">Custom test cases will appear here</p>
              </div>
            )}

            {activeRightTab === 'Output' && (
              <div className={`h-full rounded-lg border ${
                isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
              } flex items-center justify-center`}>
                  <div className="w-full h-full p-4 bg-gray-900/50 rounded text-sm text-gray-100 font-mono whitespace-pre-wrap overflow-auto border border-gray-700">
                    {outputResult || "Click 'Run' to compile your code."}
                  </div>

              </div>
            )}

            
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end items-center space-x-3 p-4 border-t border-gray-700">
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm font-medium hover:cursor-pointer">
              <FileText className="w-4 h-4" />
              <span>Test Against Custom Input</span>
            </button>
            
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors text-sm font-medium hover:cursor-pointer" onClick={handleRun}>
              <Play className="w-4 h-4" />
              <span>Run</span>
            </button>
            
            <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-sm font-medium hover:cursor-pointer" >
              <Send className="w-4 h-4" />
              <span>Submit</span>
            </button>

            
          </div>

          
        </div>
        
      </div>
      {/* Confirm Modal */}
      <ConfirmDeleteModal
        visible={showConfirmModal}
        message="Are you sure you want to delete this problem? This action cannot be undone."
        onCancel={() => {
          setShowConfirmModal(false);
          setSelectedProblemId(null);
        }}
        onConfirm={async () => {
          if (selectedProblemId) {
            await handleDelete(selectedProblemId);
            setShowConfirmModal(false);
            setSelectedProblemId(null);
          }
        }}
      />
    </div>
  );
};

export default ProblemPage;