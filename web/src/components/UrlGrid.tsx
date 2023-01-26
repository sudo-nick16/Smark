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

const Url = ({ name }: { name: string }) => {
    const [show, setShow] = useState(false);
    const [xy, setXY] = useState({
        x: 0,
        y: 0,
    })
    const showContextMenu: React.MouseEventHandler<HTMLDivElement> = (e) => {
        e.preventDefault();
        // position menu
        setXY({ x: e.clientX, y: e.clientY });
        // show menu
        setShow(true);
        // end the listener handling here 
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
            className='w-full s-shadow py-3 px-3 flex items-center justify-between rounded-xl'
        >
            <h1 className='font-semibold text-sm text-center'>
                {name} arstni nar asretn iarstn airnsitn arnsii
            </h1>
            {
                show && <ContextMenu {...{ setShow, xy, menuItems }} />
            }

        </div>
    )
}


const UrlGrid: React.FC<UrlGridProps> = () => {
    const urls = ['Figma', 'Chrome', 'Whatsapp', 'Youtube', 'Extensions', 'Facebook', 'Twitter', 'Instagram']
    return (
        <div className='w-full '>
            <Head name="Home" />
            <div className='grid grid-cols-4 gap-4 p-4 w-full max-w-full'>
                {
                    urls.map((e, i) => <Url name={e} key={i} />)
                }
            </div>
        </div>
    )
}

export default UrlGrid;
