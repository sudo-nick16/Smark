import { useEffect, useRef } from "react";

const ContextMenu = ({
    menuItems,
    setShow,
    xy
}: {
    xy: { x: number, y: number },
    menuItems: { name: string, handler: () => void }[],
    setShow: React.Dispatch<React.SetStateAction<boolean>>
}) => {
    const menuRef = useRef<HTMLDivElement>();

    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            console.log("event target: ", e.target, "menuref current: ", menuRef.current);
            if (e.target != menuRef.current && !menuRef.current?.contains(e.target as Node)) {
                setShow(false);
            }
        }
        window.addEventListener("mousedown", handleOutsideClick);
        return () => {
            window.removeEventListener("mousedown", handleOutsideClick);
        }
    }, [])

    return (
        <div
            // @ts-ignore
            ref={menuRef}
            style={{
                top: xy.y,
                left: xy.x,
            }}
            className={`fixed z-30 flex flex-col bg-black s-shadow p-1 rounded-lg`}
        >
            {
                menuItems.map((k, i) =>
                    <div
                        key={k.name + i}
                        onClick={k.handler}
                        className='select-none hover:bg-dark-gray px-2 rounded-lg cursor-pointer'
                    >
                        {k.name}
                    </div>
                )
            }
        </div>
    )
}

export default ContextMenu;
