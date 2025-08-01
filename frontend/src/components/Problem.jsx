import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Moon, Sun, Download, Timer, Play, Send, RotateCcw, ChevronDown, ChevronRight, Tag, Clock, Lightbulb, Code, FileText, Users, MessageSquare, Loader2, AlertCircle } from 'lucide-react';

import ConfirmDeleteModal from '../components/ConfirmDeleteModal'; // Adjust path if needed

import { useParams, useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaArrowRight } from 'react-icons/fa';
import Editor from "@monaco-editor/react";
import MarkdownRenderer from './MarkdownRenderer'

import Navbar from './Navbar';
import useLogout from '../hooks/useLogout';


// Countdown Timer Component
// const CountdownTimer = ({ targetTime = "2024-12-31T23:59:59" }) => {
//   const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

//   useEffect(() => {
//     const timer = setInterval(() => {
//       const now = new Date().getTime();
//       const target = new Date(targetTime).getTime();
//       const difference = target - now;

//       if (difference > 0) {
//         setTimeLeft({
//           hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
//           minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
//           seconds: Math.floor((difference % (1000 * 60)) / 1000)
//         });
//       }
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [targetTime]);

//   return (
//     <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-4 py-2 rounded-lg border border-blue-500/30">
//       <Timer className="w-4 h-4 text-blue-400" />
//       <span className="text-sm font-mono text-blue-300">
//         {String(timeLeft.hours).padStart(2, '0')}:
//         {String(timeLeft.minutes).padStart(2, '0')}:
//         {String(timeLeft.seconds).padStart(2, '0')}
//       </span>
//     </div>
//   );
// };

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


  const [isDarkMode, setIsDarkMode] =   useState(true);
  const [leftPanelWidth, setLeftPanelWidth] = useState(50);
  const [activeLeftTab, setActiveLeftTab] = useState('Description');
  const [activeRightTab, setActiveRightTab] = useState('Code Editor');
  const [selectedLanguage, setSelectedLanguage] = useState('cpp');

  const [customInput, setCustomInput] = useState('');
  const [submissions, setSubmissions] = useState([]);

  const [isError, setIsError] = useState(false);

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
  
  const defaultCodes = {
    cpp: `#include <iostream>
using namespace std;
  
int main() {

      cout << "Hello, World!" << endl;

  return 0;
}`,
    java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
      System.out.println("Hello, World!");
  }
}`,
  py: `print("Hello, World!")`,
  // js: `console.log("Hello, World!");`,
  
  };

  // Expandable Submission - In short Showing more info about a Submission...
  const [expandedSubmission, setExpandedSubmission] = useState(null);
  const [aiRecommendations, setAiRecommendations] = useState({});
  const [loadingAI, setLoadingAI] = useState({});
  const [fixedEditorial, setFixedEditorial] = useState(); 

  const hintRef = useRef(null);
  const [openHints, setOpenHints] = useState(false);
  
  const scrollToHints = () => {
    setOpenHints(true);              // ensure it’s open
    setTimeout(() => {
        hintRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);                        
  };

  const [isAuthenticated, setIsAuthenticated] = useState(true); // Assuming user is authenticated to view problem
  const { logout } = useLogout();

  const handleLogout = async () => {
  const result = await logout();
  if (result.success) {
    // Clear any component-specific state if needed
    setSubmissions([]);
    setAiRecommendations({});
    // Navigate to home or login page
    navigate('/');
  }
};


  const handleChangeLanguageToSetCode = (lang) => {
    setCode(defaultCodes[lang] || "//Write your Code here...");
  };

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

          // For editorial --> To show it on frontend properly....
          setFixedEditorial(response.data.problem.editorial.replace(/\\n/g, '\n').replace(/\\t/g, '\t'))
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


  // To fetch the problem submissions when the user is visiting the problem
  useEffect(() => {
  const fetchSubmissions = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_COMPILER_URL}/submissions`,
        {
          params: { problemId }, // send problemId as query param
          withCredentials: true,
        }
      );

      console.log("Fetched submissions:", res.data.submissions);

      const loadedSubmissions = res.data.submissions.map((s) => ({
        verdict: s.verdict,
        language: s.language,
        time: new Date(s.createdAt).toLocaleString(),
        status: s.verdict === 'Accepted' ? 'success' : 
                s.verdict === 'Wrong Answer' ? 'error' : 'warning',
        failedTestCase: s.failedTestCases?.[0] || null,
        submittedCode: s.code || '',
      }));

      setSubmissions(loadedSubmissions);
    } catch (err) {
      console.error("Error fetching submissions:", err);
    }
  };

  fetchSubmissions();
}, [problemId]);

  

  // language
  const languages = [
    { value: 'cpp', label: 'C++' },
    { value: 'java', label: 'Java' },
    { value: 'py', label: 'Python' },
    // { value: 'js', label: 'JavaScript' }
  ];

  //Mapping from your values to Monaco's language IDs:
  const monacoLanguageMap = {
  cpp: 'cpp',
  java: 'java',
  py: 'python',
  // js: 'javascript'
};

  const leftTabs = [
    { id: 'Description', icon: FileText },
    { id: 'Editorial', icon: Lightbulb },
    { id: 'Submissions', icon: Code },
    { id: 'Discussion', icon: MessageSquare }
  ];

  const rightTabs = [
    { id: 'Code Editor', icon: Code },
    { id: 'Custom Test Case', icon: FileText },
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

  const handleEdit = (id) => {
    // Get Req -> Form fill -> changes admin -> Click update -> PUT Req (Updates the data in DB) 
    navigate(`/admin/problem-form/${id}`);
  }

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`${import.meta.env.VITE_URL}/admin/problem/${id}`, {
        withCredentials: true,
      });

      toast.success("Problem deleted successfully!", {
        autoClose: 1000,
      });

      setTimeout(() => {
      navigate('/problemlist');
    }, 1200); 

    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete problem");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `solution.${selectedLanguage}`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const handleRun = async () => {
    // send a req -> i.e. axios.post with language, code & sampletestcase .... 
    // redirect only left part to Output (section) 
    // Show the output of that res from backend....
    try {
      setIsError(false);
      setActiveRightTab('Output');
      setOutputResult("Running...");

      const inputs = problemData.sampleTestcases.map(tc => ({
        input: tc.input,
        expectedOutput: tc.expectedOutput,  // backend expects this field
      }));

      console.log("Inputs for run:", inputs);
      // console.log(customInput);
      
      console.log(JSON.stringify(customInput))    // convert nextline --> \n

      const response = await axios.post(`${import.meta.env.VITE_COMPILER_URL}/run`, {
        language: selectedLanguage,
        code: code,
        inputs: (customInput && customInput.trim()) ?  [{ input: customInput }] : inputs,
      });

      if (response.data.sampleTestcaseOutput) {
        setOutputResult(response.data.sampleTestcaseOutput);
        console.log("Test case verdict : ", response.data.sampleTestcaseOutput);
      } else {
        setOutputResult("No verdicts received.");
      } 
    } catch (error) {
      setIsError(true);
      console.log(error)
      setOutputResult(error?.response?.data?.message || "Compilation error or server issue.");

    }
  };


  const handleCustomTestcase = async () => {
    setActiveRightTab('Custom Test Case');
  }


