import { checkRed } from "./img.js";
import { D_AREA, D_AREA_EXCLUDES } from "./config.js";

async function imgHasRed(client, media, channelName) {
    try {
        const buffer = await client.downloadMedia(media, { outputFile: false });
        return await checkRed(buffer, channelName);
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

    if (lowText.includes(D_AREA) && isDArea(text)) return true;

    // POPULATED_AREAS
    return array.some((keyword) => {
        const isText = lowText.includes(keyword) || lowText.startsWith(keyword.substring(1));
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
        console.log(`📨 Пересылаем сообщение ${message.message, message.id}`);

        if(setId) this.#lastSuccessId = message.id;
        return this.client.forwardMessages(this.targetChannel, {
            messages: message.id,
            fromPeer: message.chat
        });
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
                    imgHasRed(this.client, message.media, channelName).then(isRed => {
                        console.log("isRed", isRed);
                        isRed && this.forwardMessage(message);
                    });
                    return;
                }
            }
        }

        if (channelName === "sumyliketop") {
            if (text.includes("зараз") && message.media?.photo) {
                imgHasRed(this.client, message.media, channelName).then(isRed => {
                        console.log("isRed", isRed);
                        isRed && this.forwardMessage(message);
                });
                return;
            }

            if(message.voice) {
                this.forwardMessage(message);
                return;
            }
        }

        if (!hasText(this.populatedAreas, text, channelName)) return;
        
        this.forwardMessage(message);
    }

    #lastSuccessId = 0;
    messageListener = async (event) => {
        try {
            const message = event.message;
            const chat = await message.getChat();
            const text = message.message;

            // if (chat.username === "testWarningUAV") {
            //     console.log(message);
            // }

            if (
                !chat.username ||
                !this.monitoredChannels.includes(chat.username) ||
                this.#lastSuccessId === message.id
            ) return;

            //console.log("message", message);
           // console.log(" check forwardIfNeeded");
            this.#forwardIfNeeded(text, chat.username, message);
        } catch (error) {
            console.error("❌ Ошибка:", error.message);
        }
    }
}
