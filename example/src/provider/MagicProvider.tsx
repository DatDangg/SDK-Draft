import { initMagic, MagicProvider } from "magic-wrapper-sdk";

import { ALCHEMY_API_SECRET_KEY, API_SECRET_KEY, NETWORK } from "@/helpers/env";
import { MarketPlaceInfo, NFTInfo } from "@/web3/contract.info";

initMagic(API_SECRET_KEY || "", NETWORK, ALCHEMY_API_SECRET_KEY);

const MagicProviderWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <MagicProvider
      apiKey="pk_live_892FF1AE695D43B9"
      network="soneium"
      MarketPlaceInfo={MarketPlaceInfo}
      NFTInfo={NFTInfo}
    >
      {children}
    </MagicProvider>
  );
};

export default MagicProviderWrapper;
