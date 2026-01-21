type Props = {
    collectionName?: string;
    nftName?: string;
    tokenId?: string;
    ownerAddress: string;
};

export default function NFTHeader({ collectionName, nftName, tokenId, ownerAddress }: Props) {
    return (
        <div className="mb-6">
            <div className="flex justify-between items-start mb-4">
                <a href="#" className="text-blue-400 hover:text-blue-300 font-bold text-lg">
                    {collectionName || "Cintara Collection"}
                </a>
                <div className="flex space-x-2">
                    {/* Share/Menu Placeholders */}
                    <button className="p-2 text-gray-400 hover:text-white border border-gray-700 rounded-lg hover:shadow-md transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white border border-gray-700 rounded-lg hover:shadow-md transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
                    </button>
                </div>
            </div>

            <h1 className="text-4xl font-extrabold text-white mb-6">
                {nftName || `Token #${tokenId}`}
            </h1>

            <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-400">Owned by</span>
                <span className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer">
                    {ownerAddress.slice(0, 6)}...{ownerAddress.slice(-4)}
                </span>
            </div>
        </div>
    );
}
