import { Link } from 'react-router-dom';
import { WalletConnect } from './WalletConnect';
import { useAccount, useDisconnect } from 'wagmi';
import { useState, useEffect } from 'react';
import { BACKEND_URL } from '../constants';

export function Navbar() {
    const { address, isConnected } = useAccount();
    const { disconnect } = useDisconnect();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        if (isConnected && address) {
            fetch(`${BACKEND_URL}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address }),
            }).catch(err => console.error("Error onboarding user:", err));
        }
    }, [isConnected, address]);

    const copyToClipboard = () => {
        if (address) {
            navigator.clipboard.writeText(address);
            alert("Address copied to clipboard!");
        }
    };

    return (
        <nav className="flex items-center justify-between p-4 bg-gray-900 text-white sticky top-0 z-50 shadow-md">
            <div className="flex items-center space-x-6">
                <Link to="/" className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    NFT Market
                </Link>
                <div className="space-x-4 hidden md:flex">
                    <Link to="/" className="hover:text-blue-400 transition-colors font-medium">Explore</Link>
                    <Link to="/create" className="hover:text-blue-400 transition-colors font-medium">Create</Link>
                </div>
            </div>

            <div className="flex items-center space-x-4">
                {!isConnected ? (
                    <WalletConnect />
                ) : (
                    <div className="relative">
                        <div className="flex items-center bg-gray-800 rounded-2xl border border-gray-700 p-1 pl-4 space-x-3">
                            <span className="text-sm font-bold text-gray-300">
                                {address?.slice(0, 6)}...{address?.slice(-4)}
                            </span>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[10px] font-black border border-gray-600 hover:border-blue-400 transition-all"
                            >
                                {address?.slice(2, 4).toUpperCase()}
                            </button>
                        </div>

                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-3 w-56 bg-gray-800 rounded-[24px] shadow-2xl border border-gray-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="p-4 border-b border-gray-700 bg-gray-800/50">
                                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2">Wallet</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-mono text-blue-400">{address?.slice(0, 12)}...</span>
                                        <button onClick={copyToClipboard} className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <div className="p-2">
                                    <Link to={`/profile/${address}`} onClick={() => setIsDropdownOpen(false)} className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-700 rounded-xl transition-colors group">
                                        <span className="text-sm font-bold text-gray-300 group-hover:text-white">My NFTs</span>
                                    </Link>
                                    <Link to={`/profile/${address}?tab=listings`} onClick={() => setIsDropdownOpen(false)} className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-700 rounded-xl transition-colors group">
                                        <span className="text-sm font-bold text-gray-300 group-hover:text-white">My Listings</span>
                                    </Link>
                                    <Link to={`/profile/${address}?tab=offers`} onClick={() => setIsDropdownOpen(false)} className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-700 rounded-xl transition-colors group">
                                        <span className="text-sm font-bold text-gray-300 group-hover:text-white">My Offers</span>
                                    </Link>
                                </div>
                                <div className="p-2 border-t border-gray-700 bg-gray-900/30">
                                    <button
                                        onClick={() => { disconnect(); setIsDropdownOpen(false); }}
                                        className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-red-500/10 rounded-xl transition-colors group"
                                    >
                                        <span className="text-sm font-bold text-red-500">Disconnect</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}
