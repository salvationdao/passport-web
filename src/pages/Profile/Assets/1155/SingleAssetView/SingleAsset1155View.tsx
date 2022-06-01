import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import OpenInNewIcon from "@mui/icons-material/OpenInNew"
import { Box, Button, ButtonProps, Dialog, Divider, Link, Stack, styled, Typography, useMediaQuery } from "@mui/material"
import { formatDistanceToNow } from "date-fns"
import isFuture from "date-fns/isFuture"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useHistory } from "react-router-dom"
import { useInterval } from "react-use"
import { FancyButton } from "../../../../../components/fancyButton"
import { Loading } from "../../../../../components/loading"
import { API_ENDPOINT_HOSTNAME } from "../../../../../config"
import { useWeb3 } from "../../../../../containers/web3"
import { getStringFromShoutingSnakeCase } from "../../../../../helpers"
import HubKey from "../../../../../keys"
import { colors, fonts } from "../../../../../theme"
import { Rarity } from "../../../../../types/enums"
import { OnChainStatus, User1155Asset, User1155AssetView, UserAsset } from "../../../../../types/purchased_item"
import { Collection, User } from "../../../../../types/types"
import { usePassportCommandsUser } from "../../../../../hooks/usePassport"
import { rarityTextStyles } from "../../../../../helpers/items"
import { Withdraw1155AssetModal } from "../Withdraw1155AssetModal"
import { Transfer1155Modal } from "./Modals/Transfer1155Modal"

export interface UserAssetResponse {
	user_asset: User1155AssetView
	owner: User // only `faction_id` and `username` is populated
	collection: Collection
}

interface SingleAsset1155ViewProps {
	tokenID: number
	locked: boolean
	collection_slug: string
	edit: boolean
	ownerID: string
}

export const SingleAsset1155View = ({ tokenID, edit, locked, collection_slug, ownerID }: SingleAsset1155ViewProps) => {
	const { send } = usePassportCommandsUser("/commander")
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const [userAsset, setUserAsset] = useState<User1155AssetView>()
	const [owner, setOwner] = useState<User>()
	const [collection, setCollection] = useState<Collection>()

	const loadAsset = useCallback(() => {
		;(async () => {
			try {
				setLoading(true)
				const resp = await send<UserAssetResponse>(HubKey.AssetGet1155, {
					token_id: tokenID,
					collection_slug: collection_slug,
					owner_id: ownerID,
					locked: locked,
				})

				if (!resp) return
				setUserAsset(resp.user_asset)
				setOwner(resp.owner)
				setCollection(resp.collection)
			} catch (e) {
				console.error(e)
				setError(typeof e === "string" ? e : "Something went wrong while fetching the item's data. Please try again later.")
			} finally {
				setLoading(false)
			}
		})()
	}, [collection_slug, locked, ownerID, send, tokenID])

	useEffect(() => {
		loadAsset()
	}, [loadAsset])

	if (loading || !userAsset || !owner || !collection) {
		return (
			<Stack sx={{ flexGrow: 1, p: "2rem", height: "100%" }}>
				<Loading text={"Loading asset information..."} />
			</Stack>
		)
	}

	const openseaURL =
		collection.mint_contract === "0x17f5655c7d834e4772171f30e7315bbc3221f1ee"
			? `https://testnets.opensea.io/assets/goerli/${collection.mint_contract}/${userAsset.external_token_id}`
			: `https://opensea.io/assets/${collection.mint_contract}/${userAsset.external_token_id}`

	return <AssetView openseaURL={openseaURL} owner={owner} userAsset={userAsset} collection={collection} error={error} edit={edit} />
}

interface AssetViewProps {
	owner: User
	userAsset: User1155AssetView
	collection: Collection
	error: string | null
	openseaURL: string
	edit: boolean
}

