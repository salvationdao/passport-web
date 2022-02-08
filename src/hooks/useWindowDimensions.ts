import { useCallback, useEffect, useState } from "react"

// Returns the current dimensions of the window, debounced by .5 second (when window is resized).
export const useWindowDimensions = () => {
	const [dimensions, setDimensions] = useState<
		| {
				width: number
				height: number
		  }
		| undefined
	>()

	const debouncedSetDimensions = debounce((width: number, height: number) => {
		setDimensions({
			width,
			height,
		})
	}, 500)

	const updateDimensions = useCallback(debouncedSetDimensions, [debouncedSetDimensions])

	useEffect(() => {
		const handleResize: (ev: UIEvent) => any = (ev) => {
			if (!window) return
			const { innerWidth: width, innerHeight: height } = window
			updateDimensions(width, height)
		}

		window.addEventListener("resize", handleResize)
		return () => window.removeEventListener("resize", handleResize)
	}, [updateDimensions])

	return { dimensions }
}

export const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
	let timeout: ReturnType<typeof setTimeout> | null = null

	const debounced = (...args: Parameters<F>) => {
		if (timeout !== null) {
			clearTimeout(timeout)
			timeout = null
		}
		timeout = setTimeout(() => func(...args), waitFor)
	}

	return debounced as (...args: Parameters<F>) => ReturnType<F>
}
