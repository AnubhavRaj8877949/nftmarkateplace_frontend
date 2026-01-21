import { useQuery } from '@tanstack/react-query';
import { BACKEND_URL } from '../constants';
import { Link } from 'react-router-dom';
import { useState } from 'react';

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
    // const { address: userAddress } = useAccount();
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


    if (isLoading) return (
        <div className="flex justify-center items-center h-[60vh]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    return (
        <div className="min-h-screen pb-20">
            {/* Hero Section */}
            <div className="relative h-[500px] flex items-center justify-center overflow-hidden mb-12">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-600/20 to-transparent z-10" />
                    <img
                        src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=2000"
                        className="w-full h-full object-cover opacity-40 blur-sm"
                        alt="Hero Background"
                    />
                </div>

                <div className="container mx-auto px-4 relative z-20 text-center">
                    <h1 className="text-7xl font-black mb-6 tracking-tight">
                        Discover, collect, and sell <br />
                        <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            extraordinary NFTs
                        </span>
                    </h1>
                    <p className="text-gray-300 text-xl max-w-2xl mx-auto mb-10 font-medium">
                        OpenSea is the world's first and largest web3 marketplace for NFTs and crypto collectibles.
                    </p>
                    <div className="flex justify-center space-x-4">
                        <Link to="/create" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all active:scale-95 shadow-xl shadow-blue-900/20">
                            Create NFT
                        </Link>

                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-black">Notable Collections</h2>
                    <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                        <button
                            onClick={() => setSelectedCollectionId(null)}
                            className={`px-6 py-2.5 rounded-xl transition-all text-sm font-black border ${!selectedCollectionId ? 'bg-blue-600 border-transparent text-white shadow-lg shadow-blue-900/20' : 'bg-gray-800/50 hover:bg-gray-700 text-gray-400 border-gray-700'}`}
                        >
                            All
                        </button>
                        {Array.isArray(collections) && collections.map(col => (
                            <button
                                key={col.id}
                                onClick={() => setSelectedCollectionId(col.id)}
                                className={`px-6 py-2.5 rounded-xl transition-all text-sm font-black border whitespace-nowrap ${selectedCollectionId === col.id ? 'bg-blue-600 border-transparent text-white shadow-lg shadow-blue-900/20' : 'bg-gray-800/50 hover:bg-gray-700 text-gray-400 border-gray-700'}`}
                            >
                                {col.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {listings?.map((listing) => (
                        <div key={listing.id} className="opensea-card bg-gray-800/40 rounded-3xl overflow-hidden border border-gray-700/50 group flex flex-col">
                            <Link to={`/nft/${listing.nft.contractAddress}/${listing.nft.tokenId}`} className="aspect-square relative overflow-hidden block">
                                <img
                                    src={listing.nft.image || listing.nft.tokenURI}
                                    alt={listing.nft.name || "NFT"}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl text-sm font-bold border border-white/30">View Details</span>
                                </div>
                            </Link>

                            <div className="p-5 flex-1 flex flex-col">
                                <div className="mb-4">
                                    <h3 className="text-lg font-bold text-white mb-1 truncate">{listing.nft.name || `Token #${listing.nft.tokenId}`}</h3>
                                    <p className="text-sm text-gray-400 font-medium">By {listing.sellerAddress.slice(0, 6)}...{listing.sellerAddress.slice(-4)}</p>
                                </div>

                                <div className="mt-auto pt-4 border-t border-gray-700/50 flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Price</p>
                                        <p className="text-xl font-black text-white">{listing.price} CINT</p>
                                    </div>
                                    {/* <button
                                        onClick={() => handleBuy(listing)}
                                        disabled={isBuying || userAddress?.toLowerCase() === listing.sellerAddress.toLowerCase()}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-900/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isBuying ? 'Buying...' :
                                            userAddress?.toLowerCase() === listing.sellerAddress.toLowerCase() ? 'Owned' : 'Buy Now'}
                                    </button> */}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {listings?.length === 0 && (
                    <div className="text-center text-gray-500 mt-20 py-32 bg-gray-800/20 rounded-[40px] border-2 border-dashed border-gray-800">
                        <p className="text-3xl font-black text-white mb-3">No items found</p>
                        <p className="text-lg">Be the first to list an NFT and start the revolution!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
