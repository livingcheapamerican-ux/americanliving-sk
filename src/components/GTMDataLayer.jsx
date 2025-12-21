// GTM DataLayer Helper - Posielanie dát do Google Tag Managera pre AI analýzu
export const pushToDataLayer = (eventName, data = {}) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      timestamp: new Date().toISOString(),
      ...data
    });
  }
};

// DOM Events
export const trackDomView = (dom) => {
  pushToDataLayer('dom_view', {
    dom_id: dom.id,
    dom_nazov: dom.nazov,
    dom_vyrobca: dom.vyrobca,
    dom_typ: dom.typ_domu,
    dom_kategoria: dom.kategoria,
    dom_zakladna_cena: dom.zakladna_cena,
    dom_plocha: dom.zastavana_plocha,
    dom_izby: dom.pocet_izieb,
    dom_celorocny: dom.celorocny,
    dom_popularny: dom.popularny
  });
};

export const trackDomInteraction = (dom, action, details = {}) => {
  pushToDataLayer('dom_interaction', {
    dom_id: dom.id,
    dom_nazov: dom.nazov,
    dom_vyrobca: dom.vyrobca,
    action: action, // 'gallery_open', 'image_zoom', 'spec_view', etc.
    ...details
  });
};

// Konfigurátor Events
export const trackConfiguratorStart = (dom, konfiguraciaData) => {
  pushToDataLayer('configurator_start', {
    dom_id: dom.id,
    dom_nazov: dom.nazov,
    dom_vyrobca: dom.vyrobca,
    zakladna_cena: dom.zakladna_cena,
    konfig_data: konfiguraciaData
  });
};

export const trackConfiguratorStep = (dom, step, selections, currentPrice) => {
  pushToDataLayer('configurator_step', {
    dom_id: dom.id,
    dom_nazov: dom.nazov,
    step: step,
    selections: selections,
    current_price: currentPrice,
    price_increase: currentPrice - dom.zakladna_cena
  });
};

export const trackConfiguratorComplete = (dom, finalPrice, allSelections) => {
  pushToDataLayer('configurator_complete', {
    dom_id: dom.id,
    dom_nazov: dom.nazov,
    dom_vyrobca: dom.vyrobca,
    final_price: finalPrice,
    price_increase_percent: ((finalPrice - dom.zakladna_cena) / dom.zakladna_cena * 100).toFixed(2),
    all_selections: allSelections,
    selected_options_count: Object.keys(allSelections).length
  });
};

// Blog Events
export const trackBlogView = (blog) => {
  pushToDataLayer('blog_view', {
    blog_id: blog.id,
    blog_title: blog.title,
    blog_kategoria: blog.kategoria,
    blog_views: blog.views,
    blog_published: blog.published_date
  });
};

export const trackBlogInteraction = (blog, action, details = {}) => {
  pushToDataLayer('blog_interaction', {
    blog_id: blog.id,
    blog_title: blog.title,
    action: action, // 'scroll_complete', 'share', 'comment', etc.
    ...details
  });
};

// Search & Filter Events
export const trackSearch = (query, results, filters = {}) => {
  pushToDataLayer('search', {
    search_query: query,
    results_count: results.length,
    filters: filters,
    top_results: results.slice(0, 3).map(r => ({ id: r.id, nazov: r.nazov }))
  });
};

export const trackFilterChange = (filterType, filterValue, resultsCount) => {
  pushToDataLayer('filter_change', {
    filter_type: filterType,
    filter_value: filterValue,
    results_count: resultsCount
  });
};

// Conversion Events
export const trackDopyt = (dopyt, dom = null) => {
  pushToDataLayer('dopyt_submitted', {
    dopyt_typ: dopyt.typ_dopytu,
    dopyt_email: dopyt.email,
    dopyt_telefon: dopyt.telefon,
    dom_id: dom?.id,
    dom_nazov: dom?.nazov,
    konfiguracny_kod: dopyt.konfiguracny_kod
  });
};

export const trackCenovaPonuka = (ponuka) => {
  pushToDataLayer('cenova_ponuka_generated', {
    ponuka_id: ponuka.id,
    dom_id: ponuka.dom_id,
    final_price: ponuka.celkova_cena,
    email: ponuka.email
  });
};

// User Behavior
export const trackUserEngagement = (engagementType, data = {}) => {
  pushToDataLayer('user_engagement', {
    engagement_type: engagementType, // 'high_scroll', 'long_session', 'multiple_pages', etc.
    ...data
  });
};

// Page Navigation
export const trackPageView = (pageName, pageUrl, referrer = '') => {
  pushToDataLayer('page_view', {
    page_name: pageName,
    page_url: pageUrl,
    page_referrer: referrer,
    user_language: navigator.language
  });
};

// AI-specific comprehensive snapshot
export const pushAISnapshot = (snapshotData) => {
  pushToDataLayer('ai_snapshot', {
    snapshot_type: 'comprehensive',
    user_sessions_count: snapshotData.sessions_count,
    top_domy: snapshotData.top_domy,
    conversion_rate: snapshotData.conversion_rate,
    avg_session_duration: snapshotData.avg_session_duration,
    popular_filters: snapshotData.popular_filters,
    hot_price_range: snapshotData.hot_price_range,
    marketing_insights: snapshotData.marketing_insights
  });
};