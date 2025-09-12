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
var import_ethers = require("ethers");
var import_react = __toESM(require("react"));
var import_jsx_runtime = require("react/jsx-runtime");
var Web3Context = import_react.default.createContext({
  ethersProvider: null,
  ethersSigner: null,
  marketContract: null,
  nftContract: null,
  isLoggedMagic: false,
  loginMagic: null,
  verifyOTPMagic: null,
  isSendingOTP: false,
  isVerifyingOTP: false,
  disconnectWallet: async () => {
  },
  magic: null,
  cancelVerify: async () => ({ status: "no_flow", reason: "not_initialized" }),
  checkLoggedInMagic: async () => false,
  getUserIdToken: async () => null,
  convertBalance: () => "",
  listNFT: () => Promise.resolve(),
  history: () => Promise.resolve(),
  getNFTInfo: () => Promise.resolve(),
  getEthBalance: async () => ({ address: "", balanceEth: "0" }),
  estimateTransfer: async () => ({ gasLimit: 0n, gasPrice: 0n, value: 0n }),
  transferETH: async () => {
    throw new Error("Web3Context not initialized: transferETH is unavailable outside Provider");
  }
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
  const [isSendingOTP, setIsSendingOTP] = (0, import_react.useState)(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = (0, import_react.useState)(false);
  const {
    magic,
    loginEmailOTP,
    checkLoggedInMagic,
    logout: logoutMagic,
    verifyOTP,
    cancelVerify,
    getUserIdToken,
    convertBalance,
    isLoggedIn
  } = useMagic();
  const isLoggedMagic = (0, import_react.useMemo)(() => {
    return Boolean(isLoggedIn);
  }, [isLoggedIn]);
  const loginMagic = (0, import_react.useCallback)(
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
        onSuccess?.();
      } catch (err) {
        console.log(err);
        onFail?.();
        setIsSendingOTP(false);
      }
    },
    [loginEmailOTP]
  );
  const verifyOTPMagic = (0, import_react.useCallback)(
    async (otp) => {
      if (otp.length !== 6)
        return;
      setIsVerifyingOTP(true);
      const result = await verifyOTP?.(otp);
      return result;
    },
    [verifyOTP]
  );
  const disconnectWallet = (0, import_react.useCallback)(async () => {
    if (magic) {
      await logoutMagic();
    }
  }, [magic, logoutMagic]);
  const listNFT = (0, import_react.useCallback)(
    async ({
      tokenSell = "0x0000000000000000000000000000000000000000",
      tokenId,
      amount,
      price,
      privateBuyer = []
    }, overrides) => {
      if (!marketContract || !nftContract)
        return;
      try {
        const priceInWei = import_ethers.ethers.parseEther(price);
        console.log({
          params: {
            contractAddress: NFTInfo.address,
            tokenSell,
            tokenId,
            amount,
            priceInWei: priceInWei.toString(),
            privateBuyer
          },
          overrides
        });
        const tx = await marketContract.listToken(
          NFTInfo.address,
          tokenSell,
          tokenId,
          amount,
          priceInWei,
          privateBuyer,
          overrides
        );
        console.log("\u23F3 Transaction sent:", tx.hash);
        const receipt = await tx.wait();
        console.log("\u2705 NFT listed successfully!", receipt);
        return receipt;
      } catch (error) {
        console.error("\u274C Error listing NFT:", error);
        throw error;
      }
    },
    [marketContract, NFTInfo, nftContract]
  );
  const getEthBalance = (0, import_react.useCallback)(async () => {
    if (!ethersSigner)
      throw new Error("No signer available. Please login first.");
    const address = await ethersSigner.getAddress();
    const balWei = await ethersSigner.provider.getBalance(address);
    return { address, balanceEth: import_ethers.ethers.formatEther(balWei) };
  }, [ethersSigner]);
  const estimateTransfer = (0, import_react.useCallback)(
    async (to, amountEth) => {
      if (!ethersSigner)
        throw new Error("No signer available. Please login first.");
      if (!import_ethers.ethers.isAddress(to))
        throw new Error("Invalid recipient address");
      const n = Number(amountEth);
      if (!Number.isFinite(n) || n <= 0)
        throw new Error("Invalid amount");
      const provider = ethersSigner.provider;
      const value = import_ethers.ethers.parseEther(amountEth);
      try {
        const gasLimit = await provider.estimateGas({ to, value }).catch(() => 21000n);
        const fee = await provider.getFeeData();
        const gasPrice = fee.gasPrice ?? BigInt(await provider.send("eth_gasPrice", []));
        return { gasLimit, gasPrice, value };
      } catch (error) {
        console.error("\u274C Error estimating transfer:", error);
        throw new Error("Failed to estimate gas for the transaction");
      }
    },
    [ethersSigner]
  );
  const transferETH = (0, import_react.useCallback)(
    async (to, amountEth) => {
      if (!ethersSigner) {
        throw new Error("Please login first to transfer ETH");
      }
      const provider = ethersSigner.provider;
      const from = await ethersSigner.getAddress();
      const { gasLimit, gasPrice, value } = await estimateTransfer(to, amountEth);
      const txRequest = { to, value, gasLimit, gasPrice };
      console.log("\u2728 Magic Transfer initiated!", {
        from,
        to,
        amountEth,
        gasLimit: gasLimit.toString(),
        gasPrice: gasPrice.toString()
      });
      const tx = await ethersSigner.sendTransaction(txRequest);
      console.log("\u{1F680} Transaction sent! Hash:", tx.hash);
      console.log("\u23F3 Waiting for confirmation...");
      const receipt = await tx.wait();
      if (!receipt || receipt.status !== 1) {
        console.warn("\u26A0\uFE0F Transaction mined nh\u01B0ng kh\xF4ng th\xE0nh c\xF4ng (status !== 1):", receipt);
      } else {
        const egp = receipt?.effectiveGasPrice;
        const feePaid = egp ? import_ethers.ethers.formatEther((receipt.gasUsed ?? 0n) * egp) : "Unknown";
        console.log("\u2705 Transfer successful!", { hash: tx.hash, feePaid });
      }
      return receipt;
    },
    [ethersSigner, estimateTransfer]
  );
  const history = (0, import_react.useCallback)(async () => {
    if (!nftContract || !marketContract)
      return;
    const address = ethersSigner?.address;
    const filterReceived = nftContract.filters.Transfer(null, address);
    const receivedEvents = await nftContract.queryFilter(filterReceived);
    const filterSent = nftContract.filters.Transfer(address, null);
    const sentEvents = await nftContract.queryFilter(filterSent);
    const filterListed = marketContract.filters.TokenListed(
      null,
      null,
      address
    );
    const listedEvents = await marketContract.queryFilter(filterListed);
    const filterBought = marketContract.filters.TokenSold(null, null, address);
    const boughtEvents = await marketContract.queryFilter(filterBought);
    const filterDelisted = marketContract.filters.ListingDeleted(null, null);
    const delistedEvents = await marketContract.queryFilter(filterDelisted);
    return {
      received: receivedEvents,
      sent: sentEvents,
      listed: listedEvents,
      bought: boughtEvents,
      delisted: delistedEvents
    };
  }, [nftContract, marketContract]);
  const getNFTInfo = async (tokenId) => {
    if (!nftContract)
      return;
    try {
      const owner = await nftContract.ownerOf(tokenId);
      const tokenURI = await nftContract.tokenURI(tokenId);
      const name = await nftContract.name();
      const symbol = await nftContract.symbol();
      let metadata = null;
      if (tokenURI.startsWith("http") || tokenURI.startsWith("ipfs://")) {
        let url = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
        const response = await fetch(url);
        metadata = await response.json();
      }
      return {
        tokenId,
        owner,
        collectionName: name,
        collectionSymbol: symbol,
        tokenURI,
        metadata
      };
    } catch (error) {
      console.error("Error fetching NFT info:", error);
      return null;
    }
  };
  (0, import_react.useEffect)(() => {
    if (nftContract && magic) {
      const checkApprovedContract = async () => {
        const isApproved = await nftContract.isApprovedForAll(
          ethersSigner?.address,
          MarketPlaceInfo.address
        );
        if (isApproved)
          return;
        nftContract.setApprovalForAll(MarketPlaceInfo.address, true);
        return;
      };
      checkApprovedContract();
    }
  }, []);
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
  const values = (0, import_react.useMemo)(
    () => ({
      magic,
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
      getUserIdToken,
      convertBalance,
      listNFT,
      history,
      getNFTInfo,
      getEthBalance,
      estimateTransfer,
      transferETH
    }),
    [
      magic,
      ethersProvider,
      ethersSigner,
      marketContract,
      nftContract,
      loginMagic,
      disconnectWallet,
      verifyOTPMagic,
      isSendingOTP,
      isVerifyingOTP,
      cancelVerify,
      checkLoggedInMagic,
      getUserIdToken,
      convertBalance,
      listNFT,
      history,
      getNFTInfo,
      getEthBalance,
      estimateTransfer,
      transferETH
    ]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Web3Context.Provider, { value: values, children });
}
var Web3Provider_default = Web3Provider;

