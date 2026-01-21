import { useState } from 'react';

type Media = {
    id: string;
    url: string;
    type: 'IMAGE' | 'VIDEO';
};

type Props = {
    media?: Media[];
    image?: string;
    name?: string;
};

export default function NFTMedia({ media, image, name }: Props) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // If media array exists and has items, use it. Otherwise fall back to image.
    const hasMedia = media && media.length > 0;
    const currentMedia = hasMedia ? media[currentIndex] : null;

    if (!hasMedia && !image) return <div className="aspect-square bg-gray-800 rounded-xl" />;

    return (
        <div className="space-y-4">
            {/* Main Media Viewer */}
            <div className="border border-gray-700 bg-gray-900/50 rounded-xl overflow-hidden relative aspect-square group">
                {/* Header/Top Bar (Ethereum logo placeholder or similar authentic touches) */}
                <div className="absolute top-4 left-4 z-10">
                    <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-200" viewBox="0 0 32 32" fill="currentColor">
                            <path d="M15.925 23.96l-9.819-5.8 9.819 13.84 9.825-13.84-9.825 5.8zm0-23.96l-9.819 16.29 9.819 5.81 9.825-5.81-9.825-16.29z" />
                        </svg>
                    </div>
                </div>

                <div className="w-full h-full flex items-center justify-center">
                    {currentMedia ? (
                        currentMedia.type === 'VIDEO' ? (
                            <video
                                src={currentMedia.url}
                                controls
                                autoPlay
                                loop
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            <img
                                src={currentMedia.url}
                                alt={name}
                                className="w-full h-full object-contain max-h-[600px]"
                            />
                        )
                    ) : (
                        <img
                            src={image}
                            alt={name}
                            className="w-full h-full object-contain max-h-[600px]"
                        />
                    )}
                </div>

                {/* Navigation Arrows */}
                {hasMedia && media.length > 1 && (
                    <>
                        <button
                            onClick={() => setCurrentIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1))}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all border border-white/10"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setCurrentIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1))}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all border border-white/10"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </>
                )}
            </div>

            {/* Thumbnails (Carousel) */}
            {hasMedia && media.length > 1 && (
                <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                    {media.map((m, i) => (
                        <button
                            key={m.id}
                            onClick={() => setCurrentIndex(i)}
                            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${currentIndex === i
                                    ? 'border-gray-500 opacity-100'
                                    : 'border-transparent opacity-60 hover:opacity-100'
                                }`}
                        >
                            {m.type === 'VIDEO' ? (
                                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                    </svg>
                                </div>
                            ) : (
                                <img src={m.url} className="w-full h-full object-cover" alt="thumb" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
