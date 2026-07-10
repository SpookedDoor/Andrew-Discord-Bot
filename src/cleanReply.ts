export function cleanReply(reply: string) {
    const text = reply
        .replace(/<thought>[\s\S]*?<\/thought>/g, "")
        .trim()
        .replace(/(^|\n)["']?Andrew\s*[:\-—]\s*/gi, "$1")
        .replace(/^["']|["']$/g, "");
    return text.length > 2000 ? text.slice(0, 1997) + "..." : text;
}
