import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

export default function PaymentDialog({ jobRequest, platformFee = 50 }) {
  const [open, setOpen] = useState(false);
  const [iframeUrl, setIframeUrl] = useState(null);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  const createPaymentMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('createCardcomPaymentLink', {
        job_request_id: jobRequest.id,
        amount: platformFee
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success && data.iframe_url) {
        setIframeUrl(data.iframe_url);
      } else {
        toast.error('שגיאה ביצירת לינק לתשלום');
      }
    },
    onError: (error) => {
      toast.error('שגיאה בתקשורת עם שרת התשלומים');
      console.error(error);
    }
  });

  const handleClose = () => {
    setOpen(false);
    setIframeUrl(null);
    if (paymentCompleted) {
      window.location.reload();
    }
  };

  // Note: In a real world app, you'd use a window message listener 
  // or the SuccessRedirectUrl would point to a page that calls back to the opener
  // For this demo, the user will see the success page in the iframe.

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val) handleClose();
      else setOpen(val);
    }}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700 text-white">
          <CreditCard className="w-4 h-4 ml-2" />
          שלם עמלה וקבל פרטים
        </Button>
      </DialogTrigger>
      <DialogContent className={`${iframeUrl ? 'sm:max-w-4xl h-[80vh]' : 'sm:max-w-2xl'} p-0 overflow-hidden`} dir="rtl">
        {iframeUrl ? (
          <div className="flex flex-col h-full bg-white">
            <div className="p-4 border-bottom flex justify-between items-center bg-gray-50">
              <h3 className="font-bold flex items-center">
                <CreditCard className="w-5 h-5 ml-2 text-[#D4AF37]" />
                תשלום מאובטח באמצעות Cardcom
              </h3>
              <Button variant="ghost" size="sm" onClick={handleClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <iframe
              src={iframeUrl}
              className="flex-1 w-full border-none"
              title="Cardcom Payment"
              allow="payment"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="p-4 border-t text-center text-xs text-gray-500">
              התשלום מאובטח בתקן PCI-DSS | מספר הזמנה: {jobRequest.id}
            </div>
          </div>
        ) : (
          <div className="p-6">
            <DialogHeader>
              <DialogTitle>תשלום עמלת פלטפורמה</DialogTitle>
              <DialogDescription>
                כדי לקבל את פרטי הקשר של המלצר, יש לשלם עמלת פלטפורמה
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">עמלת פלטפורמה:</span>
                  <span className="text-2xl font-bold text-[#D4AF37]">₪{platformFee}</span>
                </div>
                <div className="text-sm text-gray-500">
                  * התשלום למלצר מתבצע ישירות בינכם
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-900">
                <strong>לתשומת לבך:</strong>
                <ul className="list-disc mr-5 mt-2 space-y-1">
                  <li>אחרי התשלום תקבל את מספר הטלפון של המלצר</li>
                  <li>המלצר יקבל גם את מספר הטלפון שלך</li>
                  <li>תשלום בטוח דרך מערכת קארדקום</li>
                </ul>
              </div>

              <Button
                onClick={() => createPaymentMutation.mutate()}
                disabled={createPaymentMutation.isPending}
                className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-[#1a1a1a] font-bold py-6 text-lg"
              >
                {createPaymentMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin ml-2" />
                    יוצר לינק תשלום...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 ml-2" />
                    המשך לתשלום ₪{platformFee}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}