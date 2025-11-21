import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ArrowRight, Clock, Star, Shield, Truck, Package, CookingPot, Bath, Home } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    // Auto-rotate features every 3 seconds
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Features data with clean, minimalist style
  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast Delivery",
      description: "Under 10 minutes, guaranteed speed and freshness.",
      color: "text-purple-600 bg-purple-100", 
      ring: "ring-purple-500/50"
    },
    {
      icon: <Truck className="w-8 h-8" />,
      title: "Zero Delivery Fee",
      description: "Free delivery on orders above ₹100 - Always fast dispatch.",
      color: "text-gray-900 bg-gray-200", 
      ring: "ring-gray-700/50"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secured Payments",
      description: "100% secure, encrypted transactions guaranteed.",
      color: "text-indigo-600 bg-indigo-100", 
      ring: "ring-indigo-500/50"
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: "Premium Quality",
      description: "Handpicked, top-rated products from trusted brands.",
      color: "text-yellow-600 bg-yellow-100", 
      ring: "ring-yellow-500/50"
    }
  ];

  const categories = [
    { name: "Grocery & Kitchen", icon: CookingPot },
    { name: "Snacks & Drinks",icon: Zap },
    { name: "Beauty & Personal Care",icon: Bath },
    { name: "Household Essentials", icon: Home }
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      
      {/* --- Header/Navbar --- */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-6">
          
          {/* Logo (LiveMart) */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
            <Zap className="w-7 h-7 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">
              Live<span className="text-purple-600">Mart</span>
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-gray-600 font-medium">
            <a href="#" className="hover:text-purple-600 transition-colors border-b-2 border-transparent hover:border-purple-600 pb-1">Home</a>
            <a href="#categories" className="hover:text-purple-600 transition-colors border-b-2 border-transparent hover:border-purple-600 pb-1">Shop</a>
            <a href="/login" className="hover:text-purple-600 transition-colors border-b-2 border-transparent hover:border-purple-600 pb-1">Sign In</a>
            
            {/* Contact/CTA Button (Theme: Purple) */}
            <button 
              onClick={() => navigate('/register')}
              className="ml-4 px-5 py-2 bg-purple-600 text-white font-semibold rounded-full shadow-md hover:bg-purple-700 transition-colors flex items-center"
            >
             Sign up 
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </nav>

          {/* Mobile Menu Icon (Placeholder) */}
          <div className="md:hidden">
            <button className="text-gray-600 p-2 border rounded-md hover:bg-gray-50">
                {/* <Menu className="w-6 h-6" /> */}
            </button>
          </div>
        </div>
      </header>

      {/* --- Section 1: Hero (Atmospheric Background) --- */}
      {/* Wave SVG has been REMOVED */}
      <div 
        className="relative pt-24 min-h-[90vh] flex items-center justify-center bg-gray-900" 
        style={{ 
          backgroundImage: "url(https://images.unsplash.com/photo-1544198365-f5d60b6d61e4?q=80&w=1974&auto=format&fit=crop)",
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
        }}
      >
        {/* Overlay to darken image and match theme */}
        <div className="absolute inset-0 bg-gray-900/50 backdrop-brightness-75"></div>
        
        <div className="max-w-4xl mx-auto text-center z-10 py-20 px-4">
          
          {/* Main Headline (UPDATED CAPTION) */}
          <h1 className={`text-5xl md:text-7xl font-extrabold text-white transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300">Instant</span> Delivery for Your Daily Needs
          </h1>

          {/* Subtitle (UPDATED CAPTION) */}
          <p className={`mt-6 text-xl text-gray-200 max-w-lg mx-auto transform transition-all duration-1000 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            Groceries, snacks, and essentials delivered in under 10 minutes
          </p>

          {/* Minimalist CTA */}
          <button 
            onClick={() => navigate('/register')}
            className={`mt-8 text-white font-semibold flex items-center mx-auto transition-all duration-300 hover:text-purple-400 transform transition-all duration-1000 delay-400 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
          >
            Start Your First Order 
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>

     

      {/* --- Section 3: Features / Why Choose Us --- */}
      <div id="features" className="relative py-20 px-6 bg-gray-50 border-t border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
        
          <h2 className="text-4xl font-extrabold text-center mb-12 text-gray-900">
            Speed, Quality, and Reliability
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group relative p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer text-center 
                  ${activeFeature === index ? `ring-4 ${feature.ring} scale-[1.03]` : 'scale-100 hover:scale-[1.01] border border-gray-100'}
                `}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className={`w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center transition-all duration-300 ${feature.color} group-hover:shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- Section 4: Categories (Shop) --- */}
      <div id="categories" className="relative py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-extrabold text-center mb-4 text-gray-900">
            Shop By Category
          </h2>
          <p className="text-center text-gray-600 mb-16 text-lg max-w-2xl mx-auto">
            Browse our core categories, always stocked and ready for immediate dispatch.
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <div
                key={index}
                onClick={() => navigate(`/products?category=${category.name}`)}
                className="cursor-pointer bg-gray-50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:bg-gray-100 group border border-gray-100"
              >
                <div className="w-12 h-12 mb-3 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-md group-hover:bg-gray-900 transition-colors">
                  <category.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{category.items}</p>
                <div className="mt-3 flex items-center text-purple-600 font-semibold text-sm group-hover:text-gray-900 transition-colors">
                    Shop Now
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- Section 5: Footer/Final CTA --- */}
      <div className="relative py-20 px-6 bg-gray-900 text-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
            Ready for Instant Delivery?
          </h2>
          <p className="text-xl mb-10 opacity-80 font-light max-w-3xl mx-auto">
            Experience the future of grocery shopping. Sign up and order today!
          </p>
          <button 
            onClick={() => navigate('/register')}
            className="group px-10 py-5 bg-purple-600 text-white text-xl font-bold rounded-full shadow-2xl shadow-purple-500/50 hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
          >
            <span className="flex items-center gap-3 mx-auto justify-center">
              Create Account & Order Now
              <Zap className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </div>
      </div>

      {/* --- Custom Styles (Line drawing animation removed) --- */}
      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}