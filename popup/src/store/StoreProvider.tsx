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

export const StoreProvider = ({children}: {children: React.ReactNode}) => {
    const [state, setState] = useState(initialState);

    return <Store.Provider value={{ state, setState }}>{children}</Store.Provider>;
};
