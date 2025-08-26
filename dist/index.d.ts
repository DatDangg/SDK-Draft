import React, { ReactNode } from 'react';
import { OAuthExtension } from '@magic-ext/oauth';
import { BigNumberish, ethers } from 'ethers';
import { Magic as Magic$1 } from 'magic-sdk';

type Magic = Magic$1<OAuthExtension[]>;
type NFTInfo = {
    name: string;
    address: string;
    abi: any;
};
type MarketPlaceInfo = {
    name: string;
    address: string;
    abi: any;
};
/**
 * Kết quả verify OTP (dùng chung cho cả Provider.verifyOTP và Web3.verifyOTPMagic)
 * - Provider.verifyOTP hiện chỉ phát "verify-email-otp" => có thể trả { ok:false, reason: "NO_FLOW" | "EMIT_FAILED" | "EMPTY_OTP" }
 * - Web3.verifyOTPMagic có thêm kiểm tra length/normalize/timeouts/race => union mở rộng bên dưới
 */
type VerifyOtpReason = "EMPTY_OTP" | "NO_FLOW" | "EMIT_FAILED" | "OTP_INVALID_LENGTH" | "VERIFY_FN_MISSING" | "STALE_RESULT" | "TIMEOUT" | "UNKNOWN_ERROR";
type VerifyOtpOk = {
    ok: true;
};
type VerifyOtpErr = {
    ok: false;
    reason: VerifyOtpReason;
    error?: unknown;
};
type VerifyOtpResult = VerifyOtpOk | VerifyOtpErr;
type LoginEmailOTPType = {
    email: string;
    events: EssentialLoginEvents;
};
type MagicContextValue = {
    magic: Magic | null;
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
type EssentialLoginEvents = Partial<{
    "email-otp-sent": () => void;
    "invalid-email-otp": () => void;
    "expired-email-otp": () => void;
    "login-throttled": () => void;
    done: (result: string | null) => void;
    error: (reason: any) => void;
    "Auth/id-token-created": (idToken: string) => void;
}>;
type EthUnit = "wei" | "kwei" | "babbage" | "mwei" | "lovelace" | "gwei" | "shannon" | "szabo" | "finney" | "ether";
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
    onLocked?: () => void;
};
interface Web3ContextType {
    ethersProvider: ethers.BrowserProvider | null;
    ethersSigner: ethers.JsonRpcSigner | null;
    marketContract: ethers.Contract | null;
    nftContract: ethers.Contract | null;
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
type CancelVerifyResult = {
    status: "success";
} | {
    status: "no_flow";
    reason: "not_initialized";
} | {
    status: "error";
    error: unknown;
};

declare const MagicProvider: React.FC<{
    children: ReactNode;
    MarketPlaceInfo: MarketPlaceInfo;
    NFTInfo: NFTInfo;
}>;

declare const useWeb3: () => Web3ContextType;

declare function useIsLoggedIn(pollInterval?: number): boolean | null;

declare function initMagic(apiMagicKey: string, network: string, apiNetworkKey?: string): Magic;
declare function getMagic(): Magic | null;

export { EssentialLoginEvents, LoginEmailOTPType, Magic, MagicContextValue, MagicProvider, getMagic, initMagic, useIsLoggedIn, useWeb3 };
