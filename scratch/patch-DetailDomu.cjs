const fs = require('fs');
const path = require('path');

const filePath = '/Users/richardkovac/Documents/american_living_web/american-living-sk/src/pages/DetailDomu.jsx';
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
  // 1. Root and overall page containers
  {
    from: `className="min-h-screen bg-slate-950 text-slate-50 overflow-x-hidden max-w-full font-['Outfit']"`,
    to: `className="min-h-screen bg-background text-foreground overflow-x-hidden max-w-full font-['Outfit']"`
  },
  {
    from: `className="min-h-screen bg-gray-50 flex items-center justify-center"`,
    to: `className="min-h-screen bg-background flex items-center justify-center"`
  },
  
  // 2. Navigation bar / back button
  {
    from: `bg-slate-900/80 backdrop-blur-md border-b border-white/10 sticky top-[5rem] lg:top-[6rem] z-[60] shadow-md`,
    to: `bg-card/85 backdrop-blur-md border-b border-border sticky top-[5rem] lg:top-[6rem] z-[60] shadow-md`
  },
  {
    from: `className="text-white hover:text-red-400 hover:bg-white/5 text-xs sm:text-sm h-8 sm:h-9 font-bold relative z-50 pointer-events-auto"`,
    to: `className="text-foreground hover:text-primary hover:bg-muted/50 text-xs sm:text-sm h-8 sm:h-9 font-bold relative z-50 pointer-events-auto"`
  },
  
  // 3. Hero section badges
  {
    from: `className="bg-slate-800/80 backdrop-blur border-white/10 text-white px-4 py-2 text-sm font-bold shadow-xl"`,
    to: `className="bg-card/80 backdrop-blur border border-border text-foreground px-4 py-2 text-sm font-bold shadow-xl"`
  },
  
  // 4. Floor plans / dimensions / share cards
  {
    from: `bg-slate-900 border border-white/10 shadow-xl backdrop-blur-sm`,
    to: `bg-card border border-border shadow-xl backdrop-blur-sm`
  },
  {
    from: `bg-slate-950 border border-white/10 cursor-pointer`,
    to: `bg-muted border border-border cursor-pointer`
  },
  {
    from: `border border-emerald-500/50 hover:bg-emerald-500/20 text-emerald-400 bg-slate-950 animate-pulse`,
    to: `border border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 bg-background animate-pulse`
  },
  {
    from: `rounded-lg overflow-hidden bg-gray-50`,
    to: `rounded-lg overflow-hidden bg-muted`
  },
  
  // 5. Badges
  {
    from: `className="bg-slate-800 text-slate-300 border-white/10 px-2 py-0.5 text-xs"`,
    to: `className="bg-muted text-muted-foreground border-border px-2 py-0.5 text-xs"`
  },
  {
    from: `className="bg-slate-850 text-slate-300 border-white/10 px-2 py-0.5 text-xs"`,
    to: `className="bg-muted text-muted-foreground border-border px-2 py-0.5 text-xs"`
  },
  
  // 6. Basic parameters card
  {
    from: `bg-slate-950 border border-red-500/30 rounded-lg`,
    to: `bg-muted border border-red-500/30 rounded-lg`
  },
  {
    from: `text-xs text-slate-400 font-medium">Identifikačné číslo`,
    to: `text-xs text-muted-foreground font-medium">Identifikačné číslo`
  },
  {
    from: `text-lg font-black text-white">{dom.prosto_house_kod}`,
    to: `text-lg font-black text-foreground">{dom.prosto_house_kod}`
  },
  {
    from: `Home className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400"`,
    to: `Home className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground"`
  },
  {
    from: `dt className="text-xs text-slate-500">{t('manufacturer')}`,
    to: `dt className="text-xs text-muted-foreground">{t('manufacturer')}`
  },
  {
    from: `dd className="text-sm sm:text-base font-bold text-white">{dom.vyrobca}`,
    to: `dd className="text-sm sm:text-base font-bold text-foreground">{dom.vyrobca}`
  },
  {
    from: `dt className="text-xs text-slate-500">{t('houseType')}`,
    to: `dt className="text-xs text-muted-foreground">{t('houseType')}`
  },
  {
    from: `dd className="text-sm sm:text-base font-bold text-white">
                        {dom.typ_domu === 'modularny' ? t('modular') : dom.typ_domu === 'montovany' ? t('prefab') : t('mobile')}
                      </dd>`,
    to: `dd className="text-sm sm:text-base font-bold text-foreground">
                        {dom.typ_domu === 'modularny' ? t('modular') : dom.typ_domu === 'montovany' ? t('prefab') : t('mobile')}
                      </dd>`
  },
  {
    from: `dt className="text-xs text-slate-500">Moduly`,
    to: `dt className="text-xs text-muted-foreground">Moduly`
  },
  {
    from: `dd className="text-sm sm:text-base font-bold text-white">{dom.pocet_modulov}`,
    to: `dd className="text-sm sm:text-base font-bold text-foreground">{dom.pocet_modulov}`
  },
  {
    from: `dt className="text-xs text-slate-500">{t('rooms')}`,
    to: `dt className="text-xs text-muted-foreground">{t('rooms')}`
  },
  {
    from: `dd className="text-sm sm:text-base font-bold text-white">{dom.pocet_izieb}`,
    to: `dd className="text-sm sm:text-base font-bold text-foreground">{dom.pocet_izieb}`
  },
  {
    from: `dt className="text-xs text-slate-500">{t('builtArea')}`,
    to: `dt className="text-xs text-muted-foreground">{t('builtArea')}`
  },
  {
    from: `dd className="text-sm sm:text-base font-bold text-white">{dom.zastavana_plocha} m²`,
    to: `dd className="text-sm sm:text-base font-bold text-foreground">{dom.zastavana_plocha} m²`
  },
  {
    from: `dt className="text-xs text-slate-500">{t('usableArea')}`,
    to: `dt className="text-xs text-muted-foreground">{t('usableArea')}`
  },
  {
    from: `dd className="text-sm sm:text-base font-bold text-white">{dom.uzitkova_plocha} m²`,
    to: `dd className="text-sm sm:text-base font-bold text-foreground">{dom.uzitkova_plocha} m²`
  },
  {
    from: `dt className="text-xs text-slate-500">{t('energyClass')}`,
    to: `dt className="text-xs text-muted-foreground">{t('energyClass')}`
  },
  {
    from: `dd className="text-sm sm:text-base font-bold text-emerald-400">A0`,
    to: `dd className="text-sm sm:text-base font-bold text-emerald-500 dark:text-emerald-400">A0`
  },
  {
    from: `p className="text-xs text-slate-500 mt-1">{t('a0CertificateOption')}`,
    to: `p className="text-xs text-muted-foreground mt-1">{t('a0CertificateOption')}`
  },
  {
    from: `dt className="text-xs text-gray-500">Terasa`,
    to: `dt className="text-xs text-muted-foreground">Terasa`
  },
  
  // 7. Config cards and headings
  {
    from: `h3 className="text-sm sm:text-base font-bold text-white mb-2 sm:mb-3">{t('basicParameters')}`,
    to: `h3 className="text-sm sm:text-base font-bold text-foreground mb-2 sm:mb-3">{t('basicParameters')}`
  },
  {
    from: `h3 className="text-sm sm:text-base font-bold text-blue-400 mb-2 sm:mb-3">📸 {t('basicConfiguration') || 'Základná konfigurácia'}`,
    to: `h3 className="text-sm sm:text-base font-bold text-foreground mb-2 sm:mb-3">📸 {t('basicConfiguration') || 'Základná konfigurácia'}`
  },
  {
    from: `text-sm text-blue-400 mt-3 text-center font-medium`,
    to: `text-sm text-muted-foreground mt-3 text-center font-medium`
  },
  {
    from: `h3 className="text-sm sm:text-base font-bold text-emerald-400 mb-2 sm:mb-3">✔ {t('usageOptions') || 'Možnosti využitia'}`,
    to: `h3 className="text-sm sm:text-base font-bold text-foreground mb-2 sm:mb-3">✔ {t('usageOptions') || 'Možnosti využitia'}`
  },
  {
    from: `ul className="space-y-1.5 sm:space-y-2 text-slate-300"`,
    to: `ul className="space-y-1.5 sm:space-y-2 text-muted-foreground"`
  },
  
  // 8. Info boxes (mounting, electrical, water, etc.)
  {
    from: `overflow-hidden border border-amber-500/30 bg-slate-900`,
    to: `overflow-hidden border border-amber-500/30 bg-card`
  },
  {
    from: `overflow-hidden border border-yellow-500/30 bg-slate-900`,
    to: `overflow-hidden border border-yellow-500/30 bg-card`
  },
  {
    from: `overflow-hidden border border-blue-500/30 bg-slate-900`,
    to: `overflow-hidden border border-blue-500/30 bg-card`
  },
  {
    from: `overflow-hidden border border-orange-500/30 bg-slate-900`,
    to: `overflow-hidden border border-orange-500/30 bg-card`
  },
  {
    from: `overflow-hidden border border-emerald-500/30 bg-slate-900`,
    to: `overflow-hidden border border-emerald-500/30 bg-card`
  },
  {
    from: `ul className="space-y-1 text-xs text-slate-300"`,
    to: `ul className="space-y-1 text-xs text-muted-foreground"`
  },
  {
    from: `text-xs text-amber-700 font-semibold mt-2`,
    to: `text-xs text-amber-700 dark:text-amber-500 font-semibold mt-2`
  },
  {
    from: `text-xs text-red-600 font-semibold mt-2`,
    to: `text-xs text-red-600 dark:text-red-400 font-semibold mt-2`
  },
  
  // 9. Outer dimensions card content
  {
    from: `Card className="p-3 sm:p-4 bg-slate-900 border border-white/10 shadow-xl backdrop-blur-sm hover:border-red-500/30 hover:shadow-[0_0_20px_rgba(239,68,68,0.15)] transition-all duration-300"`,
    to: `Card className="p-3 sm:p-4 bg-card border border-border shadow-xl backdrop-blur-sm hover:border-red-500/30 hover:shadow-[0_0_20px_rgba(239,68,68,0.15)] transition-all duration-300"`
  },
  {
    from: `h3 className="text-sm sm:text-base font-bold text-white mb-2 sm:mb-3">{t('outerDimensions')}`,
    to: `h3 className="text-sm sm:text-base font-bold text-foreground mb-2 sm:mb-3">{t('outerDimensions')}`
  },
  {
    from: `p className="text-xs text-slate-400 mb-1">{t('width')}`,
    to: `p className="text-xs text-muted-foreground mb-1">{t('width')}`
  },
  {
    from: `p className="text-base sm:text-lg font-bold text-white">{dom.rozmery.sirka}`,
    to: `p className="text-base sm:text-lg font-bold text-foreground">{dom.rozmery.sirka}`
  },
  {
    from: `p className="text-xs text-slate-400 mb-1">{t('length')}`,
    to: `p className="text-xs text-muted-foreground mb-1">{t('length')}`
  },
  {
    from: `p className="text-base sm:text-lg font-bold text-white">{dom.rozmery.dlzka}`,
    to: `p className="text-base sm:text-lg font-bold text-foreground">{dom.rozmery.dlzka}`
  },
  {
    from: `p className="text-xs text-slate-400 mb-1">{t('height')}`,
    to: `p className="text-xs text-muted-foreground mb-1">{t('height')}`
  },
  {
    from: `p className="text-base sm:text-lg font-bold text-white">{dom.rozmery.vyska}`,
    to: `p className="text-base sm:text-lg font-bold text-foreground">{dom.rozmery.vyska}`
  },
  {
    from: `p className="text-xs sm:text-sm text-slate-400 mt-2 sm:mt-3 text-center">
                    {t('ceilingHeight')}: <span className="font-semibold text-white">`,
    to: `p className="text-xs sm:text-sm text-muted-foreground mt-2 sm:mt-3 text-center">
                    {t('ceilingHeight')}: <span className="font-semibold text-foreground">`
  },
  
  // 10. JAK Modules features card
  {
    from: `Card className="p-3 sm:p-4 bg-slate-900 border border-white/10 shadow-xl backdrop-blur-sm hover:border-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all duration-300"`,
    to: `Card className="p-3 sm:p-4 bg-card border border-border shadow-xl backdrop-blur-sm hover:border-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all duration-300"`
  },
  {
    from: `h3 className="text-sm sm:text-base font-bold text-emerald-400 mb-2 sm:mb-3">✔ {t('mainFeatures')}`,
    to: `h3 className="text-sm sm:text-base font-bold text-foreground mb-2 sm:mb-3">✔ {t('mainFeatures')}`
  },
  {
    from: `div className="space-y-2 text-xs sm:text-sm text-slate-300"`,
    to: `div className="space-y-2 text-xs sm:text-sm text-muted-foreground"`
  },
  
  // 11. JAK Modules pricing content card
  {
    from: `h3 className="text-sm sm:text-base font-bold text-blue-400 mb-2 sm:mb-3">💰 {t('whatIncludesPrice')}`,
    to: `h3 className="text-sm sm:text-base font-bold text-foreground mb-2 sm:mb-3">💰 {t('whatIncludesPrice')}`
  },
  {
    from: `p className="font-semibold text-white mb-1 text-xs sm:text-sm">✔ {t('constructionLabel')}`,
    to: `p className="font-semibold text-foreground mb-1 text-xs sm:text-sm">✔ {t('constructionLabel')}`
  },
  {
    from: `ul className="list-disc list-inside text-slate-300 space-y-0.5 ml-2 text-xs sm:text-sm"`,
    to: `ul className="list-disc list-inside text-muted-foreground space-y-0.5 ml-2 text-xs sm:text-sm"`
  },
  {
    from: `p className="font-semibold text-white mb-2">✔ {t('insulationLabel')}`,
    to: `p className="font-semibold text-foreground mb-2">✔ {t('insulationLabel')}`
  },
  {
    from: `ul className="list-disc list-inside text-slate-300 space-y-1 ml-2"`,
    to: `ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2"`
  },
  {
    from: `p className="font-semibold text-gray-800 mb-2">✔ {t('heatingAc')}`,
    to: `p className="font-semibold text-foreground mb-2">✔ {t('heatingAc')}`
  },
  {
    from: `ul className="list-disc list-inside text-gray-700 space-y-1 ml-2"`,
    to: `ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2"`
  },
  {
    from: `p className="font-semibold text-gray-800 mb-2">✔ {t('windowsDoorsLabel')}`,
    to: `p className="font-semibold text-foreground mb-2">✔ {t('windowsDoorsLabel')}`
  },
  {
    from: `p className="font-semibold text-gray-800 mb-2">✔ {t('equipmentLabel')}`,
    to: `p className="font-semibold text-foreground mb-2">✔ {t('equipmentLabel')}`
  },
  {
    from: `p className="font-semibold text-gray-800 mb-2">✔ {t('facadeRoof')}`,
    to: `p className="font-semibold text-foreground mb-2">✔ {t('facadeRoof')}`
  },
  {
    from: `p className="font-semibold text-gray-800 mb-2">✔ {t('otherLabel')}`,
    to: `p className="font-semibold text-foreground mb-2">✔ {t('otherLabel')}`
  },
  
  // 12. Right column / Mobile pricing block
  {
    from: `bg-slate-900 text-white rounded-xl p-4 shadow-xl border border-white/10`,
    to: `bg-card text-foreground rounded-xl p-4 shadow-xl border border-border`
  },
  {
    from: `text-xs mb-1 text-slate-400`,
    to: `text-xs mb-1 text-muted-foreground`
  },
  {
    from: `text-xl font-black text-red-500 line-through`,
    to: `text-xl font-black text-red-650 dark:text-red-400 line-through`
  },
  {
    from: `text-3xl font-black text-green-500`,
    to: `text-3xl font-black text-emerald-600 dark:text-emerald-500`
  },
  {
    from: `text-xs text-green-400 font-semibold mt-1`,
    to: `text-xs text-emerald-650 dark:text-emerald-450 font-semibold mt-1`
  },
  
  // 13. Sidebar dotacia Notice
  {
    from: `Card className="bg-slate-900 border border-emerald-500/30 p-3 sm:p-4 shadow-xl"`,
    to: `Card className="bg-card border border-emerald-500/30 p-3 sm:p-4 shadow-xl"`
  },
  {
    from: `AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 flex-shrink-0 mt-0.5"`,
    to: `AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-500 flex-shrink-0 mt-0.5"`
  },
  {
    from: `text-xs sm:text-sm text-slate-300 font-sans leading-tight`,
    to: `text-xs sm:text-sm text-muted-foreground font-sans leading-tight`
  },
  
  // 14. CTA buttons bg
  {
    from: `className="w-full border-2 border-red-500 text-red-400 hover:bg-red-500/20 font-semibold text-sm sm:text-base py-4 sm:py-5 bg-slate-950"`,
    to: `className="w-full border-2 border-red-500 text-red-550 hover:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 font-semibold text-sm sm:text-base py-4 sm:py-5 bg-card"`
  },
  {
    from: `className="w-full border-2 border-white/20 text-slate-300 hover:bg-white/5 font-semibold text-sm sm:text-base py-4 sm:py-5 bg-slate-950"`,
    to: `className="w-full border-2 border-border text-foreground hover:bg-muted font-semibold text-sm sm:text-base py-4 sm:py-5 bg-card"`
  }
];

let replacedCount = 0;
for (const replacement of replacements) {
  if (content.includes(replacement.from)) {
    content = content.split(replacement.from).join(replacement.to);
    replacedCount++;
  } else {
    console.log('Skipped replacement (not found):', replacement.from.substring(0, 50));
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log(`Successfully completed ${replacedCount} string replacements.`);
