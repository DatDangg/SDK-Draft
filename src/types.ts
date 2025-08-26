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

/**
 * Kết quả verify OTP (dùng chung cho cả Provider.verifyOTP và Web3.verifyOTPMagic)
 * - Provider.verifyOTP hiện chỉ phát "verify-email-otp" => có thể trả { ok:false, reason: "NO_FLOW" | "EMIT_FAILED" | "EMPTY_OTP" }
 * - Web3.verifyOTPMagic có thêm kiểm tra length/normalize/timeouts/race => union mở rộng bên dưới
 */
export type VerifyOtpReason =
  | "EMPTY_OTP"
  | "NO_FLOW"
  | "EMIT_FAILED"
  | "OTP_INVALID_LENGTH"
  | "VERIFY_FN_MISSING"
  | "STALE_RESULT"
  | "TIMEOUT"
  | "UNKNOWN_ERROR";

export type VerifyOtpOk = { ok: true };
export type VerifyOtpErr = { ok: false; reason: VerifyOtpReason; error?: unknown };
export type VerifyOtpResult = VerifyOtpOk | VerifyOtpErr;

export type LoginEmailOTPType = {
  email: string;
  events: EssentialLoginEvents;
};

export type MagicContextValue = {
  magic: Magic | null;

  // login resolves DID token (string) nếu thành công, hoặc null nếu fail
  loginEmailOTP: (props: LoginEmailOTPType) => Promise<string | null>;

  logout: () => Promise<void>;
  getUserMetadata: () => Promise<any | null>;

  isLoggedIn: boolean | null;
  checkLoggedInMagic: () => Promise<boolean>;

  /**
   * Provider-side verify: chỉ emit("verify-email-otp", OTP) vào flow hiện tại.
   * Trả về VerifyOtpResult có cấu trúc (không throw).
   */
  verifyOTP?: (OTP: string) => Promise<VerifyOtpResult>;

  cancelVerify?: () => Promise<CancelVerifyResult>;

  getUserIdToken: () => Promise<string | null>;

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

export type EthUnit =
  | "wei" | "kwei" | "babbage" | "mwei" | "lovelace"
  | "gwei" | "shannon" | "szabo" | "finney" | "ether";

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

  // giữ nguyên chữ ký login
  loginMagic: ((props: LoginMagicType) => Promise<void>) | null;

  /**
   * Web3-level verify: normalize OTP, chống race, timeout fallback…
   * → luôn trả VerifyOtpResult (không throw), để app ngoài switch-case dễ dàng.
   *
   * (Breaking change so với bản cũ: trước là Promise<void>)
   */
  verifyOTPMagic: ((otp: string) => Promise<VerifyOtpResult>) | null;

  isLoggedMagic: boolean;
  isSendingOTP: boolean;
  isVerifyingOTP: boolean;

  disconnectWallet: () => Promise<void>;
  magic: Magic | null;

  cancelVerify: () => Promise<CancelVerifyResult | void>;
  checkLoggedInMagic: () => Promise<boolean>;
  resetOTPCount: () => void;

  getUserIdToken: () => Promise<string | null>;
  convertBalance: (value: BigNumberish, fromUnit: EthUnit, toUnit: EthUnit) => string;
}

export type CancelVerifyResult =
  | { status: "success" }
  | { status: "no_flow"; reason: "not_initialized" }
  | { status: "error"; error: unknown };
