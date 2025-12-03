'use client';

import { useState } from 'react';
import { Calendar, MapPin, Users, Clock, ArrowRight, Coins } from 'lucide-react';
import { MobileLayout } from '@/components/layout/mobile-layout';
import { ResponsiveContainer } from '@/components/layout/responsive-container';
import Link from 'next/link';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  image: string;
  category: 'cleanup' | 'planting' | 'education' | 'fundraising';
  greenPointsReward: number;
}

export function EventsScreen() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  const upcomingEvents: Event[] = [
    {
      id: '1',
      title: 'Beach Cleanup Drive',
      date: '2024-06-15',
      time: '9:00 AM',
      location: 'Santa Monica Beach',
      attendees: 45,
      image: '/beach-cleanup-volunteers.png',
      category: 'cleanup',
      greenPointsReward: 50,
    },
    {
      id: '2',
      title: 'Community Tree Planting',
      date: '2024-06-20',
      time: '10:00 AM',
      location: 'Central Park',
      attendees: 32,
      image: '/tree-planting-community.png',
      category: 'planting',
      greenPointsReward: 75,
    },
    {
      id: '3',
      title: 'Sustainability Workshop',
      date: '2024-06-25',
      time: '2:00 PM',
      location: 'Community Center',
      attendees: 60,
      image: '/sustainability-workshop.jpg',
      category: 'education',
      greenPointsReward: 30,
    },
  ];

  const pastEvents: Event[] = [
    {
      id: '4',
      title: 'Ocean Conservation Fundraiser',
      date: '2024-05-10',
      time: '6:00 PM',
      location: 'Downtown Hall',
      attendees: 120,
      image: '/ocean-conservation-fundraiser.jpg',
      category: 'fundraising',
      greenPointsReward: 100,
    },
    {
      id: '5',
      title: 'Park Restoration Project',
      date: '2024-05-05',
      time: '8:00 AM',
      location: 'Riverside Park',
      attendees: 78,
      image: '/park-restoration-volunteers.jpg',
      category: 'cleanup',
      greenPointsReward: 60,
    },
  ];

  const events = activeTab === 'upcoming' ? upcomingEvents : pastEvents;

  const getCategoryColor = (category: Event['category']) => {
    const colors = {
      cleanup: 'bg-blue-100 text-blue-700',
      planting: 'bg-green-100 text-green-700',
      education: 'bg-purple-100 text-purple-700',
      fundraising: 'bg-orange-100 text-orange-700',
    };
    return colors[category];
  };

  return (
    <MobileLayout showBottomNav={true}>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-br from-[#1db584] to-[#15a576] pb-6 pt-8">
          <ResponsiveContainer maxWidth="lg" padding="md">
            <h1 className="mb-2 text-3xl font-bold text-white">Events</h1>
            <p className="text-white/90">Join eco-friendly activities and earn green points</p>
          </ResponsiveContainer>
        </div>

        <div className="sticky top-0 z-10 bg-white shadow-sm">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`flex-1 px-4 py-4 text-sm font-semibold transition-colors min-h-[44px] ${
                activeTab === 'upcoming'
                  ? 'border-b-2 border-[#1db584] text-[#1db584]'
                  : 'text-gray-500'
              }`}
            >
              Upcoming Events
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`flex-1 px-4 py-4 text-sm font-semibold transition-colors min-h-[44px] ${
                activeTab === 'past'
                  ? 'border-b-2 border-[#1db584] text-[#1db584]'
                  : 'text-gray-500'
              }`}
            >
              Past Events
            </button>
          </div>
        </div>

        <ResponsiveContainer maxWidth="lg" padding="md">
          <div className="space-y-4">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="block overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <img
                  src={event.image || "/placeholder.svg"}
                  alt={event.title}
                  className="h-48 w-full object-cover"
                />
                <div className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getCategoryColor(event.category)}`}>
                      {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                    </span>
                    <span className="flex items-center gap-1 text-sm font-semibold text-[#1db584]">
                      <Coins className="h-4 w-4" />
                      +{event.greenPointsReward} pts
                    </span>
                  </div>
                  
                  <h3 className="mb-2 text-lg font-bold text-gray-900">{event.title}</h3>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{event.attendees} attendees</span>
                    </div>
                  </div>

                  <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#1db584] px-4 py-2.5 font-semibold text-white hover:bg-[#1db584]/90 min-h-[44px]">
                    {activeTab === 'upcoming' ? 'Register Now' : 'View Details'}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </ResponsiveContainer>
      </div>
    </MobileLayout>
  );
}
