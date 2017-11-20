
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

// Show the Translator page action in the browser address bar.

async function initializePageAction(tab) {
    if (protocolIsApplicable(tab.url) &&
        (await userAlwaysWantsIcon() === true || await pageIsInForeignLanguage(tab.id) === true)
    ) {
        browser.pageAction.show(tab.id);
    } else {
        browser.pageAction.hide(tab.id);
    }
}



//initialized, add the page action for all tabs.
browser.tabs.query({}).then((tabs) => {
    for (tab of tabs) {
        initializePageAction(tab);
    }
});


//When a  brower tab is updated, reset the page action for that tab.
browser.tabs.onUpdated.addListener((id, changeInfo, tab) => {
    if ((typeof changeInfo.status === "string") && (changeInfo.status === "complete")) {
        initializePageAction(tab);
    }
});


// Bind clicks on the page action icon to the Extension
browser.pageAction.onClicked.addListener(injectTranslatorCode);

