import { useState, useRef } from 'react';
import { Camera, Upload, X, Send, Loader2, Check, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useOrderConfirmation } from '@/hooks/useOrderConfirmation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface PhotoConfirmationUploadProps {
  orderId: string;
  orderNumber: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PhotoConfirmationUpload({
  orderId,
  orderNumber,
  open,
  onOpenChange,
}: PhotoConfirmationUploadProps) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { confirmation, loading, uploading, uploadPhoto, getPhotoUrl } =
    useOrderConfirmation(orderId);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [note, setNote] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const result = await uploadPhoto(selectedFile, note);
    if (result) {
      setSelectedFile(null);
      setPreview(null);
      setNote('');
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStatusBadge = () => {
    if (!confirmation) return null;

    switch (confirmation.confirmation_status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
            <AlertCircle className="w-3 h-3 me-1" />
            {isRTL ? 'في انتظار الرد' : 'Awaiting Response'}
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
            <Check className="w-3 h-3 me-1" />
            {isRTL ? 'تمت الموافقة' : 'Approved'}
          </Badge>
        );
      case 'change_requested':
        return (
          <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/30">
            <AlertCircle className="w-3 h-3 me-1" />
            {isRTL ? 'طلب تعديل' : 'Change Requested'}
          </Badge>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            {isRTL ? 'تأكيد الطلب بالصورة' : 'Photo Confirmation'}
          </DialogTitle>
          <DialogDescription>
            {isRTL
              ? `الطلب: ${orderNumber}`
              : `Order: ${orderNumber}`}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : confirmation ? (
          <div className="space-y-4">
            {/* Existing confirmation */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {isRTL ? 'حالة التأكيد:' : 'Confirmation Status:'}
              </span>
              {getStatusBadge()}
            </div>

            <div className="rounded-lg overflow-hidden border">
              <img
                src={getPhotoUrl(confirmation.photo_path)}
                alt="Order preview"
                className="w-full h-48 object-cover"
              />
            </div>

            {confirmation.photo_note && (
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm font-medium mb-1">
                  {isRTL ? 'ملاحظة الجزار:' : 'Butcher Note:'}
                </p>
                <p className="text-sm text-muted-foreground">{confirmation.photo_note}</p>
              </div>
            )}

            {confirmation.customer_response && (
              <div className="bg-orange-500/10 p-3 rounded-lg border border-orange-500/20">
                <p className="text-sm font-medium mb-1">
                  {isRTL ? 'رد العميل:' : 'Customer Response:'}
                </p>
                <p className="text-sm text-orange-700">{confirmation.customer_response}</p>
              </div>
            )}

            {/* Allow re-upload if change requested */}
            {confirmation.confirmation_status === 'change_requested' && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-3">
                  {isRTL ? 'العميل طلب تعديل. يمكنك رفع صورة جديدة:' : 'Customer requested changes. Upload a new photo:'}
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 me-2" />
                  {isRTL ? 'رفع صورة جديدة' : 'Upload New Photo'}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Upload new photo */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />

            {preview ? (
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={clearSelection}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <Camera className="w-12 h-12 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {isRTL ? 'اضغط لالتقاط أو اختيار صورة' : 'Tap to capture or select photo'}
                </p>
              </div>
            )}

            <Textarea
              placeholder={isRTL ? 'أضف ملاحظة للعميل (اختياري)...' : 'Add a note for customer (optional)...'}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />

            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="w-full"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 me-2 animate-spin" />
                  {isRTL ? 'جارٍ الرفع...' : 'Uploading...'}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 me-2" />
                  {isRTL ? 'إرسال للعميل' : 'Send to Customer'}
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
