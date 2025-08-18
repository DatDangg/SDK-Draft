// src/types.ts
import type { OAuthExtension } from "@magic-ext/oauth";
import { ethers } from "ethers";
import type { Magic as MagicBase } from "magic-sdk";

export type Magic = MagicBase<OAuthExtension[]>;

export type EtherProvider = ethers.Provider;

export type EtherSigner = ethers.Signer;

export type NFTInfo = {
  name: string;
  address: string;
  abi: any;
};

export type MarketPlaceInfo = {
  name: string;
  address: string;
  abi: any;
};

export type LoginEmailOTPType = {
  email: string;
  showUI?: boolean;
  deviceCheckUI?: boolean;
  events: EssentialLoginEvents;
};

export type MagicContextValue = {
  magic: Magic | null;
  loginEmailOTP: (props: LoginEmailOTPType) => Promise<string | null>;
  logout: () => Promise<void>;
  getUserMetadata: () => Promise<any | null>;
  isLoggedIn: boolean | null;
  checkLoggedInMagic: () => Promise<boolean>;
  verifyOTP?: (OTP: string) => Promise<void>;
  cancelVerify?: () => Promise<void>;
};

export type EssentialLoginEvents = Partial<{
  "email-otp-sent": () => void;
  "invalid-email-otp": () => void;
  "expired-email-otp": () => void;
  "login-throttled": () => void;
  done: (result: string | null) => void;
  error: (reason: any) => void;
  "Auth/id-token-created": (idToken: string) => void;
}>;
