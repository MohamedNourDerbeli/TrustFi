// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TrustFiCredential (ReputationNFT V3)
 * @dev This version adds a "claim once" mechanism per achievement.
 * Users can only mint one credential for each unique achievementId.
 */
contract ReputationNFT is ERC721URIStorage, Ownable {
    // --- STATE VARIABLES ---

    uint256 private _nextTokenId;
    address public authorizedMinter;

    mapping(bytes32 => mapping(address => bool)) public hasClaimed;

    // --- EVENTS ---

    /**
     * @dev Emitted when a new reputation token is minted.
     * @param recipient The address receiving the token.
     * @param tokenId The ID of the newly minted token.
     * @param achievementId A unique identifier for the achievement being credited.
     * @param tokenURI A URI pointing to the token's metadata.
     */
    event ReputationMinted(address indexed recipient, uint256 indexed tokenId, bytes32 indexed achievementId, string tokenURI);

    // --- CONSTRUCTOR ---

    constructor(address initialOwner) 
        ERC721("TrustFi Credential", "CRED") 
        Ownable(initialOwner) 
    {
        _nextTokenId = 1; // Start token IDs at 1
    }

    // --- ADMIN FUNCTIONS ---

    /**
     * @dev Allows the contract owner to set or update the authorized minter address.
     * @param minterAddress The address of the minter to authorize.
     */
    function setAuthorizedMinter(address minterAddress) public onlyOwner {
        authorizedMinter = minterAddress;
    }

    // --- CORE FUNCTION ---

    /**
     * @dev Mints a new reputation token for a specific achievement.
     * This can only be called by the authorized minter or the contract owner.
     * It will fail if the recipient has already claimed a credential for this achievementId.
     * @param to The address that will receive the new token.
     * @param tokenURI The URI for the token's metadata.
     * @param achievementId A unique ID representing the specific job or task completed.
     */
    function safeMint(address to, string memory tokenURI, bytes32 achievementId) public {
        require(msg.sender == owner() || msg.sender == authorizedMinter, "Caller is not authorized to mint");
        
        // This is the crucial new security check.
        require(!hasClaimed[achievementId][to], "Achievement already claimed by this user");

        // Mark as claimed immediately after the check to prevent re-entrancy attacks.
        hasClaimed[achievementId][to] = true;

        uint256 tokenId = _nextTokenId;
        
        // Use an unchecked block for gas efficiency, as overflow is impossible here.
        unchecked { _nextTokenId++; }
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);

        emit ReputationMinted(to, tokenId, achievementId, tokenURI);
    }

    // --- VIEW FUNCTIONS ---

    /**
     * @dev Returns the total number of credentials that have been minted.
     */
    function totalMinted() public view returns (uint256) {
        // Since we start at 1, total minted = nextTokenId - 1
        return _nextTokenId - 1;
    }
}
