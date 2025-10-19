import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { contractAddress, contractABI } from "./contractInfo";
import "./App.css";

function App() {
  const [account, setAccount] = useState(null);
  const [isMinting, setIsMinting] = useState(false);
  const [message, setMessage] = useState("");

  const MOONBASE_CHAIN_ID = "0x507";
  const MOONBASE_PARAMS = {
    chainId: MOONBASE_CHAIN_ID,
    chainName: "Moonbase Alpha",
    rpcUrls: ["https://rpc.api.moonbase.moonbeam.network"],
    nativeCurrency: {
      name: "DEV",
      symbol: "DEV",
      decimals: 18,
    },
    blockExplorerUrls: ["https://moonbase.moonscan.io/"],
  };

  // 🧩 Connect wallet + ensure correct network
  const connectWallet = async () => {
    if (!window.ethereum) {
      setMessage("Please install MetaMask to use this dApp!");
      return;
    }

    try {
      // Try switching to Moonbase
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: MOONBASE_CHAIN_ID }],
      });
    } catch (switchError) {
      // If not added yet, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [MOONBASE_PARAMS],
          });
        } catch (addError) {
          setMessage("Error adding Moonbase Alpha: " + addError.message);
          return;
        }
      } else {
        setMessage("Error switching network: " + switchError.message);
        return;
      }
    }

    // Request wallet access
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);
      setMessage("");
    } catch (accountsError) {
      setMessage("Error connecting wallet: " + accountsError.message);
    }
  };

  // 🎨 Mint NFT logic
  const mintNft = async () => {
    if (!account) {
      setMessage("Please connect your wallet first.");
      return;
    }

    setIsMinting(true);
    setMessage("Preparing transaction...");

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      const achievementId = ethers.encodeBytes32String("job-logo-design-007");
      const tokenURI = "https://scarlet-gentle-chimpanzee-964.mypinata.cloud/ipfs/bafkreihqpcmmbygmdbjp34ply7oi4xyjfxwhiqyvmptzydf7loqhoc54ni";

      setMessage("Please approve the transaction in your wallet...");
      const tx = await contract.safeMint(account, tokenURI, achievementId);

      setMessage("Minting in progress... waiting for confirmation.");
      await tx.wait();

      setMessage(`✅ Success! Your CRED NFT was minted. Tx: ${tx.hash}`);
    } catch (error) {
      console.error(error);
      setMessage("❌ Minting failed: " + (error.reason || error.message));
    } finally {
      setIsMinting(false);
    }
  };

  // 🔄 Handle account/network changes + auto-connect
  useEffect(() => {
    if (!window.ethereum) return;

    const init = async () => {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      } catch (error) {
        console.warn("Wallet check failed:", error);
      }
    };

    init();

    const handleAccountsChanged = (accounts) => {
      if (accounts.length > 0) {
        setAccount(accounts[1]);
      } else {
        setAccount(null);
        setMessage("Wallet disconnected.");
      }
    };

    const handleChainChanged = () => {
      window.location.reload(); // Refresh app on chain change
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>TrustFi Decentralized Gigs</h1>
        <p>Complete a gig, earn a credential NFT.</p>

        {account ? (
          <div>
            <p>
              Connected:{" "}
              {`${account.substring(0, 6)}...${account.substring(
                account.length - 4
              )}`}
            </p>
            <button onClick={mintNft} disabled={isMinting}>
              {isMinting ? "Minting..." : 'Claim "Good Work" CRED'}
            </button>
          </div>
        ) : (
          <button onClick={connectWallet}>Connect Wallet</button>
        )}

        {message && <p className="message">{message}</p>}
      </header>
    </div>
  );
}

export default App;
