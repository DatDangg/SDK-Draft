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
import {
  CancelVerifyResult,
  UNIT_DECIMALS,
  type EthUnit,
  type LoginEmailOTPType,
  type Magic,
  type MagicContextValue,
  type MarketPlaceInfo,
  type NFTInfo,
} from "./types";
import Web3Provider from "./Web3Provider";
import { parseUnits, formatUnits, BigNumberish } from "ethers";

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
    email,
    events = {},
  }: LoginEmailOTPType) => {
    if (!magic) throw new Error("Magic not initialized");

    try {
      const flow = magic.auth.loginWithEmailOTP({
        email,
        deviceCheckUI: false,
        showUI: false,
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

  const cancelVerify = async (): Promise<CancelVerifyResult> => {
    if (!flowRef?.current) {
      return { status: "no_flow", reason: "not_initialized" };
    }
    try {
      await flowRef.current.emit("cancel");
      return { status: "success" };
    } catch (err) {
      return { status: "error", error: err };
    }
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

  const convertBalance = (
    value: BigNumberish,
    fromUnit: EthUnit,
    toUnit: EthUnit
  ): string => {
    const fromDecimals =
      typeof fromUnit === "number" ? fromUnit : UNIT_DECIMALS[fromUnit];
    const toDecimals =
      typeof toUnit === "number" ? toUnit : UNIT_DECIMALS[toUnit];

    if (fromDecimals == null || toDecimals == null) {
      throw new Error("Wrong Unit");
    }

    const inWei = parseUnits(value.toString(), fromDecimals);
    return formatUnits(inWei, toDecimals);
  };

  // const getUserMetadata = async () => {
  //   if (!magic) return null;
  //   try {
  //     const metadata = await magic.user.getInfo();
  //     return metadata;
  //   } catch (err) {
  //     console.error("getUserMetadata error", err);
  //     return null;
  //   }
  // };

  const getUserIdToken = async () => {
    if (!magic) return null;
    try {
      const idToken = await magic.user.getIdToken();
      return idToken
    } catch (err) {
      return null
    }
  }

  const value = useMemo(
    () => ({
      magic,
      isLoggedIn,
      checkLoggedInMagic,
      loginEmailOTP,
      verifyOTP,
      cancelVerify,
      logout,
      convertBalance,
      // getUserMetadata,
      getUserIdToken,
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
