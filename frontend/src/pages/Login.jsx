import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Eye, EyeOff, Loader, Mail, Lock, Zap } from 'lucide-react'; // Added Zap for the logo
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      
      // === REQUESTED CHANGE: Stay on the current page after successful login ===
      // To navigate to the home page, uncomment the line below:
      // navigate('/home'); 

      // If you want a quick simulated success message before staying, add:
      console.log('Login attempt successful, staying on page.');
      
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // --- Theme Color Definitions (Reverting to Black Button / Purple Accents) ---
  const BLACK_BUTTON_CLASS = 'bg-black hover:bg-gray-800 focus:ring-gray-500';
  const PURPLE_TEXT_CLASS = 'text-purple-600 hover:text-purple-700';
  const PURPLE_GRADIENT_CLASS = 'bg-gradient-to-br from-purple-600 to-indigo-600';
  const INPUT_RING_CLASS = 'focus:ring-purple-500';
  const DARK_TEXT_CLASS = 'text-gray-900'; 
  const BACKGROUND_CLASS = 'bg-gray-50'; // Simple background
  // ----------------------------------------------------------------------------


  return (
    <div className={`min-h-screen flex items-center justify-center ${BACKGROUND_CLASS} px-4 py-12`}>
      <div className="w-full max-w-md animate-scale-in">
        
        {/* === Form Card START: Translucent with Heavy Shadow === */}
        <div className="bg-white/50 rounded-2xl shadow-2xl p-8 border border-gray-100 backdrop-blur-md">
            
            {/* Logo & Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center mb-6">
                <div className={`h-16 w-16 rounded-2xl ${PURPLE_GRADIENT_CLASS} flex items-center justify-center shadow-xl`}>
                  {/* Changed logo from ShoppingCart to Zap for the previous theme */}
                  <Zap className="h-9 w-9 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2"> 
                Sign in to LiveMart
              </h1>
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  className={`${PURPLE_TEXT_CLASS} font-semibold hover:underline transition-colors`}
                >
                  Register now
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3 animate-fade-in">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Email Input */}
              <div>
                <label htmlFor="email" className={`block text-sm font-medium ${DARK_TEXT_CLASS} mb-2`}>
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${INPUT_RING_CLASS} focus:border-transparent transition-all`}
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className={`block text-sm font-medium ${DARK_TEXT_CLASS} mb-2`}>
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${INPUT_RING_CLASS} focus:border-transparent transition-all`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button - Black Theme */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white ${BLACK_BUTTON_CLASS} disabled:bg-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]`}
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Footer Text */}
            <p className="mt-6 text-center text-sm text-gray-600">
              By signing in, you agree to our{' '}
              <a href="#" className={`${PURPLE_TEXT_CLASS} font-medium`}>
                Terms of Service
              </a>
            </p>
        </div>
        {/* === Form Card END === */}
      </div>
    </div>
  );
};

export default Login;