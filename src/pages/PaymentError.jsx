import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function PaymentError() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-t-4 border-red-600">
        <CardContent className="text-center p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">התשלום נכשל</h1>
          
          <p className="text-gray-600 mb-6">
            משהו השתבש בתהליך התשלום. אנא נסה שוב.
          </p>

          <Link to={createPageUrl('JobRequests')}>
            <Button className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-[#1a1a1a] font-bold py-6">
              חזור לבקשות עבודה
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}