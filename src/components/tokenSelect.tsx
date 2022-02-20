import { Box, MenuItem, outlinedInputClasses, Select, SelectProps, styled, Typography } from "@mui/material"
import React, { useState } from "react"
import BinanceCoin from "../assets/images/crypto/binance-coin-bnb-logo.svg"
import BinanceUSD from "../assets/images/crypto/binance-usd-busd-logo.svg"
import Ethereum from "../assets/images/crypto/ethereum-eth-logo.svg"
import Usdc from "../assets/images/crypto/usd-coin-usdc-logo.svg"
import { BINANCE_CHAIN_ID, ETHEREUM_CHAIN_ID } from "../config"
import { tokenSelect } from "../types/types"

const tokenOptions: tokenSelect[] = [
	{
		name: "Eth",
		networkName: "Ethereum",
		chainId: parseInt(ETHEREUM_CHAIN_ID),
		tokenSrc: Ethereum,
		chainSrc: Ethereum,
		isNative: true,
	},
	{
		name: "Usdc",
		networkName: "Ethereum",
		chainId: parseInt(ETHEREUM_CHAIN_ID),
		tokenSrc: Usdc,
		chainSrc: Ethereum,
		isNative: false,
	},
	{
		name: "Bnb",
		networkName: "Binance",
		chainId: parseInt(BINANCE_CHAIN_ID),
		tokenSrc: BinanceCoin,
		chainSrc: BinanceCoin,
		isNative: true,
	},

	{
		name: "Busd",
		networkName: "Binance",
		chainId: parseInt(BINANCE_CHAIN_ID),
		tokenSrc: BinanceUSD,
		chainSrc: BinanceCoin,
		isNative: false,
	},
]

export const TokenSelect: React.FC = () => {
	const [currentToken, setCurrentToken] = useState<tokenSelect>(tokenOptions[1])

	return (
		<Select
			variant="filled"
			sx={{
				marginBottom: "1rem",
				marginLeft: "auto",
				display: "flex",
				minWidth: "175px",
			}}
			SelectDisplayProps={{ style: { display: "flex", alignItems: "center", padding: ".5rem 32px .5rem .5rem" } }}
			value={currentToken}
		>
			{tokenOptions.map((x) => {
				return (
					<MenuItem key={x.name} sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", justifyItems: "center" }} value={`${x}`}>
						<Box
							component="img"
							src={x.chainSrc}
							alt="Ethereum token symbol"
							sx={{
								height: "1.5rem",
								marginRight: "1rem",
								filter: "grayscale(100%) opacity(70%)",
							}}
						/>
						<Box
							component="img"
							src={x.tokenSrc}
							alt="Ethereum token symbol"
							sx={{
								height: "1.5rem",
								marginRight: "1rem",
							}}
						/>
						<Typography variant="body1" sx={{ textTransform: "uppercase" }}>
							{x.name}
						</Typography>
					</MenuItem>
				)
			})}
		</Select>
	)
}
