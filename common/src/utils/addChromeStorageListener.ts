const addChromeStorageListener = <T>(
  key: string,
  callback: (oldValue: T, newValue: T) => Promise<void> | void
) => {
  if (typeof chrome === "undefined" || typeof chrome.storage === "undefined") {
    return;
  }
  chrome.storage.onChanged.addListener(async (changes, _) => {
    for (let k of Object.keys(changes)) {
      if (k === key) {
        await callback(changes[key].oldValue, changes[key].newValue);
        break;
      }
    }
  });
};

export default addChromeStorageListener;
