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
import AddressWithLocation from "../components/AddressWithLocation";

const PRIMARY_PURPLE = '#7C3AED';
const DARK_BACKGROUND_CLASS = 'bg-gray-900';
const CARD_BG_CLASS = 'bg-white';
const PURPLE_BUTTON_CLASS = 'bg-violet-600 hover:bg-violet-700 focus:ring-violet-500';
const PURPLE_TEXT_CLASS = 'text-violet-600 hover:text-violet-700';
const INPUT_RING_CLASS = 'focus:ring-violet-500';
const DARK_TEXT_CLASS = 'text-gray-900';
const INPUT_FILLED_BG = 'bg-violet-50';

// --- Logo Component ---
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
      <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none">
        <path d="M13 2L3 14h7l-1 8L21 10h-7l-1-8z" fill="#FFF" />
      </svg>
    </div>
  );
};

// --- Memoized InputGroup ---
const InputGroup = memo(
  ({
    label,
    name,
    type = 'text',
    icon: Icon,
    placeholder,
    required = true,
    pattern,
    showToggle,
    toggleState,
    setToggle,
    value,
    onChange
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
            placeholder={placeholder}
            className={`block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${INPUT_RING_CLASS} ${value ? INPUT_FILLED_BG : 'bg-white'} text-gray-800 placeholder-gray-400`}
          />
          {showToggle && (
            <button
              type="button"
              onClick={() => setToggle(!toggleState)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {toggleState ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          )}
        </div>
      </div>
    );
  }
);
InputGroup.displayName = 'InputGroup';

// --- Register Component ---
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

  // Handle input change
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  }, []);

  // Handle Google Autocomplete or GPS autofill
  const handleAutoFill = ({ address, city, state, pincode, location }) => {
    setFormData(prev => ({
      ...prev,
      address: address || prev.address,
      city: city || prev.city,
      state: state || prev.state,
      pincode: pincode || prev.pincode
    }));
  };

  // Required fields
  const getRequiredFields = (role) => {
    const base = ['name', 'email', 'password', 'confirmPassword', 'phone', 'address', 'city', 'state', 'pincode'];
    return role === 'customer' ? base : [...base, 'businessName', 'businessType'];
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|[a-zA-Z0-9.-]+\.ac\.in)$/i;
    if (!emailRegex.test(formData.email)) {
      setError('Email must be gmail.com or *.ac.in');
      return;
    }

    const required = getRequiredFields(formData.role);
    const emptyField = required.find(f => !formData[f]?.trim());
    if (emptyField) {
      setError(`Please fill in ${emptyField}`);
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
      const payload = {
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
        payload.businessDetails = {
          businessName: formData.businessName.trim(),
          gstin: formData.gstin.trim(),
          businessType: formData.businessType.trim()
        };
      }

      const response = await register(payload);
      const userId = response?.userId || response?.data?.userId;

      navigate('/verify-otp', { state: { userId, email: payload.email } });
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const isBusiness = formData.role !== 'customer';

  return (
    <div className={`min-h-screen p-4 sm:p-8 flex items-center justify-center ${DARK_BACKGROUND_CLASS}`}>
      <div className="max-w-7xl w-full mx-auto">
        <div className={`${CARD_BG_CLASS} rounded-3xl shadow-2xl p-6 md:p-12 lg:p-16`}>
          <div className="lg:grid lg:grid-cols-5 lg:gap-16">
            <div className="lg:col-span-3 lg:pr-8">
              
              {/* Header */}
              <div className="flex items-center gap-4 mb-8">
                <Logo size={50} />
                <div>
                  <h1 className="text-3xl font-extrabold text-gray-900">Sign up</h1>
                  <p className="text-gray-600 text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className={`${PURPLE_TEXT_CLASS} font-semibold`}>
                      Login here
                    </Link>
                  </p>
                </div>
              </div>

              {/* Role Selector */}
              <div className="p-1 rounded-full flex bg-gray-100 mb-8 max-w-sm">
                {['customer', 'retailer', 'wholesaler'].map((role) => (
                  <button
                    key={role}
                    onClick={() => setFormData(prev => ({ ...prev, role }))}
                    className="flex-1 px-4 py-2 rounded-full text-sm font-semibold"
                    style={
                      formData.role === role
                        ? { background: PRIMARY_PURPLE, color: '#fff' }
                        : { background: 'transparent', color: '#6b7280' }
                    }
                  >
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </button>
                ))}
              </div>

              {/* FORM */}
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Error Banner */}
                {error && (
                  <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                {/* PERSONAL DETAILS */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <User className="h-5 w-5" /> Personal Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputGroup label="Full Name" name="name" value={formData.name} onChange={handleChange} />
                    <InputGroup label="Email Address" name="email" type="email" icon={Mail} value={formData.email} onChange={handleChange} />
                    <InputGroup label="Phone Number" name="phone" type="tel" icon={Phone} value={formData.phone} onChange={handleChange} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputGroup
                      label="Password"
                      name="password"
                      icon={Lock}
                      placeholder="••••••••"
                      showToggle
                      toggleState={showPassword}
                      setToggle={setShowPassword}
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <InputGroup
                      label="Confirm Password"
                      name="confirmPassword"
                      icon={Lock}
                      placeholder="••••••••"
                      showToggle
                      toggleState={showConfirmPassword}
                      setToggle={setShowConfirmPassword}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* LOCATION DETAILS */}
                <div className="space-y-4 pt-6 border-t">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <MapPin className="h-5 w-5" /> Location Details
                  </h3>

                  {/* Autocomplete + Use My Location */}
                  <AddressWithLocation onSelect={handleAutoFill} />

                  {/* Manual Fields (also autofilled) */}
                  <InputGroup label="Address" name="address" value={formData.address} onChange={handleChange} />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InputGroup label="City" name="city" value={formData.city} onChange={handleChange} />
                    <InputGroup label="State" name="state" value={formData.state} onChange={handleChange} />
                    <InputGroup label="Pincode" name="pincode" value={formData.pincode} onChange={handleChange} />
                  </div>
                </div>

                {/* BUSINESS DETAILS */}
                {isBusiness && (
                  <div className="space-y-4 pt-6 border-t">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Building className="h-5 w-5" /> Business Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputGroup label="Business Name" name="businessName" value={formData.businessName} onChange={handleChange} />
                      <InputGroup label="GSTIN (Optional)" name="gstin" required={false} value={formData.gstin} onChange={handleChange} />
                      <div className="md:col-span-2">
                        <InputGroup label="Business Type" name="businessType" value={formData.businessType} onChange={handleChange} />
                      </div>
                    </div>
                  </div>
                )}
{/* Google Sign-In Button (direct inline version) */}
<div className="mt-6 flex items-center justify-center">
  <button
    type="button"
    onClick={() => window.location.href = "http://localhost:4000/api/auth/google"}
    className="flex items-center gap-3 px-20 py-4 rounded-md border border-gray-300 shadow-sm bg-white hover:bg-gray-50"
  >
    <img
      src="https://developers.google.com/identity/images/g-logo.png"
      alt="Google"
      className="w-5 h-5"
    />
    <span className="text-lg font-bold text-gray-700">
      Sign in with Google
    </span>
  </button>
</div>
                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 rounded-lg text-white font-medium ${PURPLE_BUTTON_CLASS}`}
                >
                  {loading ? (
                    <div className="flex items-center gap-2 justify-center">
                      <Loader className="h-5 w-5 animate-spin" /> Creating Account...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 justify-center">
                      <Check className="h-5 w-5" /> Register Account
                    </div>
                  )}
                </button>

                <p className="text-center text-sm text-gray-600">
                  By creating an account, you agree to our{" "}
                  <span className={`${PURPLE_TEXT_CLASS}`}>Terms of Service</span>{" "}
                  and{" "}
                  <span className={`${PURPLE_TEXT_CLASS}`}>Privacy Policy</span>
                </p>
              </form>
            </div>

            {/* RIGHT SIDE GRAPHIC */}
            <div className="hidden lg:flex col-span-2 items-center justify-center">
              <svg viewBox="0 0 400 300" className="w-full max-w-sm">
                <circle cx="50" cy="200" r="25" fill="#e0e7ff" />
                <rect x="20" y="240" width="60" height="8" rx="4" fill="#a5b4fc" />
                <rect x="200" y="40" width="150" height="240" rx="25" fill="#f3f4f6" stroke="#e0e7ff" strokeWidth="4" />
                <rect x="225" y="65" width="100" height="10" fill={PRIMARY_PURPLE} />
                <rect x="225" y="85" width="70" height="10" fill={PRIMARY_PURPLE} />
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
