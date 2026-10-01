import React, { createContext, useContext } from "react";
const PageData = createContext(null);
export const PageDataProvider = PageData.Provider;
export const usePageData = () => useContext(PageData);
