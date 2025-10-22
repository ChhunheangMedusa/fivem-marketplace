// telegram-bot.js
class TelegramBot {
  constructor(botToken, chatId) {
    this.botToken = botToken;
    this.chatId = chatId;
    this.apiUrl = `https://api.telegram.org/bot${botToken}`;
  }

  // Send text message
  async sendMessage(text) {
    try {
      const response = await fetch(`${this.apiUrl}/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: this.chatId,
          text: text,
          parse_mode: "HTML",
        }),
      });
      return await response.json();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }

  // Send photo with caption
  async sendPhoto(photoUrl, caption = "") {
    try {
      const response = await fetch(`${this.apiUrl}/sendPhoto`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: this.chatId,
          photo: photoUrl,
          caption: caption,
          parse_mode: "HTML",
        }),
      });
      return await response.json();
    } catch (error) {
      console.error("Error sending photo:", error);
    }
  }

  // Send multiple photos as album
  async sendMediaGroup(photos) {
    try {
      const media = photos.map((photo, index) => ({
        type: "photo",
        media: photo.url,
        caption: index === 0 ? photo.caption : undefined,
        parse_mode: "HTML",
      }));

      const response = await fetch(`${this.apiUrl}/sendMediaGroup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: this.chatId,
          media: media,
        }),
      });
      return await response.json();
    } catch (error) {
      console.error("Error sending media group:", error);
    }
  }
}

// Initialize bot (you need to get these from BotFather)
const BOT_TOKEN = "7210704739:AAF8G7MM_GfaQtOWRLlZvOce7y3yk_oY-7o"; // Get from @BotFather
const CHAT_ID = "7296851058"; // Your Telegram user ID

const telegramBot = new TelegramBot(BOT_TOKEN, CHAT_ID);
