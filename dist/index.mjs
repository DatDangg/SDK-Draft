// src/provider.tsx
import {
  createContext,
  useContext as useContext2,
  useEffect as useEffect2,
  useMemo as useMemo2,
  useRef,
  useState as useState2,
  useCallback as useCallback2
} from "react";

// src/magicClient.ts
import { OAuthExtension } from "@magic-ext/oauth";
import { Magic as MagicBase } from "magic-sdk";

// src/utils/network.ts
var getChainId = (network) => {
  switch (network) {
    case "polygon" /* POLYGON */:
      return 137;
    case "polygon-amoy" /* POLYGON_AMOY */:
      return 80002;
    case "ethereum-sepolia" /* ETHEREUM_SEPOLIA */:
      return 11155111;
    case "zksync" /* ZKSYNC */:
      return 324;
    case "zksync-sepolia" /* ZKSYNC_SEPOLIA */:
      return 300;
    case "ethereum" /* ETHEREUM */:
      return 1;
    case "etherlink" /* ETHERLINK */:
      return 42793;
    case "etherlink-testnet" /* ETHERLINK_TESTNET */:
      return 128123;
    case "soneium" /* SONEIUM */:
      return 1946;
  }
};
var getNetworkUrl = (network, apiKey) => {
  switch (network) {
    case "polygon" /* POLYGON */:
      return "https://polygon-rpc.com/";
    case "polygon-amoy" /* POLYGON_AMOY */:
      return "https://rpc-amoy.polygon.technology/";
    case "ethereum-sepolia" /* ETHEREUM_SEPOLIA */:
      return `https://eth-sepolia.g.alchemy.com/v2/${apiKey}`;
    case "ethereum" /* ETHEREUM */:
      return `https://eth-mainnet.g.alchemy.com/v2/${apiKey}`;
    case "etherlink" /* ETHERLINK */:
      return "https://node.mainnet.etherlink.com";
    case "etherlink-testnet" /* ETHERLINK_TESTNET */:
      return "https://node.ghostnet.etherlink.com";
    case "zksync" /* ZKSYNC */:
      return "https://mainnet.era.zksync.io";
    case "zksync-sepolia" /* ZKSYNC_SEPOLIA */:
      return "https://zksync-era-sepolia.blockpi.network/v1/rpc/public";
    case "soneium" /* SONEIUM */:
      return `https://soneium-minato.rpc.scs.startale.com?apikey=${apiKey}`;
    default:
      throw new Error("Network not supported");
  }
};

// src/magicClient.ts
var instance = null;
function initMagic(apiMagicKey, network, apiNetworkKey) {
  if (instance)
    return instance;
  const key = apiMagicKey;
  if (!key) {
    throw new Error("Magic API key not provided. Set NEXT_PUBLIC_MAGIC_API_KEY or pass apiKey to initMagic().");
  }
  instance = new MagicBase(key, {
    network: {
      rpcUrl: getNetworkUrl(network, apiNetworkKey),
      chainId: getChainId(network)
    },
    extensions: [new OAuthExtension()]
  });
  return instance;
}
function getMagic() {
  if (!instance) {
    return null;
  }
  return instance;
}

// src/types.ts
var UNIT_DECIMALS = {
  wei: 0,
  kwei: 3,
  babbage: 3,
  mwei: 6,
  lovelace: 6,
  gwei: 9,
  shannon: 9,
  szabo: 12,
  finney: 15,
  ether: 18
};

