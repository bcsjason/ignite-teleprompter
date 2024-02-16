import { WebSocketServer } from "ws"

const wss = new WebSocketServer({ port: 8080 })
const log = (message) => console.log(`[${new Date().toLocaleTimeString()}] ${message}`)

const sanitizeClientArray = (clients) => {
	// This function is used to strip the "ws" and "req" properties from the clients array, so that we can send them over the network.
	// Telemasters don't need them anyway.

	return clients.map((client) => {
		return {
			id: client.id,
			ip: client.ip,
			joined: client.joined,
			type: client.type,
			status: client.status
		}
	})
}

let ids = 0
let clients = []
let options = {
	text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum",
	speed: 0.1,
	font: "Arial",
	fontSize: 48,
	fontColor: "white",
	backgroundColor: "black",
}

wss.on("connection", (ws, req) => {
	let ip = req.connection.remoteAddress
	let joined = new Date()
	let type = undefined

	// Validate
	if (ws.protocol !== "teleprompter" && ws.protocol !== "telemaster") {
		ws.close(1002, "Invalid protocol")
		log(`Disconnected ${ip} for: "invalid protocol (${ws.protocol})"`)
		return
	}

	// Setup

	type = ws.protocol

	log(`Connected ${ip} as a ${type}`)
	clients.push({
		id: ids++,
		ws: ws,
		req: req,
		ip: ip,
		joined: joined,
		type: type,
		status: {
			playing: false,
			percent: 0
		}
	})

	// Tell all telemasters about the new client
	clients.filter((client) => client.type === "telemaster").forEach((client) => {
		client.ws.send(JSON.stringify({
			type: "replaceClients",
			clients: sanitizeClientArray(clients)
		}))
	})

	// Send options
	ws.send(JSON.stringify({
		type: "replaceOptions",
		options: options
	}))

	ws.on("error", console.error)

	ws.on("close", (code, reason) => {
		log(`Disconnected ${ip} Code: ${code}, Reason: "${reason}"`)
		clients = clients.filter((client) => client.ws !== ws)

		// Tell all telemasters about the leaving client
		clients.filter((client) => client.type === "telemaster").forEach((client) => {
			client.ws.send(JSON.stringify({
				type: "replaceClients",
				clients: sanitizeClientArray(clients)
			}))
		})
	})

	// Events
	
	ws.on("message", (data) => {
		try { JSON.parse(data) } catch (err) {
			log(`Received invalid JSON from ${ip}: "${data}"`)
			return
		}

		let json = JSON.parse(data)

		log(`Message from ${ip}: "${data}"`)

		if (json.type === "updateOption") {
			options[json.key] = json.value
			clients.forEach((client) => {
				// Broadcast to everyone but the sender

				if (client.ws !== ws) {
					client.ws.send(JSON.stringify({
						type: "updateOption",
						key: json.key,
						value: json.value
					}))
				}
			})
		} else if (json.type === "updateStatus") {
			if (json.client_id === undefined) { // Coming from a teleprompter
				clients[clients.findIndex((client) => client.ws === ws)].status.playing = json.status.playing
				clients[clients.findIndex((client) => client.ws === ws)].status.percent = json.status.percent
			} else if (json.client_id !== undefined) { // Coming from a telemaster
				clients[clients.findIndex((client) => client.id === json.client_id)].status.playing = json.status.playing
				clients[clients.findIndex((client) => client.id === json.client_id)].status.percent = json.status.percent
			}

			// Tell all telemasters except the sender
			clients.filter((client) => client.type === "telemaster").forEach((client) => {
				if (client.ws !== ws) {
					client.ws.send(JSON.stringify({
						type: "replaceClients",
						clients: sanitizeClientArray(clients)
					}))
				}
			})

			// Tell all prompters except the sender
			clients.filter((client) => client.type === "teleprompter").forEach((client) => {
				if (client.ws !== ws) {
					client.ws.send(JSON.stringify({
						type: "replaceStatus",
						status: {
							playing: json.status.playing,
							percent: json.status.percent
						}
					}))
				}
			})
		}
	})
});