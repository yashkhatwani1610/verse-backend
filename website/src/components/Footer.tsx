import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="mt-auto bg-gray-900 text-white py-12 md:py-16">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-8 md:mb-12">
                    {/* Brand */}
                    <div>
                        <h3 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-peach-400 to-peach-600 bg-clip-text text-transparent">
                            VERSE
                        </h3>
                        <p className="text-gray-400 text-sm md:text-base mb-6 max-w-md leading-relaxed">
                            Premium quality fashion with cutting-edge virtual try-on technology. Experience the future of online shopping.
                        </p>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-bold text-base md:text-lg mb-4 text-white uppercase tracking-wide">Contact Us</h4>
                        <ul className="space-y-4 text-gray-400 text-sm md:text-base">
                            <li className="flex items-start gap-3 group">
                                <Mail className="w-5 h-5 mt-0.5 flex-shrink-0 text-peach-400 group-hover:text-peach-300 transition-colors" />
                                <a href="mailto:hello@verse.com" className="hover:text-peach-400 transition-colors break-all">
                                    hello@verse.com
                                </a>
                            </li>
                            <li className="flex items-start gap-3 group">
                                <Phone className="w-5 h-5 mt-0.5 flex-shrink-0 text-peach-400 group-hover:text-peach-300 transition-colors" />
                                <a href="tel:+15551234567" className="hover:text-peach-400 transition-colors">
                                    +1 (555) 123-4567
                                </a>
                            </li>
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0 text-peach-400" />
                                <address className="not-italic text-sm leading-relaxed">
                                    VEENAR FASHIONS<br />
                                    202/203 Adhyaru Industrial Estate<br />
                                    Lower Parel, Mumbai 400013
                                </address>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-6 md:pt-8 border-t border-gray-800">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-gray-400 text-xs md:text-sm text-center md:text-left">
                            &copy; 2024 Verse by Veenar Fashions. All rights reserved.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-xs md:text-sm text-gray-400">
                            <a href="#" className="hover:text-peach-400 transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-peach-400 transition-colors">Terms of Service</a>
                            <a href="#" className="hover:text-peach-400 transition-colors">Cookie Policy</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
