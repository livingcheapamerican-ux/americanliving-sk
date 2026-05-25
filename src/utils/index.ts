


export function createPageUrl(pageName: string) {
    if (pageName === 'ONas') return '/o-nas';
    if (pageName === 'FAQ') return '/faq';
    const [pathPart, queryPart] = pageName.split('?');
    const kebab = pathPart
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .toLowerCase()
        .replace(/_/g, '-')
        .replace(/ /g, '-');
    return '/' + kebab + (queryPart ? `?${queryPart}` : '');
}