import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, KeyRound, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  const resetMutation = useMutation({
    mutationFn: async ({ token, new_password }) => {
      const response = await base44.functions.invoke('resetPassword', { token, new_password });
      return response.data;
    },
    onSuccess: () => {
      toast.success('הסיסמה שונתה בהצלחה!');
      setSuccess(true);
      setTimeout(() => {
        navigate(createPageUrl('Auth'));
      }, 2000);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'שגיאה באיפוס הסיסמה');
    }
  });

  const handleSubmit = () => {
    if (!password || password.length < 6) {
      toast.error('הסיסמה חייבת להיות לפחות 6 תווים');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('הסיסמאות לא תואמות');
      return;
    }
    if (!token) {
      toast.error('טוקן לא תקין');
      return;
    }
    resetMutation.mutate({ token, new_password: password });
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-t-4 border-green-600 shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">הסיסמה שונתה בהצלחה!</h2>
            <p className="text-gray-600">מעביר אותך למסך ההתחברות...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-t-4 border-[#D4AF37] shadow-2xl">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-12 h-12 text-[#1a1a1a]" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">איפוס סיסמה</h1>
            <p className="text-gray-600">בחר סיסמה חדשה לחשבון שלך</p>
          </div>

          <div className="space-y-6">
            <div>
              <Label>סיסמה חדשה</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="לפחות 6 תווים"
                className="text-lg"
              />
            </div>

            <div>
              <Label>אימות סיסמה</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="הזן שוב את הסיסמה"
                className="text-lg"
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={resetMutation.isPending}
              className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-[#1a1a1a] py-6 text-lg font-bold"
            >
              {resetMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin ml-2" />
              ) : (
                <KeyRound className="w-5 h-5 ml-2" />
              )}
              שמור סיסמה חדשה
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}