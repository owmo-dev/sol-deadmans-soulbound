# sol-deadmans-soulbound

Experiment in extending a typical ERC721 contract with storage into one that mints soulbound tokens, but allows a "deadman's switch" type mechanism wherein the contract can be declared "dead" and thus permitting token transfers again. Developed as part of the Encode Club Solidity Bootcamp, this contract is my final project. Please evaluate this contract carefully if deploying / referencing it.

## Lifecycle

### Birth

At the time of deployment, an initial time until death is set and the contract Owner can mint soulbound NFTs to wallets of their choosing.

### Life

Periodically, the contract Owner must extend the life of the contract before it has been decalred dead.

### Death

Anyone may declare the contract dead so long as the time of death has been met. The Owner will no longer be able to mint tokens and owned tokens may be traded freely.
