/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AIMarketingInsights from './pages/AIMarketingInsights';
import AdminABTesting from './pages/AdminABTesting';
import AdminAnalytikaCenovychPonuk from './pages/AdminAnalytikaCenovychPonuk';
import AdminAnalyzaDomov from './pages/AdminAnalyzaDomov';
import AdminAnalyzaOdchodov from './pages/AdminAnalyzaOdchodov';
import AdminAnalyzaSessions from './pages/AdminAnalyzaSessions';
import AdminBlog from './pages/AdminBlog';
import AdminCennik from './pages/AdminCennik';
import AdminDokumenty from './pages/AdminDokumenty';
import AdminDotaciaHero from './pages/AdminDotaciaHero';
import AdminGeneratorCenovychPonuk from './pages/AdminGeneratorCenovychPonuk';
import AdminGeneratorObrazkov from './pages/AdminGeneratorObrazkov';
import AdminGenerujObrazkyBlogov from './pages/AdminGenerujObrazkyBlogov';
import AdminGoogleDrive from './pages/AdminGoogleDrive';
import AdminMigraciaFotiek from './pages/AdminMigraciaFotiek';
import AdminMigraciaObrazkov from './pages/AdminMigraciaObrazkov';
import AdminPixelSettings from './pages/AdminPixelSettings';
import AdminPixelTest from './pages/AdminPixelTest';
import AdminPrekladTicabhouseSpec from './pages/AdminPrekladTicabhouseSpec';
import AdminPrekladyBlogov from './pages/AdminPrekladyBlogov';
import AdminPrekladyDomov from './pages/AdminPrekladyDomov';
import AdminPrekladyKonfiguratora from './pages/AdminPrekladyKonfiguratora';
import AdminSEOAnalyzer from './pages/AdminSEOAnalyzer';
import AdminSEOBlog from './pages/AdminSEOBlog';
import AdminSpravaDomov from './pages/AdminSpravaDomov';
import AdminTestGemini from './pages/AdminTestGemini';
import AdminTestGeminiAuto from './pages/AdminTestGeminiAuto';
import AdminUpdateTicabHouse from './pages/AdminUpdateTicabHouse';
import AdminUploadFotiekDomov from './pages/AdminUploadFotiekDomov';
import AdminUserManagement from './pages/AdminUserManagement';
import AdminVerifikaciaUdajov from './pages/AdminVerifikaciaUdajov';
import AdminWatermark from './pages/AdminWatermark';
import AkoToFunguje from './pages/AkoToFunguje';
import AutoPrekladBlogov from './pages/AutoPrekladBlogov';
import AutoRegeneraciaPrekladov from './pages/AutoRegeneraciaPrekladov';
import AutoSEOTrigger from './pages/AutoSEOTrigger';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import DetailDomu from './pages/DetailDomu';
import Domov from './pages/Domov';
import DotaciaAmericana from './pages/DotaciaAmericana';
import FAQ from './pages/FAQ';
import GaleriaRealizacii from './pages/GaleriaRealizacii';
import GrantovaKampan from './pages/GrantovaKampan';
import Home from './pages/Home';
import InteraktivnyKonfigurator from './pages/InteraktivnyKonfigurator';
import Katalog from './pages/Katalog';
import KatalogDomkiZGor from './pages/KatalogDomkiZGor';
import KatalogMobilneDomy from './pages/KatalogMobilneDomy';
import KatalogModularneDomy from './pages/KatalogModularneDomy';
import KatalogMontovaneDomy from './pages/KatalogMontovaneDomy';
import KatalogProstoHouse from './pages/KatalogProstoHouse';
import KatalogRodinneDomy from './pages/KatalogRodinneDomy';
import KatalogTicabHouse from './pages/KatalogTicabHouse';
import Konfigurator from './pages/Konfigurator';
import Konfigurator3D from './pages/Konfigurator3D';
import KonfiguratorFlatDouble from './pages/KonfiguratorFlatDouble';
import KonfiguratorPH001 from './pages/KonfiguratorPH001';
import KonfiguratorPH002 from './pages/KonfiguratorPH002';
import KonfiguratorPH003 from './pages/KonfiguratorPH003';
import KonfiguratorPH004 from './pages/KonfiguratorPH004';
import KonfiguratorPH005 from './pages/KonfiguratorPH005';
import KonfiguratorPH006 from './pages/KonfiguratorPH006';
import KonfiguratorPH007 from './pages/KonfiguratorPH007';
import KonfiguratorPH008 from './pages/KonfiguratorPH008';
import KonfiguratorPH009 from './pages/KonfiguratorPH009';
import KonfiguratorProstoHouse from './pages/KonfiguratorProstoHouse';
import KonfiguratorTicabhouse from './pages/KonfiguratorTicabhouse';
import Kontakt from './pages/Kontakt';
import LokaciaDetail from './pages/LokaciaDetail';
import Marketing from './pages/Marketing';
import MigraciaObrazkovLyon from './pages/MigraciaObrazkovLyon';
import ModularneDomyBratislava from './pages/ModularneDomyBratislava';
import NotFound from './pages/NotFound';
import ONas from './pages/ONas';
import OdporucanieDomov from './pages/OdporucanieDomov';
import RegenerujPreklady from './pages/RegenerujPreklady';
import RegenerujPrekladyDeFrSrHrEl from './pages/RegenerujPrekladyDeFrSrHrEl';
import SEODashboard from './pages/SEODashboard';
import SEOEditor from './pages/SEOEditor';
import SocialMediaDashboard from './pages/SocialMediaDashboard';
import SrovnaniDomu from './pages/SrovnaniDomu';
import TestAnalyzaKonfiguratora from './pages/TestAnalyzaKonfiguratora';
import ZasadyOchranyOsobnychUdajov from './pages/ZasadyOchranyOsobnychUdajov';
import ZasadyPouzivaniaCookies from './pages/ZasadyPouzivaniaCookies';
import AdminIntegrationLogs from './pages/AdminIntegrationLogs';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AIMarketingInsights": AIMarketingInsights,
    "AdminABTesting": AdminABTesting,
    "AdminAnalytikaCenovychPonuk": AdminAnalytikaCenovychPonuk,
    "AdminAnalyzaDomov": AdminAnalyzaDomov,
    "AdminAnalyzaOdchodov": AdminAnalyzaOdchodov,
    "AdminAnalyzaSessions": AdminAnalyzaSessions,
    "AdminBlog": AdminBlog,
    "AdminCennik": AdminCennik,
    "AdminDokumenty": AdminDokumenty,
    "AdminDotaciaHero": AdminDotaciaHero,
    "AdminGeneratorCenovychPonuk": AdminGeneratorCenovychPonuk,
    "AdminGeneratorObrazkov": AdminGeneratorObrazkov,
    "AdminGenerujObrazkyBlogov": AdminGenerujObrazkyBlogov,
    "AdminGoogleDrive": AdminGoogleDrive,
    "AdminMigraciaFotiek": AdminMigraciaFotiek,
    "AdminMigraciaObrazkov": AdminMigraciaObrazkov,
    "AdminPixelSettings": AdminPixelSettings,
    "AdminPixelTest": AdminPixelTest,
    "AdminPrekladTicabhouseSpec": AdminPrekladTicabhouseSpec,
    "AdminPrekladyBlogov": AdminPrekladyBlogov,
    "AdminPrekladyDomov": AdminPrekladyDomov,
    "AdminPrekladyKonfiguratora": AdminPrekladyKonfiguratora,
    "AdminSEOAnalyzer": AdminSEOAnalyzer,
    "AdminSEOBlog": AdminSEOBlog,
    "AdminSpravaDomov": AdminSpravaDomov,
    "AdminTestGemini": AdminTestGemini,
    "AdminTestGeminiAuto": AdminTestGeminiAuto,
    "AdminUpdateTicabHouse": AdminUpdateTicabHouse,
    "AdminUploadFotiekDomov": AdminUploadFotiekDomov,
    "AdminUserManagement": AdminUserManagement,
    "AdminVerifikaciaUdajov": AdminVerifikaciaUdajov,
    "AdminWatermark": AdminWatermark,
    "AkoToFunguje": AkoToFunguje,
    "AutoPrekladBlogov": AutoPrekladBlogov,
    "AutoRegeneraciaPrekladov": AutoRegeneraciaPrekladov,
    "AutoSEOTrigger": AutoSEOTrigger,
    "Blog": Blog,
    "BlogDetail": BlogDetail,
    "DetailDomu": DetailDomu,
    "Domov": Domov,
    "DotaciaAmericana": DotaciaAmericana,
    "FAQ": FAQ,
    "GaleriaRealizacii": GaleriaRealizacii,
    "GrantovaKampan": GrantovaKampan,
    "Home": Home,
    "InteraktivnyKonfigurator": InteraktivnyKonfigurator,
    "Katalog": Katalog,
    "KatalogDomkiZGor": KatalogDomkiZGor,
    "KatalogMobilneDomy": KatalogMobilneDomy,
    "KatalogModularneDomy": KatalogModularneDomy,
    "KatalogMontovaneDomy": KatalogMontovaneDomy,
    "KatalogProstoHouse": KatalogProstoHouse,
    "KatalogRodinneDomy": KatalogRodinneDomy,
    "KatalogTicabHouse": KatalogTicabHouse,
    "Konfigurator": Konfigurator,
    "Konfigurator3D": Konfigurator3D,
    "KonfiguratorFlatDouble": KonfiguratorFlatDouble,
    "KonfiguratorPH001": KonfiguratorPH001,
    "KonfiguratorPH002": KonfiguratorPH002,
    "KonfiguratorPH003": KonfiguratorPH003,
    "KonfiguratorPH004": KonfiguratorPH004,
    "KonfiguratorPH005": KonfiguratorPH005,
    "KonfiguratorPH006": KonfiguratorPH006,
    "KonfiguratorPH007": KonfiguratorPH007,
    "KonfiguratorPH008": KonfiguratorPH008,
    "KonfiguratorPH009": KonfiguratorPH009,
    "KonfiguratorProstoHouse": KonfiguratorProstoHouse,
    "KonfiguratorTicabhouse": KonfiguratorTicabhouse,
    "Kontakt": Kontakt,
    "LokaciaDetail": LokaciaDetail,
    "Marketing": Marketing,
    "MigraciaObrazkovLyon": MigraciaObrazkovLyon,
    "ModularneDomyBratislava": ModularneDomyBratislava,
    "NotFound": NotFound,
    "ONas": ONas,
    "OdporucanieDomov": OdporucanieDomov,
    "RegenerujPreklady": RegenerujPreklady,
    "RegenerujPrekladyDeFrSrHrEl": RegenerujPrekladyDeFrSrHrEl,
    "SEODashboard": SEODashboard,
    "SEOEditor": SEOEditor,
    "SocialMediaDashboard": SocialMediaDashboard,
    "SrovnaniDomu": SrovnaniDomu,
    "TestAnalyzaKonfiguratora": TestAnalyzaKonfiguratora,
    "ZasadyOchranyOsobnychUdajov": ZasadyOchranyOsobnychUdajov,
    "ZasadyPouzivaniaCookies": ZasadyPouzivaniaCookies,
    "AdminIntegrationLogs": AdminIntegrationLogs,
}

export const pagesConfig = {
    mainPage: "Domov",
    Pages: PAGES,
    Layout: __Layout,
};