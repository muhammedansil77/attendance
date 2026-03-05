import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    return (
        <div className="d-flex vw-100 vh-100 overflow-hidden">
            <Sidebar />
            <div className="flex-grow-1 bg-light overflow-auto">
                <div className="p-4 w-100">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Layout;