const handleSubmit = async () => {
  console.log("Starting submission...");
  
  setActiveLeftTab('Submissions');

  const oldSubs = submissions;

  setSubmissions([
    {
      verdict: "Running on Hidden Testcases...",
      language: selectedLanguage,
      status: "loading",            
      time: new Date().toLocaleString(),
      failedTestCase: null,
      isLoader: true            
    }
  ]);

  try {
    const { data: result } = await axios.post(
      `${import.meta.env.VITE_COMPILER_URL}/submit`,
      { language: selectedLanguage, code, problemId },
      { withCredentials: true }
    );

    console.log("Submission result:", result);

    setAiRecommendations({});
    
    const newSubmission = {
      verdict: result.verdict,
      language: result.language || selectedLanguage,
      failedTestCase: result.failedTestCase || null,
      time: new Date(result.timestamp || Date.now()).toLocaleString(),
      status:
        result.verdict === 'Accepted' ? 'success' :
        result.verdict === 'Wrong Answer' ? 'error' :
        'warning',
      submittedCode: code
    };

   console.log("New submission:", newSubmission);
    setSubmissions([ newSubmission, ...oldSubs ]);

  } catch (error) {
    console.error("Submit error:", error);

    const errorSubmission = {
      // verdict: error.response?.data?.message || error.message || "Submission Error",
      verdict: "Time limit exit",
      language: selectedLanguage,
      status: 'error',
      time: new Date().toLocaleString(),
      failedTestCase: null,
      submittedCode: code,
    };

    setSubmissions([ errorSubmission, ...oldSubs ]);
  }
};

