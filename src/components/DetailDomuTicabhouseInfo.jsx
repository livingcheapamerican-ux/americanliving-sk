import React from "react";
import { Card } from "@/components/ui/card";
import { CheckCircle, AlertCircle } from "lucide-react";
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
    <div className="space-y-3 sm:space-y-4">
      {/* Obrázok základnej konfigurácie */}
      {dom.zakladna_konfiguracia_obrazok && (
        <Card className="p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200">
          <h3 className="text-sm sm:text-base font-bold text-primary mb-2 sm:mb-3">📸 {t('basicConfiguration')}</h3>
          <div className="rounded-lg overflow-hidden shadow-lg">
            <ImageWithWatermark
              src={dom.zakladna_konfiguracia_obrazok}
              alt={(dom.images_seo_map?.[language] || dom.images_seo_map?.['sk'])?.[dom.zakladna_konfiguracia_obrazok] || `${dom.nazov} - základná konfigurácia`}
              className="w-full h-auto object-cover"
            />
          </div>
          <p className="text-xs sm:text-sm text-blue-800 mt-2 text-center font-medium">
            {t('basicConfigDesc')}
          </p>
        </Card>
      )}

      {/* Štandardná výbava */}
      <Card className="p-3 sm:p-4 bg-gradient-to-br from-green-50 to-white border-2 border-green-200">
        <h3 className="text-sm sm:text-base font-bold text-primary mb-2 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
          {t('basicHouseConfig')}
        </h3>
        {(dom.nazov === 'Lyon' || dom.nazov === 'Happy Wife' || dom.nazov?.includes('Lyon') || dom.nazov?.includes('Happy Wife')) && (
          <p className="text-xs sm:text-sm text-gray-700 mb-4 leading-relaxed">
            {t('basicConfigDescription')}
          </p>
        )}

        {dom.specifikacia && dom.nazov !== "Model HAPPY WIFE" && (
          <div className="mb-4 text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
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
          <div className="mb-4 text-xs sm:text-sm text-gray-700 leading-relaxed">
            <p className="font-semibold text-gray-800 mb-2">✔ {t('heatingLabel')}</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2 mb-3">
              <li>{t('floorHeatingIncluded')}</li>
            </ul>
            <p className="font-semibold text-gray-800 mb-2">✔ {t('sanitaryLabel')}</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2 mb-3">
              <li>{t('bathroomIncluded')}</li>
            </ul>
            <p className="font-semibold text-gray-800 mb-2">✔ {t('kitchenUnit')}</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2 mb-3">
              <li>{t('kitchenIncluded')}</li>
            </ul>
            <p className="font-semibold text-gray-800 mb-2">✔ {t('interiorLabel')}</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2 mb-3">
              <li>{t('fullyAssembledInterior')}</li>
              <li>{t('interiorSelectionFromSamples')}</li>
            </ul>
            <p className="font-semibold text-gray-800 mb-2">✔ {t('airConditioningLabel')}</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2 mb-3">
              <li>{t('acPreparationIncluded')}</li>
            </ul>
            <p className="font-semibold text-gray-800 mb-2">✔ {t('projectCertification')}</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2 mb-3">
              <li>{t('projectEnergyClassification')}</li>
            </ul>
            <p className="text-red-600 font-semibold mt-3">• {t('terrace')}: ❌ {t('additionalCost')}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-green-100 border-2 border-green-400 rounded-lg p-3">
            <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2 text-xs sm:text-sm">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              ✅ {t('includedInPrice') || 'Zahrnuté v cene'}
            </h4>
            <ul className="space-y-1.5 text-xs sm:text-sm text-green-900">
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
                <li key={key} className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span><strong>{t(key) || key}:</strong> {t(val) || val}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3">
            <h4 className="font-bold text-red-800 mb-3 flex items-center gap-2 text-xs sm:text-sm">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
              ❌ {t('additionalCost') || 'Za príplatok'}
            </h4>
            <ul className="space-y-1.5 text-xs sm:text-sm text-red-900">
              {[
                'floorHeating', 'washbasinWithCabinet', 'kitchenUnit', 'terrace',
                'transportAndAssembly', 'foundationsSection',
              ].map((key) => (
                <li key={key} className="flex items-start gap-2">
                  <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <span><strong>{t(key) || key}</strong></span>
                </li>
              ))}
              <li className="flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span><strong>{t('externalConnections') || 'Vonkajšie prípojky'}</strong> ({t('waterElectricitySewage') || 'voda, elektrina, kanál'})</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span><strong>{t('craneTruck') || 'Žeriav/nákladné auto'}</strong> {t('forInstallation') || 'na osadenie'}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs sm:text-sm text-blue-800">
            <strong>{t('modularAdvantage')}</strong> {t('modularAdvantageDesc')}
          </p>
        </div>
      </Card>

      {/* A0 upozornenie */}
      {lyonUcel === "rodinny" && !isA0Complete && (
        <Card className="bg-yellow-50 border-2 border-yellow-400 p-4">
          <div className="flex items-start gap-3">
            <div className="text-yellow-600 text-2xl">⚠️</div>
            <div>
              <h4 className="text-yellow-900 font-bold mb-2">{t('recreationalBuilding')}</h4>
              <p className="text-yellow-800 text-sm mb-3">
                {t('toApproveAsFamilyHouse') || 'Pre skolaudovanie ako rodinný dom musíte vybrať všetky povinné A0 položky označené'} <span className="text-green-600 font-bold">⚡A0</span> {t('inConfigurator') || 'v konfigurátore'}.
              </p>
              <div className="text-xs text-yellow-700">
                <p className="font-semibold mb-1">{t('missingA0ItemsList') || 'Chýbajúce A0 položky'}:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {lyonIzolaciaStien !== "250mm" && <li>{t('insulation')} {t('walls')} 250mm</li>}
                  {lyonIzolaciaPodlahy !== "200mm" && <li>{t('insulation')} {t('floors')} 200mm</li>}
                  {lyonIzolaciaStropu !== "200mm" && <li>{t('insulation')} {t('roof')} 200mm</li>}
                  {lyonTepelneCerpadlo !== "ano" && <li>{t('heatPump')}</li>}
                  {lyonRekuperacia !== "ano" && <li>{t('recuperation')}</li>}
                  {lyonElektro !== "ge" && <li>GE {t('electricalInstallation')}</li>}
                  {!lyonBleskozvod && <li>{t('lightningRod')}</li>}
                  {!lyonPrepat && <li>{t('surgeProtection')}</li>}
                  {!lyonInziniering && <li>{t('engineering')}</li>}
                  {!lyonProjektACertifikacia && <li>{t('projectCertification')} A0</li>}
                </ul>
              </div>
            </div>
          </div>
        </Card>
      )}
      {lyonUcel === "rodinny" && isA0Complete && (
        <Card className="bg-green-50 border-2 border-green-400 p-4">
          <div className="flex items-start gap-3">
            <div className="text-green-600 text-2xl">✅</div>
            <div>
              <h4 className="text-green-900 font-bold mb-1">{t('familyHouseA0')}</h4>
              <p className="text-green-800 text-sm">
                {t('configIncludesAllA0') || 'Vaša konfigurácia zahŕňa všetky potrebné A0 položky.'}
              </p>
            </div>
          </div>
        </Card>
      )}
      {lyonUcel !== "rodinny" && (
        <Card className="bg-blue-50 border-2 border-blue-400 p-4">
          <div className="flex items-start gap-3">
            <div className="text-blue-600 text-2xl">ℹ️</div>
            <div>
              <h4 className="text-blue-900 font-bold mb-1">{t('recreationalBuilding')}</h4>
              <p className="text-blue-800 text-sm">
                {t('houseConfiguredAsRecreational') || 'Dom je nakonfigurovaný ako rekreačná stavba.'}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}