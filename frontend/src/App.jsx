import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Signup from './components/Signup';
import Login from './components/Login';
import Home from './components/Home';
import Unauthorized from './components/Unauthorized';
import Problemlist from './components/Problemlist';
import './App.css'

function App() {

  return (
      <Routes>
         <Route path="/signup" element={<Signup />} />
         <Route path="/login" element={<Login />} />
         <Route path='/user' element={<Home />} />  
         <Route path='/user/unauthorized' element={ <Unauthorized /> }></Route>
         <Route path='/user/problemlist' element={<Problemlist />} />  
      </Routes>
  );
}

export default App;
