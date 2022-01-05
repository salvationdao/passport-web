import { Box, Card, Typography } from "@mui/material"
import { styled } from "@mui/material/styles"

interface DetailListProps {
	details: {
		label: string
		value: JSX.Element | string
	}[]
	noMargin?: boolean
	header?: React.ReactNode
}

export const DetailList = (props: DetailListProps) => {
	const { details, noMargin, header } = props
	return (
		<Card style={noMargin ? undefined : { margin: "1rem 0" }}>
			{header}
			{details.map((detail, index) => (
				<DetailRow
					key={`detail-${detail.label}`}
					label={detail.label}
					value={detail.value}
					blank={!detail.value || detail.value === "N/A"}
					altRow={index % 2 === 0}
				/>
			))}
		</Card>
	)
}

const Container = styled("div")(({ theme }) => ({
	padding: "10px",
	[theme.breakpoints.up("xl")]: {
		display: "grid",
		gridTemplateColumns: "250px auto",
	},
}))

export const DetailRow = (props: { label: string; value: React.ReactNode; altRow?: boolean; blank?: boolean }) => {
	return (
		<Container
			sx={{
				bgcolor: props.altRow ? "lightgrey" : "unset",
			}}
		>
			<Typography variant="subtitle2" sx={{ alignSelf: "center", marginRight: "10px" }}>
				{props.label}
			</Typography>
			<Box sx={{ color: props.blank ? "text.secondary" : "text.primary" }}>{props.value}</Box>
		</Container>
	)
}