export const AssetView = ({ owner, userAsset, collection, error, openseaURL, edit }: AssetViewProps) => {
	const history = useHistory()
	const isWiderThan1000px = useMediaQuery("(min-width:1000px)")
	const [showWithdrawModal, setWithdrawModal] = useState(false)
	const [transferModalOpen, setTransferModalOpen] = useState<boolean>(false)

	const Buttons = useMemo(() => {
		return (
			<>
				<FancyButton size="small" onClick={() => setTransferModalOpen(true)}>
					{userAsset.service_name_locked_in && `Transition from ${userAsset.service_name_locked_in} to XSYN`}
					{!userAsset.service_name_locked_in && `Transition from XSYN to supremacy`}
				</FancyButton>

				{!userAsset.service_name_locked_in && userAsset.count > 0 && (
					<FancyButton size="small" onClick={() => setWithdrawModal(true)}>
						Withdraw {userAsset.label}
					</FancyButton>
				)}
			</>
		)
	}, [userAsset.count, userAsset.label, userAsset.service_name_locked_in])

	if (error) {
		return (
			<Stack alignItems="center" justifyContent="center" sx={{ flexGrow: 1, p: "2rem" }}>
				{error}
			</Stack>
		)
	}

	console.log(collection.mint_contract)
	return (
		<>
			<Stack sx={{ flexGrow: 1, p: "2rem" }}>
				<Link
					variant="h5"
					underline="hover"
					sx={{
						alignSelf: "start",
						display: "flex",
						alignItems: "center",
						mb: "1rem",
						textTransform: "uppercase",
					}}
					color={colors.white}
					component={"button"}
					onClick={() => history.goBack()}
				>
					<ChevronLeftIcon />
					Go Back
				</Link>

				{!isWiderThan1000px && (
					<Stack spacing=".5rem" alignItems="flex-start" sx={{ mb: "1rem" }}>
						{edit && Buttons}
					</Stack>
				)}
				<Stack spacing="1rem">
					<Box
						sx={{
							display: "flex",
							flexWrap: "wrap",
							gap: "1.6rem",
						}}
					>
						<Box
							sx={{
								position: "relative",
								width: "100%",
								maxWidth: "23rem",
							}}
						>
							<Box
								component="video"
								sx={{
									width: "100%",
								}}
								loop
								muted
								autoPlay
								poster={`${userAsset.image_url}`}
							>
								{userAsset.animation_url && <source src={userAsset.animation_url} type="video/webm" />}
							</Box>
						</Box>

						<Box
							sx={{
								flex: 1,
								flexBasis: "400px",
							}}
						>
							<Typography
								variant="h4"
								sx={{
									textTransform: "uppercase",
								}}
							>
								{userAsset.label}
							</Typography>

							<Box
								sx={{
									display: "flex",
									alignItems: "baseline",
									gap: ".5rem",
								}}
							>
								<Typography variant="subtitle2" color={colors.darkGrey}>
									Owned By:
								</Typography>
								<Typography variant="subtitle1" color={colors.skyBlue}>
									{owner.username}
								</Typography>
							</Box>
							<Box
								sx={{
									display: "flex",
									alignItems: "baseline",
									gap: ".5rem",
								}}
							>
								<Typography variant="subtitle2" color={colors.darkGrey}>
									Current location:
								</Typography>
								<Typography variant="subtitle1" color={userAsset.service_name_locked_in ? colors.skyBlue : colors.lightGrey}>
									{userAsset.service_name_locked_in ? userAsset.service_name_locked_in : "XSYN"}
								</Typography>
								<Typography variant="subtitle2" color={colors.darkGrey}>
									Amount Owned:
								</Typography>
								<Typography variant="subtitle1" color={userAsset.service_name_locked_in ? colors.skyBlue : colors.lightGrey}>
									{userAsset.count.toString()}
								</Typography>
							</Box>

							<Divider sx={{ mt: ".6rem", mb: "1rem" }} />

							{isWiderThan1000px && (
								<Stack spacing=".5rem" alignItems="flex-start">
									{edit && Buttons}
								</Stack>
							)}
						</Box>
					</Box>

					<Box
						sx={{
							display: "flex",
							flexWrap: "wrap",
							gap: "1rem",
							justifyContent: "center",
						}}
					>
						<Box
							sx={{
								flex: 1,
								flexBasis: "400px",
								"& > *:not(:last-child)": {
									mb: "1rem",
								},
							}}
						>
							<Box>
								<Typography
									variant="subtitle1"
									color={colors.neonPink}
									sx={{
										textTransform: "uppercase",
									}}
								>
									Info
								</Typography>
								<Divider
									sx={{
										m: ".5rem 0",
									}}
								/>
								<Typography variant="body1">Part of the {collection.name} collection.</Typography>
							</Box>
							<Box>
								<Typography
									variant="subtitle1"
									color={colors.neonPink}
									sx={{
										textTransform: "uppercase",
									}}
								>
									Details
								</Typography>
								<Divider
									sx={{
										m: ".5rem 0",
									}}
								/>
								<Box
									sx={{
										display: "flex",
										flexDirection: "column",
										alignItems: "start",
									}}
								>
									<Button component={"a"} href={openseaURL} target="_blank" rel="noopener noreferrer" endIcon={<OpenInNewIcon />}>
										View on OpenSea
									</Button>

									<StyledDisabledButton>
										View Transaction History
										<Box component="span" sx={{ ml: ".5rem", color: colors.darkGrey }}>
											(Coming soon)
										</Box>
									</StyledDisabledButton>
								</Box>
							</Box>
						</Box>
					</Box>
				</Stack>
			</Stack>

			{transferModalOpen && (
				<Transfer1155Modal
					open={transferModalOpen}
					onClose={() => {
						console.log("CLOSE")
					}}
					onSuccess={() => {
						console.log("SUCCESS")
					}}
					userAsset={userAsset}
					collectionSlug={collection.slug}
				/>
			)}

			{showWithdrawModal && userAsset.count > 0 && (
				<Withdraw1155AssetModal
					open={showWithdrawModal}
					tokenID={userAsset.external_token_id.toString()}
					asset={userAsset}
					mintContract={collection.mint_contract}
				/>
			)}
		</>
	)
}

const StyledDisabledButton = styled(({ navigate, ...props }: ButtonProps & { navigate?: any }) => <Button {...props} variant="text" disabled />)({
	justifyContent: "start",
	color: `${colors.darkerGrey} !important`,
})
