import { useAtom } from 'jotai'
import React, { useRef, useState } from 'react'
import { openedSectionAtom, selectionActiveAtom } from '../state'
import ContextMenu from './ContextMenu'
import bin from "../assets/bin.png";
import edit from "../assets/edit.png";
import share from "../assets/send.png";
import { reverse } from '../utils/reverse';

type UrlListProps = {}

const Head = ({ name }: { name: string }) => {
    const [openedSection, setOpenedSection] = useAtom(openedSectionAtom);
    const [editList, setEditList] = useState(false);
    const openedSectionRef = useRef<HTMLHeadElement>();
    const [selectionActive, setSelectionActive] = useAtom(selectionActiveAtom);

    const editHandler = () => {
        setEditList(!editList);
        console.log(openedSectionRef.current);
        setTimeout(() => {
            openedSectionRef.current?.focus();
        }, 0)
    }
    const deleteHandler = () => {
        setSelectionActive(!selectionActive);
    }
    return (
        <div className='w-full py-4 px-4 flex items-center justify-between border-b border-dark-gray'>
            <p
                className='font-bold text-xl px-2'
                ref={openedSectionRef}
                contentEditable={editList}
                suppressContentEditableWarning
                suppressHydrationWarning
                onKeyDown={(e) => {
                    console.log(e.key, e.shiftKey, e.currentTarget.innerText);
                    if (e.key === "Enter" && !e.shiftKey) {
                        setOpenedSection(e.currentTarget.innerText);
                        setEditList(false);
                    }
                }}
            >
                {openedSection}
            </p>
            <div className='bg-dark-gray flex items-center px-2 py-1 rounded-lg'>
                <div onClick={deleteHandler} className='hover:bg-[#4E4E4E] py-1 rounded-md cursor-pointer'>
                    <img src={bin} alt="delete" className='h-4 w-4 mx-2' />
                </div>
                <div onClick={editHandler} className='hover:bg-[#4E4E4E] py-1 rounded-md cursor-pointer'>
                    <img src={edit} alt="edit" className='h-4 w-4 mx-2' />
                </div>
                <div onClick={() => { }} className='hover:bg-[#4E4E4E] py-1 rounded-md cursor-pointer'>
                    <img src={share} alt="share" className='h-4 w-4 mx-2' />
                </div>
            </div>
        </div>
    )
}

const Url = ({ name }: { name: string }) => {
    const [selected, setSelected] = useState(false);
    const [deleteActive, setDeleteActive] = useState(false);
    const [show, setShow] = useState(false);
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

type ListItemProps = {
    title: string;
    url: string;
    icon: string;
}

const ListItem: React.FC<ListItemProps> = ({ title, icon, url }) => {
    const [selected, setSelected] = useState(false);
    const [show, setShow] = useState(false);
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

    const [selectionActive, setSelectionActive] = useAtom(selectionActiveAtom);

    return (
        <div
            onContextMenu={(e) => showContextMenu(e)}
            className='flex items-center px-3 py-3 border-b border-b-dark-gray hover:bg-dark-gray'
        >
            {
                selectionActive && <div
                    onClick={() => setSelected(!selected)}
                    className={`${selected ? "bg-blue-500" : "bg-dark-gray"} 
                                border-2 border-dark-gray s-shadow rounded w-4 h-4 mr-3 cursor-pointer`}
                > </div>
            }
            <div className='flex items-center justify-center mr-3'>
                <img src={icon} alt="title" className='w-6 h-6' />
            </div>
            <div className=''>
                <div className='font-semibold' contentEditable suppressContentEditableWarning>{title}</div>
                <a href={url} className='w-fit text-md-gray opacity-40 font-semibold text-sm underline truncate line-clamp-1'>{url}</a>
            </div>
            {
                show && <ContextMenu {...{ setShow, xy, menuItems }} />
            }
        </div>
    )
}


const UrlList: React.FC<UrlListProps> = () => {
    const urls = ['Figma', 'Chrome', 'Whatsapp is a good app ig. therefore thy shall go', 'Youtube', 'Extensions', 'Facebook', 'Twitter', 'Instagram']
    for (let i = 0; i < 3; ++i) {
        urls.push(...urls);
    }
    return (
        <div className='w-full relative h-screen flex flex-col'>
            <Head name="Home" />
            <div className='h-full overflow-y-auto' id="urllist-container">
                {
                    urls.map((e, i) =>
                        <ListItem icon='https://www.youtube.com/s/desktop/bd5a1ba8/img/favicon_32x32.png'
                            title={e}
                            url={e}
                            key={i}
                        />
                    )
                }
            </div>
        </div>
    )
}

export default UrlList;
