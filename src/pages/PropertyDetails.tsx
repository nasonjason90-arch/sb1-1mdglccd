import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import MapView from '../components/MapView';
import { 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Heart, 
  Share2, 
  Phone, 
  Mail, 
  Calendar,
  CheckCircle,
  Home,
  Car,
  Wifi,
  Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

function Reviews({ propertyId }: { propertyId: string }) {
  const { user } = useAuth();
  const [list, setList] = useState<any[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const load = async () => {
    try {
      const { apiGet } = await import('../services/api');
      const rows = await apiGet<any[]>(`reviews?property_id=${encodeURIComponent(propertyId)}`);
      setList(rows);
    } catch {}
  };
  useEffect(() => { load(); }, [propertyId]);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { alert('Please sign in to leave a review.'); return; }
    try {
      const { apiPost } = await import('../services/api');
      await apiPost('reviews', { property_id: propertyId, user_id: user.id, rating, comment });
      setComment('');
      setRating(5);
      await load();
    } catch { alert('Could not submit review'); }
  };
  return (
    <div>
      <form onSubmit={submit} className="mb-4 space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
          <select value={rating} onChange={(e) => setRating(parseInt(e.target.value))} className="px-3 py-2 border rounded-md">
            {[5,4,3,2,1].map(r => (<option key={r} value={r}>{r} star{r>1?'s':''}</option>))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
          <textarea value={comment} onChange={(e)=>setComment(e.target.value)} rows={3} className="w-full px-3 py-2 border rounded-md" />
        </div>
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">Submit Review</button>
      </form>
      <div className="space-y-3">
        {list.length === 0 && <div className="text-sm text-gray-600">No reviews yet.</div>}
        {list.map((r) => (
          <div key={r.id} className="border rounded-md p-3">
            <div className="text-sm text-gray-700">Rating: {r.rating}/5</div>
            {r.comment && <div className="text-gray-800">{r.comment}</div>}
            <div className="text-xs text-gray-500">{new Date(r.created_at).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Mock property data
const mockProperty = {
  id: '1',
  title: '3 Bedroom House in Kabulonga',
  location: 'Kabulonga, Lusaka',
  price: 12000,
  type: 'house',
  listing_type: 'rent' as 'rent' | 'sale',
  bedrooms: 3,
  bathrooms: 2,
  area: 150,
  images: [
    'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  features: ['Swimming Pool', 'Garden', 'Garage', 'Security', 'WiFi', 'Solar Power'],
  description: `Beautiful 3-bedroom house located in the prestigious Kabulonga area. This modern home features spacious rooms, a large garden, and excellent security. Perfect for families looking for comfort and convenience in one of Lusaka's most sought-after neighborhoods.

The property includes a swimming pool, mature garden, double garage, and 24/7 security. All bedrooms are ensuite with built-in wardrobes. The kitchen is fully fitted with modern appliances and has a separate laundry area.`,
  coordinates: { lat: -15.3875, lng: 28.3228 },
  agent: {
    name: 'John Mwanza',
    phone: '+260-972-630-770',
    email: 'propertyconnect8686@gmail.com',
    company: 'Property Connect Zambia',
    photo: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300'
  },
  available_from: '2024-02-01',
  lease_term: 'Minimum 12 months',
  deposit: 24000, // 2 months deposit
  utilities_included: false
};

export default function PropertyDetails() {
  useEffect(() => { document.title = 'Property Details | ZambiaHomes'; }, []);
  const { id } = useParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: 'I am interested in viewing this property. Please contact me to schedule a viewing.',
    viewing_date: '',
    viewing_time: ''
  });

  const property = mockProperty; // In real app, fetch by ID
  const isSale = property.listing_type === 'sale';
  const priceColor = isSale ? 'text-indigo-600' : 'text-green-600';
  const priceSubtitle = isSale ? 'sale price' : 'per month';

  const handleImageChange = (index: number) => {
    setCurrentImageIndex(index);
  };

  const toggleSaved = () => {
    setIsSaved(!isSaved);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    alert('Your inquiry has been sent! The agent will contact you soon.');
    setShowContactForm(false);
  };

  const formatPrice = (price: number) => {
    return `ZMW ${price.toLocaleString()}`;
  };

  const getFeatureIcon = (feature: string) => {
    switch (feature.toLowerCase()) {
      case 'garage': return Car;
      case 'wifi': return Wifi;
      case 'security': return Shield;
      default: return CheckCircle;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-green-600">Home</Link>
            <span>/</span>
            <Link to="/properties" className="hover:text-green-600">Properties</Link>
            <span>/</span>
            <span className="text-gray-900">{property.title}</span>
          </div>
        </div>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
              <div className="flex items-center text-gray-600 mb-2">
                <MapPin className="h-5 w-5 mr-1" />
                <span>{property.location}</span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Bed className="h-4 w-4 mr-1" />
                  <span>{property.bedrooms} Bedrooms</span>
                </div>
                <div className="flex items-center">
                  <Bath className="h-4 w-4 mr-1" />
                  <span>{property.bathrooms} Bathrooms</span>
                </div>
                <div className="flex items-center">
                  <Square className="h-4 w-4 mr-1" />
                  <span>{property.area}m²</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className={`text-3xl font-bold ${priceColor}`}>
                  {formatPrice(property.price)}
                </div>
                <div className="text-sm text-gray-600 capitalize">{priceSubtitle}</div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={toggleSaved}
                  className={`p-2 rounded-full border-2 transition-colors ${
                    isSaved 
                      ? 'bg-red-50 border-red-300 text-red-600' 
                      : 'bg-white border-gray-300 text-gray-600 hover:border-red-300 hover:text-red-600'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
                </button>
                <button className="p-2 rounded-full border-2 border-gray-300 text-gray-600 hover:border-green-300 hover:text-green-600 transition-colors">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="aspect-video relative">
                <img
                  src={property.images[currentImageIndex]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4">
                  <span className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {property.images.length}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex space-x-2">
                  {property.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => handleImageChange(index)}
                      className={`w-20 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                        index === currentImageIndex ? 'border-green-500' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Property ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Description</h2>
              <div className="prose prose-gray max-w-none">
                {property.description.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Features & Amenities */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Features & Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {property.features.map((feature, index) => {
                  const IconComponent = getFeatureIcon(feature);
                  return (
                    <div key={index} className="flex items-center space-x-3">
                      <IconComponent className="h-5 w-5 text-green-600" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Property Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Property Type:</span>
                    <span className="font-medium text-gray-900 capitalize">{property.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Available From:</span>
                    <span className="font-medium text-gray-900">{property.available_from}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lease Term:</span>
                    <span className="font-medium text-gray-900">{property.lease_term}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly Rent:</span>
                    <span className="font-medium text-gray-900">{formatPrice(property.price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Security Deposit:</span>
                    <span className="font-medium text-gray-900">{formatPrice(property.deposit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Utilities Included:</span>
                    <span className="font-medium text-gray-900">
                      {property.utilities_included ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Reviews</h2>
              <Reviews propertyId={property.id} />
            </div>

            {/* Map */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Location</h2>
              <MapView 
                properties={[property]} 
                center={property.coordinates}
                zoom={16}
                height="h-64"
              />
              <div className="mt-4 flex items-center text-gray-600">
                <MapPin className="h-5 w-5 mr-2" />
                <span>{property.location}</span>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Agent Contact */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Agent</h3>
              <div className="flex items-start space-x-4 mb-4">
                <img
                  src={property.agent.photo}
                  alt={property.agent.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-medium text-gray-900">{property.agent.name}</h4>
                  <p className="text-sm text-gray-600">{property.agent.company}</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">{property.agent.phone}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">{property.agent.email}</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setShowContactForm(true)}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <Calendar className="h-5 w-5" />
                  <span>Schedule Viewing</span>
                </button>
                
                <a
                  href={`tel:${property.agent.phone}`}
                  className="w-full bg-white border-2 border-green-600 text-green-600 py-3 px-4 rounded-md hover:bg-green-50 transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <Phone className="h-5 w-5" />
                  <span>Call Now</span>
                </a>

                <a
                  href={`mailto:${property.agent.email}?subject=Inquiry about ${property.title}`}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-200 transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <Mail className="h-5 w-5" />
                  <span>Send Email</span>
                </a>
              </div>
            </div>

            {/* Quick Facts */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Facts</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Property ID:</span>
                  <span className="font-medium">ZH-{property.id.padStart(6, '0')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Listed:</span>
                  <span className="font-medium">2 days ago</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Views:</span>
                  <span className="font-medium">127</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Inquiries:</span>
                  <span className="font-medium">8</span>
                </div>
              </div>
            </div>

            {/* Similar Properties */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Similar Properties</h3>
              <div className="space-y-4">
                {[1, 2].map((item) => (
                  <div key={item} className="border border-gray-200 rounded-lg p-4">
                    <img
                      src="https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=300"
                      alt="Similar property"
                      className="w-full h-24 object-cover rounded mb-3"
                    />
                    <h4 className="font-medium text-gray-900 text-sm mb-1">
                      2 Bedroom Apartment
                    </h4>
                    <p className="text-xs text-gray-600 mb-2">Rhodes Park, Lusaka</p>
                    <p className="text-green-600 font-medium text-sm">ZMW 8,000/month</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Schedule Viewing</h3>
              <button
                onClick={() => setShowContactForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={contactForm.name}
                  onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={contactForm.email}
                  onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    value={contactForm.viewing_date}
                    onChange={(e) => setContactForm({...contactForm, viewing_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Time
                  </label>
                  <select
                    value={contactForm.viewing_time}
                    onChange={(e) => setContactForm({...contactForm, viewing_time: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Any time</option>
                    <option value="9:00 AM">9:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="2:00 PM">2:00 PM</option>
                    <option value="4:00 PM">4:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  rows={3}
                  value={contactForm.message}
                  onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowContactForm(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                >
                  Send Inquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
