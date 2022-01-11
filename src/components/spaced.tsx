import { styled } from "@mui/material/styles"

interface IProps {
	children: React.ReactNode[]
	alignRight?: boolean
	height?: string
}

const Container = styled("div")({
	display: "flex",
	alignItems: "center",
})
const SpacedElement = styled("div")({
	display: "flex",
	alignItems: "center",
})

// Applies a right margin to child components. eg. Use to place a space between multiple button components.
export const Spaced: React.FC<IProps> = (props) => {
	const children = props.children.filter((c) => c !== undefined && c !== false) as JSX.Element[]

	return (
		<Container
			sx={{
				display: "flex",
				alignItems: "center",
				flexDirection: props.alignRight ? "row-reverse" : "unset",
				height: props.height || "unset",
			}}
		>
			{children.map((element, index) => (
				<SpacedElement
					key={"spaced-" + index}
					sx={
						index !== children.length - 1
							? {
								marginRight: !props.alignRight ? "0.5rem" : "unset",
								marginLeft: props.alignRight ? "0.5rem" : "unset",
							}
							: undefined
					}
				>
					{element}
				</SpacedElement>
			))}
		</Container>
	)
}
