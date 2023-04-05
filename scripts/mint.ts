import {ethers} from 'hardhat';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
    const args = process.argv;
    const argv = args.slice(2);
    if (argv.length != 2) throw new Error('Missing parameters: <to_address:string> <ifps_url:string>');

    let toAddress = argv[0];
    if (!ethers.utils.isAddress(toAddress)) throw new Error(`Not a valid Address: ${toAddress}`);

    let ipfsUrl = argv[1];
    if (ipfsUrl.length !== 66) throw new Error(`Not a valid "ipfs://<hahs> url: ${ipfsUrl}`);

    throw new Error('not implemented!');
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
