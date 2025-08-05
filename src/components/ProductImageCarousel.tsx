import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProductImage {
  id: number;
  image_url: string;
  alt_text?: string;
  is_primary?: boolean;
}

interface ProductImageCarouselProps {
  images: ProductImage[];
  productName: string;
  className?: string;
}

const ProductImageCarousel: React.FC<ProductImageCarouselProps> = ({
  images,
  productName,
  className
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // 如果沒有圖片，使用預設圖片
  const displayImages = images.length > 0 ? images : [
    { id: 0, image_url: '/images/placeholder.jpg', alt_text: productName }
  ];

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % displayImages.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  const handleImageError = (imageId: number) => {
    setImageErrors(prev => new Set(prev).add(imageId));
  };

  const getImageSrc = (image: ProductImage) => {
    if (imageErrors.has(image.id)) {
      return '/images/placeholder.jpg';
    }
    return image.image_url || '/images/placeholder.jpg';
  };

  // 觸控滑動處理
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && displayImages.length > 1) {
      nextImage();
    }
    if (isRightSwipe && displayImages.length > 1) {
      prevImage();
    }
    
    setTouchStart(0);
    setTouchEnd(0);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* 主圖片顯示區域 */}
      <div 
        className="relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg group"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={getImageSrc(displayImages[currentIndex])}
          alt={displayImages[currentIndex].alt_text || productName}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => handleImageError(displayImages[currentIndex].id)}
        />
        
        {/* 導航箭頭 - 只在有多張圖片時顯示 */}
        {displayImages.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 shadow-lg opacity-70 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300"
              onClick={prevImage}
              aria-label="上一張圖片"
              title="上一張圖片"
            >
              <ChevronLeft size={20} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 shadow-lg opacity-70 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300"
              onClick={nextImage}
              aria-label="下一張圖片"
              title="下一張圖片"
            >
              <ChevronRight size={20} />
            </Button>
          </>
        )}
        
        {/* 圖片指示器 */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {displayImages.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  index === currentIndex 
                    ? "bg-white scale-125" 
                    : "bg-white/60 hover:bg-white/80"
                )}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 縮圖列表 - 只在有多張圖片時顯示 */}
      {displayImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {displayImages.slice(0, 4).map((image, index) => (
            <button
              key={image.id}
              className={cn(
                "aspect-square overflow-hidden rounded-lg border-2 transition-all duration-300 touch-manipulation",
                index === currentIndex 
                  ? "border-blue-500 scale-105" 
                  : "border-gray-200 hover:border-gray-300"
              )}
              onClick={() => setCurrentIndex(index)}
            >
              <img
                src={getImageSrc(image)}
                alt={image.alt_text || `${productName} 圖片 ${index + 1}`}
                className="h-full w-full object-cover"
                onError={() => handleImageError(image.id)}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageCarousel;