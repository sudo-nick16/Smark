import { RefObject } from "react";

export const focusCEElement = (ref: RefObject<HTMLElement>) => {
    setTimeout(() => {
        ref.current!.focus();
        window.getSelection()?.selectAllChildren(ref.current!);
        window.getSelection()?.collapseToEnd();
    }, 0)
}