// AI recommendation 
const handleAIRecommendation = async (submissionIndex) => {
  const submission = submissions[submissionIndex];
  
  // Prevent multiple clicks
  if (loadingAI[submissionIndex] || aiRecommendations[submissionIndex]) {
    return;
  }

  setLoadingAI(prev => ({ ...prev, [submissionIndex]: true }));

  try {
    console.log("Hello, Inside the AI_recommendation try block");
    console.log(submission);
    console.log(problemData);

    const response = await axios.post(`${import.meta.env.VITE_URL}/user/ai-recommendation`, {
      problemData,
      submission: {
        code: submission.submittedCode, 
        verdict: submission.verdict,
        language: submission.language,
        failedTestCase: submission.failedTestCase
      }
    }, {
      withCredentials: true
    });

    setAiRecommendations(prev => ({
      ...prev,
      [submissionIndex]: response.data.aiResponse
    }));
  } 
  catch (error) {
    console.error('Error getting AI recommendation:', error);

    const errorMessage = error?.response?.data?.message || 'Sorry, AI recommendation is currently unavailable. Please try again later.';
    
    setAiRecommendations(prev => ({
      ...prev,
      [submissionIndex]: errorMessage,
    }));
  } 
  finally {
    setLoadingAI(prev => ({ ...prev, [submissionIndex]: false }));
  }
};

