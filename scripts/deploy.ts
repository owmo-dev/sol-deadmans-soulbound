import {ethers} from 'hardhat';
import {secondsInDay} from 'date-fns';
import {DeadmanSoulbound__factory} from '../typechain-types';
import {getSignerFromPrivateWalletKey} from './utils';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
    const args = process.argv;
    const argv = args.slice(2);
    if (argv.length != 1) throw new Error('Missing parameter: increment in days (float)');

    const days = parseFloat(argv[0]);
    console.log(days);

    if (days === 0 || days > 365) throw new Error('Increment (days) must be greater than 0 and less than or equal to 365');

    const incrementSeconds = days * secondsInDay;

    const network = 'goerli';
    const signer = getSignerFromPrivateWalletKey(network);
    console.log(`Deploy: DeadmanSoulbound to ${network}...`);

    let timeIncrement = ethers.BigNumber.from(incrementSeconds);

    console.log(`> deploying contract with increment set to ${days} days`);

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
