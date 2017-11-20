
//Returns true only if the URL's protocol is in APPLICABLE_PROTOCOLS.

function protocolIsApplicable(tabUrl) {
    const APPLICABLE_PROTOCOLS = ['http:', 'https:'];
    let url = new URL(tabUrl);
    return APPLICABLE_PROTOCOLS.includes(url.protocol);
}

//user set option to always display the page action and return to true

async function userAlwaysWantsIcon() {
    let option = await browser.storage.local.get("alwaysShowPageAction");

    if (typeof option.alwaysShowPageAction !== "boolean") {
        return false;
    } else {
        return option.alwaysShowPageAction;
    }
}

async function pageIsInForeignLanguage(tabId) {
    // Get the page's language. If not found, assume it's foreign.

    try {
        var pageLang = await browser.tabs.detectLanguage(tabId);
    } catch (err) {
        return true;
    }

    if (!pageLang || pageLang === "und") {
        return true;
    }


    pageLang = pageLang.toLowerCase();

    let navigatorLanguages = navigator.languages.map(navigatorLanguage => {
        return navigatorLanguage.toLowerCase();
    });

    // Check if the page's language accurate matches any of browser's preferred languages
    if (navigatorLanguages.includes(pageLang)) {
        return false;
    }

    // Get array of the preference  languages from the browser
    let preferenceLangtags = navigatorLanguages.filter(language => {
        return language.indexOf('-') === -1;
    });

    // If no preference  language specified in browser, the user has to removed it.
    if (preferenceLangtags.length === 0) {
        return true;
    }

    // Get page's language tag
    let pagetag = pageLang.split('-', 1)[0];

    // Look for preference  language tag match
    if (preferenceLangtags.includes(pagetag)) {
        return false;
    }

    // The page is foreign language
    return true;
}