// src/Web3Provider.tsx
import { ethers } from "ethers";
import React, {
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";
import Cookies from "js-cookie";

// src/constants/common.ts
var MAGIC_AUTH = "MAGIC_AUTH";

// src/Web3Provider.tsx
import { jsx } from "react/jsx-runtime";
var Web3Context = React.createContext({
  magic: null,
  ethersProvider: null,
  ethersSigner: null,
  marketContract: null,
  nftContract: null,
  loginMagic: null,
  verifyOTPMagic: null,
  isSendingOTP: false,
  isVerifyingOTP: false,
  disconnectWallet: async () => {
  },
  cancelVerify: async () => ({ status: "no_flow", reason: "not_initialized" }),
  checkLoggedInMagic: async () => false,
  convertBalance: () => ""
});
var useWeb3 = () => useContext(Web3Context);
function Web3Provider({
  MarketPlaceInfo,
  NFTInfo,
  children
}) {
  const [ethersProvider, setEtherProvider] = useState(null);
  const [ethersSigner, setEtherSigner] = useState(null);
  const [marketContract, setMarketContract] = useState(null);
  const [nftContract, setNftContract] = useState(null);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const {
    magic,
    isLoggedIn,
    loginEmailOTP,
    checkLoggedInMagic,
    logout: logoutMagic,
    verifyOTP,
    cancelVerify,
    convertBalance
  } = useMagic();
  const isLoggedMagic = Boolean(isLoggedIn);
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
      onIdTokenCreated
    }) => {
      try {
        setIsSendingOTP(true);
        const didToken = await loginEmailOTP({
          email,
          events: {
            "email-otp-sent": () => {
              setIsSendingOTP(false);
              onOTPSent?.();
            },
            "invalid-email-otp": () => {
              setIsVerifyingOTP(false);
              onVerifyOTPFail?.();
            },
            "expired-email-otp": () => {
              setIsVerifyingOTP(false);
              onExpiredEmailOTP?.();
            },
            "login-throttled": () => {
              onLoginThrottled?.();
              setIsSendingOTP(false);
              setIsVerifyingOTP(false);
            },
            done: (result) => {
              setIsSendingOTP(false);
              setIsVerifyingOTP(false);
              onDone?.(result);
            },
            error: (reason) => {
              setIsSendingOTP(false);
              setIsVerifyingOTP(false);
              onError?.(reason);
            },
            "Auth/id-token-created": (idToken) => onIdTokenCreated?.(idToken)
          }
        });
        if (!didToken) {
          return;
        }
        Cookies.set(MAGIC_AUTH, JSON.stringify({ token: didToken }));
        onSuccess?.();
      } catch (err) {
        console.log(err);
        onFail?.();
        setIsSendingOTP(false);
      }
    },
    [loginEmailOTP]
  );
  const verifyOTPMagic = useCallback(
    async (otp) => {
      if (otp.length !== 6)
        return;
      setIsVerifyingOTP(true);
      try {
        const result = await verifyOTP?.(otp);
        return result;
      } finally {
        setIsVerifyingOTP(false);
      }
    },
    [verifyOTP]
  );
  const disconnectWallet = useCallback(async () => {
    if (magic) {
      await logoutMagic();
      Cookies.remove(MAGIC_AUTH);
    }
  }, [magic, logoutMagic]);
  useEffect(() => {
    if (magic && isLoggedMagic) {
      const checkEthers = async () => {
        const provider = new ethers.BrowserProvider(magic.rpcProvider);
        const signer = await provider.getSigner();
        const marketContract2 = new ethers.Contract(
          MarketPlaceInfo.address,
          MarketPlaceInfo.abi,
          signer
        );
        const nftContract2 = new ethers.Contract(
          NFTInfo.address,
          NFTInfo.abi,
          signer
        );
        setEtherProvider(provider);
        setEtherSigner(signer);
        setMarketContract(marketContract2);
        setNftContract(nftContract2);
      };
      checkEthers();
    }
  }, [magic, isLoggedMagic]);
  useEffect(() => {
    if (!magic || !isLoggedMagic) {
      setEtherProvider(null);
      setEtherSigner(null);
      setMarketContract(null);
      setNftContract(null);
      return;
    }
    let mounted = true;
    const initEthers = async () => {
      const provider = new ethers.BrowserProvider(magic.rpcProvider);
      const signer = await provider.getSigner();
      const market = new ethers.Contract(
        MarketPlaceInfo.address,
        MarketPlaceInfo.abi,
        signer
      );
      const nft = new ethers.Contract(
        NFTInfo.address,
        NFTInfo.abi,
        signer
      );
      if (!mounted)
        return;
      setEtherProvider(provider);
      setEtherSigner(signer);
      setMarketContract(market);
      setNftContract(nft);
    };
    void initEthers();
    return () => {
      mounted = false;
    };
  }, [magic, isLoggedMagic, MarketPlaceInfo, NFTInfo]);
  useEffect(() => {
    if (!magic)
      return;
    void checkLoggedInMagic();
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
      convertBalance
    ]
  );
  return /* @__PURE__ */ jsx(Web3Context.Provider, { value: values, children });
}
var Web3Provider_default = Web3Provider;

