import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const FeatureCards = () => {
    return (
        <section className="w-full py-32 px-4 flex flex-col items-center justify-center bg-background relative z-20 min-h-screen">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="mb-16 text-center"
            >
                <h2 className="text-4xl md:text-6xl font-zilla font-bold text-foreground mb-6">
                    Creation Station
                </h2>
                <p className="text-retro-cyan font-mono text-sm tracking-[0.2em] uppercase font-bold">
                    Select a tool to begin
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-7xl w-full">
                <Card
                    title="Captions"
                    description="Craft engaging social media captions with AI assistance."
                    to="/captions"
                    windowColor="bg-retro-red" // Retro Coral/Red
                    fadedColor="bg-retro-red"
                    delay={0.1}
                />
                <Card
                    title="Letters"
                    description="Generate professional letters for any occasion instantly."
                    to="/letters"
                    windowColor="bg-retro-green" // Retro Green
                    fadedColor="bg-retro-green"
                    delay={0.2}
                />
                <Card
                    title="MoM"
                    description="Record and summarize minutes of meetings automatically."
                    to="/mom"
                    windowColor="bg-retro-blue" // Retro Blue
                    fadedColor="bg-retro-blue"
                    delay={0.3}
                />
            </div>
        </section>
    );
};

interface CardProps {
    title: string;
    description: string;
    to: string;
    windowColor: string;
    fadedColor: string;
    delay: number;
    disabled?: boolean;
}

const Card = ({ title, description, to, windowColor, fadedColor, delay, disabled }: CardProps) => {

    const handleClick = () => {
        if (!disabled) {
            window.scrollTo(0, 0);
        }
    };

    const Content = (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.4 }}
            className={`relative h-[400px] w-full bg-white border-2 border-retro-cyan rounded-xl overflow-hidden flex flex-col group transition-all duration-300 shadow-[4px_4px_0px_0px_var(--color-retro-cyan)] hover:shadow-[8px_8px_0px_0px_var(--color-retro-cyan)] ${disabled ? "opacity-50 grayscale cursor-not-allowed" : "cursor-pointer"}`}
        >
            {/* Window Header */}
            <div className={`h-12 w-full border-b-2 border-retro-cyan flex items-center px-4 justify-between bg-white`}>
                <span className="font-mono text-sm font-bold text-retro-cyan truncate max-w-[150px]">{title}.exe</span>
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full border border-retro-cyan bg-retro-red"></div>
                    <div className="w-3 h-3 rounded-full border border-retro-cyan bg-retro-yellow"></div>
                    <div className="w-3 h-3 rounded-full border border-retro-cyan bg-retro-green"></div>
                </div>
            </div>

            {/* Window Content */}
            <div className="flex-1 p-8 flex flex-col justify-center items-center bg-retro-cream">
                {/* Retro Icon Placeholder */}
                <div className={`w-20 h-20 rounded-full border-2 border-retro-cyan mb-6 flex items-center justify-center ${fadedColor}`}>
                    <div className={`w-12 h-12 rounded-full ${windowColor} border border-retro-cyan`} />
                </div>

                <h3 className="text-3xl font-zilla font-bold text-gray-800 mb-4 text-center">
                    {title}
                </h3>
                <p className="text-gray-600 font-zilla text-lg leading-relaxed text-center px-4">
                    {description}
                </p>

                {/* Button-like visual at bottom */}
                <div className="mt-8 px-6 py-2 bg-retro-beige text-slate-800 font-mono text-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-retro-cyan font-bold">
                    OPEN PROGRAM
                </div>
            </div>
        </motion.div>
    );

    if (disabled) {
        return (
            <div className="w-full">
                {Content}
            </div>
        );
    }

    return (
        <Link to={to} onClick={handleClick} className="w-full block no-underline focus:outline-none">
            {Content}
        </Link>
    );
};

export default FeatureCards;
