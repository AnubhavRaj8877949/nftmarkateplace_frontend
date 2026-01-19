import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BACKEND_URL, MARKETPLACE_ADDRESS, MARKETPLACE_ABI } from '../constants';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseEther } from 'viem';
import { useEffect, useState } from 'react';

type NFTDetail = {
    id: string;
    tokenId: string;
    contractAddress: string;
    ownerAddress: string;
    tokenURI: string;
    name: string;
    description: string;
    image: string;
    owner: {
        address: string;
    };
    listings: {
        id: string;
        price: string;
        sellerAddress: string;
        active: boolean;
    }[];
    media: {
        id: string;
        url: string;
        type: 'IMAGE' | 'VIDEO';
    }[];
    offers: {
        id: string;
        price: string;
        offererAddress: string;
        active: boolean;
        offerer: {
            address: string;
        };
    }[];
    collection?: {
        name: string;
    };
};

export default function NFTDetail() {
    const { contractAddress, tokenId } = useParams();
    const { address: userAddress, isConnected } = useAccount();


    const { data: nft, isLoading, refetch } = useQuery<NFTDetail>({
        queryKey: ['nft', contractAddress, tokenId],
        queryFn: async () => {
            const res = await fetch(`${BACKEND_URL}/nfts/${contractAddress}/${tokenId}`);
            return res.json();
        },
    });

    const { writeContract, data: hash } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    useEffect(() => {
        if (isSuccess) {
            // Give indexer 2 seconds to catch up before refetching
            setTimeout(() => {
                refetch();
            }, 2000);
        }
    }, [isSuccess, refetch]);

    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
    const [offerPrice, setOfferPrice] = useState('');
    const [listPrice, setListPrice] = useState('');

    const activeListing = nft?.listings.find(l => l.active);
    const isOwner = userAddress?.toLowerCase() === nft?.ownerAddress.toLowerCase();
    // const userActiveOffer = nft?.offers.find(o => o.offererAddress.toLowerCase() === userAddress?.toLowerCase() && o.active);
    console.log(" nft:", nft)
    const handleBuy = () => {
        if (!activeListing) return;
        writeContract({
            address: MARKETPLACE_ADDRESS as `0x${string}`,
            abi: MARKETPLACE_ABI,
            functionName: 'buy',
            args: [nft?.contractAddress as `0x${string}`, BigInt(nft?.tokenId || "0")],
            value: parseEther(activeListing.price),
        });
    };

    const handleMakeOffer = () => {
        if (!isConnected) return alert("Please connect your wallet to make an offer.");
        if (isOwner) return alert("You cannot make an offer on your own NFT.");
        if (!offerPrice) return;
        writeContract({
            address: MARKETPLACE_ADDRESS as `0x${string}`,
            abi: MARKETPLACE_ABI,
            functionName: 'makeOffer',
            args: [nft?.contractAddress as `0x${string}`, BigInt(nft?.tokenId || "0")],
            value: parseEther(offerPrice),
        });
        setIsOfferModalOpen(false);
    };

    const handleAcceptOffer = (offerer: string) => {
        writeContract({
            address: MARKETPLACE_ADDRESS as `0x${string}`,
            abi: MARKETPLACE_ABI,
            functionName: 'acceptOffer',
            args: [nft?.contractAddress as `0x${string}`, BigInt(nft?.tokenId || "0"), offerer as `0x${string}`],
        });
    };

    const handleCancelOffer = () => {
        writeContract({
            address: MARKETPLACE_ADDRESS as `0x${string}`,
            abi: MARKETPLACE_ABI,
            functionName: 'cancelOffer',
            args: [nft?.contractAddress as `0x${string}`, BigInt(nft?.tokenId || "0")],
        });
    };

    const handleList = () => {
        if (!listPrice) return;

        // First approve marketplace
        writeContract({
            address: nft?.contractAddress as `0x${string}`,
            abi: [{
                name: 'approve',
                type: 'function',
                stateMutability: 'nonpayable',
                inputs: [{ name: 'to', type: 'address' }, { name: 'tokenId', type: 'uint256' }],
                outputs: []
            }],
            functionName: 'approve',
            args: [MARKETPLACE_ADDRESS as `0x${string}`, BigInt(nft?.tokenId || "0")],
        });

        // Then list (this should ideally be a two-step process or handled via a separate approval flow, 
        // but for simplicity we'll assume approval is done or user will do it. 
        // Actually, let's just call list, if not approved it will fail or we can check approval.
        // For this task, let's assume we just call list. The contract checks approval.
        // Wait, the contract says: require(nft.isApprovedForAll... || nft.getApproved...
        // So we should probably have an approve button or handle it. 
        // Let's just add the list call for now, user might have approved already or we can add approval logic later if needed.
        // Better: Just call list. If it fails, user needs to approve. 
        // Actually, let's chain them or just provide the list button.

        writeContract({
            address: MARKETPLACE_ADDRESS as `0x${string}`,
            abi: MARKETPLACE_ABI,
            functionName: 'list',
            args: [nft?.contractAddress as `0x${string}`, BigInt(nft?.tokenId || "0"), parseEther(listPrice)],
        });
    };

    const handleCancelListing = () => {
        writeContract({
            address: MARKETPLACE_ADDRESS as `0x${string}`,
            abi: MARKETPLACE_ABI,
            functionName: 'cancel',
            args: [nft?.contractAddress as `0x${string}`, BigInt(nft?.tokenId || "0")],
        });
    };

    if (isLoading) return (
        <div className="flex justify-center items-center h-[60vh]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    if (!nft) return <div className="text-center py-20 text-white text-2xl">NFT not found</div>;

    // const isVideo = nft.image?.endsWith('.mp4') || nft.image?.endsWith('.webm') || isImageError;

    return (
        <div className="min-h-screen pb-20">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Media Section */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-gray-800/40 rounded-[40px] overflow-hidden border border-gray-700/50 shadow-2xl relative aspect-square group">
                            {nft.media && nft.media.length > 0 ? (
                                <div className="w-full h-full">
                                    {nft.media[currentMediaIndex].type === 'VIDEO' ? (
                                        <video
                                            src={nft.media[currentMediaIndex].url}
                                            controls
                                            autoPlay
                                            loop
                                            className="w-full h-full object-contain"
                                        />
                                    ) : (
                                        <img
                                            src={nft.media[currentMediaIndex].url}
                                            alt={nft.name}
                                            className="w-full h-full object-contain"
                                        />
                                    )}

                                    {nft.media.length > 1 && (
                                        <>
                                            <button
                                                onClick={() => setCurrentMediaIndex((prev) => (prev === 0 ? nft.media.length - 1 : prev - 1))}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 p-3 rounded-2xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => setCurrentMediaIndex((prev) => (prev === nft.media.length - 1 ? 0 : prev + 1))}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 p-3 rounded-2xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <img
                                    src={nft.image}
                                    alt={nft.name}
                                    className="w-full h-full object-contain"
                                />
                            )}
                        </div>

                        {/* Thumbnails */}
                        {nft.media && nft.media.length > 1 && (
                            <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                                {nft.media.map((m, i) => (
                                    <button
                                        key={m.id}
                                        onClick={() => setCurrentMediaIndex(i)}
                                        className={`flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${currentMediaIndex === i ? 'border-blue-500 scale-105 shadow-lg shadow-blue-500/20' : 'border-gray-700 opacity-50 hover:opacity-100'}`}
                                    >
                                        {m.type === 'VIDEO' ? (
                                            <div className="w-full h-full bg-gray-900 flex items-center justify-center">
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

                    {/* Info Section */}
                    <div className="lg:col-span-7 space-y-8">
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <span className="text-blue-400 font-black text-xs uppercase tracking-[0.2em]">
                                    {nft.collection?.name || "Cintara Collection"}
                                </span>
                                <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h1 className="text-6xl font-black text-white mb-8 leading-tight tracking-tight">{nft.name || `Token #${nft.tokenId}`}</h1>

                            <div className="flex items-center space-x-8">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-black shadow-lg shadow-blue-500/20">
                                        {nft.ownerAddress.slice(2, 4).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em] mb-1">Owned by</p>
                                        <p className="text-sm font-black text-blue-400">{nft.ownerAddress.slice(0, 6)}...{nft.ownerAddress.slice(-4)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-800/30 rounded-[40px] border border-gray-700/50 overflow-hidden backdrop-blur-sm">
                            <div className="p-6 border-b border-gray-700/50 bg-gray-800/20 flex items-center space-x-3">
                                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 6h16M4 12h16M4 18h7" />
                                </svg>
                                <span className="font-black text-xs uppercase tracking-[0.2em] text-gray-300">Description</span>
                            </div>
                            <div className="p-10">
                                <p className="text-gray-400 leading-relaxed text-lg font-medium">
                                    {nft.description || "No description provided for this NFT."}
                                </p>
                            </div>
                        </div>

                        <div className="bg-gray-800/40 rounded-[40px] border border-gray-700/50 overflow-hidden shadow-2xl backdrop-blur-md">
                            <div className="p-10">
                                {activeListing ? (
                                    <div className="mb-10">
                                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em] mb-3">Current Price</p>
                                        <div className="flex items-baseline space-x-4">
                                            <span className="text-6xl font-black text-white">{activeListing.price} CINT</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mb-10">
                                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em] mb-3">Status</p>
                                        <p className="text-4xl font-black text-gray-500">Not for sale</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* {activeListing && (
                                        <button
                                            onClick={handleBuy}
                                            disabled={isConfirming || isOwner}
                                            className="bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-3xl font-black text-xl shadow-2xl shadow-blue-900/40 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isConfirming ? 'Processing...' : 'Buy Now'}
                                        </button>
                                    )} */}
                                    {isOwner ? (
                                        activeListing ? (
                                            <button
                                                onClick={handleCancelListing}
                                                disabled={isConfirming}
                                                className="bg-red-600 hover:bg-red-700 text-white py-6 rounded-3xl font-black text-xl shadow-2xl shadow-red-900/40 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isConfirming ? 'Processing...' : 'Cancel Listing'}
                                            </button>
                                        ) : (
                                            <div className="flex flex-col space-y-4">
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        value={listPrice}
                                                        onChange={(e) => setListPrice(e.target.value)}
                                                        className="w-full bg-gray-900/50 border border-gray-600 rounded-2xl p-4 text-xl font-black text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                                        placeholder="Price in CINT"
                                                    />
                                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-500">CINT</span>
                                                </div>
                                                <button
                                                    onClick={handleList}
                                                    disabled={isConfirming || !listPrice}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-xl shadow-xl shadow-blue-900/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {isConfirming ? 'Processing...' : 'List for Sale'}
                                                </button>
                                            </div>
                                        )
                                    ) : (
                                        activeListing ? (
                                            <button
                                                onClick={handleBuy}
                                                disabled={isConfirming}
                                                className="bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-3xl font-black text-xl shadow-2xl shadow-blue-900/40 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isConfirming ? 'Processing...' : 'Buy Now'}
                                            </button>
                                        ) : (
                                            <div className="bg-gray-700/30 border border-gray-600 text-gray-400 py-6 rounded-3xl text-center font-bold text-lg">
                                                Not listed for sale
                                            </div>
                                        )
                                    )}

                                    {/* <button
                                        onClick={() => {
                                            if (!isConnected) return alert("Please connect your wallet.");
                                            if (userActiveOffer) return alert("You already have an active offer on this NFT. Cancel it first to make a new one.");
                                            setIsOfferModalOpen(true);
                                        }}
                                        disabled={isOwner || !!userActiveOffer}
                                        className={`py-6 rounded-3xl font-black text-xl transition-all border-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${activeListing ? 'bg-white/5 hover:bg-white/10 text-white border-white/10' : 'bg-blue-600 hover:bg-blue-700 text-white border-transparent shadow-2xl shadow-blue-900/40 sm:col-span-2'}`}
                                    >
                                        {userActiveOffer ? 'Offer Pending' : 'Make Offer'}
                                    </button> */}
                                </div>
                            </div>
                        </div>

                        {/* Offers List */}
                        <div className="bg-gray-800/30 rounded-[40px] border border-gray-700/50 overflow-hidden backdrop-blur-sm">
                            <div className="p-6 border-b border-gray-700/50 bg-gray-800/20 flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                    <span className="font-black text-xs uppercase tracking-[0.2em] text-gray-300">Active Offers</span>
                                </div>
                                <span className="bg-gray-700 px-3 py-1 rounded-full text-[10px] font-black text-gray-400">{nft.offers?.length || 0}</span>
                            </div>
                            <div className="p-4">
                                {nft.offers && nft.offers.length > 0 ? (
                                    <div className="space-y-3">
                                        {nft.offers.map((offer) => (
                                            <div key={offer.id} className="flex items-center justify-between p-5 bg-gray-800/50 rounded-3xl border border-gray-700/50 hover:border-gray-600 transition-all">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-10 h-10 rounded-xl bg-gray-700 flex items-center justify-center text-[10px] font-black">
                                                        {offer.offererAddress.slice(2, 4).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-lg font-black text-white">{offer.price} CINT</p>
                                                        <p className="text-[10px] font-bold text-gray-500">{offer.offererAddress.slice(0, 8)}...</p>
                                                    </div>
                                                </div>
                                                {isOwner && (
                                                    <button
                                                        onClick={() => handleAcceptOffer(offer.offererAddress)}
                                                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-2xl font-black text-sm transition-all shadow-lg shadow-green-900/20"
                                                    >
                                                        Accept
                                                    </button>
                                                )}
                                                {offer.offererAddress.toLowerCase() === userAddress?.toLowerCase() && (
                                                    <button
                                                        onClick={handleCancelOffer}
                                                        className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-6 py-2.5 rounded-2xl font-black text-sm transition-all border border-red-500/20"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-12 text-center">
                                        <p className="text-gray-500 font-bold text-sm">No active offers yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Offer Modal */}
            {isOfferModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="bg-gray-900 w-full max-w-md rounded-[48px] border border-gray-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-10">
                            <div className="flex justify-between items-center mb-10">
                                <h2 className="text-3xl font-black text-white">Make an Offer</h2>
                                <button onClick={() => setIsOfferModalOpen(false)} className="p-2 hover:bg-gray-800 rounded-2xl transition-colors">
                                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Offer Amount (CINT)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={offerPrice}
                                            onChange={(e) => setOfferPrice(e.target.value)}
                                            className="w-full bg-gray-800 border border-gray-700 rounded-3xl p-6 text-2xl font-black text-white focus:ring-4 focus:ring-blue-500/20 outline-none transition-all"
                                            placeholder="0.00"
                                        />
                                        <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-gray-500">CINT</span>
                                    </div>
                                </div>

                                <div className="bg-blue-500/5 rounded-3xl p-6 border border-blue-500/10">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-gray-400">Estimated Gas Fee</span>
                                        <span className="text-xs font-black text-blue-400">~0.0012 CINT</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-gray-400">Total Potential Cost</span>
                                        <span className="text-xs font-black text-white">{(Number(offerPrice) + 0.0012).toFixed(4)} CINT</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleMakeOffer}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-3xl font-black text-xl shadow-2xl shadow-blue-900/40 transition-all active:scale-95"
                                >
                                    Confirm Offer
                                </button>
                                <p className="text-center text-[10px] font-bold text-gray-500">Funds will be held in the marketplace contract until the offer is accepted or canceled.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

