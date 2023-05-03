import { useAtom } from 'jotai';
import React, { Suspense, useState } from 'react';
import smark from "../assets/smark.png";
import { bookmarksAtom, currentListAtom, bookmarkListsSelection, } from '../state';
import { Bookmark, BookmarkList } from '../types';
import Profile from './Profile';

type NavbarProps = {}

const Navbar: React.FC<NavbarProps> = () => {
    const [navList] = useAtom(bookmarksAtom);
    const [currentList, setCurrentList] = useAtom(currentListAtom);
    const [selectLists, setSelectLists] = useAtom(bookmarkListsSelection)
    const [bookmarks, setBookmarks] = useAtom(bookmarksAtom);

    const handleClick = (ele: BookmarkList) => {
        if (!selectLists) {
            setCurrentList(ele.title);
            return;
        }
        setBookmarks((b) => b.map(e => ({ ...e, selected: e.title === ele.title? !e.selected: e.selected})));
    };

    return (
        <div className='h-screen px-4 flex flex-col'>
            <div className='mt-4 ml-4'>
                <img src={smark} alt="smark" className='h-10 w-auto' />
            </div>
            <div className='mt-8 w-full h-full max-h-full overflow-y-auto flex flex-col'>
                {
                    navList.map((ele, i) => (
                        // <div className='flex'>
                        <div
                            onClick={() => handleClick(ele)} key={i}
                            className={`flex items-center py-2 px-4 2xl:py-3 ${ele.selected && "bg-dark-gray"} text-[1rem] transition-all duration-150 bg-opacity-50 w-full hover:bg-dark-gray hover:bg-opacity-70 hover:cursor-pointer rounded-3xl font-semibold`}
                        >
                            {selectLists && ele.selected && <div className='w-2 h-2 bg-blue-500 mr-2 rounded-full'></div>}
                            {ele.title}
                        </div>
                        // </div>
                    ))
                }
            </div>
            <div className='my-4'>
                <Profile />
            </div>
        </div>
    )
}

export default Navbar
