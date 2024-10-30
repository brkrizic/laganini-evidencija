// src/context/BaseUrlContext.js
import React, { createContext, useContext, useState } from "react";

// Create the context
const BaseUrlContext = createContext();

// Create a provider component
export const BaseUrlProvider = ({ children }) => {
    // Set the initial base URL
    const [baseUrl, setBaseUrl] = useState("http://localhost:8080");

    return (
        <BaseUrlContext.Provider value={{ baseUrl, setBaseUrl }}>
            {children}
        </BaseUrlContext.Provider>
    );
};

// Custom hook to use baseUrl and setBaseUrl in components
export const useBaseUrl = () => useContext(BaseUrlContext);
