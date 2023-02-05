import OutsideClickWrapper from "./OutsideClickWrapper";

const ContextMenu = ({
    menuItems,
    setShow,
    xy
}: {
    xy: { x: number, y: number },
    menuItems: { name: string, handler: () => void }[],
    setShow: React.Dispatch<React.SetStateAction<boolean>>
}) => {
    return (
        <OutsideClickWrapper
            onOutsideClick={() => {
                setShow(false);
            }}
            style={(() => {
                if (xy.y + menuItems.length * 45 > window.innerHeight) {
                    return {
                        bottom: window.innerHeight - xy.y,
                        left: xy.x,
                    }
                }
                return {
                    top: xy.y,
                    left: xy.x,
                }
            })()}
            className={`fixed z-30 flex flex-col bg-black s-shadow p-1 rounded-lg`}
        >
            {
                menuItems.map((k, i) =>
                    <div
                        key={k.name + i}
                        onClick={k.handler}
                        className='select-none text-base hover:bg-dark-gray px-2 rounded-lg cursor-pointer'
                    >
                        {k.name}
                    </div>
                )
            }
        </OutsideClickWrapper>
    )
}

export default ContextMenu;
