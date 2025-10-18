# TrustFi — Credential NFT MVP


EVM-based MVP on Moonbase Alpha (Moonbeam testnet). Users claim a non-transferable-style credential (standard ERC-721) after completing gigs.

## What’s implemented

- Solidity ERC-721 contract (ReputationNFT)
  - Path: smart_contract/contracts/ReputationNFT.sol
  - Token IDs start at 1
  - Access control: owner or authorizedMinter can mint
  - Claim-once per achievement: hasClaimed[achievementId][user]
  - Event: ReputationMinted(recipient, tokenId, achievementId, tokenURI)
  - View: totalMinted()
- React client (ethers v6)
  - Path: client/src/App.jsx
  - Auto switch/connect to Moonbase Alpha (chainId 0x507)
  - Calls safeMint(account, tokenURI, achievementId)
  - Uses contractAddress and contractABI from client/src/contractInfo

## Network

- Chain: Moonbase Alpha
- chainId: 0x507
- RPC: https://rpc.api.moonbase.moonbeam.network
- Explorer: https://moonbase.moonscan.io

## How to run

1) Contracts
- Compile/deploy with your preferred tool (Hardhat or Remix).
- Constructor arg: initialOwner (address that controls the contract).
- After deploy, set the minter:
  - setAuthorizedMinter(<dApp/backend signer address>)

2) Client
- Configure client/src/contractInfo with deployed contract address and ABI
- Install and run:
  - cd client
  - npm install
  - npm start
- Connect MetaMask, the app will switch to Moonbase Alpha automatically.

## Contract quick reference

- function setAuthorizedMinter(address minterAddress) onlyOwner
- function safeMint(address to, string tokenURI, bytes32 achievementId)
  - Requires caller is owner or authorizedMinter
  - Reverts if hasClaimed[achievementId][to] is true
  - Emits ReputationMinted
- function totalMinted() view returns (uint256)
- mapping(bytes32 => mapping(address => bool)) public hasClaimed

## Next steps (optional)
- Deployment scripts/tests (Hardhat)
- Read endpoints (list user tokens/achievements)
- Additional admin events (minter updated), guards, and metadata pinning workflow
