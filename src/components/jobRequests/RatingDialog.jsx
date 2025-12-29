import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, Send } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function RatingDialog({ request, currentUser }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const queryClient = useQueryClient();

  const createRatingMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.Rating.create(data);
    },
    onSuccess: () => {
      toast.success('הדירוג נשלח בהצלחה');
      setOpen(false);
      setRating(0);
      setReview('');
      queryClient.invalidateQueries(['ratings']);
    },
    onError: () => {
      toast.error('שגיאה בשליחת הדירוג');
    }
  });

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error('נא לבחור דירוג');
      return;
    }

    createRatingMutation.mutate({
      job_request_id: request.id,
      waiter_id: request.waiter_id,
      waiter_name: request.waiter_name,
      event_manager_id: currentUser.id,
      event_manager_name: currentUser.full_name,
      rating: rating,
      review: review
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-[#1a1a1a] gap-2">
          <Star className="w-4 h-4" />
          דרג עובד
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>דרג את {request.waiter_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">איך היה השירות?</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-[#D4AF37] text-[#D4AF37]'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="mt-2 text-sm text-gray-600">
                {rating === 1 && 'גרוע'}
                {rating === 2 && 'לא מספיק טוב'}
                {rating === 3 && 'בסדר'}
                {rating === 4 && 'טוב'}
                {rating === 5 && 'מצוין'}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-600 block mb-2">
              רשום כמה מילים (אופציונלי)
            </label>
            <Textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="ספר על החוויה שלך עם העובד..."
              rows={4}
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={createRatingMutation.isPending || rating === 0}
            className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-[#1a1a1a]"
          >
            {createRatingMutation.isPending ? (
              'שולח...'
            ) : (
              <>
                <Send className="w-4 h-4 ml-2" />
                שלח דירוג
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}