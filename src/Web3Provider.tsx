import { useMagic } from "./provider";
import { ethers } from "ethers";
import React, {
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Cookies from "js-cookie";
import { LOGGED_MAGIC, MAGIC_AUTH } from "./constants/common";
import { Magic, MarketPlaceInfo, NFTInfo } from "./types";

const Web3Context = React.createContext<{
  ethersProvider: ethers.BrowserProvider | null;
  ethersSigner: ethers.JsonRpcSigner | null;
  marketContract: ethers.Contract | null;
  nftContract: ethers.Contract | null;
  loginMagic: ((props: LoginMagicType) => Promise<void>) | null;
  verifyOTPMagic: ((otp: string, onLocked: () => void) => Promise<void>) | null;
  isLoggedMagic: boolean;
  isSendingOTP: boolean;
  setIsSendingOTP: React.Dispatch<React.SetStateAction<boolean>>;
  setIsVerifyingOTP: React.Dispatch<React.SetStateAction<boolean>>;
  isVerifyingOTP: boolean;
  disconnectWallet: () => Promise<void>;
  magic: Magic | null;
  cancelVerify: () => Promise<void>;
  checkLoggedInMagic: () => Promise<boolean>;
}>({
  ethersProvider: null,
  ethersSigner: null,
  marketContract: null,
  nftContract: null,
  loginMagic: null,
  isLoggedMagic: false,
  verifyOTPMagic: null,
  isSendingOTP: false,
  isVerifyingOTP: false,
  disconnectWallet: () => Promise.resolve(),
  setIsSendingOTP: () => {},
  setIsVerifyingOTP: () => {},
  magic: null,
  cancelVerify: () => Promise.resolve(),
  checkLoggedInMagic: () => Promise.resolve(false),
});

export const useWeb3 = () => useContext(Web3Context);

type AuthenticationProviderProps = {
  children: React.ReactNode;
};

type LoginMagicType = {
  email: string;
  onSuccess?: () => void;
  onFail?: () => void;

  onOTPSent?: () => void;
  onVerifyOTPFail?: () => void;
  onExpiredEmailOTP?: () => void;
  onLoginThrottled?: () => void;
  onDone?: (result?: string | null) => void;
  onError?: (reason: any) => void;
  onIdTokenCreated?: (idToken: string) => void;
};

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
  const [isLoggedMagic, setLoggedMagic] = useState<boolean>(
    Boolean(Cookies.get(LOGGED_MAGIC))
  );

  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);

  const [otpCount, setOTPCount] = useState(0);

  const {
    magic,
    loginEmailOTP,
    checkLoggedInMagic,
    logout: logoutMagic,
    verifyOTP,
    cancelVerify,
  } = useMagic();

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
          showUI: false,
          deviceCheckUI: false,
          events: {
            "email-otp-sent": () => onOTPSent?.(),
            "invalid-email-otp": () => onVerifyOTPFail?.(),
            "expired-email-otp": () => onExpiredEmailOTP?.(),
            "login-throttled": () => onLoginThrottled?.(),
            done: (result) => onDone?.(result),
            error: (reason) => onError?.(reason),
            "Auth/id-token-created": (idToken) => onIdTokenCreated?.(idToken),
          },
        });
        if (!didToken) {
          return;
        }

        Cookies.set(MAGIC_AUTH, JSON.stringify({ token: didToken }));
        setLoggedMagic(true);
        onSuccess?.();
        setIsSendingOTP(false);
      } catch (err: any) {
        const msg = err?.message;
        onFail?.();
        setIsSendingOTP(false);
      }
    },
    [loginEmailOTP]
  );

  const verifyOTPMagic = useCallback(
    async (otp: string, onLocked?: () => void) => {
      if (otp.length !== 6) return;

      const count = otpCount + 1;
      setOTPCount(count);

      if (count >= 3) {
        setIsVerifyingOTP(false);
        onLocked?.();
        cancelVerify?.();
        return;
      }

      try {
        setIsVerifyingOTP(true);
        const result = await verifyOTP?.(otp);
        return result;
      } catch {
        setIsVerifyingOTP(false);
      } finally {
        setIsVerifyingOTP(false);
      }
    },
    [verifyOTP, otpCount]
  );

  const disconnectWallet = useCallback(async () => {
    if (magic) {
      await logoutMagic();
      setLoggedMagic(false);
      Cookies.remove(MAGIC_AUTH);
    }
  }, [magic, logoutMagic]);

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
    if (magic) {
      const checkWalletConnection = async () => {
        try {
          const logged = await checkLoggedInMagic();
          setLoggedMagic(logged);
          if (logged) {
            Cookies.set(LOGGED_MAGIC, "true");
          } else {
            Cookies.remove(LOGGED_MAGIC);
          }
        } catch (error) {}
      };

      checkWalletConnection();
    }
  }, [magic]);

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
      setIsSendingOTP,
      setIsVerifyingOTP,
      verifyOTPMagic,
      isSendingOTP,
      isVerifyingOTP,
      cancelVerify: cancelVerify ?? (() => Promise.resolve()),
      checkLoggedInMagic,
    }),
    [
      magic,
      verifyOTP,
      disconnectWallet,
      ethersProvider,
      ethersSigner,
      isLoggedMagic,
      loginMagic,
      marketContract,
      nftContract,
      verifyOTPMagic,
      isSendingOTP,
      isVerifyingOTP,
      setIsSendingOTP,
      setIsVerifyingOTP,
      cancelVerify,
      checkLoggedInMagic,
    ]
  );

  return <Web3Context.Provider value={values}>{children}</Web3Context.Provider>;
}

export default Web3Provider;
