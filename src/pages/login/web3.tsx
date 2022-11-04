import { Alert, Box, Stack, styled } from "@mui/material"
import { useEffect, useState } from "react"
import { MetaMaskIcon, WalletConnectIcon } from "../../assets"
import { FancyButton } from "../../components/fancyButton"
import { MetaMaskLogin } from "../../components/loginMetaMask"
import { WalletConnectLogin } from "../../components/loginWalletConnect"
import { colors } from "../../theme"

export const Web3 = () => {
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (error) {
			const timer = setTimeout(() => {
				setError(null)
			}, 2000)

			return () => {
				clearTimeout(timer)
			}
		}
	}, [error])

	return (
		<Stack sx={{ width: "100%" }}>
			<Box sx={{ borderTop: 1, borderColor: "divider", padding: "20px", flex: 1, display: "flex", width: "100%" }}>
				<Stack
					sx={{
						height: "100%",
						justifyContent: "center",
						alignItems: "center",
						width: "100%",
						maxWidth: "30rem",
						gap: "1rem",
					}}
				>
					<MetaMaskLogin
						onFailure={setError}
						render={(props) => (
							<ConnectButton onClick={props.onClick} loading={props.isProcessing} startIcon={<MetaMaskIcon />}>
								MetaMask
							</ConnectButton>
						)}
					/>
					<WalletConnectLogin
						onFailure={setError}
						render={(props) => (
							<ConnectButton onClick={props.onClick} loading={props.isProcessing} startIcon={<WalletConnectIcon />}>
								Wallet Connect
							</ConnectButton>
						)}
					/>
				</Stack>
			</Box>
			{error && <Alert severity="error">{error}</Alert>}
		</Stack>
	)
}

const ConnectButton = styled(FancyButton)({
	width: "250px",
	borderRadius: ".5rem",
	backgroundColor: colors.darkNavyBlue,
	height: "5rem",
	"& .MuiButton-startIcon>svg": {
		height: "2.5rem",
	},
})
