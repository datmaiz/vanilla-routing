type Listener<T> = (state: T) => void

export function createState<T>(initialValue: T) {
	let state = initialValue
	const listeners: Listener<T>[] = []

	const get = () => state

	const set = (newValue: T) => {
		state = newValue
		listeners.forEach(listener => listener(state))
	}

	const subscribe = (listener: Listener<T>) => {
		listeners.push(listener)
		// Gọi listener lần đầu
		listener(state)

		return () => {
			const index = listeners.indexOf(listener)
			if (index !== -1) listeners.splice(index, 1)
		}
	}

	return { get, set, subscribe }
}
