export const XGRID_LICENSE = process.env.XGRID_LICENSE_KEY

export const SENTRY_CONFIG = {
	DSN: process.env.REACT_APP_SENTRY_DSN_FRONTEND,
	RELEASE: process.env.REACT_APP_SENTRY_CURRENT_RELEASE_NAME,
	ENVIRONMENT: process.env.REACT_APP_SENTRY_ENVIRONMENT,
	get SAMPLERATE(): number {
		let rate = Number(process.env.REACT_APP_SENTRY_SAMPLERATE)

		// Check rate is a number between 0 and 1
		if (isNaN(rate) || rate > 1 || rate < 0) {
			return 0.01
		}
		return rate
	},
}

export const TOKEN_SALE_ENDPOINT = process.env.REACT_APP_TOKEN_SALE_ENDPOINT || `${window.location.protocol}//${window.location.host}/buy`

export const API_ENDPOINT_HOSTNAME = process.env.REACT_APP_PASSPORT_API_ENDPOINT_HOSTNAME || window.location.host

export const SIGN_MESSAGE = process.env.REACT_APP_PASSPORT_METAMASK_SIGN_MESSAGE || ""
export const BYPASS_WHITELIST = process.env.REACT_APP_BYPASS_WHITELIST || "false"
export const BATTLE_ARENA_LINK = process.env.REACT_APP_BATTLE_ARENA_LINK || "https://staging-watch.supremacy.game"

// export const NFT_CONTRACT_ADDRESS = process.env.REACT_APP_NFT_CONTRACT_ADDRESS || "0xc1ce98f52e771bd82938c4cb6ccaa40dc2b3258d"
// export const NFT_STAKING_CONTRACT_ADDRESS = process.env.REACT_APP_NFT_STAKING_CONTRACT_ADDRESS || "0xceED4Db9234e7374fe3132a2610c31275712685C"
export const SUPS_CONTRACT_ADDRESS = process.env.REACT_APP_SUPS_CONTRACT_ADDRESS || "0x5e8b6999B44E011F485028bf1AF0aF601F845304"
export const USDC_CONTRACT_ADDRESS = process.env.REACT_APP_USDC_CONTRACT_ADDRESS || "0x8BB4eC208CDDE7761ac7f3346deBb9C931f80A33"
export const BUSD_CONTRACT_ADDRESS = process.env.REACT_APP_BUSD_CONTRACT_ADDRESS || "0xeAf33Ba4AcA3fE3110EAddD7D4cf0897121583D0"

export const ETH_SCAN_SITE = process.env.REACT_APP_ETH_SCAN_SITE || "goerli.etherscan.io"
export const BSC_SCAN_SITE = process.env.REACT_APP_BSC_SCAN_SITE || "testnet.bscscan.com"

export const ETHEREUM_CHAIN_ID = process.env.REACT_APP_ETHEREUM_CHAIN_ID || "5"
export const BINANCE_CHAIN_ID = process.env.REACT_APP_BINANCE_CHAIN_ID || "97"

export const PURCHASE_ADDRESS = process.env.REACT_APP_PURCHASE_ADDRESS || "0x5591eBC09A89A8B11D9644eC1455e294Fd3BAbB5"
export const WITHDRAW_ADDRESS = process.env.REACT_APP_WITHDRAW_ADDRESS || "0x9DAcEA338E4DDd856B152Ce553C7540DF920Bb15"
export const REDEEM_ADDRESS = process.env.REACT_APP_REDEEM_ADDRESS || "0xc01c2f6DD7cCd2B9F8DB9aa1Da9933edaBc5079E"

export const WALLET_CONNECT_RPC = process.env.REACT_APP_WALLET_CONNECT_RPC || "1375aa321ac8ac6cfba6aa9c"
export const ENABLE_WHITELIST_CHECK = process.env.REACT_APP_ENABLE_WHITELIST_CHECK || true
