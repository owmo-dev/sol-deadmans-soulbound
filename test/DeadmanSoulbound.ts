import {addDays, secondsInDay} from 'date-fns';
import {ethers} from 'hardhat';
import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers';
import {DeadmanSoulbound, DeadmanSoulbound__factory} from '../typechain-types';
import {assert, expect} from 'chai';
import {BigNumber} from 'ethers';

const TEST_INC_DAYS = 365;
const TEST_INC_SECONDS = TEST_INC_DAYS * secondsInDay;

const ERR_ONLY_OWNER = 'Ownable: caller is not the owner';
const ERR_ONLY_ALIVE = 'DeadmanSoulbound: contract is dead';
const ERR_ONLY_DEAD = 'DeadmanSoulbound: contract must be dead';
const ERR_NOT_YET = 'DeadmanSoulbound: not yet Time of Death';

describe('DeadmansSoulbound', async function () {
    let deployer: SignerWithAddress;
    let account1: SignerWithAddress;
    let account2: SignerWithAddress;
    let contract: DeadmanSoulbound;

    let deployDate: Date;
    let timeIncrement: BigNumber;

    beforeEach(async function () {
        [deployer, account1, account2] = await ethers.getSigners();
        const contractFactory = new DeadmanSoulbound__factory(deployer);
        timeIncrement = ethers.BigNumber.from(TEST_INC_SECONDS);
        contract = await contractFactory.deploy(timeIncrement);
        await contract.deployTransaction.wait();

        const currentBlock = await ethers.provider.getBlock('latest');
        deployDate = new Date(currentBlock.timestamp * 1000);
    });

    describe('When the DeadmanSoulbound contract is deployed', async function () {
        it('should set Time of Death to increment time from deployment', async function () {
            const timeOfDeath = await contract.timeOfDeath();
            const timeOfDeathDate = new Date(timeOfDeath.toNumber() * 1000);
            const deployDatePlusIncrement = addDays(deployDate, TEST_INC_DAYS);
            assert.deepEqual(timeOfDeathDate, deployDatePlusIncrement);
        });

        it('should have isDead set to false by default', async function () {
            const isDead = await contract.isDead();
            expect(isDead).to.be.false;
        });

        it('should set time Increment', async function () {
            const incrementTime = await contract.timeIncrement();
            expect(incrementTime).to.eq(TEST_INC_SECONDS);
        });
    });

    describe('When declaring the contract Dead', async function () {
        describe('Before the Time of Death has been reached', async function () {
            it('should not permit the declaration', async function () {
                await expect(contract.declareDead()).to.be.revertedWith(ERR_NOT_YET);
            });
        });

        describe('After the Time of Death has been reached', async function () {
            beforeEach(async function () {
                await ethers.provider.send('evm_increaseTime', [86400 * TEST_INC_DAYS]);
                await ethers.provider.send('evm_mine', []);
            });

            it('should permit the declaration', async function () {
                await expect(contract.declareDead()).to.not.reverted;
                const isDead = await contract.isDead();
                expect(isDead).to.be.true;
            });

            it('should revert if the contrat has already been declared Dead', async function () {
                await expect(contract.declareDead()).to.not.reverted;
                await expect(contract.declareDead()).to.be.revertedWith(ERR_ONLY_ALIVE);
            });
        });
    });

    describe('When extending the Time of Death', async function () {
        it('should revert for anyone other than the contract owner', async function () {
            await expect(contract.connect(account1).extendLife()).to.be.revertedWith(ERR_ONLY_OWNER);
        });

        describe('When the isDead flag has not yet been declared', async function () {
            it('should set Time of Death to increment time from block timestamp', async function () {
                await contract.extendLife();
                const currentBlock = await ethers.provider.getBlock('latest');
                const blockDate = new Date(currentBlock.timestamp * 1000);
                const timeOfDeath = await contract.timeOfDeath();
                const timeOfDeathDate = new Date(timeOfDeath.toNumber() * 1000);
                const blockDatePlusIncrement = addDays(blockDate, TEST_INC_DAYS);
                assert.deepEqual(timeOfDeathDate, blockDatePlusIncrement);
            });
        });

        describe('When the isDead flag has been declared', async function () {
            it('should revert because once declared Dead, the contract canont be revived', async function () {
                await ethers.provider.send('evm_increaseTime', [86400 * TEST_INC_DAYS]);
                await ethers.provider.send('evm_mine', []);
                await contract.declareDead();
                await expect(contract.extendLife()).to.be.revertedWith(ERR_ONLY_ALIVE);
            });
        });
    });
});
