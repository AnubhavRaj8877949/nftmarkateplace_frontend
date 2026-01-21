import NFTSection from './NFTSection';

type HistoryItem = {
    id: string;
    type: 'MINT' | 'SALE' | 'TRANSFER';
    price: string;
    fromAddress: string;
    toAddress: string;
    txHash: string;
    createdAt: string;
};

type Props = {
    history?: HistoryItem[];
};

export default function NFTTransactionHistory({ history }: Props) {
    return (
        <NFTSection
            title="Item Activity"
            defaultOpen={true}
            icon={
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
            }
        >
            <div className="overflow-x-auto bg-[#1a1b20]">
                {history && history.length > 0 ? (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-700 text-gray-400 text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 font-semibold">Event</th>
                                <th className="px-6 py-4 font-semibold">Price</th>
                                <th className="px-6 py-4 font-semibold">From</th>
                                <th className="px-6 py-4 font-semibold">To</th>
                                <th className="px-6 py-4 font-semibold">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/50">
                            {history.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-800/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            {item.type === 'MINT' ? (
                                                <>
                                                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>
                                                    <span className="font-bold text-gray-300">Minted</span>
                                                </>
                                            ) : item.type === 'SALE' ? (
                                                <>
                                                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" /></svg>
                                                    <span className="font-bold text-gray-300">Sale</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" /></svg>
                                                    <span className="font-bold text-gray-300">Transfer</span>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-white">
                                        {item.price === '0' ? '' : `${item.price} CINT`}
                                    </td>
                                    <td className="px-6 py-4 text-blue-400">
                                        {item.fromAddress === "0x0000000000000000000000000000000000000000" ? 'NullAddress' : `${item.fromAddress.slice(0, 6)}...`}
                                    </td>
                                    <td className="px-6 py-4 text-blue-400">
                                        {item.toAddress.slice(0, 6)}...
                                    </td>
                                    <td className="px-6 py-4 text-gray-400 text-sm">
                                        <div className="flex items-center space-x-2">
                                            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                            <a href={`https://testnet.cintara.io/tx/${item.txHash}`} target="_blank" rel="noreferrer" className="text-gray-600 hover:text-blue-400">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-8 text-center text-gray-400 font-medium text-sm">
                        No activity recorded
                    </div>
                )}
            </div>
        </NFTSection>
    );
}
