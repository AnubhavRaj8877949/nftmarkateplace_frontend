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
            const mediaUrls = await Promise.all(files.map(file => uploadFileToIPFS(file)));

            const metadata = {
                name,
                description,
                image: mediaUrls[0],
                media: mediaUrls.map((url, i) => ({
                    url,
                    type: files[i].type.startsWith('video') ? 'VIDEO' : 'IMAGE'
                })),
                collection: collection || "General",
                attributes: [],
            };
            const tokenURI = await uploadJSONToIPFS(metadata);
            setUploading(false);

            writeContract({
                address: NFT_ADDRESS as `0x${string}`,
                abi: NFT_ABI,
                functionName: 'mint',
                args: [tokenURI, 500n],
            });

        } catch (error) {
            console.error("Error minting:", error);
            setUploading(false);
            alert("Error uploading to IPFS. Please check your Pinata keys.");
        }
    };

    return (
        <div className="container mx-auto px-4 py-20 min-h-screen">
            {/* Success Message Overlay */}
            {isSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-[#1a1b20] border border-green-500/30 p-12 rounded-[40px] text-center max-w-md shadow-2xl shadow-green-900/20 transform scale-100 animate-in zoom-in duration-300">
                        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-5xl">✨</span>
                        </div>
                        <h2 className="text-3xl font-black text-white mb-4">NFT Minted!</h2>
                        <p className="text-gray-400 font-medium mb-8">Your masterpiece has been successfully created and added to the blockchain.</p>
                        <button
                            onClick={() => navigate(`/profile/${address}`)}
                            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl transition-all hover:scale-105 shadow-xl shadow-green-500/20"
                        >
                            View Collection
                        </button>
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Left Column: Title & Upload */}
                    <div className="lg:w-1/2 space-y-10">
                        <div>
                            <h1 className="text-5xl lg:text-6xl font-black text-white mb-6 leading-tight tracking-tight">
                                Create New <br />
                                <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Item</span>
                            </h1>
                            <p className="text-xl text-gray-400 font-medium max-w-md">
                                Upload your image, video, or audio. Add a title and description to make it stand out.
                            </p>
                        </div>

                        {/* File Upload Zone */}
                        <div className="space-y-4">
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Media Assets</label>

                            {files.length === 0 ? (
                                <div className="border-3 border-dashed border-gray-700 hover:border-blue-500 rounded-[32px] bg-gray-800/20 hover:bg-blue-500/5 transition-all duration-300 group">
                                    <label className="cursor-pointer flex flex-col items-center justify-center h-[400px] w-full relative overflow-hidden">
                                        <input
                                            type="file"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            accept="image/*,video/*"
                                            multiple
                                        />
                                        <div className="w-20 h-20 bg-gray-800 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300 text-gray-400 shadow-xl">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                            </svg>
                                        </div>
                                        <p className="text-xl font-bold text-white mb-2">Click to upload</p>
                                        <p className="text-sm text-gray-500 font-medium">SVG, PNG, JPG, GIF or MP4 (Max 100MB)</p>
                                    </label>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    {files.map((file, index) => (
                                        <div key={index} className="relative aspect-square rounded-3xl overflow-hidden bg-gray-800 border border-gray-700 group shadow-xl">
                                            {file.type.startsWith('image') ? (
                                                <img src={URL.createObjectURL(file)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="preview" />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <svg className="w-12 h-12 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                                    </svg>
                                                </div>
                                            )}

                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button
                                                    onClick={() => removeFile(index)}
                                                    className="bg-red-500/80 hover:bg-red-500 text-white p-4 rounded-2xl transition-all hover:scale-110 backdrop-blur-md"
                                                >
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <label className="cursor-pointer h-full min-h-[200px] border-3 border-dashed border-gray-700 hover:border-blue-500 rounded-3xl flex flex-col items-center justify-center bg-gray-800/20 hover:bg-blue-500/5 transition-all text-gray-500 hover:text-blue-500">
                                        <input type="file" onChange={handleFileChange} className="hidden" accept="image/*,video/*" multiple />
                                        <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                        <span className="font-bold text-sm">Add more</span>
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Details Form */}
                    <div className="lg:w-1/2 bg-[#1a1b20] p-10 rounded-[48px] border border-gray-800 h-fit sticky top-24 shadow-2xl">
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-2xl font-black text-white mb-6">Item Details</h3>

                                <div className="space-y-6">
                                    <div className="group">
                                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3 pl-1 group-focus-within:text-blue-400 transition-colors">Name</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full bg-[#0f1014] border border-gray-800 text-white text-lg font-bold rounded-2xl px-6 py-4 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder:text-gray-700"
                                            placeholder="e.g. 'Cosmic Traveler #001'"
                                        />
                                    </div>

                                    <div className="group">
                                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3 pl-1 group-focus-within:text-blue-400 transition-colors">Description</label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full bg-[#0f1014] border border-gray-800 text-white font-medium rounded-2xl px-6 py-4 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder:text-gray-700 min-h-[160px] leading-relaxed resize-none"
                                            placeholder="Provide a detailed description of your item..."
                                        />
                                    </div>

                                    <div className="group">
                                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3 pl-1 group-focus-within:text-blue-400 transition-colors">Collection</label>
                                        <input
                                            type="text"
                                            value={collection}
                                            onChange={(e) => setCollection(e.target.value)}
                                            className="w-full bg-[#0f1014] border border-gray-800 text-white font-bold rounded-2xl px-6 py-4 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder:text-gray-700"
                                            placeholder="e.g. 'Genesis Series'"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-800">
                                <button
                                    onClick={handleMint}
                                    disabled={uploading || isPending || isConfirming}
                                    className={`w-full py-5 rounded-2xl font-black text-lg transaction-all duration-300 transform active:scale-[0.98] ${uploading || isPending || isConfirming
                                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-xl shadow-blue-500/20'
                                        }`}
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        {uploading && <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                                        {uploading ? 'Uploading Assets...' :
                                            isPending ? 'Confirm in Wallet...' :
                                                isConfirming ? 'Minting on Blockchain...' :
                                                    'Create Item'}
                                    </span>
                                </button>
                                <p className="text-center text-xs font-bold text-gray-600 mt-4 uppercase tracking-widest">
                                    Gas fees apply
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
