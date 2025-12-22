import { useState, useEffect } from 'react';
import { Upload, Sparkles, Video, Image as ImageIcon, Check, AlertCircle, Loader2 } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { fetchProducts } from '../lib/shopify';
import type { ShopifyProduct } from '../lib/shopify';

const VirtualTryOn = () => {
    const [products, setProducts] = useState<ShopifyProduct[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<ShopifyProduct | null>(null);
    const [personImage, setPersonImage] = useState<File | null>(null);
    const [personImagePreview, setPersonImagePreview] = useState<string>('');
    const [customGarment, setCustomGarment] = useState<File | null>(null);
    const [customGarmentPreview, setCustomGarmentPreview] = useState<string>('');
    const [resultImage, setResultImage] = useState<string>('');
    const [resultVideo, setResultVideo] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState('Ready to try on...');
    const [statusType, setStatusType] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
    const [generateVideo, setGenerateVideo] = useState(false);
    const [useCustomGarment, setUseCustomGarment] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const fetchedProducts = await fetchProducts();
                setProducts(fetchedProducts);
            } catch (error) {
                console.error('Error loading products:', error);
            }
        };
        loadProducts();
    }, []);

    const handlePersonImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPersonImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPersonImagePreview(reader.result as string);
                setCurrentStep(2);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCustomGarmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCustomGarment(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setCustomGarmentPreview(reader.result as string);
                setCurrentStep(3);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleTryOn = async () => {
        if (!personImage) {
            setStatus('Please upload your photo');
            setStatusType('error');
            return;
        }

        if (!useCustomGarment && !selectedProduct) {
            setStatus('Please select a product');
            setStatusType('error');
            return;
        }

        if (useCustomGarment && !customGarment) {
            setStatus('Please upload a garment image');
            setStatusType('error');
            return;
        }

        setIsProcessing(true);
        setStatus('Processing your virtual try-on...');
        setStatusType('processing');
        setResultImage('');
        setResultVideo('');

        try {
            const formData = new FormData();
            formData.append('person_image', personImage);

            if (useCustomGarment && customGarment) {
                formData.append('garment_image', customGarment);
                formData.append('description', 'Custom garment');
            } else if (selectedProduct) {
                const response = await fetch(selectedProduct.node.images.edges[0].node.url);
                const blob = await response.blob();
                formData.append('garment_image', blob, 'product.jpg');
                formData.append('description', selectedProduct.node.title);
            }

            formData.append('generate_video', generateVideo.toString());

            // Use environment variable for backend URL, fallback to localhost for development
            const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:7860';

            const apiResponse = await fetch(`${BACKEND_URL}/api/tryon`, {
                method: 'POST',
                body: formData,
            });

            if (!apiResponse.ok) {
                // Try to get detailed error message from response
                const errorData = await apiResponse.json().catch(() => null);
                if (errorData?.error) {
                    const errorMessage = errorData.error;
                    const details = errorData.details || errorData.suggestion || errorData.tip || '';
                    setStatus(`${errorMessage}${details ? ' ' + details : ''}`);
                } else {
                    setStatus('Error: Unable to connect to the backend. Make sure the Python server is running on port 7860.');
                }
                setStatusType('error');
                setIsProcessing(false);
                return;
            }

            const result = await apiResponse.json();

            if (result.image) {
                setResultImage(result.image);
            }

            if (result.video) {
                setResultVideo(result.video);
            }

            setStatus('Try-on complete! Looking amazing! ✨');
            setStatusType('success');
        } catch (error) {
            console.error('Error during try-on:', error);
            setStatus('Error: Unable to connect to the backend. Make sure the Python server is running on port 7860.');
            setStatusType('error');
        } finally {
            setIsProcessing(false);
        }
    };

    const StatusIcon = () => {
        switch (statusType) {
            case 'processing':
                return <Loader2 className="h-5 w-5 animate-spin" />;
            case 'success':
                return <Check className="h-5 w-5" />;
            case 'error':
                return <AlertCircle className="h-5 w-5" />;
            default:
                return <Sparkles className="h-5 w-5" />;
        }
    };

    const statusColors = {
        idle: 'bg-gray-100 text-gray-700 border-gray-200',
        processing: 'bg-peach-50 text-peach-700 border-peach-200',
        success: 'bg-green-50 text-green-700 border-green-200',
        error: 'bg-red-50 text-red-700 border-red-200',
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-peach-50 via-white to-peach-100">
            <Navigation />

            {/* Hero Section - Peach Theme */}
            <section className="relative py-12 sm:py-16 bg-gradient-to-br from-peach-400 via-peach-300 to-white overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.5) 1px, transparent 0)`,
                        backgroundSize: '40px 40px'
                    }}></div>
                </div>
                <div className="container mx-auto px-4 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 bg-white/40 backdrop-blur-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-peach-900 text-xs sm:text-sm font-semibold mb-4 sm:mb-6 animate-fadeIn shadow-lg border border-white/60">
                        <Sparkles className="h-4 w-4 text-peach-600" />
                        AI-Powered Virtual Try-On
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-peach-900 mb-4 sm:mb-6 tracking-tight animate-slideInLeft">
                        Try Before You Buy
                    </h1>
                    <p className="text-lg sm:text-xl md:text-2xl text-peach-800 max-w-2xl mx-auto animate-slideInRight">
                        Experience your perfect fit with our cutting-edge virtual try-on technology
                    </p>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-8 sm:py-12 flex-1">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 max-w-7xl mx-auto items-start">
                        {/* Left Panel - Inputs */}
                        <div className="lg:col-span-7 space-y-6 sm:space-y-8 animate-fadeIn">
                            {/* Step 1: Upload Photo */}
                            <div className={`bg-white/90 backdrop-blur-sm rounded-3xl p-5 sm:p-8 border-2 transition-all duration-300 shadow-lg ${currentStep >= 1 ? 'border-peach-300 shadow-peach-200/50' : 'border-gray-200'}`}>
                                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-base sm:text-lg transition-all duration-300 ${personImage ? 'bg-gradient-to-br from-peach-400 to-peach-500 text-white shadow-lg shadow-peach-300/50' : 'bg-gray-200 text-gray-600'
                                        }`}>
                                        {personImage ? <Check className="h-4 w-4 sm:h-5 sm:w-5" /> : '1'}
                                    </div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Upload Your Photo</h2>
                                </div>

                                <div className="space-y-4">
                                    <label className="block cursor-pointer group">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePersonImageChange}
                                            className="hidden"
                                        />
                                        <div className="border-3 border-dashed border-peach-300 rounded-2xl p-8 sm:p-12 text-center transition-all duration-300 group-hover:border-peach-400 group-hover:bg-peach-50/50 bg-white">
                                            <Upload className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-peach-400 mb-3 sm:mb-4 group-hover:text-peach-500 transition-colors" />
                                            <p className="text-base sm:text-lg font-semibold text-gray-700 mb-2">Click to upload or drag and drop</p>
                                            <p className="text-xs sm:text-sm text-gray-500">PNG, JPG up to 50MB</p>
                                        </div>
                                    </label>

                                    {personImagePreview && (
                                        <div className="relative rounded-2xl overflow-hidden shadow-xl animate-scaleIn border-2 border-peach-200">
                                            <img
                                                src={personImagePreview}
                                                alt="Your photo"
                                                className="w-full h-80 object-cover"
                                            />
                                            <div className="absolute top-4 right-4 bg-gradient-to-r from-peach-400 to-peach-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg">
                                                <Check className="h-4 w-4" />
                                                Photo uploaded
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Step 2: Select Garment */}
                            <div className={`bg-white/90 backdrop-blur-sm rounded-3xl p-5 sm:p-8 border-2 transition-all duration-300 shadow-lg ${currentStep >= 2 ? 'border-peach-300 shadow-peach-200/50' : 'border-gray-200 opacity-60'}`}>
                                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-base sm:text-lg transition-all duration-300 ${(selectedProduct || customGarment) ? 'bg-gradient-to-br from-peach-400 to-peach-500 text-white shadow-lg shadow-peach-300/50' : 'bg-gray-200 text-gray-600'
                                        }`}>
                                        {(selectedProduct || customGarment) ? <Check className="h-4 w-4 sm:h-5 sm:w-5" /> : '2'}
                                    </div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Select Garment</h2>
                                </div>

                                {/* Toggle */}
                                <div className="flex gap-3 mb-6">
                                    <button
                                        onClick={() => setUseCustomGarment(false)}
                                        className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${!useCustomGarment
                                            ? 'bg-gradient-to-r from-peach-400 to-peach-500 text-white shadow-lg shadow-peach-300/40'
                                            : 'bg-white text-gray-700 hover:bg-peach-50 border-2 border-peach-200'
                                            }`}
                                    >
                                        Our Products
                                    </button>
                                    <button
                                        onClick={() => setUseCustomGarment(true)}
                                        className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${useCustomGarment
                                            ? 'bg-gradient-to-r from-peach-400 to-peach-500 text-white shadow-lg shadow-peach-300/40'
                                            : 'bg-white text-gray-700 hover:bg-peach-50 border-2 border-peach-200'
                                            }`}
                                    >
                                        Upload Custom
                                    </button>
                                </div>

                                {!useCustomGarment ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 max-h-96 overflow-y-auto pr-2">
                                        {products.map((product) => (
                                            <div
                                                key={product.node.id}
                                                onClick={() => {
                                                    setSelectedProduct(product);
                                                    setCurrentStep(3);
                                                }}
                                                className={`cursor-pointer rounded-xl overflow-hidden border-3 transition-all duration-300 transform hover:scale-105 ${selectedProduct?.node.id === product.node.id
                                                    ? 'border-peach-400 shadow-lg shadow-peach-300/40 scale-105'
                                                    : 'border-gray-200 hover:border-peach-300 hover:shadow-md'
                                                    }`}
                                            >
                                                <div className="relative">
                                                    <img
                                                        src={product.node.images.edges[0]?.node.url}
                                                        alt={product.node.title}
                                                        className="w-full h-32 object-cover"
                                                    />
                                                    {selectedProduct?.node.id === product.node.id && (
                                                        <div className="absolute top-2 right-2 bg-peach-500 text-white p-1.5 rounded-full shadow-lg">
                                                            <Check className="h-4 w-4" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="p-3 bg-white">
                                                    <p className="text-xs font-semibold truncate text-gray-900">{product.node.title}</p>
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        ${parseFloat(product.node.priceRange.minVariantPrice.amount).toFixed(0)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <label className="block cursor-pointer group">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleCustomGarmentChange}
                                                className="hidden"
                                            />
                                            <div className="border-3 border-dashed border-peach-300 rounded-2xl p-12 text-center transition-all duration-300 group-hover:border-peach-400 group-hover:bg-peach-50/50 bg-white">
                                                <ImageIcon className="mx-auto h-16 w-16 text-peach-400 mb-4 group-hover:text-peach-500 transition-colors" />
                                                <p className="text-lg font-semibold text-gray-700 mb-2">Upload garment image</p>
                                                <p className="text-sm text-gray-500">PNG, JPG up to 50MB</p>
                                            </div>
                                        </label>

                                        {customGarmentPreview && (
                                            <div className="relative rounded-2xl overflow-hidden shadow-xl animate-scaleIn border-2 border-peach-200">
                                                <img
                                                    src={customGarmentPreview}
                                                    alt="Custom garment"
                                                    className="w-full h-64 object-cover"
                                                />
                                                <div className="absolute top-4 right-4 bg-gradient-to-r from-peach-400 to-peach-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg">
                                                    <Check className="h-4 w-4" />
                                                    Garment uploaded
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Step 3: Options */}
                            <div className={`bg-white/90 backdrop-blur-sm rounded-3xl p-8 border-2 transition-all duration-300 shadow-lg ${currentStep >= 3 ? 'border-peach-300 shadow-peach-200/50' : 'border-gray-200 opacity-60'}`}>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-lg">
                                        3
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">Options</h2>
                                </div>

                                <label className="flex items-center gap-4 cursor-pointer p-4 rounded-xl hover:bg-peach-50 transition-all duration-300 group">
                                    <input
                                        type="checkbox"
                                        checked={generateVideo}
                                        onChange={(e) => setGenerateVideo(e.target.checked)}
                                        className="w-6 h-6 accent-peach-500 cursor-pointer"
                                    />
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="p-2 bg-peach-100 rounded-lg group-hover:bg-peach-200 transition-colors">
                                            <Video className="h-6 w-6 text-peach-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">Generate Video</p>
                                            <p className="text-sm text-gray-600">Create a 3-5 second animated preview</p>
                                        </div>
                                    </div>
                                </label>
                            </div>

                            {/* Try On Button */}
                            <button
                                onClick={handleTryOn}
                                disabled={isProcessing}
                                className={`w-full py-6 px-8 rounded-2xl font-bold text-xl transition-all duration-300 flex items-center justify-center gap-3 ${isProcessing
                                    ? 'bg-gray-300 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-peach-400 to-peach-500 hover:from-peach-500 hover:to-peach-600 text-white shadow-xl shadow-peach-300/50 hover:shadow-2xl hover:-translate-y-1 active:translate-y-0'
                                    }`}
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="h-6 w-6 animate-spin" />
                                        Processing Magic...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-6 w-6" />
                                        Try On Now
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Right Panel - Results */}
                        <div className="lg:col-span-5 space-y-6 animate-fadeIn lg:sticky lg:top-28 lg:self-start">
                            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-5 sm:p-8 border border-peach-100 shadow-2xl shadow-peach-100/50">
                                <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-peach-500 to-peach-600 bg-clip-text text-transparent flex items-center gap-2">
                                    <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-peach-500" />
                                    Your Result
                                </h2>

                                {/* Status */}
                                <div className={`mb-6 p-5 rounded-2xl border-2 transition-all duration-300 ${statusColors[statusType]}`}>
                                    <div className="flex items-center gap-3">
                                        <StatusIcon />
                                        <p className="font-semibold flex-1">{status}</p>
                                    </div>
                                </div>

                                {/* Result Image */}
                                {resultImage && (
                                    <div className="mb-6 animate-scaleIn">
                                        <h3 className="font-bold text-lg mb-3 text-gray-900">Virtual Try-On Result</h3>
                                        <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-peach-200">
                                            <img
                                                src={resultImage}
                                                alt="Try-on result"
                                                className="w-full"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-peach-900/20 to-transparent pointer-events-none"></div>
                                        </div>
                                    </div>
                                )}

                                {/* Result Video */}
                                {resultVideo && (
                                    <div className="animate-scaleIn">
                                        <h3 className="font-bold text-lg mb-3 text-gray-900">Try-On Video</h3>
                                        <div className="rounded-2xl overflow-hidden shadow-2xl border-2 border-peach-200">
                                            <video
                                                src={resultVideo}
                                                controls
                                                className="w-full"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Placeholder */}
                                {!resultImage && !resultVideo && !isProcessing && (
                                    <div className="aspect-[3/4] bg-gradient-to-br from-peach-50 to-white rounded-2xl flex items-center justify-center border-2 border-dashed border-peach-300">
                                        <div className="text-center text-peach-400 p-8">
                                            <Sparkles className="h-20 w-20 mx-auto mb-6 opacity-50" />
                                            <p className="text-lg font-semibold mb-2 text-gray-700">Your try-on result will appear here</p>
                                            <p className="text-sm text-gray-500">Upload your photo and select a garment to get started</p>
                                        </div>
                                    </div>
                                )}

                                {/* Processing Animation */}
                                {isProcessing && !resultImage && (
                                    <div className="aspect-[3/4] bg-gradient-to-br from-peach-100 to-peach-50 rounded-2xl flex items-center justify-center animate-pulse border-2 border-peach-300">
                                        <div className="text-center">
                                            <Loader2 className="h-20 w-20 mx-auto mb-6 text-peach-500 animate-spin" />
                                            <p className="text-lg font-semibold text-peach-700 mb-2">Creating your virtual try-on...</p>
                                            <p className="text-sm text-peach-600">This may take 10-15 seconds</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default VirtualTryOn;
