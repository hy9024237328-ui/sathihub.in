import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, authAxios } from '../context/AuthContext';
import { Search, MapPin, Star, Filter, Loader2, Heart, Shield, Clock } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const SERVICES = ['All Services', 'Elder Care', 'Hangingout', 'Clubbing', 'Movie Partner', 'Shopping Buddy', 'Medical Support', 'Domestic Help', 'Travel Partner'];

const CITIES = ['All Cities', 'Delhi', 'Noida', 'Gurgaon', 'Mumbai', 'Bangalore', 'Pune', 'Hyderabad', 'Chennai', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Chandigarh', 'Indore', 'Lucknow'];

// Demo sathis shown when no real sathis in DB yet
const DEMO_SATHIS = [
  { id: '1', name: 'Priya Sharma', city: 'Delhi', rating: 4.9, reviews: 47, hourly_rate: 1500, services: ['Hangingout', 'Shopping Buddy', 'Movie Partner'], bio: 'Friendly and professional companion. Love meeting new people!', photo: 'https://images.pexels.com/photos/7580822/pexels-photo-7580822.jpeg?auto=compress&cs=tinysrgb&w=300', isDemo: true },
  { id: '2', name: 'Anjali Mehta', city: 'Mumbai', rating: 4.8, reviews: 63, hourly_rate: 2000, services: ['Clubbing', 'Travel Partner', 'Hangingout'], bio: 'Adventure lover. Let\'s explore the city together!', photo: 'https://images.pexels.com/photos/7580821/pexels-photo-7580821.jpeg?auto=compress&cs=tinysrgb&w=300', isDemo: true },
  { id: '3', name: 'Sneha Reddy', city: 'Bangalore', rating: 4.7, reviews: 38, hourly_rate: 1000, services: ['Elder Care', 'Medical Support', 'Domestic Help'], bio: 'Caring and patient. Specialized in elder care.', photo: 'https://images.pexels.com/photos/7581115/pexels-photo-7581115.jpeg?auto=compress&cs=tinysrgb&w=300', isDemo: true },
  { id: '4', name: 'Kavita Patel', city: 'Pune', rating: 4.9, reviews: 52, hourly_rate: 1500, services: ['Shopping Buddy', 'Movie Partner', 'Hangingout'], bio: 'Your perfect shopping companion. Great taste!', photo: 'https://images.pexels.com/photos/5738735/pexels-photo-5738735.jpeg?auto=compress&cs=tinysrgb&w=300', isDemo: true },
  { id: '5', name: 'Riya Singh', city: 'Delhi', rating: 4.6, reviews: 29, hourly_rate: 2000, services: ['Clubbing', 'Travel Partner', 'Movie Partner'], bio: 'Party person and travel enthusiast. Let\'s have fun!', photo: 'https://images.pexels.com/photos/7580822/pexels-photo-7580822.jpeg?auto=compress&cs=tinysrgb&w=300', isDemo: true },
  { id: '6', name: 'Meera Joshi', city: 'Mumbai', rating: 4.8, reviews: 41, hourly_rate: 1000, services: ['Elder Care', 'Medical Support'], bio: 'Experienced elder care specialist. Gentle and reliable.', photo: 'https://images.pexels.com/photos/7581115/pexels-photo-7581115.jpeg?auto=compress&cs=tinysrgb&w=300', isDemo: true },
];

const FindSathiHub = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sathis, setSathis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('All Cities');
  const [searchService, setSearchService] = useState('All Services');
  const [searchName, setSearchName] = useState('');
  const [sort, setSort] = useState('rating');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchSathis = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ sort, page_size: 20 });
        if (searchCity !== 'All Cities') params.append('city', searchCity);
        if (searchService !== 'All Services') params.append('service', searchService);
        const res = await authAxios.get(`/api/v1/search/sathis?${params}`);
        const real = res.data.data?.sathis || [];
        // Show demo sathis if no real ones yet
        setSathis(real.length > 0 ? real : DEMO_SATHIS);
      } catch {
        setSathis(DEMO_SATHIS);
      } finally {
        setLoading(false);
      }
    };
    fetchSathis();
  }, [searchCity, searchService, sort]);

  // Client-side name filter
  const displayed = sathis.filter(s => {
    const name = s.name || s.profile?.name || '';
    return name.toLowerCase().includes(searchName.toLowerCase());
  });

  const handleBook = (sathi) => {
    navigate('/book', { state: { 
      sathiId: sathi.user?.id || sathi.id, 
      sathiName: sathi.name || sathi.profile?.name,
      serviceType: sathi.services?.[0] || 'Hangingout'
    }});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <Header />
      <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto">

        {/* Page Header */}
        <div className="text-center mb-8 pt-4">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Find Your Perfect Sathi
          </h1>
          <p className="text-gray-500">Browse verified, professional Sathis near you</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 border border-purple-100">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Name search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name..."
                value={searchName}
                onChange={e => setSearchName(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-sm"
              />
            </div>
            {/* City */}
            <select value={searchCity} onChange={e => setSearchCity(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-sm bg-white min-w-[140px]">
              {CITIES.map(c => <option key={c}>{c}</option>)}
            </select>
            {/* Service */}
            <select value={searchService} onChange={e => setSearchService(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-sm bg-white min-w-[160px]">
              {SERVICES.map(s => <option key={s}>{s}</option>)}
            </select>
            {/* Sort */}
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-sm bg-white min-w-[140px]">
              <option value="rating">Top Rated</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            {loading ? 'Loading...' : `${displayed.length} Sathis found`}
            {sathis[0]?.isDemo && <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Demo profiles</span>}
          </p>
        </div>

        {/* Sathi Cards */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-lg">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Koi Sathi nahi mila</h3>
            <p className="text-gray-500">Filter change karo ya doosri city try karo</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayed.map(sathi => {
              const name = sathi.name || sathi.profile?.name || 'Sathi';
              const city = sathi.city || sathi.profile?.city || 'India';
              const photo = sathi.photo || sathi.profile?.profile_photo;
              const bio = sathi.bio || sathi.profile?.bio || 'Professional SathiHub companion';
              const rating = sathi.rating || 4.8;
              const reviews = sathi.reviews || sathi.total_reviews || 0;
              const rate = sathi.hourly_rate || 1500;
              const services = sathi.services || [];

              return (
                <div key={sathi.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group">
                  {/* Photo */}
                  <div className="relative h-52 overflow-hidden">
                    {photo ? (
                      <img src={photo} alt={name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={e => { e.target.src = 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=300'; }} />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center">
                        <span className="text-6xl font-bold text-white">{name.charAt(0)}</span>
                      </div>
                    )}
                    {/* Verified badge */}
                    <div className="absolute top-3 left-3 bg-purple-600 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                      <Shield className="w-3 h-3" /> Verified
                    </div>
                    {/* Online dot */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping inline-block"></span>
                      Online
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">{name}</h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{city}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-purple-600 font-bold">₹{rate}/hr</p>
                        <div className="flex items-center gap-1 justify-end">
                          <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-semibold text-gray-700">{rating}</span>
                          {reviews > 0 && <span className="text-xs text-gray-400">({reviews})</span>}
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{bio}</p>

                    {/* Services tags */}
                    {services.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {services.slice(0, 3).map(sv => (
                          <span key={sv} className="bg-purple-50 text-purple-700 text-xs px-2.5 py-1 rounded-full font-medium border border-purple-100">
                            {sv}
                          </span>
                        ))}
                        {services.length > 3 && (
                          <span className="bg-gray-100 text-gray-500 text-xs px-2.5 py-1 rounded-full">+{services.length - 3} more</span>
                        )}
                      </div>
                    )}

                    {/* Book button */}
                    <button onClick={() => handleBook(sathi)}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200">
                      Book Now →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Become a Sathi CTA */}
        <div className="mt-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-2">Want to become a Sathi?</h3>
          <p className="text-purple-100 mb-6">Earn upto ₹2,000/hour helping people. Join thousands of Sathis across India.</p>
          <button onClick={() => navigate('/membership')}
            className="bg-white text-purple-600 px-8 py-3 rounded-full font-bold hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
            Become a Sathi →
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FindSathiHub;
