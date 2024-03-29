import { Alert, Box, Divider, Typography } from "@mui/material"
import { BigNumber } from "ethers"
import React, { useCallback, useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { FancyButton } from "../components/fancyButton"
import { SUPREMACY_WORLD_WEB } from "../config"
import { useAuth } from "../containers/auth"
import { useSubscription } from "../containers/ws"
import { supFormatter } from "../helpers/items"
import { usePassportCommandsUser } from "../hooks/usePassport"
import HubKey from "../keys"
import { colors } from "../theme"

interface TransactSupremacyWorldReq {
	claim_id: string
	amount: string
}

export const IFrameTransactionPage: React.FC = () => {
	const { amount, claim_id } = useParams<{ claim_id: string; amount: string }>()
	const { user } = useAuth()
	const [userSupsBN, setUserSupsBN] = useState<BigNumber>(BigNumber.from(0))
	const [amountBN] = useState<BigNumber>(BigNumber.from(amount))
	const { send } = usePassportCommandsUser("/commander")
	const [error, setError] = useState<string>()
	const [successMessage, setSuccessMessage] = useState<string>()

	const userSups = useSubscription<string>({
		URI: `/user/${user?.id}/sups`,
		key: HubKey.UserSupsSubscribe,
		ready: !!user,
	})

	const makeTransaction = useCallback(async () => {
		try {
			setError(undefined)
			setSuccessMessage(undefined)
			await send<unknown, TransactSupremacyWorldReq>(HubKey.MakeSupremacyWorldTransaction, {
				claim_id: claim_id,
				amount: amount,
			})
			setSuccessMessage("Transaction Successful, you may now close this page.")
			window.opener.postMessage({ payment_success: "true" }, SUPREMACY_WORLD_WEB)
		} catch (e) {
			console.error(e)
			if (typeof e === "string") {
				setError(e)
			} else {
				setError("Issue making transaction, please try again or contract support.")
			}
		}
	}, [send, claim_id, amount])

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
				padding: "3rem",
			}}
		>
			<Box
				sx={(theme) => ({
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "space-evenly",
					margin: "auto",
					gap: "1rem",
					padding: "4rem",
					minWidth: "410px",
					position: "relative",
					border: `2px solid ${theme.palette.secondary.main}`,
				})}
			>
				<Typography
					variant="h2"
					align="center"
					sx={{
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
						gap: "1rem",
						width: "100%",
					}}
				>
					<Box sx={{ display: "flex", justifyContent: "space-between" }}>
						<Typography sx={{ color: colors.lightNavyBlue2, fontWeight: 800 }} variant="h6">
							From:
						</Typography>
						<Typography sx={{ color: colors.lightGrey, fontWeight: 800 }} variant="h6">
							{user?.username}
						</Typography>
					</Box>
					<Divider sx={{ borderColor: "#ffffff45" }} />
					<Box sx={{ display: "flex", justifyContent: "space-between" }}>
						<Typography sx={{ color: colors.lightNavyBlue2, fontWeight: 800 }} variant="h6">
							To:
						</Typography>
						<Typography sx={{ color: colors.lightGrey, fontWeight: 800 }} variant="h6">
							Supremacy World
						</Typography>
					</Box>
					<Divider sx={{ borderColor: "#ffffff45" }} />
					<Box sx={{ display: "flex", justifyContent: "space-between" }}>
						<Typography sx={{ color: colors.lightNavyBlue2, fontWeight: 800 }} variant="h6">
							Currency:
						</Typography>
						<Typography sx={{ color: colors.lightGrey, fontWeight: 800 }} variant="h6">
							SUPS
						</Typography>
					</Box>
					<Divider sx={{ borderColor: "#ffffff45" }} />
					<Box sx={{ display: "flex", justifyContent: "space-between" }}>
						<Typography sx={{ color: colors.lightNavyBlue2, fontWeight: 800 }} variant="h6">
							Amount:
						</Typography>
						<Typography sx={{ color: colors.lightGrey, fontWeight: 800 }} variant="h6">
							{supFormatter(amountBN.toString())}
						</Typography>
					</Box>
					<Divider sx={{ borderColor: "#ffffff45" }} />
					<Box sx={{ display: "flex", justifyContent: "space-between" }}>
						<Typography sx={{ color: colors.lightNavyBlue2, fontWeight: 800 }} variant="h6">
							Current Balance:
						</Typography>
						<Typography sx={{ color: colors.lightGrey, fontWeight: 800 }} variant="h6">
							{supFormatter(userSupsBN.toString())}
						</Typography>
					</Box>
					<Divider sx={{ borderColor: "#ffffff45" }} />
					<Box sx={{ display: "flex", justifyContent: "space-between" }}>
						<Typography sx={{ color: colors.lightNavyBlue2, fontWeight: 800 }} variant="h6">
							Balance After:
						</Typography>
						<Typography sx={{ color: colors.lightGrey, fontWeight: 800 }} variant="h6">
							{supFormatter(userSupsBN.sub(amountBN).toString())}
						</Typography>
					</Box>
				</Box>
				<FancyButton fullWidth onClick={makeTransaction} disabled={!!successMessage}>
					Confirm Transaction
				</FancyButton>
				{successMessage && (
					<Alert variant={"outlined"} sx={{ maxWidth: "min-content", minWidth: "100%" }} severity={"success"}>
						{successMessage}
					</Alert>
				)}
				{error && (
					<Alert variant={"outlined"} sx={{ maxWidth: "min-content", minWidth: "100%" }} severity={"error"}>
						{error}
					</Alert>
				)}
				<Typography sx={{ position: "absolute", bottom: 0, right: 5 }} textTransform={"uppercase"}>
					powered by xsyn
				</Typography>
			</Box>
		</Box>
	)
}
