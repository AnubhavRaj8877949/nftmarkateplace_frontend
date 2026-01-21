import { Link } from 'react-router-dom';

export default function HeroSection() {
    return (
        <div className="relative h-[600px] w-full overflow-hidden">
            {/* Background Image with Gradient Overlay */}
            <div className="absolute inset-0">
                <img
                    src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=2000"
                    alt="NFT Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0a0b0d] via-[#0a0b0d]/80 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b0d] via-transparent to-transparent" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 container mx-auto px-6 h-full flex flex-col justify-center max-w-7xl">
                <div className="max-w-2xl space-y-8 animate-fade-in-up">
                    <h1 className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tight">
                        Discover & Collect <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FCD535] to-[#F2A900]">
                            Digital Art
                        </span>
                    </h1>

                    <p className="text-xl text-gray-300 font-medium leading-relaxed max-w-lg">
                        The world's leading NFT marketplace. Buy, sell, and trade exclusive digital assets with ease and security.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Link
                            to="/explore"
                            className="px-8 py-4 bg-[#FCD535] hover:bg-[#F2A900] text-black font-bold rounded-xl transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(252,213,53,0.3)] text-lg text-center"
                        >
                            Explore Now
                        </Link>
                        <Link
                            to="/create"
                            className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold rounded-xl border border-white/20 transition-all transform hover:scale-105 text-lg text-center"
                        >
                            Create NFT
                        </Link>
                    </div>

                    <div className="flex items-center gap-8 pt-8 border-t border-gray-800/50">
                        <div>
                            <p className="text-3xl font-black text-white">200k+</p>
                            <p className="text-sm text-gray-400 font-medium">Collections</p>
                        </div>
                        <div>
                            <p className="text-3xl font-black text-white">10k+</p>
                            <p className="text-sm text-gray-400 font-medium">Artists</p>
                        </div>
                        <div>
                            <p className="text-3xl font-black text-white">423k+</p>
                            <p className="text-sm text-gray-400 font-medium">Community</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
