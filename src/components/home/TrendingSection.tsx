import { Link } from 'react-router-dom';

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

type Props = {
    listings: Listing[];
    isLoading: boolean;
};

export default function TrendingSection({ listings, isLoading }: Props) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 py-8">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-[400px] bg-gray-800/20 rounded-3xl animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <section className="py-8">
            <div className="flex items-center justify-between mb-8 px-4">
                <h2 className="text-3xl font-black text-white flex items-center gap-2">
                    <span className="text-yellow-400">🔥</span> Trending NFTs
                </h2>
                <Link to="/explore" className="text-blue-400 font-bold hover:text-blue-300 transition-colors">
                    Explore All
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
                {listings?.slice(0, 8).map((listing) => (
                    <div key={listing.id} className="bg-[#1e1f26] rounded-2xl overflow-hidden border border-gray-800 hover:border-gray-600 transition-all duration-300 group hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-900/10">
                        {/* Image Container */}
                        <Link to={`/nft/${listing.nft.contractAddress}/${listing.nft.tokenId}`} className="block relative aspect-square overflow-hidden bg-gray-900">
                            <img
                                src={listing.nft.image || listing.nft.tokenURI}
                                alt={listing.nft.name || "NFT"}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="bg-white text-black px-6 py-2.5 rounded-xl font-bold transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                    Buy Now
                                </span>
                            </div>

                            {/* Like Button Placeholder */}
                            <div className="absolute top-3 right-3 bg-black/20 backdrop-blur-md p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </div>
                        </Link>

                        {/* Card Info */}
                        <div className="p-4">
                            <Link to={`/nft/${listing.nft.contractAddress}/${listing.nft.tokenId}`}>
                                <h3 className="text-lg font-bold text-white mb-1 truncate hover:text-blue-400 transition-colors">
                                    {listing.nft.name || `Token #${listing.nft.tokenId}`}
                                </h3>
                            </Link>

                            <p className="text-sm text-gray-400 mb-4 flex items-center gap-1">
                                <span>{listing.nft.collection?.name || "Unknown Collection"}</span>
                                <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>
                            </p>

                            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl">
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase">Price</p>
                                    <p className="text-white font-bold">{listing.price} ETH</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 font-bold uppercase">Last Sale</p>
                                    <p className="text-gray-300 text-sm">--</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {listings?.length === 0 && !isLoading && (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-800 rounded-3xl">
                        <p className="text-gray-500 font-bold text-lg">No items found</p>
                    </div>
                )}
            </div>
        </section>
    );
}
