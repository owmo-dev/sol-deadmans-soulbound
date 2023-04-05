import {ethers} from 'hardhat';
import {secondsInDay} from 'date-fns';
import {DeadmanSoulbound__factory} from '../typechain-types';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
    const args = process.argv;
    const argv = args.slice(2);
    if (argv.length <= 0) throw new Error('Missing parameters: increment (days)');

    const days = parseFloat(argv[0]);
    console.log(days);

    if (days === 0 || days > 365) throw new Error('Increment (days) must be greater than 0 and less than or equal to 365');

    const incrementSeconds = days * secondsInDay;

    const network = 'goerli';

    console.log(`Deploy: DeadmanSoulbound to ${network}...`);

    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey || privateKey.length <= 0) throw new Error('Missing environment: private key');

    const wallet = new ethers.Wallet(privateKey);
    console.log(`> connected to the wallet address ${wallet.address}`);

    let provider;
    provider = new ethers.providers.InfuraProvider(network, process.env.INFURA_API_KEY);

    const signer = wallet.connect(provider);

    console.log(`> deploying contract with increment set to ${days} days`);

    let timeIncrement = ethers.BigNumber.from(incrementSeconds);

    const contractFactory = new DeadmanSoulbound__factory(signer);
    const contract = await contractFactory.deploy(timeIncrement);
    const tx = await contract.deployTransaction.wait();

    console.log(`> DeadmanSoulbound deployed at ${tx.contractAddress}`);
    console.log(tx);
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
