import { Box, Checkbox, FormControl, Input, InputLabel, TextareaAutosize, Typography, useTheme } from "@mui/material"
import React, { useEffect, useState } from "react"
import { API_ENDPOINT_HOSTNAME } from "../config"
import { useAuth } from "../containers/auth"
import { useWeb3 } from "../containers/web3"
import { colors } from "../theme"
import { EarlyContributorModal } from "./earlyContributorModal"

import { FancyButton } from "./fancyButton"
import { Loading } from "./loading"

interface EarlyContributorProps {
	setSigned: React.Dispatch<React.SetStateAction<boolean>>
	setAgreed: React.Dispatch<React.SetStateAction<boolean>>
}

export const EarlyContributorSignMessage: React.FC<EarlyContributorProps> = ({ setSigned, setAgreed }) => {
	const theme = useTheme()
	const { signEarlyContributors, wcProvider } = useWeb3()
	const [canSign, setCanSign] = useState(false)
	const [email, setEmail] = useState<string>()
	const [name, setName] = useState<string>()
	const [phone, setPhone] = useState<string>()
	const [agree, setAgree] = useState<boolean>(false)
	const [decline, setDecline] = useState<boolean>(false)
	const [showModal, setShowModal] = useState<boolean>(false)
	const [checked, setChecked] = useState<boolean>(false)
	const [wcLoading, setWcLoading] = useState<boolean>(false)

	useEffect(() => {
		if (agree || decline) {
			setChecked(true)
		} else {
			setChecked(false)
		}
	}, [agree, decline])

	const signedSAFT = async () => {
		try {
			if (email && name && phone) {
				return await signEarlyContributors(name, phone, email, agree)
			}
		} catch (e) {
			console.log(e)
		}
		return false
	}

	const signMessage = async (name?: string, phone?: string, email?: string) => {
		if (email && name && phone) {
			if (!agree) {
				setShowModal(true)
				return
			}
			if (wcProvider) setWcLoading(true)
			const signed = await signedSAFT()
			setAgreed(signed)
			if (wcProvider) setWcLoading(false)

			if (signed) setSigned(signed)
		}
	}

	const emailOnChange = (email: string) => {
		let re =
			/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

		if (re.test(email)) {
			setEmail(email)
			setCanSign(true)
		} else {
			setCanSign(false)
		}
	}

	const modalOnClose = () => {
		setShowModal(false)
	}

	const handleClickAgree = () => {
		if (!decline) {
			setAgree(!agree)
			return
		}
		setAgree(!agree)
		setDecline(!decline)
	}

	const handleClickDecline = () => {
		if (!agree) {
			setDecline(!decline)
			return
		}
		setAgree(!agree)
		setDecline(!decline)
	}

	return (
		<>
			<EarlyContributorModal open={showModal} onClose={modalOnClose} signedSAFT={signedSAFT} />
			<Box sx={{ position: "relative", width: "100%", maxWidth: "45em" }}>
				{wcLoading && (
					<Box sx={{ position: "absolute", top: "50%", right: "25%", left: "25%" }}>
						<Loading text="Check wallet to sign signature" />
					</Box>
				)}
				<Box
					sx={{
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						flexDirection: "column",
						gap: "2em",
						filter: wcLoading ? "blur(3px)" : "unset",
						opacity: wcLoading ? "0.2" : "1",
					}}
				>
					<Typography variant="h3">Early Contributor SAFT Agreement</Typography>
					<Box
						sx={{
							width: "100%",
							overflow: "scroll",
							maxWidth: "45em",
							maxHeight: "15em",
							overflowX: "hidden",
							border: `2px solid  ${theme.palette.primary.main}`,
							scrollbarWidth: "none",
							"::-webkit-scrollbar": {
								width: 4,
							},
							"::-webkit-scrollbar-track": {
								boxShadow: `inset 0 0 5px ${colors.darkNavyBackground}`,
								borderRadius: 3,
							},
							"::-webkit-scrollbar-thumb": {
								background: colors.darkNeonBlue,
								borderRadius: 3,
							},
						}}
					>
						<Box sx={{ p: "2em" }}>
							Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ipsum non quasi dolorem unde molestias vel alias itaque eum officia
							tempora cupiditate quidem consectetur fuga magni soluta perspiciatis, nobis optio accusantium? Minus eveniet quo saepe. Porro
							assumenda numquam, in pariatur hic ab. Temporibus ex non veritatis veniam, excepturi ipsa minus quibusdam accusantium ipsam neque,
							consectetur quisquam iste mollitia, praesentium dolores perferendis. Harum magnam perspiciatis cumque voluptatem amet maiores
							corrupti nobis odio, sunt commodi quo totam sed dolores omnis, atque quibusdam optio dolorum ducimus. Dicta dolorem a est possimus
							repellat eos soluta. Ducimus officiis rem amet maxime nam soluta, voluptatem ad! Adipisci harum dolorem modi doloremque cum mollitia
							enim rem eaque perferendis maxime saepe iusto quos, reprehenderit quis dolores consectetur veniam ex? Quo repudiandae vel maiores
							quasi, unde alias cupiditate? Expedita praesentium labore sit, asperiores reiciendis modi nesciunt non, neque fuga error ea
							repellendus beatae id iure amet recusandae fugit, molestias hic! Obcaecati expedita, pariatur cupiditate qui vero et animi atque
							error quis tempore natus odit a, praesentium incidunt, deserunt reprehenderit enim sed commodi quibusdam eos optio! Alias minima
							optio laudantium cumque! Aperiam perspiciatis aspernatur veniam explicabo quia voluptatem ratione? Corrupti, omnis enim non nesciunt
							suscipit nobis hic possimus maiores cum quas earum voluptatibus ipsa ducimus labore facere error, expedita vero officiis? Eius, enim
							similique! Ipsam molestiae corporis possimus, vel delectus sapiente eveniet iusto maiores inventore hic voluptate, sunt deserunt!
							Ipsam sequi numquam est vel, quibusdam nemo architecto rem quam exercitationem possimus? Commodi debitis ducimus voluptate iure
							incidunt ex, quisquam ipsa placeat vitae quasi similique inventore, porro, neque modi illum! Molestiae magni nemo aspernatur fugit
							ducimus, quaerat recusandae nulla in vel voluptatum. Quas ullam dolorem perferendis cumque eius ea dolore cupiditate natus mollitia
							et aliquam sed reprehenderit voluptatum odit tempore, nobis quidem saepe dignissimos labore laudantium repellendus obcaecati
							doloremque consequuntur. Numquam, omnis!
						</Box>
					</Box>
					<Box sx={{ display: "flex", width: "100%", gap: "2em", justifyContent: "center" }}>
						<Box sx={{ display: "flex", width: "100%", justifyContent: "center", flexDirection: "column" }}>
							<InputLabel htmlFor="name">Full Name</InputLabel>
							<Input
								id="name"
								onChange={(e) => {
									setName(e.currentTarget.value)
								}}
							/>
						</Box>
						<Box sx={{ display: "flex", width: "100%", justifyContent: "center", flexDirection: "column" }}>
							<InputLabel htmlFor="mobile-number">Mobile Number</InputLabel>
							<Input
								type="number"
								id="mobile-number"
								onChange={(e) => {
									setPhone(e.currentTarget.value)
								}}
							/>
						</Box>
					</Box>
					<Box sx={{ display: "flex", width: "100%", justifyContent: "center", flexDirection: "column" }}>
						<InputLabel htmlFor="email">Email</InputLabel>
						<Input
							id="email"
							type="email"
							onChange={(e) => {
								emailOnChange(e.currentTarget.value)
							}}
						/>
					</Box>
					<Box sx={{ display: "flex", width: "100%", justifyContent: "center", flexDirection: "column", gap: "0.5em" }}>
						<Box sx={{ display: "flex", width: "100%", justifyContent: "center", flexDirection: "row", alignItems: "center" }}>
							<Checkbox
								id="agree"
								onChange={() => {
									handleClickAgree()
								}}
								checked={agree}
							/>

							<InputLabel htmlFor="agree">I ACCEPT the above agreement</InputLabel>
						</Box>
						<Box sx={{ display: "flex", width: "100%", justifyContent: "center", flexDirection: "row", alignItems: "center" }}>
							<Checkbox
								id="decline"
								onChange={() => {
									handleClickDecline()
								}}
								checked={decline}
							/>
							<InputLabel htmlFor="decline">I DECLINE the above agreement</InputLabel>
						</Box>
					</Box>

					<FancyButton disabled={email && name && phone && checked && canSign ? false : true} onClick={() => signMessage(name, phone, email)}>
						Sign Message
					</FancyButton>
				</Box>
			</Box>
		</>
	)
}
