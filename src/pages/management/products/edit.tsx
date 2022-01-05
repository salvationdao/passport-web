import { useState, useEffect } from "react"
import { useHistory } from "react-router-dom"
import { Product } from "../../../types/types"
import { useForm } from "react-hook-form"
import { Spaced } from "../../../components/spaced"
import { Button, Typography, Paper } from "@mui/material"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { InputField } from "../../../components/form/inputField"
import { Alert } from "@mui/material"
import HubKey from "../../../keys"
import { useWebsocket } from "../../../containers/socket"
import { useMutation } from "react-fetching-library"
import { fetching } from "../../../fetching"
import { ImageUpload } from "../../../components/form/imageUpload"

interface FormInput {
	name?: string
	description?: string
}

interface ProductEditProps {
	product?: Product
	isNew: boolean
	stopEditMode: () => void
	onUpdate: (product: Product) => void
}

export const ProductEdit = (props: ProductEditProps) => {
	const { product, isNew, stopEditMode, onUpdate } = props
	const { send } = useWebsocket()
	const { replace } = useHistory()
	const token = localStorage.getItem("token")

	// Setup form
	const { control, handleSubmit, reset } = useForm<FormInput>()
	const [submitting, setSubmitting] = useState(false)
	const [successMessage, setSuccessMessage] = useState<string>()
	const [errorMessage, setErrorMessage] = useState<string>()

	const { mutate: upload } = useMutation(fetching.mutation.fileUpload)
	const [image, setImage] = useState<File>()
	const [imageChanged, setImageChanged] = useState(false)
	const onImageChange = (file?: File) => {
		if (!imageChanged) setImageChanged(true)
		if (!file) {
			setImage(undefined)
		} else {
			setImage(file)
		}
	}

	const onSaveForm = handleSubmit(async (data) => {
		setSubmitting(true)
		try {
			let imageID = product?.imageID
			if (imageChanged) {
				if (!!image) {
					// Upload image
					const r = await upload({ file: image, public: true })
					if (r.error || !r.payload) {
						setErrorMessage("Failed to upload image, please try again.")
						setSubmitting(false)
						return
					}
					imageID = r.payload.id
				} else {
					// Remove image
					imageID = undefined
				}
			}

			const payload = {
				...data,
				imageID,
			}

			const resp = await send<Product>(
				isNew ? HubKey.ProductCreate : HubKey.ProductUpdate,
				product !== undefined ? { slug: product?.slug, ...payload } : payload,
			)
			if (!!resp) {
				onUpdate(resp)
				setSuccessMessage(`Product has been ${isNew ? "created" : "updated"}.`)
				if (isNew) {
					replace(`/products/${resp.slug}`)
				} else {
					replace(`/products/${resp.slug}?edit=true`)
				}
			}
			setErrorMessage(undefined)
		} catch (e) {
			setErrorMessage(typeof e === "string" ? e : "Something went wrong, please try again.")
			setSuccessMessage(undefined)
		} finally {
			setSubmitting(false)
		}
	})
	// Load defaults
	useEffect(() => {
		if (!product) return
		reset(product)
		// Get image as file
		if (!!product.imageID)
			fetch(`/api/files/${product.imageID}?token=${encodeURIComponent(token || "")}`).then((r) =>
				r.blob().then((b) => setImage(new File([b], "image.jpg", { type: b.type }))),
			)
	}, [product, reset, token])

	return (
		<Paper
			component="form"
			onSubmit={onSaveForm}
			sx={{
				maxWidth: "800px",
				margin: "0 auto",
				padding: 2,
				pb: 0,
				display: "flex",
				flexDirection: "column",
				"& .MuiFormControl-root": {
					marginTop: "0.5rem",
				},
			}}
		>
			<Typography variant="h2" color="primary" gutterBottom>
				{`${isNew ? "Create" : "Edit"} Product`}
			</Typography>

			<InputField label="Name" name="name" control={control} rules={{ required: "Name is required." }} disabled={submitting} />

			<InputField label="Description" name="description" control={control} disabled={submitting} />

			<div>
				<Typography variant="subtitle1">Image</Typography>
				<ImageUpload
					label="Upload Image"
					file={image}
					onChange={onImageChange}
					showImageSelectButton
					sx={{
						"& img": {
							width: "unset",
							maxWidth: "400px",
						},
					}}
				/>
			</div>

			<Spaced alignRight height="60px">
				<Button variant="contained" color="primary" onClick={onSaveForm} disabled={submitting} startIcon={<FontAwesomeIcon icon={["fas", "save"]} />}>
					Save
				</Button>
				{!!stopEditMode && (
					<Button variant="contained" onClick={stopEditMode} disabled={submitting}>
						Cancel
					</Button>
				)}

				<div>
					{!!successMessage && <Alert severity="success">{successMessage}</Alert>}
					{!!errorMessage && <Alert severity="error">{errorMessage}</Alert>}
				</div>
			</Spaced>
		</Paper>
	)
}
