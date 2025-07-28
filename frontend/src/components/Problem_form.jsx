import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProblemForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
 

  const [problemData, setProblemData] = useState({
    title: '',
    statement: '',
    difficulty: '',
    tags: '',
    editorial: '',
    constraints: '',
    inputFormat: '',
    outputFormat: '',
    sampleTestcases: [{ input: '', expectedOutput: '', explanation: '' }],
    hiddenTestcases: [{ input: '', expectedOutput: '' }],
    images: '',
    hints: '',
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      const fetchProblem = async () => {
        try {
          const res = await axios.get(`${import.meta.env.VITE_URL}/admin/problem-form/${id}`, {
            withCredentials: true, // ✅ important
          });
          const fetched = res.data;
          console.log("Fetched Problem Data:", fetched);
          console.log("Fetched Problem Data:", fetched.hiddenTestcases);
          
          // Convert hiddenTestcases from Mongoose documents to plain JS objects
          const hiddenTestcases = (fetched.hiddenTestcases || []).map(tc => ({
            input: tc.input || '',
            expectedOutput: tc.expectedOutput || '',
          }));
          
          setProblemData({
            title: fetched.title || '',
            statement: fetched.statement || '',
            difficulty: fetched.difficulty || '',
            tags: fetched.tags?.join(', ') || '',
            editorial: fetched.editorial || '',
            constraints: fetched.constraints?.join(', ') || '',
            inputFormat: fetched.inputFormat || '',
            outputFormat: fetched.outputFormat || '',
            sampleTestcases: fetched.sampleTestcases?.length
            ? fetched.sampleTestcases
            : [{ input: '', expectedOutput: '', explanation: '' }],
          hiddenTestcases: hiddenTestcases?.length
            ? hiddenTestcases
            : [{ input: '', expectedOutput: '' }],
            images: fetched.images?.join(', ') || '',
            hints: fetched.hints?.join(', ') || '',
          });
        } 
        catch (err) {
          console.error("Error fetching problem:", err);
          toast.error("Failed to fetch problem.");
        }
      };
      fetchProblem();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProblemData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

    // Sample testcases handlers
  const addSampleTestcase = () => {
    setProblemData(prev => ({
      ...prev,
      sampleTestcases: [...prev.sampleTestcases, { input: '', expectedOutput: '', explanation: '' }]
    }));
  };

  const updateSample = (index, field, value) => {
    const updated = [...problemData.sampleTestcases];
    updated[index][field] = value;
    setProblemData(prev => ({ ...prev, sampleTestcases: updated }));
  };

  // Hidden testcases handlers
  const addHiddenTestcase = () => {
    setProblemData(prev => ({
      ...prev,
      hiddenTestcases: [...prev.hiddenTestcases, { input: '', expectedOutput: '' }]
    }));
  };

  const updateHidden = (index, field, value) => {
    const updated = [...problemData.hiddenTestcases];
    updated[index][field] = value;
    setProblemData(prev => ({ ...prev, hiddenTestcases: updated }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formattedData = {
      ...problemData,
      tags: problemData.tags.split(',').map(tag => tag.trim()),
      images: problemData.images.split(',').map(img => img.trim()),
      constraints: problemData.constraints.split(',').map(constraint => constraint.trim()).filter(constraint => constraint.length > 0),
      hints: problemData.hints.split(',').map(hint => hint.trim()).filter(hint => hint.length > 0),
      sampleTestcases: problemData.sampleTestcases,
      hiddenTestcases: problemData.hiddenTestcases,
    };

    try {
      console.log("Hello");
      if (isEditMode) {
        await axios.put(`${import.meta.env.VITE_URL}/admin/problem-form/${id}`, formattedData, {
          withCredentials: true, // important
        });
        toast.success("Problem updated successfully!");
      } 
      
      else {
        console.log("Inside Problem created Block")
        await axios.post(`${import.meta.env.VITE_URL}/admin/problem-form`, formattedData, {
          withCredentials: true, // important
        });
        toast.success("Problem created successfully!");
      }

      setTimeout(() => navigate("/problemlist"), 1500);
    } 
    
    catch (err) {
      console.error("Error while submitting problem:", err);
      toast.error("Submission failed!");
    } 
    finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[#0f172a] text-white px-4 py-10 dark">
        <ToastContainer />
        <div className="max-w-4xl mx-auto bg-[#1e293b] p-8 md:p-10 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold mb-2">{isEditMode ? "Update Problem" : "Create Problem"}</h2>
          <p className="text-gray-400 mb-8">{isEditMode ? "Make Changes to the Problem" : "Add a new coding problem to the platform"}</p>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* TITLE */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-2">Problem Title <span className="text-red-400">*</span></label>
              <input
                name="title"
                value={problemData.title}
                onChange={handleChange}
                placeholder="Enter problem title"
                required
                className="p-3 rounded-md bg-[#334155] border border-[#475569] placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* STATEMENT */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-2">Problem Statement <span className="text-red-400">*</span></label>
              <textarea
                name="statement"
                value={problemData.statement}
                onChange={handleChange}
                placeholder="Describe the problem in detail"
                rows={4}
                required
                className="p-3 rounded-md bg-[#334155] border border-[#475569] placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Sample Testcases */}
            <div>
              <label className="text-sm font-semibold mb-2 block">Sample Testcases <span className="text-red-400">*</span></label>
              {problemData.sampleTestcases.map((tc, idx) => (
                <div key={idx} className="mb-4 space-y-2">
                  <textarea
                    placeholder="Input"
                    value={tc.input}
                    onChange={e => updateSample(idx, 'input', e.target.value)}
                    required
                    className="w-full p-2 rounded bg-[#334155] border border-[#475569] text-white"
                  />
                  <textarea
                    placeholder="Expected Output"
                    value={tc.expectedOutput}
                    onChange={e => updateSample(idx, 'expectedOutput', e.target.value)}
                    required
                    className="w-full p-2 rounded bg-[#334155] border border-[#475569] text-white"
                  />
                  <textarea
                    placeholder="Explanation"
                    value={tc.explanation}
                    onChange={e => updateSample(idx, 'explanation', e.target.value)}
                    className="w-full p-2 rounded bg-[#334155] border border-[#475569] text-white"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addSampleTestcase}
                className="text-emerald-400 hover:underline cursor-pointer"
              >
                + Add Sample Testcase
              </button>
            </div>

            {/* Hidden Testcases */}
            <div>
              <label className="text-sm font-semibold mb-2 block">Hidden Testcases <span className="text-red-400">*</span></label>
              {problemData.hiddenTestcases.map((tc, idx) => (
                <div key={idx} className="mb-4 space-y-2">
                  <textarea
                    placeholder="Input"
                    value={tc.input}
                    onChange={e => updateHidden(idx, 'input', e.target.value)}
                    required
                    className="w-full p-2 rounded bg-[#334155] border border-[#475569] text-white"
                  />
                  <textarea
                    placeholder="Expected Output"
                    value={tc.expectedOutput}
                    onChange={e => updateHidden(idx, 'expectedOutput', e.target.value)}
                    required
                    className="w-full p-2 rounded bg-[#334155] border border-[#475569] text-white"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addHiddenTestcase}
                className="text-emerald-400 hover:underline cursor-pointer"
              >
                + Add Hidden Testcase
              </button>
            </div>


            {/* INPUT + OUTPUT FORMAT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-semibold mb-2">Input Format</label>
                <input
                  name="inputFormat"
                  value={problemData.inputFormat}
                  onChange={handleChange}
                  placeholder="Describe input format"
                  className="p-3 rounded-md bg-[#334155] border border-[#475569] placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-semibold mb-2">Output Format</label>
                <input
                  name="outputFormat"
                  value={problemData.outputFormat}
                  onChange={handleChange}
                  placeholder="Describe output format"
                  className="p-3 rounded-md bg-[#334155] border border-[#475569] placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* DIFFICULTY + CONSTRAINTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-semibold mb-2">Difficulty Level <span className="text-red-400">*</span></label>
                <select
                  name="difficulty"
                  value={problemData.difficulty}
                  onChange={handleChange}
                  required
                  className="p-3 rounded-md bg-[#334155] border border-[#475569] text-white focus:outline-none"
                >
                  <option value="">Select Difficulty</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-semibold mb-2">Constraints <span className="text-red-400">*</span></label>
                <input
                  name="constraints"
                  value={problemData.constraints}
                  onChange={handleChange}
                  placeholder="e.g., 1 ≤ n ≤ 10^5 (comma separated)"
                  required
                  className="p-3 rounded-md bg-[#334155] border border-[#475569] placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>


            {/* TAGS */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold mb-2">Tags</label>
                <input
                  name="tags"
                  value={problemData.tags}
                  onChange={handleChange}
                  placeholder="array, sorting, dynamic programming (comma separated)"
                  className="p-3 rounded-md bg-[#334155] border border-[#475569] placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* EDITORIAL */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold mb-2">Editorial/Solution</label>
                <textarea
                  name="editorial"
                  value={problemData.editorial}
                  onChange={handleChange}
                  placeholder="Explain the solution approach"
                  rows={4}
                  className="p-3 rounded-md bg-[#334155] border border-[#475569] placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              
            {/* IMAGES */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold mb-2">Image URLs</label>
                <input
                  name="images"
                  value={problemData.images}
                  onChange={handleChange}
                  placeholder="https://example.com/image1.png, https://example.com/image2.png"
                  className="p-3 rounded-md bg-[#334155] border border-[#475569] placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* HINTS */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold mb-2">Hints</label>
                <input
                  name="hints"
                  value={problemData.hints}
                  onChange={handleChange}
                  placeholder="Helpful hints for solving (comma separated)"
                  className="p-3 rounded-md bg-[#334155] border border-[#475569] placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-md text-white font-semibold bg-emerald-600 hover:bg-emerald-700 transition-all hover:cursor-pointer duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Submitting...' : isEditMode ? "Update Problem" : "Create Problem"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ProblemForm;
