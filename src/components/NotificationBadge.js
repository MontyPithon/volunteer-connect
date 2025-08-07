import React from 'react';

const NotificationBadge = ({ count, children }) => {
    return (
        <div className="relative">
            {children}
            {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px] z-10">
                    {count > 99 ? '99+' : count}
                </span>
            )}
        </div>
    );
};

export default NotificationBadge;
