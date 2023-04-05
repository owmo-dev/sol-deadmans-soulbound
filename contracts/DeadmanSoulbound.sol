// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Counters.sol';

contract DeadmanSoulbound is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    uint256 public timeIncrement;
    uint256 public timeOfDeath;
    bool public isDead;

    constructor(uint256 _timeIncrement) ERC721('DeadmanSoulbound', 'DSB') {
        setIncrement(_timeIncrement);
        timeOfDeath = block.timestamp + timeIncrement;
    }

    modifier onlyAlive() {
        require(!isDead, 'DeadmanSoulbound: contract is dead');
        _;
    }

    function extendLife() public onlyOwner onlyAlive {
        timeOfDeath = block.timestamp + timeIncrement;
    }

    function declareDead() public onlyAlive {
        require(block.timestamp >= timeOfDeath, 'DeadmanSoulbound: not yet Time of Death');
        isDead = true;
    }

    function setIncrement(uint256 _timeIncrement) public onlyOwner onlyAlive {
        require(_timeIncrement >= 1 days, 'DeadmanSoulbound: increment min: 86400 (1 days)');
        require(_timeIncrement <= 365 days, 'DeadmanSoulbound: increment max: 31536000 (365 days)');
        timeIncrement = _timeIncrement;
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize) internal override(ERC721) {
        if (from != address(0)) require(isDead, 'DeadmanSoulbound: contract must be dead');
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

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
