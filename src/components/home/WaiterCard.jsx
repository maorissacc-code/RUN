import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, DollarSign, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import ProfileImage from '../profile/ProfileImage';
import RolesBadges from '../shared/RolesBadges';
import StarRating from '../shared/StarRating';

const regionLabels = {
  north: 'צפון',
  center: 'מרכז',
  south: 'דרום',
  jerusalem: 'ירושלים',
  sharon: 'שרון',
  shfela: 'שפלה'
};

const roleLabels = {
  waiter: 'מלצר',
  head_waiter: 'רב מלצרים',
  production_worker: 'עובד פס',
  bartender: 'ברמן',
  event_manager: 'מנהל אירוע'
};

export default function WaiterCard({ waiter, averageRating, totalRatings }) {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const cachedUser = localStorage.getItem('waiter_user');
    if (cachedUser) {
      setCurrentUser(JSON.parse(cachedUser));
    }
  }, []);
  return (
    <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
      <div className="h-2 bg-gradient-to-r from-[#D4AF37] to-[#B8941F]" />
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center mb-4">
          <ProfileImage imageUrl={waiter.profile_image} size="md" />
          <h3 className="text-xl font-bold mt-4 text-[#1a1a1a]">{waiter.full_name}</h3>
          
          {averageRating > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <StarRating rating={averageRating} size="sm" />
              <span className="text-sm text-gray-600">({totalRatings})</span>
            </div>
          )}
        </div>

        <div className="space-y-3 mb-4">
          <div>
            {waiter.roles && waiter.roles.length > 0 && (
              <div className="space-y-2">
                {waiter.roles.map(role => (
                  <div key={role} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      {roleLabels[role]}
                    </span>
                    {waiter.role_prices?.[role] && (
                      <span className="text-sm font-bold text-[#D4AF37]">
                        ₪{waiter.role_prices[role]}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-sm">{waiter.city}, {regionLabels[waiter.region]}</span>
          </div>

          {waiter.experience_years && (
            <div className="flex items-center gap-2 text-gray-600">
              <Briefcase className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-sm">{waiter.experience_years} שנות ניסיון</span>
            </div>
          )}
        </div>

        {waiter.bio && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-3">{waiter.bio}</p>
        )}

        {currentUser && currentUser.id !== waiter.id ? (
          <Link to={createPageUrl(`WaiterProfile?id=${waiter.id}`)}>
            <Button className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-[#1a1a1a] transition-all font-bold">
              שלח בקשת עבודה
            </Button>
          </Link>
        ) : (
          <Link to={createPageUrl(`WaiterProfile?id=${waiter.id}`)}>
            <Button className="w-full bg-[#1a1a1a] hover:bg-[#D4AF37] hover:text-[#1a1a1a] transition-all">
              צפה בפרופיל המלא
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}