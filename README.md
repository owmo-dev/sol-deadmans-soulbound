# sol-deadmans-soulbound

Experiment in extending a typical ERC721 contract with storage into one that mints soulbound tokens, but allows a "deadman's switch" type mechanism wherein the contract can be declared "dead" and thus permitting token transfers again. Developed as a final study project for the Encode Club Solidity Bootcamp. Please only consider this code as conceptual in nature and **DO NOT** use it in production; it is a publicly shared study only!

## Contract Lifecycle

**Birth** - Upon deployment, initial time of death is set and the contract owner can mint soulbound NFTs to wallets.

**Life** - Contract owner can extend life of the contract if it has not been declared dead and continue to mint NFTs.

**Death** - Anyone can declare the contract dead if the time of death be met. Transfers begin, NFTs minting ends.

## Scripts

### Deploy & Verify on Etherscan

`npx hardhat run scripts/deploy.ts --network goerli`

### Mint NFT to Address

`npx hardhat run scripts/mint.ts --network goerli`
