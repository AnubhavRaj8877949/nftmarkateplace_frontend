import { useQuery } from '@tanstack/react-query';
import { BACKEND_URL, MARKETPLACE_ADDRESS, MARKETPLACE_ABI, NFT_ABI } from '../constants';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount } from 'wagmi';
import { parseEther } from 'viem';

type NFT = {
    tokenId: string;
    tokenURI: string;
    contractAddress: string;
    name?: string;
    description?: string;
    image?: string;
    media: { url: string, type: string }[];
};

type Listing = {
    id: string;
    price: string;
    active: boolean;
    nft: NFT;
};

type Offer = {
    id: string;
    price: string;
    active: boolean;
    nft: {
        tokenId: string;
        contractAddress: string;
        name?: string;
        image?: string;
    };
    offerer?: { address: string };
};


import { Link, useSearchParams } from 'react-router-dom';

function NFTCard({ nft, onListSuccess }: { nft: any, onListSuccess: () => void }) {
    const { address: userAddress } = useAccount();
    const [price, setPrice] = useState("");
    const { writeContract, data: hash } = useWriteContract();
    const { isLoading: isTxLoading, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({ hash });

    // Check if Marketplace is approved for all NFTs of this user
    const { data: isApprovedForAll, refetch: refetchApproval } = useReadContract({
        address: nft.contractAddress as `0x${string}`,
        abi: NFT_ABI,
        functionName: 'isApprovedForAll',
        args: [userAddress as `0x${string}`, MARKETPLACE_ADDRESS as `0x${string}`],
        query: {
            enabled: !!userAddress,
        }
    });

    useEffect(() => {
        if (isTxSuccess) {
            refetchApproval();
            onListSuccess();
        }
    }, [isTxSuccess, refetchApproval, onListSuccess]);

    const handleApprove = () => {
        writeContract({
            address: nft.contractAddress as `0x${string}`,
            abi: NFT_ABI,
            functionName: 'setApprovalForAll',
            args: [MARKETPLACE_ADDRESS as `0x${string}`, true],
        });
    };

    const handleList = () => {
        if (!price) return alert("Enter a price");
        writeContract({
            address: MARKETPLACE_ADDRESS as `0x${string}`,
            abi: MARKETPLACE_ABI,
            functionName: 'list',
            args: [nft.contractAddress as `0x${string}`, BigInt(nft.tokenId), parseEther(price)],
        });
    };

    return (
        <div className="bg-gray-800/50 rounded-2xl overflow-hidden shadow-xl border border-gray-700 group flex flex-col">
            <Link to={`/nft/${nft.contractAddress}/${nft.tokenId}`} className="aspect-square relative overflow-hidden block">
                <img src={nft.image || nft.tokenURI} alt={nft.name || "NFT"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold border border-white/30">View Details</span>
                </div>
            </Link>
            <div className="p-6 flex-1 flex flex-col">
                <p className="font-black text-xl mb-1 text-white">{nft.name || `Token #${nft.tokenId}`}</p>
                <p className="text-gray-400 text-sm mb-4 truncate">{nft.description}</p>

                <div className="mt-auto space-y-3">
                    {isApprovedForAll && (<input
                        type="text"
                        placeholder="Price in CINT"
                        className="w-full p-3 rounded-xl bg-gray-900 border border-gray-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                    />)}

                    <div className="flex gap-2">
                        {!isApprovedForAll ? (
                            <button
                                onClick={handleApprove}
                                disabled={isTxLoading}
                                className="w-full bg-gray-700 hover:bg-gray-600 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-50"
                            >
                                {isTxLoading ? 'Approving...' : 'Approve Marketplace'}
                            </button>
                        ) : (
                            <button
                                onClick={handleList}
                                disabled={isTxLoading}
                                className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-50"
                            >
                                {isTxLoading ? 'Listing...' : 'List for Sale'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Profile() {
    const { address } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState('collection');

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab) setActiveTab(tab);
    }, [searchParams]);

    const { data: nfts, isLoading: isNftsLoading, refetch: refetchNfts } = useQuery<NFT[]>({
        queryKey: ['user-nfts', address],
        queryFn: async () => {
            const res = await fetch(`${BACKEND_URL}/nfts?ownerAddress=${address}`);
            return res.json();
        },
        enabled: !!address,
    });

    const { data: activeListings, isLoading: isListingsLoading, refetch: refetchListings } = useQuery<Listing[]>({
        queryKey: ['user-listings', address],
        queryFn: async () => {
            const res = await fetch(`${BACKEND_URL}/listings?sellerAddress=${address}`);
            return res.json();
        },
        enabled: !!address,
    });

    const { data: offersReceived, isLoading: isOffersReceivedLoading, refetch: refetchOffersReceived } = useQuery<Offer[]>({
        queryKey: ['offers-received', address],
        queryFn: async () => {
            const res = await fetch(`${BACKEND_URL}/offers/received/${address}`);
            return res.json();
        },
        enabled: !!address,
    });

    const { data: offersMade, isLoading: isOffersMadeLoading, refetch: refetchOffersMade } = useQuery<Offer[]>({
        queryKey: ['offers-made', address],
        queryFn: async () => {
            const res = await fetch(`${BACKEND_URL}/offers/made/${address}`);
            return res.json();
        },
        enabled: !!address,
    });

    const refetchAll = () => {
        refetchNfts();
        refetchListings();
        refetchOffersReceived();
        refetchOffersMade();
    };

    const { writeContract, data: hash } = useWriteContract();

    useEffect(() => {
        if (hash) {
            // Give indexer 2 seconds to catch up before refetching
            setTimeout(() => {
                refetchAll();
            }, 2000);
        }
    }, [hash]);

    const isLoading = isNftsLoading || isListingsLoading || isOffersReceivedLoading || isOffersMadeLoading;

    if (isLoading) return (
        <div className="flex justify-center items-center h-[60vh]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    if (!address) return <div className="text-center py-20 text-white text-2xl">No address provided</div>;

    const listedTokenIds = new Set(activeListings?.map(l => l.nft.tokenId));
    const unlistedNfts = nfts?.filter(nft => !listedTokenIds.has(nft.tokenId)) || [];

    const handleAcceptOffer = (nftAddress: string, tokenId: string, offerer: string) => {
        writeContract({
            address: MARKETPLACE_ADDRESS as `0x${string}`,
            abi: MARKETPLACE_ABI,
            functionName: 'acceptOffer',
            args: [nftAddress as `0x${string}`, BigInt(tokenId), offerer as `0x${string}`],
        });
    };

    const tabs = [
        { id: 'collection', label: 'Collection', count: unlistedNfts.length },
        { id: 'listings', label: 'Listings', count: activeListings?.length || 0 },
        { id: 'received', label: 'Offers Received', count: offersReceived?.length || 0 },
        { id: 'made', label: 'Offers Made', count: offersMade?.length || 0 },
    ];

    return (
        <div className="min-h-screen pb-20">
            {/* Profile Header */}
            <div className="h-80 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative mb-32">
                <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 lg:left-20 lg:translate-x-0 flex flex-col lg:flex-row items-center lg:items-end lg:space-x-8">
                    <div className="w-48 h-48 rounded-[48px] bg-gray-900 border-[8px] border-gray-900 overflow-hidden shadow-2xl flex items-center justify-center text-6xl font-black bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {address.slice(2, 4).toUpperCase()}
                    </div>
                    <div className="mb-4 text-center lg:text-left">
                        <h1 className="text-5xl font-black text-white mb-3 tracking-tight">
                            {address.slice(0, 6)}...{address.slice(-4)}
                        </h1>
                        <div className="flex items-center justify-center lg:justify-start space-x-4">
                            <span className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black text-white border border-white/20 uppercase tracking-widest">Joined Jan 2026</span>
                            <span className="bg-blue-500/20 px-4 py-1.5 rounded-full text-xs font-black text-blue-400 border border-blue-500/20 uppercase tracking-widest">{nfts?.length || 0} Items</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4">
                {/* Tabs */}
                <div className="flex items-center space-x-2 mb-12 border-b border-gray-800 pb-4 overflow-x-auto scrollbar-hide">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setSearchParams({ tab: tab.id }); }}
                            className={`flex items-center space-x-3 px-8 py-4 rounded-[24px] font-black text-sm transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'}`}
                        >
                            <span>{tab.label}</span>
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-800 text-gray-600'}`}>{tab.count}</span>
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {activeTab === 'collection' && (
                        <section>
                            {unlistedNfts.length === 0 ? (
                                <div className="bg-gray-800/20 rounded-[48px] p-32 text-center border-2 border-dashed border-gray-800">
                                    <p className="text-gray-500 text-2xl font-black">No unlisted NFTs found.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                    {unlistedNfts.map((nft) => (
                                        <NFTCard key={`${nft.contractAddress}-${nft.tokenId}`} nft={nft} onListSuccess={refetchAll} />
                                    ))}
                                </div>
                            )}
                        </section>
                    )}

                    {activeTab === 'listings' && (
                        <section>
                            {activeListings.length === 0 ? (
                                <div className="bg-gray-800/20 rounded-[48px] p-32 text-center border-2 border-dashed border-gray-800">
                                    <p className="text-gray-500 text-2xl font-black">No active listings.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                    {activeListings?.map((listing) => (
                                        <div key={listing.id} className="opensea-card bg-gray-800/40 rounded-[32px] overflow-hidden border border-gray-700/50 group flex flex-col">
                                            <Link to={`/nft/${listing.nft.contractAddress}/${listing.nft.tokenId}`} className="aspect-square relative overflow-hidden block">
                                                <img src={listing.nft.image || listing.nft.tokenURI} alt={listing.nft.name || "NFT"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <span className="bg-white/20 backdrop-blur-md px-8 py-4 rounded-2xl text-sm font-black border border-white/30">View Details</span>
                                                </div>
                                            </Link>
                                            <div className="p-8 flex-1 flex flex-col">
                                                <div className="mb-6">
                                                    <p className="text-xl font-black text-white mb-1 truncate">{listing.nft.name || `Token #${listing.nft.tokenId}`}</p>
                                                    <p className="text-xs text-gray-500 font-black uppercase tracking-widest">Fixed Price</p>
                                                </div>
                                                <div className="mt-auto pt-6 border-t border-gray-700/50 flex justify-between items-center">
                                                    <div>
                                                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Price</p>
                                                        <p className="text-2xl font-black text-white">{listing.price} CINT</p>
                                                    </div>
                                                    <span className="bg-green-500/10 text-green-400 px-4 py-1.5 rounded-xl text-[10px] font-black border border-green-500/20 uppercase tracking-widest">Active</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    )}

                    {activeTab === 'received' && (
                        <section>
                            {offersReceived?.length === 0 ? (
                                <div className="bg-gray-800/20 rounded-[48px] p-32 text-center border-2 border-dashed border-gray-800">
                                    <p className="text-gray-500 text-2xl font-black">No offers received yet.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {offersReceived?.map((offer) => (
                                        <div key={offer.id} className="bg-gray-800/40 p-6 rounded-[32px] border border-gray-700/50 flex items-center justify-between hover:border-gray-600 transition-all group">
                                            <div className="flex items-center space-x-6">
                                                <div className="w-24 h-24 rounded-2xl overflow-hidden border border-gray-700">
                                                    <img src={offer.nft.image} className="w-full h-full object-cover" alt="nft" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-black text-white mb-1">{offer.nft.name}</h3>
                                                    <p className="text-sm font-bold text-blue-400 mb-2">{offer.price} CINT</p>
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-5 h-5 rounded-md bg-gray-700 flex items-center justify-center text-[8px] font-black">
                                                            {offer.offerer?.address.slice(2, 4).toUpperCase()}
                                                        </div>
                                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">From {offer.offerer?.address.slice(0, 8)}...</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col space-y-2">
                                                <button
                                                    onClick={() => handleAcceptOffer(offer.nft.contractAddress, offer.nft.tokenId, offer.offerer?.address || "")}
                                                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-2xl font-black text-sm transition-all shadow-xl shadow-green-900/20"
                                                >
                                                    Accept
                                                </button>
                                                <Link to={`/nft/${offer.nft.contractAddress}/${offer.nft.tokenId}`} className="text-center text-[10px] font-black text-gray-500 hover:text-white transition-colors uppercase tracking-widest">View NFT</Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    )}

                    {activeTab === 'made' && (
                        <section>
                            {offersMade?.length === 0 ? (
                                <div className="bg-gray-800/20 rounded-[48px] p-32 text-center border-2 border-dashed border-gray-800">
                                    <p className="text-gray-500 text-2xl font-black">You haven't made any offers yet.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {offersMade?.map((offer) => (
                                        <div key={offer.id} className="bg-gray-800/40 p-6 rounded-[32px] border border-gray-700/50 flex items-center justify-between hover:border-gray-600 transition-all">
                                            <div className="flex items-center space-x-6">
                                                <div className="w-24 h-24 rounded-2xl overflow-hidden border border-gray-700">
                                                    <img src={offer.nft.image} className="w-full h-full object-cover" alt="nft" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-black text-white mb-1">{offer.nft.name}</h3>
                                                    <p className="text-sm font-bold text-blue-400 mb-1">{offer.price} CINT</p>
                                                    <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-lg text-[10px] font-black border border-blue-500/20 uppercase tracking-widest">Active Offer</span>
                                                </div>
                                            </div>
                                            <Link to={`/nft/${offer.nft.contractAddress}/${offer.nft.tokenId}`} className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-2xl font-black text-sm transition-all">
                                                View NFT
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
}
