import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ArticleImage {
    src: string;
    alt: {
        ES: string;
        EN: string;
        FR: string;
    };
    caption?: {
        ES: string;
        EN: string;
        FR: string;
    };
}

interface ArticleImageGalleryProps {
    images: ArticleImage[];
    language: 'ES' | 'EN' | 'FR';
}

/**
 * Image gallery component for help articles
 * Displays screenshots with captions in a carousel format
 */
export const ArticleImageGallery: React.FC<ArticleImageGalleryProps> = ({ images, language }) => {
    const [currentIndex, setCurrentIndex] = React.useState(0);

    if (!images || images.length === 0) {
        return null;
    }

    const currentImage = images[currentIndex];

    const goToNext = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div className="my-8 bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            {/* Image Container */}
            <div className="relative group">
                <div className="relative aspect-video bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-lg">
                    <img
                        src={currentImage.src}
                        alt={currentImage.alt[language]}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                            // Fallback for missing images
                            const target = e.target as HTMLImageElement;
                            target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="450"%3E%3Crect fill="%23f3f4f6" width="800" height="450"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="22" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EImagen no disponible%3C/text%3E%3C/svg%3E';
                        }}
                    />
                </div>

                {/* Navigation Arrows (only if multiple images) */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={goToPrevious}
                            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-gray-700"
                            aria-label="Previous image"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        </button>
                        <button
                            onClick={goToNext}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-gray-700"
                            aria-label="Next image"
                        >
                            <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        </button>
                    </>
                )}
            </div>

            {/* Caption */}
            {currentImage.caption && (
                <p className="mt-4 text-sm text-gray-700 dark:text-gray-300 text-center font-medium">
                    {currentImage.caption[language]}
                </p>
            )}

            {/* Dots Indicator (only if multiple images) */}
            {images.length > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all ${index === currentIndex
                                    ? 'bg-indigo-600 w-6'
                                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                                }`}
                            aria-label={`Go to image ${index + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* Image Counter */}
            {images.length > 1 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                    {currentIndex + 1} / {images.length}
                </p>
            )}
        </div>
    );
};

export default ArticleImageGallery;
