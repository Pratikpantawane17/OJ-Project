import React from 'react'
import { useNavigate } from 'react-router-dom';


const Footer = () => {
  const navigate = useNavigate();
  return (
   <>
        {/* Footer */}
      <footer className="bg-gray-900/80 backdrop-blur-sm border-t border-gray-800 flex justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              {/* <h3 className="text-2xl font-bold text-white mb-4">AlgoArena</h3> */}
              {/* <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text hover:cursor-pointer transition-opacity">AlgoArena</h3> */}
               <button 
              onClick={() => onNavigate('/')}
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text hover:cursor-pointer transition-opacity mb-4"
            >
              AlgoArena
            </button>
              <p className="text-gray-400 mb-4">
                Empowering developers to master algorithms and competitive programming.
              </p>
              
            </div>
            
            {/* <div>
              <h4 className="text-lg font-semibold text-white mb-4">Status</h4>
              <p className="text-gray-400">
                {isAuthenticated ? (
                  <span className="text-green-400">
                    Logged in as {user?.name || user?.username || 'User'}
                  </span>
                ) : (
                  <span className="text-orange-400">You are not logged in</span>
                )}
              </p>
            </div> */}

            <div>
                <h4 className="text-lg font-semibold text-white mb-4 uppercase tracking-wide">Navigation</h4>
                <div className="space-y-2 text-white cursor-pointer">
                    <p
                    onClick={() => navigate('/problemlist')}
                    className="flex items-center text-gray-400 hover:text-white transition-colors duration-300"
                    >
                    Problems
                    </p>
                    <p
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center text-gray-400 hover:text-white transition-colors duration-300"
                    >
                    Dashboard
                    </p>
                </div>
                </div>
                
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Connect</h4>
              <div className="space-y-2">
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-400 hover:text-white transition-colors duration-300"
                >
                  GitHub
                </a>
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-400 hover:text-white transition-colors duration-300"
                >
                  LinkedIn
                </a>
                <a 
                  href="mailto:pratikpantawane17@gmail.com"
                  className="flex items-center text-gray-400 hover:text-white transition-colors duration-300"
                >
                  algoarena@gmail.com
                </a>
              </div>
            </div>
          </div>
            <p className="text-sm text-gray-500">
                © 2025 AlgoAreana by Pratik Pantawane. All rights reserved.
            </p>
        </div>
      
      </footer>
   </>
  )
}

export default Footer;
