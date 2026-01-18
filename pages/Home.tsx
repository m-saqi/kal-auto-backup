import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, Zap, Download, 
  ChevronDown, ArrowRight, TrendingUp, Award, BarChart3, Fingerprint, 
  BookOpen
} from 'lucide-react';

export const Home = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const navigate = useNavigate();

  const faqs = [
    { q: "What is the UAF Linear Grading System?", a: "UAF uses a linear formula between 40% and 80%. Every percentage point matters. For example, in the 65-80% bracket, your GP = 3.0 + ((Marks% - 65) / 15)." },
    { q: "Is my academic data stored on your servers?", a: "No. Privacy is our priority. Your results are fetched directly from the LMS and stored only in your browser's local storage. We do not have access to your grades." },
    { q: "How accurate is the calculation?", a: "The calculator uses official UAF mathematical models, including proper handling of repeated courses and credit hour weighting for accurate CGPA reporting." },
    { q: "Can I use this for all UAF programs?", a: "Yes. The tool is designed for the standard undergraduate and postgraduate grading schemes used across most UAF faculties." }
  ];

  return (
    <div className="flex flex-col w-full overflow-hidden bg-white dark:bg-slate-950">
      {/* HERO SECTION */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center px-6 pt-24 pb-12 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-brand-500/20 blur-[80px] rounded-full"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-indigo-500/20 blur-[80px] rounded-full"></div>
        </div>

        <div className="relative z-10 max-w-4xl w-full text-center space-y-5 md:space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-900/30 text-brand-700 dark:text-brand-300 font-bold text-[9px] md:text-xs uppercase tracking-[0.2em] animate-in fade-in duration-700">
            <Award className="w-3.5 h-3.5" />
            Verified UAF Grading Utility
          </div>
          
          <h1 className="text-3xl md:text-5xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-tight md:leading-[1.1] animate-in fade-in slide-in-from-bottom-3 duration-700 delay-100">
            Academic Tracking <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">Reimagined for UAF.</span>
          </h1>
          
          <p className="text-xs md:text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-3 duration-700 delay-200">
            The professional suite for University of Agriculture students. Precision calculations, goal forecasting, and automated transcript generation.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 pt-6 animate-in fade-in slide-in-from-bottom-3 duration-700 delay-300">
            <Button 
              size="lg" 
              onClick={() => navigate('/calculator')}
              className="w-full sm:w-auto px-10 py-4 rounded-2xl text-sm md:text-base font-bold shadow-xl shadow-brand-500/20"
            >
              Start Calculating <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
            </Button>
            <Link to="/profiles" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto px-8 py-4 rounded-2xl text-sm md:text-base font-bold">
                Saved Profiles
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12 pt-12 text-slate-400 font-bold text-[9px] md:text-[10px] uppercase tracking-[0.2em] animate-in fade-in duration-1000 delay-500">
            <div className="flex items-center gap-2"><Fingerprint className="w-4 h-4 text-brand-500" /> Privacy First</div>
            <div className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-brand-500" /> Linear Math</div>
            <div className="flex items-center gap-2"><Download className="w-4 h-4 text-brand-500" /> PDF Export</div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-20 md:py-32 bg-slate-50 dark:bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-2">
            <h2 className="text-xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Core Capabilities.</h2>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] md:text-base font-medium">Engineered for precision and student performance.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <FeatureCard 
              icon={<Zap className="text-amber-500" />}
              title="Verified Retrieval"
              desc="Seamlessly connect to UAF LMS to pull your official results for instant analysis."
            />
            <FeatureCard 
              icon={<BarChart3 className="text-emerald-500" />}
              title="Predictive Engine"
              desc="Model future outcomes by simulating marks for upcoming semesters with linear logic."
            />
            <FeatureCard 
              icon={<ShieldCheck className="text-brand-500" />}
              title="Secure Storage"
              desc="Your academic data stays local. We prioritize your privacy with zero server-side storage."
            />
          </div>
        </div>
      </section>

      {/* GRADING ENGINE SECTION */}
      <section className="py-20 md:py-32 bg-white dark:bg-slate-950">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12 space-y-3">
            <h2 className="text-xl md:text-4xl font-black text-slate-900 dark:text-white">Grading Intelligence.</h2>
            <p className="text-slate-500 text-xs md:text-sm font-medium leading-relaxed">Official UAF Linear Quality Point Distribution logic built-in.</p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
            <table className="w-full text-left text-[11px] md:text-sm">
              <thead className="bg-slate-900 dark:bg-black text-white uppercase text-[8px] md:text-[10px] tracking-widest font-black">
                <tr>
                  <th className="px-5 py-4 md:px-8 md:py-6">Bracket</th>
                  <th className="px-5 py-4 md:px-8 md:py-6 text-right">Calculation Logic</th>
                  <th className="px-5 py-4 md:px-8 md:py-6 text-right">Max GP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold text-slate-700 dark:text-slate-300">
                <tr className="hover:bg-brand-50/20 transition-colors">
                  <td className="px-5 py-4 md:px-8 md:py-6">80% — 100%</td>
                  <td className="px-5 py-4 md:px-8 md:py-6 text-right text-slate-400 italic font-medium">Static Maximum</td>
                  <td className="px-5 py-4 md:px-8 md:py-6 text-right text-brand-600 font-black">4.00</td>
                </tr>
                <tr className="hover:bg-brand-50/20 transition-colors">
                  <td className="px-5 py-4 md:px-8 md:py-6">65% — 79%</td>
                  <td className="px-5 py-4 md:px-8 md:py-6 text-right text-slate-400 font-mono text-[9px] md:text-[11px]">3.0 + ((%-65)/15)</td>
                  <td className="px-5 py-4 md:px-8 md:py-6 text-right text-brand-600 font-black">3.99</td>
                </tr>
                <tr className="hover:bg-brand-50/20 transition-colors">
                  <td className="px-5 py-4 md:px-8 md:py-6">50% — 64%</td>
                  <td className="px-5 py-4 md:px-8 md:py-6 text-right text-slate-400 font-mono text-[9px] md:text-[11px]">2.0 + ((%-50)/15)</td>
                  <td className="px-5 py-4 md:px-8 md:py-6 text-right text-brand-600 font-black">2.99</td>
                </tr>
                <tr className="hover:bg-brand-50/20 transition-colors">
                  <td className="px-5 py-4 md:px-8 md:py-6">40% — 49%</td>
                  <td className="px-5 py-4 md:px-8 md:py-6 text-right text-slate-400 font-mono text-[9px] md:text-[11px]">1.0 + ((%-40)/10)</td>
                  <td className="px-5 py-4 md:px-8 md:py-6 text-right text-brand-600 font-black">1.99</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 md:py-32 bg-slate-50 dark:bg-slate-900/40">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white text-center mb-10">Common Questions.</h2>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shadow-sm transition-all hover:border-brand-300">
                <button 
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-bold text-xs md:text-sm text-slate-800 dark:text-slate-100">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${activeFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${activeFaq === idx ? 'max-h-40 border-t border-slate-100 dark:border-slate-800' : 'max-h-0'}`}>
                  <div className="p-5 text-slate-500 dark:text-slate-400 text-xs md:text-[13px] leading-relaxed font-medium">
                    {faq.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-24 bg-slate-900 text-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-brand-600/10 blur-[150px] pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl mx-auto space-y-8">
          <h2 className="text-2xl md:text-5xl font-black text-white leading-tight">Focus on excellence. <br /> Leave the grades to us.</h2>
          <Button 
            size="lg" 
            onClick={() => navigate('/calculator')}
            className="px-12 py-5 rounded-[2rem] text-base md:text-lg font-black shadow-2xl shadow-brand-500/20"
          >
            Launch Academic Suite
          </Button>
          <div className="pt-8 flex flex-col items-center gap-4">
            <p className="text-slate-500 text-[9px] md:text-[10px] uppercase tracking-[0.4em] font-black">Independent Academic Utility V2.1</p>
            <p className="text-slate-600 text-[10px] font-bold">Built for the UAF Community</p>
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 group">
    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-50 transition-all">
      {React.cloneElement(icon as React.ReactElement, { size: 24 })}
    </div>
    <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white mb-3 tracking-tight">{title}</h3>
    <p className="text-slate-500 dark:text-slate-400 text-[11px] md:text-sm leading-relaxed font-medium">{desc}</p>
  </div>
);
