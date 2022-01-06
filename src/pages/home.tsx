import { Box } from "@mui/material"
import { keyframes, styled } from "@mui/system"
import XSYNLogoImage from "../assets/images/XSYN Stack White.svg"


export const Home = () => {
	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				minHeight: "100vh",
			}}
		>
			<Box sx={{
				position: "relative",
				display: "flex",
				justifyContent: "space-between",
				alignItems: "center",
				width: "100%",
				maxWidth: "1700px",
				margin: "0 auto",
				marginTop: "3rem",
			}}>
				<OuterCircle>
					<Box sx={(theme) => ({
						zIndex: 1,
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						backgroundColor: theme.palette.background.default,
						opacity: .6
					})} />
					<Box sx={{
						position: "absolute",
						top: "50%",
						left: "50%",
						height: "60%",
						width: "60%",
						transform: "translate(-50%, -50%)",
						borderRadius: "50%",
						background: "linear-gradient(300deg,#5072d9,#9a59e3,#d957cc,#449deb)",
						backgroundSize: "100% 100%",
						animation: `${gradientAnimation} 4s ease infinite`
					}} />
				</OuterCircle>


				<Box component="img" src={XSYNLogoImage} alt="XSYN Logo" />
				<Box sx={{
					position: "relative",
					height: "3rem",
					width: "3rem",
				}}>
					<Box component="span" sx={(theme) => ({
						position: "absolute",
						top: 0,
						left: 0,
						height: "2rem",
						width: ".2rem",
						transform: "rotate(30deg)",
						backgroundColor: theme.palette.common.white,
					})} />
					<Box component="span" sx={(theme) => ({
						position: "absolute",
						top: 0,
						left: "1rem",
						height: "2rem",
						width: ".2rem",
						transform: "rotate(30deg)",
						backgroundColor: theme.palette.common.white,
					})} />
					<Box component="span" sx={(theme) => ({
						position: "absolute",
						top: 0,
						left: "2rem",
						height: "2rem",
						width: ".2rem",
						transform: "rotate(30deg)",
						backgroundColor: theme.palette.common.white,
					})} />
				</Box>
			</Box>
		</Box >
	)
}

const OuterCircle = styled("div")(({ theme }) => ({
	overflow: "hidden",
	position: "absolute",
	top: "0",
	left: "50%",
	height: "70vw",
	width: "70vw",
	transform: "translate(-50%, 0)",
	borderRadius: "50%",
	border: `2px solid ${theme.palette.secondary.main}`
}))

const gradientAnimation = keyframes`
	0% {
		background-position: 0% 50%;
	}
	50% {
		background-position: 100% 50%;
	}
	100% {
		background-position: 0% 50%;
	}
`