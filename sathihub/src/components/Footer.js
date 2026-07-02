import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import Logo from './Logo';

const Footer = () => {
  const navigate = useNavigate();
  const socialLinks = [
    { name: 'Facebook',  icon: Facebook,  url: 'https://www.facebook.com/share/1FVq1H1AXu/?mibextid=wwXIfr', color: 'hover:text-blue-500' },
    { name: 'Instagram', icon: Instagram, url: 'https://instagram.com/sathihub',                             color: 'hover:text-pink-500' },
    { name: 'Twitter',   icon: Twitter,   url: 'https://twitter.com/sathihub',                               color: 'hover:text-blue-400' },
    { name: 'LinkedIn',  icon: Linkedin,  url: 'https://linkedin.com/company/sathihub',                      color: 'hover:text-blue-600' },
    { name: 'WhatsApp',  icon: FaWhatsapp, url: 'https://wa.me/919810502313',                                 color: 'hover:text-green-500' },
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="font-bold text-lg mb-4 text-purple-300">Company</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><button onClick={() => navigate('/about')} className="hover:text-white transition">About</button></li>
              <li><button onClick={() => navigate('/faq')} className="hover:text-white transition">FAQ</button></li>
              <li><button onClick={() => navigate('/contact')} className="hover:text-white transition">Contact</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4 text-purple-300">Legal</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><button onClick={() => navigate('/privacy')} className="hover:text-white transition">Privacy Policy</button></li>
              <li><button onClick={() => navigate('/terms')} className="hover:text-white transition">Terms</button></li>
              <li><button onClick={() => navigate('/refund')} className="hover:text-white transition">Refund Policy</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4 text-purple-300">Support</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><button onClick={() => navigate('/help')} className="hover:text-white transition">Help Center</button></li>
              <li><button onClick={() => navigate('/code-of-conduct')} className="hover:text-white transition">Code of Conduct</button></li>
              <li><button onClick={() => navigate('/admin-login')} className="hover:text-white transition">Admin Login</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4 text-purple-300">Connect With Us</h4>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social) => (
                <a key={social.name} href={social.url} target="_blank" rel="noopener noreferrer"
                  className={`text-gray-300 ${social.color} transition-colors duration-200 transform hover:scale-110`}>
                  <social.icon size={20} />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="text-center text-gray-400 border-t border-gray-700 pt-6">
          <div className="mb-3">
            <Logo size="md" showText={true} onClick={() => navigate('/')} />
          </div>
          <p>© 2025 SathiHub.in (A unit of SET INDIA BUSINESS PVT LTD). All rights reserved.</p>
          <p className="mt-1 text-sm">Made with ❤️ in India</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
