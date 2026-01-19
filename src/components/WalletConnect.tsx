import { useConnect, useAccount } from 'wagmi';
import { useAuth } from '../context/AuthContext';

export function WalletConnect() {
    const { connect, connectors } = useConnect();
    const { isConnected } = useAccount();
    const { isNetworkCorrect, login } = useAuth();

    const metamaskConnector = connectors.find(c => c.name === 'MetaMask');

    return (
        <div className="flex space-x-2">
            {metamaskConnector ? (
                <button
                    onClick={() => {
                        if (isConnected && !isNetworkCorrect) {
                            login(); // This triggers switchChain in our AuthContext implementation
                        } else {
                            connect({ connector: metamaskConnector });
                        }
                    }}
                    className={`px-6 py-2 rounded-xl transition-all font-bold shadow-lg text-sm ${isConnected && !isNetworkCorrect
                            ? 'bg-red-600 hover:bg-red-700 text-white hover:shadow-red-900/20'
                            : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-blue-900/20 active:scale-95'
                        }`}
                >
                    {isConnected && !isNetworkCorrect ? 'Switch to Cintara' : 'Connect MetaMask'}
                </button>
            ) : (
                <p className="text-sm text-gray-400 font-medium">MetaMask not found</p>
            )}
        </div>
    );
}
