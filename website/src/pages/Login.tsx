import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        // Simple password check (you can change this password)
        const correctPassword = 'verse2024';

        if (password === correctPassword) {
            // Set cookie or localStorage
            document.cookie = `verse-auth=${correctPassword}; path=/; max-age=86400`; // 24 hours
            localStorage.setItem('verse-auth', 'true');
            navigate('/');
        } else {
            setError('Incorrect password. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-peach-50 via-white to-peach-100">
            <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full border-2 border-peach-200">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-peach-400 to-peach-600 bg-clip-text text-transparent mb-2">
                        VERSE
                    </h1>
                    <p className="text-gray-600">Private Access</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Enter Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter access password"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-peach-400 focus:outline-none transition-colors"
                            required
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full py-3 bg-gradient-to-r from-peach-400 to-peach-500 text-white font-bold rounded-xl hover:shadow-xl transition-all"
                    >
                        Access Website
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Contact the owner for access password
                </p>
            </div>
        </div>
    );
};

export default Login;
