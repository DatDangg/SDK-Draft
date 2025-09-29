import { ethers } from "ethers";
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
  disconnectWallet: async () => { },
  magic: null,
  cancelVerify: async () => ({ status: "no_flow", reason: "not_initialized" }),
  checkLoggedInMagic: async () => false,
  getUserIdToken: async () => null,
  convertBalance: () => "",
  listNFT: () => Promise.resolve(),
  getEthBalance: async () => ({ address: "", balanceEth: "0" }),
  estimateTransfer: async () => ({ gasLimit: 0n, gasPrice: 0n, value: 0n }),
  transferETH: async () => {
    throw new Error(
      "Web3Context not initialized: transferETH is unavailable outside Provider"
    );
  },
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

  const listNFT = useCallback(
    async ({
      tokenSell = "0x0000000000000000000000000000000000000000",
      tokenId,
      amount,
      price,
      privateBuyer = [],
    }: {
      tokenSell?: string;
      tokenId: string | bigint | number;
      amount: string | bigint | number;
      price: string;
      privateBuyer?: string[];
    }) => {
      if (!marketContract || !nftContract) return;

      try {
        const priceInWei = ethers.parseEther(price);

        const tx = await marketContract.listToken(
          NFTInfo.address,
          tokenSell,
          tokenId,
          amount,
          priceInWei,
          privateBuyer
        );

        const receipt = await tx.wait();
        return receipt;
      } catch (error) {
        console.error("❌ Error listing NFT:", error);
        throw error;
      }
    },
    [marketContract, NFTInfo, nftContract]
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

      const { gasLimit, gasPrice, value } = await estimateTransfer(
        to,
        amountEth
      );

      const txRequest = { to, value, gasLimit, gasPrice } as const;

      const tx = await ethersSigner.sendTransaction(txRequest);

      const receipt = await tx.wait();

      if (!receipt || receipt.status !== 1) {
        console.warn(
          "⚠️ Transaction mined nhưng không thành công (status !== 1):",
          receipt
        );
      }
      return receipt;
    },
    [ethersSigner, estimateTransfer]
  );

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
      listNFT,
      getEthBalance,
      estimateTransfer,
      transferETH: transferETH as any,
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
      listNFT,
      getEthBalance,
      estimateTransfer,
      transferETH,
    ]
  );

  return <Web3Context.Provider value={values}>{children}</Web3Context.Provider>;
}

export default Web3Provider;
