import { useState } from "react"
import { Button, Popover, Typography } from "@mui/material"
import { plural } from "pluralize"
import ReactDiffViewer from "react-diff-viewer"
import moment from "moment"
import { ItemTable } from "../../components/itemTable"
import HubKey from "../../keys"
import { User, UserActivity } from "../../types/types"
import { DetailList } from "../../components/detailList"
import { ObjectType } from "../../types/enums"
import { ItemLink } from "../../components/itemLink"
import { Box } from "@mui/material"
import { UserAvatar } from "../../components/userAvatar"

/**
 * User Activity List Page.
 */
export const UserActivityList = () => {
	const [displayUserActivity, setDisplayUserActivity] = useState<UserActivity>()
	const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
	const open = Boolean(anchorEl)
	const id = open ? "simple-popover" : undefined
	const details = displayUserActivity
		? [
				{ label: "User", value: displayUserActivity.user.email },
				{ label: "Action", value: displayUserActivity.action },
				{
					label: "Object",
					value: <UserActivityObjectID value={displayUserActivity} />,
				},
				{
					label: "Date Created",
					value: moment(displayUserActivity.createdAt).local().format("YYYY/MM/DD - h:mma"),
				},
		  ]
		: []

	return (
		<Box
			sx={{
				height: "100%",
				display: "flex",
				flexDirection: "column",
			}}
		>
			<ItemTable
				name={"User Activity"}
				hubKey={HubKey.UserActivityList}
				sortBy={"created_at"}
				sortDir={"desc"}
				updateSearchParams
				hideCreateButton
				hideArchiveButton
				columns={[
					{
						field: "avatar_url",
						headerName: " ",
						width: 50,
						minWidth: 50,
						renderCell: (p) => <UserAvatar user={p.row.user as User} />,
						filterable: false,
						sortable: false,
						resizable: false,
						disableColumnMenu: true,
					},
					{ field: `"user.email"`, headerName: "User", width: 250, valueGetter: (p) => p.row.user.email },
					{ field: "action", headerName: "Action", width: 250 },
					{
						field: "object_name",
						headerName: "Object",
						width: 280,
						renderCell: (p) => <UserActivityObjectID value={p.row as UserActivity} />,
					},
					{
						field: "created_at",
						headerName: "Date Created",
						type: "date",
						width: 170,
						valueGetter: (p) => moment(p.row.createdAt).local().format("DD/MM/YYYY, hh:mm:ss"),
					},
					{
						field: "details",
						headerName: "Details",
						width: 145,
						align: "right",
						headerAlign: "right",
						sortable: false,
						filterable: false,
						disableColumnMenu: true,
						renderCell: (p) =>
							(!!p.row.newData && Object.keys(p.row.newData).length > 0) || (!!p.row.oldData && Object.keys(p.row.oldData).length > 0) ? (
								<Button
									variant="contained"
									onClick={(e) => {
										e.stopPropagation()
										setDisplayUserActivity(p.row as UserActivity)
										setAnchorEl(e.currentTarget)
									}}
								>
									View Details
								</Button>
							) : (
								<></>
							),
					},
				]}
			/>

			<Popover
				id={id}
				open={open}
				anchorEl={anchorEl}
				onClose={() => setAnchorEl(null)}
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "center",
				}}
				transformOrigin={{
					vertical: "top",
					horizontal: "center",
				}}
			>
				{displayUserActivity && (
					<Box sx={{ maxWidth: "60vw" }}>
						<DetailList details={details} noMargin />

						{/* Changes */}
						{!!displayUserActivity.oldData && !!displayUserActivity.newData && (
							<>
								<Typography
									style={{
										padding: "10px",
										boxSizing: "border-box",
										fontWeight: 600,
									}}
								>
									Changes
								</Typography>
								<ReactDiffViewer
									oldValue={Object.keys(displayUserActivity.oldData).length > 0 ? JSON.stringify(displayUserActivity.oldData, null, 2) : undefined}
									newValue={JSON.stringify(displayUserActivity.newData, null, 2)}
									showDiffOnly
									splitView={Object.keys(displayUserActivity.oldData).length > 0}
									hideLineNumbers
									disableWordDiff
								/>
							</>
						)}
					</Box>
				)}
			</Popover>
		</Box>
	)
}
const UserActivityObjectID = (props: { value: UserActivity }) => {
	const { value } = props
	const token = localStorage.getItem("token")
	if (!value.objectID) return <div>{value.objectType}</div>

	const objID = value.objectID.length < 8 ? value.objectID : value.objectID.substr(0, 8) + "..."

	if (!value.objectSlug || !value.objectType) return <div>{objID}</div>

	const objType = value.objectType.toLowerCase()
	const pluralName = plural(objType)

	let link = ""
	switch (value.objectType) {
		case ObjectType.Blob:
			link = `/api/files/${value.objectID}?token=${encodeURIComponent(token || "")}`
			break
		default:
			link = `/${pluralName}/${value.objectSlug}`
			break
	}

	return <ItemLink label={value.objectName} to={link} target={value.objectType === ObjectType.Blob ? `_blank` : undefined} iconName={objType} />
}
