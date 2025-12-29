import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, MapPin, DollarSign, Briefcase, Send, Star } from 'lucide-react';
import { toast } from 'sonner';
import ProfileImage from '../components/profile/ProfileImage';
import RolesBadges from '../components/shared/RolesBadges';
import StarRating from '../components/shared/StarRating';

const regionLabels = {
  north: 'צפון',
  center: 'מרכז',
  south: 'דרום',
  jerusalem: 'ירושלים',
  sharon: 'שרון',
  shfela: 'שפלה'
};

const roleOptions = [
  { value: 'waiter', label: 'מלצר' },
  { value: 'head_waiter', label: 'רב מלצרים' },
  { value: 'production_worker', label: 'עובד פס' },
  { value: 'bartender', label: 'ברמן' }
];

export default function WaiterProfile() {
  const [currentUser, setCurrentUser] = useState(null);
  const [waiter, setWaiter] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    event_date: '',
    event_location: '',
    event_type: '',
    requested_role: '',
    price_offered: '',
    notes: ''
  });
  const queryClient = useQueryClient();

  const urlParams = new URLSearchParams(window.location.search);
  const waiterId = urlParams.get('id');

  useEffect(() => {
    const loadData = async () => {
      const cachedUser = localStorage.getItem('waiter_user');
      if (cachedUser) {
        setCurrentUser(JSON.parse(cachedUser));
      }

      if (waiterId) {
        const users = await base44.entities.WaiterUser.list();
        const foundWaiter = users.find(u => u.id === parseInt(waiterId));
        setWaiter(foundWaiter || 'not_found');
      }
    };
    loadData();
  }, [waiterId]);

  const { data: ratings = [] } = useQuery({
    queryKey: ['ratings', waiterId],
    queryFn: () => base44.entities.Rating.filter({ waiter_id: waiterId }),
    enabled: !!waiterId
  });

  const sendRequestMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.JobRequest.create({
        ...data,
        event_manager_id: currentUser.id,
        event_manager_name: currentUser.full_name,
        waiter_id: waiterId,
        waiter_name: waiter.full_name,
        status: 'pending'
      });
    },
    onSuccess: () => {
      toast.success('הבקשה נשלחה בהצלחה!');
      setDialogOpen(false);
      setFormData({
        event_date: '',
        event_location: '',
        event_type: '',
        requested_role: '',
        price_offered: '',
        notes: ''
      });
    },
    onError: () => {
      toast.error('שגיאה בשליחת הבקשה');
    }
  });

  const handleSendRequest = () => {
    if (!formData.event_date || !formData.requested_role || !formData.price_offered) {
      toast.error('נא למלא את כל השדות החובה');
      return;
    }
    sendRequestMutation.mutate(formData);
  };

  const averageRating = ratings.length > 0
    ? ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length
    : 0;

  if (waiter === 'not_found') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-500">המלצר לא נמצא</div>
      </div>
    );
  }

  if (!waiter) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  const canSendRequest = currentUser && currentUser.id !== waiterId;
  const availableRoles = waiter.roles || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="border-t-4 border-[#D4AF37] shadow-2xl">
          <CardContent className="p-8">
            <div className="flex flex-col items-center mb-8">
              <ProfileImage imageUrl={waiter.profile_image} size="xl" />
              <h1 className="text-4xl font-bold mt-6 text-[#1a1a1a]">{waiter.full_name}</h1>

              {averageRating > 0 && (
                <div className="flex items-center gap-3 mt-4">
                  <StarRating rating={averageRating} size="lg" />
                  <span className="text-2xl font-semibold text-[#D4AF37]">
                    {averageRating.toFixed(1)}
                  </span>
                  <span className="text-gray-600">({ratings.length} דירוגים)</span>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">תפקידים</h3>
                <RolesBadges roles={waiter.roles} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {waiter.city && (
                  <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg">
                    <MapPin className="w-5 h-5 text-[#D4AF37]" />
                    <div>
                      <div className="text-sm text-gray-600">מיקום</div>
                      <div className="font-semibold">{waiter.city}, {regionLabels[waiter.region]}</div>
                    </div>
                  </div>
                )}

                {(waiter.role_prices && Object.keys(waiter.role_prices).length > 0) ? (
                  <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg">
                    <DollarSign className="w-5 h-5 text-[#D4AF37]" />
                    <div className="w-full">
                      <div className="text-sm text-gray-600 mb-2">מחירים לפי תפקיד</div>
                      <div className="space-y-1">
                        {waiter.roles?.map(role => (
                          waiter.role_prices[role] && (
                            <div key={role} className="flex justify-between">
                              <span className="text-sm">{roleOptions.find(r => r.value === role)?.label}:</span>
                              <span className="font-semibold text-[#D4AF37]">₪{waiter.role_prices[role]}</span>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  </div>
                ) : waiter.price_per_event ? (
                  <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg">
                    <DollarSign className="w-5 h-5 text-[#D4AF37]" />
                    <div>
                      <div className="text-sm text-gray-600">מחיר פר ערב</div>
                      <div className="font-semibold text-lg text-[#D4AF37]">₪{waiter.price_per_event}</div>
                    </div>
                  </div>
                ) : null}

                {waiter.experience_years && (
                  <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg">
                    <Briefcase className="w-5 h-5 text-[#D4AF37]" />
                    <div>
                      <div className="text-sm text-gray-600">ניסיון</div>
                      <div className="font-semibold">{waiter.experience_years} שנים</div>
                    </div>
                  </div>
                )}
              </div>

              {waiter.bio && (
                <div>
                  <h3 className="text-xl font-semibold mb-3">אודות</h3>
                  <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                    {waiter.bio}
                  </p>
                </div>
              )}

              {ratings.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">דירוגים וחוות דעת</h3>
                  <div className="space-y-4">
                    {ratings.map(rating => (
                      <Card key={rating.id} className="bg-gray-50">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="font-semibold">{rating.event_manager_name}</div>
                              <StarRating rating={rating.rating} size="sm" />
                            </div>
                          </div>
                          {rating.review && (
                            <p className="text-gray-700 mt-2">{rating.review}</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {canSendRequest && (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-[#1a1a1a] text-lg py-6">
                      <Send className="w-5 h-5 ml-2" />
                      שלח בקשת עבודה
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>שליחת בקשת עבודה ל{waiter.full_name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label>תאריך האירוע *</Label>
                        <Input
                          type="date"
                          value={formData.event_date}
                          onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label>מיקום האירוע</Label>
                        <Input
                          value={formData.event_location}
                          onChange={(e) => setFormData({ ...formData, event_location: e.target.value })}
                          placeholder="אולם אירועים XYZ"
                        />
                      </div>

                      <div>
                        <Label>סוג האירוע</Label>
                        <Input
                          value={formData.event_type}
                          onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                          placeholder="חתונה, בר מצווה, אירוע עסקי..."
                        />
                      </div>

                      <div>
                        <Label>תפקיד מבוקש *</Label>
                        <Select
                          value={formData.requested_role}
                          onValueChange={(value) => setFormData({ ...formData, requested_role: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="בחר תפקיד" />
                          </SelectTrigger>
                          <SelectContent className="z-[99999] bg-white">
                            {(() => {
                              const filtered = availableRoles.length > 0
                                ? roleOptions.filter(role => availableRoles.includes(role.value))
                                : roleOptions;

                              const optionsToShow = filtered.length > 0 ? filtered : roleOptions;

                              return optionsToShow.map(role => (
                                <SelectItem key={role.value} value={role.value} className="hover:bg-gray-100 cursor-pointer">
                                  {role.label}
                                </SelectItem>
                              ));
                            })()}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>מחיר שאני משלם (₪) *</Label>
                        <Input
                          type="number"
                          value={formData.price_offered}
                          onChange={(e) => setFormData({ ...formData, price_offered: parseFloat(e.target.value) })}
                          placeholder={
                            formData.requested_role && waiter.role_prices?.[formData.requested_role]
                              ? waiter.role_prices[formData.requested_role].toString()
                              : waiter.price_per_event?.toString() || '500'
                          }
                          required
                        />
                        {formData.requested_role && waiter.role_prices?.[formData.requested_role] && (
                          <p className="text-xs text-gray-500 mt-1">
                            המחיר המבוקש: ₪{waiter.role_prices[formData.requested_role]}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label>הערות</Label>
                        <Textarea
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          placeholder="פרטים נוספים על האירוע..."
                          rows={3}
                        />
                      </div>

                      <Button
                        onClick={handleSendRequest}
                        disabled={sendRequestMutation.isPending}
                        className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-[#1a1a1a]"
                      >
                        {sendRequestMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin ml-2" />
                        ) : (
                          <Send className="w-4 h-4 ml-2" />
                        )}
                        שלח בקשה
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {!currentUser && (
                <Button
                  onClick={() => window.location.href = createPageUrl('Auth')}
                  className="w-full bg-[#1a1a1a] hover:bg-[#D4AF37] hover:text-[#1a1a1a] text-lg py-6"
                >
                  התחבר כדי לשלוח בקשת עבודה
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}