// src/provider.tsx
import { parseUnits, formatUnits } from "ethers";
import { jsx as jsx2 } from "react/jsx-runtime";
var MagicContext = createContext(void 0);
var useMagic = () => {
  const ctx = useContext2(MagicContext);
  if (!ctx)
    throw new Error("useMagic must be used within MagicProvider");
  return ctx;
};
var MagicProvider = ({
  children,
  MarketPlaceInfo,
  NFTInfo,
  onToken
}) => {
  const [magic, setMagic] = useState2(null);
  const [isLoggedIn, setIsLoggedIn] = useState2(null);
  const flowRef = useRef();
  useEffect2(() => {
    try {
      const m = initMagic("", "");
      setMagic(m);
    } catch (err) {
      console.warn("Magic init warning:", err.message);
      setMagic(null);
    }
  }, []);
  const checkLoggedInMagic = useCallback2(async () => {
    if (!magic) {
      setIsLoggedIn(false);
      return false;
    }
    try {
      const logged = await magic.user.isLoggedIn();
      setIsLoggedIn(Boolean(logged));
      return Boolean(logged);
    } catch (err) {
      console.warn("isLoggedIn check failed", err);
      setIsLoggedIn(false);
      return false;
    }
  }, [magic]);
  useEffect2(() => {
    if (magic)
      void checkLoggedInMagic();
  }, [magic, checkLoggedInMagic]);
  const loginEmailOTP = useCallback2(
    async ({ email, events = {} }) => {
      if (!magic)
        throw new Error("Magic not initialized");
      try {
        const flow = magic.auth.loginWithEmailOTP({
          email,
          deviceCheckUI: false,
          showUI: false
        });
        flowRef.current = flow;
        Object.entries(events).forEach(([event, handler]) => {
          if (handler)
            flow.on(event, handler);
        });
        const token = await flow;
        if (token) {
          onToken?.(token);
          setIsLoggedIn(true);
        }
        return token || null;
      } catch (err) {
        console.error("login error", err);
        events.error?.(err);
        return null;
      } finally {
        flowRef.current = void 0;
      }
    },
    [magic, onToken]
  );
  const verifyOTP = useCallback2(async (OTP) => {
    if (!OTP) {
      const err = new Error("EMPTY_OTP");
      err.code = "EMPTY_OTP";
      throw err;
    }
    if (!flowRef?.current) {
      const err = new Error("NO_FLOW");
      err.code = "NO_FLOW";
      throw err;
    }
    await flowRef.current.emit("verify-email-otp", OTP);
  }, []);
  const cancelVerify = useCallback2(async () => {
    if (!flowRef?.current) {
      return { status: "no_flow", reason: "not_initialized" };
    }
    try {
      await flowRef.current.emit("cancel");
      return { status: "success" };
    } catch (err) {
      return { status: "error", error: err };
    }
  }, []);
  const logout = useCallback2(async () => {
    if (!magic)
      return;
    try {
      await magic.user.logout();
      setIsLoggedIn(false);
    } catch (err) {
      console.error("logout error", err);
    }
  }, [magic]);
  const convertBalance = useCallback2(
    (value2, fromUnit, toUnit) => {
      const fromDecimals = typeof fromUnit === "number" ? fromUnit : UNIT_DECIMALS[fromUnit];
      const toDecimals = typeof toUnit === "number" ? toUnit : UNIT_DECIMALS[toUnit];
      if (fromDecimals == null || toDecimals == null) {
        throw new Error("Wrong Unit");
      }
      const inWei = parseUnits(value2.toString(), fromDecimals);
      return formatUnits(inWei, toDecimals);
    },
    []
  );
  const value = useMemo2(
    () => ({
      magic,
      isLoggedIn,
      checkLoggedInMagic,
      loginEmailOTP,
      verifyOTP,
      cancelVerify,
      logout,
      convertBalance
    }),
    [
      magic,
      isLoggedIn,
      checkLoggedInMagic,
      loginEmailOTP,
      verifyOTP,
      cancelVerify,
      logout,
      convertBalance
    ]
  );
  return /* @__PURE__ */ jsx2(MagicContext.Provider, { value, children: /* @__PURE__ */ jsx2(Web3Provider_default, { MarketPlaceInfo, NFTInfo, children }) });
};

// src/hook.ts
import { useEffect as useEffect3, useState as useState3 } from "react";
function useIsLoggedIn(pollInterval = 5e3) {
  const { magic } = useMagic();
  const [isLoggedIn, setIsLoggedIn] = useState3(null);
  useEffect3(() => {
    let mounted = true;
    let t;
    if (!magic) {
      setIsLoggedIn(false);
      return;
    }
    const check = async () => {
      try {
        const r = await magic.user.isLoggedIn();
        if (!mounted)
          return;
        setIsLoggedIn(r);
      } catch {
        if (!mounted)
          return;
        setIsLoggedIn(false);
      } finally {
        t = window.setTimeout(check, pollInterval);
      }
    };
    check();
    return () => {
      mounted = false;
      if (t)
        clearTimeout(t);
    };
  }, [magic, pollInterval]);
  return isLoggedIn;
}
export {
  MagicProvider,
  getMagic,
  initMagic,
  useIsLoggedIn,
  useWeb3
};
