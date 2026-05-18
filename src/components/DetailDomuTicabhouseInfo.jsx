import React from "react";
import { CheckCircle, AlertCircle, Check, Zap, Layers, Home, Info, Hammer } from "lucide-react";
import TranslatedDescription from "./TranslatedDescription";
import ImageWithWatermark from "./ImageWithWatermark";

export default function DetailDomuTicabhouseInfo({ dom, t, language, lyonState }) {
  const {
    lyonUcel, lyonIzolaciaStien, lyonIzolaciaPodlahy, lyonIzolaciaStropu,
    lyonTepelneCerpadlo, lyonRekuperacia, lyonElektro, lyonBleskozvod,
    lyonPrepat, lyonInziniering, lyonProjektACertifikacia,
  } = lyonState;

  const isA0Complete = (
    lyonIzolaciaStien === "250mm" &&
    lyonIzolaciaPodlahy === "200mm" &&
    lyonIzolaciaStropu === "200mm" &&
    lyonTepelneCerpadlo === "ano" &&
    lyonRekuperacia === "ano" &&
    lyonElektro === "ge" &&
    lyonBleskozvod &&
    lyonPrepat &&
    lyonInziniering &&
    lyonProjektACertifikacia
  );

  return (
    <div className="space-y-6">
      {/* Obrázok základnej konfigurácie */}
      {dom.zakladna_konfiguracia_obrazok && (
        <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
          <h3 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-2">
            📸 {t('basicConfiguration')}
          </h3>
          <div className="rounded-2xl overflow-hidden shadow-lg border border-white/5">
            <ImageWithWatermark
              src={dom.zakladna_konfiguracia_obrazok}
              alt={(dom.images_seo_map?.[language] || dom.images_seo_map?.['sk'])?.[dom.zakladna_konfiguracia_obrazok] || `${dom.nazov} - základná konfigurácia`}
              className="w-full h-auto object-cover"
            />
          </div>
          <p className="text-sm text-slate-400 mt-4 text-center font-medium">
            {t('basicConfigDesc')}
          </p>
        </div>
      )}

      {/* Štandardná výbava */}
      <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
        <h3 className="text-lg sm:text-xl font-bold text-white mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
          {t('basicHouseConfig')}
        </h3>

        {(dom.nazov === 'Lyon' || dom.nazov === 'Happy Wife' || dom.nazov?.includes('Lyon') || dom.nazov?.includes('Happy Wife')) && (
          <p className="text-sm text-slate-300 mb-6 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
            {t('basicConfigDescription')}
          </p>
        )}

        {dom.specifikacia && dom.nazov !== "Model HAPPY WIFE" && (
          <div className="mb-8 text-sm text-slate-300 leading-relaxed whitespace-pre-line bg-white/5 p-5 rounded-2xl border border-white/5">
            <TranslatedDescription
              text={dom.specifikacia}
              textEn={dom.specifikacia_en}
              textHu={dom.specifikacia_hu}
              textPl={dom.specifikacia_pl}
              textUk={dom.specifikacia_uk}
              textDe={dom.specifikacia_de}
              textFr={dom.specifikacia_fr}
              textSr={dom.specifikacia_sr}
              textHr={dom.specifikacia_hr}
              textEl={dom.specifikacia_el}
            />
          </div>
        )}

        {dom.nazov === "Model HAPPY WIFE" && (
          <div className="mb-8 text-sm text-slate-300 space-y-4">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
               <p className="font-bold text-white mb-2 flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-400" /> {t('heatingLabel')}</p>
               <ul className="space-y-1 ml-6 list-disc text-slate-400"><li>{t('floorHeatingIncluded')}</li></ul>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
               <p className="font-bold text-white mb-2 flex items-center gap-2"><Layers className="w-4 h-4 text-blue-400" /> {t('sanitaryLabel')}</p>
               <ul className="space-y-1 ml-6 list-disc text-slate-400"><li>{t('bathroomIncluded')}</li></ul>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
               <p className="font-bold text-white mb-2 flex items-center gap-2"><Home className="w-4 h-4 text-emerald-400" /> {t('kitchenUnit')}</p>
               <ul className="space-y-1 ml-6 list-disc text-slate-400"><li>{t('kitchenIncluded')}</li></ul>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
               <p className="font-bold text-white mb-2 flex items-center gap-2"><Hammer className="w-4 h-4 text-purple-400" /> {t('interiorLabel')}</p>
               <ul className="space-y-1 ml-6 list-disc text-slate-400">
                 <li>{t('fullyAssembledInterior')}</li>
                 <li>{t('interiorSelectionFromSamples')}</li>
               </ul>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
               <p className="font-bold text-white mb-2 flex items-center gap-2"><Zap className="w-4 h-4 text-teal-400" /> {t('airConditioningLabel')}</p>
               <ul className="space-y-1 ml-6 list-disc text-slate-400"><li>{t('acPreparationIncluded')}</li></ul>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
               <p className="font-bold text-white mb-2 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> {t('projectCertification')}</p>
               <ul className="space-y-1 ml-6 list-disc text-slate-400"><li>{t('projectEnergyClassification')}</li></ul>
            </div>
            <div className="bg-red-500/10 p-4 rounded-2xl border border-red-500/20 mt-4">
               <p className="text-red-400 font-bold flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {t('terrace')}: ❌ {t('additionalCost')}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2 gap-6 mt-6">
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5">
            <h4 className="font-bold text-emerald-400 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              {t('includedInPrice') || 'Zahrnuté v cene'}
            </h4>
            <ul className="space-y-3 text-sm text-slate-300">
              {[
                ['frame', 'driedCalibratedWood'],
                ['insulationLabel', 'standardInsulation'],
                ['windows', 'doubleGlazedLaminated'],
                ['doors', 'metalPlastic'],
                ['facadeLabel', 'scandinavianSpruce'],
                ['roofLabel', 'corrugatedSheet'],
                ['interiorLabel', 'woodenCladding'],
                ['electricalInstallationLabel', 'copperWiringLED'],
                ['sanitaryLabel', 'showerWCBoiler'],
                ['heatingLabel', 'heatingPreparation'],
                ['airConditioningLabel', 'acPreparation'],
              ].map(([key, val]) => (
                <li key={key} className="flex items-start gap-3 bg-white/[0.02] p-2 rounded-lg">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span><strong className="text-white">{t(key) || key}:</strong> <span className="text-slate-400">{t(val) || val}</span></span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5">
            <h4 className="font-bold text-red-400 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {t('additionalCost') || 'Za príplatok'}
            </h4>
            <ul className="space-y-3 text-sm text-slate-300">
              {[
                'floorHeating', 'washbasinWithCabinet', 'kitchenUnit', 'terrace',
                'transportAndAssembly', 'foundationsSection',
              ].map((key) => (
                <li key={key} className="flex items-center gap-3 bg-white/[0.02] p-2 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <strong className="text-slate-300">{t(key) || key}</strong>
                </li>
              ))}
              <li className="flex items-start gap-3 bg-white/[0.02] p-2 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span><strong className="text-slate-300">{t('externalConnections') || 'Vonkajšie prípojky'}</strong> <span className="text-slate-500">({t('waterElectricitySewage') || 'voda, elektrina, kanál'})</span></span>
              </li>
              <li className="flex items-start gap-3 bg-white/[0.02] p-2 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span><strong className="text-slate-300">{t('craneTruck') || 'Žeriav/nákladné auto'}</strong> <span className="text-slate-500">{t('forInstallation') || 'na osadenie'}</span></span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 p-5 bg-blue-500/10 rounded-2xl border border-blue-500/20 flex gap-4">
          <Info className="w-6 h-6 text-blue-400 flex-shrink-0" />
          <p className="text-sm text-blue-200">
            <strong className="text-blue-300 block mb-1">{t('modularAdvantage')}</strong> 
            {t('modularAdvantageDesc')}
          </p>
        </div>
      </div>

      {/* A0 upozornenie */}
      {lyonUcel === "rodinny" && !isA0Complete && (
        <div className="bg-amber-500/10 border-2 border-amber-500/30 p-6 rounded-3xl backdrop-blur-md">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30 flex-shrink-0">
               <AlertCircle className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h4 className="text-amber-400 font-bold mb-2 text-lg">{t('recreationalBuilding')}</h4>
              <p className="text-slate-300 text-sm mb-4">
                {t('toApproveAsFamilyHouse') || 'Pre skolaudovanie ako rodinný dom musíte vybrať všetky povinné A0 položky označené'} <span className="text-emerald-400 font-bold px-2 py-0.5 bg-emerald-500/20 rounded">⚡ A0</span> {t('inConfigurator') || 'v konfigurátore'}.
              </p>
              <div className="text-sm text-slate-400 bg-black/20 p-4 rounded-xl border border-white/5">
                <p className="font-bold text-amber-500 mb-2">{t('missingA0ItemsList') || 'Chýbajúce A0 položky'}:</p>
                <ul className="grid sm:grid-cols-2 gap-2">
                  {lyonIzolaciaStien !== "250mm" && <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"/>{t('insulation')} {t('walls')} 250mm</li>}
                  {lyonIzolaciaPodlahy !== "200mm" && <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"/>{t('insulation')} {t('floors')} 200mm</li>}
                  {lyonIzolaciaStropu !== "200mm" && <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"/>{t('insulation')} {t('roof')} 200mm</li>}
                  {lyonTepelneCerpadlo !== "ano" && <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"/>{t('heatPump')}</li>}
                  {lyonRekuperacia !== "ano" && <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"/>{t('recuperation')}</li>}
                  {lyonElektro !== "ge" && <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"/>GE {t('electricalInstallation')}</li>}
                  {!lyonBleskozvod && <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"/>{t('lightningRod')}</li>}
                  {!lyonPrepat && <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"/>{t('surgeProtection')}</li>}
                  {!lyonInziniering && <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"/>{t('engineering')}</li>}
                  {!lyonProjektACertifikacia && <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"/>{t('projectCertification')} A0</li>}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      {lyonUcel === "rodinny" && isA0Complete && (
        <div className="bg-emerald-500/10 border-2 border-emerald-500/30 p-6 rounded-3xl backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 flex-shrink-0">
               <CheckCircle className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-emerald-400 font-bold mb-1 text-lg">{t('familyHouseA0')}</h4>
              <p className="text-emerald-200/70 text-sm">
                {t('configIncludesAllA0') || 'Vaša konfigurácia zahŕňa všetky potrebné A0 položky.'}
              </p>
            </div>
          </div>
        </div>
      )}
      {lyonUcel !== "rodinny" && (
        <div className="bg-blue-500/10 border-2 border-blue-500/30 p-6 rounded-3xl backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30 flex-shrink-0">
               <Info className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h4 className="text-blue-400 font-bold mb-1 text-lg">{t('recreationalBuilding')}</h4>
              <p className="text-blue-200/70 text-sm">
                {t('houseConfiguredAsRecreational') || 'Dom je nakonfigurovaný ako rekreačná stavba.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}