import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const useLogout = () => {
  const navigate = useNavigate();

  const logout = async () => {
    try {
    
      await axios.post(`${import.meta.env.VITE_URL}/user/logout`, {}, {
        withCredentials: true,
      });

      toast.success("Logged out successfully!", {
        autoClose: 1500,
      });

    
      navigate('/');
      
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out");
      return { success: false, error };
    }
  };

  return { logout };
};

export default useLogout;