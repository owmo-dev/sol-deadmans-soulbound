// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Counters.sol';

/**
 * @title Soulbound tokens gated by a Deadman's Switch
 * @author Owen Moore
 * @notice Intended as a contract base for artists to mint soulbound
 * tokens directly to collector's wallets as a work of appreciation.
 * The inevitable declaration of "death" thus permitting art trading
 * offers an interesting mechanic around which to position a project.
 */
contract DeadmanSoulbound is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    /// @notice Time window (in seconds) for each extension of life
    uint256 public timeIncrement;

    /// @notice Exact time at which the contract's death can occur
    uint256 public timeOfDeath;

    /// @notice Flag to indiciate if death has been declared or not
    bool public isDead;

    /**
     * @notice Initializes contract.
     * @param _timeIncrement sets default time of death and increment
     * @dev _timeIncrement should be set to the maximum value (365 days)
     * to have a sufficiently large window between life extension calls
     */
    constructor(uint256 _timeIncrement) ERC721('DeadmanSoulbound', 'DSB') {
        setIncrement(_timeIncrement);
        timeOfDeath = block.timestamp + timeIncrement;
    }

    /// @notice Passes when the contract has not yet been declared dead
    modifier onlyAlive() {
        require(!isDead, 'DeadmanSoulbound: contract is dead');
        _;
    }

    /// @notice Sets a new time of death
    function extendLife() public onlyOwner onlyAlive {
        timeOfDeath = block.timestamp + timeIncrement;
    }

    /// @notice Decalres the contract as "dead" (once declared, there is no going back)
    function declareDead() public onlyAlive {
        require(block.timestamp >= timeOfDeath, 'DeadmanSoulbound: not yet Time of Death');
        isDead = true;
    }

    /// @notice Sets the increment value used when extending life of the contract
    function setIncrement(uint256 _timeIncrement) public onlyOwner onlyAlive {
        require(_timeIncrement > 0, 'DeadmanSoulbound: must be greater than zero');
        require(_timeIncrement <= 365 days, 'DeadmanSoulbound: max value is 31536000');
        timeIncrement = _timeIncrement;
    }

    /// @notice Gates tokenTransfers (except mints) until the contract has been declared "dead"
    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize) internal override(ERC721) {
        if (from != address(0)) require(isDead, 'DeadmanSoulbound: contract must be dead');
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    /// @notice Gates minting to only while the contract is "alive"
    function safeMint(address to, string memory uri) public onlyOwner onlyAlive {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    // The following functions are overrides required by Solidity.

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
}
