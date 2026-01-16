import { useConnect } from 'wagmi';

export function WalletConnect() {
    const { connect, connectors } = useConnect();

    const metamaskConnector = connectors.find(c => c.name === 'MetaMask');

    return (
        <div className="flex space-x-2">
            {metamaskConnector ? (
                <button
                    onClick={() => connect({ connector: metamaskConnector })}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl transition-all font-bold shadow-lg hover:shadow-blue-900/20 active:scale-95 text-sm"
                >
                    Connect MetaMask
                </button>
            ) : (
                <p className="text-sm text-gray-400 font-medium">MetaMask not found</p>
            )}
        </div>
    );
}
