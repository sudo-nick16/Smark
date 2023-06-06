import { createContext, useState } from "react";

const initialState = {
    accessToken: "",
};

export const Store = createContext<{
    state: typeof initialState;
    setState: React.Dispatch<React.SetStateAction<typeof initialState>>;
}>({
    state: initialState,
    setState: () => null,
});

export const StoreProvider = () => {
    const [state, setState] = useState(initialState);

    return <Store.Provider value={{ state, setState }}></Store.Provider>;
};
