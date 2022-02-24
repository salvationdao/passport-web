import { Box, MenuItem, Select, SelectChangeEvent, Typography } from "@mui/material"
import React from "react"
import { useWeb3 } from "../containers/web3"
import { colors } from "../theme"
import { tokenName, tokenSelect } from "../types/types"

interface TokenSelectProps {
	currentToken: tokenSelect
	cb: (newTokenName: tokenSelect) => void
}

export const TokenSelect = ({ currentToken, cb }: TokenSelectProps) => {
	const { tokenOptions } = useWeb3()
	const handleSelectChange = (e: SelectChangeEvent<tokenName>) => {
		const newToken = tokenOptions.find((el) => {
			return el.name === e.target.value
		})
		if (!newToken) {
			return
		}
		if (cb) cb(newToken)
	}

	return (
		<Select
			color="secondary"
			variant="filled"
			sx={{
				background: colors.darkNavyBackground2,
				marginLeft: "auto",
				display: "flex",
				minWidth: "175px",
			}}
			onChange={(e) => handleSelectChange(e)}
			SelectDisplayProps={{ style: { display: "flex", alignItems: "center", padding: ".5rem 32px .5rem .5rem" } }}
			value={currentToken.name}
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
