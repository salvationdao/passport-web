import React, { useImperativeHandle } from "react"
import { useState, useEffect, useCallback, Dispatch, SetStateAction } from "react"
import { useHistory } from "react-router-dom"
import { plural } from "pluralize"
import { useWebsocket } from "../containers/socket"
import HubKey from "../keys"
import { Box, Button, Tooltip, FormControlLabel, Switch } from "@mui/material"
import {
	DataGridPro,
	GridColumns,
	GridSortDirection,
	GridToolbarContainer,
	GridToolbarDensitySelector,
	GridFilterModel,
	GridLinkOperator,
	GridDensity,
	GridApiRef,
	GridToolbarColumnsButton,
	GridToolbarFilterButton,
} from "@mui/x-data-grid-pro"
import Alert from "@mui/material/Alert"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { SearchBar } from "./searchBar"

const pageSizeDefault = 20

export interface ItemTableAPIRef {
	query: () => void
}

export interface ItemTableProps {
	name: string
	columns: GridColumns
	hubKey: HubKey
	/** The ref object that allows grid manipulation. */
	apiRef?: GridApiRef
	/** Toolbar Options */
	hideCreateButton?: boolean
	showImportButton?: boolean
	hideArchiveButton?: boolean
	hideSearch?: boolean
	showColumnsButton?: boolean
	archivedLabel?: string
	createURL?: string
	createOnClick?: () => void
	importURL?: string
	importOnClick?: () => void
	disableColumnFilter?: boolean
	disableDensitySelector?: boolean
	actionButtonLabel?: string
	actionButtonIcon?: React.ReactNode
	actionButtonOnClick?: () => void
	density?: GridDensity
	/** The default search query - Passed in via search params */
	sortBy?: string
	sortDir?: GridSortDirection
	/** Whether or not this list should update the url's search parameters */
	updateSearchParams?: boolean
	/** Defaults to a link (eg: "/users/slug") */
	onRowClick?: (data: any) => void
	/** Additional arguments to send to the list query */
	arguments?: {}
	className?: string
	/** If provided; will update with payload records */
	setRecords?: Dispatch<SetStateAction<any[] | undefined>>
}

/**
 * Displays a Table containing a list of items.
 */
