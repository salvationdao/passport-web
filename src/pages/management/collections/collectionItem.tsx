import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Link, Paper, TextField, Typography } from "@mui/material"
import React, { useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useHistory, useParams } from "react-router-dom"
import { PlaceholderMechImagePath, SupremacyLogoImagePath, SupTokenIcon } from "../../../assets"
import { FancyButton } from "../../../components/fancyButton"
import { InputField } from "../../../components/form/inputField"
import { Navbar } from "../../../components/home/navbar"
import { Loading } from "../../../components/loading"
import { useAsset } from "../../../containers/assets"
import { useAuth } from "../../../containers/auth"
import { useSnackbar } from "../../../containers/snackbar"
import { SocketState, useWebsocket } from "../../../containers/socket"
import { supFormatter } from "../../../helpers/items"
import HubKey from "../../../keys"
import { colors } from "../../../theme"
import { NilUUID } from "../../../types/auth"
import { Asset } from "../../../types/types"

export const CollectionItemPage: React.VoidFunctionComponent = () => {
	const { token_id: id } = useParams<{ username: string; collection_name: string; token_id: string }>()
	const tokenID = parseInt(id)
	const history = useHistory()

	const { displayMessage } = useSnackbar()
	const { userID } = useAuth()
	const { subscribe, send, state } = useWebsocket()
	const [collectionItem, setCollectionItem] = useState<Asset>()

	// Queuing war machine
	const { queuedWarMachine, queuingContractReward } = useAsset()
	const queueDetail = queuedWarMachine(tokenID)
	const [submitting, setSubmitting] = useState(false)
	const isWarMachine = (): boolean => {
		if (!collectionItem) return false
		// loops through asset's attributes checks if it has a trait_type of "Asset Type", and value of "War Machine"
		const wm = collectionItem.attributes.filter((a) => a.trait_type === "Asset Type" && a.value === "War Machine")
		return wm.length > 0
	}

	const onDeploy = async () => {
		if (!tokenID) return
		setSubmitting(true)
		try {
			await send(HubKey.AssetJoinQueue, { assetTokenID: tokenID })
			displayMessage(`Successfully deployed ${collectionItem?.name}`, "success")
		} catch (e) {
			displayMessage(typeof e === "string" ? e : "Something went wrong, please try again.", "error")
		} finally {
			setSubmitting(false)
		}
	}

	const leaveQueue = async () => {
		if (!tokenID) return
		setSubmitting(true)
		try {
			await send(HubKey.AssetLeaveQue, { assetTokenID: tokenID })
		} catch (e) {
			displayMessage(typeof e === "string" ? e : "Something went wrong, please try again.", "error")
		} finally {
			setSubmitting(false)
		}
	}

	const payInsurance = async () => {
		if (!tokenID) return
		setSubmitting(true)
		try {
			await send(HubKey.AssetInsurancePay, { assetTokenID: tokenID })
		} catch (e) {
			displayMessage(typeof e === "string" ? e : "Something went wrong, please try again.", "error")
		} finally {
			setSubmitting(false)
		}
	}

	useEffect(() => {
		if (state !== SocketState.OPEN || !subscribe) return

		return subscribe<Asset>(
			HubKey.AssetUpdated,
			(payload) => {
				setCollectionItem(payload)
			},
			{ tokenID },
		)
	}, [subscribe, tokenID, state])

	if (!collectionItem) {
		return <Loading />
	}

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				minHeight: "100vh",
			}}
		>
			<Navbar
				sx={{
					marginBottom: "2rem",
				}}
			/>
			<Box
				sx={{
					display: "flex",
					width: "100%",
					flexDirection: "column",
					alignItems: "center",
					marginBottom: "2rem",
					padding: "0 2rem",
				}}
			>
				<Box
					component="img"
					src={SupremacyLogoImagePath}
					alt="Collection Logo"
					sx={{
						width: "100%",
						maxWidth: "300px",
						padding: ".5rem",
					}}
				/>
				<Typography
					variant="h1"
					sx={{
						textTransform: "uppercase",
						fontSize: "1.6rem",
						color: colors.neonPink,
					}}
				>
					Collection
				</Typography>
			</Box>

			<Box
				sx={{
					flex: 1,
					display: "flex",
					flexDirection: "column",
					width: "100%",
					maxWidth: "1700px",
					margin: "0 auto",
					marginBottom: "3rem",
					padding: "0 3rem",
					borderRadius: 0,
				}}
			>
				<Link
					variant="h5"
					underline="hover"
					sx={{
						alignSelf: "start",
						display: "flex",
						alignItems: "center",
						marginBottom: "1rem",
						textTransform: "uppercase",
					}}
					color={colors.white}
					component={"button"}
					onClick={() => history.goBack()}
				>
					<ChevronLeftIcon />
					Go Back
				</Link>

				<Paper
					sx={{
						display: "flex",
						padding: "2rem",
						borderRadius: 0,
						"@media (max-width: 1000px)": {
							flexDirection: "column",
						},
					}}
				>
					{/* Image */}
					<Box
						component="img"
						src={PlaceholderMechImagePath}
						alt="Mech image"
						sx={{
							alignSelf: "start",
							flex: 1,
							width: "100%",
							minWidth: 0,
							// maskImage: "linear-gradient(to bottom, rgba(0, 0, 0, 1.0) 50%, transparent 100%)",
							"@media (max-width: 1000px)": {
								alignSelf: "center",
								flex: "unset",
								maxWidth: "300px",
							},
						}}
					/>
					<Box
						sx={{
							minWidth: "2rem",
							minHeight: "2rem",
						}}
					/>

					{/* Info */}
					<Box
						sx={{
							flex: 1,
							display: "flex",
							flexDirection: "column",
						}}
					>
						<Box
							sx={{
								marginBottom: "1.5rem",
							}}
						>
							<Typography
								variant="h1"
								sx={{
									textTransform: "uppercase",
									fontSize: "2rem",
								}}
							>
								{collectionItem.name}
								{collectionItem.frozenAt && (
									<Box
										component="span"
										sx={{
											color: colors.skyBlue,
										}}
									>
										(Frozen)
									</Box>
								)}
							</Typography>
							<Typography variant="body1">{collectionItem.description}</Typography>
						</Box>

						<Box
							sx={{
								marginBottom: "1.5rem",
							}}
						>
							<Typography
								variant="h6"
								component="p"
								color={colors.darkGrey}
								sx={{
									marginBottom: ".5rem",
									textTransform: "uppercase",
								}}
							>
								Queue Status
							</Typography>
							{queueDetail ? (
								<>
									<Typography>
										<Box
											component="span"
											fontWeight={500}
											color={colors.darkGrey}
											sx={{
												marginRight: ".5rem",
											}}
										>
											Queue Position:
										</Box>
										{queueDetail.position !== -1 ? `${queueDetail.position + 1}` : "In Game"}
									</Typography>
									<Typography
										sx={{
											display: "flex",
											alignItems: "center",
											"& svg": {
												height: ".8rem",
											},
											"& > *:not(:last-child)": {
												marginRight: ".2rem",
											},
										}}
									>
										<Box component="span" fontWeight={500} color={colors.darkGrey}>
											Contract Reward:
										</Box>
										<SupTokenIcon />
										{supFormatter(queueDetail.warMachineMetadata.contractReward)}
									</Typography>
									{queueDetail.warMachineMetadata.isInsured ? (
										<Typography>
											<Box
												component="span"
												fontWeight={500}
												color={colors.darkGrey}
												sx={{
													marginRight: ".5rem",
												}}
											>
												Insurance Status:
											</Box>
											Insured
										</Typography>
									) : (
										<Typography>
											<Box
												component="span"
												fontWeight={500}
												color={colors.darkGrey}
												sx={{
													marginRight: ".5rem",
												}}
											>
												Insurance Status:
											</Box>
											Not Insured
										</Typography>
									)}
								</>
							) : (
								<Typography
									sx={{
										display: "flex",
										alignItems: "center",
										"& svg": {
											height: ".8rem",
										},
										"& > *:not(:last-child)": {
											marginRight: ".2rem",
										},
									}}
								>
									<Box component="span" fontWeight={500} color={colors.darkGrey}>
										Contract Reward:
									</Box>
									<SupTokenIcon />
									{supFormatter(queuingContractReward)}
								</Typography>
							)}
						</Box>

						<Box
							sx={{
								marginBottom: "1.5rem",
							}}
						>
							<Typography
								variant="h6"
								component="p"
								color={colors.darkGrey}
								sx={{
									marginBottom: "1rem",
									textTransform: "uppercase",
								}}
							>
								Properties
							</Typography>

							<Box
								sx={{
									display: "grid",
									gridTemplateColumns: "repeat(3, 1fr)",
									gap: "1rem",
									"@media (max-width: 600px)": {
										gridTemplateColumns: "repeat(2, 1fr)",
									},
								}}
							>
								{collectionItem.attributes.map((attr, i) => {
									return <TextField key={`${attr.trait_type}-${attr.value}-${i}`} label={attr.trait_type} value={attr.value} disabled />
								})}
							</Box>
						</Box>
						<Box flex="1" />

						<Box>
							<Typography
								variant="h6"
								component="p"
								color={colors.darkGrey}
								sx={{
									marginBottom: "1rem",
									textTransform: "uppercase",
								}}
							>
								Actions
							</Typography>
							{userID === collectionItem.userID ? (
								!collectionItem.frozenAt && isWarMachine() ? (
									<FancyButton onClick={() => onDeploy()} fullWidth>
										Deploy
									</FancyButton>
								) : (
									<>
										{!queueDetail?.warMachineMetadata.isInsured && (!collectionItem.lockedByID || collectionItem.lockedByID === NilUUID) && (
											<FancyButton
												loading={submitting}
												onClick={payInsurance}
												sx={{
													marginBottom: ".5rem",
												}}
												fullWidth
											>
												Pay Insurance
											</FancyButton>
										)}
										<FancyButton loading={submitting} onClick={leaveQueue} borderColor={colors.errorRed} fullWidth>
											Leave
										</FancyButton>
									</>
								)
							) : null}
						</Box>
					</Box>
				</Paper>
			</Box>
		</Box>
	)
}

