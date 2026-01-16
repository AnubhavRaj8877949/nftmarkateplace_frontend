import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { NFT_ADDRESS, NFT_ABI } from '../constants';
import { uploadFileToIPFS, uploadJSONToIPFS } from '../utils/ipfs';
import { useNavigate } from 'react-router-dom';

export default function Create() {
    const [files, setFiles] = useState<File[]>([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [collection, setCollection] = useState('');
    const [uploading, setUploading] = useState(false);

    const { address } = useAccount();
    const navigate = useNavigate();
    const { data: hash, writeContract, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
        }
    };

    const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const handleMint = async () => {
        if (files.length === 0 || !name || !description) return;

        try {
            setUploading(true);
            // 1. Upload all files to IPFS
            const mediaUrls = await Promise.all(files.map(file => uploadFileToIPFS(file)));

            // 2. Upload Metadata
            const metadata = {
                name,
                description,
                image: mediaUrls[0], // Primary image
                media: mediaUrls.map((url, i) => ({
                    url,
                    type: files[i].type.startsWith('video') ? 'VIDEO' : 'IMAGE'
                })),
                collection: collection || "General",
                attributes: [],
            };
            const tokenURI = await uploadJSONToIPFS(metadata);
            setUploading(false);

            // 3. Mint NFT
            writeContract({
                address: NFT_ADDRESS as `0x${string}`,
                abi: NFT_ABI,
                functionName: 'mint',
                args: [tokenURI, 500n], // 5% royalty
            });

        } catch (error) {
            console.error("Error minting:", error);
            setUploading(false);
            alert("Error uploading to IPFS. Please check your Pinata keys.");
        }
    };

    return (
        <div className="max-w-3xl mx-auto mt-16 p-10 bg-gray-900/80 backdrop-blur-md rounded-[40px] text-white shadow-2xl border border-gray-800">
            <h1 className="text-5xl font-black mb-12 text-center bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                Create Your Masterpiece
            </h1>

            <div className="space-y-10">
                <div>
                    <label className="block text-sm font-black mb-4 text-gray-500 uppercase tracking-[0.2em]">Upload Assets</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="border-2 border-dashed border-gray-700 rounded-3xl p-8 text-center hover:border-blue-500 transition-all bg-gray-800/50 group relative min-h-[200px] flex flex-col justify-center items-center">
                            <input
                                type="file"
                                onChange={handleFileChange}
                                className="hidden"
                                id="file-upload"
                                accept="image/*,video/*"
                                multiple
                            />
                            <label htmlFor="file-upload" className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                                <div className="mx-auto w-12 h-12 bg-gray-700 rounded-2xl flex items-center justify-center group-hover:bg-blue-500/20 transition-colors mb-4">
                                    <svg className="w-6 h-6 text-gray-400 group-hover:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                                <p className="text-gray-400 font-bold text-sm">Add Images or Videos</p>
                                <p className="text-gray-600 text-[10px] mt-2 uppercase font-black tracking-widest">Max 100MB each</p>
                            </label>
                        </div>

                        {files.map((file, index) => (
                            <div key={index} className="relative rounded-3xl overflow-hidden bg-gray-800 border border-gray-700 group aspect-square">
                                {file.type.startsWith('image') ? (
                                    <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="preview" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-900">
                                        <svg className="w-12 h-12 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                        </svg>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        onClick={() => removeFile(index)}
                                        className="bg-red-500 hover:bg-red-600 p-3 rounded-2xl transition-all transform hover:scale-110"
                                    >
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="absolute bottom-3 left-3 right-3 bg-black/40 backdrop-blur-md rounded-xl p-2">
                                    <p className="text-[10px] font-bold truncate">{file.name}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-black mb-3 text-gray-500 uppercase tracking-[0.2em]">Item Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-5 rounded-2xl bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                            placeholder="e.g. 'Crypto Punk #1'"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-black mb-3 text-gray-500 uppercase tracking-[0.2em]">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full p-5 rounded-2xl bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none h-40 transition-all font-medium leading-relaxed"
                            placeholder="Tell us about your creation..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-black mb-3 text-gray-500 uppercase tracking-[0.2em]">Collection</label>
                        <input
                            type="text"
                            value={collection}
                            onChange={(e) => setCollection(e.target.value)}
                            className="w-full p-5 rounded-2xl bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                            placeholder="e.g. 'Cintara Genesis'"
                        />
                    </div>
                </div>

                <button
                    onClick={handleMint}
                    disabled={uploading || isPending || isConfirming}
                    className={`w-full py-6 rounded-3xl font-black text-2xl transition-all transform active:scale-[0.98] shadow-2xl ${uploading || isPending || isConfirming
                        ? 'bg-gray-700 cursor-not-allowed opacity-50'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-blue-500/20'
                        }`}
                >
                    {uploading ? 'Uploading to IPFS...' :
                        isPending ? 'Confirm in Wallet...' :
                            isConfirming ? 'Minting on Blockchain...' :
                                'Mint NFT'}
                </button>

                {isSuccess && (
                    <div className="p-8 bg-green-500/10 border border-green-500/30 rounded-[32px] text-green-400 text-center animate-in zoom-in duration-300">
                        <p className="font-black text-2xl mb-2">✨ NFT Minted Successfully! ✨</p>
                        <p className="text-sm font-bold opacity-70 mb-4">Your masterpiece is now live on the blockchain.</p>
                        <button onClick={() => navigate(`/profile/${address}`)} className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-2xl font-black transition-all">
                            View Collection
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
