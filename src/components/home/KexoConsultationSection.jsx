import React from "react";
import { MessageCircle, ArrowRight, Sparkles, Send } from "lucide-react";

export default function KexoConsultationSection({ t }) {
  return (
    <section className="py-12 sm:py-16 bg-background relative overflow-hidden border-b border-[#C5A880]/15 transition-colors duration-300">
      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 bg-[#C5A880]/10 dark:bg-[#9E2A2B]/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#C5A880]/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-white/95 to-slate-50/80 dark:from-[#0D0D11]/90 dark:to-[#16161D]/80 backdrop-blur-xl border border-[#C5A880]/30 dark:border-[#C5A880]/20 rounded-3xl p-6 sm:p-12 shadow-[0_15px_40px_rgba(197,168,128,0.06)] dark:shadow-[0_0_50px_rgba(197,168,128,0.08)] flex flex-col lg:flex-row items-center gap-8 sm:gap-12 transition-colors duration-300">

            <div className="flex-1 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C5A880]/15 dark:bg-[#9E2A2B]/10 border border-[#C5A880]/30 dark:border-[#9E2A2B]/35 text-slate-800 dark:text-[#C5A880] text-xs sm:text-sm font-bold mb-4 sm:mb-6 animate-pulse">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span>{t('kexoAiAssistantBadge')}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-800 dark:text-white mb-4 sm:mb-6 leading-tight tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C5A880] via-slate-800 dark:via-white to-[#C5A880]">
                  {t('consultWithKexoTitle')}
                </span>
                {" "}{t('consultWithKexoSub')}
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-light mb-6 sm:mb-8">
                {t('kexoDescription')}
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('openChatbot'))}
                  className="bg-gradient-to-r from-[#9E2A2B] to-[#b13536] hover:from-[#b13536] hover:to-[#9E2A2B] text-white font-bold px-8 py-6 rounded-2xl shadow-[0_0_20px_rgba(158,42,43,0.35)] hover:shadow-[0_0_30px_rgba(158,42,43,0.5)] border border-[#C5A880]/30 transition-all text-sm sm:text-base flex items-center justify-center gap-2 group"
                >
                  <MessageCircle className="w-5 h-5 text-white animate-pulse" />
                  <span>{t('startChatWithKexo')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Right column: Interactive mock chat panel */}
            <div className="w-full lg:w-96 shrink-0">
              <div className="bg-white/95 dark:bg-[#08080A]/90 border border-slate-200 dark:border-[#C5A880]/15 rounded-2xl p-4 sm:p-5 shadow-xl dark:shadow-2xl relative overflow-hidden transition-colors duration-305">
                {/* Top Chat Header */}
                <div className="flex items-center gap-3 border-b border-slate-200 dark:border-[#C5A880]/10 pb-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#16161D] border border-slate-200 dark:border-[#C5A880]/30 flex items-center justify-center">
                    <Sparkles className="w-4.5 h-4.5 text-[#C5A880]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight">Kexo</p>
                    <p className="text-[10px] text-green-500 dark:text-green-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-green-500 dark:bg-green-400 rounded-full animate-pulse"></span>
                      {t('activeNow')}
                    </p>
                  </div>
                </div>

                {/* Chat Message Stream (Mock) */}
                <div className="space-y-4 mb-4 min-h-[140px] flex flex-col justify-end">
                  <div className="flex items-start gap-2.5">
                    <div className="bg-slate-100 dark:bg-[#16161D]/80 border border-slate-200 dark:border-[#C5A880]/10 rounded-2xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 max-w-[90%]">
                      {t('kexoIntroMessage')}
                    </div>
                  </div>
                </div>

                {/* Input Box (Mock) */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={t('askMeAnything')}
                    className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-[#C5A880] transition-colors"
                    readOnly
                    onClick={() => window.dispatchEvent(new CustomEvent('openChatbot'))}
                  />
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent('openChatbot'))}
                    className="bg-[#C5A880] text-slate-950 p-3 rounded-xl hover:bg-[#C5A880]/90 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}