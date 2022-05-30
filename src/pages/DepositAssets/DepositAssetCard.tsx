import { Asset1155Json, AvantBalances, Collection1155 } from "../../types/types"
import { useEffect, useState } from "react"
import { useWeb3 } from "../../containers/web3"
import { Box, Stack, Typography, useMediaQuery } from "@mui/material"
import { Loading } from "../../components/loading"
import { colors } from "../../theme"
import { FancyButton } from "../../components/fancyButton"
import { BigNumber } from "ethers"

interface DepositAssetCardProps {
	uri: string
	token_id: number
	balance: BigNumber[] | undefined
}

export const DepositAssetCard = ({ uri, balance, token_id }: DepositAssetCardProps) => {
	const { convertURIWithID } = useWeb3()
	const [asset1155Json, setAsset1155Json] = useState<Asset1155Json>()
	const [isLoading, setIsLoading] = useState<boolean>(true)
	const [canDeposit, setCanDeposit] = useState<boolean>(false)

	useEffect(() => {
		;(async () => {
			const idURI = convertURIWithID(uri, token_id)
			const resp = await fetch(idURI)
			const asset1155 = (await resp.clone().json()) as Asset1155Json
			setAsset1155Json(asset1155)
			setIsLoading(false)
		})()
	}, [token_id, convertURIWithID, uri])

	useEffect(() => {
		if (!balance) return
		if (balance[token_id]) {
			if (balance[token_id].gt(BigNumber.from("0"))) {
				setCanDeposit(true)
			}
		}
	}, [balance])

	return <DepositAssetCardInner assetData={asset1155Json} loading={isLoading} balance={balance && balance[token_id]} canDeposit={canDeposit} />
}

interface DepositAssetCardInnerProps {
	assetData: Asset1155Json | undefined
	balance: BigNumber | undefined
	loading: boolean
	canDeposit: boolean
}

const DepositAssetCardInner = ({ assetData, loading, balance, canDeposit }: DepositAssetCardInnerProps) => {
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
							<Typography variant="h5">Balance: {balance ? balance.toString() : "?"}x</Typography>
							<FancyButton disabled={!canDeposit}>Deposit</FancyButton>
						</Stack>
					</Stack>
				)}
			</Box>
		</Box>
	)
}
