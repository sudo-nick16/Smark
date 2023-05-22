import React from 'react'
import { useSelector } from 'react-redux';
import { RootState, setDefaulList, useAppDispatch } from '../store/index';
import { BookmarkListWithChildren } from '../types';

type AccountProps = {
    className?: string
}

const Account: React.FC<AccountProps> = ({ className }) => {
    const appDispatch = useAppDispatch();
    const bookmarks = useSelector<RootState, BookmarkListWithChildren[]>(state => state.bookmarks);
    const auth = useSelector<RootState, RootState['auth']>(state => state.auth);
    const handleDropdownChange = (list: string) => {
        console.log({ list })
        appDispatch(setDefaulList(list));
    }
    return (
        <>
            <div className={`${className} w-full relative h-screen flex flex-col`}>
                <div className="w-full py-4 px-4 flex items-center justify-between border-b border-dark-gray">
                    <h1 className='font-bold text-xl'>Account</h1>
                </div>
                <div
                    className="h-full overflow-y-auto w-full flex flex-col"
                    id="urllist-container"
                >
                    <div className='grid grid-cols-2 grid-flow-row gap-4 p-4 w-3/4 mx-auto text-base font-semibold'>
                        <span>Name</span>
                        <input type="text" value={auth.user?.name} className='bg-transparent border border-md-gray rounded-md text-base px-2' />

                        <span>Email</span>
                        <input type="text" value={auth.user?.email} className='bg-transparent border border-md-gray rounded-md text-base px-2' />

                        <span>Default list</span>
                        <select onChange={(e) => handleDropdownChange(e.target.value)} className='text-white bg-transparent border-0 outline-none'>
                            {
                                bookmarks.map((bookmark, index) => {
                                    return (
                                        <option className='bg-black' key={index} value={bookmark.title}>{bookmark.title}</option>
                                    )
                                })
                            }
                        </select>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Account
