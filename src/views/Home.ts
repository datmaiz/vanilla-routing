import { createState } from '../router/state'

export default function HomePage() {
	return {
		html: /* html */ `
    <div>
      <h1>Home Page</h1>
      <a data-link href="/dashboard">To Dashboard</a>
      <button id="button">Click me</button>
			<p id="count">0</p>
    </div>
  `,
		setup() {
			const button = document.getElementById('button')!
			const count = document.getElementById('count')!

			const { get, set, subscribe } = createState(0)

			subscribe(state => {
				count.textContent = state.toString()
			})

			button.onclick = () => {
				set(get() + 1)
			}
		},
	}
}
