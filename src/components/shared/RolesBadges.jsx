import React from 'react';
import { Badge } from '@/components/ui/badge';

const roleLabels = {
  waiter: 'מלצר',
  head_waiter: 'רב מלצרים',
  production_worker: 'עובד פס',
  bartender: 'ברמן',
  event_manager: 'מנהל אירוע'
};

export default function RolesBadges({ roles }) {
  if (!roles || roles.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {roles.map((role) => (
        <Badge
          key={role}
          className="bg-[#D4AF37] text-[#1a1a1a] hover:bg-[#B8941F] border-0 font-medium"
        >
          {roleLabels[role] || role}
        </Badge>
      ))}
    </div>
  );
}