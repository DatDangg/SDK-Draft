// src/types.ts
import type { OAuthExtension } from "@magic-ext/oauth";
import { BigNumberish, ethers } from "ethers";
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
  getUserIdToken: () => Promise<string | null>
  convertBalance: (value: BigNumberish, fromUnit: EthUnit, toUnit: EthUnit) => string;
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


export type EthUnit = "wei" | "kwei" | "babbage" | "mwei" | "lovelace" | "gwei" | "shannon" | "szabo" | "finney" | "ether";

export const UNIT_DECIMALS: Record<Exclude<EthUnit, number>, number> = {
  wei: 0, kwei: 3, babbage: 3, mwei: 6, lovelace: 6, gwei: 9, shannon: 9, szabo: 12, finney: 15, ether: 18,
};

export type LoginMagicType = {
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
  onLocked?: () => void;
};

export interface Web3ContextType {
  ethersProvider: ethers.BrowserProvider | null;
  ethersSigner: ethers.JsonRpcSigner | null;
  marketContract: ethers.Contract | null;
  nftContract: ethers.Contract | null;
  loginMagic: ((props: LoginMagicType) => Promise<void>) | null;
  verifyOTPMagic: ((otp: string, onLocked?: () => void) => Promise<void>) | null;
  isLoggedMagic: boolean;
  isSendingOTP: boolean;
  isVerifyingOTP: boolean;
  disconnectWallet: () => Promise<void>;
  magic: Magic | null;
  cancelVerify: () => Promise<void>;
  checkLoggedInMagic: () => Promise<boolean>;
  resetOTPCount: () => void;
  getUserIdToken: () => Promise<string | null>;
  convertBalance: (value: BigNumberish, fromUnit: EthUnit, toUnit: EthUnit) => string;
}