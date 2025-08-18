"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  MagicProvider: () => MagicProvider,
  getMagic: () => getMagic,
  initMagic: () => initMagic,
  useIsLoggedIn: () => useIsLoggedIn,
  useWeb3: () => useWeb3
});
module.exports = __toCommonJS(src_exports);

// src/provider.tsx
var import_react2 = require("react");

// src/magicClient.ts
var import_oauth = require("@magic-ext/oauth");
var import_magic_sdk = require("magic-sdk");

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
      return `https://soneium-minato.g.alchemy.com/v2/${apiKey}`;
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
  instance = new import_magic_sdk.Magic(key, {
    network: {
      rpcUrl: getNetworkUrl(network, apiNetworkKey),
      chainId: getChainId(network)
    },
    extensions: [new import_oauth.OAuthExtension()]
  });
  return instance;
}
function getMagic() {
  if (!instance) {
    return null;
  }
  return instance;
}

// src/Web3Provider.tsx
var import_ethers = require("ethers");
var import_react = __toESM(require("react"));
var import_js_cookie = __toESM(require("js-cookie"));

// src/constants/common.ts
var MAGIC_AUTH = "MAGIC_AUTH";

// src/Web3Provider.tsx
var import_yup = require("yup");
var import_jsx_runtime = require("react/jsx-runtime");
var Web3Context = import_react.default.createContext({
  ethersProvider: null,
  ethersSigner: null,
  marketContract: null,
  nftContract: null,
  loginMagic: null,
  isLoggedMagic: false,
  verifyOTPMagic: null,
  isSendingOTP: false,
  isVerifyingOTP: false,
  disconnectWallet: () => Promise.resolve(),
  setIsSendingOTP: import_yup.boolean
});
var useWeb3 = () => (0, import_react.useContext)(Web3Context);
function Web3Provider({
  MarketPlaceInfo,
  NFTInfo,
  children
}) {
  const [ethersProvider, setEtherProvider] = (0, import_react.useState)(null);
  const [ethersSigner, setEtherSigner] = (0, import_react.useState)(
    null
  );
  const [marketContract, setMarketContract] = (0, import_react.useState)(
    null
  );
  const [nftContract, setNftContract] = (0, import_react.useState)(null);
  const [isLoggedMagic, setLoggedMagic] = (0, import_react.useState)(false);
  const [isSendingOTP, setIsSendingOTP] = (0, import_react.useState)(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = (0, import_react.useState)(false);
  const [otpCount, setOTPCount] = (0, import_react.useState)(0);
  const {
    magic,
    loginEmailOTP,
    checkLoggedInMagic,
    logout: logoutMagic,
    verifyOTP
  } = useMagic();
  const loginMagic = (0, import_react.useCallback)(
    async ({
      email,
      showUI,
      deviceCheckUI,
      onSuccess,
      onFail,
      onOTPSent,
      onVerifyOTPFail,
      onExpiredEmailOtp,
      onLoginThrottled,
      onDone,
      onError,
      onClosedByUser,
      onIdTokenCreated
    }) => {
      try {
        setIsSendingOTP(true);
        const didToken = await loginEmailOTP({
          email,
          showUI,
          deviceCheckUI,
          events: {
            "email-otp-sent": () => onOTPSent?.(),
            "invalid-email-otp": () => onVerifyOTPFail?.(),
            "expired-email-otp": () => onExpiredEmailOtp?.(),
            "login-throttled": () => onLoginThrottled?.(),
            done: (result) => onDone?.(result),
            error: (reason) => onError?.(reason),
            "closed-by-user": () => onClosedByUser?.(),
            "Auth/id-token-created": (idToken) => onIdTokenCreated?.(idToken)
          }
        });
        if (!didToken) {
          return;
        }
        import_js_cookie.default.set(MAGIC_AUTH, JSON.stringify({ token: didToken }));
        setLoggedMagic(true);
        onSuccess?.();
        setIsSendingOTP(false);
      } catch (err) {
        const msg = err?.message;
        onFail?.();
        setIsSendingOTP(false);
      }
    },
    [loginEmailOTP]
  );
  const verifyOTPMagic = (0, import_react.useCallback)(
    async (otp, options) => {
      const step = options?.step ?? "otp";
      if (step !== "otp" || otp.length !== 6)
        return;
      const count = otpCount + 1;
      setOTPCount(count);
      if (count >= 3) {
        setTimeout(() => {
          setIsSendingOTP(false);
          options?.onLocked?.();
        }, 3e3);
        return;
      }
      try {
        setIsVerifyingOTP(true);
        const result = await verifyOTP?.(otp);
        setIsVerifyingOTP(false);
        return result;
      } catch {
        setIsVerifyingOTP(false);
      }
    },
    [verifyOTP]
  );
  const disconnectWallet = (0, import_react.useCallback)(async () => {
    if (magic) {
      await logoutMagic();
      setLoggedMagic(false);
      import_js_cookie.default.remove(MAGIC_AUTH);
    }
  }, [magic, logoutMagic]);
  (0, import_react.useEffect)(() => {
    if (magic && isLoggedMagic) {
      const checkEthers = async () => {
        const provider = new import_ethers.ethers.BrowserProvider(magic.rpcProvider);
        const signer = await provider.getSigner();
        const marketContract2 = new import_ethers.ethers.Contract(
          MarketPlaceInfo.address,
          MarketPlaceInfo.abi,
          signer
        );
        const nftContract2 = new import_ethers.ethers.Contract(
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
  (0, import_react.useEffect)(() => {
    if (magic) {
      const checkWalletConnection = async () => {
        try {
          const logged = await checkLoggedInMagic();
          setLoggedMagic(logged);
        } catch (error) {
        }
      };
      checkWalletConnection();
    }
  }, [magic]);
  const values = (0, import_react.useMemo)(
    () => ({
      ethersProvider,
      ethersSigner,
      marketContract,
      nftContract,
      loginMagic,
      isLoggedMagic,
      disconnectWallet,
      setIsSendingOTP,
      verifyOTPMagic,
      isSendingOTP,
      isVerifyingOTP
    }),
    [
      disconnectWallet,
      ethersProvider,
      ethersSigner,
      isLoggedMagic,
      loginMagic,
      marketContract,
      nftContract,
      verifyOTPMagic,
      isSendingOTP,
      isVerifyingOTP,
      setIsSendingOTP
    ]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Web3Context.Provider, { value: values, children });
}
var Web3Provider_default = Web3Provider;

// src/provider.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
var MagicContext = (0, import_react2.createContext)(void 0);
var useMagic = () => {
  const ctx = (0, import_react2.useContext)(MagicContext);
  if (!ctx)
    throw new Error("useMagic must be used within MagicProvider");
  return ctx;
};
var MagicProvider = ({ children, apiKey, network, MarketPlaceInfo, NFTInfo }) => {
  const [magic, setMagic] = (0, import_react2.useState)(null);
  const [isLoggedIn, setIsLoggedIn] = (0, import_react2.useState)(null);
  const flowRef = (0, import_react2.useRef)();
  (0, import_react2.useEffect)(() => {
    try {
      const m = initMagic(apiKey, network);
      setMagic(m);
    } catch (err) {
      console.warn("Magic init warning:", err.message);
      setMagic(null);
    }
  }, [apiKey]);
  (0, import_react2.useEffect)(() => {
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
    showUI = false
  }) => {
    if (!magic)
      throw new Error("Magic not initialized");
    try {
      const flow = magic.auth.loginWithEmailOTP({
        email,
        deviceCheckUI,
        showUI
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
  const value = (0, import_react2.useMemo)(
    () => ({
      magic,
      loginEmailOTP,
      logout,
      getUserMetadata,
      isLoggedIn,
      checkLoggedInMagic,
      verifyOTP,
      cancelVerify
    }),
    [magic]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(MagicContext.Provider, { value, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Web3Provider_default, { MarketPlaceInfo, NFTInfo, children }) });
};

// src/hook.ts
var import_react3 = require("react");
function useIsLoggedIn(pollInterval = 5e3) {
  const { magic } = useMagic();
  const [isLoggedIn, setIsLoggedIn] = (0, import_react3.useState)(null);
  (0, import_react3.useEffect)(() => {
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MagicProvider,
  getMagic,
  initMagic,
  useIsLoggedIn,
  useWeb3
});
