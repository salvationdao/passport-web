import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Alert, Avatar, Backdrop, Box, Button, Typography } from "@mui/material"
import { styled } from "@mui/material/styles"
import { SxProps, Theme } from "@mui/system"
import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { API_ENDPOINT_HOSTNAME } from "../../config"
import { formatBytes } from "../../helpers"
import { ImageSelectDialog } from "./imageSelectDialog"

interface ImageUploadProps {
	file?: File
	onChange: (file?: File) => void
	/** Default: to `1e7` */
	maxFileSize?: number
	/** Default: "Upload" */
	label?: string
	sx?: SxProps<Theme> | undefined
	avatarPreview?: boolean
	showImageSelectButton?: boolean
}

const Input = styled("input")({
	display: "none",
})

export const ImageUpload = (props: ImageUploadProps) => {
	const { file, onChange, label, avatarPreview, maxFileSize, showImageSelectButton, sx } = props
	const [errorMessage, setErrorMessage] = useState<string>()

	const [showImageSelectDialog, setShowImageSelectDialog] = useState(false)
	const onSelectImage = (id: string, fileName: string) => {
		fetch(`${window.location.protocol}//${API_ENDPOINT_HOSTNAME}/api/files/${id}`)
			.then((r) => r.blob())
			.then((b) => {
				onChange(new File([b], fileName, { type: b.type }))
				setErrorMessage(undefined)
			})
	}

	const onRemove = () => {
		onChange(undefined)
		setErrorMessage(undefined)
	}

	const onDrop = useCallback(
		(files: File[]) => {
			if (files.length <= 0) return
			const file = files[0]
			if (!!maxFileSize && file.size > maxFileSize) {
				setErrorMessage("File is larger than the max file size: " + formatBytes(maxFileSize))
				return
			}

			onChange(file)
			setErrorMessage(undefined)
		},
		[maxFileSize, onChange],
	)
	const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				...sx,
			}}
		>
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				}}
				{...getRootProps()}
				onClick={(e) => e.stopPropagation()}
			>
				<input {...getInputProps()} />

				{!!file &&
					(avatarPreview ? (
						<Avatar
							src={URL.createObjectURL(file)}
							sx={{
								width: "100%",
								height: "100%",
								mb: 1,
								boxShadow: 1,
							}}
						/>
					) : (
						<Box
							component="img"
							alt="preview"
							src={URL.createObjectURL(file)}
							sx={{
								width: "100%",
								mb: 1,
								borderRadius: 1,
								boxShadow: 1,
							}}
						/>
					))}
				<Box display="flex">
					<label htmlFor="contained-button-file">
						<Input
							accept="image/*"
							id="contained-button-file"
							type="file"
							onChange={(e) => !!e.target.files && onDrop([e.target.files[0]])}
						/>
						<Button
							variant="contained"
							component="span"
							color="primary"
							fullWidth
							startIcon={<FontAwesomeIcon icon={["fas", "camera"]} />}
							sx={{ whiteSpace: "nowrap" }}
						>
							{label}
						</Button>
					</label>

					{showImageSelectButton && (
						<Button
							variant="contained"
							size="small"
							onClick={(e) => {
								e.stopPropagation()
								setShowImageSelectDialog(true)
							}}
							startIcon={<FontAwesomeIcon icon={["fas", "images"]} />}
							sx={{ ml: 1 }}
						>
							Select Existing Image
						</Button>
					)}

					{!!file && (
						<Button
							sx={{ minWidth: "25px", ml: 1 }}
							variant="contained"
							color="error"
							title="Remove"
							onClick={(e) => {
								e.stopPropagation()
								onRemove()
							}}
						>
							<FontAwesomeIcon icon={["fal", "times"]} />
						</Button>
					)}
				</Box>
			</Box>
			<Backdrop
				sx={{
					color: "#fff",
					zIndex: (theme) => theme.zIndex.drawer + 1,
					userSelect: "none",
					pointerEvents: "none",
				}}
				open={isDragActive}
			>
				<Box display="flex" alignItems="center">
					<FontAwesomeIcon icon={["fas", "camera"]} />
					<Typography variant="subtitle2" sx={{ ml: 1 }}>
						{label}
					</Typography>
				</Box>
			</Backdrop>
			{errorMessage && (
				<Alert severity="error" sx={{ mt: 1 }}>
					{errorMessage}
				</Alert>
			)}

			{showImageSelectDialog && (
				<ImageSelectDialog
					onClose={() => setShowImageSelectDialog(false)}
					onSelect={(id, fileName) => {
						setShowImageSelectDialog(false)
						onSelectImage(id, fileName)
					}}
				/>
			)}
		</Box>
	)
}

ImageUpload.defaultProps = {
	filesLimit: 1,
	maxFileSize: 1e7,
	label: "Upload",
}
