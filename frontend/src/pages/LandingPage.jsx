import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Truck, Shield, Star, ArrowRight, Leaf, Clock, Award, ChevronRight, Sparkles } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <Leaf className="w-8 h-8" />,
      title: "100% Organic",
      description: "Farm-fresh organic produce delivered daily",
      color: "from-green-400 to-emerald-600"
    },
    {
      icon: <Truck className="w-8 h-8" />,
      title: "Free Delivery",
      description: "On orders above ₹50 - Same day delivery",
      color: "from-blue-400 to-cyan-600"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure Payment",
      description: "100% secure transactions guaranteed",
      color: "from-purple-400 to-pink-600"
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Best Quality",
      description: "Top-rated products from trusted sellers",
      color: "from-orange-400 to-red-600"
    }
  ];

  const categories = [
    { name: "Vegetables", image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=400&fit=crop", items: "50+ items" },
    { name: "Fruits", image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=400&fit=crop", items: "40+ items" },
    { name: "Dairy", image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop", items: "30+ items" },
    { name: "Bakery", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop", items: "25+ items" },
    { name: "Beverages", image: "https://images.unsplash.com/photo-1437418747212-8d9709afab22?w=400&h=400&fit=crop", items: "35+ items" },
    { name: "Snacks", image: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&h=400&fit=crop", items: "45+ items" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/2 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center px-4 py-20">
        <div className="max-w-6xl mx-auto text-center">
          {/* Logo Animation */}
          <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-3xl mb-8 shadow-2xl transform hover:scale-110 transition-transform duration-300">
              <ShoppingBag className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Main Heading */}
          <h1 className={`text-6xl md:text-8xl font-black mb-6 transform transition-all duration-1000 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 animate-gradient">
              Fresh Groceries
            </span>
            <br />
            <span className="text-gray-800">Delivered Daily</span>
          </h1>

          {/* Subtitle */}
          <p className={`text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto transform transition-all duration-1000 delay-400 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            Get farm-fresh produce, organic items, and everyday essentials delivered to your doorstep. Shop from 10,000+ products with same-day delivery.
          </p>

          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center transform transition-all duration-1000 delay-600 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <button 
              onClick={() => navigate('/register')}
              className="group relative px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-lg font-bold rounded-full overflow-hidden shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              <span className="relative z-10 flex items-center gap-2">
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>

            <button 
              onClick={() => navigate('/login')}
              className="group px-8 py-4 bg-white text-gray-800 text-lg font-bold rounded-full border-2 border-gray-300 hover:border-green-500 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <span className="flex items-center gap-2">
                Sign In
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>

          {/* Trust Indicators */}
          <div className={`mt-16 flex flex-wrap justify-center gap-8 text-gray-600 transform transition-all duration-1000 delay-800 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <span className="font-semibold">4.8/5 Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-green-500" />
              <span className="font-semibold">50,000+ Happy Customers</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <span className="font-semibold">Same-Day Delivery</span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative py-20 px-4 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-gray-800">
            Why Choose <span className="text-green-600">LiveMart</span>?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group relative p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 cursor-pointer ${
                  activeFeature === index ? 'ring-4 ring-green-400' : ''
                }`}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className={`w-16 h-16 mb-4 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}></div>
              </div>
            ))}
          </div>
        </div>
      </div>

{/* Categories Section */}
<div className="relative py-20 px-4">
  <div className="max-w-6xl mx-auto">
    <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-gray-800">
      Shop by Category
    </h2>
    <p className="text-center text-gray-600 mb-16 text-lg">
      Browse through our wide range of fresh categories
    </p>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
      {categories.map((category, index) => (
        <div
          key={index}
          onClick={() => navigate(`/products?category=${category.name}`)}
          className="cursor-pointer bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2"
        >
          <div className="h-64 w-full rounded-t-3xl overflow-hidden">
            <img
              src={category.image}
              alt={category.name}
              className="w-full h-full object-cover transform transition-transform duration-500 hover:scale-110"
            />
          </div>

          <div className="p-6 text-center">
            <h3 className="text-xl font-bold text-gray-800">{category.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{category.items}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
</div>


      {/* CTA Section */}
      <div className="relative py-20 px-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Start Shopping?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of satisfied customers and get your first order delivered today!
          </p>
          <button 
            onClick={() => navigate('/register')}
            className="group px-10 py-5 bg-white text-green-600 text-xl font-bold rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
          >
            <span className="flex items-center gap-2 mx-auto justify-center">
              Create Free Account
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </span>
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
