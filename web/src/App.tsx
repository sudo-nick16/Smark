import { Provider } from "jotai";
import { useEffect, useRef } from "react"
import Navbar from "./components/Navbar"
import Search from "./components/Search"
import UrlList from "./components/UrlList"

function App() {
    const searchRef = useRef<HTMLInputElement>();

    useEffect(() => {
        const cmdListener = (e: KeyboardEvent) => {
            if (e.key === "/") {
                searchRef.current?.focus();
            }
        }
        window.addEventListener("keyup", cmdListener);

        return () => {
            window.removeEventListener("keyup", cmdListener);
        }

    }, [])

    return (
        <Provider>
            <div className="mx-auto h-full w-7xl max-w-7xl">
                <div className="h-full grid grid-cols-4 text-white font-white w-full">
                    <Navbar />
                    <div className="border-l border-r border-dark-gray col-span-2 h-full">
                        <UrlList />
                    </div>
                    <div className="p-3 max-w-[300px]">
                        <Search {...{ searchRef }} />
                    </div>
                </div>
            </div>
        </Provider>
    )
}

export default App
