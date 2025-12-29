import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import SearchFilters from '../components/home/SearchFilters';
import WaiterCard from '../components/home/WaiterCard';
import { Button } from '@/components/ui/button';
import { Loader2, UserPlus, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Home() {
  const [filters, setFilters] = useState({
    search: '',
    region: 'all',
    role: 'all',
    maxPrice: ''
  });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['waiters'],
    queryFn: async () => {
      const response = await base44.functions.invoke('listWaiters');
      return response.data.users || [];
    }
  });

  const { data: ratings = [] } = useQuery({
    queryKey: ['ratings'],
    queryFn: () => base44.entities.Rating.list()
  });

  const getWaiterRating = (waiterId) => {
    const waiterRatings = ratings.filter(r => r.waiter_id === waiterId);
    if (waiterRatings.length === 0) return { average: 0, total: 0 };
    
    const sum = waiterRatings.reduce((acc, r) => acc + r.rating, 0);
    return {
      average: sum / waiterRatings.length,
      total: waiterRatings.length
    };
  };

  const filteredWaiters = users.filter(user => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        user.full_name?.toLowerCase().includes(searchLower) ||
        user.city?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    if (filters.region !== 'all' && user.region !== filters.region) {
      return false;
    }

    if (filters.role !== 'all' && (!user.roles || !user.roles.includes(filters.role))) {
      return false;
    }

    if (filters.maxPrice && user.price_per_event > parseFloat(filters.maxPrice)) {
      return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="bg-gradient-to-r from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">
            שירות <span className="text-[#D4AF37]">מלצרות</span>
          </h1>
          <p className="text-xl text-gray-300">
            המקום למצוא את הצוות המושלם לאירוע שלך
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8 mb-12">
        <SearchFilters filters={filters} onChange={setFilters} />
      </div>

      <div className="container mx-auto px-4 pb-16">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
          </div>
        ) : filteredWaiters.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500">לא נמצאו תוצאות</p>
            <p className="text-gray-400 mt-2">נסה לשנות את הפילטרים</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredWaiters.map(waiter => {
              const { average, total } = getWaiterRating(waiter.id);
              return (
                <WaiterCard
                  key={waiter.id}
                  waiter={waiter}
                  averageRating={average}
                  totalRatings={total}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}