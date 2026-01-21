type Collection = {
    id: string;
    name: string;
    _count: { nfts: number };
};

type Props = {
    collections: Collection[];
    selectedCollectionId: string | null;
    onSelectCollection: (id: string | null) => void;
};

export default function CollectionList({ collections, selectedCollectionId, onSelectCollection }: Props) {
    return (
        <section className="py-20">
            <div className="flex items-center justify-between mb-12 px-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-4xl font-black text-white tracking-tight">Top Collections</h2>
                    <span className="text-sm font-bold text-gray-400 bg-gray-800 px-3 py-1 rounded-lg">Last 24h</span>
                </div>
                <button
                    onClick={() => onSelectCollection(null)}
                    className="text-blue-400 font-bold hover:text-white hover:bg-white/10 px-6 py-2 rounded-xl transition-all"
                >
                    View All
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-4">
                {collections.map((col, index) => (
                    <button
                        key={col.id}
                        onClick={() => onSelectCollection(col.id)}
                        className={`group relative h-[320px] rounded-3xl overflow-hidden transition-all duration-500 border-2 text-left ${selectedCollectionId === col.id
                                ? 'border-blue-500 scale-[1.02] shadow-2xl shadow-blue-900/40 z-10'
                                : 'border-transparent bg-gray-800/40 hover:border-gray-700 hover:shadow-2xl hover:-translate-y-2'
                            }`}
                    >
                        {/* Fake Cover Image */}
                        <div className="h-3/4 w-full bg-gray-900 relative overflow-hidden">
                            <img
                                src={`https://source.unsplash.com/random/500x400?sig=${index}&abstract`}
                                alt={col.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-100"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/500x400/1e1f26/4b5563?text=Collection';
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1e1f26] via-[#1e1f26]/50 to-transparent" />

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>

                        {/* Avatar & Info */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 pt-12 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                            {/* Floating Avatar */}
                            <div className="absolute -top-10 left-6 p-1.5 bg-[#1e1f26] rounded-2xl shadow-xl transform group-hover:-translate-y-2 transition-transform duration-500">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${col.name}&background=random&size=128`}
                                    alt={col.name}
                                    className="w-16 h-16 rounded-xl border border-gray-700 group-hover:border-blue-500 transition-colors"
                                />
                            </div>

                            <div className="space-y-1">
                                <h3 className="font-black text-xl text-white group-hover:text-blue-400 transition-colors truncate pr-4">
                                    {col.name}
                                </h3>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors">
                                        {col._count.nfts} items
                                    </p>
                                    <div className="flex items-center gap-1.5 bg-green-500/10 px-2 py-1 rounded-lg border border-green-500/20">
                                        <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                        </svg>
                                        <span className="text-xs font-black text-green-400">12.5%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </section>
    );
}