export const ItemTable = React.forwardRef<ItemTableAPIRef, ItemTableProps>((props, ref) => {
	const {
		name,
		updateSearchParams,
		hubKey,
		hideCreateButton,
		showImportButton,
		hideArchiveButton,
		hideSearch,
		showColumnsButton,
		archivedLabel,
		createURL,
		createOnClick,
		importURL,
		importOnClick,
		actionButtonLabel,
		actionButtonIcon,
		actionButtonOnClick,
		className,
		arguments: extraArgs,
		setRecords,
	} = props

	const history = useHistory()
	const { send } = useWebsocket()

	const [searchArgs] = useState(new URLSearchParams(history.location.search))
	const [pageArg] = useState(searchArgs.get("page"))
	const [pageSizeArg] = useState(searchArgs.get("pageSize"))
	const [searchArg] = useState(searchArgs.get("search"))

	const [search, setSearch] = useState(searchArg ? searchArg : "")
	const [querySearch, setQuerySearch] = useState("")
	const [error, setError] = useState<string>()
	const [page, setPage] = useState(pageArg !== null ? +pageArg + 1 : 0)
	const [pageSize, setPageSize] = useState(pageSizeArg !== null ? +pageSizeArg : pageSizeDefault)
	const [filter, setFilter] = useState<GridFilterModel | null>(parseFilterSearchArgs(searchArgs))
	const [filterArchived, setFilterArchived] = useState(searchArgs.get("archived") === "1")
	const [sortBy, setSortBy] = useState(searchArgs.get("sortBy") || props.sortBy || "")
	const [sortDir, setSortDir] = useState<GridSortDirection>((searchArgs.get("sortDir") as GridSortDirection) || props.sortDir || "asc")

	const [payload, setPayload] = useState<{ records: any[]; total: number }>()
	const [loading, setLoading] = useState(false)

	const query = useCallback(() => {
		setError(undefined)
		setLoading(true)
		send<{ records: any[]; total: number }>(hubKey, {
			sortDir,
			sortBy,
			search: querySearch,
			archived: filterArchived,
			pageSize,
			page,
			filter,
			...extraArgs,
		})
			.then((response) => {
				if (!response) {
					return
				}
				if (updateSearchParams) {
					const search = getSearchArgs(querySearch, sortBy, sortDir, props.sortBy || "", props.sortDir, pageSize, page, filterArchived, filter)
					if (history.location.search !== "?" + search) history.replace({ search, hash: history.location.hash })
				}
				setPayload(response)
				if (!!setRecords) setRecords(response.records)
			})
			.catch((e) => {
				setError(e)
			})
			.finally(() => {
				setLoading(false)
			})
	}, [
		send,
		history,
		updateSearchParams,
		hubKey,
		querySearch,
		filter,
		filterArchived,
		sortBy,
		sortDir,
		props.sortBy,
		props.sortDir,
		page,
		pageSize,
		extraArgs,
		setRecords,
	])

	useImperativeHandle(ref, () => ({
		query,
	}))

	useEffect(() => {
		query()
	}, [query])

	useEffect(() => {
		const t = setTimeout(() => {
			setQuerySearch(search)
		}, 350)
		return () => clearTimeout(t)
	}, [search])

	const filterArchiveChangeHandler = (archived: boolean) => {
		setFilterArchived(archived)
	}

	const pluralName = plural(name)
	if (pluralName === name) {
		console.warn("[ItemTable] 'name' must be singular", name)
	}

	return (
		<>
			{!hideSearch && <SearchBar value={search} onChange={setSearch} placeholder={`Search ${pluralName}...`} loading={loading} />}
			<DataGridPro
				className={className}
				columns={props.columns}
				rows={payload && payload.records ? payload.records : []}
				rowCount={payload ? payload.total : 0}
				rowHeight={42}
				headerHeight={46}
				onRowClick={props.onRowClick ? (p) => props.onRowClick && props.onRowClick(p.row) : undefined}
				disableSelectionOnClick
				loading={loading}
				components={{
					Toolbar: ItemTableToolbar,
					ErrorOverlay: ErrorOverlay,
				}}
				componentsProps={{
					toolbar: {
						name,
						pluralName,
						hideCreateButton,
						showImportButton,
						hideArchiveButton,
						createURL,
						createOnClick,
						importURL,
						importOnClick,
						actionButtonLabel,
						actionButtonIcon,
						actionButtonOnClick,
						archived: filterArchived,
						onFilterArchiveChange: filterArchiveChangeHandler,
						showColumnsButton,
						archivedLabel,
					},
				}}
				error={error ? { message: error } : undefined}
				// Pagination
				pagination
				paginationMode={"server"}
				page={page}
				onPageChange={(page) => setPage(page)}
				pageSize={pageSize}
				onPageSizeChange={(pageSize) => setPageSize(pageSize)}
				rowsPerPageOptions={[10, 20, 50, 100, 200]}
				// Sorting
				sortingMode={"server"}
				sortModel={[{ field: sortBy, sort: sortDir }]}
				onSortModelChange={(sortModel) => {
					if (sortModel.length === 0) {
						setSortDir((prev) => (prev === "desc" ? "asc" : "desc"))
						return
					}
					setSortBy(sortModel[0].field)
					setSortDir(sortModel[0].sort)
				}}
				// Filtering
				filterMode={"server"}
				filterModel={filter ? filter : undefined}
				onFilterModelChange={(filterModel) => setFilter(filterModel)}
				disableColumnFilter={props.disableColumnFilter}
				disableDensitySelector={props.disableDensitySelector}
				density={props.density}
				apiRef={props.apiRef}
			/>
		</>
	)
})

/**
 * Error Overlap Component
 */
const ErrorOverlay = (props: { message: string }) => {
	return <Alert severity={"error"}>{props.message}</Alert>
}

/**
 * Props for <ItemTableToolbar>
 */
interface ItemTableToolbarProps {
	name: string
	pluralName: string
	archived: boolean
	hideCreateButton?: boolean
	createURL?: string
	createOnClick?: () => void
	importURL?: string
	importOnClick?: () => void
	onFilterArchiveChange: (archived: boolean) => void
	hideArchiveButton?: boolean
	showImportButton?: boolean
	actionButtonLabel?: string
	actionButtonIcon?: React.ReactNode
	actionButtonOnClick: () => void
	showColumnsButton?: boolean
	archivedLabel?: string
}

/**
 * Custom Toolbar on List Page
 */
