# TrustFi

TrustFi is an AI-powered, decentralized microfinance platform built on the Polkadot ecosystem.  
MVP will avoid AI initially and focus on on-chain loan requests, simple rule-based TrustScore, and TrustNFT issuance.

## MVP scope (first iteration)
- On-chain pallet with:
  - Loan request submission
  - Manual approval flow (admin/validator)
  - Simple rule-based TrustScore (repayment history, loan count)
  - TrustNFT issuance (metadata reference)
- React frontend to submit/view loan requests and TrustScore
- Basic tests for pallet logic


## Why Rust, and what will we use it for?

- Why Rust for Polkadot/Substrate:
  - Substrate (Polkadot's framework) is implemented in Rust; runtime pallets are written in Rust and compiled to WASM.  
  - Rust provides strong type-safety and memory-safety, reducing bugs in on-chain code where mistakes are costly.  
  - Good performance and deterministic builds for blockchain runtimes.

- What you'll implement in Rust:
  - The on-chain core: runtime pallet(s) that manage loans, TrustScore storage, TrustNFT issuance, and on-chain business logic.
  - Any runtime-level logic that must run on-chain (consensus/validation/fees) or be compiled to WASM.

## We will use ink! (smart contracts)

- Decision: implement the on-chain core as ink! smart contracts (Rust). This gives contract-style development on Substrate-compatible chains and keeps business logic isolated in upgradeable/replaceable contracts.
- Benefits:
  - Faster iteration than runtime pallets (no need to build full runtime).
  - Familiar contract ABI for frontend tooling (polkadot.js-contracts).
  - Still Rust-based, so you keep type safety and low-level control.

## Quick dev setup (contract-focused)
- Install Rust (stable) and toolchain:
  - rustup update stable
  - rustup target add wasm32-unknown-unknown
- Install cargo-contract and wasm-tools (may require installing via cargo or provided instructions):
  - cargo install cargo-contract --force
- Run a local contracts-capable node (choose one):
  - substrate-contracts-node or Canvas node (follow respective repo README)
- Scaffold a new contract:
  - cargo contract new trustfi_contract
- Build & test:
  - cd trustfi_contract
  - cargo +stable contract build
  - cargo test

## Contract MVP design (high level)
- Storage:
  - Loans: map LoanId => Loan { borrower, amount, duration, status, created_at }
  - BorrowerStats: map AccountId => { total_loans, on_time_count, defaults }
  - TrustNFTs: simple mapping or event emission with metadata URI
- Core messages (functions):
  - submit_loan(amount, duration, metadata) -> LoanId
  - approve_loan(loan_id) [admin only]
  - repay(loan_id, amount)
  - get_trustscore(account) -> u8 (simple rule-based calculation)
  - issue_trustnft(account, metadata) [after good history]
- Tests:
  - unit tests for flows: submit -> approve -> repay -> trustscore increase -> NFT issuance

## Contract scaffold created

I have scaffolded a starter ink! contract under trustfi_contract. To build and test it locally:

- Install cargo-contract and wasm target (if not already):
  - rustup update stable
  - rustup target add wasm32-unknown-unknown
  - cargo install cargo-contract --force

- Build contract:
  - cd trustfi_contract
  - cargo +stable contract build

- Run unit tests:
  - cargo test

Use a contracts-capable local node (substrate-contracts-node or Canvas) and polkadot.js Apps (Contracts) or @polkadot/api-contract from the frontend to deploy/interact.

## Decision: use JavaScript for development

You chose to use JavaScript. There are three main JS paths — pick one now so I can scaffold the next steps.

Options (pick one)
A) EVM-compatible contracts (Solidity) + JS tooling (Hardhat + ethers.js) — recommended for a JS-first workflow and easy local testing/deployment.  
B) JS-native smart contracts (Agoric) — write contract logic in JavaScript (different ecosystem).  
C) Keep ink! contracts but use JavaScript for frontend/off-chain components (polkadot/api + @polkadot/api-contract).

Recommendation: choose A if you want the smoothest JS experience (I'll scaffold Hardhat, a Solidity TrustFi contract, JS tests, and frontend examples).  
Choose B only if you must write on-chain code in JS and accept a different runtime.  
Choose C if you prefer native Substrate contracts and only want JS for the rest.

## Architecture

See ARCHITECTURE.md for the project architecture, directory layout, component interactions, and milestones.

Next step: confirm which JS path you want for on-chain contracts:
- A = EVM + Solidity + Hardhat (recommended)
- B = Agoric (JS-native contracts)
- C = Keep ink! but use JS for frontend/indexer

Reply with A, B, or C and which milestone to start (M1: contracts scaffold, M2: frontend scaffold).

## Confirm next step

Plan: work part-by-file and add tests in a central tests/ folder.  
Please confirm two things before I scaffold code:
1) Which JS on-chain path to use: A (EVM + Solidity + Hardhat), B (Agoric JS contracts), or C (keep ink! and use JS for frontend/indexer).  
2) Which component to start with first: "contracts" or "frontend".

Reply with your choices, e.g. "A, contracts" or "C, frontend". I will then scaffold that component and corresponding tests.

Selected: A (EVM + Solidity + Hardhat) — scaffolding created under packages/contracts/.
