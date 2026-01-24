import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BACKEND_URL, MARKETPLACE_ADDRESS, MARKETPLACE_ABI, NFT_ABI } from '../constants';
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useReadContract, useBalance } from 'wagmi';
import { parseEther } from 'viem';
import { useEffect, useState } from 'react';
import PriceHistoryChart from '../components/PriceHistoryChart';

// Import new UI components
import NFTMedia from '../components/nft/NFTMedia';
import NFTHeader from '../components/nft/NFTHeader';
import NFTPriceSection from '../components/nft/NFTPriceSection';
import NFTDescription from '../components/nft/NFTDescription';
import NFTOffers from '../components/nft/NFTOffers';
import NFTTransactionHistory from '../components/nft/NFTTransactionHistory';
import NFTSection from '../components/nft/NFTSection';

type PriceHistoryItem = {
    price: string;
    createdAt: string;
};

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

type HistoryItem = {
    id: string;
    type: 'MINT' | 'SALE' | 'TRANSFER';
    price: string;
    fromAddress: string;
    toAddress: string;
    txHash: string;
    createdAt: string;
    from: { address: string };
    to: { address: string };
};

export default function NFTDetail() {
    const { contractAddress, tokenId } = useParams();
    const { address: userAddress, isConnected } = useAccount();

    const { data: balance } = useBalance({
        address: userAddress,
    });

    const { data: nft, isLoading, refetch } = useQuery<NFTDetail>({
        queryKey: ['nft', contractAddress, tokenId],
        queryFn: async () => {
            const res = await fetch(`${BACKEND_URL}/nfts/${contractAddress}/${tokenId}`);
            return res.json();
        },
    });

    const { data: history } = useQuery<HistoryItem[]>({
        queryKey: ['nft-history', contractAddress, tokenId],
        queryFn: async () => {
            const res = await fetch(`${BACKEND_URL}/nfts/${contractAddress}/${tokenId}/history`);
            return res.json();
        },
        enabled: !!contractAddress && !!tokenId,
    });

    const { data: priceHistory } = useQuery<PriceHistoryItem[]>({
        queryKey: ['nft-price-history', contractAddress, tokenId],
        queryFn: async () => {
            const res = await fetch(`${BACKEND_URL}/nfts/${contractAddress}/${tokenId}/price-history`);
            return res.json();
        },
        enabled: !!contractAddress && !!tokenId,
    });

    const { writeContract, data: hash } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const { data: isApprovedForAll, refetch: refetchApproval } = useReadContract({
        address: nft?.contractAddress as `0x${string}`,
        abi: NFT_ABI,
        functionName: 'isApprovedForAll',
        args: [userAddress as `0x${string}`, MARKETPLACE_ADDRESS as `0x${string}`],
        query: {
            enabled: !!userAddress && !!nft?.contractAddress,
        }
    });

    useEffect(() => {
        if (isSuccess) {
            refetchApproval();
            // Give indexer 2 seconds to catch up before refetching
            setTimeout(() => {
                refetch();
            }, 4000);
        }
    }, [isSuccess, refetch, refetchApproval]);

    // Lifted state to components
    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
    const [offerPrice, setOfferPrice] = useState('');

    const activeListing = nft?.listings.find(l => l.active);
    // Is current user the owner?
    const isOwner = userAddress && nft?.ownerAddress && userAddress.toLowerCase() === nft.ownerAddress.toLowerCase();
    // Does current user have an active offer?
    const userActiveOffer = nft?.offers.find(o => userAddress && o.offererAddress.toLowerCase() === userAddress.toLowerCase() && o.active);

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
        setIsOfferModalOpen(true);
    };

    const confirmMakeOffer = () => {
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
        setOfferPrice('');
    }

    const handleApprove = () => {
        writeContract({
            address: nft?.contractAddress as `0x${string}`,
            abi: NFT_ABI,
            functionName: 'setApprovalForAll',
            args: [MARKETPLACE_ADDRESS as `0x${string}`, true],
        });
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

    return (
        <div className="min-h-screen pb-20 bg-[#040508]">
            <div className="container mx-auto px-4 py-8 max-w-[1280px]">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT COLUMN: Media & Details (Sticky) */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="lg:sticky lg:top-24 space-y-6">
                            <NFTMedia
                                media={nft.media}
                                image={nft.image}
                                name={nft.name}
                            />

                            <div className="hidden lg:block space-y-4">
                                <NFTDescription
                                    description={nft.description}
                                    contractAddress={nft.contractAddress}
                                    tokenId={nft.tokenId}
                                />
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Info & Actions */}
                    <div className="lg:col-span-7 space-y-6">
                        <NFTHeader
                            collectionName={nft.collection?.name}
                            nftName={nft.name}
                            tokenId={nft.tokenId}
                            ownerAddress={nft.ownerAddress}
                        />

                        <NFTPriceSection
                            activeListing={activeListing}
                            isOwner={!!isOwner}
                            isConfirming={isConfirming}
                            handleBuy={handleBuy}
                            handleMakeOffer={handleMakeOffer}
                            handleCancelListing={handleCancelListing}
                            userActiveOffer={!!userActiveOffer}
                        />

                        {/* Price History Chart */}
                        <NFTSection
                            title="Price History"
                            defaultOpen={true}
                            icon={
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
                            }
                        >
                            <div className="p-4 bg-[#1a1b20]">
                                <PriceHistoryChart data={priceHistory || []} />
                            </div>
                        </NFTSection>

                        {/* Offers & Listings */}
                        <div className="space-y-4">
                            <NFTOffers
                                offers={nft.offers}
                                isOwner={!!isOwner}
                                isApprovedForAll={!!isApprovedForAll}
                                userAddress={userAddress}
                                handleAcceptOffer={handleAcceptOffer}
                                handleCancelOffer={handleCancelOffer}
                                handleApprove={handleApprove}
                            />
                        </div>

                        {/* Mobile Details (Description) shown here instead of sticky left */}
                        <div className="lg:hidden space-y-4">
                            <NFTDescription
                                description={nft.description}
                                contractAddress={nft.contractAddress}
                                tokenId={nft.tokenId}
                            />
                        </div>

                        {/* Item Activity */}
                        <NFTTransactionHistory history={history} />
                    </div>
                </div>
            </div>

            {/* Offer Modal (Simple Implementation inside Page for now) */}
            {isOfferModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#1e1f26] w-full max-w-md rounded-2xl border border-gray-700 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">Make an offer</h2>
                            <button onClick={() => { setIsOfferModalOpen(false); setOfferPrice(''); }} className="text-gray-400 hover:text-white">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <div className="flex justify-between mb-2 text-sm font-semibold text-gray-400">
                                    <label>Price</label>
                                    <span>
                                        Balance: {balance ? Number(balance.formatted).toFixed(4) : "0.0000"} {balance?.symbol}
                                    </span>
                                </div>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={offerPrice}
                                        inputMode="numeric"
                                        placeholder="Enter offer price"
                                        onChange={(e) => {
                                            const value = e.target.value;

                                            if (/^\d*$/.test(value)) {
                                                setOfferPrice(value);
                                            }
                                        }}
                                        className="w-full bg-[#1a1b20] border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        autoFocus
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-500">CINT</span>
                                </div>
                            </div>
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                                <p className="text-xs text-blue-300">
                                    By making an offer, you agree to hold funds in the marketplace smart contract. You can cancel at any time.
                                </p>
                            </div>
                            <button
                                onClick={confirmMakeOffer}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-blue-900/20"
                            >
                                Make Offer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
