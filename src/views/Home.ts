export default function HomePage() {
	return {
		html: /* html */ `
    <div>
      <h1>Home Page</h1>
      <a data-link href="/dashboard">To Dashboard</a>
      <button id="button">Click me</button>
    </div>
  `,
		setup() {
			const button = document.getElementById('button')!
			button.onclick = () => {
				console.log('Clicked')
			}
		},
	}
}
