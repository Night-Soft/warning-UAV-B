import { checkRed } from "./img.js";
import { D_AREA, D_AREA_EXCLUDES } from "./config.js";

async function imgHasRed(client, message, channelName) {
    try {
        const buffer = await client.downloadMedia(message.media, { outputFile: false });
        const isRed = await checkRed(buffer, channelName);
        return { isRed, message }
    } catch (error) {
        console.log("imgHasRed error", error);
    }
}

const isDArea = function (text) {
    const isExclude = D_AREA_EXCLUDES.some((excludes) => text.includes(excludes));
    const firstIndex = text.indexOf(D_AREA);
    const lastIndex = text.lastIndexOf(D_AREA);

    if (firstIndex !== lastIndex && isExclude) {
        console.log("isDArea", text);
        return true;
    }
    if (isExclude === false) {
        console.log("isDArea", text);
        return true;
    }
    return false;
}

const alphabet = [
    "а",
    "б",
    "в",
    "г",
    "ґ",
    "д",
    "е",
    "є",
    "ж",
    "з",
    "и",
    "і",
    "ї",
    "й",
    "к",
    "л",
    "м",
    "н",
    "о",
    "п",
    "р",
    "с",
    "т",
    "у",
    "ф",
    "х",
    "ц",
    "ч",
    "ш",
    "щ",
    "ь",
    "ю",
    "я"
];

const getIfA = (lowText, keyword) => {
    const index = lowText.indexOf(keyword);
    if (index > -1) {
        return !alphabet.includes(lowText[index - 1]);
    }
    return false;
}

function hasText(array, text, channelName) {
    if (!text) return false;

    const lowText = text.toLowerCase();

    if (channelName === "sumyliketop") {

        if (lowText.includes("тривог")) {
            return true;
        }
        if (lowText.includes("відб")) {
            return true;
        }
    }

    if (lowText.includes(D_AREA) && isDArea(lowText)) return true;

    // POPULATED_AREAS
    return array.some((keyword) => {
        const isText = (
            lowText.includes(keyword) || 
            lowText.startsWith(keyword.substring(1)) ||
            getIfA(lowText, keyword.substring([1]))
            );
        if (isText) console.log("isText", keyword);
        return isText;
    });
} 

export const ForwardController = class {
    constructor(client, {
        targetChannel,
        monitoredChannels,
        populatedAreas
    }) {
        this.client = client;
        this.targetChannel = targetChannel;
        this.monitoredChannels = monitoredChannels;
        this.populatedAreas = populatedAreas;
    }

    forwardMessage = async (message, setId = true) => {
        console.log(`📨 Пересылаем сообщение ${message.id}: ${message.message}`);

        if (setId) {
            if (this.lastSendedMessages.has(message.id)) return;
            this.lastSendedMessages.set(message.id, message.message);
        }

        return this.client.forwardMessages(this.targetChannel, {
            messages: message.id,
            fromPeer: message.chat,
            silent: false
        }).catch((e) => { console.warn("Error:", e) });
    }

    #forwardIfHasRed = ({ isRed, message }) => {
        console.log("isRed", isRed);
        if (this.lastSendedMessages.has(message.id)) return;
        isRed && this.forwardMessage(message);
    }
    
    #forwardIfNeeded = async (text, channelName, message) => {
        text = text.toLowerCase();

        if (channelName === "testWarningUAV") { // test images
            if (message.media?.photo) {
                if (text.includes("rdsprostir")) {
                    channelName = "rdsprostir";
                    text = "";
                }
                if (text.includes("sumyliketop")) {
                    channelName = "sumyliketop";
                    text = "на зараз";
                }
            }
        }

        if (channelName === "rdsprostir") {
            if (message.media?.photo) {
                if (text === "" || text.includes("наразі")) {
                    imgHasRed(this.client, message, channelName).then(this.#forwardIfHasRed);
                    return;
                }
            }
        }

        if (channelName === "sumygo") {
            if (message.media?.photo) {
                if (text.includes("по шахедам")) {
                    imgHasRed(this.client, message, channelName).then(this.#forwardIfHasRed);
                }
            }
        }

        if (channelName === "sumyliketop") {
            if (text.includes("зараз") && message.media?.photo) {
                imgHasRed(this.client, message, channelName).then(this.#forwardIfHasRed);
                return;
            }

            if (message.voice) {
                this.forwardMessage(message);
                return;
            }
        }

        if (!hasText(this.populatedAreas, text, channelName)) return;

        this.forwardMessage(message);
    }

    lastSendedMessages = new LastSendedMessages(20);
    messageListener = async (event) => {
        try {
            const message = event.message;
            const chat = await message.getChat();
            const text = message.message;

            if (
                !chat.username ||
                !this.monitoredChannels.includes(chat.username) ||
                this.lastSendedMessages.has(message.id)
            ) return;

            this.#forwardIfNeeded(text, chat.username, message);
        } catch (error) {
            console.error("❌ Ошибка:", error.message);
        }
    }
}

export const LastSendedMessages = class {
    constructor(numberOfMessages) {
        const createSetWrapped = (target) => {
            return (key, value) => {
                if (target.size === numberOfMessages) {
                    target.delete(target.keys().next().value);
                }
                target.set(key, value);
            }
        }

        const methodCache = new Map();
        return new Proxy(new Map(), {
            get(target, prop) {
                if (methodCache.has(prop)) return methodCache.get(prop);
                if (prop === "size") return target[prop];
                if (!Map.prototype[prop]) return target[prop];

                if (prop === "set") {
                    methodCache.set(prop, createSetWrapped(target));
                    return methodCache.get(prop);
                }

                const value = Reflect.get(...arguments);
                if (typeof value !== 'function') return value;

                methodCache.set(prop, value.bind(target));
                return methodCache.get(prop);
            }

        });
    }
}