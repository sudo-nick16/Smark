export const onEnter = (e: React.KeyboardEvent<HTMLElement>, callback: () => void) => {
    if (e.key === "Enter" && !e.shiftKey) {
        callback && callback();
    }
}