// src/provider.tsx
var import_ethers2 = require("ethers");
var import_jsx_runtime2 = require("react/jsx-runtime");
var MagicContext = (0, import_react2.createContext)(void 0);
var useMagic = () => {
  const ctx = (0, import_react2.useContext)(MagicContext);
  if (!ctx)
    throw new Error("useMagic must be used within MagicProvider");
  return ctx;
};
var MagicProvider = ({ children, MarketPlaceInfo, NFTInfo }) => {
  const [magic, setMagic] = (0, import_react2.useState)(null);
  const [isLoggedIn, setIsLoggedIn] = (0, import_react2.useState)(null);
  const flowRef = (0, import_react2.useRef)();
  (0, import_react2.useEffect)(() => {
    try {
      const m = initMagic("", "");
      setMagic(m);
    } catch (err) {
      console.warn("Magic init warning:", err.message);
      setMagic(null);
    }
  }, []);
  (0, import_react2.useEffect)(() => {
    if (magic) {
      checkLoggedInMagic();
    }
  }, [magic]);
  const checkLoggedInMagic = (0, import_react2.useCallback)(async () => {
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
    const inWei = (0, import_ethers2.parseUnits)(value2.toString(), fromDecimals);
    return (0, import_ethers2.formatUnits)(inWei, toDecimals);
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
  const value = (0, import_react2.useMemo)(
    () => ({
      magic,
      isLoggedIn,
      checkLoggedInMagic,
      loginEmailOTP,
      verifyOTP,
      cancelVerify,
      logout,
      convertBalance,
      getUserIdToken
    }),
    [
      magic,
      isLoggedIn
    ]
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
