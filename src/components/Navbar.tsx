import { Link, useLocation } from 'react-router-dom';
import { WalletConnect } from './WalletConnect';
import { useAccount, useBalance } from 'wagmi';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { BACKEND_URL } from '../constants';

export function Navbar() {
    const { address } = useAccount();
    const { isAuthenticated, logout } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const location = useLocation();

    const { data: balance } = useBalance({
        address: address,
    });

    useEffect(() => {
        if (isAuthenticated && address) {
            fetch(`${BACKEND_URL}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address }),
            }).catch(err => console.error("Error onboarding user:", err));
        }
    }, [isAuthenticated, address]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const copyToClipboard = () => {
        if (address) {
            navigator.clipboard.writeText(address);
            // Could add a toast notification here
        }
    };

    const navLinks = [
        { name: 'Explore', path: '/explore' },
        { name: 'Create', path: '/create' },
    ];

    return (
        <nav className="sticky top-0 z-50 bg-[#0a0b0d]/80 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
            <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                {/* Logo & Navigation */}
                <div className="flex items-center gap-12">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-black text-white text-sm transform group-hover:rotate-12 transition-transform">
                            N
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 group-hover:to-white transition-all">
                            NFT Market
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${location.pathname === link.path
                                        ? 'bg-white/10 text-white'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Search Bar Placeholder (Optional) */}
                {/* <div className="hidden lg:block flex-1 max-w-md mx-12">
                    <div className="relative group">
                        <input 
                            type="text" 
                            placeholder="Search collections..." 
                            className="w-full bg-gray-900 border border-gray-800 rounded-2xl py-2.5 pl-10 pr-4 text-sm text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all"
                        />
                        <svg className="w-4 h-4 text-gray-500 absolute left-3.5 top-3 group-focus-within:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div> */}

                {/* Wallet Section */}
                <div className="flex items-center gap-4">
                    {!isAuthenticated ? (
                        <WalletConnect />
                    ) : (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className={`flex items-center gap-3 pl-4 pr-1.5 py-1.5 rounded-2xl border transition-all duration-200 ${isDropdownOpen
                                        ? 'bg-gray-800 border-blue-500/50 shadow-lg shadow-blue-500/10'
                                        : 'bg-gray-900/50 border-gray-800 hover:border-gray-700 hover:bg-gray-800'
                                    }`}
                            >
                                <div className="hidden sm:flex flex-col items-end mr-1">
                                    <span className="text-xs font-bold text-white leading-tight">
                                        {balance ? `${parseFloat(balance.formatted).toFixed(3)} ${balance.symbol}` : '0.000 ETH'}
                                    </span>
                                    <span className="text-[10px] font-medium text-gray-500">
                                        {address?.slice(0, 4)}...{address?.slice(-4)}
                                    </span>
                                </div>

                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 p-[2px]">
                                    <div className="w-full h-full rounded-[10px] bg-[#0a0b0d] flex items-center justify-center">
                                        <span className="font-black text-xs bg-gradient-to-br from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                            {address?.slice(2, 4).toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </button>

                            {/* Dropdown Menu */}
                            <div className={`absolute right-0 mt-3 w-72 bg-[#1a1b20] rounded-3xl border border-gray-800 shadow-2xl overflow-hidden origin-top-right transition-all duration-200 ${isDropdownOpen
                                    ? 'opacity-100 scale-100 translate-y-0'
                                    : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                                }`}>
                                <div className="p-6 pb-4 border-b border-gray-800 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10" />
                                    <div className="relative z-10 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Balance</p>
                                            <p className="text-2xl font-black text-white">
                                                {balance ? parseFloat(balance.formatted).toFixed(4) : '0.0000'}
                                                <span className="text-sm font-bold text-gray-500 ml-1">{balance?.symbol}</span>
                                            </p>
                                        </div>
                                        <button
                                            onClick={copyToClipboard}
                                            className="p-2 hover:bg-white/5 rounded-xl transition-colors group"
                                            title="Copy Address"
                                        >
                                            <svg className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                <div className="p-2 space-y-1">
                                    <Link to={`/profile/${address}`} onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-800 transition-colors group">
                                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        </div>
                                        <span className="font-bold text-gray-300 group-hover:text-white">My NFTs</span>
                                    </Link>
                                    <Link to={`/profile/${address}?tab=listings`} onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-800 transition-colors group">
                                        <div className="p-2 rounded-lg bg-green-500/10 text-green-400 group-hover:bg-green-500 group-hover:text-white transition-colors">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        </div>
                                        <span className="font-bold text-gray-300 group-hover:text-white">My Listings</span>
                                    </Link>
                                    <Link to={`/profile/${address}?tab=offers`} onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-800 transition-colors group">
                                        <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 01-2-2V5a2 2 0 012-2h4.586" /></svg>
                                        </div>
                                        <span className="font-bold text-gray-300 group-hover:text-white">My Offers</span>
                                    </Link>
                                </div>

                                <div className="p-2 border-t border-gray-800 mt-2">
                                    <button
                                        onClick={() => { logout(); setIsDropdownOpen(false); }}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 transition-colors group"
                                    >
                                        <div className="p-2 rounded-lg bg-gray-800 text-gray-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                        </div>
                                        <span className="font-bold text-gray-400 group-hover:text-red-500 transition-colors">Disconnect</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
