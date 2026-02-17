import { createContext, useContext } from 'react';

// When true, AdminLayout will just render children without the layout shell
const AdminEmbeddedContext = createContext(false);

export const AdminEmbeddedProvider = AdminEmbeddedContext.Provider;
export const useAdminEmbedded = () => useContext(AdminEmbeddedContext);
