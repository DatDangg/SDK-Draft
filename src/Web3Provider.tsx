import { ContractTransactionResponse, ethers } from "ethers";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useMagic } from "./provider";
import {
  LoginMagicType,
  ListNFTonMarketType,
  MarketPlaceInfo,
  NFTInfo,
  Web3ContextType,
} from "./types";

const Web3Context = React.createContext<Web3ContextType>({
  ethersProvider: null,
  ethersSigner: null,
  marketContract: null,
  nftContract: null,
  loginMagic: null,
  verifyOTPMagic: null,
  isSendingOTP: false,
  isVerifyingOTP: false,
  isLoggedMagic: false,
  disconnectWallet: async () => {},
  magic: null,
  cancelVerify: async () => ({ status: "no_flow", reason: "not_initialized" }),
  checkLoggedInMagic: async () => false,
  getUserIdToken: async () => null,
  convertBalance: () => "",
  listNFTonMarket: () => Promise.resolve({ listingId: "", txHash: "" }),
  delistNFTfromMarket: () => Promise.resolve(""),
  getEthBalance: async () => ({ address: "", balanceEth: "0" }),
  estimateTransfer: async () => ({ gasLimit: 0n, gasPrice: 0n, value: 0n }),
  transferETH: async () => {
    throw new Error(
      "Web3Context not initialized: transferETH is unavailable outside Provider"
    );
  },
  getListNFTGasEstimate: async () => Promise.resolve(null),
  address: null,
});

export const useWeb3 = () => useContext(Web3Context);

