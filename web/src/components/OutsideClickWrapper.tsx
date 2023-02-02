import React, { useEffect, useRef } from 'react'

type OutsideClickWrapper = React.DOMAttributes<HTMLDivElement> & {
    onOutsideClick: () => void;
    as: keyof JSX.IntrinsicElements;
    refs: React.MutableRefObject<HTMLElement | undefined>[];
    listenerState: boolean
}

const OutsideClickWrapper: React.FC<OutsideClickWrapper> = ({ onOutsideClick, as: Tag, refs = [], listenerState = true, ...props }) => {
    const ref = useRef<HTMLDivElement>();
    useEffect(() => {
        if (!listenerState) {
            return;
        }
        const handleOutsideClick = (e: MouseEvent) => {
            if (e.target != ref.current && !ref.current?.contains(e.target as Node)) {
                console.log("clicked outside..", ref.current);
                onOutsideClick();
            }
        }
        window.addEventListener("mousedown", handleOutsideClick);
        console.log("outside click listener added.")
        return () => {
            window.removeEventListener("mousedown", handleOutsideClick);
            console.log("outside click listener removed.")
        }
    }, [listenerState])
    return (
        // @ts-ignore
        <Tag
            // @ts-ignore
            ref={(e: HTMLElement) => { ref.current = e; refs.forEach((r) => r.current = e) }}
            {...props}
        > {props.children} </Tag>
    )
}

export default OutsideClickWrapper;
