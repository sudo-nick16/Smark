import { useAtom } from 'jotai';
import React, { useState } from 'react'
import { bookmarksAtom, currentListAtom, searchQueryAtom, searchTypeAtom } from '../state';

type SearchProps = {
    searchRef: React.MutableRefObject<HTMLInputElement | undefined>;
}

const Search: React.FC<SearchProps> = ({ searchRef }) => {
    const cmdMap = {
        su: "search urls in the current list",
        sa: "search urls in all the lists",
        sl: "search lists",
        cu: "create url",
        cl: "create list",
        du: "delete urls",
        dl: "delete lists",
    };

    const [searchType, setSearchType] = useAtom(searchTypeAtom);
    const [searchString, setSearchString] = useAtom(searchQueryAtom);
    const [bookmarks, setBookmarks] = useAtom(bookmarksAtom);
    const [currList, setCurrList] = useAtom(currentListAtom);

    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        const str = event.target.value.trimStart();
        if (str.length == 3) {
            // @ts-ignore
            if (cmdMap[str.trimEnd()]) {
                setSearchType(str.trimEnd());
                setSearchString("");
                return;
            }
        }
        setSearchString(str);
    }

    const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            switch (searchType) {
                case "cu": {
                    console.log("Adding the url");
                    setBookmarks(bookmarks.map(b => {
                        if (b.title === currList) {
                            b.children.push({
                                title: searchString,
                                icon: "https://www.redditstatic.com/desktop2x/img/favicon/android-icon-192x192.png",
                                url: "https://google.com/",
                                selected: false,
                                favorite: false,
                                children: [],
                            })
                        }
                        return b; 
                    }))
                    break;
                }
                default:
                    break;
            }

        }
    }

    return (
        <div className='w-full'>
            <div className='s-shadow rounded-3xl w-full h-auto outline-none p-2 flex'>
                <div className='bg-dark-gray max-w-fit px-3 w-12 text-center rounded-2xl' id="search-type">
                    /{searchType}
                </div>
                <input
                    ref={searchRef}
                    type="text"
                    name="search"
                    className='px-2 outline-none bg-transparent w-full'
                    value={searchString}
                    onChange={(e) => handleInput(e)}
                    onKeyUp={(e) => handleKey(e)}
                />
            </div>
            <div className='mt-4 bg-dark-gray bg-opacity-50 rounded-lg flex flex-col pb-2  mx-auto'>
                <h4 className='w-full text-center my-2 font-bold'>Commands</h4>
                {
                    // @ts-ignore
                    Object.keys(cmdMap).map((k: keyof typeof cmdMap, i: number) =>
                        <div
                            className='px-3 w-full text-sm max-w-full grid grid-cols-6 my-1'
                            key={i}
                        >
                            <span className='bg-md-gray w-8 text-center rounded-md h-fit bg-opacity-30'>
                                /{k}
                            </span>
                            <span className='col-span-5 truncate w-fit max-w-full'>
                                {cmdMap[k]}
                            </span>
                        </div>
                    )
                }
            </div>
        </div>
    )
}
export default Search;
