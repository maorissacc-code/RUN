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
import { CreditCard, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PaymentDialog({ jobRequest, platformFee = 50 }) {
  const [open, setOpen] = useState(false);
  const [invoiceHtml, setInvoiceHtml] = useState(null);

  const createPaymentMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('createCardcomPayment', {
        job_request_id: jobRequest.id,
        platform_fee: platformFee
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success && data.invoice_html) {
        setInvoiceHtml(data.invoice_html);
        toast.success('התשלום בוצע בהצלחה');
      } else if (data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        toast.error('שגיאה ביצירת תשלום');
      }
    },
    onError: (error) => {
      toast.error('שגיאה ביצירת תשלום');
      console.error(error);
    }
  });

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
    printWindow.print();
  };

  const handleClose = () => {
    setOpen(false);
    // Reload page or invalidate queries to update status in list
    window.location.reload();
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val && invoiceHtml) handleClose();
      else setOpen(val);
    }}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700 text-white">
          <CreditCard className="w-4 h-4 ml-2" />
          שלם עמלה וקבל פרטים
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl" dir="rtl">
        {invoiceHtml ? (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl text-[#D4AF37]">תשלום בוצע בהצלחה!</DialogTitle>
            </DialogHeader>
            <div className="border p-4 rounded bg-gray-50 max-h-[400px] overflow-auto text-sm">
              <div dangerouslySetInnerHTML={{ __html: invoiceHtml }} />
            </div>
            <div className="flex gap-4">
              <Button onClick={handlePrint} className="flex-1 bg-blue-600 hover:bg-blue-700">
                הדפס חשבונית
              </Button>
              <Button onClick={handleClose} variant="outline" className="flex-1">
                סגור ורענן
              </Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>תשלום עמלת פלטפורמה</DialogTitle>
              <DialogDescription>
                כדי לקבל את פרטי הקשר של המלצר, יש לשלם עמלת פלטפורמה
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
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
                className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-[#1a1a1a] font-bold py-6"
              >
                {createPaymentMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin ml-2" />
                    מעביר לתשלום...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 ml-2" />
                    המשך לתשלום ₪{platformFee}
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}