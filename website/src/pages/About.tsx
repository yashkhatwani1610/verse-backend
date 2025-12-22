import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Sparkles } from 'lucide-react';

const About = () => {
    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navigation />

            {/* Hero Section */}
            <section className="relative py-20 bg-gradient-to-br from-peach-50 to-white overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=2070')] bg-cover bg-center opacity-10"></div>
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-peach-600 text-sm font-medium mb-6 animate-fadeIn shadow-sm border border-peach-100">
                        <Sparkles className="h-4 w-4" />
                        Est. 1987
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 tracking-tight animate-slideInLeft">
                        Our Story
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto animate-slideInRight font-light">
                        From a vision in 1987 to a global fashion house.
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto space-y-12">

                        {/* Intro */}
                        <div className="prose prose-lg mx-auto text-gray-600">
                            <p className="text-2xl font-light leading-relaxed text-gray-800 mb-8 border-l-4 border-peach-400 pl-6">
                                It was the year 1987. India, with its rich heritage of clothing and textile, had a garment export industry which was in an imminent stage. Thus the stage was set for the entry of <span className="font-bold text-peach-600">Veenar Fashions</span>.
                            </p>
                        </div>

                        {/* History Grid */}
                        <div className="grid md:grid-cols-2 gap-8 items-center">
                            <div className="bg-peach-50 p-8 rounded-3xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-peach-200 rounded-full blur-3xl opacity-50 -mr-16 -mt-16 transition-all duration-500 group-hover:scale-150"></div>
                                <h3 className="text-2xl font-bold mb-4 text-gray-900 relative z-10">The Beginning</h3>
                                <p className="text-gray-600 relative z-10 leading-relaxed">
                                    Veenar Fashions, spearheaded by <span className="font-semibold text-gray-900">Mr. Nari Khatwani</span>, began as a small unit for garment export with a vision of never losing a buyer to unsatisfactory quality or delayed delivery. With a sampling unit, a finishing unit, and a drive to be the best, Veenar Fashions was soon a name to reckon with in the demanding markets of Europe, U.S., and Canada.
                                </p>
                            </div>
                            <div className="relative h-64 md:h-80 rounded-3xl overflow-hidden shadow-xl">
                                <img
                                    src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=2274"
                                    alt="Textile Factory"
                                    className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                                <div className="absolute bottom-6 left-6 text-white">
                                    <p className="font-bold text-lg">Global Standards</p>
                                    <p className="text-sm opacity-90">Europe • U.S. • Canada</p>
                                </div>
                            </div>
                        </div>

                        {/* Growth Section */}
                        <div className="bg-white border border-gray-100 shadow-xl rounded-3xl p-10 md:p-14 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-peach-300 via-peach-500 to-peach-300"></div>
                            <h3 className="text-3xl font-bold mb-6 text-gray-900">A Legacy of Excellence</h3>
                            <p className="text-lg text-gray-600 leading-relaxed mb-8">
                                Today, with twenty-five years of sound experience backing them, Veenar Fashions has grown to be a <span className="font-bold text-peach-600">$5 million company</span>, with one full-fledged manufacturing unit, Far East Fashion Gear. Though Veenar caters to a discerning clientele worldwide, it continues to retain all the old-world values and commitment of a family-owned concern.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <div className="text-peach-500 font-bold text-xl mb-1">25+ Years</div>
                                    <div className="text-sm text-gray-500">Experience</div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <div className="text-peach-500 font-bold text-xl mb-1">$5 Million</div>
                                    <div className="text-sm text-gray-500">Annual Turnover</div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <div className="text-peach-500 font-bold text-xl mb-1">Global</div>
                                    <div className="text-sm text-gray-500">Clientele</div>
                                </div>
                            </div>
                        </div>

                        {/* Verse Brand */}
                        <div className="text-center pt-8">
                            <Sparkles className="h-12 w-12 text-peach-400 mx-auto mb-6" />
                            <h2 className="text-4xl font-bold mb-6 text-gray-900">Verse</h2>
                            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
                                Born from this rich heritage, <span className="font-bold text-gray-900">Verse</span> is our premium menswear brand dedicated to crafting the finest shirts. We combine Veenar's manufacturing expertise with contemporary design to bring you garments that speak of quality and style.
                            </p>
                        </div>

                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default About;
