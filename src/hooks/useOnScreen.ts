import { MutableRefObject, useEffect, useMemo, useState } from "react"

/**
 * useOnScreen returns a true if an Element is visable in the DOM
 *
 * @param ref
 * @returns boolean
 *
 * @usage
 *```typescript
 *   const DummyComponent = () => {
 *
 *      const ref = useRef<HTMLDivElement>(null)
 *      const isVisible = useOnScreen(ref)
 *
 *      return <div ref={ref}>{isVisible && `Yep, I'm on screen`}</div>
 *   }
 *```
 * https://stackoverflow.com/a/65008608
 */
export function useOnScreen(ref: MutableRefObject<any>) {
	const [isIntersecting, setIntersecting] = useState(false)

	const observer = useMemo(() => {
		return new IntersectionObserver(([entry]) => setIntersecting(entry.isIntersecting))
	}, [])

	useEffect(() => {
		observer.observe(ref.current)
		// Remove the observer as soon as the component is unmounted
		return () => {
			observer.disconnect()
		}
	})

	return isIntersecting
}
