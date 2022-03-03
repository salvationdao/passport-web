import { Backdrop, Box, Fade } from "@mui/material"
import React, { useEffect, useRef } from "react"
import { IMAGE_FOLDER, VIDEO_FOLDER } from "../../pages/sale/salePage"
import { colors } from "../../theme"

interface Props {
	loading: boolean
	setLoading: React.Dispatch<React.SetStateAction<boolean>>
}

export const Loading = ({ loading, setLoading }: Props) => {
	useEffect(() => {
		setTimeout(() => {
			if (loading) setLoading(false)
		}, 5000)
	}, [loading, setLoading])
	return (
		<Box sx={{ position: "absolute", top: 0, left: 0, zIndex: 1000 }}>
			<Fade in={loading} appear={false} timeout={1000}>
				<Backdrop open={true} sx={{ backgroundColor: colors.black2 }}>
					<Loader />
				</Backdrop>
			</Fade>
		</Box>
	)
}

export const Loader = () => {
	const loadingVideoRef = useRef<HTMLVideoElement>(null!)
	useEffect(() => {
		// Fix  video not playing for iphones low-power mode
		window.document.body.addEventListener("touchstart", () => {
			// IF video is not already playing
			if (loadingVideoRef.current && loadingVideoRef.current.played.length === 0) {
				loadingVideoRef.current.play()
			}
		})
	}, [])

	return (
		<Box
			sx={{
				width: "100%",
				height: "100%",
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				perspective: "100%",
			}}
		>
			<video
				ref={loadingVideoRef}
				disablePictureInPicture
				disableRemotePlayback
				playsInline
				controlsList="nodownload"
				controls={false}
				muted
				loop
				autoPlay
				poster={IMAGE_FOLDER + "/placeholder/loading.png"}
			>
				<source src={VIDEO_FOLDER + "/loading.webm"} />
				<source src={VIDEO_FOLDER + "/loading.mov"} />
				<img src={IMAGE_FOLDER + "/placeholder/loading.png"} alt="loading" />
			</video>
		</Box>
	)
}
