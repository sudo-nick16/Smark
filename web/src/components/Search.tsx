import { useAtom } from 'jotai';
import React from 'react'
import { bookmarkListsSelection, bookmarksAtom, currentListAtom, searchActiveAtom, searchQueryAtom, searchTypeAtom, urllistAtom } from '../state';
import slist from "../assets/slist.png";
import { useAddBookmarkListMutation, useRemoveBookmarkListsMutation } from '../graphql/generated';

type SearchProps = {
    searchRef: React.RefObject<HTMLInputElement>;
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
        vl: "select lists",
        vu: "select urls",
    };

    const searchCommands = ["sa", "su", "sl"];
    const [searchType, setSearchType] = useAtom(searchTypeAtom);
    const [searchString, setSearchString] = useAtom(searchQueryAtom);
    const [bookmarks, setBookmarks] = useAtom(bookmarksAtom);
    const [currList] = useAtom(currentListAtom);
    const [searchActive, setSearchActive] = useAtom(searchActiveAtom);
    const [selectLists, setSelectLists] = useAtom(bookmarkListsSelection)

    const [, addList] = useAddBookmarkListMutation();

    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        const str = event.target.value.trimStart();
        if (str.length == 3) {
            // @ts-ignore
            if (cmdMap[str.trimEnd()]) {
                setSearchType(str.trimEnd());
                if (searchCommands.includes(str.trimEnd())) {
                    setSearchActive(true);
                    console.log("search mode active")
                } else {
                    setSearchActive(false);
                }
                setSearchString("");
                return;
            }
        }
        setSearchString(str);
    }

    const [, removeLists] = useRemoveBookmarkListsMutation();

    const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            switch (searchType) {
                case "cu": {
                    console.log("Adding the url");

                    setBookmarks(bookmarks.map(b => {
                        if (b.title === currList?.title) {
                            b.children.push({
                                id: "",
                                title: searchString,
                                icon: "https://www.redditstatic.com/desktop2x/img/favicon/android-icon-192x192.png",
                                url: searchString,
                                selected: false,
                                favorite: false,
                                children: [],
                            })
                        }
                        return b;
                    }))
                    setSearchString("");
                    break;
                }
                case "cl": {
                    console.log("Adding the list");

                    if (bookmarks.find(b => b.title === searchString)) {
                        alert("List already exists");
                        return;
                    }
                    if (!searchString) {
                        return;
                    }
                    const bookmark = {
                        id: "",
                        title: searchString,
                        icon: slist,
                        url: "",
                        selected: true,
                        favorite: false,
                        children: [],
                    }
                    const you = addList({ title: searchString });
                    setBookmarks(
                        [...bookmarks.map(b => ({ ...b, selected: false })), bookmark]
                    )
                    setSearchString("");
                    break;
                }
                case "su": {
                    setSearchString((s) => s.trimEnd());
                    break;
                    // console.log("Searching the url");
                    // const urls: Bookmark[] = [];
                    // bookmarks.forEach(l => {
                    //     if (l.selected) {
                    //         l.children.forEach(u => {
                    //             if (u.url.includes(searchString) || u.title.includes(searchString)) {
                    //                 urls.push(u);
                    //             }
                    //         })
                    //     }
                    // })
                    // break;
                }
                case "sl": {
                    searchRef.current!.blur();
                    setSearchString((s) => s.trimEnd());
                    break;
                }
                case "vl": {
                    setSelectLists((s) => !s);
                    setSearchString((s) => s.trimEnd());
                    break;
                }
                case "dl": {
                    setSelectLists((s) => !s);
                    console.log("filtered bookmarks: ", bookmarks.filter(b => b.selected).map(b => b.id));
                    removeLists({
                        listIds: bookmarks.filter(b => b.selected).map(b => b.id),
                    });
                    setBookmarks((b) => b.filter(b => !b.selected));
                    break;
                }
                case "sa": {
                    searchRef.current!.blur();
                    setSearchString((s) => s.trimEnd());
                    break;
                }
                default:
                    break;
            }
            searchRef.current!.blur();
        }
    }

    return (
        <div className='w-full'>
            <div className='s-shadow rounded-3xl w-full h-auto outline-none p-2 flex'>
                <div className='bg-dark-gray text-base max-w-fit px-3 w-12 text-center rounded-2xl' id="search-type">
                    /{searchType}
                </div>
                <input
                    ref={searchRef}
                    type="text"
                    name="search"
                    className='px-2 text-base outline-none bg-transparent w-full'
                    value={searchString}
                    onChange={(e) => handleInput(e)}
                    onKeyUp={(e) => handleKey(e)}
                />
            </div>
            <div className='mt-4 bg-dark-gray bg-opacity-50 rounded-lg flex flex-col pb-2  mx-auto'>
                <h4 className='w-full text-sm text-center my-2 font-bold'>Commands</h4>
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
