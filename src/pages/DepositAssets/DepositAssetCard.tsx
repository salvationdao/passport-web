import { Asset1155Json } from "../../types/types"
import { useEffect, useState } from "react"
import { useWeb3 } from "../../containers/web3"
import { Box, Stack, Typography } from "@mui/material"
import { Loading } from "../../components/loading"
import { colors } from "../../theme"
import { FancyButton } from "../../components/fancyButton"
import { BigNumber } from "ethers"
import { DespositAssetModal } from "./DespositAssetModal"

interface DepositAssetCardProps {
	uri: string
	tokenID: number
	balance: BigNumber[] | undefined
	mintContract: string
	transferAddress: string
	showOwned: boolean
}

export const DepositAssetCard = ({ uri, balance, tokenID, mintContract, transferAddress, showOwned }: DepositAssetCardProps) => {
	const { convertURIWithID } = useWeb3()
	const [asset1155Json, setAsset1155Json] = useState<Asset1155Json>()
	const [isLoading, setIsLoading] = useState<boolean>(true)
	const [canDeposit, setCanDeposit] = useState<boolean>(false)
	const [open, setOpen] = useState<boolean>(false)
	const [canShow, setCanShow] = useState<boolean>(false)

	useEffect(() => {
		;(async () => {
			const idURI = convertURIWithID(uri, tokenID)
			const resp = await fetch(idURI)
			const asset1155 = (await resp.clone().json()) as Asset1155Json
			setAsset1155Json(asset1155)
			setIsLoading(false)
		})()
	}, [tokenID, convertURIWithID, uri])

	useEffect(() => {
		if (!balance) return
		if (balance[tokenID]) {
			if (balance[tokenID].gt(BigNumber.from("0"))) {
				setCanDeposit(true)
			}
		}
	}, [balance, tokenID])

	useEffect(() => {
		if (!balance) return
		if (showOwned) {
			if (balance[tokenID].gt(BigNumber.from(0))) {
				setCanShow(true)
				return
			}
			setCanShow(false)
		} else {
			setCanShow(true)
		}
	}, [balance, showOwned, tokenID])

	return (
		<DepositAssetCardInner
			assetData={asset1155Json}
			loading={isLoading}
			balance={balance && balance[tokenID]}
			canDeposit={canDeposit}
			open={open}
			setOpen={setOpen}
			mintContract={mintContract}
			tokenID={tokenID}
			transferAddress={transferAddress}
			canShow={canShow}
		/>
	)
}

interface DepositAssetCardInnerProps {
	assetData: Asset1155Json | undefined
	balance: BigNumber | undefined
	loading: boolean
	canDeposit: boolean
	setOpen: (value: ((prevState: boolean) => boolean) | boolean) => void
	open: boolean
	mintContract: string
	tokenID: number
	transferAddress: string
	canShow: boolean
}

const DepositAssetCardInner = ({
	assetData,
	loading,
	balance,
	canDeposit,
	setOpen,
	open,
	mintContract,
	tokenID,
	transferAddress,
	canShow,
}: DepositAssetCardInnerProps) => {
	return (
		<>
			<Box
				sx={{
					display: canShow ? undefined : "none",
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
								<FancyButton
									disabled={!canDeposit}
									onClick={() => {
										setOpen(true)
									}}
								>
									Deposit
								</FancyButton>
							</Stack>
						</Stack>
					)}
				</Box>
			</Box>

			{balance && assetData && (
				<DespositAssetModal
					asset={assetData}
					open={open}
					mintContract={mintContract}
					maxAmount={balance}
					tokenID={tokenID}
					transferAddress={transferAddress}
					setOpen={setOpen}
				/>
			)}
		</>
	)
}
