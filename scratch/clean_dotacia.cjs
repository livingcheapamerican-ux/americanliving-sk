const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/pages/DotaciaAmericana.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replacements helper function
function replaceContent(from, to) {
  if (!content.includes(from)) {
    console.error(`ERROR: Target string not found:\n${from.substring(0, 100)}...`);
    process.exit(1);
  }
  content = content.replace(from, to);
}

function replaceAllContent(from, to) {
  if (!content.includes(from)) {
    console.error(`ERROR: Target string not found for replaceAll:\n${from.substring(0, 100)}...`);
    process.exit(1);
  }
  content = content.replaceAll(from, to);
}

// 1. Process section background
replaceContent(
  `      {/* SEKCIA: PROCES ČERPANIA DOTÁCIE */}
      <section id="proces-section" className="py-10 sm:py-16 md:py-20 bg-slate-950 border-t border-white/10">`,
  `      {/* SEKCIA: PROCES ČERPANIA DOTÁCIE */}
      <section id="proces-section" className="py-10 sm:py-16 md:py-20 bg-muted/30 border-t border-border">`
);

// 2. Step cards background and border
replaceContent(
  `<Card className="p-8 bg-slate-900 border-2 border-emerald-300/50 hover:shadow-2xl transition-all">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-6">
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                </div>
                <div className="mb-4 inline-block bg-primary text-white px-3 py-1 rounded text-xs font-sans font-bold">
                  {t('dotaciaProcessStep1')}
                </div>
                <h3 className="text-xl font-serif font-bold text-white mb-4">`,
  `<Card className="p-8 bg-card border-2 border-emerald-300/50 dark:border-emerald-500/30 hover:shadow-2xl transition-all text-foreground">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-6">
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                </div>
                <div className="mb-4 inline-block bg-primary text-white px-3 py-1 rounded text-xs font-sans font-bold">
                  {t('dotaciaProcessStep1')}
                </div>
                <h3 className="text-xl font-serif font-bold text-foreground mb-4">`
);

replaceContent(
  `<Card className="p-8 bg-slate-900 border-2 border-emerald-300/50 hover:shadow-2xl transition-all">
                <div className="w-16 h-16 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-6">
                  <FileText className="w-8 h-8 text-yellow-500" />
                </div>
                <div className="mb-4 inline-block bg-primary text-white px-3 py-1 rounded text-xs font-sans font-bold">
                  {t('dotaciaProcessStep2')}
                </div>
                <h3 className="text-xl font-serif font-bold text-white mb-4">`,
  `<Card className="p-8 bg-card border-2 border-emerald-300/50 dark:border-emerald-500/30 hover:shadow-2xl transition-all text-foreground">
                <div className="w-16 h-16 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-6">
                  <FileText className="w-8 h-8 text-yellow-500" />
                </div>
                <div className="mb-4 inline-block bg-primary text-white px-3 py-1 rounded text-xs font-sans font-bold">
                  {t('dotaciaProcessStep2')}
                </div>
                <h3 className="text-xl font-serif font-bold text-foreground mb-4">`
);

replaceContent(
  `<Card className="p-8 bg-slate-900 border-2 border-emerald-300/50 hover:shadow-2xl transition-all">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-6">
                  <Euro className="w-8 h-8 text-green-600" />
                </div>
                <div className="mb-4 inline-block bg-primary text-white px-3 py-1 rounded text-xs font-sans font-bold">
                  {t('dotaciaProcessStep3')}
                </div>
                <h3 className="text-xl font-serif font-bold text-white mb-4">`,
  `<Card className="p-8 bg-card border-2 border-emerald-300/50 dark:border-emerald-500/30 hover:shadow-2xl transition-all text-foreground">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-6">
                  <Euro className="w-8 h-8 text-green-600" />
                </div>
                <div className="mb-4 inline-block bg-primary text-white px-3 py-1 rounded text-xs font-sans font-bold">
                  {t('dotaciaProcessStep3')}
                </div>
                <h3 className="text-xl font-serif font-bold text-foreground mb-4">`
);

// 3. Step description texts
replaceAllContent(
  `<p className="text-slate-400 leading-relaxed font-sans">`,
  `<p className="text-muted-foreground leading-relaxed font-sans">`
);

replaceAllContent(
  `<p className="text-slate-400 text-sm leading-relaxed font-sans mb-3">`,
  `<p className="text-muted-foreground text-sm leading-relaxed font-sans mb-3">`
);

replaceAllContent(
  `bg-slate-900/80 p-3 rounded border border-emerald-500/30`,
  `bg-muted/50 p-3 rounded border border-emerald-500/30`
);

replaceAllContent(
  `<p className="text-xs text-slate-300 leading-relaxed">`,
  `<p className="text-xs text-muted-foreground leading-relaxed">`
);

