import { useState, useEffect } from 'react';
import { X, Ruler, Weight, User, Sparkles, Check } from 'lucide-react';
import { getSizeRecommendation, saveUserSizeProfile, getUserSizeProfile } from '../../lib/gemini';

interface SizeRecommenderProps {
    isOpen: boolean;
    onClose: () => void;
}

const SizeRecommender = ({ isOpen, onClose }: SizeRecommenderProps) => {
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [bodyType, setBodyType] = useState('regular');
    const [fitPreference, setFitPreference] = useState('regular');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    // Load saved profile on mount
    useEffect(() => {
        const profile = getUserSizeProfile();
        if (profile) {
            setHeight(profile.height.toString());
            setWeight(profile.weight.toString());
            setBodyType(profile.bodyType);
            setFitPreference(profile.fitPreference);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setResult(null);

        try {
            const recommendation = await getSizeRecommendation(
                parseFloat(height),
                parseFloat(weight),
                bodyType,
                fitPreference
            );

            setResult(recommendation);

            // Save profile to localStorage
            saveUserSizeProfile({
                height: parseFloat(height),
                weight: parseFloat(weight),
                bodyType,
                fitPreference,
                recommendedSize: recommendation.size,
            });
        } catch (error) {
            console.error('Error getting size recommendation:', error);
            setResult({
                error: 'Failed to get recommendation. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-peach-400 to-peach-500 p-6 rounded-t-3xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                <Sparkles className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">AI Size Recommender</h2>
                                <p className="text-peach-100 text-sm">Find your perfect fit</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all"
                        >
                            <X className="h-5 w-5 text-white" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    {!result ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Height */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    <div className="flex items-center gap-2">
                                        <Ruler className="h-4 w-4 text-peach-500" />
                                        Height (cm)
                                    </div>
                                </label>
                                <input
                                    type="number"
                                    value={height}
                                    onChange={(e) => setHeight(e.target.value)}
                                    required
                                    min="100"
                                    max="250"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-peach-400 focus:outline-none transition-colors"
                                    placeholder="e.g., 175"
                                />
                            </div>

                            {/* Weight */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    <div className="flex items-center gap-2">
                                        <Weight className="h-4 w-4 text-peach-500" />
                                        Weight (kg)
                                    </div>
                                </label>
                                <input
                                    type="number"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                    required
                                    min="30"
                                    max="200"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-peach-400 focus:outline-none transition-colors"
                                    placeholder="e.g., 70"
                                />
                            </div>

                            {/* Body Type */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-peach-500" />
                                        Body Type
                                    </div>
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['slim', 'regular', 'broad'].map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setBodyType(type)}
                                            className={`py-3 px-4 rounded-xl font-semibold capitalize transition-all ${bodyType === type
                                                    ? 'bg-gradient-to-r from-peach-400 to-peach-500 text-white shadow-lg'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Fit Preference */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Fit Preference
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['slim', 'regular', 'relaxed'].map((fit) => (
                                        <button
                                            key={fit}
                                            type="button"
                                            onClick={() => setFitPreference(fit)}
                                            className={`py-3 px-4 rounded-xl font-semibold capitalize transition-all ${fitPreference === fit
                                                    ? 'bg-gradient-to-r from-peach-400 to-peach-500 text-white shadow-lg'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {fit}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-gradient-to-r from-peach-400 to-peach-500 text-white font-bold rounded-xl hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-5 w-5" />
                                        Get My Size
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <div className="space-y-6">
                            {result.error ? (
                                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
                                    <p className="text-red-700 font-semibold">{result.error}</p>
                                </div>
                            ) : (
                                <>
                                    {/* Recommended Size */}
                                    <div className="bg-gradient-to-br from-peach-50 to-white border-2 border-peach-200 rounded-2xl p-8 text-center">
                                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-peach-400 to-peach-500 rounded-full mb-4">
                                            <Check className="h-8 w-8 text-white" />
                                        </div>
                                        <h3 className="text-sm font-semibold text-gray-600 mb-2">Your Recommended Size</h3>
                                        <div className="text-6xl font-bold bg-gradient-to-r from-peach-500 to-peach-600 bg-clip-text text-transparent mb-2">
                                            {result.size}
                                        </div>
                                        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                                            {Math.round(result.confidence * 100)}% Confidence
                                        </div>
                                    </div>

                                    {/* Alternative Sizes */}
                                    {result.alternatives && result.alternatives.length > 0 && (
                                        <div>
                                            <h4 className="font-semibold text-gray-700 mb-3">Alternative Sizes</h4>
                                            <div className="flex gap-3">
                                                {result.alternatives.map((size: string) => (
                                                    <div
                                                        key={size}
                                                        className="flex-1 py-3 bg-gray-100 rounded-xl text-center font-bold text-gray-700"
                                                    >
                                                        {size}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* AI Reasoning */}
                                    <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                                        <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                            <Sparkles className="h-4 w-4 text-peach-500" />
                                            AI Stylist's Advice
                                        </h4>
                                        <p className="text-gray-600 leading-relaxed">{result.reasoning}</p>
                                    </div>

                                    {/* BMI Info */}
                                    <div className="text-center text-sm text-gray-500">
                                        Your BMI: {result.bmi} • Saved to your profile
                                    </div>

                                    {/* Try Again Button */}
                                    <button
                                        onClick={() => setResult(null)}
                                        className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all"
                                    >
                                        Try Different Measurements
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SizeRecommender;
