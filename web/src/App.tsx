import { useEffect, useRef } from "react"
import Navbar from "./components/Navbar"
import Search from "./components/Search"
import UrlGrid from "./components/UrlGrid"

function App() {
    const searchRef = useRef<HTMLInputElement>();

    useEffect(() => {
        const cmdListener = (e: KeyboardEvent) => {
            console.log(e);
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
        <div className="mx-auto h-full">
            <div className="h-full grid grid-cols-4 text-white font-white w-full">
                <Navbar />
                <div className="border-l border-r border-dark-gray col-span-2">
                    <UrlGrid />
                </div>
                <div className="p-3">
                    <Search {...{searchRef}}/>
                </div>
            </div>
        </div>
    )
}

export default App
