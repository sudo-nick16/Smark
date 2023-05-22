import { useEffect } from "react";

type KeyListenerProps = {
    searchRef: React.RefObject<HTMLInputElement>;
}

const KeyListener: React.FC<KeyListenerProps> = ({ searchRef }) => {

    useEffect(() => {
        const cmdListener = (e: KeyboardEvent) => {
            console.log("key pressed: ", e.key);
            switch (e.key) {
                case "/": {
                    searchRef.current?.focus();
                    break;
                }
                default: {

                }
            }
        }

        window.addEventListener("keyup", cmdListener);
        return () => {
            window.removeEventListener("keyup", cmdListener);
        }
    })
    return (
        <></>
    )
}

export default KeyListener;
