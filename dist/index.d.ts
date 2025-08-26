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
type LoginEmailOTPType = {
    email: string;
    events: EssentialLoginEvents;
};
type MagicContextValue = {
    magic: Magic | null;
    loginEmailOTP: (props: LoginEmailOTPType) => Promise<string | null>;
    logout: () => Promise<void>;
    isLoggedIn: boolean | null;
    checkLoggedInMagic: () => Promise<boolean>;
    verifyOTP?: (OTP: string) => Promise<void>;
    cancelVerify?: () => Promise<CancelVerifyResult>;
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
    verifyOTPMagic: ((otp: string, onLocked?: () => void) => Promise<void>) | null;
    isSendingOTP: boolean;
    isVerifyingOTP: boolean;
    disconnectWallet: () => Promise<void>;
    magic: Magic | null;
    cancelVerify: () => Promise<CancelVerifyResult | void>;
    checkLoggedInMagic: () => Promise<boolean>;
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

type MagicProviderProps = {
    children: ReactNode;
    MarketPlaceInfo: MarketPlaceInfo;
    NFTInfo: NFTInfo;
    /** publishable key của Magic — bắt buộc khi đóng gói SDK */
    magicKey: string;
    /** tuỳ chọn khác khi init Magic (network, locale, extensions, ...) */
    magicOptions?: Record<string, any>;
    /** callback để SDK báo cho app token/didToken nếu bạn cần tự lưu */
    onToken?: (token: string) => void;
};
declare const MagicProvider: React.FC<MagicProviderProps>;

declare const useWeb3: () => Web3ContextType;

declare function useIsLoggedIn(pollInterval?: number): boolean | null;

declare function initMagic(apiMagicKey: string, network: string, apiNetworkKey?: string): Magic;
declare function getMagic(): Magic | null;

export { EssentialLoginEvents, LoginEmailOTPType, Magic, MagicContextValue, MagicProvider, getMagic, initMagic, useIsLoggedIn, useWeb3 };
