import { useState, useEffect, useCallback, DragEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useHeroImages, HeroImageConfig, defaultHeroImages } from '@/hooks/useHeroImages';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Save, Loader2, Image, RotateCcw, Upload } from 'lucide-react';
import browser from 'browser-image-compression';
import ImageCropDialog from './ImageCropDialog';

const HeroImagesManager = () => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const queryClient = useQueryClient();
  const { heroImages, isLoading } = useHeroImages();
  const [images, setImages] = useState<HeroImageConfig[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  // Crop dialog state
  const [cropOpen, setCropOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState('');
  const [cropTarget, setCropTarget] = useState<{ page: string; field: 'image_url' | 'mobile_image_url' } | null>(null);
  const [cropOriginalFile, setCropOriginalFile] = useState<File | null>(null);

  useEffect(() => {
    if (heroImages) setImages([...heroImages]);
  }, [heroImages]);

  const saveMutation = useMutation({
    mutationFn: async (data: HeroImageConfig[]) => {
      const { data: existing } = await supabase
        .from('store_settings')
        .select('id')
        .eq('key', 'hero_images')
        .maybeSingle();

      const jsonValue = JSON.parse(JSON.stringify(data));

      if (existing) {
        const { error } = await supabase
          .from('store_settings')
          .update({ value: jsonValue })
          .eq('key', 'hero_images');
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('store_settings')
          .insert([{ key: 'hero_images', value: jsonValue }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-images'] });
      toast.success(isRTL ? 'تم حفظ صور الهيرو بنجاح' : 'Hero images saved successfully');
    },
    onError: () => {
      toast.error(isRTL ? 'خطأ في حفظ الصور' : 'Error saving images');
    },
  });

  const handleUrlChange = (page: string, field: 'image_url' | 'mobile_image_url', value: string) => {
    setImages((prev) =>
      prev.map((img) => (img.page === page ? { ...img, [field]: value } : img))
    );
  };

  const uploadBlob = async (blob: Blob, page: string, field: 'image_url' | 'mobile_image_url') => {
    const key = `${page}-${field}`;
    setUploading(key);
    try {
      const compressed = await browser(new File([blob], 'cropped.jpg', { type: blob.type }), {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      });

      const fileName = `hero-${page}-${field === 'mobile_image_url' ? 'mobile' : 'desktop'}-${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, compressed, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      handleUrlChange(page, field, urlData.publicUrl);
      toast.success(isRTL ? 'تم رفع الصورة' : 'Image uploaded');
    } catch (err) {
      console.error(err);
      toast.error(isRTL ? 'خطأ في رفع الصورة' : 'Upload error');
    } finally {
      setUploading(null);
    }
  };

  const openFileForCrop = useCallback((file: File, page: string, field: 'image_url' | 'mobile_image_url') => {
    if (!file.type.startsWith('image/')) {
      toast.error(isRTL ? 'يرجى اختيار صورة' : 'Please select an image');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCropImageSrc(reader.result as string);
      setCropTarget({ page, field });
      setCropOriginalFile(file);
      setCropOpen(true);
    };
    reader.readAsDataURL(file);
  }, [isRTL]);

  const handleUpload = (page: string, field: 'image_url' | 'mobile_image_url') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) openFileForCrop(file, page, field);
    };
    input.click();
  };

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>, page: string, field: 'image_url' | 'mobile_image_url') => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(null);
    const file = e.dataTransfer.files?.[0];
    if (file) openFileForCrop(file, page, field);
  }, [openFileForCrop]);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>, key: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(key);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(null);
  }, []);

  const handleCropDone = async (croppedBlob: Blob) => {
    setCropOpen(false);
    if (!cropTarget) return;
    await uploadBlob(croppedBlob, cropTarget.page, cropTarget.field);
    setCropTarget(null);
    setCropImageSrc('');
    setCropOriginalFile(null);
  };

  const handleReset = (page: string) => {
    const def = defaultHeroImages.find((d) => d.page === page);
    if (def) {
      setImages((prev) => prev.map((img) => (img.page === page ? { ...def } : img)));
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Image className="w-5 h-5" />
            {isRTL ? 'إدارة صور الهيرو' : 'Hero Images Manager'}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isRTL
              ? 'تحكم في صور الخلفية لجميع صفحات المنصة — اسحب وأفلت الصورة على البطاقة أو اضغط للرفع'
              : 'Manage background images — drag & drop onto a card or click to upload'}
          </p>
        </div>
        <Button
          onClick={() => saveMutation.mutate(images)}
          disabled={saveMutation.isPending}
          className="gap-2"
        >
          {saveMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isRTL ? 'حفظ الكل' : 'Save All'}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {images.map((img) => {
          const dropKey = `${img.page}-image_url`;
          const isDragging = dragOver === dropKey;

          return (
            <Card key={img.page} className="overflow-hidden">
              {/* Preview — acts as drop zone */}
              <div
                className={`relative h-32 bg-muted transition-all cursor-pointer ${
                  isDragging ? 'ring-2 ring-primary ring-inset scale-[1.02]' : ''
                }`}
                onDrop={(e) => handleDrop(e, img.page, 'image_url')}
                onDragOver={(e) => handleDragOver(e, dropKey)}
                onDragLeave={handleDragLeave}
                onClick={() => handleUpload(img.page, 'image_url')}
              >
                {img.image_url && (
                  <img
                    src={img.image_url}
                    alt={isRTL ? img.label_ar : img.label_en}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Drag overlay */}
                {isDragging && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center z-10">
                    <div className="bg-background/90 rounded-lg px-4 py-2 flex items-center gap-2 shadow-lg">
                      <Upload className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium">
                        {isRTL ? 'أفلت الصورة هنا' : 'Drop image here'}
                      </span>
                    </div>
                  </div>
                )}

                <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between z-20">
                  <span className="text-white font-bold text-sm">
                    {isRTL ? img.label_ar : img.label_en}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-white hover:bg-white/20"
                    onClick={(e) => { e.stopPropagation(); handleReset(img.page); }}
                    title={isRTL ? 'استعادة الافتراضي' : 'Reset to default'}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              <CardContent className="p-4 space-y-3">
                {/* Desktop Image */}
                <div className="space-y-1.5">
                  <Label className="text-xs">{isRTL ? 'صورة سطح المكتب' : 'Desktop Image URL'}</Label>
                  <div className="flex gap-2">
                    <Input
                      value={img.image_url}
                      onChange={(e) => handleUrlChange(img.page, 'image_url', e.target.value)}
                      placeholder="https://..."
                      className="text-xs"
                      dir="ltr"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="shrink-0"
                      onClick={(e) => { e.stopPropagation(); handleUpload(img.page, 'image_url'); }}
                      disabled={uploading === `${img.page}-image_url`}
                    >
                      {uploading === `${img.page}-image_url` ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Mobile Image (Home only) — with its own drop zone */}
                {img.page === 'home' && (() => {
                  const mobileDropKey = `${img.page}-mobile_image_url`;
                  const isMobileDragging = dragOver === mobileDropKey;
                  return (
                    <div className="space-y-1.5">
                      <Label className="text-xs">{isRTL ? 'صورة الموبايل' : 'Mobile Image URL'}</Label>

                      {/* Mobile drop zone */}
                      <div
                        className={`relative h-20 rounded-lg overflow-hidden bg-muted cursor-pointer transition-all border-2 border-dashed ${
                          isMobileDragging
                            ? 'border-primary scale-[1.02] bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onDrop={(e) => handleDrop(e, img.page, 'mobile_image_url')}
                        onDragOver={(e) => handleDragOver(e, mobileDropKey)}
                        onDragLeave={handleDragLeave}
                        onClick={() => handleUpload(img.page, 'mobile_image_url')}
                      >
                        {img.mobile_image_url ? (
                          <>
                            <img
                              src={img.mobile_image_url}
                              alt="mobile hero"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                              <Upload className="w-5 h-5 text-white" />
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full gap-1 text-muted-foreground">
                            <Upload className="w-4 h-4" />
                            <span className="text-xs">{isRTL ? 'اسحب صورة الموبايل هنا' : 'Drop mobile image here'}</span>
                          </div>
                        )}

                        {isMobileDragging && (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                            <div className="bg-background/90 rounded-lg px-3 py-1.5 flex items-center gap-2 shadow">
                              <Upload className="w-4 h-4 text-primary" />
                              <span className="text-xs font-medium">
                                {isRTL ? 'أفلت هنا' : 'Drop here'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Input
                          value={img.mobile_image_url || ''}
                          onChange={(e) => handleUrlChange(img.page, 'mobile_image_url', e.target.value)}
                          placeholder="https://..."
                          className="text-xs"
                          dir="ltr"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="shrink-0"
                          onClick={(e) => { e.stopPropagation(); handleUpload(img.page, 'mobile_image_url'); }}
                          disabled={uploading === `${img.page}-mobile_image_url`}
                        >
                          {uploading === `${img.page}-mobile_image_url` ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Crop Dialog */}
      <ImageCropDialog
        open={cropOpen}
        imageSrc={cropImageSrc}
        aspect={cropTarget?.field === 'mobile_image_url' ? 9 / 16 : 16 / 6}
        onClose={() => setCropOpen(false)}
        onCropComplete={handleCropDone}
        isRTL={isRTL}
      />
    </div>
  );
};

export default HeroImagesManager;
