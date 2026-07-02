import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Shield, Star, Users, Quote, MapPin, X, Heart, Trophy } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoginModal from '../components/LoginModal';

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentSathiHubIndex, setCurrentSathiHubIndex] = useState(0);
  const [liveSathiHubs, setLiveSathiHubs] = useState([]);
  const [isLoadingSathiHubs, setIsLoadingSathiHubs] = useState(true);
  const [activeSathiHubsCount, setActiveSathiHubsCount] = useState(7836);
  const [showCelebrationPopup, setShowCelebrationPopup] = useState(false);

  useEffect(() => {
    const hasSeenPopup = sessionStorage.getItem('celebration_popup_seen');
    if (!hasSeenPopup) {
      const timer = setTimeout(() => { setShowCelebrationPopup(true); }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const closeCelebrationPopup = useCallback(() => {
    setShowCelebrationPopup(false);
    sessionStorage.setItem('celebration_popup_seen', 'true');
  }, []);

  useEffect(() => {
    const fetchLiveSathiHubs = async () => {
      const cached = sessionStorage.getItem('sathihubs_cache');
      const cacheTime = sessionStorage.getItem('sathihubs_cache_time');
      if (cached && cacheTime && (Date.now() - parseInt(cacheTime)) < 120000) {
        setLiveSathiHubs(JSON.parse(cached));
        setIsLoadingSathiHubs(false);
        return;
      }
      try {
        const token = localStorage.getItem('access_token');
        if (!token) { setLiveSathiHubs([]); setIsLoadingSathiHubs(false); return; }
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const response = await fetch(`/api/v1/search/sathihubs?page_size=12&sort=rating`, {
          signal: controller.signal,
          headers: { 'Authorization': `Bearer ${token}` },
        });
        clearTimeout(timeoutId);
        if (response.ok) {
          const data = await response.json();
          if (data.data?.sathihubs?.length > 0) {
            const transformed = data.data.sathihubs.map(kp => ({
              id: kp.id, image: kp.profile_photo, name: kp.name,
              city: kp.city || 'India', rating: kp.rating || 4.8, isNew: false, isReal: true
            }));
            setLiveSathiHubs(transformed);
            sessionStorage.setItem('sathihubs_cache', JSON.stringify(transformed));
            sessionStorage.setItem('sathihubs_cache_time', Date.now().toString());
          } else { setLiveSathiHubs([]); }
        } else { setLiveSathiHubs([]); }
      } catch { setLiveSathiHubs([]); }
      finally { setIsLoadingSathiHubs(false); }
    };
    fetchLiveSathiHubs();
    const refreshInterval = setInterval(fetchLiveSathiHubs, 120000);
    return () => clearInterval(refreshInterval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSathiHubsCount(Math.floor(Math.random() * 4001) + 6000);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const sathiImages = liveSathiHubs;
  const hasRealSathiHubs = liveSathiHubs.length > 0;

  const testimonials = useMemo(() => [
    { image: 'https://images.pexels.com/photos/7580822/pexels-photo-7580822.jpeg?auto=compress&cs=tinysrgb&w=200', name: 'Priya Sharma', city: 'Delhi', earning: '₹85,000', quote: 'SathiHub changed my life! I earn ₹85,000+ monthly working part-time while helping others feel less lonely.', duration: '6 months' },
    { image: 'https://images.pexels.com/photos/7580821/pexels-photo-7580821.jpeg?auto=compress&cs=tinysrgb&w=200', name: 'Anjali Mehta', city: 'Mumbai', earning: '₹1,20,000', quote: 'Best decision I ever made! Started as a side income, now I earn upto ₹2,000 per hour.', duration: '8 months' },
    { image: 'https://images.pexels.com/photos/7581115/pexels-photo-7581115.jpeg?auto=compress&cs=tinysrgb&w=200', name: 'Sneha Reddy', city: 'Bangalore', earning: '₹95,000', quote: 'Flexible hours, good earnings, and meaningful work. I love connecting with people!', duration: '5 months' },
    { image: 'https://images.pexels.com/photos/5738735/pexels-photo-5738735.jpeg?auto=compress&cs=tinysrgb&w=200', name: 'Kavita Patel', city: 'Pune', earning: '₹70,000', quote: 'Extra ₹70,000/month has helped me become financially independent!', duration: '4 months' }
  ], []);

  const operationalCities = useMemo(() => [
    { name: 'Delhi', slug: 'delhi' }, { name: 'Noida', slug: 'noida' }, { name: 'Gurgaon', slug: 'gurgaon' },
    { name: 'Mumbai', slug: 'mumbai' }, { name: 'Bangalore', slug: 'bangalore' }, { name: 'Pune', slug: 'pune' },
    { name: 'Hyderabad', slug: 'hyderabad' }, { name: 'Chennai', slug: 'chennai' }, { name: 'Kolkata', slug: 'kolkata' },
    { name: 'Ahmedabad', slug: 'ahmedabad' }, { name: 'Jaipur', slug: 'jaipur' }, { name: 'Chandigarh', slug: 'chandigarh' },
    { name: 'Indore', slug: 'indore' }, { name: 'Lucknow', slug: 'lucknow' }, { name: 'Kochi', slug: 'kochi' },
    { name: 'Coimbatore', slug: 'coimbatore' }, { name: 'Nashik', slug: 'nashik' }, { name: 'Surat', slug: 'surat' },
    { name: 'Dehradun', slug: 'dehradun' }
  ], []);

  useEffect(() => {
    if (sathiImages.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSathiHubIndex(prev => (prev + 1) % sathiImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [sathiImages.length]);

  const visibleSathiHubs = useMemo(() => {
    if (sathiImages.length === 0) return [];
    const visible = [];
    for (let i = 0; i < Math.min(6, sathiImages.length); i++) {
      visible.push(sathiImages[(currentSathiHubIndex + i) % sathiImages.length]);
    }
    return visible;
  }, [sathiImages, currentSathiHubIndex]);

  const services = useMemo(() => [
    { emoji: '👴', title: 'Elder Care', description: 'Senior assistance & daily support', price: '₹1000/hour', gradient: 'from-purple-400 to-purple-600' },
    { emoji: '🤝', title: 'Hangingout', description: 'Casual social time together', price: '₹1500/hour', gradient: 'from-pink-400 to-pink-600' },
    { emoji: '🎉', title: 'Clubbing', description: 'Nightlife & party assistance', price: '₹2000/hour', gradient: 'from-indigo-400 to-indigo-600' },
    { emoji: '🎬', title: 'Movie Partner', description: 'Watch together, share laughs', price: '₹2000/hour', gradient: 'from-violet-400 to-violet-600' },
    { emoji: '🛍️', title: 'Shopping Buddy', description: 'Groceries, errands, or shopping', price: '₹2000/hour', gradient: 'from-fuchsia-400 to-fuchsia-600' },
    { emoji: '🩺', title: 'Medical Support', description: 'Hospital & appointment assistance', price: '₹2000/hour', gradient: 'from-purple-500 to-pink-500' },
    { emoji: '🏠', title: 'Domestic Help', description: 'Light support & organizing', price: '₹2000/hour', gradient: 'from-cyan-400 to-blue-600' },
    { emoji: '✈️', title: 'Travel Partner', description: 'Explore and travel together', price: '₹2000/hour', gradient: 'from-rose-400 to-rose-600' },
  ], []);

  const features = [
    { icon: <Sparkles className="w-8 h-8" />, title: 'Multiple Services', description: 'From elder care to clubbing - all your needs covered.', color: 'text-purple-600' },
    { icon: <Shield className="w-8 h-8" />, title: 'Safe & Professional', description: 'Strictly professional, consent-first interactions.', color: 'text-pink-600' },
    { icon: <Star className="w-8 h-8" />, title: 'Verified Partners', description: 'All SathiHubs with verified profiles & reviews.', color: 'text-indigo-600' },
    { icon: <Users className="w-8 h-8" />, title: 'Nearby', description: 'Choose SathiHubs by city, service, hobby.', color: 'text-violet-600' },
  ];

  const handleGetStarted = () => { if (user) navigate('/dashboard'); else setShowAuthModal(true); };
  const handleBecomePartner = () => { if (user) navigate('/dashboard'); else setShowAuthModal(true); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <Header />

      {/* Celebration Popup */}
      {showCelebrationPopup && (
        <div className="fixed bottom-4 right-4 z-50 animate-slideInRight max-w-xs w-full">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-purple-100">
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 px-4 py-3 relative">
              <button onClick={closeCelebrationPopup} className="absolute top-2 right-2 w-6 h-6 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition">
                <X size={14} />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">10 Lac+ Family! 🎉</p>
                  <p className="text-white/80 text-xs">Thank You India!</p>
                </div>
              </div>
            </div>
            <div className="p-3">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-2 mb-3 text-center">
                <p className="text-green-700 font-bold text-lg">Up to 60% OFF</p>
                <p className="text-green-600 text-xs">Limited Time Celebration!</p>
              </div>
              <div className="flex gap-2 mb-3">
                <div className="flex-1 bg-purple-50 rounded-lg p-2 text-center"><p className="text-sm font-bold text-purple-600">10L+</p><p className="text-[10px] text-gray-500">Members</p></div>
                <div className="flex-1 bg-pink-50 rounded-lg p-2 text-center"><p className="text-sm font-bold text-pink-600">500+</p><p className="text-[10px] text-gray-500">Cities</p></div>
                <div className="flex-1 bg-green-50 rounded-lg p-2 text-center"><p className="text-sm font-bold text-green-600">#1</p><p className="text-[10px] text-gray-500">India</p></div>
              </div>
              <button onClick={() => { closeCelebrationPopup(); handleBecomePartner(); }}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 rounded-lg font-semibold text-sm hover:shadow-lg transition">
                Join Now - 60% OFF →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4" data-testid="hero-section">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block mb-4">
            <span className="bg-purple-100 text-purple-700 px-5 py-2 rounded-full text-sm font-semibold animate-pulse">
              🏆 India's #1 Social & Lifestyle Support Services Platform
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">SathiHub in India</span>
            <br /><span className="text-gray-800">Professional Social Support Services</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Safe, verified, professional SathiHubs across {operationalCities.slice(0, 5).map(c => c.name).join(', ')} and {operationalCities.length - 5}+ more cities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={handleGetStarted}
              className="group bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2">
              <span>Find a SathiHub</span><span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
            <button onClick={handleBecomePartner}
              className="group bg-white border-2 border-purple-600 text-purple-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-purple-50 transform hover:scale-105 transition-all duration-300 shadow-lg flex items-center justify-center space-x-2">
              <span>Become a SathiHub</span><span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 max-w-4xl mx-auto">
            <div className="bg-purple-50 p-4 rounded-xl text-center"><p className="text-2xl font-bold text-purple-600">{activeSathiHubsCount.toLocaleString()}</p><p className="text-sm text-gray-600">Active SathiHubs</p></div>
            <div className="bg-pink-50 p-4 rounded-xl text-center"><p className="text-2xl font-bold text-pink-600">4.8★</p><p className="text-sm text-gray-600">Average Rating</p></div>
            <div className="bg-green-50 p-4 rounded-xl text-center"><p className="text-2xl font-bold text-green-600">24/7</p><p className="text-sm text-gray-600">Available</p></div>
            <div className="bg-blue-50 p-4 rounded-xl text-center"><p className="text-2xl font-bold text-blue-600">100%</p><p className="text-sm text-gray-600">Verified</p></div>
          </div>
        </div>
      </section>

      {/* Live SathiHubs */}
      {hasRealSathiHubs && (
        <section className="py-10 px-4 bg-gradient-to-b from-white to-purple-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
                  <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span></span>
                  Live Now
                </div>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">SathiHubs Online</h2>
              <p className="text-gray-500 text-sm">{liveSathiHubs.length} verified SathiHubs ready to connect</p>
            </div>
            {isLoadingSathiHubs ? (
              <div className="flex justify-center items-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div></div>
            ) : (
              <>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
                  {visibleSathiHubs.map((partner, index) => (
                    <div key={`${partner?.id || index}-${currentSathiHubIndex}`}
                      className="group relative bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100"
                      onClick={handleGetStarted}>
                      <div className="relative">
                        <img src={partner?.image} alt={partner?.name || 'SathiHub'} loading="lazy"
                          className="w-full h-28 md:h-32 object-cover"
                          onError={(e) => { e.target.src = 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=200'; }} />
                        <div className="absolute top-2 right-2">
                          <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-2 border-white"></span></span>
                        </div>
                        {partner.isReal && <div className="absolute bottom-1 left-1 bg-purple-600 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">Verified</div>}
                      </div>
                      <div className="p-2.5 text-center">
                        <h3 className="font-semibold text-gray-800 text-sm truncate">{partner.name}</h3>
                        <p className="text-xs text-gray-500">{partner.city}</p>
                        <div className="flex items-center justify-center gap-0.5 mt-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /><span className="text-xs font-medium text-gray-600">{partner.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-6">
                  <button onClick={handleGetStarted}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                    View All SathiHubs <span>→</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* SEO Content */}
      <section className="py-12 px-4 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Professional Social Support Service Across India</h2>
            <div className="prose prose-lg max-w-none text-gray-700">
              <p className="text-lg leading-relaxed mb-4">Looking for trusted <strong>social support service in India</strong>? SathiHub is <strong>India's #1 Social & Lifestyle Support Services Platform</strong>.</p>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 my-8">
                {operationalCities.map((city, index) => (
                  <Link key={city.slug} to={`/city/${city.slug}`}
                    className={`p-3 rounded-xl text-center text-sm font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center gap-1 ${
                      index % 4 === 0 ? 'bg-purple-50 text-purple-700 hover:bg-purple-100' :
                      index % 4 === 1 ? 'bg-pink-50 text-pink-700 hover:bg-pink-100' :
                      index % 4 === 2 ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' :
                      'bg-violet-50 text-violet-700 hover:bg-violet-100'}`}>
                    <MapPin className="w-3 h-3" />{city.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-12 px-4 bg-white/50 backdrop-blur-sm" data-testid="services-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Our Services</h2>
            <p className="text-lg text-gray-600">Choose from our wide range of professional support services</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <div key={index} className="group bg-white p-6 rounded-3xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer border border-purple-100">
                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">{service.emoji}</div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">{service.title}</h3>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">{service.description}</p>
                <p className={`text-2xl font-bold bg-gradient-to-r ${service.gradient} bg-clip-text text-transparent mb-4`}>{service.price}</p>
                <button onClick={handleGetStarted}
                  className={`w-full bg-gradient-to-r ${service.gradient} text-white py-2.5 rounded-xl font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-sm`}>
                  Book Now →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="why-choose" className="py-12 px-4" data-testid="why-choose-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Why Choose Us</h2>
            <p className="text-lg text-gray-600">India's #1 Trusted Social & Lifestyle Support Platform</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="group text-center bg-white p-6 rounded-3xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 mb-4 ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 px-4 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">SathiHub Success Stories</h2>
            <p className="text-lg text-gray-600">Real earnings from real SathiHubs</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((t, index) => (
              <div key={index} className="bg-white rounded-3xl shadow-xl p-6 md:p-8 transform hover:scale-[1.02] transition-all duration-300">
                <div className="flex items-start gap-4">
                  <img src={t.image} alt={t.name} className="w-16 h-16 rounded-full object-cover border-4 border-green-200" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div><h3 className="font-bold text-gray-800">{t.name}</h3><p className="text-sm text-gray-500">{t.city} • SathiHub for {t.duration}</p></div>
                      <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold text-sm">{t.earning}/month</div>
                    </div>
                    <div className="relative">
                      <Quote className="absolute -top-2 -left-2 w-8 h-8 text-green-200" />
                      <p className="text-gray-600 pl-6 italic leading-relaxed">{t.quote}</p>
                    </div>
                    <div className="flex items-center mt-4">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <button onClick={handleBecomePartner}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              Start Your Earning Journey →
            </button>
          </div>
        </div>
      </section>

      {/* Earning Section */}
      <section className="py-12 px-4 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Earn Upto ₹2,000 Per Hour</h2>
          <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto opacity-95">Join India's #1 social support platform. Set your own rates, choose your services, and earn while helping others.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-5 transform hover:scale-105 transition-all duration-300"><p className="text-4xl md:text-5xl font-bold mb-2">₹2K/hr</p><p className="text-green-50 text-sm">Earn Per Hour</p></div>
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-5 transform hover:scale-105 transition-all duration-300"><p className="text-4xl md:text-5xl font-bold mb-2">80%</p><p className="text-green-50 text-sm">You Keep</p></div>
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-5 transform hover:scale-105 transition-all duration-300"><p className="text-4xl md:text-5xl font-bold mb-2">20+</p><p className="text-green-50 text-sm">Cities</p></div>
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-5 transform hover:scale-105 transition-all duration-300 relative">
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">-60%</span>
              <p className="text-4xl md:text-5xl font-bold mb-2">₹199</p><p className="text-green-50 text-sm">Membership From</p>
            </div>
          </div>
          <button onClick={handleBecomePartner}
            className="bg-white text-green-600 px-10 py-4 rounded-full text-lg font-bold hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
            Start Earning Today →
          </button>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-12 px-4 bg-gradient-to-br from-purple-50 to-pink-50" data-testid="pricing-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Transparent Pricing</h2>
            <p className="text-lg text-gray-600">Clear and upfront pricing with no hidden fees</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-3xl shadow-2xl border-2 border-purple-100 transform hover:scale-105 transition-all duration-300">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 mb-3"><Users className="w-7 h-7 text-purple-600" /></div>
                <h3 className="text-2xl font-bold mb-2 text-gray-800">For Clients</h3>
              </div>
              <div className="space-y-4 mb-6">
                {[['Elder Care', '₹1000/hr'], ['Hangingout', '₹1500/hr'], ['Clubbing & Events', '₹2000/hr']].map(([name, price]) => (
                  <div key={name} className="flex justify-between items-center border-b border-gray-100 pb-3">
                    <span className="text-gray-700">{name}</span><span className="font-bold text-xl text-purple-600">{price}</span>
                  </div>
                ))}
              </div>
              <button onClick={handleGetStarted} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl text-base font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-200">Get Started →</button>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-2xl border-2 border-green-100 transform hover:scale-105 transition-all duration-300">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 mb-3"><Star className="w-7 h-7 text-green-600" /></div>
                <h3 className="text-2xl font-bold mb-2 text-gray-800">For SathiHubs</h3>
              </div>
              <div className="space-y-2 mb-6">
                {[['6 Months', '₹500', '₹199'], ['1 Year ⭐ Popular', '₹1000', '₹499'], ['Lifetime', '₹2000', '₹999']].map(([plan, old, price]) => (
                  <div key={plan} className={`flex justify-between items-center p-2 rounded-lg ${plan.includes('Popular') ? 'bg-amber-50 border-2 border-amber-300' : 'bg-gray-50'}`}>
                    <span className="text-gray-700 text-sm font-medium">{plan}</span>
                    <div className="text-right"><span className="text-xs text-gray-400 line-through mr-1">{old}</span><span className="font-bold text-green-600">{price} + GST</span></div>
                  </div>
                ))}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-4 mt-3">
                  <p className="text-green-800 font-bold">💰 Earn Upto ₹2,000 Per Hour</p>
                  <p className="text-green-600 text-sm">Based on your availability & services</p>
                </div>
              </div>
              <button onClick={handleBecomePartner} className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl text-base font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-200">Join Now →</button>
            </div>
          </div>
        </div>
      </section>

      {/* Cities */}
      <section className="py-12 px-4 bg-white" id="cities">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">SathiHub Services in Your City</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { region: 'North India', color: 'purple', cities: [['delhi','Delhi NCR'],['noida','Noida'],['gurgaon','Gurgaon'],['jaipur','Jaipur'],['chandigarh','Chandigarh'],['lucknow','Lucknow'],['dehradun','Dehradun'],['indore','Indore']] },
              { region: 'West & Central India', color: 'pink', cities: [['mumbai','Mumbai'],['pune','Pune'],['ahmedabad','Ahmedabad'],['surat','Surat'],['nashik','Nashik']] },
              { region: 'South & East India', color: 'indigo', cities: [['bangalore','Bangalore'],['chennai','Chennai'],['hyderabad','Hyderabad'],['kolkata','Kolkata'],['kochi','Kochi'],['coimbatore','Coimbatore']] },
            ].map(({ region, color, cities }) => (
              <div key={region} className={`bg-${color}-50 p-6 rounded-2xl`}>
                <h3 className={`text-xl font-bold mb-3 text-${color}-900`}>{region}</h3>
                <ul className="text-sm space-y-2">
                  {cities.map(([slug, name]) => (
                    <li key={slug}><Link to={`/city/${slug}`} className={`text-${color}-700 hover:text-${color}-900 hover:underline flex items-center gap-1`}><MapPin className="w-3 h-3" /> SathiHub in {name}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 px-4 bg-gradient-to-br from-purple-50 to-pink-50" id="faq">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {[
              { q: 'What is SathiHub?', a: 'SathiHub is India\'s #1 Social & Lifestyle Support Services Platform connecting people with verified SathiHubs for safe, professional support services.' },
              { q: 'How do I find a SathiHub near me?', a: 'Sign up, select your city, browse verified SathiHubs by service and rating, and book a session.' },
              { q: 'What services does SathiHub offer?', a: 'Elder Care (₹1,000/hr), Hangingout (₹1,500/hr), Clubbing, Movie Partner, Shopping Buddy, Medical Support, Travel Partner — all from ₹1,000-₹2,000/hr.' },
              { q: 'Is SathiHub safe?', a: 'Yes! All SathiHubs are background verified, trained professionals committed to strict boundaries and consent-first interactions.' },
              { q: 'How much can I earn as a SathiHub?', a: 'Earn up to ₹2,000/hour, keeping 80% of all earnings. Membership starts at just ₹199 for 6 months.' },
              { q: 'Is SathiHub a dating service?', a: 'No! SathiHub is strictly a professional social support platform. All interactions are professional with clear code of conduct.' },
            ].map(({ q, a }) => (
              <details key={q} className="bg-white rounded-2xl shadow-lg group">
                <summary className="flex justify-between items-center cursor-pointer p-6 font-semibold text-gray-800 text-lg">
                  <span>{q}</span><span className="text-purple-600 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-6 pb-6 text-gray-600 leading-relaxed">{a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <LoginModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};

export default HomePage;
