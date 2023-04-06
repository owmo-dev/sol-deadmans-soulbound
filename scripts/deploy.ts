import {secondsInDay} from 'date-fns';
import {ethers, network, run} from 'hardhat';

const TIME_INCREMENT_DAYS = 1; // (>0 && <= 365)

async function main() {
    console.log(`DEPLOY: DeadmanSoulbound --> ${network.name}`);

    const TIME_INCEMENT = TIME_INCREMENT_DAYS * secondsInDay;

    const contractFactory = await ethers.getContractFactory('DeadmanSoulbound');
    const contract = await contractFactory.deploy(TIME_INCEMENT);

    const WAIT_BLOCK_CONFIRMATIONS = 6;
    await contract.deployTransaction.wait(WAIT_BLOCK_CONFIRMATIONS);

    console.log(`Contract deployed to ${contract.address} on ${network.name}`);

    console.log(`Verifying contract on Etherscan...`);

    await run(`verify:verify`, {
        address: contract.address,
        constructorArguments: [TIME_INCEMENT],
    });
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
