import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../components/auth/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2, CheckCircle, XCircle, Clock, MapPin, Calendar, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { toast } from 'sonner';
import RolesBadges from '../components/shared/RolesBadges';
import RatingDialog from '../components/jobRequests/RatingDialog';
import PaymentDialog from '../components/jobRequests/PaymentDialog';

const statusConfig = {
  pending: { label: 'ממתין לאישור', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  accepted: { label: 'אושר - ממתין לתשלום', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  paid: { label: 'שולם', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  completed: { label: 'הושלם', color: 'bg-purple-100 text-purple-800', icon: CheckCircle },
  cancelled: { label: 'בוטל', color: 'bg-red-100 text-red-800', icon: XCircle }
};

const roleLabels = {
  waiter: 'מלצר',
  head_waiter: 'רב מלצרים',
  production_worker: 'עובד פס',
  bartender: 'ברמן'
};

export default function JobRequests() {
  const { user, loading: authLoading } = useAuth(true);
  const queryClient = useQueryClient();

  const { data: receivedRequests = [], isLoading: loadingReceived } = useQuery({
    queryKey: ['receivedRequests', user?.id],
    queryFn: () => base44.entities.JobRequest.filter({ waiter_id: user.id }, '-created_date'),
    enabled: !!user
  });

  const { data: sentRequests = [], isLoading: loadingSent } = useQuery({
    queryKey: ['sentRequests', user?.id],
    queryFn: () => base44.entities.JobRequest.filter({ event_manager_id: user.id }, '-created_date'),
    enabled: !!user
  });

  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, status, cancellation_reason }) => {
      const response = await base44.functions.invoke('updateJobRequestStatus', {
        job_request_id: id,
        status,
        cancellation_reason
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['receivedRequests']);
      queryClient.invalidateQueries(['sentRequests']);
      toast.success('הסטטוס עודכן בהצלחה');
    }
  });

  const handleAccept = (requestId) => {
    updateRequestMutation.mutate({ id: requestId, status: 'accepted' });
  };

  const handleReject = (requestId) => {
    updateRequestMutation.mutate({ id: requestId, status: 'cancelled', cancellation_reason: 'העובד דחה' });
  };

  const handleCancel = (requestId) => {
    if (confirm('האם אתה בטוח שברצונך לבטל את הבקשה?')) {
      updateRequestMutation.mutate({ id: requestId, status: 'cancelled', cancellation_reason: 'מנהל האירוע ביטל' });
    }
  };

  const handleComplete = (requestId) => {
    updateRequestMutation.mutate({ id: requestId, status: 'completed' });
  };

  // בדוק אם כבר קיים דירוג לבקשה
  const { data: existingRating } = useQuery({
    queryKey: ['rating', user?.id],
    queryFn: async () => {
      const ratings = await base44.entities.Rating.filter({ 
        event_manager_id: user.id 
      });
      return ratings;
    },
    enabled: !!user
  });

  const RequestCard = ({ request, isReceived }) => {
    const StatusIcon = statusConfig[request.status].icon;
    const hasRated = existingRating?.some(r => r.job_request_id === request.id);

    return (
      <Card className="hover:shadow-lg transition-all border-r-4 border-[#D4AF37]">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">
                {isReceived ? request.event_manager_name : request.waiter_name}
              </CardTitle>
              <Badge className={`${statusConfig[request.status].color} mt-2 border-0`}>
                <StatusIcon className="w-3 h-3 ml-1" />
                {statusConfig[request.status].label}
              </Badge>
            </div>
            <Badge className="bg-[#D4AF37] text-[#1a1a1a] border-0">
              {roleLabels[request.requested_role]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-sm">
              {format(new Date(request.event_date), 'dd/MM/yyyy', { locale: he })}
            </span>
          </div>

          {request.event_location && (
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-sm">{request.event_location}</span>
            </div>
          )}

          {isReceived && (request.status === 'paid' || request.status === 'completed') && (
            <div className="flex items-center gap-2 text-gray-600 bg-blue-50 p-2 rounded">
              <span className="text-sm font-semibold">טלפון מנהל האירוע:</span>
              <span className="text-sm">{request.event_manager_phone || 'לא זמין'}</span>
            </div>
          )}

          {!isReceived && (request.status === 'paid' || request.status === 'completed') && (
            <div className="flex items-center gap-2 text-gray-600 bg-blue-50 p-2 rounded">
              <span className="text-sm font-semibold">טלפון העובד:</span>
              <span className="text-sm">{request.waiter_phone || 'לא זמין'}</span>
            </div>
          )}

          {request.price_offered && (
            <div className="flex items-center gap-2 text-gray-600">
              <DollarSign className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-sm font-semibold">₪{request.price_offered}</span>
            </div>
          )}

          {request.event_type && (
            <p className="text-sm text-gray-600">
              <span className="font-semibold">סוג אירוע:</span> {request.event_type}
            </p>
          )}

          {request.notes && (
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              {request.notes}
            </p>
          )}

          {isReceived && request.status === 'pending' && (
            <div className="flex gap-2 pt-3">
              <Button
                onClick={() => handleAccept(request.id)}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 ml-2" />
                אשר
              </Button>
              <Button
                onClick={() => handleReject(request.id)}
                variant="outline"
                className="flex-1 border-red-600 text-red-600 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4 ml-2" />
                דחה
              </Button>
            </div>
          )}

          {!isReceived && request.status === 'accepted' && (
            <div className="space-y-2 pt-3">
              <PaymentDialog jobRequest={request} platformFee={50} />
              <Button
                onClick={() => handleCancel(request.id)}
                variant="outline"
                className="w-full border-red-600 text-red-600 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4 ml-2" />
                ביטול בקשה
              </Button>
            </div>
          )}

          {!isReceived && request.status === 'paid' && (
            <Button
              onClick={() => handleComplete(request.id)}
              className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-[#1a1a1a]"
            >
              <CheckCircle className="w-4 h-4 ml-2" />
              סמן כהושלם
            </Button>
          )}

          {!isReceived && request.status === 'completed' && !hasRated && (
            <RatingDialog request={request} currentUser={user} />
          )}

          {!isReceived && request.status === 'completed' && hasRated && (
            <div className="text-center text-sm text-green-600 bg-green-50 p-3 rounded-lg">
              ✓ דירגת את העובד
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (authLoading || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#1a1a1a]">בקשות עבודה</h1>
          <p className="text-gray-600 mt-2">נהל את כל בקשות העבודה שלך במקום אחד</p>
        </div>

        <Tabs defaultValue="received" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="received">בקשות שקיבלתי</TabsTrigger>
            <TabsTrigger value="sent">בקשות ששלחתי</TabsTrigger>
          </TabsList>

          <TabsContent value="received">
            {loadingReceived ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
              </div>
            ) : receivedRequests.length === 0 ? (
              <Card className="py-20">
                <CardContent className="text-center">
                  <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-xl text-gray-500">אין בקשות עבודה</p>
                  <p className="text-gray-400 mt-2">כשתקבל בקשות, הן יופיעו כאן</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {receivedRequests.map(request => (
                  <RequestCard key={request.id} request={request} isReceived={true} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sent">
            {loadingSent ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
              </div>
            ) : sentRequests.length === 0 ? (
              <Card className="py-20">
                <CardContent className="text-center">
                  <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-xl text-gray-500">אין בקשות ששלחת</p>
                  <p className="text-gray-400 mt-2">חפש מלצרים ושלח להם בקשות עבודה</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sentRequests.map(request => (
                  <RequestCard key={request.id} request={request} isReceived={false} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}