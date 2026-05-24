const { downloadMediaMessage } = require("@whiskeysockets/baileys")
const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

module.exports = async (lenwy, m) => {
  const msg = m.messages[0]
  if (!msg.message) return

  const sender = msg.key.remoteJid
  const pushname = msg.pushName || "Kawan"

  // Hanya aktif di chat pribadi, abaikan grup
  if (sender.endsWith("@g.us")) return

  const type = Object.keys(msg.message)[0]
  const isImage = type === "imageMessage"
  
  const body = isImage 
    ? (msg.message.imageMessage.caption || "")
    : (msg.message.conversation || msg.message.extendedTextMessage?.text || "")

  if (!body.startsWith("!")) return

  const command = body.slice(1).trim().toLowerCase()
  console.log("Perintah: " + command)

  if (isImage && command === "sticker") {
    try {
      const buffer = await downloadMediaMessage(msg, "buffer", {})
      const tmpIn = "/data/data/com.termux/files/home/Bot/tmp_in.jpg"
      const tmpOut = "/data/data/com.termux/files/home/Bot/tmp_out.webp"
      fs.writeFileSync(tmpIn, buffer)
      execSync(`ffmpeg -i ${tmpIn} -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000" -auto-alt-ref 0 ${tmpOut} -y`)
      const webpBuffer = fs.readFileSync(tmpOut)
      await lenwy.sendMessage(sender, { sticker: webpBuffer })
      fs.unlinkSync(tmpIn)
      fs.unlinkSync(tmpOut)
      return
    } catch (e) {
      await lenwy.sendMessage(sender, { text: "Gagal 😢\n" + e.message })
      return
    }
  }

  switch (command) {
    case "halo":
      await lenwy.sendMessage(sender, { text: "Halo " + pushname + "! Aku Bot Rosyidd 🤖" })
      break
    case "ping":
      await lenwy.sendMessage(sender, { text: "Pong! 🏓" })
      break
    case "info":
      await lenwy.sendMessage(sender, { text: "Nama Bot: Rosyidd\nVersi: 1.0.0\nDibuat dengan ❤️" })
      break
    case "menu":
      await lenwy.sendMessage(sender, { text: "📋 *Menu Bot Rosyidd*\n\n!halo - Sapa bot\n!ping - Cek bot aktif\n!info - Info bot\n!menu - Lihat menu\n!sticker - Kirim foto + caption !sticker" })
      break
    default:
      await lenwy.sendMessage(sender, { text: "Perintah tidak dikenal. Ketik !menu untuk melihat daftar perintah." })
      break
  }
}
