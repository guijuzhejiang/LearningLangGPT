import React, { createContext, useContext, useState } from 'react';

const ScoreSheetContext = createContext();

export const ScoreSheetProvider = ({ children }) => {
    const [state, setState] = useState('initial state');

    const updateState = (newState) => {
        setState(newState);
    };

    return (
        <ScoreSheetContext.Provider value={{ state, updateState }}>
            {children}
        </ScoreSheetContext.Provider>
    );
};

export const useScoreSheetContext = () => useContext(ScoreSheetContext);
