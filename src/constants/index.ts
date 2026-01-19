export const NFT_ADDRESS = "0xF26f1b2a4443f498f1ad34F42C72A584424c84E0";
export const MARKETPLACE_ADDRESS = "0x77dEa51E89E97CFef03aEcb1425caedF340C2987";
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

export const NFT_ABI = [
    {
        "inputs": [
            { "internalType": "string", "name": "tokenURI", "type": "string" },
            { "internalType": "uint96", "name": "feeNumerator", "type": "uint96" }
        ],
        "name": "mint",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "to", "type": "address" },
            { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
        ],
        "name": "approve",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "operator", "type": "address" },
            { "internalType": "bool", "name": "approved", "type": "bool" }
        ],
        "name": "setApprovalForAll",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
        ],
        "name": "getApproved",
        "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "owner", "type": "address" },
            { "internalType": "address", "name": "operator", "type": "address" }
        ],
        "name": "isApprovedForAll",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "view",
        "type": "function"
    }
] as const;

export const MARKETPLACE_ABI = [
    {
        "inputs": [
            { "internalType": "address", "name": "nftAddress", "type": "address" },
            { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
        ],
        "name": "cancel",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "nftAddress", "type": "address" },
            { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
            { "internalType": "uint256", "name": "price", "type": "uint256" }
        ],
        "name": "list",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "nftAddress", "type": "address" },
            { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
        ],
        "name": "buy",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "nftAddress", "type": "address" },
            { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
        ],
        "name": "makeOffer",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "nftAddress", "type": "address" },
            { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
        ],
        "name": "cancelOffer",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "nftAddress", "type": "address" },
            { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
            { "internalType": "address", "name": "offerer", "type": "address" }
        ],
        "name": "acceptOffer",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "address", "name": "seller", "type": "address" },
            { "indexed": true, "internalType": "address", "name": "nftAddress", "type": "address" },
            { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" },
            { "indexed": false, "internalType": "uint256", "name": "price", "type": "uint256" }
        ],
        "name": "ItemListed",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "address", "name": "seller", "type": "address" },
            { "indexed": true, "internalType": "address", "name": "nftAddress", "type": "address" },
            { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" }
        ],
        "name": "ItemCanceled",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "address", "name": "buyer", "type": "address" },
            { "indexed": true, "internalType": "address", "name": "nftAddress", "type": "address" },
            { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" },
            { "indexed": false, "internalType": "uint256", "name": "price", "type": "uint256" }
        ],
        "name": "ItemBought",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "address", "name": "offerer", "type": "address" },
            { "indexed": true, "internalType": "address", "name": "nftAddress", "type": "address" },
            { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" },
            { "indexed": false, "internalType": "uint256", "name": "price", "type": "uint256" }
        ],
        "name": "OfferCreated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "address", "name": "seller", "type": "address" },
            { "indexed": true, "internalType": "address", "name": "offerer", "type": "address" },
            { "indexed": true, "internalType": "address", "name": "nftAddress", "type": "address" },
            { "indexed": false, "internalType": "uint256", "name": "tokenId", "type": "uint256" },
            { "indexed": false, "internalType": "uint256", "name": "price", "type": "uint256" }
        ],
        "name": "OfferAccepted",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "address", "name": "offerer", "type": "address" },
            { "indexed": true, "internalType": "address", "name": "nftAddress", "type": "address" },
            { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" }
        ],
        "name": "OfferCanceled",
        "type": "event"
    }
] as const;
