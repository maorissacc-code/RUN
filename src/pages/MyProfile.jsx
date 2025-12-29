import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../components/auth/useAuth';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Save, AlertCircle, KeyRound, CheckCircle2 } from 'lucide-react';
import ProfileImage from '../components/profile/ProfileImage';
import RolesBadges from '../components/shared/RolesBadges';
import StarRating from '../components/shared/StarRating';
import { toast } from 'sonner';

const regions = [
  { value: 'north', label: 'צפון' },
  { value: 'center', label: 'מרכז' },
  { value: 'south', label: 'דרום' },
  { value: 'jerusalem', label: 'ירושלים' },
  { value: 'sharon', label: 'שרון' },
  { value: 'shfela', label: 'שפלה' }
];

const availableRoles = [
  { value: 'waiter', label: 'מלצר' },
  { value: 'head_waiter', label: 'רב מלצרים' },
  { value: 'production_worker', label: 'עובד פס' },
  { value: 'bartender', label: 'ברמן' },
  { value: 'event_manager', label: 'מנהל אירוע' }
];

export default function MyProfile() {
  const { user: initialUser, loading: authLoading } = useAuth(true);
  const [user, setUser] = useState(initialUser);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    if (initialUser && !user) {
      setUser(initialUser);
    }
  }, [initialUser, user]);

  useEffect(() => {
    if (user) {
      setHasPassword(!!user.has_password);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setFormData({
        phone: user.phone || '',
        roles: user.roles || [],
        city: user.city || '',
        region: user.region || '',
        price_per_event: user.price_per_event || '',
        role_prices: user.role_prices || {},
        bio: user.bio || '',
        experience_years: user.experience_years || '',
        available: user.available !== false
      });
    }
  }, [user]);

  const { data: ratings = [] } = useQuery({
    queryKey: ['myRatings', user?.id],
    queryFn: () => base44.entities.Rating.filter({ waiter_id: user.id }),
    enabled: !!user
  });

  const { data: jobRequests = [] } = useQuery({
    queryKey: ['myJobs', user?.id],
    queryFn: async () => {
      const asWaiter = await base44.entities.JobRequest.filter({ waiter_id: user.id });
      const asManager = await base44.entities.JobRequest.filter({ event_manager_id: user.id });
      return { asWaiter, asManager };
    },
    enabled: !!user
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const response = await base44.functions.invoke('updateUserProfile', {
        user_id: user.id,
        data: { profile_image: file_url }
      });
      const updatedUser = response.data;
      localStorage.setItem('waiter_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      toast.success('התמונה הועלתה בהצלחה!');
      queryClient.invalidateQueries(['waiters']);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('שגיאה בהעלאת התמונה');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRoleToggle = (roleValue) => {
    const newRoles = formData.roles.includes(roleValue)
      ? formData.roles.filter(r => r !== roleValue)
      : [...formData.roles, roleValue];
    setFormData({ ...formData, roles: newRoles });
  };

  const handleSave = async () => {
    if (!formData.roles || formData.roles.length === 0) {
      toast.error('יש לבחור לפחות תפקיד אחד');
      return;
    }
    
    setSaving(true);
    try {
      const dataToSend = { ...formData };
      delete dataToSend.price_per_event;
      
      const response = await base44.functions.invoke('updateUserProfile', {
        user_id: user.id,
        data: dataToSend
      });
      
      const updatedUser = response.data;
      localStorage.setItem('waiter_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      toast.success('הפרופיל עודכן בהצלחה!');
      queryClient.invalidateQueries(['waiters']);
      
      setTimeout(() => {
        navigate(createPageUrl('Home'));
      }, 500);
    } catch (error) {
      console.error('Error:', error);
      toast.error('שגיאה בשמירה');
      setSaving(false);
    }
  };

  const handleSetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('הסיסמה חייבת להיות לפחות 6 תווים');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('הסיסמאות לא תואמות');
      return;
    }

    setSavingPassword(true);
    try {
      const response = await base44.functions.invoke('updateUserProfile', {
        user_id: user.id,
        data: { password: newPassword },
        hash_password: true
      });
      
      const updatedUser = response.data;
      localStorage.setItem('waiter_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setHasPassword(true);
      
      toast.success('הסיסמה נשמרה בהצלחה!');
      setShowPasswordSection(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error setting password:', error);
      toast.error(error.response?.data?.error || 'שגיאה בשמירת הסיסמה');
    } finally {
      setSavingPassword(false);
    }
  };

  const averageRating = ratings.length > 0
    ? ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length
    : 0;

  const completedJobs = jobRequests.asWaiter?.filter(j => j.status === 'completed').length || 0;

  if (authLoading || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="border-t-4 border-[#D4AF37] shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] text-white rounded-t-lg">
            <CardTitle className="text-2xl">האזור האישי שלי</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="flex flex-col items-center mb-8">
              <div className="relative">
                <ProfileImage
                  imageUrl={user.profile_image}
                  size="xl"
                  editable={!editMode}
                  onUpload={() => document.getElementById('image-upload').click()}
                />
                {uploadingImage && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                    <Loader2 className="w-8 h-8 animate-spin text-white" />
                  </div>
                )}
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {!user.profile_image && (
                <div className="mt-4 flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-4 py-2 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  <span>הוספת תמונת פרופיל משפרת את כמות העבודות שתקבל</span>
                </div>
              )}

              <h2 className="text-3xl font-bold mt-6 text-[#1a1a1a]">{user.full_name}</h2>
              <p className="text-gray-600">{user.email}</p>

              {averageRating > 0 && (
                <div className="flex items-center gap-3 mt-4">
                  <StarRating rating={averageRating} size="lg" />
                  <span className="text-xl font-semibold text-[#D4AF37]">
                    {averageRating.toFixed(1)}
                  </span>
                  <span className="text-gray-600">({ratings.length} דירוגים)</span>
                </div>
              )}

              <div className="flex gap-6 mt-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-[#D4AF37]">{completedJobs}</div>
                  <div className="text-sm text-gray-600">עבודות שהושלמו</div>
                </div>
              </div>
            </div>

            {!editMode ? (
              <div className="space-y-6">
                <div>
                  <Label className="text-lg font-semibold">תפקידים</Label>
                  <div className="mt-2">
                    <RolesBadges roles={user.roles} />
                  </div>
                </div>

                {user.phone && (
                  <div>
                    <Label className="text-lg font-semibold">טלפון</Label>
                    <p className="mt-1 text-gray-700">{user.phone}</p>
                  </div>
                )}

                {user.city && (
                  <div>
                    <Label className="text-lg font-semibold">עיר</Label>
                    <p className="mt-1 text-gray-700">{user.city}</p>
                  </div>
                )}

                {user.region && (
                  <div>
                    <Label className="text-lg font-semibold">אזור</Label>
                    <p className="mt-1 text-gray-700">
                      {regions.find(r => r.value === user.region)?.label}
                    </p>
                  </div>
                )}

                {(user.price_per_event || (user.role_prices && Object.keys(user.role_prices).length > 0)) && (
                  <div>
                    <Label className="text-lg font-semibold">מחירים לפי תפקיד</Label>
                    <div className="mt-2 space-y-2">
                      {user.role_prices && Object.keys(user.role_prices).length > 0 ? (
                        user.roles?.map(role => (
                          user.role_prices[role] && (
                            <div key={role} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                              <span className="text-gray-700">{availableRoles.find(r => r.value === role)?.label}</span>
                              <span className="text-xl font-bold text-[#D4AF37]">₪{user.role_prices[role]}</span>
                            </div>
                          )
                        ))
                      ) : (
                        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                          <span className="text-gray-700">מחיר כללי</span>
                          <span className="text-xl font-bold text-[#D4AF37]">₪{user.price_per_event}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {user.experience_years && (
                  <div>
                    <Label className="text-lg font-semibold">שנות ניסיון</Label>
                    <p className="mt-1 text-gray-700">{user.experience_years} שנים</p>
                  </div>
                )}

                {user.bio && (
                  <div>
                    <Label className="text-lg font-semibold">תיאור אישי</Label>
                    <p className="mt-1 text-gray-700 whitespace-pre-wrap">{user.bio}</p>
                  </div>
                )}

                {ratings.length > 0 && (
                  <div>
                    <Label className="text-lg font-semibold mb-3">הדירוגים שלי</Label>
                    <div className="space-y-3">
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

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">הגדרות אבטחה</h3>

                  {hasPassword && (
                    <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-4">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm">סיסמה קבועה מוגדרת</span>
                    </div>
                  )}

                  {!showPasswordSection ? (
                    <Button
                      onClick={() => setShowPasswordSection(true)}
                      variant="outline"
                      className="w-full"
                    >
                      <KeyRound className="w-4 h-4 ml-2" />
                      {hasPassword ? 'שנה סיסמה' : 'הגדר סיסמה קבועה'}
                    </Button>
                  ) : (
                    <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                      <div>
                        <Label>סיסמה חדשה</Label>
                        <Input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="לפחות 6 תווים"
                        />
                      </div>
                      <div>
                        <Label>אימות סיסמה</Label>
                        <Input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="הזן שוב את הסיסמה"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSetPassword}
                          disabled={savingPassword}
                          className="flex-1 bg-[#D4AF37] hover:bg-[#B8941F] text-[#1a1a1a]"
                        >
                          {savingPassword ? (
                            <Loader2 className="w-4 h-4 animate-spin ml-2" />
                          ) : (
                            <KeyRound className="w-4 h-4 ml-2" />
                          )}
                          שמור סיסמה
                        </Button>
                        <Button
                          onClick={() => {
                            setShowPasswordSection(false);
                            setNewPassword('');
                            setConfirmPassword('');
                          }}
                          variant="outline"
                          className="flex-1"
                        >
                          ביטול
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => setEditMode(true)}
                  className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-[#1a1a1a] font-bold"
                >
                  ערוך פרופיל
                </Button>
                </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
                <div>
                  <Label>תפקידים (בחר לפחות אחד)</Label>
                  <div className="mt-2 space-y-2">
                    {availableRoles.map(role => (
                      <div key={role.value} className="flex items-center gap-2">
                        <Checkbox
                          checked={formData.roles.includes(role.value)}
                          onCheckedChange={() => handleRoleToggle(role.value)}
                        />
                        <label className="text-sm">{role.label}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>טלפון</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="050-1234567"
                  />
                </div>

                <div>
                  <Label>עיר</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="תל אביב"
                  />
                </div>

                <div>
                  <Label>אזור</Label>
                  <Select
                    value={formData.region}
                    onValueChange={(value) => setFormData({ ...formData, region: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="בחר אזור" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map(region => (
                        <SelectItem key={region.value} value={region.value}>
                          {region.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>מחירים לפי תפקיד (₪)</Label>
                  <div className="space-y-3 mt-2">
                    {formData.roles.map(role => (
                      <div key={role} className="flex items-center gap-3">
                        <span className="text-sm min-w-[120px]">
                          {availableRoles.find(r => r.value === role)?.label}:
                        </span>
                        <Input
                          type="number"
                          value={formData.role_prices?.[role] || ''}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            role_prices: { 
                              ...formData.role_prices, 
                              [role]: parseFloat(e.target.value) || 0 
                            }
                          })}
                          placeholder="400"
                          className="flex-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>שנות ניסיון</Label>
                  <Input
                    type="number"
                    value={formData.experience_years}
                    onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) })}
                    placeholder="5"
                  />
                </div>

                <div>
                  <Label>תיאור אישי</Label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="ספר על עצמך, הניסיון שלך ומה הופך אותך לייחודי..."
                    rows={5}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-[#D4AF37] hover:bg-[#B8941F] text-[#1a1a1a] font-bold"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                        שומר...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 ml-2" />
                        שמור שינויים
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setEditMode(false);
                      setFormData({
                        phone: user.phone || '',
                        roles: user.roles || [],
                        city: user.city || '',
                        region: user.region || '',
                        price_per_event: user.price_per_event || '',
                        role_prices: user.role_prices || {},
                        bio: user.bio || '',
                        experience_years: user.experience_years || '',
                        available: user.available !== false
                      });
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    ביטול
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}