const ItemTableToolbar = (props: ItemTableToolbarProps) => {
	const {
		name,
		pluralName,
		archived,
		createURL,
		createOnClick,
		importURL,
		importOnClick,
		showImportButton,
		actionButtonLabel,
		actionButtonIcon,
		actionButtonOnClick,
		hideCreateButton,
		hideArchiveButton,
		showColumnsButton,
		archivedLabel,
	} = props

	const history = useHistory()

	return (
		<GridToolbarContainer>
			{showColumnsButton && <GridToolbarColumnsButton />}
			{/* <GridToolbarFilterButton /> */}
			<GridToolbarDensitySelector />
			<GridToolbarFilterButton />

			<Box display={"flex"} flexGrow={1} justifyContent={"flex-end"}>
				{!hideArchiveButton && (
					<FormControlLabel
						control={
							<Switch checked={archived} onChange={() => props.onFilterArchiveChange(!archived)} name={"archivedSwitch"} color={"primary"} />
						}
						label={archivedLabel || "Archived"}
					/>
				)}
				{!!showImportButton && (
					<Tooltip title={`Import a ${name}`}>
						<Button
							onClick={() => {
								if (!!importOnClick) {
									importOnClick()
									return
								}
								if (importURL) {
									history.push(importURL)
									return
								}
								history.push(`/${pluralName.toLowerCase()}/import`)
							}}
							variant={"outlined"}
							color={"secondary"}
							sx={{
								marginRight: "0.5rem",
								textTransform: "capitalize",
							}}
							startIcon={<FontAwesomeIcon icon={["fal", "file-import"]} />}
						>{`Import ${pluralName}`}</Button>
					</Tooltip>
				)}
				{actionButtonLabel && (
					<Button
						onClick={actionButtonOnClick}
						variant={"contained"}
						color={"primary"}
						startIcon={actionButtonIcon}
						sx={{ textTransform: "capitalize" }}
					>
						{actionButtonLabel}
					</Button>
				)}
				{!hideCreateButton && (
					<Tooltip title={`Create a new ${name}`}>
						<Button
							onClick={() => {
								if (!!createOnClick) {
									createOnClick()
									return
								}
								if (createURL) {
									history.push(createURL)
									return
								}
								history.push(`/${pluralName.toLowerCase()}/create`)
							}}
							variant={"contained"}
							color={"primary"}
							startIcon={<FontAwesomeIcon icon={["fal", "plus"]} />}
							sx={{ textTransform: "capitalize" }}
						>{`New ${name}`}</Button>
					</Tooltip>
				)}
			</Box>
		</GridToolbarContainer>
	)
}

/**
 * Extract Filter params and converts into GridFilterModel for Xgrid component
 */
const parseFilterSearchArgs = (searchArgs: URLSearchParams) => {
	let output: GridFilterModel = {
		items: [],
		linkOperator: GridLinkOperator.And,
	}
	const filterLink = searchArgs.get("filterLink")
	if (!filterLink) {
		return null
	}
	output.linkOperator = filterLink as GridLinkOperator

	const fields = searchArgs.getAll("filterField")
	const operators = searchArgs.getAll("filterOperator")
	const values = searchArgs.getAll("filterValue")

	for (let i = 0; i < fields.length; i++) {
		if (typeof operators[i] === "undefined" || typeof values[i] === "undefined") {
			continue
		}
		output.items.push({
			columnField: fields[i],
			operatorValue: operators[i],
			value: values[i],
		})
	}

	return output
}

/**
 * Generate the url search query with applied filters and sorting
 */
const getSearchArgs = (
	search: string,
	sortBy: string,
	sortDir: GridSortDirection,
	defaultSortBy: string,
	defaultSortDir: GridSortDirection,
	pageSize: number,
	page: number,
	archived: boolean,
	filter: GridFilterModel | null,
) => {
	let args: string[] = []

	if (search !== "") {
		args.push(`search=${encodeURI(search)}`)
	}
	if (sortBy !== "" && sortBy !== defaultSortBy) {
		args.push(`sortBy=${encodeURI(sortBy)}`)
	}
	if (sortDir !== defaultSortDir && (sortDir === "asc" || sortDir === "desc")) {
		args.push(`sortDir=${sortDir}`)
	}
	if (archived) {
		args.push("archived=1")
	}
	if (filter) {
		if (filter.linkOperator) {
			args.push(`filterLink=${filter.linkOperator}`)
		}
		filter.items.forEach((f) => {
			args.push(`filterField=${f.columnField || ""}`)
			args.push(`filterOperator=${f.operatorValue || ""}`)
			args.push(`filterValue=${f.value || ""}`)
		})
	}
	if (pageSize !== pageSizeDefault) args.push(`pageSize=${encodeURI(pageSize.toString())}`)
	if (page > 0) args.push(`page=${encodeURI((page + 1).toString())}`)

	return args.join("&")
}
