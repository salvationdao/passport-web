import { Asset1155Json, AvantBalances, Collection1155 } from "../../types/types"
import { useEffect, useState } from "react"
import { useWeb3 } from "../../containers/web3"
import { Box, Stack, Typography, useMediaQuery } from "@mui/material"
import { Loading } from "../../components/loading"
import { colors } from "../../theme"
import { FancyButton } from "../../components/fancyButton"

interface DepositAssetCardProps {
	uri: string
	balance: AvantBalances
}

export const DepositAssetCard = ({ uri, balance }: DepositAssetCardProps) => {
	const { convertURIWithID } = useWeb3()
	const [asset1155Json, setAsset1155Json] = useState<Asset1155Json>()
	const [isLoading, setIsLoading] = useState<boolean>(true)

	useEffect(() => {
		;(async () => {
			const idURI = convertURIWithID(uri, balance.token_id)
			const resp = await fetch(idURI)
			const asset1155 = (await resp.clone().json()) as Asset1155Json
			setAsset1155Json(asset1155)
			setIsLoading(false)
		})()
	}, [balance.token_id, convertURIWithID, uri])

	return <DepositAssetCardInner assetData={asset1155Json} loading={isLoading} balance={balance} />
}

interface DepositAssetCardInnerProps {
	assetData: Asset1155Json | undefined
	balance: AvantBalances
	loading: boolean
}

const DepositAssetCardInner = ({ assetData, loading, balance }: DepositAssetCardInnerProps) => {
	return (
		<Box
			sx={{
				alignSelf: "stretch",
				p: "1rem",
				width: "20%",
				"@media (max-width: 2000px)": {
					width: "33.33%",
				},
				"@media (max-width: 1500px)": {
					width: "50%",
				},
				"@media (max-width: 1250px)": {
					width: "100%",
				},
			}}
		>
			<Box
				sx={{
					px: "1.3rem",
					py: "1rem",
					height: "100%",
					backgroundColor: `${colors.darkerNavyBlue}90`,
					borderRadius: 2,
					boxShadow: 1,
					overflow: "hidden",
				}}
			>
				{loading && <Loading text="Loading Asset Data" />}
				{assetData && !loading && (
					<Stack sx={{ height: "100%" }}>
						<Box
							component="video"
							sx={{
								width: "100%",
								mb: "1rem",
								p: "1rem",
								height: "12rem",
								background: `radial-gradient(#FFFFFF10 1px, ${colors.darkerNavyBlue}90)`,
								border: "#00000030 1.5px solid",
							}}
							loop
							muted
							autoPlay
							poster={`${assetData.image}`}
						>
							{assetData.animation_url && <source src={assetData.animation_url} type="video/webm" />}
						</Box>

						<Stack spacing="1rem">
							<Typography variant="h5">{assetData.name}</Typography>
							<Typography>{assetData.description}</Typography>
						</Stack>

						<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: "auto", width: "100%", pt: "1rem" }}>
							<Typography variant="h5">Balance: {balance.value_int}x</Typography>
							<FancyButton>Deposit</FancyButton>
						</Stack>
					</Stack>
				)}
			</Box>
		</Box>
	)
}
