import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import OpenInNewIcon from "@mui/icons-material/OpenInNew"
import { Box, Button, ButtonProps, Divider, Link, Stack, styled, Typography, useMediaQuery } from "@mui/material"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useHistory } from "react-router-dom"
import { FancyButton } from "../../../../../components/fancyButton"
import { Loading } from "../../../../../components/loading"
import { BATTLE_ARENA_LINK } from "../../../../../config"
import HubKey from "../../../../../keys"
import { colors } from "../../../../../theme"
import { User1155AssetView } from "../../../../../types/purchased_item"
import { Collection, User } from "../../../../../types/types"
import { usePassportCommandsUser } from "../../../../../hooks/usePassport"
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
		collection.mint_contract === "0xFE8fc4CCC213928ffbA3D92013Da1537a80b2af4"
			? `https://testnets.opensea.io/assets/goerli/${collection.mint_contract}/${userAsset.external_token_id}`
			: `https://opensea.io/assets/${collection.mint_contract}/${userAsset.external_token_id}`

	return (
		<AssetView
			openseaURL={openseaURL}
			owner={owner}
			userAsset={userAsset}
			collection={collection}
			error={error}
			edit={edit}
			loadAsset={loadAsset}
		/>
	)
}

interface AssetViewProps {
	owner: User
	userAsset: User1155AssetView
	collection: Collection
	error: string | null
	openseaURL: string
	edit: boolean
	loadAsset: () => void
}

export const AssetView = ({ owner, userAsset, collection, error, openseaURL, edit, loadAsset }: AssetViewProps) => {
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
				{userAsset.service_name_locked_in && (
					<FancyButton size="small" onClick={() => window.open(`${BATTLE_ARENA_LINK}/hangar`, "_blank")?.focus()}>
						View item in {userAsset.service_name_locked_in}
					</FancyButton>
				)}

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
							</Box>
							<Box
								sx={{
									display: "flex",
									alignItems: "baseline",
									gap: ".5rem",
								}}
							>
								<Typography variant="subtitle2" color={colors.darkGrey}>
									Amount Owned:
								</Typography>
								<Typography variant="subtitle1" color={userAsset.service_name_locked_in ? colors.skyBlue : colors.lightGrey}>
									{userAsset.count.toString()}
								</Typography>
							</Box>

							<Divider sx={{ mt: ".6rem", mb: "1rem" }} />
							<Typography variant="h4">{userAsset.description}</Typography>

							{isWiderThan1000px && (
								<Stack spacing=".5rem" alignItems="flex-start" sx={{ py: "1.5rem" }}>
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
						setTransferModalOpen(false)
					}}
					onSuccess={loadAsset}
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
					onClose={() => {
						loadAsset()
					}}
				/>
			)}
		</>
	)
}

const StyledDisabledButton = styled(({ navigate, ...props }: ButtonProps & { navigate?: any }) => <Button {...props} variant="text" disabled />)({
	justifyContent: "start",
	color: `${colors.darkerGrey} !important`,
})
