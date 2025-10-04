# Zambian Property Rental Platform

A comprehensive SaaS platform for property rentals in Zambia, featuring multi-role authentication, Google Maps integration, and payment processing.

## Features

- **Multi-Role Authentication**: Separate dashboards for Property Seekers, Landlords, Real Estate Agents, and Administrators
- **Property Management**: Complete CRUD operations for property listings with photo and video support
- **Google Maps Integration**: Interactive maps showing property locations with custom markers
- **Payment Processing**: Support for card payments and mobile money (MTN, Airtel)
- **30-Day Trial System**: Automatic trial management with subscription tracking
- **Admin Panel**: Comprehensive admin dashboard with user approval workflows
- **Responsive Design**: Mobile-first design optimized for all devices

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Maps**: Google Maps JavaScript API
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Backend**: Supabase (Database + Authentication)
- **Payments**: Stripe + Mobile Money Integration

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Maps API Key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### 2. Google Maps API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. Create credentials (API Key)
5. Restrict the API key to your domain for security
6. Add the API key to your `.env` file

### 3. Supabase Setup

1. Create a new project at [Supabase](https://supabase.com)
2. Click the "Supabase" button in the Bolt settings to configure the database
3. The system will automatically create the necessary tables and security policies

### 4. Payment Setup

For payment processing, visit the Stripe setup link that will be provided in the subscription page.

## Key Features Explained

### Google Maps Integration

- **Interactive Property Maps**: View all properties on a map with custom markers
- **Location Picker**: Drag-and-drop interface for setting property locations
- **Address Autocomplete**: Smart address suggestions restricted to Zambia
- **Fullscreen Mode**: Expandable map view for better property exploration
- **Property Type Markers**: Different colored markers for houses, apartments, offices, and boarding houses

### User Roles & Permissions

- **Property Seekers**: Search and save properties, schedule viewings
- **Landlords**: Manage property listings, track inquiries, view analytics
- **Real Estate Agents**: Advanced property management, client tracking, commission calculator
- **Administrators**: Complete platform oversight, user approval, analytics

### Admin Approval System

- **Automatic Seeker Approval**: Property seekers are approved automatically
- **Manual Agent/Landlord Review**: Agents and landlords require admin approval
- **Document Verification**: Track submitted licenses, IDs, and property documents
- **Approval Workflow**: One-click approve/reject with notification system

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Contact Information

- **Email**: propertyconnect8686@gmail.com
- **Phone**: +260-971-619-186, +260-972-630-770, +260-955-050-476
- **Address**: Plot no 185 Corner of Chuswe and Pemba Road, Chilenje South, Lusaka, Zambia

## License

This project is proprietary software for Property Connect Zambia.