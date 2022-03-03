import TwitterIcon from "@mui/icons-material/Twitter"
import YouTubeIcon from "@mui/icons-material/YouTube"
import { Box, IconButton, Link, Stack, Typography } from "@mui/material"
import { LogoWEBP } from "../assets"
import { SUPREMACY_IMAGE_FOLDER } from "../config"
import { IMAGE_FOLDER } from "../pages/sale/salePage"

export const Maintenance = () => {
	return (
		<Box
			sx={{
				position: "relative",
				width: "100vw",
				height: "100vh",
				backgroundColor: "#040B10",
				backgroundImage: `url(${SUPREMACY_IMAGE_FOLDER}/redmountainbg.webp)`,
				backgroundSize: "cover",
				backgroundPosition: "bottom",
				backgroundRepeat: "no-repeat",
			}}
		>
			<Stack
				spacing={1}
				alignItems="center"
				justifyContent="center"
				sx={{
					position: "absolute",
					top: "50%",
					left: 50,
					right: 50,
					transform: "translateY(-60%)",
					zIndex: 3,
				}}
			>
				<Link
					target="_blank"
					href={"https://supremacy.game"}
					sx={{
						width: "100%",
						height: 120,
						"@media (max-width:600px)": {
							height: 50,
						},
					}}
				>
					<Box
						sx={{
							width: "100%",
							height: "100%",
							backgroundImage: `url(${LogoWEBP})`,
							backgroundSize: "contain",
							backgroundPosition: "center",
							backgroundRepeat: "no-repeat",
						}}
					/>
				</Link>

				<Box sx={{ backgroundColor: "#00000099" }}>
					<Stack
						alignItems="center"
						justifyContent="center"
						sx={{
							px: 5,
							py: 3,
							borderRadius: 1,
							backgroundColor: "#00000099",
						}}
					>
						<Typography
							sx={{
								color: "#FFFFFF",
								textAlign: "center",
								fontFamily: "Nostromo Regular Heavy",
								fontSize: "1.9rem",
							}}
						>
							{"WE'LL BE BACK SOON"}
						</Typography>

						{/* <Typography
                            variant="h5"
                            sx={{
                                mb: 0.5,
                                color: colors.neonBlue,
                                textAlign: "center",
                            }}
                        >
                            03/01/2022 10PM PST
                        </Typography> */}

						<Stack
							direction="row"
							gap="2em"
							alignItems="center"
							sx={{
								"& a": {
									color: "white",
									transition: "all .2s",
									"&:hover": {
										transform: "scale(1.2)",
									},
								},
								"& svg, & img": {
									height: "4rem",
									width: "4rem",
									transition: "all .2s",
									"@media (max-width: 1440px)": {
										height: "3rem",
										width: "3rem",
									},
									"@media (max-width: 600px)": {
										height: "2.5rem",
										width: "2.5rem",
									},
								},
							}}
						>
							<IconButton size="small" target="_blank" href="https://discord.com/invite/supremacygame">
								<img src={IMAGE_FOLDER + "/icons/discord.svg"} alt="discord" />
							</IconButton>
							<IconButton size="small" target="_blank" href="https://twitter.com/SupremacyMeta">
								<TwitterIcon />
							</IconButton>
							<IconButton size="small" target="_blank" href="https://youtube.com/supremacygame">
								<YouTubeIcon />
							</IconButton>
						</Stack>
					</Stack>
				</Box>

				{/* Perth time */}
				{/* <CountdownTimer endTime={new Date("Wed Mar 02 2022 14:00:00 GMT+0800")} /> */}
			</Stack>
		</Box>
	)
}

// const CountdownTimer = ({ endTime }: { endTime: Date }) => {
// 	const [, setTimeRemain] = useState<number>(0)
// 	const [delay, setDelay] = useState<number | null>(null)
// 	const [hours, setHours] = useState<number>()
// 	const [minutes, setMinutes] = useState<number>()
// 	const [seconds, setSeconds] = useState<number>()

// 	useEffect(() => {
// 		if (endTime) {
// 			setDelay(1000)
// 			const d = moment.duration(moment(endTime).diff(moment()))
// 			setTimeRemain(Math.max(Math.round(d.asSeconds()), 0))
// 			return
// 		}
// 		setDelay(null)
// 	}, [])

// 	useInterval(() => {
// 		setTimeRemain((t) => Math.max(t - 1, 0))
// 		const d = moment.duration(moment(endTime).diff(moment()))
// 		const hours = Math.floor(d.asHours())
// 		const minutes = Math.floor(d.asMinutes()) - hours * 60
// 		const seconds = Math.floor(d.asSeconds()) - hours * 60 * 60 - minutes * 60
// 		setHours(Math.max(hours, 0))
// 		setMinutes(Math.max(minutes, 0))
// 		setSeconds(Math.max(seconds, 0))
// 	}, delay)

// 	return (
// 		<Stack direction="row" justifyContent="space-around" sx={{ mt: 2, backgroundColor: "#00000099", borderRadius: 1 }}>
// 			<Stack alignItems="center" sx={{ px: 2, py: 1.5, width: 110, backgroundColor: "#00000099" }}>
// 				<Typography variant="h5" sx={{ color: colors.neonBlue }}>
// 					{hours}
// 				</Typography>
// 				<Typography variant="h6">HOURS</Typography>
// 			</Stack>
// 			<Stack alignItems="center" sx={{ px: 2, py: 1.5, width: 110, backgroundColor: "#00000099" }}>
// 				<Typography variant="h5" sx={{ color: colors.neonBlue }}>
// 					{minutes}
// 				</Typography>
// 				<Typography variant="h6">MINUTES</Typography>
// 			</Stack>
// 			<Stack alignItems="center" sx={{ px: 2, py: 1.5, width: 110, backgroundColor: "#00000099" }}>
// 				<Typography variant="h5" sx={{ color: colors.neonBlue }}>
// 					{seconds}
// 				</Typography>
// 				<Typography variant="h6">SECONDS</Typography>
// 			</Stack>
// 		</Stack>
// 	)
// }
