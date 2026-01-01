import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, Phone, ShieldCheck, KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Auth() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [passwordPhone, setPasswordPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem('waiter_session');
    if (session) {
      navigate(createPageUrl('Home'));
    }
  }, [navigate]);

  const sendCodeMutation = useMutation({
    mutationFn: async (phoneNumber) => {
      const response = await base44.functions.invoke('sendVerificationCode', { phone: phoneNumber });
      return response.data;
    },
    onSuccess: (data) => {
      setCodeSent(true);
      // In development, show the code in a toast
      if (data.development && data.code) {
        toast.success(`קוד אימות: ${data.code}`, {
          duration: 30000, // Show for 30 seconds
          style: {
            background: '#4CAF50',
            color: 'white',
            fontSize: '1.2em',
            textAlign: 'center',
            padding: '15px',
            borderRadius: '8px',
            fontWeight: 'bold'
          }
        });
      } else {
        toast.success('קוד אימות נשלח למספר הטלפון שלך!');
      }
    },
    onError: () => {
      toast.error('שגיאה בשליחת הקוד');
    }
  });

  const loginMutation = useMutation({
    mutationFn: async ({ phone, code }) => {
      const response = await base44.functions.invoke('phoneLogin', { phone, code });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        localStorage.setItem('waiter_session', data.session_token);
        localStorage.setItem('waiter_user', JSON.stringify(data.user));
        toast.success('התחברת בהצלחה!');
        window.location.href = createPageUrl('Home');
      } else {
        toast.error(data.error || 'קוד שגוי');
      }
    },
    onError: () => {
      toast.error('שגיאה באימות');
    }
  });

  const passwordLoginMutation = useMutation({
    mutationFn: async ({ phone, password }) => {
      const response = await base44.functions.invoke('loginWithPassword', { phone, password });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        localStorage.setItem('waiter_session', data.session_token);
        localStorage.setItem('waiter_user', JSON.stringify(data.user));
        toast.success('התחברת בהצלחה!');
        window.location.href = createPageUrl('Home');
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'סיסמה או טלפון שגויים');
    }
  });

  const requestResetMutation = useMutation({
    mutationFn: async (phone) => {
      const response = await base44.functions.invoke('requestPasswordReset', { phone });
      return response.data;
    },
    onSuccess: () => {
      toast.success('לינק לאיפוס סיסמה נשלח לאימייל שלך');
      setShowForgotPassword(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'שגיאה בשליחת לינק');
    }
  });

  const handleSendCode = () => {
    if (!phone || phone.length < 9) {
      toast.error('נא להזין מספר טלפון תקין');
      return;
    }
    sendCodeMutation.mutate(phone);
  };

  const handleLogin = () => {
    if (!code || code.length !== 6) {
      toast.error('נא להזין קוד בן 6 ספרות');
      return;
    }
    loginMutation.mutate({ phone, code });
  };

  const handlePasswordLogin = () => {
    if (!passwordPhone || !password) {
      toast.error('נא למלא טלפון וסיסמה');
      return;
    }
    passwordLoginMutation.mutate({ phone: passwordPhone, password });
  };

  const handleForgotPassword = () => {
    if (!passwordPhone) {
      toast.error('נא להזין מספר טלפון');
      return;
    }
    requestResetMutation.mutate(passwordPhone);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-t-4 border-[#D4AF37] shadow-2xl">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="text-4xl font-bold text-[#1a1a1a]">ש</div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              שירות <span className="text-[#D4AF37]">מלצרות</span>
            </h1>
            <p className="text-gray-600">התחבר עם מספר הטלפון שלך</p>
          </div>

          <Tabs defaultValue="code" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="code">קוד אימות</TabsTrigger>
              <TabsTrigger value="password">סיסמה</TabsTrigger>
            </TabsList>

            <TabsContent value="code" className="space-y-6">
              <div className="text-center mb-6">
                <Phone className="w-12 h-12 text-[#D4AF37] mx-auto mb-3" />
                <h3 className="text-xl font-semibold mb-2">כניסה מהירה</h3>
                <p className="text-gray-600">נשלח לך קוד אימות חד פעמי</p>
              </div>

            <div>
              <Label>מספר טלפון</Label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="05X-XXXXXXX"
                disabled={codeSent}
                className="text-lg"
              />
            </div>

            {codeSent && (
              <div className="space-y-4">
                <div>
                  <Label>קוד אימות (6 ספרות)</Label>
                  <Input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    maxLength={6}
                    className="text-center text-2xl tracking-widest"
                  />
                  <p className="text-xs text-gray-500 mt-1">הקוד תקף לדקה אחת</p>
                </div>

                <Button
                  onClick={handleLogin}
                  disabled={loginMutation.isPending}
                  className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-[#1a1a1a] py-6 text-lg"
                >
                  {loginMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin ml-2" />
                  ) : (
                    <ShieldCheck className="w-5 h-5 ml-2" />
                  )}
                  אמת והיכנס
                </Button>

                <Button
                  onClick={() => {
                    setCodeSent(false);
                    setCode('');
                  }}
                  variant="outline"
                  className="w-full"
                >
                  שלח קוד חדש
                </Button>
              </div>
            )}

            {!codeSent && (
              <Button
                onClick={handleSendCode}
                disabled={sendCodeMutation.isPending}
                className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-[#1a1a1a] py-6 text-lg font-bold"
              >
                {sendCodeMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin ml-2" />
                ) : (
                  <Phone className="w-5 h-5 ml-2" />
                )}
                שלח קוד אימות
              </Button>
            )}
            </TabsContent>

            <TabsContent value="password" className="space-y-6">
              <div className="text-center mb-6">
                <KeyRound className="w-12 h-12 text-[#D4AF37] mx-auto mb-3" />
                <h3 className="text-xl font-semibold mb-2">כניסה עם סיסמה</h3>
                <p className="text-gray-600">השתמש בסיסמה הקבועה שלך</p>
              </div>

              {!showForgotPassword ? (
                <>
                  <div>
                    <Label>מספר טלפון</Label>
                    <Input
                      type="tel"
                      value={passwordPhone}
                      onChange={(e) => setPasswordPhone(e.target.value)}
                      placeholder="05X-XXXXXXX"
                      className="text-lg"
                    />
                  </div>

                  <div>
                    <Label>סיסמה</Label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••"
                      className="text-lg"
                    />
                  </div>

                  <Button
                    onClick={handlePasswordLogin}
                    disabled={passwordLoginMutation.isPending}
                    className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-[#1a1a1a] py-6 text-lg"
                  >
                    {passwordLoginMutation.isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin ml-2" />
                    ) : (
                      <KeyRound className="w-5 h-5 ml-2" />
                    )}
                    התחבר
                  </Button>

                  <Button
                    onClick={() => setShowForgotPassword(true)}
                    variant="ghost"
                    className="w-full text-[#D4AF37] hover:text-[#B8941F]"
                  >
                    שכחתי סיסמה
                  </Button>
                </>
              ) : (
                <>
                  <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-900">
                    הזן את מספר הטלפון שלך ונשלח לינק לאיפוס סיסמה לאימייל שלך
                  </div>

                  <div>
                    <Label>מספר טלפון</Label>
                    <Input
                      type="tel"
                      value={passwordPhone}
                      onChange={(e) => setPasswordPhone(e.target.value)}
                      placeholder="05X-XXXXXXX"
                      className="text-lg"
                    />
                  </div>

                  <Button
                    onClick={handleForgotPassword}
                    disabled={requestResetMutation.isPending}
                    className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-[#1a1a1a] py-6 text-lg"
                  >
                    {requestResetMutation.isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin ml-2" />
                    ) : null}
                    שלח לינק לאיפוס
                  </Button>

                  <Button
                    onClick={() => setShowForgotPassword(false)}
                    variant="outline"
                    className="w-full"
                  >
                    חזור
                  </Button>
                </>
              )}
            </TabsContent>
          </Tabs>

          <div className="mt-8 text-center text-xs text-gray-500">
            <p>בהמשך השימוש באתר, אתה מסכים לתנאי השימוש</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}