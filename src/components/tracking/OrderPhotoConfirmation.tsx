import { useState } from 'react';
import { Camera, Check, Edit3, Loader2, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useOrderConfirmationByNumber, OrderConfirmation } from '@/hooks/useOrderConfirmation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface OrderPhotoConfirmationProps {
  orderNumber: string;
}

export function OrderPhotoConfirmation({ orderNumber }: OrderPhotoConfirmationProps) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  
  const { confirmation, loading, respondToConfirmation, getPhotoUrl } =
    useOrderConfirmationByNumber(orderNumber);

  const [showChangeDialog, setShowChangeDialog] = useState(false);
  const [changeRequest, setChangeRequest] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!confirmation) {
    return null;
  }

  const handleApprove = async () => {
    setSubmitting(true);
    await respondToConfirmation(confirmation.id, 'approved');
    setSubmitting(false);
  };

  const handleRequestChange = async () => {
    if (!changeRequest.trim()) return;
    setSubmitting(true);
    const success = await respondToConfirmation(
      confirmation.id,
      'change_requested',
      changeRequest.trim()
    );
    if (success) {
      setShowChangeDialog(false);
      setChangeRequest('');
    }
    setSubmitting(false);
  };

  const getStatusDisplay = () => {
    switch (confirmation.confirmation_status) {
      case 'pending':
        return {
          badge: (
            <Badge className="bg-yellow-500 hover:bg-yellow-600">
              {isRTL ? 'في انتظار ردك' : 'Awaiting Your Response'}
            </Badge>
          ),
          showActions: true,
        };
      case 'approved':
        return {
          badge: (
            <Badge className="bg-green-500 hover:bg-green-600">
              <Check className="w-3 h-3 me-1" />
              {isRTL ? 'تمت الموافقة' : 'Approved'}
            </Badge>
          ),
          showActions: false,
        };
      case 'change_requested':
        return {
          badge: (
            <Badge className="bg-orange-500 hover:bg-orange-600">
              {isRTL ? 'طلب تعديل' : 'Change Requested'}
            </Badge>
          ),
          showActions: false,
        };
    }
  };

  const status = getStatusDisplay();

  return (
    <>
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              <span>{isRTL ? 'صورة طلبك جاهزة!' : 'Your Order Preview is Ready!'}</span>
            </div>
            {status.badge}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Photo */}
          <div className="rounded-lg overflow-hidden border">
            <img
              src={getPhotoUrl(confirmation.photo_path)}
              alt={isRTL ? 'صورة الطلب' : 'Order preview'}
              className="w-full h-56 object-cover"
            />
          </div>

          {/* Butcher note */}
          {confirmation.photo_note && (
            <div className="bg-muted p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <MessageCircle className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {isRTL ? 'رسالة من الجزار:' : 'Message from Butcher:'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{confirmation.photo_note}</p>
            </div>
          )}

          {/* Customer response (if change was requested) */}
          {confirmation.customer_response && (
            <div className="bg-orange-500/10 p-3 rounded-lg border border-orange-500/20">
              <p className="text-sm font-medium mb-1">
                {isRTL ? 'طلب التعديل الخاص بك:' : 'Your Change Request:'}
              </p>
              <p className="text-sm text-orange-700">{confirmation.customer_response}</p>
            </div>
          )}

          {/* Action buttons */}
          {status.showActions && (
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleApprove}
                disabled={submitting}
                className="flex-1"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 me-2 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 me-2" />
                )}
                {isRTL ? 'موافق، أرسل طلبي' : 'Approve & Dispatch'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowChangeDialog(true)}
                disabled={submitting}
                className="flex-1"
              >
                <Edit3 className="w-4 h-4 me-2" />
                {isRTL ? 'طلب تعديل' : 'Request Change'}
              </Button>
            </div>
          )}

          {confirmation.confirmation_status === 'approved' && (
            <p className="text-sm text-green-600 text-center">
              {isRTL
                ? '✓ تمت الموافقة على طلبك وسيتم إرساله قريباً'
                : '✓ Your order has been approved and will be dispatched soon'}
            </p>
          )}

          {confirmation.confirmation_status === 'change_requested' && (
            <p className="text-sm text-orange-600 text-center">
              {isRTL
                ? 'الجزار يراجع طلب التعديل الخاص بك...'
                : 'The butcher is reviewing your change request...'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Change Request Dialog */}
      <Dialog open={showChangeDialog} onOpenChange={setShowChangeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isRTL ? 'طلب تعديل' : 'Request a Change'}
            </DialogTitle>
            <DialogDescription>
              {isRTL
                ? 'اشرح ما تريد تغييره في الطلب'
                : 'Describe what you would like changed in your order'}
            </DialogDescription>
          </DialogHeader>

          <Textarea
            placeholder={
              isRTL
                ? 'مثال: أريد القطع أصغر قليلاً...'
                : 'Example: I would like the pieces a bit smaller...'
            }
            value={changeRequest}
            onChange={(e) => setChangeRequest(e.target.value)}
            rows={4}
          />

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowChangeDialog(false)}
              disabled={submitting}
            >
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              onClick={handleRequestChange}
              disabled={!changeRequest.trim() || submitting}
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 me-2 animate-spin" />
              ) : (
                <Edit3 className="w-4 h-4 me-2" />
              )}
              {isRTL ? 'إرسال الطلب' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
