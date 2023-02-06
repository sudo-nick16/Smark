import { useAtom } from 'jotai'
import React, { Suspense, useRef, useState } from 'react'
import { bookmarksAtom, urllistAtom } from '../state'
import ContextMenu from './ContextMenu'
import { Bookmark } from '../types';
import OutsideClickWrapper from './OutsideClickWrapper';
import Head from './Head';

type UrlListProps = {
    className?: string
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
    const [urllist] = useAtom(urllistAtom);
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
