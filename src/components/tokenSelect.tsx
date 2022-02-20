import { Box, MenuItem, outlinedInputClasses, Select, SelectChangeEvent, SelectProps, styled, Typography } from "@mui/material"
import React, { useState } from "react"
import BinanceCoin from "../assets/images/crypto/binance-coin-bnb-logo.svg"
import BinanceUSD from "../assets/images/crypto/binance-usd-busd-logo.svg"
import Ethereum from "../assets/images/crypto/ethereum-eth-logo.svg"
import Usdc from "../assets/images/crypto/usd-coin-usdc-logo.svg"
import { BINANCE_CHAIN_ID, ETHEREUM_CHAIN_ID } from "../config"
import { tokenSelect, tokenName } from "../types/types"

interface TokenSelectProps {
	currentTokenName: tokenName
	tokenOptions: tokenSelect[]
	setCurrentTokenName: React.Dispatch<React.SetStateAction<tokenName>>
}

export const TokenSelect = ({ currentTokenName, tokenOptions, setCurrentTokenName }: TokenSelectProps) => {
	const handleSelectChange = (e: SelectChangeEvent<unknown>) => {
		setCurrentTokenName(e.target.value as tokenName)
	}

	return (
		<Select
			variant="filled"
			sx={{
				marginBottom: "1rem",
				marginLeft: "auto",
				display: "flex",
				minWidth: "175px",
			}}
			onChange={(e) => handleSelectChange(e)}
			SelectDisplayProps={{ style: { display: "flex", alignItems: "center", padding: ".5rem 32px .5rem .5rem" } }}
			value={currentTokenName}
		>
			{tokenOptions.map((x) => {
				return (
					<MenuItem key={x.name} sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", justifyItems: "center" }} value={x.name}>
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
