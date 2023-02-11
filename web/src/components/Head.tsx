import { useAtom } from "jotai";
import { useRef, useState } from "react";
import { bookmarksAtom, currentListAtom, openedSectionAtom, selectionActiveAtom } from "../state";
import OutsideClickWrapper from "./OutsideClickWrapper";
import bin from "../assets/bin.png";
import edit from "../assets/edit.png";
import favorite from "../assets/favorite.png";
import share from "../assets/send.png";

const Head = () => {
    const [openedSection, setOpenedSection] = useAtom(openedSectionAtom);
    const [editListMode, setEditListMode] = useState(false);
    const [bookmarks, setBookmarks] = useAtom(bookmarksAtom);
    const [currList, setCurrList] = useAtom(currentListAtom);
    const openedSectionRef = useRef<HTMLElement>(null);
    const [selectionActive, setSelectionActive] = useAtom(selectionActiveAtom);

    const editHandler = () => {
        setEditListMode(!editListMode);
        console.log(openedSectionRef.current);
        setTimeout(() => {
            openedSectionRef.current?.focus();
        }, 0)
    }

    const favHandler = () => {
        setBookmarks(bm => bm.map(b => {
            if (b.selected) {
                b.favorite = !b.favorite;
            }
            return b;
        }))
    }

    const deleteHandler = () => {
        setBookmarks((b) => b.filter((bm) => bm.title !== currList?.title))
        setCurrList("Home")
        setSelectionActive(!selectionActive);
    }

    const shareHandler = () => {
    }

    const handleTitleBlur = () => {
        setBookmarks(bm => bm.map(b => {
            if (b.selected) {
                b.title = openedSectionRef.current?.innerText || b.title;
            }
            return b;
        }))
        setEditListMode(false);
    }

    return (
        <div className='w-full py-4 px-4 flex items-center justify-between border-b border-dark-gray'>
            <OutsideClickWrapper
                as={"p"}
                onOutsideClick={() => handleTitleBlur()}
                listenerState={editListMode}
                className='font-bold text-xl px-2'
                ref={openedSectionRef}
                contentEditable={editListMode}
                suppressContentEditableWarning
                suppressHydrationWarning
                onKeyDown={(e) => {
                    console.log(e.key, e.shiftKey, e.currentTarget.innerText);
                    if (e.key === "Enter" && !e.shiftKey) {
                        handleTitleBlur();
                    }
                }}
            >
                {openedSection?.title}
            </OutsideClickWrapper>
            <div className='bg-dark-gray flex items-center px-2 py-1 rounded-lg'>
                <div onClick={favHandler} className={`hover:bg-[#4E4E4E] ${!openedSection?.favorite && "grayscale"} py-1 rounded-md cursor-pointer`}>
                    <img src={favorite} alt="delete" className='h-5 w-5 mx-2' />
                </div>
                <div onClick={deleteHandler} className='hover:bg-[#4E4E4E] py-1 rounded-md cursor-pointer'>
                    <img src={bin} alt="delete" className='h-4 w-4 mx-2' />
                </div>
                <div onClick={editHandler} className='hover:bg-[#4E4E4E] py-1 rounded-md cursor-pointer'>
                    <img src={edit} alt="edit" className='h-4 w-4 mx-2' />
                </div>
                <div onClick={shareHandler} className='hover:bg-[#4E4E4E] py-1 rounded-md cursor-pointer'>
                    <img src={share} alt="share" className='h-4 w-4 mx-2' />
                </div>
            </div>
        </div>
    )
}

export default Head;
