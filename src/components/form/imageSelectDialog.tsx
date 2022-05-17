import {
	Box,
	Alert,
	CircularProgress,
	Pagination,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Button,
	Typography,
	Card,
	Tooltip,
} from "@mui/material"
import { useState, useEffect } from "react"
import { SearchBar } from "../searchBar"
import { useQuery } from "../../hooks/useSend"
import HubKey from "../../keys"

interface ImageSelectDialogProps {
	onClose: () => void
	onSelect: (id: string, fileName: string) => void
}

export const ImageSelectDialog = (props: ImageSelectDialogProps) => {
	const { onClose, onSelect } = props
	const [search, setSearch] = useState("")
	const [page, setPage] = useState(0)
	const [pageSize] = useState(40)
	const { payload, loading, error, query } = useQuery<{ records: { id: string; fileName: string }[]; total: number }>(HubKey.ImageList)
	useEffect(() => {
		query({ page, pageSize, search })
	}, [query, search, page, pageSize])

	const pageCount = !!payload ? Math.ceil(payload.total / pageSize) : 0

	return (
		<Dialog open onClose={onClose} maxWidth="lg">
			<DialogTitle
				sx={{
					display: "flex",
					"& .MuiCircularProgress-root": {
						marginLeft: "0.5rem",
					},
				}}
			>
				<div>Select Image</div>
				{loading && <CircularProgress size="20px" />}
			</DialogTitle>
			<SearchBar value={search} onChange={setSearch} placeholder={`Search Images...`} loading={loading} />
			<DialogContent>
				{error && <Alert severity="error">{error}</Alert>}
				{!!payload && payload.total === 0 && (
					<Typography variant="caption" color="textSecondary" sx={{ textAlign: "center" }}>
						<em>No images found</em>
					</Typography>
				)}
				<Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
					{!!payload &&
						payload.records.map((image) => (
							<Tooltip key={`image-${image.id}`} title={image.fileName}>
								<Card
									sx={{
										marginRight: "0.5rem",
										marginBottom: "0.5rem",
										cursor: "pointer",
										"&:hover": {
											transform: "scale(1.05)",
										},
										transition: "transform 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
									}}
									onClick={() => onSelect(image.id, image.fileName)}
								>
									<Box
										sx={{
											height: "110px",
											minWidth: "108px",
											backgroundColor: "grey",
											backgroundSize: "cover",
											backgroundPositionX: "center",
											cursor: "pointer",
											backgroundImage: `url(/api/files/${image.id}`,
										}}
									/>
								</Card>
							</Tooltip>
						))}
				</Box>
			</DialogContent>
			<DialogActions>
				{pageCount > 1 && <Pagination count={pageCount} page={page} onChange={(_, value) => setPage(value)} sx={{ marginRight: "auto" }} />}
				<Button onClick={onClose}>Cancel</Button>
			</DialogActions>
		</Dialog>
	)
}