// Used for resizing the window...
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


      {/* Navbar */}
      <Navbar 
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        onNavigate={navigate}
      />

      {/* Main Content */}
      <div 
        ref={containerRef}
        className="flex h-[calc(100vh-64px)] relative border-t-2 border-gray-700"
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
                      ? 'text-gray-400 hover:text-gray-200 cursor-pointer'
                      : 'text-gray-600 hover:text-gray-900 cursor-pointer'
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
                      <span className="flex items-center space-x-1 px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs border border-amber-500/30 hover:cursor-pointer"
                      onClick={scrollToHints}
                      >
                        <Lightbulb className="w-3 h-3" />
                        <span >Hint</span>
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

                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                {/* Examples - Sample Test cases  */}
                <CollapsibleSection title="Examples">
                {problemData.sampleTestcases.map((sampleTestcase, index) => (
                  <div key={index} className="mb-6">
                    <h4 className="font-semibold mb-2 text-blue-400">Example {index + 1}</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                      {/* Input */}
                      <div>
                        <h5 className="text-gray-300 mb-1">Input:</h5>
                        <pre className="bg-gray-800 p-3 rounded border border-gray-600 bg-gray-900/50 text-white whitespace-pre-wrap font-mono text-sm">
                          {sampleTestcase.input}
                        </pre>
                      </div>

                      {/* Output */}
                      <div>
                        <h5 className="text-gray-300 mb-1">Output:</h5>
                        <pre className="bg-gray-800 p-3 rounded border border-gray-600 bg-gray-900/50 text-white whitespace-pre-wrap font-mono text-sm">
                          {sampleTestcase.expectedOutput}
                        </pre>
                      </div>
                    </div>

                    {/* Explanation */}
                    {sampleTestcase.explanation && (
                      <div className="mt-4">
                        <h5 className="text-gray-300 mb-1">Explanation:</h5>
                        <div className="bg-gray-800 p-3 rounded border border-gray-600 bg-gray-900/50 text-white font-mono text-sm">
                          {sampleTestcase.explanation}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CollapsibleSection>

  

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


                {/* Hints */}
                {problemData.hints && problemData.hints.length > 0 && (
                  <div ref={hintRef} className="mt-4">
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
                  </div>
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
                // <div className='whitespace-pre-wrap'>{problemData.editorial}</div>
                // <MarkdownRenderer content={problemData.editorial} />
              
                <MarkdownRenderer content={fixedEditorial} />
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
            {/* OR we can create a separate function too for the same and return the HTML with Tailwind.... */}

            {/* Submissions  */}
              {activeLeftTab === 'Submissions' && (
                <div className="space-y-4">
                  {submissions.length === 0 ? (
                    <div className="text-center py-12">
                      <Code className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-400">Your submissions will appear here.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-gray-200 mb-4">
                        Recent Submissions ({submissions.length})
                      </h3>
                      
                      {/* Actual submissions are shown here with Ai recommendation */}
                      {submissions.map((submission, index) => (
  <div
    key={index}
    className={`rounded-lg border transition-all duration-200 ${
      submission.status === 'success'
        ? 'bg-green-900/20 border-green-500/30'
        : submission.status === 'error'
        ? 'bg-red-900/20 border-red-500/30'
        : 'bg-yellow-900/20 border-yellow-500/30'
    }`}
  >
    {/* Main submission card - clickable */}
    <div
      className={`p-4 cursor-pointer transition-all duration-200 ${
        expandedSubmission === index ? 'rounded-t-lg' : 'rounded-lg hover:bg-opacity-40'
      } ${
        submission.status === 'success'
          ? 'hover:bg-green-900/30'
          : submission.status === 'error'
          ? 'hover:bg-red-900/30'
          : 'hover:bg-yellow-900/30'
      }`}
      onClick={() => setExpandedSubmission(expandedSubmission === index ? null : index)}
    >
      
      {/* Header with verdict and language */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          {/* {console.log(submission)} */}

          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              submission.status === 'success'
                ? 'bg-green-500/20 text-green-400'
                : submission.status === 'error'
                ? 'bg-red-500/20 text-red-400'
                : 'bg-yellow-500/20 text-yellow-400'
            }`}
          >
            {submission.verdict}
          </span>
          
          <span className="px-2 py-1 bg-gray-700/50 text-gray-300 rounded text-xs">
            {submission.language.toUpperCase()}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            <span>{submission.time}</span>
          </div>
          
          {/* Expand/Collapse indicator */}
          {expandedSubmission === index ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* Success indicator for accepted solutions */}
      {submission.status === 'success' && (
        <div className="flex items-center text-green-400 text-xs">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
          All test cases passed successfully!
        </div>
      )}
    </div>

    {/* Expandable details section */}
    {expandedSubmission === index && (
      <div className="border-t border-gray-600 bg-gray-800/30 rounded-b-lg">
        {/* Submission Details */}
        <div className="p-4 space-y-4">
          {/* Stats Section */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-700/30 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-400 mb-1">Language</div>
              <div className="text-sm font-semibold text-white">
                {submission.language.toUpperCase()}
              </div>
            </div>
            <div className="bg-gray-700/30 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-400 mb-1">Execution Time</div>
              <div className="text-sm font-semibold text-white">N/A</div>
            </div>
            <div className="bg-gray-700/30 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-400 mb-1">Memory Used</div>
              <div className="text-sm font-semibold text-white">N/A</div>
            </div>
          </div>

          {/* Failed Test Case Details */}
          {submission.failedTestCase && (
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 text-red-400" />
                Failed on Test Case
              </h4>
              
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-gray-400 mb-1">Input</div>
                  <pre className="bg-gray-900/50 p-3 rounded text-gray-100 text-xs font-mono overflow-x-auto">
{submission.failedTestCase?.input}</pre>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-red-400 mb-1">Your Output</div>
                    <pre className="bg-gray-900/50 p-3 rounded text-red-400 text-xs font-mono overflow-x-auto">
{submission.failedTestCase?.output}</pre>
                  </div>
                  
                  <div>
                    <div className="text-xs text-green-400 mb-1">Expected Output</div>
                    <pre className="bg-gray-900/50 p-3 rounded text-green-400 text-xs font-mono overflow-x-auto">
{submission.failedTestCase?.expected || submission.failedTestCase?.expectedOutput}</pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Recommendation Section - Now available for all submissions */}
          <div className="space-y-3">
            {!aiRecommendations[index] && !loadingAI[index] && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAIRecommendation(index);
                }}
                className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium text-white hover:cursor-pointer ${
                  submission.status === 'success'
                    ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                }`}
              >
                <Lightbulb className="w-4 h-4" />
                <span>
                  {submission.status === 'success' ? 'Get Code Insights' : 'Get AI Recommendation'}
                </span>
              </button>
            )}

            {loadingAI[index] && (
              <div className="flex items-center justify-center space-x-2 px-4 py-3 bg-gray-700/50 rounded-lg">
                <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                <span className="text-sm text-gray-300">
                  {submission.status === 'success' ? 'Analyzing your code...' : 'Getting AI recommendation...'}
                </span>
              </div>
            )}

            {aiRecommendations[index] && (
              <div className={`border rounded-lg p-4 ${
                submission.status === 'success'
                  ? 'bg-green-900/20 border-green-500/30'
                  : 'bg-blue-900/20 border-blue-500/30'
              }`}>
                <h4 className={`text-sm font-semibold mb-2 flex items-center ${
                  submission.status === 'success' ? 'text-green-400' : 'text-blue-400'
                }`}>
                  <Lightbulb className="w-4 h-4 mr-2" />
                  {submission.status === 'success' ? 'Code Analysis:' : 'AI Tutor says:'}
                </h4>
                {/* <div className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
                  {aiRecommendations[index]}
                </div> */}

                <MarkdownRenderer content={aiRecommendations[index]} />
              </div>
            )}
          </div>

          {/* Submitted Code Section - Using Monaco Editor */}
          <div className="bg-gray-800/50 rounded-lg border border-gray-600 overflow-hidden">
            <h4 className="text-sm font-semibold text-white px-4 py-3 bg-gray-700/50 border-b border-gray-600 flex items-center">
              <Code className="w-4 h-4 mr-2 text-blue-400" />
              Submitted Code
              <span className="ml-auto text-xs text-gray-400 bg-gray-600 px-2 py-1 rounded">
                {submission.language.toLowerCase()}
              </span>
            </h4>
            
            {/* Monaco Editor for submitted code */}
            <div className="h-80">
              <Editor
                height="100%"
                defaultLanguage={submission.language.toLowerCase()}
                theme="vs-dark"
                value={submission.submittedCode || '// Code not available'}
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  readOnly: true,
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  lineNumbers: 'on',
                  folding: false,
                  glyphMargin: false,
                  contextmenu: false,
                  selectOnLineNumbers: false,
                  automaticLayout: true,
                  padding: {
                    top:10,
                    bottom:10,
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
))}
                      
                    </div>
                  )}
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
                      ? 'text-gray-400 hover:text-gray-200 cursor-pointer'
                      : 'text-gray-600 hover:text-gray-900 cursor-pointer'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.id}</span>
              </button>
            ))}

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
              <button className="flex items-center space-x-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors text-sm hover:cursor-pointer" onClick={() => {setCode(defaultCodes[selectedLanguage])} }>
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>

            {/* Right side buttons */}
            <div className="flex items-center space-x-3">
              {/* Download Code Button */}
              <button 
                className="flex items-center space-x-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors text-sm hover:cursor-pointer" 
                onClick={handleDownload}
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download</span>
              </button>

              {/* Edit/Delete Icons (visible only for Admin) */}
              {isAdmin && problemData && (
                <div className="flex items-center space-x-3 pl-3 border-l border-gray-600">
                  <button
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors hover:text-blue-400 cursor-pointer"
                    title="Edit Problem"
                    onClick={() => handleEdit(problemData._id)}
                  >
                    <FaEdit className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors hover:text-red-500 cursor-pointer"
                    title="Delete Problem"
                    onClick={() => {
                      setSelectedProblemId(problemData._id);
                      setShowConfirmModal(true);
                    }}
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Code Editor Area */}
          <div className="flex-1 p-4">
              {activeRightTab === 'Code Editor' && (
                <Editor
                height="100%"
                defaultLanguage={monacoLanguageMap[selectedLanguage]}
                theme={isDarkMode ? "vs-dark" : "vs-light"}
                value={code}
                onChange={(value) => setCode(value)}
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  padding: {
                    top:10,
                    bottom:10,
                  }
                }}
                className='' />              
              )}
              
              {activeRightTab === 'Custom Test Case' &&
                <div className={`flex flex-col h-full p-4 rounded-lg border ${
                    isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
                  }`}>
                  <label className="mb-2 text-sm font-medium">Custom Input:</label>
                  <textarea
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    className={`flex-1 p-2 resize-none rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-100' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } font-mono text-sm`}
                    placeholder="Enter your custom test input here..."
                  />
                </div>
              }


               {activeRightTab === 'Output' && (
                <div
                  className={`h-full rounded-lg border ${
                    isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
                  } p-4 overflow-y-auto space-y-4 max-h-[70vh]`} // Added max height and scroll
                >
                  {isError ? (
                    <div className="text-red-500 font-mono whitespace-pre-wrap">
                      {outputResult || "An unexpected error occurred."}
                    </div>
                  ) : Array.isArray(outputResult) && outputResult.length > 0 ? (
                    outputResult.map((test, index) => (
                      <div
                        key={index}
                        className={`rounded-lg p-4 border ${
                          test.verdict === 'Wrong Answer'
                            ? 'border-red-500 bg-red-100/10'
                            : 'border-green-500 bg-green-100/10'
                        }`}
                      >
                        <div className="text-sm text-gray-400 mb-2">
                          Test Case {index + 1} -
                          <span
                            className={`ml-2 font-bold ${
                               test.verdict === 'Wrong Answer'
                            ? 'text-red-400'
                            : 'text-green-400'
                            }`}
                          >
                            {test.verdict}
                          </span>
                        </div>
                        <div className="font-mono text-xs whitespace-pre-wrap text-white">
                          <strong>Input:</strong> {"\n" + test.input.trim()}
                          {"\n\n"}
                          <strong>Expected Output:</strong> {"\n" + test.expectedOutput.trim()}
                          {"\n\n"}
                          <strong>Your Output:</strong> {"\n" + test.output.trim()}
                        </div>
                      </div>
                    ))
                  ) : outputResult ? (
                    <div className="text-white font-mono">{outputResult}</div>
                  ) : (
                    <div className="text-gray-400 italic text-sm text-center">
                      {/* Compile and run your code to see the output. */}
                      Click "Run" to see the output of your code.
                    </div>
                  )}
                </div>
              )}


           

          </div>

          {/* Action Buttons */}
          <div className="flex justify-end items-center space-x-3 p-4 border-t border-gray-700">
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm font-medium hover:cursor-pointer"  onClick={handleCustomTestcase}>
              <FileText className="w-4 h-4" />
              <span>Custom Input</span>
            </button>
            
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors text-sm font-medium hover:cursor-pointer" onClick={handleRun}>
              <Play className="w-4 h-4" />
              <span>Run</span>
            </button>
            
            <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-sm font-medium hover:cursor-pointer" onClick={handleSubmit}>
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
        onConfirm={ async () => {
          if (selectedProblemId) {
            setShowConfirmModal(false);
            await handleDelete(selectedProblemId);
            
            // setSelectedProblemId(null);
          }
        }}
      />
    </div>
  );
};

export default ProblemPage;



// New Code : 
