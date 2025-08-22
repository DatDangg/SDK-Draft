// src/provider.tsx
import {
  createContext,
  useContext as useContext2,
  useEffect as useEffect2,
  useMemo as useMemo2,
  useRef,
  useState as useState2
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
      return `https://rpc.minato.soneium.org/`;
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
var LOGGED_MAGIC = "LOGGED_MAGIC";

// src/Web3Provider.tsx
import { jsx } from "react/jsx-runtime";
var Web3Context = React.createContext({
  ethersProvider: null,
  ethersSigner: null,
  marketContract: null,
  nftContract: null,
  loginMagic: null,
  verifyOTPMagic: null,
  isLoggedMagic: false,
  isSendingOTP: false,
  isVerifyingOTP: false,
  disconnectWallet: () => Promise.resolve(),
  magic: null,
  cancelVerify: () => Promise.resolve(),
  checkLoggedInMagic: () => Promise.resolve(false),
  resetOTPCount: () => {
  },
  getUserIdToken: () => Promise.resolve(null),
  convertBalance: () => ""
});
var useWeb3 = () => useContext(Web3Context);
function Web3Provider({
  MarketPlaceInfo,
  NFTInfo,
  children
}) {
  const [ethersProvider, setEtherProvider] = useState(null);
  const [ethersSigner, setEtherSigner] = useState(
    null
  );
  const [marketContract, setMarketContract] = useState(
    null
  );
  const [nftContract, setNftContract] = useState(null);
  const [isLoggedMagic, setLoggedMagic] = useState(
    Boolean(Cookies.get(LOGGED_MAGIC))
  );
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
        setLoggedMagic(true);
        onSuccess?.();
        setOTPCount(0);
      } catch (err) {
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
      const result = await verifyOTP?.(otp);
      return result;
    },
    [verifyOTP, otpCount]
  );
  const disconnectWallet = useCallback(async () => {
    if (magic) {
      await logoutMagic();
      setLoggedMagic(false);
      Cookies.remove(MAGIC_AUTH);
      Cookies.remove(LOGGED_MAGIC);
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
        } catch (error) {
        }
      };
      checkWalletConnection();
    }
  }, [magic]);
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
var MagicProvider = ({ children, MarketPlaceInfo, NFTInfo }) => {
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
  useEffect2(() => {
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
    events = {}
  }) => {
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
  };
  const verifyOTP = async (OTP) => {
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
    if (!magic)
      return;
    try {
      await magic.user.logout();
      setIsLoggedIn(false);
    } catch (err) {
      console.error("logout error", err);
    }
  };
  const convertBalance = (value2, fromUnit, toUnit) => {
    const fromDecimals = typeof fromUnit === "number" ? fromUnit : UNIT_DECIMALS[fromUnit];
    const toDecimals = typeof toUnit === "number" ? toUnit : UNIT_DECIMALS[toUnit];
    if (fromDecimals == null || toDecimals == null) {
      throw new Error("Wrong Unit");
    }
    const inWei = parseUnits(value2.toString(), fromDecimals);
    return formatUnits(inWei, toDecimals);
  };
  const getUserMetadata = async () => {
    if (!magic)
      return null;
    try {
      const metadata = await magic.user.getInfo();
      return metadata;
    } catch (err) {
      console.error("getUserMetadata error", err);
      return null;
    }
  };
  const getUserIdToken = async () => {
    if (!magic)
      return null;
    try {
      const idToken = await magic.user.getIdToken();
      return idToken;
    } catch (err) {
      return null;
    }
  };
  const value = useMemo2(
    () => ({
      magic,
      isLoggedIn,
      checkLoggedInMagic,
      loginEmailOTP,
      verifyOTP,
      cancelVerify,
      logout,
      convertBalance,
      getUserMetadata,
      getUserIdToken
    }),
    [magic]
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
