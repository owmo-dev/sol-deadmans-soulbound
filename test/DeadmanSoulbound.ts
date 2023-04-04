import {addDays} from 'date-fns';
import {ethers} from 'hardhat';
import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers';
import {DeadmanSoulbound, DeadmanSoulbound__factory} from '../typechain-types';
import {assert, expect} from 'chai';

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
                await expect(contract.declareDead()).to.be.revertedWith('Contract is Dead');
            });
        });
    });

    describe('When extending the Time of Death', async function () {
        it('should revert for anyone other than the contract owner', async function () {
            await expect(contract.connect(account1).extendLife()).to.be.revertedWith('Ownable: caller is not the owner');
        });

        describe('When the isDead flag has not yet been declared', async function () {
            it('should set Time of Death to 1 year from extension block timestamp', async function () {
                await contract.extendLife();
                const currentBlock = await ethers.provider.getBlock('latest');
                const blockDate = new Date(currentBlock.timestamp * 1000);
                const timeOfDeath = await contract.timeOfDeath();
                const timeOfDeathDate = new Date(timeOfDeath.toNumber() * 1000);
                const blockDatePlusOneYear = addDays(blockDate, TEST_DAYS_TO_LIVE);
                assert.deepEqual(timeOfDeathDate, blockDatePlusOneYear);
            });
        });

        describe('When the isDead flag has been declared', async function () {
            it('should revert because once declared Dead, the contract canont be revived', async function () {
                await ethers.provider.send('evm_increaseTime', [86400 * TEST_DAYS_TO_LIVE]);
                await ethers.provider.send('evm_mine', []);
                await contract.declareDead();
                await expect(contract.extendLife()).to.be.revertedWith('Contract is Dead');
            });
        });
    });
});
