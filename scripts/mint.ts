import {ethers, network} from 'hardhat';
import * as dotenv from 'dotenv';
dotenv.config();

const CONTRACT_ADDRESS = process.env.DEPLOYED_CONTRACT_ADDRESS;
const MINT_TO_ADDRESS = process.env.MINT_TO_ADDRESS;
const IPFS_URL = process.env.IPFS_URL;

async function main() {
    let contractAddress = `${CONTRACT_ADDRESS}`;
    if (!ethers.utils.isAddress(contractAddress)) throw new Error(`Not a valid Address: ${contractAddress}`);

    let mintToAddress = `${MINT_TO_ADDRESS}`;
    if (!ethers.utils.isAddress(mintToAddress)) throw new Error(`Not a valid Address: ${mintToAddress}`);

    let ipfsUrl = `${IPFS_URL}`;
    if (ipfsUrl.length !== 66 || !ipfsUrl.includes('ipfs://')) throw new Error(`Not a valid "ipfs://<hahs> url: ${ipfsUrl}`);

    console.log(`MINT: DeadmanSoulbound NFT --> ${network.name}`);

    const contractFactory = await ethers.getContractFactory('DeadmanSoulbound');
    const contract = contractFactory.attach(contractAddress);
    const tx = await contract.safeMint(mintToAddress, ipfsUrl);

    console.log(`TX sent: ${tx.hash}`);
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
