import React, { useState } from 'react'
import Bar from './Bar'
import ContextMenu from './ContextMenu'

type UrlGridProps = {}

const Head = ({ name }: { name: string }) => {
    return (
        <div className='w-full py-4 px-4 flex items-center justify-between border-b border-dark-gray'>
            <h1 className='font-bold text-xl'>
                {name}
            </h1>
            <Bar />
        </div>
    )
}

// <>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</>

const Url = ({ name }: { name: string }) => {
    const [show, setShow] = useState(false);
    const [selected, setSelected] = useState(false);
    const [deleteActive, setDeleteActive] = useState(false);
    const [xy, setXY] = useState({
        x: 0,
        y: 0,
    })
    const showContextMenu: React.MouseEventHandler<HTMLDivElement> = (e) => {
        e.preventDefault();
        setXY({ x: e.clientX, y: e.clientY });
        setShow(true);
        e.stopPropagation();
    }
    const onClickHandler: React.MouseEventHandler<HTMLDivElement> = (e) => {
    }
    const menuItems = [
        {
            name: "Delete",
            handler: () => { },
        },
        {
            name: "Edit",
            handler: () => { },
        },
    ]
    return (
        <div
            onContextMenu={(e) => showContextMenu(e)}
            onClick={(e) => onClickHandler(e)}
            className='w-full s-shadow py-2 px-2 flex items-center rounded-xl relative overflow-clip justify-center h-16'
        >
            {
                deleteActive &&
                <div
                    className='p-2 bg-black s-shadow absolute top-0 left-0 rounded-br-xl cursor-pointer'
                    onClick={() => setSelected(!selected)}
                >
                    <div className={`${selected ? "bg-blue-500" : "bg-dark-gray"} w-3 h-3 rounded-full mb-auto s-shadow`}></div>
                </div>
            }
            <div className='font-semibold text-base text-center line-clamp-2'>
                <img
                    src="https://www.youtube.com/s/desktop/bd5a1ba8/img/favicon_32x32.png"
                    className='w-4 h-4 inline mr-2'
                    alt="favicon"
                />
                {name}
            </div>
            {
                show && <ContextMenu {...{ setShow, xy, menuItems }} />
            }
        </div>
    )
}


const UrlGrid: React.FC<UrlGridProps> = () => {
    const urls = ['Figma', 'Chrome', 'Whatsapp is a good app ig. therefore thy shall go', 'Youtube', 'Extensions', 'Facebook', 'Twitter', 'Instagram']
    for (let i = 0; i < 3; ++i) {
        urls.push(...urls);
    }
    return (
        <div className='w-full relative h-screen flex flex-col'>
            <Head name="Home" />
            <div className='grid grid-cols-3 gap-5 p-5 w-full max-w-full max-h-full overflow-y-auto'>
                {
                    urls.map((e, i) => <Url name={e} key={i} />)
                }
            </div>
        </div>
    )
}

export default UrlGrid;
