import React from 'react';

interface KakaoIconProps {
    className?: string;
}

const KakaoIcon: React.FC<KakaoIconProps> = ({ className = "w-5 h-5" }) => {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 3C6.477 3 2 6.477 2 10.8c0 2.817 1.866 5.283 4.65 6.73-.197.73-.723 2.692-.826 3.11-.125.506.184.5.388.363.167-.112 2.677-1.824 3.095-2.117.553.076 1.12.114 1.693.114 5.523 0 10-3.477 10-7.8S17.523 3 12 3z" fill="#3C1E1E" />
        </svg>
    );
};

export default KakaoIcon;
