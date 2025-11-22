import React, { useState, useCallback, memo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Loader,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Building,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/*
  Updated Register.jsx
  - Uses real react-router hooks (useNavigate, Link)
  - Uses real useAuth from your context
  - Logo replaced with provided SVG box logo
  - Email validation moved into handleSubmit (JS regex) allowing gmail.com and any *.ac.in
  - Removed fragile pattern attribute from JSX
  - Keep styling matching previous design
*/

const PRIMARY_PURPLE = '#7C3AED';
const DARK_BACKGROUND_CLASS = 'bg-gray-900';
const CARD_BG_CLASS = 'bg-white';
const PURPLE_BUTTON_CLASS = 'bg-violet-600 hover:bg-violet-700 focus:ring-violet-500';
const PURPLE_TEXT_CLASS = 'text-violet-600 hover:text-violet-700';
const PURPLE_GRADIENT_CLASS = 'bg-gradient-to-br from-violet-600 to-indigo-600';
const INPUT_RING_CLASS = 'focus:ring-violet-500';
const DARK_TEXT_CLASS = 'text-gray-900';
const INPUT_FILLED_BG = 'bg-violet-50';

// --- New Logo (from your design) ---
const Logo = ({ size = 56 }) => {
  const PURPLE = '#7C3AED';
  const radius = 12;
  const svgSize = Math.round(size * 0.56);

  return (
    <div
      aria-hidden="true"
      className="transition-all duration-300 transform hover:scale-105"
      style={{
        height: size,
        width: size,
        borderRadius: radius,
        background: PURPLE,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 24px rgba(124,58,237,0.4)',
        overflow: 'hidden'
      }}
    >
      <svg
        width={svgSize}
        height={svgSize}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M13 2L3 14h7l-1 8L21 10h-7l-1-8z"
          fill="#FFFFFF"
        />
      </svg>
    </div>
  );
};

// Memoized input group
const InputGroup = memo(({
  label, name, type = 'text', icon: Icon, placeholder, required = true,
  pattern, showToggle, toggleState, setToggle, value, onChange
}) => {
  return (
    <div>
      <label htmlFor={name} className={`block text-sm font-medium ${DARK_TEXT_CLASS} mb-1`}>
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {Icon && <Icon className="h-5 w-5 text-gray-400" />}
        </div>
        <input
          id={name}
          type={showToggle ? (toggleState ? 'text' : 'password') : type}
          name={name}
          required={required}
          value={value}
          onChange={onChange}
          pattern={pattern}
          className={`block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${INPUT_RING_CLASS} focus:border-transparent transition-all text-gray-800 placeholder-gray-400 ${value ? INPUT_FILLED_BG : 'bg-white'}`}
          placeholder={placeholder}
        />
        {showToggle && (
          <button
            type="button"
            onClick={() => setToggle(!toggleState)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={`Toggle ${label} visibility`}
          >
            {toggleState ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        )}
      </div>
    </div>
  );
});
InputGroup.displayName = 'InputGroup';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'customer',
    address: '',
    city: '',
    state: '',
    pincode: '',
    businessName: '',
    gstin: '',
    businessType: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  }, []);

  const getRequiredFields = (role) => {
    const commonFields = ['name', 'email', 'password', 'confirmPassword', 'phone', 'address', 'city', 'state', 'pincode'];
    return role === 'customer' ? commonFields : [...commonFields, 'businessName', 'businessType'];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // EMAIL VALIDATION: allow gmail.com and any academic .ac.in domain
    const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|[a-zA-Z0-9.-]+\.ac\.in)$/i;
    if (!emailRegex.test(formData.email?.trim() || '')) {
      setError('Email must be a gmail.com address or an academic .ac.in address');
      return;
    }

    const requiredFields = getRequiredFields(formData.role);
    const missingField = requiredFields.find(field => !formData[field] || (typeof formData[field] === 'string' && formData[field].trim() === ''));

    if (missingField) {
      const fieldName = missingField.replace(/([A-Z])/g, ' $1').toLowerCase();
      setError(`Please fill in the required field: ${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}`);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone.trim(),
        role: formData.role,
        location: {
          address: formData.address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim()
        }
      };

      if (formData.role !== 'customer') {
        userData.businessDetails = {
          businessName: formData.businessName.trim(),
          gstin: formData.gstin.trim(),
          businessType: formData.businessType.trim()
        };
      }

      const response = await register(userData);

      const userId = response?.userId || response?.data?.userId || null;

      navigate('/verify-otp', { state: { userId, email: userData.email } });
    } catch (err) {
      console.error(err);
      const message = err?.response?.data?.message || err?.message || 'Registration failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const isBusiness = formData.role !== 'customer';

  return (
    <div className={`min-h-screen p-4 sm:p-8 flex items-center justify-center ${DARK_BACKGROUND_CLASS} transition-colors duration-500`} style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="max-w-7xl w-full mx-auto">
        <div className={`${CARD_BG_CLASS} rounded-3xl shadow-2xl p-6 md:p-12 lg:p-16 border border-gray-100 min-h-[70vh] overflow-hidden`}>
          <div className="lg:grid lg:grid-cols-5 lg:gap-16">
            <div className="lg:col-span-3 lg:pr-8">
              <div className="flex items-center gap-4 mb-8">
                <Logo size={50} />
                <div>
                  <h1 className="text-3xl font-extrabold text-gray-900 mb-1 tracking-tight">Sign up</h1>
                  <p className="text-gray-600 text-sm">Already have an account?{' '}<Link to="/login" className={`font-semibold hover:underline transition-colors ${PURPLE_TEXT_CLASS}`}>Login here</Link></p>
                </div>
              </div>

              <div className="p-1 rounded-full flex bg-gray-100 shadow-inner mb-8 w-full max-w-sm">
                {['customer', 'retailer', 'wholesaler'].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, role }))}
                    className="flex-1 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 transform"
                    style={
                      formData.role === role
                        ? { background: PRIMARY_PURPLE, color: '#fff', boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }
                        : { background: 'transparent', color: '#6b7280' }
                    }
                    aria-pressed={formData.role === role}
                  >
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3 animate-fade-in">
                    <div className="flex-shrink-0 mt-0.5"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg></div>
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                )}

                <div className="space-y-4 pt-2">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><User className="h-5 w-5 text-gray-500" /> Personal Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><InputGroup label="Full Name" name="name" icon={null} placeholder="Full Name" value={formData.name} onChange={handleChange} /></div>
                    <div><InputGroup label="Email Address" name="email" type="email" icon={Mail} placeholder="Email Address" value={formData.email} onChange={handleChange} /></div>
                    <div><InputGroup label="Phone Number" name="phone" type="tel" icon={Phone} placeholder="Phone Number" value={formData.phone} onChange={handleChange} /></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputGroup label="Password" name="password" icon={Lock} placeholder="••••••••" showToggle={true} toggleState={showPassword} setToggle={setShowPassword} value={formData.password} onChange={handleChange} />
                    <InputGroup label="Confirm Password" name="confirmPassword" icon={Lock} placeholder="••••••••" showToggle={true} toggleState={showConfirmPassword} setToggle={setShowConfirmPassword} value={formData.confirmPassword} onChange={handleChange} />
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><MapPin className="h-5 w-5 text-gray-500" /> Location Details</h3>
                  <InputGroup label="Address" name="address" placeholder="Street address, Apt, etc." required={true} icon={null} value={formData.address} onChange={handleChange} />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <InputGroup label="City" name="city" placeholder="City" value={formData.city} onChange={handleChange} />
                    <InputGroup label="State" name="state" placeholder="State" value={formData.state} onChange={handleChange} />
                    <InputGroup label="Pincode" name="pincode" placeholder="Pincode" value={formData.pincode} onChange={handleChange} />
                  </div>
                </div>

                {isBusiness && (
                  <div className="space-y-4 pt-6 border-t border-gray-100 transition-all duration-500 ease-in-out">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Building className="h-5 w-5 text-gray-500" /> Business Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputGroup label="Business Name" name="businessName" placeholder="Your Company/Store Name" value={formData.businessName} onChange={handleChange} />
                      <InputGroup label="GSTIN (Optional)" name="gstin" placeholder="GST Number" required={false} value={formData.gstin} onChange={handleChange} />
                      <div className="md:col-span-2"><InputGroup label="Business Type" name="businessType" placeholder="e.g., Grocery Store, Wholesaler" value={formData.businessType} onChange={handleChange} /></div>
                    </div>
                  </div>
                )}

                <button type="submit" disabled={loading} className={`w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-lg text-base font-medium text-white ${PURPLE_BUTTON_CLASS} disabled:bg-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-[1.01] active:scale-[0.99] mt-8`}>
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Register Account
                    </>
                  )}
                </button>

                <p className="mt-6 text-center text-sm text-gray-600">By creating an account, you agree to our{' '}<a href="#" className={`font-medium ${PURPLE_TEXT_CLASS}`}>Terms of Service</a>{' '}and{' '}<a href="#" className={`font-medium ${PURPLE_TEXT_CLASS}`}>Privacy Policy</a></p>
              </form>
            </div>

            <div className="hidden lg:col-span-2 lg:flex items-center justify-center p-4 relative">
              <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" className="w-full h-full max-w-sm" aria-hidden="true">
                <circle cx="50" cy="200" r="25" fill="#e0e7ff" />
                <rect x="20" y="240" width="60" height="8" rx="4" fill="#a5b4fc" />
                <rect x="200" y="40" width="150" height="240" rx="25" ry="25" fill="#f3f4f6" stroke="#e0e7ff" strokeWidth="4" className="shadow-xl" />
                <rect x="225" y="65" width="100" height="10" rx="4" fill={PRIMARY_PURPLE} />
                <rect x="225" y="85" width="70" height="10" rx="4" fill={PRIMARY_PURPLE} />
                <line x1="180" y1="180" x2="100" y2="180" stroke={PRIMARY_PURPLE} strokeWidth="2" strokeDasharray="5,5" />
                <circle cx="275" cy="180" r="30" fill="#fff" stroke="#e0e7ff" strokeWidth="2" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;