import React, { useEffect, useState } from "react"

export type TransitionState = "entering" | "exiting"

interface TransitionProps {
	show: boolean
	timeout: number
	mountDelay?: number
	children: (state: TransitionState) => React.ReactNode
}

export const Transition: React.FC<TransitionProps> = ({ show, timeout, mountDelay, children }) => {
	const [shouldRender, setRender] = useState(show)
	const [state, setState] = useState<TransitionState>(show ? "entering" : "exiting")

	useEffect(() => {
		let renderTimer: NodeJS.Timeout
		let renderTimer2: NodeJS.Timeout
		if (show) {
			const startRender = () => {
				setRender(true)
				renderTimer = setTimeout(() => {
					setState("entering")
				}, timeout)
			}
			if (mountDelay) {
				renderTimer2 = setTimeout(() => {
					startRender()
				}, mountDelay)
			} else {
				startRender()
			}
		} else {
			setState("exiting")
			renderTimer = setTimeout(() => {
				setRender(false)
			}, timeout)
		}

		return () => {
			if (renderTimer) clearTimeout(renderTimer)
			if (renderTimer2) clearTimeout(renderTimer2)
		}
	}, [show, mountDelay, timeout])

	return <>{shouldRender && children(state)}</>
}

interface TransitionGroupProps {
	children: React.ReactElement<TransitionProps>[] | React.ReactElement<TransitionProps>
}

export const TransitionGroup: React.FC<TransitionGroupProps> = ({ children }) => {
	return (
		<>
			{React.Children.map(children, (child) => {
				if (React.isValidElement(child))
					return React.cloneElement<TransitionProps>(child, {
						mountDelay: 5000,
					})
			})}
		</>
	)
}
