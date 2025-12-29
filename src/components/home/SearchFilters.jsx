import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

const regions = [
  { value: 'all', label: 'כל הארץ' },
  { value: 'north', label: 'צפון' },
  { value: 'center', label: 'מרכז' },
  { value: 'south', label: 'דרום' },
  { value: 'jerusalem', label: 'ירושלים' },
  { value: 'sharon', label: 'שרון' },
  { value: 'shfela', label: 'שפלה' }
];

const roles = [
  { value: 'all', label: 'כל התפקידים' },
  { value: 'waiter', label: 'מלצר' },
  { value: 'head_waiter', label: 'רב מלצרים' },
  { value: 'production_worker', label: 'עובד פס' },
  { value: 'bartender', label: 'ברמן' },
  { value: 'event_manager', label: 'מנהל אירוע' }
];

export default function SearchFilters({ filters, onChange }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-[#D4AF37]">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="חיפוש לפי עיר או שם"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="pr-10 border-gray-200 focus:border-[#D4AF37]"
          />
        </div>

        <Select
          value={filters.region}
          onValueChange={(value) => onChange({ ...filters, region: value })}
        >
          <SelectTrigger className="border-gray-200 focus:border-[#D4AF37]">
            <SelectValue placeholder="אזור" />
          </SelectTrigger>
          <SelectContent>
            {regions.map((region) => (
              <SelectItem key={region.value} value={region.value}>
                {region.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.role}
          onValueChange={(value) => onChange({ ...filters, role: value })}
        >
          <SelectTrigger className="border-gray-200 focus:border-[#D4AF37]">
            <SelectValue placeholder="תפקיד" />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
              <SelectItem key={role.value} value={role.value}>
                {role.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="number"
          placeholder="מחיר מקסימלי"
          value={filters.maxPrice}
          onChange={(e) => onChange({ ...filters, maxPrice: e.target.value })}
          className="border-gray-200 focus:border-[#D4AF37]"
        />
      </div>
    </div>
  );
}