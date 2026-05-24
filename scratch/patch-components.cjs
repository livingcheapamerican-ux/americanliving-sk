const fs = require('fs');

// 1. Patch HypotekaKalkulator.jsx
(function() {
  const filePath = '/Users/richardkovac/Documents/american_living_web/american-living-sk/src/components/HypotekaKalkulator.jsx';
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  
  const reps = [
    {
      from: `Card className="p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200"`,
      to: `Card className="p-3 sm:p-4 bg-card border border-border shadow-xl backdrop-blur-sm"`
    },
    {
      from: `h3 className="text-base font-bold text-gray-900"`,
      to: `h3 className="text-base font-bold text-foreground"`
    },
    {
      from: `className="p-2 bg-gray-100 rounded-lg"`,
      to: `className="p-2 bg-muted rounded-lg"`
    },
    {
      from: `span className="text-xs text-gray-600"`,
      to: `span className="text-xs text-muted-foreground"`
    },
    {
      from: `span className="text-sm font-bold text-gray-800"`,
      to: `span className="text-sm font-bold text-foreground"`
    },
    {
      from: `bg-purple-50 rounded-lg border border-purple-200`,
      to: `bg-purple-500/10 rounded-lg border border-purple-500/20`
    },
    {
      from: `text-purple-900`,
      to: `text-purple-600 dark:text-purple-400`
    },
    {
      from: `text-purple-800`,
      to: `text-purple-600/90 dark:text-purple-400/80`
    },
    {
      from: `span className="text-xs font-semibold text-blue-700"`,
      to: `span className="text-xs font-semibold text-primary"`
    },
    {
      from: `span className="text-xs font-semibold text-blue-700">{dobaSplatnosti}`,
      to: `span className="text-xs font-semibold text-primary">{dobaSplatnosti}`
    },
    {
      from: `span className="text-xs font-semibold text-blue-700">{urokovaSadzba`,
      to: `span className="text-xs font-semibold text-primary">{urokovaSadzba`
    },
    {
      from: `pt-2 border-t border-blue-200`,
      to: `pt-2 border-t border-border`
    },
    {
      from: `bg-blue-600 text-white p-3`,
      to: `bg-primary text-primary-foreground p-3`
    },
    {
      from: `className="bg-gray-100 p-2 rounded"`,
      to: `className="bg-muted p-2 rounded"`
    },
    {
      from: `p className="text-gray-600`,
      to: `p className="text-muted-foreground`
    },
    {
      from: `p className="font-bold text-gray-900"`,
      to: `p className="font-bold text-foreground"`
    },
    {
      from: `p className="font-bold text-orange-600"`,
      to: `p className="font-bold text-orange-500"`
    },
    {
      from: `bg-yellow-50 rounded border border-yellow-200`,
      to: `bg-yellow-500/10 rounded border border-yellow-500/20`
    },
    {
      from: `text-yellow-800`,
      to: `text-yellow-600 dark:text-yellow-450`
    }
  ];
  
  let count = 0;
  for (const r of reps) {
    if (content.includes(r.from)) {
      content = content.split(r.from).join(r.to);
      count++;
    }
  }
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`HypotekaKalkulator.jsx: Replaced ${count} items.`);
})();

// 2. Patch LyonSummaryPanelStandalone.jsx
(function() {
  const filePath = '/Users/richardkovac/Documents/american_living_web/american-living-sk/src/components/LyonSummaryPanelStandalone.jsx';
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  
  const reps = [
    {
      from: `Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl border-2 border-slate-700 overflow-hidden"`,
      to: `Card className="bg-card text-foreground shadow-2xl border border-border overflow-hidden"`
    },
    {
      from: `bg-gradient-to-r from-blue-600 to-indigo-600 p-4 border-b border-slate-700`,
      to: `bg-gradient-to-r from-blue-600 to-indigo-600 p-4 border-b border-border`
    },
    {
      from: `bg-cyan-900/30 rounded-lg p-3 border border-cyan-700`,
      to: `bg-cyan-500/10 rounded-lg p-3 border border-cyan-500/30`
    },
    {
      from: `text-cyan-300`,
      to: `text-cyan-600 dark:text-cyan-400`
    },
    {
      from: `text-slate-300`,
      to: `text-muted-foreground`
    },
    {
      from: `bg-slate-800/50 rounded-lg p-3 border border-slate-700`,
      to: `bg-muted rounded-lg p-3 border border-border`
    },
    {
      from: `text-slate-400`,
      to: `text-muted-foreground`
    },
    {
      from: `text-white mb-2`,
      to: `text-foreground mb-2`
    },
    {
      from: `bg-yellow-900/30 border border-yellow-700 rounded`,
      to: `bg-yellow-500/10 border border-yellow-500/30 rounded`
    },
    {
      from: `text-yellow-400`,
      to: `text-yellow-600 dark:text-yellow-400`
    },
    {
      from: `text-yellow-200`,
      to: `text-yellow-700 dark:text-yellow-300`
    },
    {
      from: `text-green-400`,
      to: `text-emerald-600 dark:text-emerald-400`
    },
    {
      from: `border-t-2 border-slate-700 bg-gradient-to-r from-blue-600 to-indigo-600 p-4`,
      to: `border-t border-border bg-gradient-to-r from-blue-600 to-indigo-600 p-4`
    }
  ];
  
  let count = 0;
  for (const r of reps) {
    if (content.includes(r.from)) {
      content = content.split(r.from).join(r.to);
      count++;
    }
  }
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`LyonSummaryPanelStandalone.jsx: Replaced ${count} items.`);
})();

// 3. Patch FloatingPrice.jsx
(function() {
  const filePath = '/Users/richardkovac/Documents/american_living_web/american-living-sk/src/components/FloatingPrice.jsx';
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  
  const reps = [
    {
      from: `className="bg-white rounded-t-2xl md:rounded-2xl w-full md:max-w-md max-h-[85vh] overflow-y-auto"`,
      to: `className="bg-card text-foreground rounded-t-2xl md:rounded-2xl w-full md:max-w-md max-h-[85vh] overflow-y-auto border border-border shadow-xl"`
    },
    {
      from: `className="block text-xs font-semibold text-gray-700 mb-1"`,
      to: `className="block text-xs font-semibold text-muted-foreground mb-1"`
    },
    {
      from: `className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"`,
      to: `className="w-full px-3 py-2 border border-border bg-background text-foreground placeholder:text-muted-foreground rounded-lg text-sm"`
    },
    {
      from: `className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"`,
      to: `className="w-full px-3 py-2 border border-border bg-background text-foreground placeholder:text-muted-foreground rounded-lg text-sm resize-none"`
    }
  ];
  
  let count = 0;
  for (const r of reps) {
    if (content.includes(r.from)) {
      content = content.split(r.from).join(r.to);
      count++;
    }
  }
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`FloatingPrice.jsx: Replaced ${count} items.`);
})();
