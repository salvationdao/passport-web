import { Box, styled, SxProps } from "@mui/system"
import { differenceInSeconds } from "date-fns"
import React, { useCallback } from "react"
import { useInterval } from "react-use"
import { colors } from "../../theme"
import { useHistory } from "react-router"

const CountdownSectionContainer = styled(Box)({
	display: "flex",
	alignItems: "flex-end",
	"& span": {
		display: "block",
		paddingBottom: ".7rem",
	},
})

const CountdownSection = styled(Box)({
	display: "flex",
	flexDirection: "column",
	alignItems: "center",
	textTransform: "uppercase",
	fontSize: "1.5rem",
	fontFamily: "Nostromo Regular Black",
	margin: "0 .2em",
	"@media (max-width:1440px)": {
		fontSize: "2.5vmin",
	},
	"@media (max-width:600px)": {
		fontSize: "5vmin",
	},
})

const CountdownSectionLabel = styled("p")({
	margin: 0,
	fontFamily: "Nostromo Regular Heavy",
	WebkitTextStrokeWidth: "1px",
	WebkitTextStrokeColor: colors.black,
	"@media (max-width:900px)": {
		WebkitTextStrokeWidth: ".5px",
	},
})

const CountdownSectionValue = styled(Box)({
	width: "100%",
	padding: ".5rem",
	textAlign: "center",
	fontFamily: "Nostromo Regular Black",
	backgroundColor: colors.darkNavyBackground,
	color: colors.neonBlue,
})

interface CountdownTimerProps {
	publicSale?: boolean
	sx?: SxProps
	date: Date
}

export const CountdownTimer: React.FC<CountdownTimerProps> = (props) => {
	const { publicSale, sx, date } = props
	const history = useHistory()
	// Set the date
	// const date = new Date(`2022-02-24T00:00:00.000+00:00`)
	const [remaining, setRemaining] = React.useState({
		d: 0,
		h: 0,
		m: 0,
		s: 0,
	})

	useInterval(() => {
		const seconds = differenceInSeconds(date, Date.now())
		var d = Math.floor(seconds / (3600 * 24))
		var h = Math.floor((seconds % (3600 * 24)) / 3600)
		var m = Math.floor((seconds % 3600) / 60)
		var s = Math.floor(seconds % 60)
		setRemaining({
			d,
			h,
			m,
			s,
		})
		if (publicSale && seconds <= 0) {
			history.go(0)
		}
	}, 1000)

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				gap: "1rem",
				...sx,
			}}
		>
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					gridTemplateColumns: "repeat(4, 3rem)",
					"& div": {
						fontSize: publicSale ? "3vmin" : "unset",
						"@media (max-width:600px)": {
							fontSize: "5vmin",
						},
					},
				}}
			>
				<CountdownSectionContainer>
					<CountdownSection>
						<CountdownSectionLabel>D</CountdownSectionLabel>
						<CountdownSectionValue>{remaining.d.toString().padStart(2, "0")}</CountdownSectionValue>
					</CountdownSection>
					<span>:</span>
				</CountdownSectionContainer>
				<CountdownSectionContainer>
					<CountdownSection>
						<CountdownSectionLabel>H</CountdownSectionLabel>
						<CountdownSectionValue>{remaining.h.toString().padStart(2, "0")}</CountdownSectionValue>
					</CountdownSection>
					<span>:</span>
				</CountdownSectionContainer>
				<CountdownSectionContainer>
					<CountdownSection>
						<CountdownSectionLabel>M</CountdownSectionLabel>
						<CountdownSectionValue>{remaining.m.toString().padStart(2, "0")}</CountdownSectionValue>
					</CountdownSection>
					<span>:</span>
				</CountdownSectionContainer>
				<CountdownSectionContainer>
					<CountdownSection>
						<CountdownSectionLabel>S</CountdownSectionLabel>
						<CountdownSectionValue>{remaining.s.toString().padStart(2, "0")}</CountdownSectionValue>
					</CountdownSection>
				</CountdownSectionContainer>
			</Box>
		</Box>
	)
}

export interface TimeLeft {
	days: string
	hours: string
	minutes: string
	seconds: string
}

export const calculateTimeLeft = (targetDate: Date): TimeLeft => {
	const difference = +targetDate - +new Date()

	const timeLeft = {
		days: "0",
		hours: "0",
		minutes: "0",
		seconds: "0",
	}
	if (difference > 0) {
		timeLeft.days = padToLengthOfTwo(Math.floor(difference / (1000 * 60 * 60 * 24)))
		timeLeft.hours = padToLengthOfTwo(Math.floor((difference / (1000 * 60 * 60)) % 24))
		timeLeft.minutes = padToLengthOfTwo(Math.floor((difference / 1000 / 60) % 60))
		timeLeft.seconds = padToLengthOfTwo(Math.floor(difference / 1000) % 60)
	}

	return timeLeft
}

const padToLengthOfTwo = (value: number) => {
	if (value < 10) {
		return "0" + value
	}
	return `${value}`
}
