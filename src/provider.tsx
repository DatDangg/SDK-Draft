// src/provider.tsx
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { initMagic } from "./magicClient";
import type {
  LoginEmailOTPType,
  Magic,
  MagicContextValue,
  MarketPlaceInfo,
  NFTInfo,
} from "./types";
import Web3Provider from "./Web3Provider";

const MagicContext = createContext<MagicContextValue | undefined>(undefined);

export const useMagic = (): MagicContextValue => {
  const ctx = useContext(MagicContext);
  if (!ctx) throw new Error("useMagic must be used within MagicProvider");
  return ctx;
};

export const MagicProvider: React.FC<{
  children: ReactNode;
  MarketPlaceInfo: MarketPlaceInfo;
  NFTInfo: NFTInfo;
}> = ({ children, MarketPlaceInfo, NFTInfo }) => {
  const [magic, setMagic] = useState<Magic | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const flowRef = useRef<any>();

  // init once
  useEffect(() => {
    try {
      const m = initMagic('', '');
      setMagic(m);
    } catch (err) {
      // don't break apps; consumer may want to handle absence of magic
      console.warn("Magic init warning:", (err as Error).message);
      setMagic(null);
    }
  }, []);

  useEffect(() => {
    if (magic) {
      checkLoggedInMagic();
    }
  }, [magic]);

  const checkLoggedInMagic = async () => {
    try {
      const logged = await magic?.user.isLoggedIn();
      setIsLoggedIn(Boolean(logged));
      return Boolean(logged);
    } catch (err) {
      console.warn("isLoggedIn check failed", err);
      setIsLoggedIn(false);
    }
    setIsLoggedIn(false);
    return false;
  };

  const loginEmailOTP = async ({
    deviceCheckUI = false,
    email,
    events = {},
    showUI = false,
  }: LoginEmailOTPType) => {
    if (!magic) throw new Error("Magic not initialized");

    try {
      const flow = magic.auth.loginWithEmailOTP({
        email,
        deviceCheckUI,
        showUI,
      });
      flowRef.current = flow;
      Object.entries(events).forEach(([event, handler]) => {
        if (handler) flow.on(event as any, handler as any);
      });

      const token = await flow;

      if (token) {
        setIsLoggedIn(true);
      }

      return token || null;
    } catch (err) {
      console.error("login error", err);
      events.error?.(err);
      return null;
    } finally {
      flowRef.current = undefined;
    }
  };

  const verifyOTP = async (OTP: string) => {
    if (flowRef?.current && OTP) {
      const res = await flowRef?.current?.emit("verify-email-otp", OTP);
      return res;
    }
    console.error("verifyOTP error: must send OTP first");
  };

  const cancelVerify = async () => {
    if (flowRef?.current) {
      const res = await flowRef?.current?.emit("cancel");
      return res;
    }
    console.error("cancelVerify error");
  };

  const logout = async () => {
    if (!magic) return;
    try {
      await magic.user.logout();
      setIsLoggedIn(false);
    } catch (err) {
      console.error("logout error", err);
    }
  };

  const getUserMetadata = async () => {
    if (!magic) return null;
    try {
      const metadata = await magic.user.getInfo();
      return metadata;
    } catch (err) {
      console.error("getUserMetadata error", err);
      return null;
    }
  };

  const getUserIdToken = async () => {
    if (!magic) return null;
    try {
      const idToken = await magic.user.getIdToken({ lifespan: 900 });
      return idToken
    } catch (err) {
      return null
    }
  }

  const value = useMemo(
    () => ({
      magic,
      loginEmailOTP,
      logout,
      getUserMetadata,
      isLoggedIn,
      checkLoggedInMagic,
      verifyOTP,
      cancelVerify,
      getUserIdToken
    }),
    [magic]
  );

  return (
    <MagicContext.Provider value={value}>
      <Web3Provider MarketPlaceInfo={MarketPlaceInfo} NFTInfo={NFTInfo}>
        {children}
      </Web3Provider>
    </MagicContext.Provider>
  );
};