replaceContent(
  `<p className="text-sm font-bold text-yellow-400 mb-2">📈`,
  `<p className="text-sm font-bold text-yellow-600 dark:text-yellow-450 mb-2">📈`
);

replaceAllContent(
  `<p className="text-slate-400 text-sm leading-relaxed font-sans">`,
  `<p className="text-muted-foreground text-sm leading-relaxed font-sans">`
);

// 4. Visualization Section Background
replaceContent(
  `      {/* GRAFICKÉ ZNÁZORNENIE DOTÁCIE */}
      <section className="py-20 bg-slate-900">`,
  `      {/* GRAFICKÉ ZNÁZORNENIE DOTÁCIE */}
      <section className="py-20 bg-muted/20 border-t border-border">`
);

replaceContent(
  `              <p className="text-base sm:text-xl text-slate-300 font-sans">
                {t('dotaciaVisualizationSubtitle')}
              </p>`,
  `              <p className="text-base sm:text-xl text-muted-foreground font-sans">
                {t('dotaciaVisualizationSubtitle')}
              </p>`
);

// 5. Ambassador Card details
replaceContent(
  `              {/* PROGRAM AMBASSADOR */}
              <Card className="p-6 bg-slate-900/50 backdrop-blur border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)]">`,
  `              {/* PROGRAM AMBASSADOR */}
              <Card className="p-6 bg-card backdrop-blur border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)] text-foreground">`
);

replaceContent(
  `                  <h3 className="text-xl font-serif font-bold text-white">{t('dotaciaVisualizationAmbassadorSubtitle')}</h3>`,
  `                  <h3 className="text-xl font-serif font-bold text-foreground">{t('dotaciaVisualizationAmbassadorSubtitle')}</h3>`
);

// 6. Investor Card details
replaceContent(
  `              {/* PROGRAM INVESTOR & PARTNER */}
              <Card className="p-6 bg-slate-900/50 backdrop-blur border border-yellow-500/30 shadow-[0_0_30px_rgba(234,179,8,0.1)]">`,
  `              {/* PROGRAM INVESTOR & PARTNER */}
              <Card className="p-6 bg-card backdrop-blur border border-yellow-500/30 shadow-[0_0_30px_rgba(234,179,8,0.1)] text-foreground">`
);

replaceContent(
  `                  <h3 className="text-xl font-serif font-bold text-white">{t('dotaciaVisualizationInvestorSubtitle')}</h3>`,
  `                  <h3 className="text-xl font-serif font-bold text-foreground">{t('dotaciaVisualizationInvestorSubtitle')}</h3>`
);

// 7. Catalog Price blocks in visualization
replaceAllContent(
  `                  <div className="bg-slate-900 p-4 rounded-lg border-2 border-white/10">
                    <p className="text-sm text-slate-400 mb-2">{t('dotaciaCatalogPrice')}</p>
                    <div className="h-12 bg-slate-800 rounded flex items-center justify-center">
                      <p className="text-lg font-bold text-slate-300">100%</p>
                    </div>
                  </div>`,
  `                  <div className="bg-muted/50 p-4 rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground mb-2">{t('dotaciaCatalogPrice')}</p>
                    <div className="h-12 bg-muted rounded flex items-center justify-center">
                      <p className="text-lg font-bold text-muted-foreground">100%</p>
                    </div>
                  </div>`
);

// 8. Doplatok block
replaceContent(
  `                  <div className="bg-slate-800 p-4 rounded-lg border border-white/10">
                    <p className="text-sm text-primary font-bold mb-2">💰 {t('dotaciaYourPayment')}</p>
                    <div className="h-12 bg-primary rounded flex items-center justify-center">
                      <p className="text-lg font-bold text-white">{t('dotaciaYourPaymentAmount')}</p>
                    </div>
                  </div>`,
  `                  <div className="bg-muted p-4 rounded-lg border border-border">
                    <p className="text-sm text-primary font-bold mb-2">💰 {t('dotaciaYourPayment')}</p>
                    <div className="h-12 bg-primary rounded flex items-center justify-center">
                      <p className="text-lg font-bold text-white">{t('dotaciaYourPaymentAmount')}</p>
                    </div>
                  </div>`
);

replaceContent(
  `                  <div className="bg-slate-800 p-4 rounded-lg border border-white/10">
                    <p className="text-sm text-orange-800 font-bold mb-2">💰 {t('dotaciaYourPayment')}</p>
                    <div className="h-12 bg-orange-500 rounded flex items-center justify-center">
                      <p className="text-lg font-bold text-white">{t('dotaciaYourPaymentAmount')}</p>
                    </div>
                  </div>`,
  `                  <div className="bg-muted p-4 rounded-lg border border-border">
                    <p className="text-sm text-orange-600 font-bold mb-2">💰 {t('dotaciaYourPayment')}</p>
                    <div className="h-12 bg-orange-500 rounded flex items-center justify-center">
                      <p className="text-lg font-bold text-white">{t('dotaciaYourPaymentAmount')}</p>
                    </div>
                  </div>`
);

