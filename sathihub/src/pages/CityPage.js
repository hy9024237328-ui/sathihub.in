import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Star, Shield, Users, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoginModal from '../components/LoginModal';

const cityData = {
  delhi: { name: 'Delhi NCR', state: 'Delhi', population: '3.2 Crore+' },
  noida: { name: 'Noida', state: 'Uttar Pradesh', population: '6.4 Lakh+' },
  gurgaon: { name: 'Gurgaon', state: 'Haryana', population: '8.7 Lakh+' },
  mumbai: { name: 'Mumbai', state: 'Maharashtra', population: '2 Crore+' },
  bangalore: { name: 'Bangalore', state: 'Karnataka', population: '1.2 Crore+' },
  pune: { name: 'Pune', state: 'Maharashtra', population: '35 Lakh+' },
  hyderabad: { name: 'Hyderabad', state: 'Telangana', population: '1 Crore+' },
  chennai: { name: 'Chennai', state: 'Tamil Nadu', population: '87 Lakh+' },
  kolkata: { name: 'Kolkata', state: 'West Bengal', population: '1.5 Crore+' },
  ahmedabad: { name: 'Ahmedabad', state: 'Gujarat', population: '63 Lakh+' },
  jaipur: { name: 'Jaipur', state: 'Rajasthan', population: '30 Lakh+' },
  chandigarh: { name: 'Chandigarh', state: 'Punjab', population: '10 Lakh+' },
  indore: { name: 'Indore', state: 'Madhya Pradesh', population: '21 Lakh+' },
  lucknow: { name: 'Lucknow', state: 'Uttar Pradesh', population: '29 Lakh+' },
  kochi: { name: 'Kochi', state: 'Kerala', population: '21 Lakh+' },
  coimbatore: { name: 'Coimbatore', state: 'Tamil Nadu', population: '21 Lakh+' },
  nashik: { name: 'Nashik', state: 'Maharashtra', population: '15 Lakh+' },
  surat: { name: 'Surat', state: 'Gujarat', population: '45 Lakh+' },
  dehradun: { name: 'Dehradun', state: 'Uttarakhand', population: '8 Lakh+' },
};

const services = [
  { emoji: '👴', title: 'Elder Care', price: '₹1000/hr' },
  { emoji: '🤝', title: 'Hangingout', price: '₹1500/hr' },
  { emoji: '🎉', title: 'Clubbing', price: '₹2000/hr' },
  { emoji: '🎬', title: 'Movie Partner', price: '₹2000/hr' },
  { emoji: '🛍️', title: 'Shopping Buddy', price: '₹2000/hr' },
  { emoji: '🩺', title: 'Medical Support', price: '₹2000/hr' },
];

const CityPage = () => {
  const { citySlug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const city = cityData[citySlug] || { name: citySlug?.charAt(0).toUpperCase() + citySlug?.slice(1), state: 'India', population: 'N/A' };

  const handleBook = (serviceType) => {
    if (user) {
      navigate('/book', { state: { serviceType, citySlug } });
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <Header />

      {/* Hero */}
      <section className="pt-28 pb-12 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <MapPin className="w-4 h-4" /> {city.name}, {city.state}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              SathiHub in {city.name}
            </span>
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Find verified, professional Sathis in {city.name} for social support, elder care, hangouts, and more. Safe & trusted platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              Find a Sathi in {city.name} →
            </button>
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-white border-2 border-purple-600 text-purple-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-purple-50 transition-all duration-300">
              Become a Sathi →
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Active Sathis', value: '500+', color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Avg Rating', value: '4.8★', color: 'text-pink-600', bg: 'bg-pink-50' },
            { label: 'Available', value: '24/7', color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Verified', value: '100%', color: 'text-blue-600', bg: 'bg-blue-50' },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.bg} p-4 rounded-xl text-center`}>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="py-12 px-4 bg-white/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Services Available in {city.name}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {services.map((s) => (
              <div key={s.title} className="bg-white p-5 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 text-center border border-purple-50">
                <div className="text-4xl mb-3">{s.emoji}</div>
                <h3 className="font-bold text-gray-800 mb-1">{s.title}</h3>
                <p className="text-purple-600 font-semibold">{s.price}</p>
                <button
                  onClick={() => handleBook(s.title)}
                  className="mt-3 w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 rounded-xl text-sm font-semibold hover:shadow-lg transition-all">
                  Book Now →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Why Choose SathiHub in {city.name}?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: <Shield className="w-6 h-6 text-purple-600" />, title: 'Background Verified', desc: `All Sathis in ${city.name} are thoroughly background-verified for your safety.` },
              { icon: <Star className="w-6 h-6 text-pink-600" />, title: 'Top Rated', desc: `4.8★ average rating from hundreds of happy clients in ${city.name}.` },
              { icon: <Users className="w-6 h-6 text-indigo-600" />, title: '500+ Sathis', desc: `Large network of professional Sathis available across all areas of ${city.name}.` },
              { icon: <Sparkles className="w-6 h-6 text-violet-600" />, title: 'Professional', desc: `Trained professionals committed to consent-first, strictly professional services.` },
            ].map((f) => (
              <div key={f.title} className="bg-white p-6 rounded-2xl shadow-lg flex items-start gap-4">
                <div className="bg-purple-50 p-3 rounded-xl">{f.icon}</div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">{f.title}</h3>
                  <p className="text-gray-600 text-sm">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-4 bg-gradient-to-br from-purple-600 to-pink-600 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Find Your Sathi in {city.name} Today!</h2>
          <p className="mb-8 opacity-90">Join thousands of happy users in {city.name} who trust SathiHub for professional social support.</p>
          <button
            onClick={() => setShowAuthModal(true)}
            className="bg-white text-purple-600 px-10 py-4 rounded-full text-lg font-bold hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
            Get Started Free →
          </button>
        </div>
      </section>

      <Footer />
      <LoginModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};

export default CityPage;
