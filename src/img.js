import { Jimp, intToRGBA } from "jimp";

const coordSumyLike = {
    x: 780,
    y: 760,
    w: 210,
    h: 210
}

const coordRds = {
    x: 660,
    y: 750,
    w: 210,
    h: 210
}

export const checkRed = async (buffer = "isRed.jpg", channel) => {
    if (!buffer) throw new Error(`the buffer is: ${typeof buffer}`);

    const image = await Jimp.read(buffer);

    const { x, y, w, h } = channel === "rdsprostir" ? coordRds : coordSumyLike;

    let hasRed = false;

    for (let i = x; i < x + w; i++) {
        for (let j = y; j < y + h; j++) {
            const color = image.getPixelColor(i, j); // число в ARGB
            //console.log(color)
            const rgba = intToRGBA(color);

            // проверяем "достаточно красный"
            if (rgba.r > 150 && rgba.r > rgba.g + 50 && rgba.r > rgba.b + 50) {
                hasRed = true;
                break;
            }
        }
        if (hasRed) break;
    }

    console.log(hasRed ? "🔴 Красный найден" : "⚪ Нет красного");

    return hasRed

}
