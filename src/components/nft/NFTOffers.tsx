import NFTSection from './NFTSection';

type Offer = {
    id: string;
    price: string;
    offererAddress: string;
    active: boolean;
    offerer: {
        address: string;
    };
};

type Props = {
    offers?: Offer[];
    isOwner: boolean;
    isApprovedForAll: boolean;
    userAddress?: string;
    handleAcceptOffer: (offerer: string) => void;
    handleCancelOffer: () => void;
    handleApprove: () => void;
};

export default function NFTOffers({
    offers,
    isOwner,
    isApprovedForAll,
    userAddress,
    handleAcceptOffer,
    handleCancelOffer,
    handleApprove
}: Props) {
    return (
        <NFTSection
            title="Offers"
            defaultOpen={false}
            icon={
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
            }
        >
            <div className="overflow-x-auto bg-[#1a1b20]">
                {offers && offers.length > 0 ? (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-700 text-gray-400 text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 font-semibold">Price</th>
                                <th className="px-6 py-4 font-semibold">USD Price</th>
                                <th className="px-6 py-4 font-semibold">Floor Difference</th>
                                <th className="px-6 py-4 font-semibold">From</th>
                                {(isOwner || offers.some(o => o.offererAddress.toLowerCase() === userAddress?.toLowerCase())) && (
                                    <th className="px-6 py-4 font-semibold">Action</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/50">
                            {offers.map((offer) => (
                                <tr key={offer.id} className="hover:bg-gray-800/30 transition-colors">
                                    <td className="px-6 py-4 font-bold text-white">
                                        {offer.price} CINT
                                    </td>
                                    <td className="px-6 py-4 text-gray-400">
                                        $ --
                                    </td>
                                    <td className="px-6 py-4 text-gray-400">
                                        --
                                    </td>
                                    <td className="px-6 py-4 text-blue-400 font-medium">
                                        {offer.offererAddress.toLowerCase() === userAddress?.toLowerCase() ? 'You' : `${offer.offererAddress.slice(0, 6)}...`}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            {isOwner && (
                                                !isApprovedForAll ? (
                                                    <button
                                                        onClick={handleApprove}
                                                        className="text-xs font-bold text-blue-400 border border-blue-400 px-3 py-1.5 rounded hover:bg-blue-400 hover:text-white transition-colors"
                                                    >
                                                        Approve
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleAcceptOffer(offer.offererAddress)}
                                                        className="text-xs font-bold text-green-400 border border-green-400 px-3 py-1.5 rounded hover:bg-green-400 hover:text-white transition-colors"
                                                    >
                                                        Accept
                                                    </button>
                                                )
                                            )}
                                            {offer.offererAddress.toLowerCase() === userAddress?.toLowerCase() && (
                                                <button
                                                    onClick={handleCancelOffer}
                                                    className="text-xs font-bold text-red-400 border border-red-400 px-3 py-1.5 rounded hover:bg-red-400 hover:text-white transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-8 text-center text-gray-400 font-medium text-sm">
                        No offers yet
                    </div>
                )}
            </div>
        </NFTSection>
    );
}
