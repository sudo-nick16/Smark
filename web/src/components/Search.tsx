import { useAtom } from 'jotai';
import React, { useState } from 'react'
import { searchQueryAtom, searchTypeAtom } from '../state';

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

    return (
        <div className='w-full'>
            <div className='s-shadow rounded-3xl w-full h-auto outline-none p-2 flex'>
                <div className='bg-dark-gray max-w-fit px-3 w-12 text-center rounded-2xl' id="search-type">
                    /{searchType}
                </div>
                <input ref={searchRef} type="text" name="search" className='px-2 outline-none bg-transparent w-full' value={searchString} onChange={(e) => handleInput(e)} >
                </input>
            </div>
            <div className='mt-4 bg-dark-gray bg-opacity-50 rounded-lg flex flex-col pb-2  mx-auto'>
                <h4 className='w-full text-center my-2 font-bold'>Commands</h4>
                {
                    // @ts-ignore
                    Object.keys(cmdMap).map((k: keyof typeof cmdMap, i: number) =>
                        <div
                            className='px-3 w-full max-w-full grid grid-cols-6 my-1'
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
