import { useAtom } from 'jotai'
import React, { Suspense, useRef, useState } from 'react'
import { bookmarksAtom, openedSectionAtom, selectionActiveAtom, urllistAtom } from '../state'
import ContextMenu from './ContextMenu'
import bin from "../assets/bin.png";
import edit from "../assets/edit.png";
import favorite from "../assets/favorite.png";
import share from "../assets/send.png";
import { Bookmark } from '../types';
import OutsideClickWrapper from './OutsideClickWrapper';

type UrlListProps = {
    className?: string
}

const Head = () => {
    const [openedSection, setOpenedSection] = useAtom(openedSectionAtom);
    const [editList, setEditList] = useState(false);
    const openedSectionRef = useRef<HTMLElement>(null);
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
            <OutsideClickWrapper
                as={"p"}
                onOutsideClick={() => setEditList(false)}
                listenerState={editList}
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
                {openedSection?.title}
            </OutsideClickWrapper>
            <div className='bg-dark-gray flex items-center px-2 py-1 rounded-lg'>
                <div onClick={deleteHandler} className={`hover:bg-[#4E4E4E] ${openedSection?.favorite && "grayscale"} py-1 rounded-md cursor-pointer`}>
                    <img src={favorite} alt="delete" className='h-5 w-5 mx-2' />
                </div>
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

type ListItemProps = {
    bookmark: Bookmark
    index: number
}

const ListItem: React.FC<ListItemProps> = ({ bookmark: { title, icon, url }, index }) => {
    const [selected, setSelected] = useState(false);
    const [, setBookmarks] = useAtom(bookmarksAtom);
    const [show, setShow] = useState(false);
    const editRef = useRef<HTMLParagraphElement>(null);
    const [edit, setEdit] = useState(false);
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
            handler: () => {
                setBookmarks((bm) => bm.map(b => {
                    if (b.selected) {
                        b.children.splice(index, 1);
                    }
                    return b;
                }))
                setShow(false);
            },
        },
        {
            name: "Edit",
            handler: () => {
                setEdit(true);
                setTimeout(() => {
                    editRef.current!.focus();
                    window.getSelection()?.selectAllChildren(editRef.current!);
                    window.getSelection()?.collapseToEnd();
                }, 0)
                setShow(false);
            },
        },
    ]

    const handleTitleBlur = () => {
        setBookmarks((bm) => bm.map((b) => {
            if (b.selected) {
                b.children = b.children.map((l, i) => {
                    if (l.url === url && i == index) {
                        l.title = editRef.current?.innerText || l.title;
                    }
                    return l
                })
            }
            return b;
        }));
        setEdit(false)
    }

    return (
        <div
            onContextMenu={(e) => showContextMenu(e)}
            draggable
            className='flex flex-row items-center px-3 py-3 border-b border-b-dark-gray hover:bg-dark-gray w-full'
        >
            <div className='flex items-center justify-center w-6 min-w-[1.5rem] h-6 min-h-[1.5rem]'>
                <img src={icon} alt="title" className='w-full h-full' />
            </div>
            <div className='flex flex-col w-full overflow-x-clip pl-3'>
                <OutsideClickWrapper
                    as={"p"}
                    onOutsideClick={handleTitleBlur}
                    ref={editRef}
                    listenerState={edit}
                    className={`${edit && "pr-1"} font-medium text-base break-words w-fit max-w-[95%] line-clamp-2`}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            handleTitleBlur();
                        }
                    }}
                    contentEditable={edit}
                    suppressContentEditableWarning>
                    {title}
                </OutsideClickWrapper>
                <a
                    target={"_blank"}
                    href={url}
                    className='max-w-[90%] w-fit text-md-gray opacity-40 font-semibold text-sm underline truncate'
                >{url}</a>
            </div>
            {
                show && <ContextMenu {...{ setShow, xy, menuItems }} />
            }
            {
                false && <div
                    onClick={() => setSelected(!selected)}
                    className={`${selected ? "bg-blue-500" : "bg-dark-gray"} 
                                border-2 border-dark-gray s-shadow w-3 h-3 rounded-full mr-3 cursor-pointer`}
                ></div>
            }
        </div >
    )
}


const UrlList: React.FC<UrlListProps> = ({ className = "" }) => {
    const [urllist, setUrllist] = useAtom(urllistAtom);
    console.log("urrlist: ", urllist);

    return (
        <Suspense>
            <div className={`${className} w-full relative h-screen flex flex-col`}>
                <Head />
                <div className='h-full overflow-y-auto w-full flex flex-col' id="urllist-container">
                    {
                        urllist && urllist.map((e, i) =>
                            <ListItem index={i} bookmark={e} key={i} />
                        )
                    }
                </div>
            </div>
        </Suspense>
    )
}

export default UrlList;
