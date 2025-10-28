"use client";

import { useState, useRef } from 'react';
import Image from 'next/image';
import { UploadCloud, Copy, Loader2, X, Pilcrow, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { generateContent } from './actions';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useLanguage } from '@/context/language-context';

type TargetMarket = 'Gen Z' | 'Young Professionals' | 'Families';

export default function Home() {
  const { t } = useLanguage();
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [targetMarket, setTargetMarket] = useState<TargetMarket>('Gen Z');
  const [analysis, setAnalysis] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const placeholderImage = PlaceHolderImages[0];

  const handleFileChange = (file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageDataUrl(reader.result as string);
        if (imagePreviewUrl) {
          URL.revokeObjectURL(imagePreviewUrl);
        }
        setImagePreviewUrl(URL.createObjectURL(file));
        setAnalysis('');
        setDescription('');
        setError(null);
      };
      reader.readAsDataURL(file);
    } else {
      setError(t('invalidFileError'));
      toast({
        title: t('invalidFileTitle'),
        description: t('invalidFileError'),
        variant: "destructive",
      });
    }
  };
  
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e.target.files?.[0] || null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileChange(e.dataTransfer.files?.[0] || null);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleGenerate = async () => {
    if (!imageDataUrl) {
      setError(t('uploadFirstError'));
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysis('');
    setDescription('');
    
    const result = await generateContent(imageDataUrl, customPrompt, targetMarket);

    if (result.error) {
      setError(result.error);
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    } else if (result.analysis && result.description) {
      setAnalysis(result.analysis);
      setDescription(result.description);
    }
    setIsLoading(false);
  };
  
  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: t('copiedTitle'),
        description: `${field} ${t('copiedDescription')}`,
      });
    }).catch(err => {
      console.error('Failed to copy: ', err);
      toast({
        title: t('copyFailedTitle'),
        description: t('copyFailedDescription'),
        variant: 'destructive',
      });
    });
  };

  const removeImage = () => {
    setImageDataUrl(null);
    if(imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
        setImagePreviewUrl(null);
    }
    setAnalysis('');
    setDescription('');
    setError(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const targetMarketTranslations: Record<TargetMarket, string> = {
    'Gen Z': 'Gen Z',
    'Young Professionals': t('youngProfessionals'),
    'Families': t('families')
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-3xl md:text-5xl font-bold font-headline tracking-tight">
          {t('pageTitle')}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {t('pageDescription')}
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left Column: Upload */}
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden shadow-lg">
            <CardHeader>
                <CardTitle>{t('uploadCardTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              {!imagePreviewUrl ? (
                <div
                  className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors overflow-hidden"
                  onClick={triggerFileSelect}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  {placeholderImage && (
                    <Image 
                      src={placeholderImage.imageUrl} 
                      alt={placeholderImage.description} 
                      fill 
                      className="object-cover opacity-10 dark:opacity-5" 
                      data-ai-hint={placeholderImage.imageHint}
                    />
                  )}
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <UploadCloud className="w-12 h-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground" dangerouslySetInnerHTML={{ __html: t('dragAndDrop')}} />
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onFileChange}
                  />
                </div>
              ) : (
                <div className="relative group">
                  <Image
                    src={imagePreviewUrl}
                    alt={t('productPreviewAlt')}
                    width={600}
                    height={400}
                    className="w-full h-auto object-contain rounded-lg max-h-[50vh]"
                  />
                  <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={removeImage}
                  >
                      <X className="w-4 h-4" />
                      <span className="sr-only">{t('removeImage')}</span>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Pilcrow className="w-5 h-5" />
                    {t('customPromptTitle')}
                </CardTitle>
                <CardDescription>
                    {t('customPromptDescription')}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Textarea 
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder={t('customPromptPlaceholder')}
                    className="h-24"
                />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                {t('targetMarketTitle')}
              </CardTitle>
              <CardDescription>
                {t('targetMarketDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {(['Gen Z', 'Young Professionals', 'Families'] as TargetMarket[]).map((market) => (
                <Button
                  key={market}
                  variant={targetMarket === market ? 'default' : 'outline'}
                  onClick={() => setTargetMarket(market)}
                >
                  {targetMarketTranslations[market]}
                </Button>
              ))}
            </CardContent>
          </Card>


          {error && !isLoading && <p className="text-center text-destructive">{error}</p>}
          
          <Button onClick={handleGenerate} disabled={!imageDataUrl || isLoading} size="lg" className="font-bold text-lg px-8 py-6 w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {t('generatingButton')}...
              </>
            ) : (
              t('generateButton')
            )}
          </Button>
        </div>
        
        {/* Right Column: Results */}
        <div className={cn("grid gap-8 content-start", 
          (!isLoading && !analysis && !description) ? "hidden md:grid" : "grid"
        )}>
          {isLoading ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="h-6 w-1/3 bg-muted rounded-md animate-pulse" />
                </CardHeader>
                <CardContent>
                  <div className="w-full h-24 bg-muted animate-pulse rounded-md" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="h-6 w-1/3 bg-muted rounded-md animate-pulse" />
                </CardHeader>
                <CardContent>
                  <div className="w-full h-32 bg-muted animate-pulse rounded-md" />
                </CardContent>
              </Card>
            </>
          ) : (
            <>
                {(analysis || description) ? (
                    <>
                    {analysis && (
                    <Card className="animate-in fade-in-0 slide-in-from-bottom-5 duration-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xl font-headline">{t('imageAnalysisTitle')}</CardTitle>
                        <Button variant="ghost" size="icon" onClick={() => handleCopy(analysis, t('imageAnalysisTitle'))}>
                            <Copy className="w-4 h-4" />
                            <span className="sr-only">{t('copyAnalysis')}</span>
                        </Button>
                        </CardHeader>
                        <CardContent>
                        <Textarea
                            readOnly
                            value={analysis}
                            className="h-32 bg-background/50 text-base"
                        />
                        </CardContent>
                    </Card>
                    )}
                    
                    {description && (
                    <Card className="animate-in fade-in-0 slide-in-from-bottom-5 duration-700">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xl font-headline">{t('productDescriptionTitle')} ({targetMarketTranslations[targetMarket]})</CardTitle>
                        <Button variant="ghost" size="icon" onClick={() => handleCopy(description, t('productDescriptionTitle'))}>
                            <Copy className="w-4 h-4" />
                            <span className="sr-only">{t('copyDescription')}</span>
                        </Button>
                        </CardHeader>
                        <CardContent>
                        <Textarea
                            readOnly
                            value={description}
                            className="h-48 bg-background/50 text-base"
                        />
                        </CardContent>
                    </Card>
                    )}
                </>
                ) : (
                    <Card className="hidden md:block">
                        <CardHeader>
                            <CardTitle>{t('resultsTitle')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{t('resultsDescription')}</p>
                        </CardContent>
                    </Card>
                )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
