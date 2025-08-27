import { useMagic } from "./provider";
import { BigNumberish, ethers } from "ethers";
import React, {
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Cookies from "js-cookie";
import { LOGGED_MAGIC, MAGIC_AUTH } from "./constants/common";
import {  LoginMagicType, MarketPlaceInfo, NFTInfo, Web3ContextType } from "./types";

export const Web3Context = React.createContext<Web3ContextType>({
  magic: null,
  ethersProvider: null,
  ethersSigner: null,
  marketContract: null,
  nftContract: null,
  loginMagic: null,
  verifyOTPMagic: null,
  isSendingOTP: false,
  isVerifyingOTP: false,
  disconnectWallet: async () => {},
  cancelVerify: async () => ({ status: "no_flow", reason: "not_initialized" }),
  checkLoggedInMagic: async () => false,
  convertBalance: () => "",
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
  const [ethersSigner, setEtherSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [marketContract, setMarketContract] = useState<ethers.Contract | null>(null);
  const [nftContract, setNftContract] = useState<ethers.Contract | null>(null);

  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);

  const {
    magic,
    isLoggedIn,
    loginEmailOTP,
    checkLoggedInMagic,
    logout: logoutMagic,
    verifyOTP,
    cancelVerify,
    convertBalance
  } = useMagic();

  const isLoggedMagic = Boolean(isLoggedIn)

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
              onOTPSent?.()
            },
            "invalid-email-otp": () => {
              setIsVerifyingOTP(false);
              onVerifyOTPFail?.()
            },
            "expired-email-otp": () => {
              setIsVerifyingOTP(false);
              onExpiredEmailOTP?.()
            },
            "login-throttled": () => {
              onLoginThrottled?.()
              setIsSendingOTP(false);
              setIsVerifyingOTP(false);
            },
            done: (result) => {
              setIsSendingOTP(false);
              setIsVerifyingOTP(false);
              onDone?.(result)
            },
            error: (reason) => {
              setIsSendingOTP(false);
              setIsVerifyingOTP(false);
              onError?.(reason)
            },
            "Auth/id-token-created": (idToken) => onIdTokenCreated?.(idToken),
          },
        });
        if (!didToken) {
          return;
        }
        Cookies.set(MAGIC_AUTH, JSON.stringify({ token: didToken }));
        onSuccess?.();
      } catch (err: any) {
        console.log(err)
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
      try {
        const result = await verifyOTP?.(otp);
        return result;
      } finally {
        setIsVerifyingOTP(false);
      }
    },
    [verifyOTP]
  );

  const disconnectWallet = useCallback(async () => {
    if (magic) {
      await logoutMagic();
      Cookies.remove(MAGIC_AUTH);
    }
  }, [magic, logoutMagic]);
  
// =======================================
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

  useEffect(() => {
    if (!magic || !isLoggedMagic) {
      setEtherProvider(null);
      setEtherSigner(null);
      setMarketContract(null);
      setNftContract(null);
      return;
    }

    let mounted = true;

    const initEthers = async () => {
      const provider = new ethers.BrowserProvider(magic.rpcProvider as any);
      const signer = await provider.getSigner();
      const market = new ethers.Contract(
        MarketPlaceInfo.address,
        MarketPlaceInfo.abi,
        signer
      );
      const nft = new ethers.Contract(
        NFTInfo.address,
        NFTInfo.abi,
        signer
      );

      if (!mounted) return;
      setEtherProvider(provider);
      setEtherSigner(signer);
      setMarketContract(market);
      setNftContract(nft);
    };

    void initEthers();
    return () => {
      mounted = false;
    };
  }, [magic, isLoggedMagic, MarketPlaceInfo, NFTInfo]);

// ==============================================
useEffect(() => {
    if (!magic) return;
    void checkLoggedInMagic();
  }, [magic, checkLoggedInMagic]);

  const values = useMemo(
    () => ({
      magic,
      verifyOTP,
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
      cancelVerify: cancelVerify ?? (() => Promise.resolve()),
      checkLoggedInMagic,
      convertBalance
    }),
    [
      magic,
      verifyOTP,
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
      cancelVerify,
      checkLoggedInMagic,
      convertBalance
    ]
  );

  return <Web3Context.Provider value={values}>{children}</Web3Context.Provider>;
}

export default Web3Provider;
