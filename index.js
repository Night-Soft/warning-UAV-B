const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { NewMessage } = require('telegram/events');
const input = require('input');
const fs = require("fs");

const readJson = async (path) => {
    return new Promise((resolve, reject) => {
        fs.readFile(path, "utf8", (err, jsonString) => {
            if (err) {
                console.log("File read failed:", err);
                reject(err);
            }
            resolve(JSON.parse(jsonString));
        });
    });
}

async function getIdHashSession() {
    let result;
    readJson("./IdHashSession.json")
        .then(r => result = r)
        .catch(async () => {
            result = {
                API_ID: await input.text("API_ID: "),
                API_HASH: await input.text("API_HASH: "),
                SESSION_STRING: await input.text("SESSION_STRING: "),
            }
        });
// todo return
    return result;
}

async function findGroupIdByName(client, groupName) {
    const dialogs = await client.getDialogs({});
    for (const dialog of dialogs) {
        if (dialog.isGroup && dialog.name.toLowerCase() === groupName.toLowerCase()) {
            console.log(`✅ Группа "${groupName}" найдена. ID: ${dialog.id}`);
            return dialog.id;
        }
    }
    console.log(`❌ Группа "${groupName}" не найдена.`);
    return null;
}

async function main() {
    //const { SESSION_STRING, API_ID, API_HASH } = await getIdHashSession();
    console.log('read IdHashSession');

   
    console.log('🚀 Запуск минимального MTProto бота...');

    // Создаем клиент
    const client = new TelegramClient(
        new StringSession(SESSION_STRING),
        API_ID,
        API_HASH
    );

    // Авторизация
    await client.start({
        phoneNumber: async () => await input.text('Введите номер телефона: '),
        password: async () => await input.text('Введите пароль 2FA (если есть): '),
        phoneCode: async () => await input.text('Введите код из SMS: '),
        onError: (err) => console.log('Ошибка:', err),
    });

    console.log('✅ Авторизация успешна!');
    // console.log('📋 Сохраните эту строку для следующих запусков:');
    // console.log(client.session.save());

    const TARGET_CHANNEL = -4887276238n; // куда пересылать

    let KEYWORDS = await readJson("./keywords.json");
    const MONITORED_CHANNELS = KEYWORDS.chanels;
    KEYWORDS = KEYWORDS.populatedAreas;
    console.log(KEYWORDS, MONITORED_CHANNELS);

    // Функция проверки сообщения
    function shouldForward(text, channelName) {
        if (!text) return false;
        // todo unique cases
        const lowText = text.toLowerCase();

        if (channelName === "sumyliketop") {
            if (lowText.includes("тривог")) {
                return true;
            }
            if (lowText.includes("відб")) {
                return true;
            }
        }

        return KEYWORDS.some(keyword => lowText.includes(keyword));
    }

    // Обработчик новых сообщений
    client.addEventHandler(async (event) => {
        try {
            const message = event.message;
            const chat = await message.getChat();
            const text = message.message;
            //console.log(event)

            // Проверяем, что сообщение из нужного канала
            if (!chat.username || !MONITORED_CHANNELS.includes(chat.username)) {
                return;
            }

            // console.log("message", message);
            // console.log("\n");
            // console.log("chat", chat);

            // console.log(`📨 Новое сообщение в @${chat.username}`);

            // Проверяем, нужно ли пересылать
            if (shouldForward(text, chat.username)) {
                console.log(`📨 Пересылаем сообщение ${text}`);

                // Пересылаем сообщение
                await client.forwardMessages(
                    TARGET_CHANNEL,
                    {
                        messages: message.id,
                        fromPeer: message.chat
                    }
                );

                console.log(`✅ Переслано из @${chat.username} в @${TARGET_CHANNEL}`);
            }

        } catch (error) {
            console.error('❌ Ошибка:', error.message);
        }

    }, new NewMessage({}));

    console.log('🎯 Бот запущен! Ожидание сообщений...');
    console.log('Нажмите Ctrl+C для остановки');
}

// Запуск
main().catch(console.error);

// Обработка завершения
process.on('SIGINT', () => {
    console.log('\n👋 Остановка бота...');
    process.exit(0);
});


