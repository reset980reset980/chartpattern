
import React, { useState } from 'react';
import GoogleIcon from './icons/GoogleIcon';
import KakaoIcon from './icons/KakaoIcon';
import NaverIcon from './icons/NaverIcon';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess: (user: any) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
        const body = isLogin ? { username, password } : { username, password, name };

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || '인증 실패');

            if (isLogin) {
                onLoginSuccess(data.user);
                onClose();
            } else {
                alert('회원가입 성공! 로그인해주세요.');
                setIsLogin(true);
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleSocialLogin = (provider: string) => {
        const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3006/api' : '/api';
        window.location.href = `${API_URL}/auth/${provider}`;
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div
                className="relative bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-8 animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">
                        {isLogin ? '로그인' : '회원가입'}
                    </h2>
                    <p className="text-slate-400 text-sm">
                        차트 패턴 프로 AI의 모든 기능을 이용해보세요.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs text-center">
                        {error}
                    </div>
                )}

                <div className="space-y-3 mb-8">
                    <button
                        onClick={() => handleSocialLogin('google')}
                        className="w-full h-11 bg-white hover:bg-slate-100 text-slate-900 rounded-xl font-bold text-sm flex items-center justify-center gap-3 transition-all active:scale-95"
                    >
                        <GoogleIcon className="w-5 h-5" />
                        Google로 계속하기
                    </button>

                    <button
                        onClick={() => handleSocialLogin('kakao')}
                        className="w-full h-11 bg-[#FEE500] hover:bg-[#FDD835] text-slate-900 rounded-xl font-bold text-sm flex items-center justify-center gap-3 transition-all active:scale-95"
                    >
                        <KakaoIcon className="w-5 h-5" />
                        Kakao로 계속하기
                    </button>

                    <button
                        onClick={() => handleSocialLogin('naver')}
                        className="w-full h-11 bg-[#03C75A] hover:bg-[#02B350] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-3 transition-all active:scale-95"
                    >
                        <NaverIcon className="w-6 h-6" />
                        Naver로 계속하기
                    </button>
                </div>

                <div className="relative mb-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-800"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-slate-900 px-2 text-slate-500">또는 이메일로 {isLogin ? '로그인' : '회원가입'}</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <input
                            type="text"
                            placeholder="이름"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full bg-slate-800 border-0 rounded-xl h-11 px-4 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-500"
                        />
                    )}
                    <input
                        type="text"
                        placeholder="이메일 (아이디)"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="w-full bg-slate-800 border-0 rounded-xl h-11 px-4 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-500"
                    />
                    <input
                        type="password"
                        placeholder="비밀번호"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full bg-slate-800 border-0 rounded-xl h-11 px-4 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-500"
                    />

                    <button
                        type="submit"
                        className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-900/20 transition-all active:scale-95 mt-2"
                    >
                        {isLogin ? '로그인' : '회원가입'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-slate-500 text-xs">
                        {isLogin ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="ml-2 text-blue-500 font-bold hover:underline"
                        >
                            {isLogin ? '회원가입' : '로그인'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
