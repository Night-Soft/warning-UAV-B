import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import { NewMessage } from "telegram/events/index.js";
import { EditedMessage } from "telegram/events/EditedMessage.js";
import input from "input";

import { ForwardController } from "./ForwardController.js";
import { getIdHashSession, getKeywords } from "./utils.js";

async function main() {    
    const { API_ID, API_HASH, SESSION_STRING } = await getIdHashSession("066");
    const { monitoredChannels, populatedAreas } = await getKeywords();

    console.log("🚀 Запуск минимального MTProto бота...");

    const client = new TelegramClient(new StringSession(SESSION_STRING), API_ID, API_HASH);

    await client.start({
        phoneNumber: async () => await input.text("Введите номер телефона: "),
        password: async () => await input.text("Введите пароль 2FA (если есть): "),
        phoneCode: async () => await input.text("Введите код из SMS: "),
        onError: (err) => console.log("Ошибка:", err),
    });

    console.log("✅ Авторизация успешна!");

    const forwardController = new ForwardController(client, {
        targetChannel: -1002950885092,
        monitoredChannels,
        populatedAreas
    });

    client.addEventHandler(forwardController.messageListener, new NewMessage({}));    
    client.addEventHandler(forwardController.messageListener, new EditedMessage({}));

    console.log("🎯 Бот запущен! Ожидание сообщений...");
    console.log("Нажмите Ctrl+C для остановки");
}

// Запуск
main().catch(console.error);

// Обработка завершения
process.on("SIGINT", () => {
    console.log("\n👋 Остановка бота...");
    process.exit(0);
});
