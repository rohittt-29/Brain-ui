import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain,
  Search,
  Bot,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Zap,
  Database,
  MessageSquare,
  BookOpen,
  Link2,
  Lightbulb,
} from 'lucide-react';
import iconImg from '@/assets/Icon.png';

/* ─────────────────────────────────────────────────────────────
   Tiny animated counter (for the stat numbers in hero)
──────────────────────────────────────────────────────────────── */
const Counter = ({ to, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let start = 0;
          const step = Math.ceil(to / 60);
          const timer = setInterval(() => {
            start += step;
            if (start >= to) { setCount(to); clearInterval(timer); }
            else setCount(start);
          }, 16);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [to]);

  return <span ref={ref}>{count}{suffix}</span>;
};

/* ─────────────────────────────────────────────────────────────
   Main Landing Component
──────────────────────────────────────────────────────────────── */
const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-x-hidden">

      {/* ── Ambient background glows ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-green-500/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-emerald-600/6 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-green-900/10 rounded-full blur-[140px]" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* ════════════════════════════════════════════
          NAVBAR
      ════════════════════════════════════════════ */}
      <nav className="relative z-50 flex items-center justify-between px-6 md:px-16 py-5 border-b border-slate-800/60 backdrop-blur-sm">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center justify-center">
            <img src={iconImg} alt="InsightBox" className="w-5 h-5 object-contain" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">InsightBox</span>
        </div>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
        </div>

        {/* CTA buttons */}
        <div className="flex items-center gap-3">
          <button
            id="nav-login-btn"
            onClick={() => navigate('/login')}
            className="text-sm text-slate-300 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-slate-800/60"
          >
            Login
          </button>
          <button
            id="nav-signup-btn"
            onClick={() => navigate('/signup')}
            className="text-sm font-semibold bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-lg shadow-green-900/30"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* ════════════════════════════════════════════
          HERO SECTION
      ════════════════════════════════════════════ */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-24 pb-20 md:pt-32 md:pb-28">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-8 tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          AI-Powered Second Brain
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight max-w-4xl">
          <span className="text-white">InsightBox —</span>
          <br />
          <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
            Your AI Second Brain
          </span>
        </h1>

        {/* Subheading */}
        <p className="mt-6 text-lg md:text-xl text-slate-400 max-w-xl leading-relaxed">
          Save anything. Ask anything. Get answers from your own knowledge.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <button
            id="hero-get-started-btn"
            onClick={() => navigate('/signup')}
            className="group flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold px-7 py-3.5 rounded-xl shadow-xl shadow-green-900/40 transition-all duration-300 text-base"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
          <button
            id="hero-login-btn"
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 px-7 py-3.5 rounded-xl transition-all duration-200 text-base font-medium bg-slate-900/40 backdrop-blur-sm"
          >
            Login
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Social proof stats */}
        <div className="mt-16 flex flex-wrap justify-center gap-10 md:gap-16 text-center">
          {[
            { value: 10, suffix: 'K+', label: 'Notes Saved' },
            { value: 50, suffix: '+', label: 'Happy Users' },
            { value: 99, suffix: '%', label: 'Uptime' },
          ].map(({ value, suffix, label }) => (
            <div key={label} className="flex flex-col">
              <span className="text-3xl font-extrabold text-white tabular-nums">
                <Counter to={value} suffix={suffix} />
              </span>
              <span className="text-slate-500 text-sm mt-1">{label}</span>
            </div>
          ))}
        </div>

        {/* Hero visual — mock UI card */}
        <div className="relative mt-20 w-full max-w-3xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 rounded-2xl pointer-events-none" />
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-2xl shadow-black/50 text-left">
            {/* Fake toolbar */}
            <div className="flex items-center gap-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
              <div className="ml-4 flex-1 bg-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-500 flex items-center gap-2">
                <Search className="w-3.5 h-3.5" />
                Ask anything about your notes…
              </div>
            </div>
            {/* Fake note cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: <BookOpen className="w-4 h-4 text-green-400" />, title: 'Meeting Notes', preview: 'Discussed Q3 roadmap and...' },
                { icon: <Link2 className="w-4 h-4 text-emerald-400" />, title: 'Saved Link', preview: 'github.com/awesome-project' },
                { icon: <Lightbulb className="w-4 h-4 text-green-300" />, title: 'Idea', preview: 'Build a habit tracker that...' },
              ].map(({ icon, title, preview }) => (
                <div key={title} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 hover:border-green-500/30 transition-colors">
                  <div className="flex items-center gap-2 mb-2">{icon}<span className="text-sm font-semibold text-slate-200">{title}</span></div>
                  <p className="text-xs text-slate-500 leading-relaxed">{preview}</p>
                </div>
              ))}
            </div>
            {/* Fake AI answer */}
            <div className="mt-4 bg-green-500/5 border border-green-500/20 rounded-xl p-4 flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5 text-green-400" />
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Based on your saved notes, the Q3 roadmap focuses on <span className="text-green-400 font-medium">performance improvements</span> and <span className="text-green-400 font-medium">habit tracking</span> features…
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          FEATURES SECTION
      ════════════════════════════════════════════ */}
      <section id="features" className="relative z-10 px-6 md:px-16 py-24">
        <div className="max-w-5xl mx-auto">
          {/* Section label */}
          <p className="text-center text-green-400 text-xs font-bold uppercase tracking-widest mb-3">Features</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white text-center mb-4">
            Everything you need. Nothing you don't.
          </h2>
          <p className="text-center text-slate-400 text-base max-w-xl mx-auto mb-14">
            InsightBox keeps it simple — save your knowledge, search it meaningfully, and let AI do the heavy lifting.
          </p>

          {/* Feature cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                id: 'feature-save',
                icon: <Brain className="w-7 h-7 text-green-400" />,
                bg: 'bg-green-500/10',
                border: 'border-green-500/20',
                iconBg: 'bg-green-500/15',
                title: 'Save Anything',
                desc: 'Store notes, links, and ideas in one organized place. No more scattered thoughts across a dozen apps.',
                bullets: ['Notes & text', 'URLs & links', 'Quick ideas'],
              },
              {
                id: 'feature-search',
                icon: <Search className="w-7 h-7 text-emerald-400" />,
                bg: 'bg-emerald-500/10',
                border: 'border-emerald-500/20',
                iconBg: 'bg-emerald-500/15',
                title: 'Smart Search',
                desc: 'Find information using meaning and context, not just exact keywords. Semantic search understands you.',
                bullets: ['Semantic understanding', 'Context-aware results', 'Instant results'],
              },
              {
                id: 'feature-ai',
                icon: <Bot className="w-7 h-7 text-green-300" />,
                bg: 'bg-green-400/8',
                border: 'border-green-400/15',
                iconBg: 'bg-green-400/15',
                title: 'Ask AI',
                desc: 'Chat with an AI that knows your data. Ask complex questions and get answers grounded in your own notes.',
                bullets: ['RAG-powered answers', 'Your data, your context', 'Natural conversation'],
              },
            ].map(({ id, icon, bg, border, iconBg, title, desc, bullets }) => (
              <div
                key={id}
                id={id}
                className={`group relative ${bg} border ${border} rounded-2xl p-7 hover:scale-[1.02] transition-all duration-300 hover:shadow-lg hover:shadow-green-900/20 cursor-default`}
              >
                <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center mb-5`}>
                  {icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-5">{desc}</p>
                <ul className="space-y-2">
                  {bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-slate-400 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          HOW IT WORKS SECTION
      ════════════════════════════════════════════ */}
      <section id="how-it-works" className="relative z-10 px-6 md:px-16 py-24 border-t border-slate-800/60">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-green-400 text-xs font-bold uppercase tracking-widest mb-3">How It Works</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white text-center mb-4">
            Three steps to a smarter brain
          </h2>
          <p className="text-center text-slate-400 text-base max-w-lg mx-auto mb-16">
            Get set up in minutes. No complex configuration, no learning curve.
          </p>

          {/* Steps */}
          <div className="relative">
            {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-10 left-[16.6%] right-[16.6%] h-px bg-gradient-to-r from-transparent via-green-500/30 to-transparent" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
              {[
                {
                  id: 'step-1',
                  step: '01',
                  icon: <Database className="w-6 h-6 text-green-400" />,
                  title: 'Save your notes or links',
                  desc: 'Paste a URL, jot down an idea, or write a note. InsightBox stores it all and indexes it automatically.',
                },
                {
                  id: 'step-2',
                  step: '02',
                  icon: <MessageSquare className="w-6 h-6 text-emerald-400" />,
                  title: 'Ask a question',
                  desc: 'Type any question in plain English — like you\'re chatting with a knowledgeable friend.',
                },
                {
                  id: 'step-3',
                  step: '03',
                  icon: <Zap className="w-6 h-6 text-green-300" />,
                  title: 'AI finds and answers',
                  desc: 'The AI searches your data semantically and returns precise, cited answers from your own knowledge base.',
                },
              ].map(({ id, step, icon, title, desc }) => (
                <div key={id} id={id} className="flex flex-col items-center text-center group">
                  {/* Step circle */}
                  <div className="relative mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-slate-700 group-hover:border-green-500/40 flex items-center justify-center transition-colors duration-300 shadow-lg">
                      {icon}
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-950 border border-slate-700 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-green-400">{step}</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          CTA SECTION
      ════════════════════════════════════════════ */}
      <section id="cta" className="relative z-10 px-6 md:px-16 py-24 border-t border-slate-800/60">
        <div className="max-w-3xl mx-auto text-center">
          {/* Glow */}
          <div className="absolute left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-green-500/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-800 rounded-3xl px-8 py-14 md:px-16 shadow-2xl shadow-black/50 backdrop-blur-sm">
            {/* Top badge */}
            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold px-3 py-1 rounded-full mb-6">
              <Sparkles className="w-3 h-3" />
              Free to start
            </div>

            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">
              Start building your
              <br />
              <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                second brain today
              </span>
            </h2>
            <p className="text-slate-400 text-base mb-10 max-w-md mx-auto">
              Join users who've already levelled up their productivity with AI-powered knowledge management.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                id="cta-get-started-btn"
                onClick={() => navigate('/signup')}
                className="group flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold px-8 py-4 rounded-xl shadow-xl shadow-green-900/40 transition-all duration-300 text-base w-full sm:w-auto justify-center"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </button>
              <button
                id="cta-login-btn"
                onClick={() => navigate('/login')}
                className="text-slate-400 hover:text-white text-sm font-medium transition-colors underline underline-offset-4"
              >
                Already have an account? Login
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════ */}
      <footer className="relative z-10 border-t border-slate-800/60 px-6 md:px-16 py-10">
        <div className="max-w-5xl mx-auto">
          {/* Main footer row */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            {/* Brand */}
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center justify-center">
                <img src={iconImg} alt="InsightBox" className="w-4 h-4 object-contain" />
              </div>
              <div>
                <span className="text-white font-bold text-sm">InsightBox</span>
                <p className="text-slate-600 text-xs">Built for productivity</p>
              </div>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <button
                id="footer-login-link"
                onClick={() => navigate('/login')}
                className="hover:text-slate-300 transition-colors"
              >
                Login
              </button>
              <button
                id="footer-signup-link"
                onClick={() => navigate('/signup')}
                className="hover:text-slate-300 transition-colors"
              >
                Sign Up
              </button>
            </div>

            {/* Copyright */}
            <p className="text-slate-600 text-xs">© {new Date().getFullYear()} InsightBox. All rights reserved.</p>
          </div>

          {/* Bottom credit row */}
          <div className="border-t border-slate-800/40 pt-6 flex justify-center">
            <p className="text-slate-600 text-xs">
              Created with{' '}
              <span className="text-red-400/80">🤍</span>
              {' '}by{' '}
              <a
                href="https://linkedin.com/in/rohit-mali-163267257"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400/80 hover:text-green-300 underline underline-offset-2 transition-colors font-medium"
              >
                this guy
              </a>
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
