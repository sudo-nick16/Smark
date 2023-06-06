export function isChrome(): boolean {
    return typeof chrome.storage !== "undefined";
}
