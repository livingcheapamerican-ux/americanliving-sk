import React from "react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Shield, Mail, Phone, MapPin } from "lucide-react";

export default function ZasadyOchranyOsobnychUdajov() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-4 mb-4">
              <Shield className="w-12 h-12" />
              <h1 className="text-4xl md:text-5xl font-bold">
                Ochrana Osobných Údajov (GDPR)
              </h1>
            </div>
            <p className="text-xl text-white/90">
              Informácie o spracúvaní osobných údajov
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Card className="p-8 shadow-lg">
          <div className="prose prose-lg max-w-none">
            <p className="lead text-gray-700">
              Ochrana osobných údajov a dát je pre spoločnosť <strong>American living s. r. o.</strong>, so sídlom Hlavná 348/86, Svätý Peter 946 57, <strong>IČO: 54 823 650</strong>, DIČ: 2121790671, IČ DPH SK2121790671 veľmi dôležitá a preto pri vedení našich aktivít rešpektujeme zákon o ochrane osobných údajov 18/2018 Z.z. V tejto časti Vás chceme informovať, aké údaje naša spoločnosť získava pri Vašej návšteve webovej stránky a na aké účely ich používa:
            </p>

            <h2 className="text-2xl font-bold text-primary mt-8 mb-4">Kto sme?</h2>
            <p className="text-gray-700">
              Osobné údaje poskytujete spoločnosti <strong>American living s. r. o.</strong>, so sídlom Hlavná 348/86, Svätý Peter 946 57, <strong>IČO: 54 823 650</strong>, DIČ: 2121790671, IČ DPH SK2121790671. Táto spoločnosť bude tzv. prevádzkovateľom a v ďalšom texte sa označuje ako „my" alebo „Spoločnosť". Osobné údaje získavame a spracúvame vždy v súlade s právnymi predpismi a bezpečne.
            </p>

            <h2 className="text-2xl font-bold text-primary mt-8 mb-4">Aké údaje zbierame?</h2>
            <p className="text-gray-700">
              Na marketingové účely zbierame všetky údaje podľa registračného formuláru (titul, meno a priezvisko, emailová adresa, telefónne číslo, záujem o konkrétnu ponuku, prípadne údaje z vyplneného dotazníka).
            </p>

            <h2 className="text-2xl font-bold text-primary mt-8 mb-4">
              Načo a na akom právnom základe zbierame údaje, je to povinné?
            </h2>
            <p className="text-gray-700 mb-3">
              Ak ste nám udelili súhlas so zaradením osobných údajov do marketingového systému, použijeme ich na marketingovú ponuku a marketingovú komunikáciu s Vami prostredníctvom emailu. Súhlas je dobrovoľný.
            </p>
            <p className="text-gray-700 mb-3">
              Ak ste udelili súhlas aj na zasielanie newsletterov a ponúk, zaradili sme Vás do nášho zoznamu ľudí, ktorým ponuky rozosielame emailom. Súhlas je dobrovoľný.
            </p>
            <p className="text-gray-700 mb-3">
              Na priamy marketing sme oprávnení spracúvať Vaše údaje aj bez výslovného súhlasu, najmä ak ste nám ich udelili pri kúpe nášho tovaru, súťaži alebo špeciálnej ponuke na základe nášho oprávneného záujmu.
            </p>
            <p className="text-gray-700">
              Na právnom základe zákonnej povinnosti spracúvame v osobitnom zozname osobné údaje v rozsahu meno, priezvisko, emailová adresa a číslo telefónu tých ľudí, ktorí podali námietku proti spracúvaniu osobných údajov, aby sme zabezpečili, že nebudú opätovne zaradení do systému.
            </p>

            <h2 className="text-2xl font-bold text-primary mt-8 mb-4">Čo s údajmi robíme?</h2>
            <p className="text-gray-700 mb-3">
              Ak ste nám udelili súhlas na spracúvanie osobných údajov v našom marketingovom systéme, tieto údaje sú zaradené do systému kontaktov, ktorý má k dispozícii naše call centrum. Ak ste vyjadrili záujem o konkrétnu službu, budeme Vás telefonicky kontaktovať a informovať o možnostiach a ďalších benefitoch. Uvedenie údajov nám umožní poskytovať Vám adresné ponuky. Pokiaľ na základe komunikácie s našimi pracovníkmi požiadate o ďalšie služby alebo sprostredkovanie predaja služieb, môžu sa Vaše údaje následne zaradiť do zákazníckeho systému CRM, v ktorom spracúvame osobné údaje zákazníkov.
            </p>
            <p className="text-gray-700 mb-3">
              Súhlas na zasielanie newsletterov a ponúk využívame len na účely marketingovej komunikácie formou emailu. Tento systém nevyužívame na iné účely.
            </p>
            <p className="text-gray-700 mb-3">
              V prípade, že ste nám poskytli vaše osobné údaje so žiadosťou o vypracovania cenovej ponuky alebo nápočet materiálu, môžu byť tieto údaje predané tretej strane (zmluvnému partnerovi našej spoločnosti) za účelom sprostredkovania predaja produktov/služieb spoločnosť <strong>American living s. r. o.</strong>. Osobné údaje budú spracúvané v závislosti od technického riešenia použitého k ich získaniu od dotknutej osoby v rozsahu kontaktných údajov dotknutých, a to najmä: meno, priezvisko, titul, emailová adresa, telefónne číslo, označenie profilu na sociálnych sieťach, atď.. (<strong>„Osobné údaje"</strong>)
            </p>

            <p className="text-gray-700 mb-2">
              Naša spoločnosť bude spracúvať Osobné údaje pre marketingové a obchodné účely, čo môže spočívať najmä v:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-3 ml-4">
              <li>spravovaní obsahu webových stránok spoločnosti American living s. r. o.</li>
              <li>spracúvaní údajov z registračných formulárov či iných formulárov z webových stránok spoločnosti American living s. r. o. a ich správa, udržovanie a ukladanie</li>
              <li>jednotná správa profilov spoločnosti American living s. r. o. na sociálnych sieťach (Facebook, Instagram atď.)</li>
              <li>spracúvanie údajov obdržaných pri komunikácii cez profily sociálnych médií spoločnosti American living s. r. o.</li>
              <li>správa audiovizuálneho materiálu na webových stránkach spoločnosti American living s. r. o., a ich sociálnych sieťach či iných online platformách (napr. YouTube)</li>
              <li>zasielanie newsletterov spoločnosti American living s. r. o., jednotne ako na kontakty získané spoločnosťou, tak i na údaje získané spoločnosťou American living s. r. o.</li>
            </ul>

            <h2 className="text-2xl font-bold text-primary mt-8 mb-4">Ako dlho údaje spracúvame</h2>
            <p className="text-gray-700">
              Údaje spracúvame až kým neodvoláte svoj súhlas s poskytnutím. Údaje, ktoré spracúvame na priamy marketing bez výslovného súhlasu, spracúvame len do podania námietky proti spracúvaniu. Údaje, ktoré spracúvame na základe zákonnej povinnosti, spracúvame po celý čas trvania povinnosti.
            </p>

            <h2 className="text-2xl font-bold text-primary mt-8 mb-4">Odvolanie súhlasu</h2>
            <p className="text-gray-700">
              Ak údaje spracúvame na základe súhlasu, máte právo tento súhlas kedykoľvek odvolať. Súhlas môžete odvolať na linku, ktorý je pripojený v emailovej komunikácii, alebo emailom na adrese <a href="mailto:info@americanliving.sk" className="text-primary hover:underline">info@americanliving.sk</a> alebo oznámením zaslaným poštou na adresu Spoločnosti.
            </p>

            <h2 className="text-2xl font-bold text-primary mt-8 mb-4">Námietka</h2>
            <p className="text-gray-700 mb-3">
              Ak Vaše údaje spracúvame na priamy marketing bez Vášho súhlasu, môžete kedykoľvek proti spracúvaniu namietať. Toto právo môžete uplatniť emailom na adrese <a href="mailto:info@americanliving.sk" className="text-primary hover:underline">info@americanliving.sk</a> alebo oznámením zaslaným poštou na adresu Spoločnosti.
            </p>
            <p className="text-gray-700">
              Pokiaľ ide o iné údaje, ktoré spracúvame na základe oprávneného záujmu, máte právo kedykoľvek namietať z dôvodov týkajúcich sa Vašej konkrétnej situácie proti spracúvaniu týchto osobných údajov. Toto právo môžete uplatniť emailom na adrese <a href="mailto:info@americanliving.sk" className="text-primary hover:underline">info@americanliving.sk</a> alebo oznámením zaslaným poštou na adresu Spoločnosti.
            </p>

            <h2 className="text-2xl font-bold text-primary mt-8 mb-4">Ďalšie Vaše práva</h2>
            <p className="text-gray-700">
              Máte právo na prístup k vašim osobným údajom a na ich kópiu. Ak sú údaje nesprávne, máte právo na ich opravu. Ak sú neúplné, máte právo ich doplniť. Máte právo na obmedzenie (blokovanie) spracúvania v prípadoch určených predpismi, napríklad do ich opravy alebo počas konania o námietke. Máte právo na výmaz údajov v prípadoch, ktoré určujú predpisy (napríklad po odvolaní súhlasu, namietaní proti priamemu marketingu, pri protizákonnom spracúvaní, po uplynutí účelu spracúvania).
            </p>
            <p className="text-gray-700 mt-3">
              Ak nebudete spokojní s tým, ako sme reagovali na uplatnenie Vašich práv alebo ak si myslíte, že Vaše údaje spracúvame v rozpore s predpismi máte právo podať sťažnosť na Úrade na ochranu osobných údajov Slovenskej republiky.
            </p>
          </div>

          {/* Contact Info */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-xl font-bold text-primary mb-4">Kontaktné údaje</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-gray-900">Adresa</p>
                  <p className="text-gray-600">Hlavná 348/86<br/>Svätý Peter 946 57</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-gray-900">Email</p>
                  <a href="mailto:info@americanliving.sk" className="text-primary hover:underline">
                    info@americanliving.sk
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}