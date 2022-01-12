import { Action } from "react-fetching-library"

const fileUpload = (values: { file: File; public?: boolean }): Action<{ id: string; msg: string }> => {
	const formData = new FormData()
	const token = localStorage.getItem("token")
	formData.set("file", values.file)
	return {
		method: "POST",
		endpoint: `/files/upload?token=${encodeURIComponent(token || "")}${!!values.public ? "&public=true" : ""}`,
		credentials: "include",
		body: formData,
		responseType: "json",
	}
}

export const mutation = {
	fileUpload,
}
