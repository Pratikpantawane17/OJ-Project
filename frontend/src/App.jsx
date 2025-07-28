import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Signup from './components/Signup';
import Login from './components/Login';
import Home from './components/Home';
import Unauthorized from './components/Unauthorized';
import ProblemList from './components/ProblemList';
import ProblemForm from './components/Problem_form'; 
import Problem from './components/Problem';



import './App.css';
import Dashboard from './components/Dashboard';

function App() {
  return (

    <>
    {/* IMPORTANT THING HERE we have replace /user/unauthorized and other routes by removing /user but in backend we uses with /user --> JUST for  Information / Clarification */}
    {/* For UI Inhancement */}
    <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0d1117] via-[#161b22] to-[#1f2937]">

      <Routes>  
        {/* Common Routes */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/problemlist" element={<ProblemList />} />
        <Route path="/problemlist/:id" element={<Problem />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Admin Routes */}
        <Route path="/admin/problem-form" element={<ProblemForm />} />
        <Route path="/admin/problem-form/:id" element={<ProblemForm />} />
      </Routes>

      {/* <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      /> */}
      <ToastContainer />

      </div>
    </>
    
  );
}

export default App;
