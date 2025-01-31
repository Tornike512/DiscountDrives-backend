import dotenv from "dotenv";
dotenv.config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function sendTelegramMessage(message) {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: "HTML",
        }),
      }
    );

    const data = await response.json();

    if (!data.ok) {
      throw new Error(`Telegram API Error: ${data.description}`);
    }

    console.log("Message sent successfully!");
    return data;
  } catch (error) {
    console.error("Error sending message:", error.message);
    throw error;
  }
}

async function sendCarNotification(cars) {
  let message = `🚗 <b>${cars.length} New Cars Found!</b>\n\n`;

  cars.forEach((car, index) => {
    message += `${index + 1}. <b>${car.carModel}</b>\n`;
    message += `💰 ${car.carPrice}\n$`;
    message += `📅 ${car.carYear}\n`;
    message += `🔗 <a href="${car.carLink}">View Car</a>\n\n`;
  });

  return sendTelegramMessage(message);
}

export { sendTelegramMessage, sendCarNotification };
