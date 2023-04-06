import {ethers} from 'hardhat';

import * as dotenv from 'dotenv';
dotenv.config();

let getSignerFromPrivateWalletKey = (network: string) => {
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey || privateKey.length <= 0) throw new Error('Missing environment: private key');

    const wallet = new ethers.Wallet(privateKey);
    console.log(`> connected to the wallet address ${wallet.address}`);

    let provider = new ethers.providers.InfuraProvider(network, process.env.INFURA_API_KEY);
    const signer = wallet.connect(provider);

    return signer;
};

export {getSignerFromPrivateWalletKey};
