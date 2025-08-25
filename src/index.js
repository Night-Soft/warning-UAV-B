import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import { NewMessage } from "telegram/events/index.js";
import { EditedMessage } from "telegram/events/EditedMessage.js";
import input from "input";

import { ForwardController } from "./ForwardController.js";
import { getIdHashSession } from "./utils.js";
import {TARGET_CHANNEL, USER_NUMBER, CHANELS, POPULATED_AREAS} from "./config.js"
import "./page.js"

async function main() {
    const { API_ID, API_HASH, SESSION_STRING } = await getIdHashSession(USER_NUMBER);
    const client = new TelegramClient(new StringSession(SESSION_STRING), API_ID, API_HASH);

    await client.start({
        phoneNumber: async () => await input.text("Введите номер телефона: "),
        password: async () => await input.text("Введите пароль 2FA (если есть): "),
        phoneCode: async () => await input.text("Введите код из SMS: "),
        onError: (err) => console.log("Ошибка:", err),
    });

    console.log("✅ Авторизация успешна!");

    const forwardController = new ForwardController(client, {
        targetChannel: TARGET_CHANNEL,
        monitoredChannels: CHANELS,
        populatedAreas: POPULATED_AREAS
    });

    client.addEventHandler(forwardController.messageListener, new NewMessage({}));    
    client.addEventHandler(forwardController.messageListener, new EditedMessage({}));

    console.log("🎯 Бот запущен! Ожидание сообщений...");
}

main().catch(console.error);

// Обработка завершения
process.on("SIGINT", () => {
    console.log("\n👋 Остановка бота...");
    process.exit(0);
});
