export function isChrome(): boolean {
  return typeof chrome !== "undefined" && typeof chrome.storage !== "undefined";
}
