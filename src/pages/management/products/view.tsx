import { useState, useEffect } from "react"
import Moment from "react-moment"
import { useParams, useHistory } from "react-router-dom"
import { Product } from "../../../types/types"
import { AuthContainer } from "../../../containers"
import { Spaced } from "../../../components/spaced"
import { Spread } from "../../../components/spread"
import { Loading } from "../../../components/loading"
import { Perm } from "../../../types/enums"
import { DetailList } from "../../../components/detailList"
import { Typography, Button, Tooltip } from "@mui/material"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { ArchiveToggleButton } from "../../../components/archiveToggleButton"
import { ProductEdit } from "./edit"
import { useQuery } from "../../../hooks/useSend"
import HubKey from "../../../keys"
import { Alert } from "@mui/material"
import { GetItemIcon } from "../../../helpers/loadicons"
import { Box } from "@mui/material"

export const ProductPage = () => {
	const { slug } = useParams<{ slug: string }>()
	const isNew = !slug
	const token = localStorage.getItem("token")
	const history = useHistory()
	const { hasPermission } = AuthContainer.useContainer()

	// Get Product
	const { loading, error, payload: product, setPayload: setProduct } = useQuery<Product>(HubKey.ProductGet, !isNew, { slug })

	// Editing
	const [editMode, _setEditMode] = useState(isNew)
	const canEdit = (isNew && hasPermission(Perm.ProductCreate)) || hasPermission(Perm.ProductUpdate)

	const setEditMode = (value: boolean) => {
		_setEditMode(value)
		history.push({ search: value ? "edit=true" : undefined })
	}

	useEffect(() => {
		// Set edit mode based on edit search param
		if (isNew) return
		const params = new URLSearchParams(history.location.search)
		_setEditMode(params.get("edit") === "true")
	}, [history.location.search, isNew])

	// Edit Mode?
	if (!isNew && !product && loading) return <Loading />
	if (editMode) {
		return (
			<ProductEdit
				product={product}
				isNew={isNew}
				stopEditMode={() => {
					if (isNew) history.push(`/products`)
					else setEditMode(false)
				}}
				onUpdate={(o) => setProduct({ ...product, ...o })}
			/>
		)
	}

	// Loading
	if (!product && loading) return <Loading />
	if (!product) return <></>

	const details = [
		{ label: "Name", value: product.name },
		{ label: "Description", value: product.description },
		{ label: "Created At", value: <Moment date={product.createdAt} format="YYYY/MM/DD - h:mma" /> },
	]

	return (
		<Box
			sx={{
				maxWidth: "800px",
				margin: "1rem auto",
			}}
		>
			{error && <Alert severity="error">{error}</Alert>}
			<Spread>
				<Spaced>
					<FontAwesomeIcon icon={GetItemIcon("product", "fas")} size="2x" />
					<Typography variant="h2">{product.name}</Typography>
				</Spaced>

				<Spaced>
					<ArchiveToggleButton
						name={product.name}
						id={product.id}
						archiveHubKey={HubKey.ProductArchive}
						unarchiveHubKey={HubKey.ProductUnarchive}
						archived={!!product.deletedAt}
						onUpdate={(value: Product) => setProduct({ ...product, deletedAt: value.deletedAt })}
						archivePerm={Perm.ProductArchive}
						unarchivePerm={Perm.ProductUnarchive}
					/>
					{canEdit && (
						<Tooltip title="Edit product">
							<Button onClick={() => setEditMode(true)} variant="contained" color="primary" startIcon={<FontAwesomeIcon icon={["fas", "edit"]} />}>
								Edit
							</Button>
						</Tooltip>
					)}
				</Spaced>
			</Spread>

			<DetailList
				details={details}
				header={
					product.imageID && (
						<Box
							component="img"
							alt="preview"
							src={`/api/files/${product.imageID}?token=${encodeURIComponent(token || "")}`}
							sx={{
								width: "100%",
							}}
						/>
					)
				}
			/>
		</Box>
	)
}
