export function isChrome(): boolean {
  return chrome && typeof chrome.storage !== "undefined";
}