replaceContent(
  `<p className="text-sm text-yellow-400 font-bold mb-3">🎁 {t('dotaciaBonusTitle')}</p>`,
  `<p className="text-sm text-yellow-500 font-bold mb-3">🎁 {t('dotaciaBonusTitle')}</p>`
);

replaceContent(
  `<ul className="space-y-2 text-xs text-yellow-400 mb-3">`,
  `<ul className="space-y-2 text-xs text-yellow-600 dark:text-yellow-400 mb-3">`
);

// 9. Product Section background
replaceContent(
  `      {/* PRODUKTOVÁ SEKCIA */}
      <section className="py-10 sm:py-16 md:py-20 bg-slate-950 border-t border-white/10">`,
  `      {/* PRODUKTOVÁ SEKCIA */}
      <section className="py-10 sm:py-16 md:py-20 bg-background border-t border-border">`
);

replaceContent(
  `            <p className="text-base sm:text-xl text-slate-300 font-sans">
              {t('dotaciaProductsSubtitle')}
            </p>`,
  `            <p className="text-base sm:text-xl text-muted-foreground font-sans">
              {t('dotaciaProductsSubtitle')}
            </p>`
);

// 10. Product Cards
replaceAllContent(
  `<Card className="overflow-hidden hover:shadow-2xl transition-all border border-white/10 bg-slate-900">`,
  `<Card className="overflow-hidden hover:shadow-2xl transition-all border border-border bg-card">`
);

replaceAllContent(
  `<div className="p-4 sm:p-6 bg-slate-900">
                          <h3 className="text-base sm:text-xl font-serif font-bold text-white mb-4">`,
  `<div className="p-4 sm:p-6 bg-card">
                          <h3 className="text-base sm:text-xl font-serif font-bold text-foreground mb-4">`
);

replaceAllContent(
  `<div className="bg-slate-900 border border-white/10 bg-slate-900 rounded-lg p-4 mb-4 font-sans">
                            <div className="flex justify-between items-center mb-2 pb-2 border-b">
                              <span className="text-xs sm:text-sm text-slate-400">{t('dotaciaCatalogPrice')}:</span>
                              <span className="text-sm sm:text-base font-bold text-white">`,
  `<div className="bg-muted/50 border border-border rounded-lg p-4 mb-4 font-sans">
                            <div className="flex justify-between items-center mb-2 pb-2 border-b">
                              <span className="text-xs sm:text-sm text-muted-foreground">{t('dotaciaCatalogPrice')}:</span>
                              <span className="text-sm sm:text-base font-bold text-foreground">`
);

replaceAllContent(
  `</span>
                            </div>
                            <div className="mb-3 pb-3 border-b">
                              <p className="text-xs sm:text-sm font-bold text-slate-300 mb-2 uppercase">
                                {t('dotaciaGrant')}
                              </p>
                              <p className="text-xs text-slate-400 mb-2">{t('dotaciaGrantAmount')}</p>
                              <div className="flex justify-between items-center">
                                <span className="text-xs sm:text-sm text-slate-400">`,
  `</span>
                            </div>
                            <div className="mb-3 pb-3 border-b">
                              <p className="text-xs sm:text-sm font-bold text-foreground mb-2 uppercase">
                                {t('dotaciaGrant')}
                              </p>
                              <p className="text-xs text-muted-foreground mb-2">{t('dotaciaGrantAmount')}</p>
                              <div className="flex justify-between items-center">
                                <span className="text-xs sm:text-sm text-muted-foreground">`
);

replaceAllContent(
  `</span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs sm:text-sm font-bold text-primary">{t('dotaciaYourPayment')}:</span>
                              <span className="text-base sm:text-xl font-bold text-primary">`,
  `</span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs sm:text-sm font-bold text-primary">{t('dotaciaYourPayment')}:</span>
                              <span className="text-base sm:text-xl font-bold text-primary">`
);

replaceAllContent(
  `<p className="text-xs sm:text-sm font-sans font-bold text-slate-300 mb-3">`,
  `<p className="text-xs sm:text-sm font-sans font-bold text-foreground/80 mb-3">`
);

replaceAllContent(
  `<p className="text-xs text-slate-300">{t('dotaciaGrant')}`,
  `<p className="text-xs text-muted-foreground">{t('dotaciaGrant')}`
);

// Already correct in file: text-yellow-400

