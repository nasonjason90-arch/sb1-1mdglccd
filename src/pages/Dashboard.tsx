import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import SeekerDashboard from '../components/dashboard/SeekerDashboard';
import LandlordDashboard from '../components/dashboard/LandlordDashboard';
import AgentDashboard from '../components/dashboard/AgentDashboard';

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'seeker':
        return <SeekerDashboard />;
      case 'landlord':
        return <LandlordDashboard />;
      case 'agent':
      case 'agency':
        return <AgentDashboard />;
      default:
        return <div>Invalid user role</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderDashboard()}
    </div>
  );
}
