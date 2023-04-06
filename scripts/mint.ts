import {ethers} from 'hardhat';
import {getSignerFromPrivateWalletKey} from './utils';
import {DeadmanSoulbound__factory} from '../typechain-types';

import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
    const args = process.argv;
    const argv = args.slice(2);
    if (argv.length != 3) throw new Error('Missing parameters: <contract_address:string> <to_address:string> <ifps_url:string>');

    let contractAddress = argv[0];
    if (!ethers.utils.isAddress(contractAddress)) throw new Error(`Not a valid Address: ${contractAddress}`);

    let toAddress = argv[1];
    if (!ethers.utils.isAddress(toAddress)) throw new Error(`Not a valid Address: ${toAddress}`);

    let ipfsUrl = argv[2];
    if (ipfsUrl.length !== 66 || !ipfsUrl.includes('ipfs://')) throw new Error(`Not a valid "ipfs://<hahs> url: ${ipfsUrl}`);

    const network = 'goerli';
    const signer = getSignerFromPrivateWalletKey(network);
    console.log(`Mint: DeadmanSoulbound NFT to ${toAddress} on ${network}...`);

    const contractFactory = new DeadmanSoulbound__factory(signer);
    const contract = contractFactory.attach(contractAddress);
    const tx = await contract.safeMint(toAddress, ipfsUrl);
    console.log(`> Minted token to ${toAddress}`);
    console.log(tx);
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
