import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, Briefcase, CheckCircle, Star, Trash2, Eye, Download, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const roleLabels = {
  waiter: 'מלצר',
  head_waiter: 'רב מלצרים',
  production_worker: 'עובד פס',
  bartender: 'ברמן',
  event_manager: 'מנהל אירוע'
};

export default function Analytics() {
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!currentUser || currentUser.role !== 'admin') {
          navigate(createPageUrl('Home'));
          return;
        }
        setUser(currentUser);
      } catch (error) {
        navigate(createPageUrl('Home'));
      }
    };
    loadUser();
  }, [navigate]);

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      const response = await base44.functions.invoke('listWaiters');
      return response.data.users || [];
    },
    enabled: !!user
  });

  const { data: jobRequests = [] } = useQuery({
    queryKey: ['all-job-requests'],
    queryFn: () => base44.entities.JobRequest.list(),
    enabled: !!user
  });

  const { data: ratings = [] } = useQuery({
    queryKey: ['all-ratings'],
    queryFn: () => base44.entities.Rating.list(),
    enabled: !!user
  });

  if (!user || usersLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">טוען נתונים...</div>
      </div>
    );
  }

  // חישוב סטטיסטיקות לפי תפקידים
  const roleStats = {};
  Object.keys(roleLabels).forEach(role => {
    roleStats[role] = users.filter(u => u.roles?.includes(role)).length;
  });

  // חישוב גרפי צמיחה לכל תפקיד
  const calculateGrowthData = (role) => {
    const roleUsers = users.filter(u => u.roles?.includes(role));
    const monthsData = {};
    
    roleUsers.forEach(user => {
      const date = new Date(user.created_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthsData[monthKey] = (monthsData[monthKey] || 0) + 1;
    });

    const sortedMonths = Object.keys(monthsData).sort();
    let cumulative = 0;
    return sortedMonths.slice(-6).map(month => {
      cumulative += monthsData[month];
      return {
        month: month,
        count: cumulative
      };
    });
  };

  const totalUsers = users.length;
  const totalRequests = jobRequests.length;
  const completedRequests = jobRequests.filter(r => r.status === 'completed').length;
  const averageRating = ratings.length > 0
    ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
    : 0;

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    if (dateFilter === 'all') return true;

    const userDate = new Date(u.created_date);
    const now = new Date();
    
    if (dateFilter === 'today') {
      return userDate.toDateString() === now.toDateString();
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return userDate >= weekAgo;
    } else if (dateFilter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return userDate >= monthAgo;
    } else if (dateFilter === 'year') {
      const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      return userDate >= yearAgo;
    }
    
    return true;
  });

  const handleDeleteUser = async (userId) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק משתמש זה?')) return;
    try {
      await base44.entities.User.delete(userId);
      window.location.reload();
    } catch (error) {
      alert('שגיאה במחיקת המשתמש');
    }
  };

  const exportUsersToExcel = () => {
    const data = users.map(u => ({
      'שם': u.full_name,
      'אימייל': u.email,
      'תפקידים': u.roles?.map(r => roleLabels[r]).join(', ') || '',
      'עיר': u.city || '',
      'אזור': u.region || '',
      'מחיר': u.price_per_event || '',
      'ניסיון': u.experience_years || ''
    }));
    
    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'משתמשים.csv';
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-gray-900">דשבורד ניהול</h1>
          <p className="text-gray-500 mt-1">ניהול המערכת והמשתמשים</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">סה"כ משתמשים</p>
                  <p className="text-4xl font-bold text-gray-900 mt-2">{totalUsers}</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">בקשות עבודה</p>
                  <p className="text-4xl font-bold text-gray-900 mt-2">{totalRequests}</p>
                </div>
                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">עבודות הושלמו</p>
                  <p className="text-4xl font-bold text-gray-900 mt-2">{completedRequests}</p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">דירוג ממוצע</p>
                  <p className="text-4xl font-bold text-gray-900 mt-2">{averageRating}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">התפקידים באתר</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.keys(roleLabels).map((role) => {
              const count = roleStats[role];
              const growthData = calculateGrowthData(role);
              
              return (
                <Card key={role} className="bg-white border border-gray-200 hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6 pb-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-2">{roleLabels[role]}</p>
                      <p className="text-3xl font-bold text-gray-900 mb-3">{count}</p>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" className="w-full gap-2">
                            <TrendingUp className="w-4 h-4" />
                            צפה בגרף
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{roleLabels[role]} - גרף צמיחה</DialogTitle>
                          </DialogHeader>
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={growthData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="month" />
                              <YAxis />
                              <Tooltip />
                              <Line 
                                type="monotone" 
                                dataKey="count" 
                                stroke="#D4AF37" 
                                strokeWidth={3}
                                dot={{ r: 5, fill: "#D4AF37" }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <Card className="bg-white border border-gray-200">
          <div className="p-6">
            <Tabs defaultValue="users" dir="rtl">
              <div className="flex justify-between items-center mb-6">
                <TabsList>
                  <TabsTrigger value="users">ניהול משתמשים</TabsTrigger>
                  <TabsTrigger value="requests">בקשות דנחיםש</TabsTrigger>
                </TabsList>
                <div className="flex gap-3 items-center">
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="סינון לפי תאריך" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">הכל</SelectItem>
                      <SelectItem value="today">היום</SelectItem>
                      <SelectItem value="week">שבוע אחרון</SelectItem>
                      <SelectItem value="month">חודש אחרון</SelectItem>
                      <SelectItem value="year">שנה אחרונה</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={exportUsersToExcel} variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    ייצא לאקסל
                  </Button>
                </div>
              </div>

              <TabsContent value="users" className="space-y-4">
                <Input
                  placeholder="חיפוש משתמש..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-md"
                />

                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">שם מלא</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">אימייל</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">תפקידים</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">עיר</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">מחיר</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">פעולות</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{u.full_name}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                          <td className="px-6 py-4">
                            <div className="flex gap-1 flex-wrap">
                              {u.roles?.map(role => (
                                <Badge key={role} variant="secondary" className="text-xs">
                                  {roleLabels[role] || role}
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{u.city || '-'}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {u.price_per_event ? `₪${u.price_per_event}` : '-'}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(createPageUrl(`WaiterProfile?id=${u.id}`), '_blank')}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:bg-red-50"
                                onClick={() => handleDeleteUser(u.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="text-sm text-gray-500 mt-4">
                  מציג {filteredUsers.length} מתוך {totalUsers} משתמשים
                </div>
              </TabsContent>

              <TabsContent value="requests" className="space-y-4">
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">מנהל אירוע</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">מלצר</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">תאריך</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">מיקום</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">סטטוס</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">מחיר</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {jobRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">{req.event_manager_name}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{req.waiter_name}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(req.event_date).toLocaleDateString('he-IL')}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{req.event_location || '-'}</td>
                          <td className="px-6 py-4">
                            <Badge 
                              variant={req.status === 'completed' ? 'default' : 'secondary'}
                              className={
                                req.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                                req.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                req.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }
                            >
                              {req.status === 'pending' ? 'ממתין' :
                               req.status === 'accepted' ? 'אושר' :
                               req.status === 'completed' ? 'הושלם' : 'נדחה'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {req.price_offered ? `₪${req.price_offered}` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="text-sm text-gray-500 mt-4">
                  סה"כ {totalRequests} בקשות
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </Card>
      </div>
    </div>
  );
}