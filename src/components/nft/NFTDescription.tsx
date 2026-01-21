import NFTSection from './NFTSection';

type Props = {
    description: string;
    contractAddress: string;
    tokenId: string;
};

export default function NFTDescription({ description, contractAddress, tokenId }: Props) {
    return (
        <div className="space-y-4">
            {/* Description Section */}
            <NFTSection
                title="Description"
                defaultOpen={true}
                icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
                }
            >
                <div className="p-6 bg-[#1a1b20]">
                    <p className="text-gray-300 leading-relaxed">
                        {description || "No description provided for this item."}
                    </p>
                </div>
            </NFTSection>

            {/* Details Section */}
            <NFTSection
                title="Details"
                defaultOpen={false}
                icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                }
            >
                <div className="p-4 bg-[#1a1b20]">
                    <div className="flex justify-between py-2">
                        <span className="text-gray-400">Contract Address</span>
                        <a href={`https://testnet.cintara.io/address/${contractAddress}`} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 truncate w-32 text-right">
                            {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}
                        </a>
                    </div>
                    <div className="flex justify-between py-2">
                        <span className="text-gray-400">Token ID</span>
                        <span className="text-gray-200">{tokenId}</span>
                    </div>
                    <div className="flex justify-between py-2">
                        <span className="text-gray-400">Token Standard</span>
                        <span className="text-gray-200">ERC-721</span>
                    </div>
                    <div className="flex justify-between py-2">
                        <span className="text-gray-400">Chain</span>
                        <span className="text-gray-200">Cintara Testnet</span>
                    </div>
                </div>
            </NFTSection>
        </div>
    );
}
