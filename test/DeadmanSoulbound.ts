import {addDays} from 'date-fns';
import {ethers} from 'hardhat';
import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers';
import {DeadmanSoulbound, DeadmanSoulbound__factory} from '../typechain-types';
import {assert, expect} from 'chai';

const TEST_TOKEN_PRICE = 0.1;
const TEST_DAYS_TO_LIVE = 365;

describe('DeadmansSoulbound', async function () {
    let deployer: SignerWithAddress;
    let account1: SignerWithAddress;
    let account2: SignerWithAddress;
    let contract: DeadmanSoulbound;

    let deployDate: Date;

    this.beforeEach(async function () {
        [deployer, account1, account2] = await ethers.getSigners();
        const contractFactory = new DeadmanSoulbound__factory(deployer);
        contract = await contractFactory.deploy();
        await contract.deployTransaction.wait();

        const currentBlock = await ethers.provider.getBlock('latest');
        deployDate = new Date(currentBlock.timestamp * 1000);
    });

    describe('When the DeadmanSoulbound contract is deployed', async function () {
        it('should set Time of Death to 1 year from deployment', async function () {
            const timeOfDeath = await contract.timeOfDeath();
            const timeOfDeathDate = new Date(timeOfDeath.toNumber() * 1000);
            const deployDatePlusOneYear = addDays(deployDate, TEST_DAYS_TO_LIVE);
            assert.deepEqual(timeOfDeathDate, deployDatePlusOneYear);
        });

        it('should set isDead to false, indicating contract owner is alive', async function () {
            const isDead = await contract.isDead();
            expect(isDead).to.be.false;
        });
    });
});
