import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

import ConfirmDeleteModal from './ConfirmDeleteModal'; 
import Navbar from './Navbar';
import useLogout from '../hooks/useLogout';
import { toast } from 'react-toastify';


const ProblemList = () => {
  const navigate = useNavigate();
  const { logout } = useLogout();
  const [problems, setProblems] = useState([]);
  const [userRole, setUserRole] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedProblemId, setSelectedProblemId] = useState(null);

  const handleClick = (id) => {
    navigate(`/problemlist/${id}`);
  }

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
        autoClose: 1500,
      });

      // Refresh the problem list without reloading
      setProblems(prev => prev.filter(problem => problem._id !== id));
    } catch (error) {
      toast.error("Failed to delete problem");
      console.error("Delete error:", error);
    }
  };


  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_URL}/user/problemlist`, {
          withCredentials: true,
        });

        setProblems(response.data.problemDetails || []);
        console.log(response.data.problemDetails);
        setUserRole(response.data.role || '');
      } catch (error) {
        if (error.response && error.response.status === 401) {
          toast.error("User is Not Logged In! Please login first");
          
        navigate("/login");
        } 
        else {
          console.error("Failed to fetch problems:", error);
          toast.error("Failed to fetch Problems")
        }
      }
    };

    fetchProblems();
  }, []);

  const isAdmin = userRole === 'ADMIN';

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      // Clear local user state
      setUserRole('');
    }
  };

  return (

    <>

    <Navbar 
      isAuthenticated={!!userRole}
      onLogout={handleLogout}
      onNavigate={navigate}
    />

    <div className="min-h-screen pt-16 bg-gradient-to-b from-[#0d1117] via-[#161b22] to-[#1f2937]  text-white px-4 py-6">
     

      {/* Page Heading */}
      <h1 className="text-3xl sm:text-4xl font-semibold text-center mt-4 mb-10 bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text">
        Choose Quality over Quantity
      </h1>

      {/* Centered Container for Cards */}
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        {problems.map((problem, index) => (
          <div
            key={index}
            className="bg-[#1f2937] rounded-xl px-6 py-4 shadow-md flex justify-between items-center group transition duration-300 hover:scale-[1.01] hover:cursor-pointer"
          >
            {/* Left Side: Title, Tags, Difficulty */}
            <div className="flex-1 grid grid-cols-3 gap-4" onClick={() => handleClick(problem._id)}>
              <div className="flex items-center font-semibold text-blue-400 truncate">
                {index + 1}. {problem.title}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {problem.tags?.map((tag, i) => (
                  <span
                    key={i}
                    className="text-xs bg-blue-600 bg-opacity-30 text-blue-300 px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center">
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    problem.difficulty === 'Easy'
                      ? 'bg-green-600 bg-opacity-30 text-green-300'
                      : problem.difficulty === 'Medium'
                      ? 'bg-yellow-600 bg-opacity-30 text-yellow-300'
                      : 'bg-red-600 bg-opacity-30 text-red-300'
                  }`}
                >
                  {problem.difficulty}
                </span>
              </div>
            </div>

            {/* Right Side: Icons */}
            <div className="flex items-center space-x-4 ml-6">
              {isAdmin && (
                <>
                  <FaEdit
                    className="hover:text-blue-400"
                    title="Edit"
                    onClick={() => handleEdit(problem._id)}
                  />
                  <FaTrash
                    className="hover:text-red-500"
                    title="Delete"
                    onClick={() => {
                      setSelectedProblemId(problem._id);
                      setShowConfirmModal(true);
                    }}
                  />
                </>
              )}
              <div className="transition-transform transform group-hover:translate-x-2">
                <FaArrowRight className="text-blue-400" />
              </div>
            </div>


          </div>
        ))}
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
    
    </>
  );
};

export default ProblemList;
