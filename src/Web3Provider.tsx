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
  ethersProvider: null,
  ethersSigner: null,
  marketContract: null,
  nftContract: null,
  loginMagic: null,
  verifyOTPMagic: null,
  isLoggedMagic: false,
  isSendingOTP: false,
  isVerifyingOTP: false,
  disconnectWallet: async () => {},
  magic: null,
  cancelVerify: async () => ({ status: "no_flow", reason: "not_initialized" }),
  checkLoggedInMagic: async () => false,
  resetOTPCount: () => {},
  getUserIdToken: async () => null,
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
  const [isLoggedMagic, setLoggedMagic] = useState<boolean>(Boolean(Cookies.get(LOGGED_MAGIC)));

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
    getUserIdToken,
    convertBalance
  } = useMagic();

  const resetOTPCount = useCallback(() => {
    setOTPCount(0);
  }, []);

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
        setLoggedMagic(true);
        onSuccess?.();
        setOTPCount(0);
      } catch (err: any) {
        console.log(err)
        onFail?.();
        setIsSendingOTP(false);
      }
    },
    [loginEmailOTP]
  );
  const callIdRef = React.useRef(0);
const verifyOTPMagic = useCallback(
    async (otp: string) => {

      if (otp.length !== 6) {
        // không bật loading vì chưa verify
        return { ok: false, reason: "OTP_INVALID_LENGTH" as const };
      }
      if (!verifyOTP) {
        return { ok: false, reason: "VERIFY_FN_MISSING" as const };
      }

      setIsVerifyingOTP(true);
      const myCall = ++callIdRef.current;

      try {
        const res = await verifyOTP(otp); // giờ verifyOTP trả {ok: boolean, ...}
        if (myCall !== callIdRef.current) return { ok: false, reason: "STALE_RESULT" as const };
        // KHÔNG setIsVerifyingOTP(false) tại đây — vì các event (invalid, expired, done, error)
        // đã đảm nhiệm reset flag. Tuy nhiên, để chắc cú, ta vẫn hạ flag ở finally.
        return res;
      } catch (e) {
        return { ok: false, reason: "UNKNOWN_ERROR" as const };
      } finally {
        // fallback: nếu vì lý do gì events không bắn, vẫn hạ cờ cho lần gọi gần nhất
        if (myCall === callIdRef.current) setIsVerifyingOTP(false);
      }
    },
    [verifyOTP]
  );
  const disconnectWallet = useCallback(async () => {
    if (magic) {
      await logoutMagic();
      setLoggedMagic(false);
      Cookies.remove(MAGIC_AUTH);
      Cookies.remove(LOGGED_MAGIC);
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
  }, [magic, isLoggedMagic, MarketPlaceInfo, NFTInfo]);

// ==============================================
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
      resetOTPCount,
      getUserIdToken,
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
      resetOTPCount,
      getUserIdToken,
      convertBalance
    ]
  );

  return <Web3Context.Provider value={values}>{children}</Web3Context.Provider>;
}

export default Web3Provider;