export const UpdateNameModal = (props: { isOpen: boolean; onClose: () => void; asset: Asset; userID: string }) => {
	const { isOpen, onClose, asset, userID } = props
	const { send } = useWebsocket()
	const { displayMessage } = useSnackbar()
	const { control, handleSubmit, setValue } = useForm<{ name: string }>()
	const [loading, setLoading] = useState(false)

	const getName = useCallback(() => {
		let result = ""
		const attr = asset.attributes.filter((a) => a.trait_type === "Name")
		if (attr.length > 0) {
			result = `${attr[0].value}`
		}
		return result
	}, [asset])

	const onSubmit = handleSubmit(async ({ name }) => {
		setLoading(true)
		try {
			await send<Asset>(HubKey.AssetUpdateName, {
				tokenID: asset.tokenID,
				userID,
				name,
			})
			setLoading(false)
			displayMessage("Asset successfully updated", "success")
			onClose()
		} catch (e) {
			displayMessage(typeof e === "string" ? e : "Something went wrong, please try again.", "error")
			setLoading(false)
		} finally {
		}
	})

	// set default name
	useEffect(() => {
		setValue("name", getName())
	}, [getName, setValue])

	return (
		<Dialog onClose={() => onClose()} open={isOpen}>
			<DialogTitle>Update Asset Name</DialogTitle>
			<DialogContent
				sx={{
					backgroundColor: colors.navyBlue,
				}}
			>
				<form onSubmit={onSubmit}>
					<InputField
						name="name"
						label="name"
						type="name"
						control={control}
						rules={{
							required: "Name is required.",
						}}
						placeholder="name"
						style={{ width: "300px" }}
						autoFocus
						disabled={loading}
					/>
					<DialogActions>
						<>
							<Button variant="contained" type="submit" color="primary" disabled={loading}>
								Save
							</Button>
							<Button
								variant="contained"
								type="button"
								color="error"
								disabled={loading}
								onClick={() => {
									onClose()
								}}
							>
								Cancel
							</Button>
						</>
					</DialogActions>
				</form>
			</DialogContent>
		</Dialog>
	)
}
