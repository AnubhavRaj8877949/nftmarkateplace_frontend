type Listing = {
    price: string;
    sellerAddress: string;
};

type Props = {
    activeListing?: Listing;
    isOwner: boolean;
    isConfirming: boolean;
    handleBuy: () => void;
    handleMakeOffer: () => void;
    handleCancelListing: () => void;
    userActiveOffer: boolean;
};

export default function NFTPriceSection({
    activeListing,
    isOwner,
    isConfirming,
    handleBuy,
    handleMakeOffer,
    handleCancelListing,
    userActiveOffer
}: Props) {
    return (
        <div className="bg-[#1e1f26] border border-gray-700 rounded-xl overflow-hidden mb-6">
            <div className="p-4 border-b border-gray-700 bg-gray-800/30 flex items-center space-x-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-400 font-semibold text-sm">
                    {activeListing ? 'Sale ends soon' : 'Not listed'}
                </span>
            </div>

            <div className="p-6">
                {activeListing ? (
                    <div className="mb-6">
                        <p className="text-gray-400 text-sm mb-2 font-medium">Current price</p>
                        <div className="flex items-baseline space-x-2">
                            <span className="text-4xl font-extrabold text-white">{activeListing.price} CINT</span>
                            {/* <span className="text-gray-500 text-sm font-semibold">($ --)</span> */}
                        </div>
                    </div>
                ) : (
                    <div className="mb-6">
                        <p className="text-gray-400 text-sm mb-2 font-medium">Current price</p>
                        <div className="text-3xl font-bold text-gray-200">--</div>
                    </div>
                )}

                {/* Action Buttons Row */}
                <div className="flex flex-col sm:flex-row gap-4">
                    {isOwner ? (
                        activeListing ? (
                            <button
                                onClick={handleCancelListing}
                                disabled={isConfirming}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white h-12 rounded-lg font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isConfirming ? 'Processing...' : 'Cancel Listing'}
                            </button>
                        ) : (
                            <button
                                disabled
                                className="flex-1 bg-gray-700 text-gray-400 h-12 rounded-lg font-bold text-lg cursor-not-allowed"
                            >
                                List for Sale (Coming Soon)
                            </button>
                        )
                    ) : (
                        <>
                            {activeListing && (
                                <button
                                    onClick={handleBuy}
                                    disabled={isConfirming}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-lg font-bold text-lg shadow-lg hover:shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                >
                                    <span>{isConfirming ? 'Processing...' : 'Buy now'}</span>
                                    {!isConfirming && (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    )}
                                </button>
                            )}

                            <button
                                onClick={handleMakeOffer}
                                disabled={isOwner || userActiveOffer}
                                className={`flex-1 border border-gray-600 hover:border-gray-400 text-white h-12 rounded-lg font-bold text-lg transition-all flex items-center justify-center space-x-2 ${activeListing ? '' : 'w-full'}`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                                <span>{userActiveOffer ? 'Offer Pending' : 'Make offer'}</span>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
