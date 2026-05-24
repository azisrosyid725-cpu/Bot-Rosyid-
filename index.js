const { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys")
const pino = require("pino")
const readline = require("readline")
const ROSYIDD = require("./ROSYIDD.js")

const usePairingCode = true

async function question(prompt) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => rl.question(prompt, (ans) => { rl.close(); resolve(ans) }))
}

async function connectToWhatsApp() {
  const { version } = await fetchLatestBaileysVersion()
  const { state, saveCreds } = await useMultiFileAuthState("./RosyiddSesi")
  const lenwy = makeWASocket({
    version,
    logger: pino({ level: "silent" }),
    printQRInTerminal: !usePairingCode,
    auth: state,
    browser: ["Ubuntu", "Chrome", "20.0.04"]
  })

  if (usePairingCode && !lenwy.authState.creds.registered) {
    console.log("Masukkan Nomor WA (awali dengan 62):")
    const phoneNumber = "6285187239247"
    const code = await lenwy.requestPairingCode(phoneNumber.trim())
    console.log("Pairing Code: " + code)
  }

  lenwy.ev.on("creds.update", saveCreds)

  lenwy.ev.on("connection.update", (update) => {
    const { connection } = update
    if (connection === "close") {
      console.log("Koneksi terputus, mencoba ulang...")
      connectToWhatsApp()
    } else if (connection === "open") {
      console.log("Bot Rosyidd Berhasil Terhubung ke WhatsApp!")
    }
  })

  lenwy.ev.on("messages.upsert", async (m) => {
    const msg = m.messages[0]
    if (!msg.message) return
    await ROSYIDD(lenwy, m)
  })
}

connectToWhatsApp()
