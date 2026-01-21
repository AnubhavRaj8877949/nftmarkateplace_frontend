
import { useQuery } from '@tanstack/react-query';
import { BACKEND_URL, MARKETPLACE_ADDRESS, MARKETPLACE_ABI, NFT_ABI } from '../constants';
import { useParams, Link, useSearchParams } from 'react-router-dom';
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

function NFTCard({ nft, onListSuccess }: { nft: any, onListSuccess: () => void }) {
    const { address: userAddress } = useAccount();
    const [price, setPrice] = useState("");
    const { writeContract, data: hash } = useWriteContract();
    const { isLoading: isTxLoading, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({ hash });

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
        <div className="bg-[#1a1b20] rounded-3xl overflow-hidden shadow-xl border border-gray-800 group hover:-translate-y-1 transition-all duration-300">
            <Link to={`/nft/${nft.contractAddress}/${nft.tokenId}`} className="aspect-square relative overflow-hidden block">
                <img src={nft.image || nft.tokenURI} alt={nft.name || "NFT"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-white/20 backdrop-blur-md px-6 py-2.5 rounded-xl text-sm font-bold border border-white/30 text-white">View Details</span>
                </div>
            </Link>
            <div className="p-5">
                <h3 className="font-bold text-lg text-white mb-1 truncate">{nft.name || `Token #${nft.tokenId}`}</h3>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">
                    {nft.collection?.name || 'Unknown Collection'}
                </p>

                <div className="space-y-3 pt-3 border-t border-gray-800/50">
                    {isApprovedForAll && (
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Price in CINT"
                                className="w-full p-3 pl-4 rounded-xl bg-[#0f1014] border border-gray-800 text-sm font-bold text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-gray-600"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                            />
                            <span className="absolute right-4 top-3 text-xs font-black text-gray-500">CINT</span>
                        </div>
                    )}

                    {!isApprovedForAll ? (
                        <button
                            onClick={handleApprove}
                            disabled={isTxLoading}
                            className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl text-sm font-bold transition-all border border-gray-700"
                        >
                            {isTxLoading ? 'Approving...' : 'Approve to List'}
                        </button>
                    ) : (
                        <button
                            onClick={handleList}
                            disabled={isTxLoading}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-900/20"
                        >
                            {isTxLoading ? 'Listing...' : 'List for Sale'}
                        </button>
                    )}
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

    const refetchAll = () => {
        refetchNfts();
        refetchListings();
    };

    const isLoading = isNftsLoading || isListingsLoading;

    if (isLoading) return (
        <div className="flex justify-center items-center h-screen bg-[#0a0b0d]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    if (!address) return <div className="text-center py-20 text-white text-2xl">No address provided</div>;

    const listedTokenIds = new Set(activeListings?.map(l => l.nft.tokenId));
    const unlistedNfts = nfts?.filter(nft => !listedTokenIds.has(nft.tokenId)) || [];

    const tabs = [
        { id: 'collection', label: 'Collected', count: unlistedNfts.length },
        { id: 'listings', label: 'Listings', count: activeListings?.length || 0 },
        { id: 'offers', label: 'Offers', count: 0 }, // Placeholder
    ];

    return (
        <div className="min-h-screen pb-20 bg-[#0a0b0d]">
            {/* Banner */}
            <div className="h-64 md:h-80 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-pink-900/40 animate-gradient-xy" />
                <img
                    src={`https://source.unsplash.com/random/1600x400?sig=${address}&abstract`}
                    className="w-full h-full object-cover opacity-50"
                    alt="Banner"
                    onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                    }}
                />
            </div>

            <div className="container mx-auto px-6 relative z-10 -mt-24">
                <div className="flex flex-col md:flex-row items-end md:items-end gap-6 md:gap-10 pb-8 border-b border-gray-800">

                    {/* Avatar */}
                    <div className="relative group">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-[32px] bg-[#1a1b20] p-2 shadow-2xl">
                            <div className="w-full h-full rounded-[24px] bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-4xl font-black text-white overflow-hidden">
                                {address.slice(2, 4).toUpperCase()}
                            </div>
                        </div>
                        <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-[#1a1b20] rounded-full"></div>
                    </div>

                    {/* User Info */}
                    <div className="flex-1 mb-2 text-center md:text-left">
                        <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">
                            {address.slice(0, 6)}...{address.slice(-4)}
                        </h1>
                        <div className="flex items-center justify-center md:justify-start gap-4 text-sm font-medium text-gray-400">
                            <div className="flex items-center gap-1.5 bg-gray-800/50 px-3 py-1 rounded-full border border-gray-700/50">
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                                <span>Online</span>
                            </div>
                            <span>Joined Jan 2026</span>
                        </div>
                    </div>

                    {/* Social/Action Buttons */}
                    <div className="flex items-center gap-3 mb-2">
                        <button className="p-3 rounded-xl bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-all">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                        </button>
                        <button className="p-3 rounded-xl bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-all">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="mt-12">
                    {/* Tabs */}
                    <div className="flex items-center gap-8 border-b border-gray-800 mb-8 overflow-x-auto scrollbar-hide">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); setSearchParams({ tab: tab.id }); }}
                                className={`pb-4 text-base font-bold transition-all relative ${activeTab === tab.id
                                        ? 'text-white'
                                        : 'text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                <span className="flex items-center gap-2">
                                    {tab.label}
                                    <span className={`text-[10px] px-2 py-0.5 rounded-md ${activeTab === tab.id ? 'bg-gray-100 text-black' : 'bg-gray-800 text-gray-500'
                                        }`}>
                                        {tab.count}
                                    </span>
                                </span>
                                {activeTab === tab.id && (
                                    <span className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-t-full transition-all" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Grid Content */}
                    <div className="min-h-[400px]">
                        {activeTab === 'collection' && (
                            unlistedNfts.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 bg-gray-800/20 rounded-[32px] border-2 border-dashed border-gray-800">
                                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                        <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                                    </div>
                                    <p className="text-gray-500 text-lg font-bold">No items found</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                    {unlistedNfts.map((nft) => (
                                        <NFTCard key={`${nft.contractAddress}-${nft.tokenId}`} nft={nft} onListSuccess={refetchAll} />
                                    ))}
                                </div>
                            )
                        )}

                        {activeTab === 'listings' && (
                            activeListings?.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 bg-gray-800/20 rounded-[32px] border-2 border-dashed border-gray-800">
                                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                        <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                    </div>
                                    <p className="text-gray-500 text-lg font-bold">No active listings</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                    {activeListings?.map((listing) => (
                                        <div key={listing.id} className="bg-[#1a1b20] rounded-3xl overflow-hidden shadow-xl border border-gray-800 group hover:-translate-y-1 transition-all duration-300 flex flex-col">
                                            <Link to={`/nft/${listing.nft.contractAddress}/${listing.nft.tokenId}`} className="aspect-square relative overflow-hidden block">
                                                <img src={listing.nft.image || listing.nft.tokenURI} alt={listing.nft.name || "NFT"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                <div className="absolute top-3 right-3 bg-green-500 text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wide">Listed</div>
                                            </Link>
                                            <div className="p-5 flex-1 flex flex-col">
                                                <div className="mb-4">
                                                    <h3 className="font-bold text-lg text-white mb-1 truncate">{listing.nft.name || `Token #${listing.nft.tokenId}`}</h3>
                                                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Fixed Price</p>
                                                </div>
                                                <div className="mt-auto pt-4 border-t border-gray-800/50 flex items-center justify-between">
                                                    <div>
                                                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-0.5">Price</p>
                                                        <p className="text-xl font-black text-white">{listing.price} CINT</p>
                                                    </div>
                                                    <Link to={`/nft/${listing.nft.contractAddress}/${listing.nft.tokenId}`} className="p-2 bg-gray-800 hover:bg-white hover:text-black rounded-xl transition-colors text-gray-400">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}

                        {activeTab === 'offers' && (
                            <div className="flex flex-col items-center justify-center py-20 bg-gray-800/20 rounded-[32px] border-2 border-dashed border-gray-800">
                                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                </div>
                                <p className="text-gray-500 text-lg font-bold">No offers yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