// 11. Modal Close Buttons
replaceAllContent(
  `className="absolute top-4 right-4 z-30 bg-slate-900/90 hover:bg-slate-900 p-3 rounded-full shadow-lg transition-all"`,
  `className="absolute top-4 right-4 z-30 bg-background/90 hover:bg-background border border-border p-3 rounded-full shadow-lg transition-all text-foreground"`
);

// 12. Form inputs
replaceContent(
  `                  <Input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="text-base p-4 font-sans bg-slate-900 border-white/10 text-white placeholder:text-slate-500"
                  />
                  <Input
                    type="tel"
                    placeholder={t('phone')}
                    value={formData.telefon}
                    onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                    required
                    className="text-base p-4 font-sans bg-slate-900 border-white/10 text-white placeholder:text-slate-500"
                  />`,
  `                  <Input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="text-sm sm:text-base p-3 sm:p-4 font-sans bg-background border-border text-foreground placeholder:text-muted-foreground min-h-[48px]"
                  />
                  <Input
                    type="tel"
                    placeholder={t('phone')}
                    value={formData.telefon}
                    onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                    required
                    className="text-sm sm:text-base p-3 sm:p-4 font-sans bg-background border-border text-foreground placeholder:text-muted-foreground min-h-[48px]"
                  />`
);

replaceContent(
  `                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      {t('dotaciaFormTypeGrant')} <span className="text-red-600">*</span>
                    </label>
                    <Select value={formData.typ_grantu} onValueChange={(value) => setFormData({ ...formData, typ_grantu: value })} required>
                      <SelectTrigger className="text-base p-4 font-sans bg-slate-900 border-white/10 text-white h-auto">`,
  `                  <div>
                    <label className="block text-sm font-semibold text-muted-foreground mb-2">
                      {t('dotaciaFormTypeGrant')} <span className="text-red-600">*</span>
                    </label>
                    <Select value={formData.typ_grantu} onValueChange={(value) => setFormData({ ...formData, typ_grantu: value })} required>
                      <SelectTrigger className="text-sm sm:text-base p-3 sm:p-4 font-sans bg-background border-border text-foreground h-auto min-h-[48px]">`
);

replaceContent(
  `                  <div>
                    <Select value={formData.dom_id} onValueChange={(value) => setFormData({ ...formData, dom_id: value })} required>
                      <SelectTrigger className="text-base p-4 font-sans bg-slate-900 border-white/10 text-white h-auto">`,
  `                  <div>
                    <Select value={formData.dom_id} onValueChange={(value) => setFormData({ ...formData, dom_id: value })} required>
                      <SelectTrigger className="text-sm sm:text-base p-3 sm:p-4 font-sans bg-background border-border text-foreground h-auto min-h-[48px]">`
);

replaceContent(
  `                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      {t('dotaciaFormFinancing')} <span className="text-red-600">*</span>
                    </label>
                    <Select value={formData.forma_financovania} onValueChange={(value) => setFormData({ ...formData, forma_financovania: value })} required>
                      <SelectTrigger className="text-base p-4 font-sans bg-slate-900 border-white/10 text-white h-auto">`,
  `                  <div>
                    <label className="block text-sm font-semibold text-muted-foreground mb-2">
                      {t('dotaciaFormFinancing')} <span className="text-red-600">*</span>
                    </label>
                    <Select value={formData.forma_financovania} onValueChange={(value) => setFormData({ ...formData, forma_financovania: value })} required>
                      <SelectTrigger className="text-sm sm:text-base p-3 sm:p-4 font-sans bg-background border-border text-foreground h-auto min-h-[48px]">`
);

// 13. Footer
replaceContent(
  `      {/* PÄTIČKA */}
      <footer className="py-12 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg font-serif font-bold mb-2">
            {t('dotaciaFooterTitle')}
          </p>
          <p className="text-gray-400 text-sm mb-6 font-sans">
            {t('dotaciaFooterSubtitle')}
          </p>
          <div className="border-t border-gray-700 pt-6">
            <p className="text-slate-400 text-xs max-w-3xl mx-auto font-sans leading-relaxed">
              ⚖️ {t('dotaciaLegalNotice')}
            </p>
          </div>
        </div>
      </footer>`,
  `      {/* PÄTIČKA */}
      <footer className="py-12 bg-card text-foreground border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg font-serif font-bold mb-2">
            {t('dotaciaFooterTitle')}
          </p>
          <p className="text-muted-foreground text-sm mb-6 font-sans">
            {t('dotaciaFooterSubtitle')}
          </p>
          <div className="border-t border-border pt-6">
            <p className="text-muted-foreground text-xs max-w-3xl mx-auto font-sans leading-relaxed">
              ⚖️ {t('dotaciaLegalNotice')}
            </p>
          </div>
        </div>
      </footer>`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully completed adaptive styling update for DotaciaAmericana.jsx!');
