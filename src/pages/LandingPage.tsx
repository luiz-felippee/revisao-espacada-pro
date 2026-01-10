
import { motion, useScroll, useTransform } from 'framer-motion';
// Note: App.tsx uses simple state 'activeTab' inside AppContent, but top level Auth render is binary (Login or App).
// We will need to adjust App.tsx to support Landing -> Login routing. For now, let's build the component.

// Icons
import {
    Zap, Brain, Shield, Rocket, Check, ChevronRight,
    Layout, Calendar, Target, Github, Instagram, Twitter
} from 'lucide-react';

export const LandingPage = ({ onGetStarted }: { onGetStarted: () => void }) => {

    // Scroll Parallax
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const y2 = useTransform(scrollY, [0, 500], [0, -150]);

    return (
        <div className="min-h-screen bg-slate-950 font-sans text-slate-100 overflow-x-hidden selection:bg-blue-500/30">

            {/* --- Navbar --- */}
            <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <span className="text-xl">⚡</span>
                        </div>
                        <span className="font-bold text-xl tracking-tight">Revisão <span className="text-blue-400">PRO</span></span>
                    </div>
                    <div className="flex items-center gap-6">
                        <button onClick={onGetStarted} className="hidden md:block text-slate-300 hover:text-white font-medium transition-colors">Entrar</button>
                        <button
                            onClick={onGetStarted}
                            className="bg-white text-slate-950 px-6 py-2.5 rounded-full font-bold hover:bg-blue-50 transition-all shadow-lg hover:shadow-blue-500/20"
                        >
                            Começar Grátis
                        </button>
                    </div>
                </div>
            </nav>

            {/* --- Hero Section --- */}
            <section className="relative pt-32 pb-32 md:pt-48 md:pb-48 overflow-hidden">
                {/* Background FX */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full mix-blend-screen animate-pulse" />
                    <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full mix-blend-screen" />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-sm mb-6 tracking-wide">
                            🚀 V 1.0 DISPONÍVEL AGORA
                        </span>
                        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-8 leading-[1.1]">
                            Estude Menos. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                                Aprenda 10x Mais.
                            </span>
                        </h1>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                            A única plataforma que une <strong>Repetição Espaçada (SRS)</strong>, Gamificação Avançada e Organização em uma interface premiada.
                        </p>

                        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                            <button
                                onClick={onGetStarted}
                                className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/25 transition-all hover:scale-105 flex items-center justify-center gap-2"
                            >
                                <Rocket className="w-5 h-5" />
                                Criar Conta Gratuita
                            </button>
                            <a href="#features" className="w-full md:w-auto px-8 py-4 bg-slate-800/50 hover:bg-slate-800 text-white rounded-2xl font-bold text-lg border border-slate-800/50 transition-all flex items-center justify-center gap-2">
                                Saber Mais
                            </a>
                        </div>
                    </motion.div>
                </div>

                {/* Hero UI Mockup */}
                <motion.div
                    style={{ y: y1 }}
                    className="mt-20 max-w-6xl mx-auto px-6"
                >
                    <div className="relative rounded-3xl border border-slate-800/50 bg-slate-900/50 backdrop-blur-xl shadow-2xl overflow-hidden aspect-video group">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5" />
                        {/* Placeholder for App Screenshot */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <span className="text-6xl mb-4 block">⚡</span>
                                <p className="text-slate-500 font-mono text-sm">Interface do Painel Principal</p>
                            </div>
                        </div>

                        {/* Fake UI Elements for "feeling" */}
                        <div className="absolute top-8 left-8 right-8 bottom-8 border border-slate-800/50 rounded-2xl p-6 grid grid-cols-12 gap-6 opacity-50">
                            <div className="col-span-3 bg-slate-900/40 rounded-xl h-full" />
                            <div className="col-span-9 space-y-6">
                                <div className="h-32 bg-gradient-to-r from-blue-900/20 to-indigo-900/20 rounded-xl" />
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="h-40 bg-slate-900/40 rounded-xl" />
                                    <div className="h-40 bg-slate-900/40 rounded-xl" />
                                    <div className="h-40 bg-slate-900/40 rounded-xl" />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* --- Features Grid --- */}
            <section id="features" className="py-32 bg-slate-950 relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-24">
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Tudo que você precisa.</h2>
                        <p className="text-slate-400 text-lg">Esqueça planilhas e apps complicados.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Brain className="w-8 h-8 text-pink-400" />}
                            title="SRS Inteligente"
                            desc="O algoritmo agenda suas revisões automaticamente (1, 7, 15, 30 dias). Nunca mais esqueça o que estudou."
                        />
                        <FeatureCard
                            icon={<Zap className="w-8 h-8 text-amber-400" />}
                            title="Gamificação Real"
                            desc="Ganhe XP, suba de nível e desbloqueie conquistas. Estudar vira um jogo viciante."
                        />
                        <FeatureCard
                            icon={<Layout className="w-8 h-8 text-emerald-400" />}
                            title="Organização Visual"
                            desc="Temas, subtemas e matérias organizados em um painel lindo e intuitivo."
                        />
                        <FeatureCard
                            icon={<Target className="w-8 h-8 text-blue-400" />}
                            title="Metas & Hábitos"
                            desc="Defina objetivos claros e acompanhe seu progresso diário com gráficos detalhados."
                        />
                        <FeatureCard
                            icon={<Calendar className="w-8 h-8 text-purple-400" />}
                            title="Agenda Automática"
                            desc="Saiba exatamente o que revisar hoje. O sistema monta seu cronograma sozinho."
                        />
                        <FeatureCard
                            icon={<Shield className="w-8 h-8 text-red-400" />}
                            title="Modo Zen"
                            desc="Bloqueie distrações e foque no conteúdo com nosso timer Pomodoro integrado."
                        />
                    </div>
                </div>
            </section>

            {/* --- CTA Section --- */}
            <section className="py-32 relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-900/20" />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-transparent to-slate-950" />

                <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-8">
                        Pronto para evoluir?
                    </h2>
                    <p className="text-xl text-slate-300 mb-12">
                        Junte-se a usuários que já transformaram sua rotina de estudos.
                        Acesso completo e gratuito.
                    </p>
                    <button
                        onClick={onGetStarted}
                        className="px-10 py-5 bg-white text-slate-950 rounded-2xl font-black text-xl hover:scale-105 transition-transform shadow-2xl shadow-white/20"
                    >
                        Começar Agora
                    </button>
                    <p className="mt-6 text-slate-500 text-sm">Não requer cartão de crédito • 100% Gratuito</p>
                </div>
            </section>

            {/* --- Footer --- */}
            <footer className="py-12 border-t border-slate-800/50 bg-slate-950">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2 opacity-50">
                        <span className="text-lg">⚡</span>
                        <span className="font-bold">Revisão PRO</span>
                    </div>
                    <div className="text-slate-500 text-sm">
                        © 2024 Study Panel. Construído com ❤️ para estudantes.
                    </div>
                    <div className="flex gap-6">
                        <SocialIcon icon={<Twitter className="w-5 h-5" />} />
                        <SocialIcon icon={<Instagram className="w-5 h-5" />} />
                        <SocialIcon icon={<Github className="w-5 h-5" />} />
                    </div>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }: { icon: any, title: string, desc: string }) => (
    <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800/50 hover:border-slate-800/50 hover:bg-white/10 transition-all group">
        <div className="mb-6 p-4 rounded-2xl bg-slate-950 w-fit group-hover:scale-110 transition-transform">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-slate-400 leading-relaxed">{desc}</p>
    </div>
);

const SocialIcon = ({ icon }: { icon: any }) => (
    <a href="#" className="text-slate-500 hover:text-white transition-colors">
        {icon}
    </a>
)
