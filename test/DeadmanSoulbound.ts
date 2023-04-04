import {addSeconds, secondsInDay} from 'date-fns';
import {ethers} from 'hardhat';
import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers';
import {DeadmanSoulbound, DeadmanSoulbound__factory} from '../typechain-types';
import {assert, expect} from 'chai';
import {BigNumber} from 'ethers';

const TEST_INC_DAYS = 42;
const TEST_INC_SECONDS = TEST_INC_DAYS * secondsInDay;

const TEST_IPFS_URI = 'ipfs://bafkreiciloo7eglkegfp6axttuo6nc24teqpwm3edjnfkur5zd6bnu7npa';

const ERR_ONLY_OWNER = 'Ownable: caller is not the owner';
const ERR_ONLY_ALIVE = 'DeadmanSoulbound: contract is dead';
const ERR_ONLY_DEAD = 'DeadmanSoulbound: contract must be dead';
const ERR_NOT_YET = 'DeadmanSoulbound: not yet Time of Death';

async function mineToAfterDeathDate() {
    await ethers.provider.send('evm_increaseTime', [86400 * TEST_INC_DAYS]);
    await ethers.provider.send('evm_mine', []);
}

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

    describe('When the contract is deployed', async function () {
        it('should set time Increment', async function () {
            const incrementTime = await contract.timeIncrement();
            expect(incrementTime).to.eq(TEST_INC_SECONDS);
        });

        it('should set time of death to equal block timestamp plus time increment', async function () {
            const timeOfDeath = await contract.timeOfDeath();
            const timeOfDeathDate = new Date(timeOfDeath.toNumber() * 1000);
            const deployDatePlusIncrement = addSeconds(deployDate, TEST_INC_SECONDS);
            assert.deepEqual(timeOfDeathDate, deployDatePlusIncrement);
        });

        it('should have isDead set to false by default', async function () {
            const isDead = await contract.isDead();
            expect(isDead).to.be.false;
        });
    });

    describe('While the contract is alive', async function () {
        it('should allow contract owner to extend life to equal the block timestamp plus increment', async function () {
            await contract.extendLife();
            const currentBlock = await ethers.provider.getBlock('latest');
            const blockDate = new Date(currentBlock.timestamp * 1000);
            const timeOfDeath = await contract.timeOfDeath();
            const timeOfDeathDate = new Date(timeOfDeath.toNumber() * 1000);
            const blockDatePlusIncrement = addSeconds(blockDate, TEST_INC_SECONDS);
            assert.deepEqual(timeOfDeathDate, blockDatePlusIncrement);
        });

        it('should revert extend life calls from anyone other than owner', async function () {
            await expect(contract.connect(account1).extendLife()).to.be.revertedWith(ERR_ONLY_OWNER);
        });

        it('should allow contract owner to set a new increment', async function () {
            const newIncrement = 365 * secondsInDay;
            const newIncrementBN = ethers.BigNumber.from(newIncrement);
            await contract.setIncrement(newIncrementBN);
            const increment = await contract.timeIncrement();
            expect(increment).to.eq(newIncrementBN);
        });

        it('should revert new increment calls from anyone other than owner', async function () {
            const newIncrement = 365 * secondsInDay;
            const newIncrementBN = ethers.BigNumber.from(newIncrement);
            await expect(contract.connect(account1).setIncrement(newIncrementBN)).to.be.revertedWith(ERR_ONLY_OWNER);
        });

        describe('Before the Time of Death has been reached', async function () {
            it('should not allow the contract to be declared dead', async function () {
                await expect(contract.declareDead()).to.be.revertedWith(ERR_NOT_YET);
            });
        });

        describe('After the Time of Death has been reached', async function () {
            beforeEach(async function () {
                mineToAfterDeathDate();
            });

            it('should allow the contract to be declared dead', async function () {
                await expect(contract.declareDead()).to.not.reverted;
                const isDead = await contract.isDead();
                expect(isDead).to.be.true;
            });
        });
    });

    describe('After the Contract has been declared Dead', async function () {
        beforeEach(async function () {
            mineToAfterDeathDate();
            await contract.declareDead();
        });

        it('should revert if the contract has already been declared Dead', async function () {
            await expect(contract.declareDead()).to.be.revertedWith(ERR_ONLY_ALIVE);
        });

        it('should revert extend life calls', async function () {
            await expect(contract.extendLife()).to.be.revertedWith(ERR_ONLY_ALIVE);
        });

        it('should revert set increment calls', async function () {
            const newIncrement = 365 * secondsInDay;
            const newIncrementBN = ethers.BigNumber.from(newIncrement);
            await expect(contract.setIncrement(newIncrementBN)).to.be.revertedWith(ERR_ONLY_ALIVE);
        });
    });
});
