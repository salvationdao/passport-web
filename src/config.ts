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

export const NFT_CONTRACT_ADDRESS = process.env.REACT_APP_NFT_CONTRACT_ADDRESS || "0x0B921c2014ab181B7f2109Ae56DEd3534ff0a156"
export const SUPS_CONTRACT_ADDRESS = process.env.REACT_APP_SUPS_CONTRACT_ADDRESS || "0x5e8b6999B44E011F485028bf1AF0aF601F845304"
export const WETH_CONTRACT_ADDRESS = process.env.REACT_APP_WETH_CONTRACT_ADDRESS || "0x8cAEF228f1C322e34B04AD77f70b9f4bDdbd0fFD"
export const USDC_CONTRACT_ADDRESS = process.env.REACT_APP_USDC_CONTRACT_ADDRESS || "0x8BB4eC208CDDE7761ac7f3346deBb9C931f80A33"
export const WBNB_CONTRACT_ADDRESS = process.env.REACT_APP_WBNB_CONTRACT_ADDRESS || "0xb2564d8Fd501868340eF0A1281B2aDA3E4506C7F"
export const BUSD_CONTRACT_ADDRESS = process.env.REACT_APP_BUSD_CONTRACT_ADDRESS || "0xeAf33Ba4AcA3fE3110EAddD7D4cf0897121583D0"

export const ETHEREUM_CHAIN_ID = process.env.REACT_APP_ETHEREUM_CHAIN_ID || "5"
export const BINANCE_CHAIN_ID = process.env.REACT_APP_BINANCE_CHAIN_ID || "97"

export const PURCHASE_ADDRESS = process.env.REACT_APP_PURCHASE_ADDRESS || "0x5591eBC09A89A8B11D9644eC1455e294Fd3BAbB5"
export const WITHDRAW_ADDRESS = process.env.REACT_APP_WITHDRAW_ADDRESS || "0x2EBb5cd54C71eeD2fE9A82036588De38c59eB0E0"
export const REDEEM_ADDRESS = process.env.REACT_APP_REDEEM_ADDRESS || "0xc01c2f6DD7cCd2B9F8DB9aa1Da9933edaBc5079E"
