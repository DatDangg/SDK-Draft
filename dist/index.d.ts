import React, { ReactNode } from 'react';
import { OAuthExtension } from '@magic-ext/oauth';
import { Magic as Magic$1 } from 'magic-sdk';
import { ethers } from 'ethers';

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
    showUI?: boolean;
    deviceCheckUI?: boolean;
    events: EssentialLoginEvents;
};
type MagicContextValue = {
    magic: Magic | null;
    loginEmailOTP: (props: LoginEmailOTPType) => Promise<string | null>;
    logout: () => Promise<void>;
    getUserMetadata: () => Promise<any | null>;
    isLoggedIn: boolean | null;
    checkLoggedInMagic: () => Promise<boolean>;
    verifyOTP?: (OTP: string) => Promise<void>;
    cancelVerify?: () => Promise<void>;
    getUserIdToken: () => Promise<string | null>;
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

declare const MagicProvider: React.FC<{
    children: ReactNode;
    MarketPlaceInfo: MarketPlaceInfo;
    NFTInfo: NFTInfo;
}>;

declare const useWeb3: () => {
    ethersProvider: ethers.BrowserProvider | null;
    ethersSigner: ethers.JsonRpcSigner | null;
    marketContract: ethers.Contract | null;
    nftContract: ethers.Contract | null;
    loginMagic: ((props: LoginMagicType) => Promise<void>) | null;
    verifyOTPMagic: ((otp: string, onLocked?: () => void) => Promise<void>) | null;
    isLoggedMagic: boolean;
    isSendingOTP: boolean;
    setIsSendingOTP: React.Dispatch<React.SetStateAction<boolean>>;
    setIsVerifyingOTP: React.Dispatch<React.SetStateAction<boolean>>;
    isVerifyingOTP: boolean;
    disconnectWallet: () => Promise<void>;
    magic: Magic | null;
    cancelVerify: () => Promise<void>;
    checkLoggedInMagic: () => Promise<boolean>;
    resetOTPCount: () => void;
    getUserIdToken: () => Promise<string | null>;
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
    onLocked?: () => void;
};

declare function useIsLoggedIn(pollInterval?: number): boolean | null;

declare function initMagic(apiMagicKey: string, network: string, apiNetworkKey?: string): Magic;
declare function getMagic(): Magic | null;

export { EssentialLoginEvents, LoginEmailOTPType, Magic, MagicContextValue, MagicProvider, getMagic, initMagic, useIsLoggedIn, useWeb3 };
