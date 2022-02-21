import { Box, TextField, Typography } from "@mui/material"
import { BigNumber } from "bignumber.js"
import React, { useState } from "react"
import Safe from "../assets/images/gradient/safe.png"
import { useAuth } from "../containers/auth"
import { useWebsocket } from "../containers/socket"
import { useWeb3 } from "../containers/web3"
import { useSecureSubscription } from "../hooks/useSecureSubscription"
import HubKey from "../keys"
import { colors } from "../theme"
import { FancyButton } from "./fancyButton"

export const WithdrawSups: React.FC = () => {
	const { account, provider, currentChainId, metaMaskState, changeChain } = useWeb3()
	const { send, state } = useWebsocket()
	const { user } = useAuth()
	const { payload: userSups } = useSecureSubscription<string>(HubKey.UserSupsSubscribe)
	const [withdrawAmount, setWithdrawAmount] = useState<string>("")
	const [withdrawContractAmount, setWithdrawContractAmount] = useState<BigNumber>()

	return (
		<Box component="div" sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3em" }}>
			<Box component={"img"} src={Safe} alt={"SUPS Safe"} sx={{ height: "10rem", width: "10rem" }}></Box>

			<Typography variant="h2" sx={{ color: "primary", textTransform: "uppercase" }}>
				Withdraw $SUPS
			</Typography>
			<Box sx={{ display: "flex", width: "100%", justifyContent: "space-between" }}>
				<Typography variant="h4" sx={{ fontWeight: "bold", textTransform: "uppercase" }}>
					Available $SUPS:{" "}
				</Typography>
				<Typography variant="h4" sx={{ color: colors.skyBlue }}>
					100
				</Typography>
			</Box>
			<TextField fullWidth variant={"filled"} label={"Amount"} />
			<Box>
				<FancyButton sx={{ paddingLeft: "1em", paddingRight: "1em" }}>Withdraw your $sups</FancyButton>
			</Box>
		</Box>
	)
}
