import { Box, Stack, Typography } from "@mui/material"
import React, { useEffect, useState } from "react"
import { useHistory, useParams } from "react-router-dom"
import { BuyTokens } from "../components/buy/buyTokens"
import { GradientCircleThing } from "../components/home/gradientCircleThing"
import { Loading } from "../components/loading"
import { useAuth } from "../containers/auth"
import { useWeb3 } from "../containers/web3"
import { Navbar } from "../components/home/navbar"
import { colors } from "../theme"
import { FancyButton } from "../components/fancyButton"
import { useSubscription } from "../containers/ws"
import HubKey from "../keys"
import { supFormatter } from "../helpers/items"
import { BigNumber } from "ethers"

export const IFrameTransactionPage: React.FC = () => {
	const { amount, claim_id } = useParams<{ claim_id: string; amount: string }>()
	const { user, loading } = useAuth()
	const [userSupsBN, setUserSupsBN] = useState<BigNumber>(BigNumber.from(0))
	const [amountBN] = useState<BigNumber>(BigNumber.from(amount))

	const userSups = useSubscription<string>({
		URI: `/user/${user?.id}/sups`,
		key: HubKey.UserSupsSubscribe,
		ready: !!user,
	})

	useEffect(() => {
		setUserSupsBN(BigNumber.from(userSups || 0))
	}, [userSups])

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				width: "100%",
				height: "100%",
				padding: "2rem",
			}}
		>
			<Box
				sx={(theme) => ({
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "space-evenly",
					margin: "auto",
					gap: "2rem",
					padding: "4rem",
					border: `2px solid ${theme.palette.secondary.main}`,
				})}
			>
				<Typography
					variant="h2"
					align="center"
					sx={{
						fontWeight: 800,
						fontSize: "1.4rem",
						textTransform: "uppercase",
					}}
				>
					Confirm Transaction
				</Typography>
				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
						backgroundColor: colors.inputBg,
						borderRadius: "10px",
						padding: "1rem",
						margin: "1rem 0",
						gap: "1rem",
						width: "300px",
					}}
				>
					<Box sx={{ display: "flex", justifyContent: "space-between" }}>
						<Typography sx={{ color: colors.lightNavyBlue2, fontWeight: 800 }} variant="h6">
							From:
						</Typography>
						<Typography sx={{ color: colors.lightNavyBlue2, fontWeight: 800 }} variant="h6">
							{user?.username}
						</Typography>
					</Box>
					<Box sx={{ display: "flex", justifyContent: "space-between" }}>
						<Typography sx={{ color: colors.lightNavyBlue2, fontWeight: 800 }} variant="h6">
							To:
						</Typography>
						<Typography sx={{ color: colors.lightNavyBlue2, fontWeight: 800 }} variant="h6">
							Supremacy World
						</Typography>
					</Box>
					<Box sx={{ display: "flex", justifyContent: "space-between" }}>
						<Typography sx={{ color: colors.lightNavyBlue2, fontWeight: 800 }} variant="h6">
							Currency:
						</Typography>
						<Typography sx={{ color: colors.lightNavyBlue2, fontWeight: 800 }} variant="h6">
							SUPS
						</Typography>
					</Box>
					<Box sx={{ display: "flex", justifyContent: "space-between" }}>
						<Typography sx={{ color: colors.lightNavyBlue2, fontWeight: 800 }} variant="h6">
							Amount:
						</Typography>
						<Typography sx={{ color: colors.lightNavyBlue2, fontWeight: 800 }} variant="h6">
							{supFormatter(amountBN.toString())}
						</Typography>
					</Box>
					<Box sx={{ display: "flex", justifyContent: "space-between" }}>
						<Typography sx={{ color: colors.lightNavyBlue2, fontWeight: 800 }} variant="h6">
							Current Balance:
						</Typography>
						<Typography sx={{ color: colors.lightNavyBlue2, fontWeight: 800 }} variant="h6">
							{supFormatter(userSupsBN.toString())}
						</Typography>
					</Box>
					<Box sx={{ display: "flex", justifyContent: "space-between" }}>
						<Typography sx={{ color: colors.lightNavyBlue2, fontWeight: 800 }} variant="h6">
							Balance After:
						</Typography>
						<Typography sx={{ color: colors.lightNavyBlue2, fontWeight: 800 }} variant="h6">
							{supFormatter(userSupsBN.sub(amountBN).toString())}
						</Typography>
					</Box>
				</Box>
				<FancyButton>Confirm Transaction</FancyButton>
			</Box>
		</Box>
	)
}
