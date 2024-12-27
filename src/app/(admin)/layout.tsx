import React, { ReactNode } from 'react';
import AppLayout from '@/Components/userLayout';
import loadSession from '@/utils/session';

interface LayoutProps {
    children: ReactNode;
}

const Layout: React.FC<LayoutProps> = async ({ children }) => {
    const session = await loadSession()
    return <AppLayout session={session}>{children}</AppLayout>;
};

export default Layout;
