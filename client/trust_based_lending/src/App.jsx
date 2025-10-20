import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { contractAddress, contractABI } from "./contractInfo"; // Make sure you copied this file
import "./App.css"; // Make sure you copied this file

function App() {
  const [account, setAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [hasCredential, setHasCredential] = useState(false);

  // --- Wallet Connection Logic ---
  const connectWallet = async () => {
    if (!window.ethereum) {
      setMessage("Please install MetaMask to use this dApp!");
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
      // After connecting, immediately check for the credential
      checkCredential(accounts[0]);
    } catch (error) {
      setMessage("Error connecting wallet: " + error.message);
    }
  };

  // --- NEW: Read-Only Logic to Check for NFT Balance ---
  const checkCredential = async (userAddress) => {
    if (!userAddress) return;

    setIsLoading(true);
    setMessage("Checking your TrustFi credentials on the blockchain...");
    setHasCredential(false);

    try {
      // For read-only calls, we don't need a signer, just a provider.
      // This is more efficient and doesn't require the user to be on the right network initially.
      const provider = new ethers.JsonRpcProvider("https://rpc.api.moonbase.moonbeam.network" );
      const contract = new ethers.Contract(contractAddress, contractABI, provider);

      // Call the 'balanceOf' function from the ERC721 standard.
      // This function is free to call (it's a 'view' function).
      const balance = await contract.balanceOf(userAddress);

      // The balance is a BigInt, so we check if it's greater than 0.
      if (balance > 0) {
        setHasCredential(true);
        setMessage(`✅ Verified! You hold ${balance.toString()} CRED token(s).`);
      } else {
        setHasCredential(false);
        setMessage("No TrustFi credentials found in your wallet.");
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Error checking credentials: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- useEffect to handle auto-connection and account changes ---
  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            checkCredential(accounts[0]);
          }
        } catch (err) {
          console.error("Could not auto-connect:", err);
        }
      }
    };
    init();

    // Listen for account changes
    window.ethereum?.on("accountsChanged", (accounts) => {
      const newAccount = accounts[0] || null;
      setAccount(newAccount);
      if (newAccount) {
        checkCredential(newAccount);
      } else {
        // If disconnected, reset the state
        setHasCredential(false);
        setMessage("Wallet disconnected. Please connect to check eligibility.");
      }
    });
  }, []);
  return (
    <div className="App">
      <header className="App-header">
        <h1>TrustFi Lending</h1>
        <p>Unlock better loan rates with your on-chain reputation.</p>
        {!account ? (
          <button onClick={connectWallet}>Connect Wallet</button>
        ) : (
          <div className="content-wrapper">
            <p>Connected: {`${account.substring(0, 6)}...${account.substring(account.length - 4)}`}</p>
            {isLoading ? (
              <p className="message">Checking credentials...</p>
            ) : hasCredential ? (
              <div className="offer-box success">
                <h2>Congratulations! You're Eligible!</h2>
                <p>Because you hold a TrustFi Credential, you qualify for our premium loan terms.</p>
                <p><strong>Interest Rate: 3%</strong> (Standard: 5%)</p>
                <button>Apply for Loan</button>
              </div>
            ) : (
              <div className="offer-box error">
                <h2>❌ You're Not Eligible!</h2>
                <p>To qualify for TrustFi Lending, please acquire a TrustFi Credential.</p>
              </div>
            )}
          </div>
        )}
        {/* Display a persistent message if not loading */}
        {!isLoading && message && <p className="message">{message}</p>}
        </header>
    </div>
  );
}

export default App;