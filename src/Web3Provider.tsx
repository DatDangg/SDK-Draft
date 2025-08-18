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
import { MAGIC_AUTH } from "./constants/common";
import { boolean } from "yup";
import { MarketPlaceInfo, NFTInfo } from "./types";

const Web3Context = React.createContext<{
  ethersProvider: ethers.BrowserProvider | null;
  ethersSigner: ethers.JsonRpcSigner | null;
  marketContract: ethers.Contract | null;
  nftContract: ethers.Contract | null;
  loginMagic: ((props: LoginMagicType) => Promise<void>) | null;
  verifyOTPMagic:
    | ((
        otp: string,
        options: { step: string; onLocked: () => void }
      ) => Promise<void>)
    | null;
  isLoggedMagic: boolean;
  isSendingOTP: boolean;
  setIsSendingOTP: React.Dispatch<React.SetStateAction<boolean>>;
  isVerifyingOTP: boolean;
  disconnectWallet: () => Promise<void>;
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
  setIsSendingOTP: boolean,
});

export const useWeb3 = () => useContext(Web3Context);

type AuthenticationProviderProps = {
  children: React.ReactNode;
};

type LoginMagicType = {
  email: string;
  showUI: boolean;
  deviceCheckUI: boolean;
  onSuccess?: () => void;
  onFail?: () => void;

  onOTPSent?: () => void;
  onVerifyOTPFail?: () => void;
  onExpiredEmailOtp?: () => void;
  onLoginThrottled?: () => void;
  onDone?: (result?: string | null) => void;
  onError?: (reason: any) => void;
  onClosedByUser?: () => void;
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
  const [isLoggedMagic, setLoggedMagic] = useState<boolean>(false);

  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);

  const [otpCount, setOTPCount] = useState(0);

  const {
    magic,
    loginEmailOTP,
    checkLoggedInMagic,
    logout: logoutMagic,
    verifyOTP,
  } = useMagic();

  const loginMagic = useCallback(
    async ({
      email,
      showUI,
      deviceCheckUI,
      onSuccess,
      onFail,
      onOTPSent,
      onVerifyOTPFail,
      onExpiredEmailOtp,
      onLoginThrottled,
      onDone,
      onError,
      onClosedByUser,
      onIdTokenCreated,
    }: LoginMagicType) => {
      try {
        setIsSendingOTP(true);

        const didToken = await loginEmailOTP({
          email,
          showUI: showUI,
          deviceCheckUI: deviceCheckUI,
          events: {
            "email-otp-sent": () => onOTPSent?.(),
            "invalid-email-otp": () => onVerifyOTPFail?.(),
            "expired-email-otp": () => onExpiredEmailOtp?.(),
            "login-throttled": () => onLoginThrottled?.(),
            done: (result) => onDone?.(result),
            error: (reason) => onError?.(reason),
            "closed-by-user": () => onClosedByUser?.(),
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
    async (otp: string, options?: { step?: string; onLocked?: () => void }) => {
      const step = options?.step ?? "otp";
      if (step !== "otp" || otp.length !== 6) return;

      const count = otpCount + 1;
      setOTPCount(count);

      if (count >= 3) {
        setTimeout(() => {
          setIsSendingOTP(false);
          options?.onLocked?.();
        }, 3000);
        return;
      }

      try {
        setIsVerifyingOTP(true);
        const result = await verifyOTP?.(otp);
        setIsVerifyingOTP(false);
        return result;
      } catch {
        setIsVerifyingOTP(false);
      }
    },
    [verifyOTP]
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
        } catch (error) {}
      };

      checkWalletConnection();
    }
  }, [magic]);

  const values = useMemo(
    () => ({
      ethersProvider,
      ethersSigner,
      marketContract,
      nftContract,
      loginMagic,
      isLoggedMagic,
      disconnectWallet,
      setIsSendingOTP,
      verifyOTPMagic,
      isSendingOTP,
      isVerifyingOTP,
    }),
    [
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
    ]
  );

  return <Web3Context.Provider value={values}>{children}</Web3Context.Provider>;
}

export default Web3Provider;
