const socket = new WebSocket("ws://localhost:8080", ["telemaster"])

let clients = []
let options = {
	text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum",
	speed: 0.1,
	font: "Arial",
	fontSize: 48,
	fontColor: "white",
	backgroundColor: "black",
	playing: false,
	percent: 0
}

socket.addEventListener("open", (event) => {
	//socket.send("Hello Server!")
})
  
socket.addEventListener("message", (event) => {
	let data = JSON.parse(event.data)
	console.log(`Received data: "${event.data}"`)

	if (data.type === "updateOption") {
		options[data.key] = data.value
	} else if (data.type == "replaceOptions") {
		options = data.options
	} else if (data.type == "replaceClients") {
		clients = data.clients
	}

	// Update options
	document.querySelector("#text").value = options.text
	document.querySelector("#speed").value = options.speed
	document.querySelector("#font").value = options.font
	document.querySelector("#fontSize").value = options.fontSize
	document.querySelector("#fontColor").value = options.fontColor
	document.querySelector("#backgroundColor").value = options.backgroundColor
	document.querySelector("#playing").checked = options.playing
	document.querySelector("#progress").value = options.percent
})

// Input events

document.querySelector("#text").oninput = (event) => {
	options.text = event.target.value
	socket.send(JSON.stringify({"type": "updateOption", "key": "text", "value": event.target.value}))
}

document.querySelector("#speed").oninput = (event) => {
	options.speed = event.target.value
	socket.send(JSON.stringify({"type": "updateOption", "key": "speed", "value": event.target.value}))
}

document.querySelector("#font").oninput = (event) => {
	options.font = event.target.value
	socket.send(JSON.stringify({"type": "updateOption", "key": "font", "value": event.target.value}))
}

document.querySelector("#fontSize").oninput = (event) => {
	options.fontSize = event.target.value
	socket.send(JSON.stringify({"type": "updateOption", "key": "fontSize", "value": event.target.value}))
}

document.querySelector("#fontColor").oninput = (event) => {
	options.fontColor = event.target.value
	socket.send(JSON.stringify({"type": "updateOption", "key": "fontColor", "value": event.target.value}))
}

document.querySelector("#backgroundColor").oninput = (event) => {
	options.backgroundColor = event.target.value
	socket.send(JSON.stringify({"type": "updateOption", "key": "backgroundColor", "value": event.target.value}))
}

document.querySelector("#playing").oninput = (event) => {
	options.playing = event.target.checked
	socket.send(JSON.stringify({"type": "updateOption", "key": "playing", "value": event.target.checked}))
}

document.querySelector("#progress").oninput = (event) => {
	options.percent = event.target.value
	socket.send(JSON.stringify({"type": "updateOption", "key": "percent", "value": event.target.value}))
}