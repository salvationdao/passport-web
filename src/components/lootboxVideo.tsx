import { Box, styled, Button, Fade } from "@mui/material"
import React from "react"
import { StringDecoder } from "string_decoder"

interface VideoProps {
	srcURL: string
	setOpen: React.Dispatch<React.SetStateAction<boolean>>
	open: boolean
}

const LootboxVideo: React.FC<VideoProps> = ({ srcURL, setOpen, open }) => {
	const videoURL = {
		"98bf7bb3-1a7c-4f21-8843-458d62884060": "",
		"7c6dde21-b067-46cf-9e56-155c88a520e2": "",
		"880db344-e405-428d-84e5-6ebebab1fe6d": "",
	}

	return (
		<Fade in={open}>
			<Box sx={{ position: "absolute", height: "100vh", width: "100vw", zIndex: 99 }}>
				<Video
					disablePictureInPicture
					disableRemotePlayback
					playsInline
					controlsList="nodownload"
					controls={false}
					muted
					autoPlay
					onEnded={() => {
						setOpen(false)
					}}
				>
					<source src={srcURL} />
				</Video>
				<Box sx={{ position: "absolute", top: "95%", right: "5%" }}>
					<Button
						variant="outlined"
						color="primary"
						onClick={() => {
							setOpen(false)
						}}
					>
						Skip Video
					</Button>
				</Box>
			</Box>
		</Fade>
	)
}
export default LootboxVideo

const Video = styled("video")({
	" video::-internal-media-controls-overlay-cast-button": {
		display: "none",
	},
	height: "100%",
	width: "100%",
})
function useEffect() {
	throw new Error("Function not implemented.")
}
