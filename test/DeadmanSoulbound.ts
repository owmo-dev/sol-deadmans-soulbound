import {addDays} from 'date-fns';
import {ethers} from 'hardhat';
import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers';
import {DeadmanSoulbound, DeadmanSoulbound__factory} from '../typechain-types';
import {assert, expect} from 'chai';

const TEST_TOKEN_PRICE = ethers.utils.parseEther('0.01');
const TEST_DAYS_TO_LIVE = 365;

describe('DeadmansSoulbound', async function () {
    let deployer: SignerWithAddress;
    let account1: SignerWithAddress;
    let account2: SignerWithAddress;
    let contract: DeadmanSoulbound;

    let deployDate: Date;

    beforeEach(async function () {
        [deployer, account1, account2] = await ethers.getSigners();
        const contractFactory = new DeadmanSoulbound__factory(deployer);
        contract = await contractFactory.deploy(TEST_TOKEN_PRICE);
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

        it('should set the price to mint', async function () {
            const mintPrice = await contract.mintPrice();
            expect(mintPrice).to.eq(TEST_TOKEN_PRICE);
        });
    });

    describe('When declaring the contract Dead', async function () {
        describe('Before the Time of Death has been reached', async function () {
            it('should not permit the declaration', async function () {
                await expect(contract.declareDead()).to.be.revertedWith('Time of Death not yet happened');
            });
        });

        describe('After the Time of Death has been reached', async function () {
            beforeEach(async function () {
                await ethers.provider.send('evm_increaseTime', [86400 * TEST_DAYS_TO_LIVE]);
                await ethers.provider.send('evm_mine', []);
            });

            it('should permit the declaration', async function () {
                await expect(contract.declareDead()).to.not.reverted;
                const isDead = await contract.isDead();
                expect(isDead).to.be.true;
            });

            it('should revert if the contrat has already been declared Dead', async function () {
                await expect(contract.declareDead()).to.not.reverted;
                await expect(contract.declareDead()).to.be.revertedWith('Contract is already Dead');
            });
        });
    });
});
