import { Link } from "react-router-dom";

export default function Home() {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-6 px-6 text-center">
            <h1 className="text-7xl font-amarna font-bold text-primary">
                D.A.S.H
            </h1>
            <h3 className="text-3xl font-indie text-secondary">
                &gt; Document And Social Hub
            </h3>
            <p className="max-w-3xl text-lg text-muted-foreground leading-relaxed font-mono">
                D.A.S.H is an open-source, self-hosted documentation web app for generating
                meeting minutes, captions, and letters from audio or video. Privacy-first
                design with temporary processing, template-driven outputs, and no permanent
                data storage. Built for local control and student-friendly use.
            </p>

            <Link
                to="/captions"
                className="mt-6 px-6 py-3 bg-primary text-white rounded-lg font-mono hover:opacity-90 transition"
            >
                Try Caption Generator →
            </Link>
            <Link
                to="/templates"
                className="mt-6 px-6 py-3 bg-primary text-white rounded-lg font-mono hover:opacity-90 transition"
            >
                Templates →
            </Link>
        </div>
    );
}
