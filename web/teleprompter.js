const socket = new WebSocket("ws://localhost:8080", ["teleprompter"])

let options = {
	text: "Lowwrem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum",
	speed: 0.1,
	font: "Arial",
	fontSize: 48,
	fontColor: "white",
	backgroundColor: "black",
}
let telemarketerStatus = {
	playing: false,
	percent: 0
}

socket.addEventListener("open", (event) => {
	
})
  
socket.addEventListener("message", (event) => {
	let data = JSON.parse(event.data)
	console.log(`Received data: "${event.data}"`)

	if (data.type === "updateOption") {
		options[data.key] = data.value
	} else if (data.type == "replaceOptions") {
		options = data.options
	} else if (data.type == "replaceStatus") {
		telemarketerStatus = {
			playing: false,
			percent: data.status.percent
		}
		window.scrollTo(0, data.status.percent / 100 * document.body.scrollHeight)
		scrollPosition = data.status.percent / 100 * document.body.scrollHeight
		telemarketerStatus.playing = data.status.playing
	}

	document.querySelector("#text").value = options.text
	document.querySelector("#text").style.fontSize = options.fontSize + "px"
	document.querySelector("#text").style.color = options.fontColor

	document.querySelector("#endtext").style.fontSize = options.fontSize + "px"
	document.querySelector("#endtext").style.color = options.fontColor

	document.body.style.backgroundColor = options.backgroundColor
})

let scrollPosition = 0
window.onload = () => {
	setInterval(() => {
		if (telemarketerStatus.playing === true) {
			window.scrollTo(0, scrollPosition += Number(options.speed))
			console.log(scrollPosition)
			telemarketerStatus.percent = Math.round(scrollPosition / document.body.scrollHeight * 100)
		}
	}, 10)

	setInterval(() => {
		if (telemarketerStatus.playing === true) {
			socket.send(JSON.stringify({
				type: "updateStatus",
				status: telemarketerStatus
			}))
			console.log(telemarketerStatus)
		}

		document.querySelector("#text").innerText = options.text
	}, 1000)
}