export enum Network {
  POLYGON_AMOY = "polygon-amoy",
  POLYGON = "polygon",
  ETHEREUM_SEPOLIA = "ethereum-sepolia",
  ETHEREUM = "ethereum",
  ETHERLINK = "etherlink",
  ETHERLINK_TESTNET = "etherlink-testnet",
  ZKSYNC = "zksync",
  ZKSYNC_SEPOLIA = "zksync-sepolia",
  SONEIUM = "soneium",
}

export const getChainId = (network: string) => {
  switch (network) {
    case Network.POLYGON:
      return 137;
    case Network.POLYGON_AMOY:
      return 80002;
    case Network.ETHEREUM_SEPOLIA:
      return 11155111;
    case Network.ZKSYNC:
      return 324;
    case Network.ZKSYNC_SEPOLIA:
      return 300;
    case Network.ETHEREUM:
      return 1;
    case Network.ETHERLINK:
      return 42793;
    case Network.ETHERLINK_TESTNET:
      return 128123;
    case Network.SONEIUM:
      return 1946;
  }
};

export const getNetworkUrl = (network: string, apiKey?: string) => {
  switch (network) {
    case Network.POLYGON:
      return "https://polygon-rpc.com/";
    case Network.POLYGON_AMOY:
      return "https://rpc-amoy.polygon.technology/";
    case Network.ETHEREUM_SEPOLIA:
      return `https://eth-sepolia.g.alchemy.com/v2/${apiKey}`;
    case Network.ETHEREUM:
      return `https://eth-mainnet.g.alchemy.com/v2/${apiKey}`;
    case Network.ETHERLINK:
      return "https://node.mainnet.etherlink.com";
    case Network.ETHERLINK_TESTNET:
      return "https://node.ghostnet.etherlink.com";
    case Network.ZKSYNC:
      return "https://mainnet.era.zksync.io";
    case Network.ZKSYNC_SEPOLIA:
      return "https://zksync-era-sepolia.blockpi.network/v1/rpc/public";
    case Network.SONEIUM:
      return `https://rpc.minato.soneium.org`;
    default:
      throw new Error("Network not supported");
  }
};