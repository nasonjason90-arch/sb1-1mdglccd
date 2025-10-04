import React from 'react';
import { Home, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Home className="h-8 w-8 text-green-400" />
              <span className="text-xl font-bold">ZambiaHomes</span>
            </div>
            <p className="text-gray-400 mb-4">
              The leading property rental platform in Zambia. Find your perfect home, office, or investment property.
            </p>
            <div className="flex space-x-4">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold">f</span>
              </div>
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold">t</span>
              </div>
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold">in</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/properties" className="text-gray-400 hover:text-green-400 transition-colors">Properties</a></li>
              <li><a href="/signup" className="text-gray-400 hover:text-green-400 transition-colors">Get Started</a></li>
              <li><a href="/about" className="text-gray-400 hover:text-green-400 transition-colors">About Us</a></li>
              <li><a href="/contact" className="text-gray-400 hover:text-green-400 transition-colors">Contact</a></li>
              <li><a href="/help" className="text-gray-400 hover:text-green-400 transition-colors">Help Center</a></li>
            </ul>
          </div>

          {/* Property Types */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Property Types</h3>
            <ul className="space-y-2">
              <li><a href="/properties?type=house" className="text-gray-400 hover:text-green-400 transition-colors">Houses</a></li>
              <li><a href="/properties?type=apartment" className="text-gray-400 hover:text-green-400 transition-colors">Apartments</a></li>
              <li><a href="/properties?type=office" className="text-gray-400 hover:text-green-400 transition-colors">Offices</a></li>
              <li><a href="/properties?type=boarding" className="text-gray-400 hover:text-green-400 transition-colors">Boarding Houses</a></li>
              <li><a href="/properties?type=commercial" className="text-gray-400 hover:text-green-400 transition-colors">Commercial</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-green-400" />
                <span className="text-gray-400">+260-971-619-186</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-green-400" />
                <span className="text-gray-400">propertyconnect8686@gmail.com</span>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="h-5 w-5 text-green-400 mt-1" />
                <span className="text-gray-400">
                  Plot no 185 Corner of Chuswe and Pemba Road<br />
                  Chilenje South, Lusaka, Zambia
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 ZambiaHomes. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="/privacy" className="text-gray-400 hover:text-green-400 text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="text-gray-400 hover:text-green-400 text-sm transition-colors">
                Terms of Service
              </a>
              <a href="/cookies" className="text-gray-400 hover:text-green-400 text-sm transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