function Web3Provider({
  MarketPlaceInfo,
  NFTInfo,
  children,
}: {
  MarketPlaceInfo: MarketPlaceInfo;
  NFTInfo: NFTInfo;
  children: React.ReactNode;
}) {
  const [ethersProvider, setEtherProvider] =
    useState<ethers.BrowserProvider | null>(null);
  const [ethersSigner, setEtherSigner] = useState<ethers.JsonRpcSigner | null>(
    null
  );
  const [marketContract, setMarketContract] = useState<ethers.Contract | null>(
    null
  );
  const [nftContract, setNftContract] = useState<ethers.Contract | null>(null);

  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);

  const [address, setAddress] = useState<string | null>(null);

  const {
    magic,
    loginEmailOTP,
    checkLoggedInMagic,
    logout: logoutMagic,
    verifyOTP,
    cancelVerify,
    getUserIdToken,
    convertBalance,
    isLoggedIn,
  } = useMagic();

  const isLoggedMagic = useMemo(() => {
    return Boolean(isLoggedIn);
  }, [isLoggedIn]);

  const loginMagic = useCallback(
    async ({
      email,
      onSuccess,
      onFail,
      onOTPSent,
      onVerifyOTPFail,
      onExpiredEmailOTP,
      onLoginThrottled,
      onDone,
      onError,
      onIdTokenCreated,
    }: LoginMagicType) => {
      try {
        setIsSendingOTP(true);
        const didToken = await loginEmailOTP({
          email,
          events: {
            "email-otp-sent": () => {
              setIsSendingOTP(false);
              onOTPSent?.();
            },
            "invalid-email-otp": () => {
              setIsVerifyingOTP(false);
              onVerifyOTPFail?.();
            },
            "expired-email-otp": () => {
              setIsVerifyingOTP(false);
              onExpiredEmailOTP?.();
            },
            "login-throttled": () => {
              onLoginThrottled?.();
              setIsSendingOTP(false);
              setIsVerifyingOTP(false);
            },
            done: (result) => {
              setIsSendingOTP(false);
              setIsVerifyingOTP(false);
              onDone?.(result);
            },
            error: (reason) => {
              setIsSendingOTP(false);
              setIsVerifyingOTP(false);
              onError?.(reason);
            },
            "Auth/id-token-created": (idToken) => onIdTokenCreated?.(idToken),
          },
        });
        if (!didToken) {
          return;
        }
        onSuccess?.();
      } catch (err: any) {
        console.log(err);
        onFail?.();
        setIsSendingOTP(false);
      }
    },
    [loginEmailOTP]
  );

  const verifyOTPMagic = useCallback(
    async (otp: string) => {
      if (otp.length !== 6) return;
      setIsVerifyingOTP(true);
      const result = await verifyOTP?.(otp);
      return result;
    },
    [verifyOTP]
  );

  const disconnectWallet = useCallback(async () => {
    if (magic) {
      await logoutMagic();
    }
  }, [magic, logoutMagic]);

  // create listing function

  const listNFTonMarket = useCallback(
    async ({
      tokenSell = "0x0000000000000000000000000000000000000000",
      tokenId,
      amount = 1,
      price,
      privateBuyer = [],
    }: ListNFTonMarketType) => {
      try {
        if (!marketContract || !nftContract)
          throw new Error("Contract not initialized");
        const priceInWei = ethers.parseEther(price);

        const tx: ContractTransactionResponse = await marketContract.listToken(
          NFTInfo.address,
          tokenSell,
          tokenId,
          amount,
          priceInWei,
          privateBuyer
        );

        const receipt = await tx.wait();
        if (!receipt || receipt.status !== 1) {
          throw new Error("Error parsing transaction");
        }
        const txHash: string = receipt.hash;
        const listingId: string = await parseListingId(receipt);
        return { listingId, txHash };
      } catch (error) {
        throw error;
      }
    },
    [marketContract, NFTInfo, nftContract]
  );

  // cancel listing function

  const delistNFTfromMarket = useCallback(
    async (tokenId: string | bigint | number) => {
      if (!marketContract) throw new Error("Contract not initialized");

      try {
        const tx: ContractTransactionResponse =
          await marketContract.deleteListing(tokenId);

        const receipt = await tx.wait();
        if (!receipt || receipt.status !== 1) {
          throw new Error("Error passing transaction");
        }
        if (!receipt || receipt.status !== 1) {
          throw new Error("Transaction failed. Please try again.");
        }
        return receipt.hash as string;
      } catch (error) {
        throw error;
      }
    },
    [marketContract, NFTInfo]
  );

  // get gas price for listing
  const getListNFTGasEstimate = useCallback(
    async (props: ListNFTonMarketType) => {
      const {
        tokenId,
        price,
        tokenSell = ethers.ZeroAddress,
        amount = 1,
        privateBuyer = [],
      } = props;
      try {
        if (
          !marketContract ||
          !nftContract ||
          !ethersSigner ||
          !ethersProvider ||
          !NFTInfo?.address
        ) {
          throw new Error("Missing dependencies");
        }
        if (!price || Number(price) <= 0) throw new Error("Invalid price");

        const from = await ethersSigner.getAddress();
        const priceInWei = ethers.parseEther(price);

        if (
          (await nftContract.ownerOf(String(tokenId))).toLowerCase() !==
          from.toLowerCase()
        ) {
          throw new Error("Signer is not token owner");
        }

        let approved = await nftContract.isApprovedForAll(
          from,
          marketContract.target
        );
        if (!approved) {
          const singleApproval = await nftContract
            .getApproved(String(tokenId))
            .catch(() => null);
          approved =
            singleApproval?.toLowerCase() ===
            String(marketContract.target).toLowerCase();
        }
        if (!approved) {
          await nftContract
            .approve(marketContract.target, String(tokenId))
            .catch(() =>
              nftContract.setApprovalForAll(marketContract.target, true)
            )
            .then((tx) => tx.wait());
        }

        const data = marketContract.interface.encodeFunctionData("listToken", [
          NFTInfo.address,
          tokenSell,
          String(tokenId),
          amount,
          priceInWei,
          privateBuyer,
        ]);

        const estimatedGas = await ethersProvider.estimateGas({
          to: marketContract.target,
          from,
          data,
        });
        const gasPrice = (await ethersProvider.getFeeData()).gasPrice;

        return {
          // estimatedGas,
          gasPrice,
          totalCost: gasPrice ? estimatedGas * gasPrice : null,
          totalCostInEth: gasPrice
            ? convertBalance(estimatedGas * gasPrice, "wei", "ether")
            : null,
        };
      } catch (error) {
        console.error("Error estimating gas for listing NFT:", error);
        return null;
      }
    },
    [marketContract, nftContract, NFTInfo, ethersSigner, ethersProvider]
  );
  // ---------- ETH helpers ----------
  const getEthBalance = useCallback(async () => {
    if (!ethersSigner)
      throw new Error("No signer available. Please login first.");
    const address = await ethersSigner.getAddress();
    const balWei = await ethersSigner.provider!.getBalance(address);
    return { address, balanceEth: ethers.formatEther(balWei) };
  }, [ethersSigner]);

  const estimateTransfer = useCallback(
    async (to: string, amountEth: string) => {
      if (!ethersSigner)
        throw new Error("No signer available. Please login first.");
      if (!ethers.isAddress(to)) throw new Error("Invalid recipient address");
      const n = Number(amountEth);
      if (!Number.isFinite(n) || n <= 0) throw new Error("Invalid amount");

      const provider = ethersSigner.provider!;
      const value = ethers.parseEther(amountEth);

      try {
        const gasLimit = await provider
          .estimateGas({ to, value })
          .catch(() => 21_000n);
        const fee = await provider.getFeeData();
        const gasPrice =
          fee.gasPrice ?? BigInt(await provider.send("eth_gasPrice", []));

        return { gasLimit, gasPrice, value };
      } catch (error) {
        console.error("❌ Error estimating transfer:", error);
        throw new Error("Failed to estimate gas for the transaction");
      }
    },
    [ethersSigner]
  );

  const transferETH = useCallback(
    async (to: string, amountEth: string) => {
      if (!ethersSigner) {
        throw new Error("Please login first to transfer ETH");
      }

      const provider = ethersSigner.provider!;
      const from = await ethersSigner.getAddress();

      // 1. calculate value
      const value = ethers.parseEther(amountEth);

      // 2. get fee
      const feeData = await provider.getFeeData();
      if (!feeData.maxFeePerGas || !feeData.maxPriorityFeePerGas) {
        throw new Error("Network does not provide EIP-1559 fee data");
      }

      // 3. up fee to 20%
      const gasMultiplier = 1.2;
      const maxFeePerGas = BigInt(
        Math.floor(Number(feeData.maxFeePerGas) * gasMultiplier)
      );
      const maxPriorityFeePerGas = BigInt(
        Math.floor(Number(feeData.maxPriorityFeePerGas) * gasMultiplier)
      );

      // 4. Estimate gas
      let gasLimit = 21000n; // default
      try {
        gasLimit = await provider.estimateGas({ to, value });
      } catch {
        // fallback 21000 estimate fail
      }

      // 5. tx request
      const txRequest = {
        to,
        value,
        type: 2, // EIP-1559
        gasLimit,
        maxFeePerGas,
        maxPriorityFeePerGas,
      };

      const tx = await ethersSigner.sendTransaction(txRequest);
      console.log("Transaction hash:", tx.hash);

      let receipt;
      try {
        receipt = await tx.wait(1, 60000);
      } catch (err) {
        console.warn(
          "Transaction not mined after 60s. You may retry manually.",
          err
        );
        return tx;
      }

      if (!receipt || receipt.status !== 1) {
        console.warn(
          "⚠️ Transaction mined nhưng không thành công (status !== 1):",
          receipt
        );
      } else {
        const egp = (receipt as any)?.effectiveGasPrice as bigint | undefined;
        const feePaid = egp
          ? ethers.formatEther((receipt.gasUsed ?? 0n) * egp)
          : "Unknown";
        console.log("Fee paid (ETH):", feePaid);
      }

      return receipt;
    },
    [ethersSigner]
  );

  async function parseListingId(receipt: any) {
    const iface = new ethers.Interface(MarketPlaceInfo.abi);

    for (const log of receipt.logs) {
      try {
        const parsedLog = iface.parseLog(log);
        if (parsedLog && parsedLog.name === "TokenListed") {
          // console.log('Contract Address:', parsedLog.args.contractAddress);
          // console.log('ListingId:', parsedLog.args.listingId.toString());
          return parsedLog.args.listingId.toString();
        }
      } catch (err) {
        throw new Error("Failed to parse logs from transaction receipt");
      }
    }
  }

  useEffect(() => {
    if (nftContract && magic) {
      const checkApprovedContract = async () => {
        const isApproved = await nftContract.isApprovedForAll(
          ethersSigner?.address,
          MarketPlaceInfo.address
        );
        if (isApproved) return;
        nftContract.setApprovalForAll(MarketPlaceInfo.address, true);
        return;
      };

      checkApprovedContract();
    }
  }, []);

  useEffect(() => {
    if (magic && isLoggedMagic) {
      const checkEthers = async () => {
        const provider = new ethers.BrowserProvider(magic.rpcProvider as any);
        const signer = await provider.getSigner();
        const marketContract = new ethers.Contract(
          MarketPlaceInfo.address,
          MarketPlaceInfo.abi,
          signer
        );
        const nftContract = new ethers.Contract(
          NFTInfo.address,
          NFTInfo.abi,
          signer
        );

        setEtherProvider(provider);
        setEtherSigner(signer);
        setMarketContract(marketContract);
        setNftContract(nftContract);
        const localAddress = await signer.getAddress();
        setAddress(localAddress);
      };
      checkEthers();
    }
  }, [magic, isLoggedMagic]);

  const values = useMemo(
    () => ({
      magic,
      ethersProvider,
      ethersSigner,
      marketContract,
      nftContract,
      loginMagic,
      isLoggedMagic,
      disconnectWallet,
      verifyOTPMagic,
      isSendingOTP,
      isVerifyingOTP,
      cancelVerify: cancelVerify,
      checkLoggedInMagic,
      getUserIdToken,
      convertBalance,
      listNFTonMarket,
      delistNFTfromMarket,
      getEthBalance,
      estimateTransfer,
      transferETH: transferETH as any,
      getListNFTGasEstimate,
      address,
    }),
    [
      magic,
      ethersProvider,
      ethersSigner,
      marketContract,
      nftContract,
      loginMagic,
      disconnectWallet,
      verifyOTPMagic,
      isSendingOTP,
      isLoggedMagic,
      isVerifyingOTP,
      cancelVerify,
      checkLoggedInMagic,
      getUserIdToken,
      convertBalance,
      listNFTonMarket,
      delistNFTfromMarket,
      getEthBalance,
      estimateTransfer,
      transferETH,
      getListNFTGasEstimate,
      address,
    ]
  );

  return <Web3Context.Provider value={values}>{children}</Web3Context.Provider>;
}

export default Web3Provider;
