import React from 'react';

interface NaverIconProps {
    className?: string;
}

const NaverIcon: React.FC<NaverIconProps> = ({ className = "w-5 h-5" }) => {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="12" fill="white" />
            <path d="M14.62 13.31L9.07 5H5v14h4.38v-8.31L14.93 19H19V5h-4.38v8.31z" fill="#03C75A" />
        </svg>
    );
};

export default NaverIcon;
