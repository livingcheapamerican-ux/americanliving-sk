import Domov from './pages/Domov';
import Katalog from './pages/Katalog';
import DetailDomu from './pages/DetailDomu';
import Konfigurator from './pages/Konfigurator';
import Layout from './Layout.jsx';


export const PAGES = {
    "Domov": Domov,
    "Katalog": Katalog,
    "DetailDomu": DetailDomu,
    "Konfigurator": Konfigurator,
}

export const pagesConfig = {
    mainPage: "Domov",
    Pages: PAGES,
    Layout: Layout,
};