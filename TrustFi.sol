// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title TrustFi
 * @dev A decentralized trust-based lending platform that tracks borrower reputation
 * @notice This contract allows users to request loans and build trust scores through repayment
 */
contract TrustFi {
    /**
     * @dev Represents a loan with borrower details, repayment status, and due date
     */
    struct Loan {
        address borrower;
        uint256 amount;       // Loan amount in wei
        bool repaid;          // Whether the loan has been repaid
        uint256 dueDate;      // Timestamp when loan should be repaid
        bool penalized;       // Whether late repayment penalty has been applied
    }

    /// @dev The owner of the contract (deployer)
    address public owner;

    /// @dev Maps borrower addresses to their trust scores (higher = more trustworthy)
    mapping(address => uint256) public trustScores;

    /// @dev Maps loan IDs to their corresponding Loan structs
    mapping(uint256 => Loan) public loans;

    /// @dev Counter to generate unique loan IDs, starts at 0
    uint256 public loanCounter;

    /// @dev Emitted when a borrower requests a new loan
    event LoanRequested(
        address indexed borrower,
        uint256 amount,
        uint256 loanId
    );

    /// @dev Emitted when a borrower successfully repays a loan
    event LoanRepaid(
        address indexed borrower,
        uint256 loanId,
        uint256 newScore
    );

    /// @dev Initializes the contract setting the deployer as the owner
    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Calculate due date based on loan amount
     * Smaller loans → shorter period, larger loans → longer period
     */
    function calculateDueDate(uint256 _amount) internal view returns (uint256) {
        uint256 baseTime = 3 days;
        uint256 extraTime = (_amount / 1 ether) * 1 days; // +1 day per 1 ether
        return block.timestamp + baseTime + extraTime;
    }

    /**
     * @notice Request a new loan
     * @param _amount The amount of the loan in wei
     */
    function requestLoan(uint256 _amount) external {
        loanCounter++;
        uint256 due = calculateDueDate(_amount);

        loans[loanCounter] = Loan({
            borrower: msg.sender,
            amount: _amount,
            repaid: false,
            dueDate: due,
            penalized: false
        });

        emit LoanRequested(msg.sender, _amount, loanCounter);
    }

    /**
     * @notice Repay an existing loan
     * @param _loanId The ID of the loan
     */
    function repayLoan(uint256 _loanId) external payable {
        Loan storage loan = loans[_loanId];

        require(msg.sender == loan.borrower, "Not borrower");
        require(!loan.repaid, "Already repaid");
        require(msg.value >= loan.amount, "Insufficient payment");

        // Mark loan as repaid
        loan.repaid = true;

        // Check for late repayment
        if (block.timestamp > loan.dueDate) {
            if (trustScores[msg.sender] >= 5) {
                trustScores[msg.sender] -= 5; // late repayment penalty
            } else {
                trustScores[msg.sender] = 0;
            }
            loan.penalized = true;
        } else {
            // On-time repayment reward
            trustScores[msg.sender] += 10;
        }

        // Handle ETH transfer
        uint256 excess = msg.value - loan.amount;
        if (excess > 0) {
            payable(msg.sender).transfer(excess); // return excess to borrower
        }
        payable(owner).transfer(loan.amount); // send loan amount to owner

        emit LoanRepaid(msg.sender, _loanId, trustScores[msg.sender]);
    }

    /**
     * @notice Penalize an overdue loan that has not been repaid
     * @param _loanId The ID of the loan
     */
    function penalizeOverdue(uint256 _loanId) external {
        Loan storage loan = loans[_loanId];

        require(!loan.repaid, "Already repaid");
        require(!loan.penalized, "Penalty already applied");
        require(block.timestamp > loan.dueDate, "Loan not overdue");

        if (trustScores[loan.borrower] >= 5) {
            trustScores[loan.borrower] -= 5;
        } else {
            trustScores[loan.borrower] = 0;
        }

        loan.penalized = true;
    }
}
