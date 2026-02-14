import { Link } from "react-router-dom";

const Footer = () => {
    return (
        <footer className="w-full bg-[#7EACB5] border-t-4 border-[#EDDCC6] pt-16 pb-8 px-8 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-10 w-px h-full bg-[#EDDCC6] opacity-30"></div>
            <div className="absolute top-0 right-10 w-px h-full bg-[#EDDCC6] opacity-30"></div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
                {/* Brand Section */}
                <div className="md:col-span-2 space-y-6">
                    <div className="inline-block relative">
                        <h2 className="text-6xl font-zilla font-bold text-[#FFF4EA] relative z-10">
                            papertrail.
                        </h2>
                        {/* Decorative Underline/Shadow */}
                        <div className="absolute -bottom-2 left-0 w-full h-4 bg-[#EDDCC6] -z-0 transform -rotate-1 opacity-50"></div>
                    </div>

                    <p className="text-[#FFF4EA] font-mono text-sm max-w-md leading-relaxed border-l-2 border-[#EDDCC6] pl-4">
                        // OPEN SOURCE . SELF HOSTED<br />
                        Turn audio or video into clear written documents.
                        No accounts. No permanent storage. No vendor lock-in.
                    </p>
                </div>

                {/* Quick Links */}
                <div className="space-y-6">
                    <h3 className="font-mono font-bold text-[#EDDCC6] text-lg uppercase tracking-wider border-b-2 border-dashed border-[#EDDCC6] pb-2 inline-block">
                        Index
                    </h3>
                    <ul className="space-y-3 font-zilla text-lg text-white/90">
                        <li>
                            <Link to="/captions" className="hover:text-[#EDDCC6] hover:pl-2 transition-all duration-300 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#EDDCC6]"></span> Captions
                            </Link>
                        </li>
                        <li>
                            <Link to="/letters" className="hover:text-[#EDDCC6] hover:pl-2 transition-all duration-300 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#EDDCC6]"></span> Letters
                            </Link>
                        </li>
                        <li>
                            <Link to="/mom" className="hover:text-[#EDDCC6] hover:pl-2 transition-all duration-300 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#EDDCC6]"></span> MoM Generator
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* System / Contact */}
                <div className="space-y-6">
                    <h3 className="font-mono font-bold text-[#EDDCC6] text-lg uppercase tracking-wider border-b-2 border-dashed border-[#EDDCC6] pb-2 inline-block">
                        System
                    </h3>
                    <div className="font-mono text-sm text-white/80 space-y-2">
                        <p>Status: <span className="text-[#EDDCC6] font-bold">● Online</span></p>
                        <p>Region: Github_Papertrail</p>
                    </div>

                    <div className="pt-4">
                        <p className="text-xs text-[#EDDCC6] font-bold">
                            © 2026. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom Bar decoration */}
            <div className="w-full flex justify-between items-end mt-16 border-t border-[#EDDCC6]/50 pt-2 font-mono text-[10px] text-[#EDDCC6] uppercase tracking-[0.2em] opacity-80">
                <span>Ref: PT-2024-X</span>
                <span>Page 1 of 1</span>
            </div>
        </footer>
    );
};

export default Footer;
