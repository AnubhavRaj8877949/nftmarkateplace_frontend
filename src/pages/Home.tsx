import { useQuery } from '@tanstack/react-query';
import { BACKEND_URL } from '../constants';
import { useState } from 'react';
import HeroSection from '../components/home/HeroSection';
import CollectionList from '../components/home/CollectionList';
import TrendingSection from '../components/home/TrendingSection';

type Listing = {
    id: string;
    price: string;
    sellerAddress: string;
    nftId: string;
    nft: {
        tokenId: string;
        tokenURI: string;
        contractAddress: string;
        name?: string;
        description?: string;
        image?: string;
        collection?: {
            name: string;
        };
    };
};

type Collection = {
    id: string;
    name: string;
    _count: { nfts: number };
};

export default function Home() {
    const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);

    const { data: collections } = useQuery<Collection[]>({
        queryKey: ['collections'],
        queryFn: async () => {
            const res = await fetch(`${BACKEND_URL}/collections`);
            return res.json();
        },
    });

    const { data: listings, isLoading } = useQuery<Listing[]>({
        queryKey: ['listings', selectedCollectionId],
        queryFn: async () => {
            const url = selectedCollectionId
                ? `${BACKEND_URL}/listings?collectionId=${selectedCollectionId}`
                : `${BACKEND_URL}/listings`;
            const res = await fetch(url);
            return res.json();
        },
    });

    return (
        <div className="min-h-screen pb-20 bg-[#0a0b0d]">
            <HeroSection />

            <div className="container mx-auto px-4 space-y-12 -mt-20 relative z-20">
                {/* Collections Section */}
                {collections && (
                    <CollectionList
                        collections={collections}
                        selectedCollectionId={selectedCollectionId}
                        onSelectCollection={setSelectedCollectionId}
                    />
                )}

                {/* Trending/Listings Section */}
                <TrendingSection
                    listings={listings || []}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
}
