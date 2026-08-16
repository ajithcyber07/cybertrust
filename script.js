// ============================================================
// CYBERTRUST AI
// ============================================================


// ============================================================
// BACKEND CONFIGURATION
// ============================================================

const API_BASE = "http://127.0.0.1:8000";

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
// ============================================================
// GLOBAL SCORES
// ============================================================

let scores = {

    overall: 72,

    phishing: 82,

    media: 64,

    identity: 91
};


// ============================================================
// PAGE NAMES
// ============================================================

const pageNames = {

    dashboard:
        "Security Dashboard",

    phishing:
        "PhishGuard AI",

    message:
        "Message Analyzer",

    deeptrust:
        "DeepTrust",

    identity:
        "ZeroTrust Guardian",

    alerts:
        "Security Alerts",

    reports:
        "Security Report"
};


// ============================================================
// NAVIGATION
// ============================================================

function showPage(pageId, button) {

    document
        .querySelectorAll(".page")
        .forEach(page => {

            page.classList.remove(
                "active-page"
            );

        });


    const page =
        document.getElementById(pageId);


    if (page) {

        page.classList.add(
            "active-page"
        );
    }


    document
        .querySelectorAll(".nav-item")
        .forEach(item => {

            item.classList.remove(
                "active"
            );

        });


    if (button) {

        button.classList.add(
            "active"
        );
    }


    document.getElementById(
        "pageLocation"
    ).textContent =
        pageNames[pageId];
}


function openModule(pageId) {

    const buttons =
        document.querySelectorAll(
            ".nav-item"
        );


    let selectedButton = null;


    buttons.forEach(button => {

        const onclick =
            button.getAttribute(
                "onclick"
            );


        if (
            onclick &&
            onclick.includes(
                `'${pageId}'`
            )
        ) {

            selectedButton =
                button;
        }

    });


    showPage(
        pageId,
        selectedButton
    );
}


// ============================================================
// BACKEND STATUS
// ============================================================

async function checkBackend() {

    const statusText =
        document.getElementById(
            "backendStatus"
        );


    const dot =
        document.getElementById(
            "statusDot"
        );


    const badge =
        document.getElementById(
            "apiBadge"
        );


    try {

        const response =
            await fetch(
                `${API_BASE}/health`
            );


        if (!response.ok) {

            throw new Error(
                "Backend unavailable"
            );
        }


        await response.json();


        statusText.textContent =
            "Backend Online";


        dot.classList.remove(
            "offline"
        );


        dot.classList.add(
            "online"
        );


        badge.textContent =
            "API CONNECTED";


        badge.classList.add(
            "online"
        );


    } catch (error) {

        statusText.textContent =
            "Backend Offline";


        dot.classList.remove(
            "online"
        );


        dot.classList.add(
            "offline"
        );


        badge.textContent =
            "API OFFLINE";


        badge.classList.remove(
            "online"
        );
    }
}


// ============================================================
// UPDATE SCORES
// ============================================================

function updateScores() {

    scores.overall =
        Math.round(

            scores.phishing * 0.35 +

            scores.media * 0.20 +

            scores.identity * 0.45

        );


    document.getElementById(
        "overallScore"
    ).textContent =
        scores.overall;


    document.getElementById(
        "phishingScore"
    ).textContent =
        scores.phishing;


    document.getElementById(
        "mediaScore"
    ).textContent =
        scores.media;


    document.getElementById(
        "identityScore"
    ).textContent =
        scores.identity;


    document.getElementById(
        "overallProgress"
    ).style.width =
        `${scores.overall}%`;


    document.getElementById(
        "phishingProgress"
    ).style.width =
        `${scores.phishing}%`;


    document.getElementById(
        "mediaProgress"
    ).style.width =
        `${scores.media}%`;


    document.getElementById(
        "identityProgress"
    ).style.width =
        `${scores.identity}%`;


    window.updateReport = function updateReport() {
    // all your existing updateReport code
};
}


// ============================================================
// RESULT UI
// ============================================================

function createResultHTML(
    title,
    data
) {

    const score =
        Number(
            data.risk_score || 0
        );


    let level =
        "low";


    if (score >= 70) {

        level =
            "high";

    } else if (score >= 40) {

        level =
            "medium";
    }


    const reasons =
        data.reasons || [];


    let reasonsHTML =
        "";


    reasons.forEach(reason => {

        reasonsHTML += `

            <div class="reason">

                <span>
                    ⚠
                </span>

                <div>
                    ${escapeHTML(reason)}
                </div>

            </div>

        `;

    });


    return `

        <div class="result-title">

            ${escapeHTML(title)}

        </div>


        <div class="result-score ${level}">

            ${score}

            <small>
                /100
            </small>

        </div>


        <div class="verdict">

            ${escapeHTML(
                data.verdict ||
                "ANALYSIS COMPLETE"
            )}

        </div>


        ${reasonsHTML}

    `;
}


// ============================================================
// PHISHING SCANNER
// ============================================================

async function scanURL() {

    const input =
        document.getElementById(
            "urlInput"
        );


    const result =
        document.getElementById(
            "urlResult"
        );


    if (!input || !result) {
        console.error("Phishing scanner elements not found.");
        return;
    }

    const url = input.value.trim();

    result.classList.remove(
        "hidden"
    );


    result.innerHTML =
        "<p>Scanning URL...</p>";

    try {

        const response =
            await fetch(

                `${API_BASE}/scan-url`,

                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        url: url

                    })

                }

            );


        if (!response.ok) {

            throw new Error(
                "Backend request failed"
            );
        }


        const data =
            await response.json();


        result.innerHTML =
            createResultHTML(
                "URL Threat Assessment",
                data
            );


        scores.phishing =
            Number(
                data.risk_score || 0
            );


        window.updateReport();


    } catch (error) {

        const demo = {
            risk_score: 50,
            verdict: "Suspicious",
            reason: "Demo analysis unavailable"
        };

        result.innerHTML =
            createResultHTML(
                "Demo URL Assessment",
                demo
            );


        scores.phishing =
            demo.risk_score;


        updateScores();


        showMessage(
            "Backend unavailable. Demo analysis shown."
        );
    }
}


// ============================================================
// MESSAGE ANALYZER
// ============================================================

async function analyzeMessage() {

    const input =
        document.getElementById(
            "messageInput"
        );


    const result =
        document.getElementById(
            "messageResult"
        );


    const message =
        input.value.trim();


    if (!message) {

        showMessage(
            "Please enter a message."
        );

        return;
    }


    result.classList.remove(
        "hidden"
    );


    result.innerHTML =
        loadingHTML();


    try {

        const response =
            await fetch(

                `${API_BASE}/analyze-message`,

                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        message:
                            message

                    })

                }

            );


        if (!response.ok) {

            throw new Error(
                "Analysis failed"
            );
        }


        const data =
            await response.json();


        result.innerHTML =
            createResultHTML(
                "Message Threat Assessment",
                data
            );


        scores.phishing =
            Number(
                data.risk_score || 0
            );


        updateScores();


    } catch (error) {
    console.error("Phishing scanner error:", error);

    const demo = demoURLAnalysis(url);

    result.innerHTML = createResultHTML(
        "Demo URL Assessment",
        demo
    );

    scores.phishing = Number(demo.risk_score || 0);

    updateScores();

    showMessage(
        "Backend unavailable. Demo analysis shown."
    );
}


// ============================================================
// DEEPTRUST
// NO IMAGE
// ============================================================

async function runDeepTrust() {

    const input =
        document.getElementById(
            "deepTrustInput"
        );


    const result =
        document.getElementById(
            "deepTrustResult"
        );


    const content =
        input.value.trim();


    if (!content) {

        showMessage(
            "Enter a media URL or description."
        );

        return;
    }


    result.classList.remove(
        "hidden"
    );


    result.innerHTML =
        loadingHTML();


    try {

        const response =
            await fetch(

                `${API_BASE}/deeptrust`,

                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        sample:
                            content

                    })

                }

            );


        if (!response.ok) {

            throw new Error(
                "DeepTrust failed"
            );
        }


        const data =
            await response.json();


        result.innerHTML =
            createResultHTML(

                "DeepTrust Authenticity Assessment",

                data

            );


        scores.media =
            Number(
                data.risk_score || 0
            );


        updateScores();


    } catch (error) {

        const demo =
            demoDeepTrust();


        result.innerHTML =
            createResultHTML(

                "Demo DeepTrust Assessment",

                demo

            );


        scores.media =
            demo.risk_score;


        updateScores();


        showMessage(
            "Backend unavailable. Demo analysis shown."
        );
    }
}
}
window.addEventListener("DOMContentLoaded", () => {
    const button = document.getElementById("deepTrustButton");

    if (button) {
        button.addEventListener("click", () => {
            if (typeof window.runDeepTrust === "function") {
                window.runDeepTrust();
            }
        });
    }
});


// ============================================================
// IDENTITY
// ============================================================

async function checkIdentity() {

    const result =
        document.getElementById(
            "identityResult"
        );


    result.classList.remove(
        "hidden"
    );


    result.innerHTML =
        loadingHTML();


    try {

        const response =
            await fetch(
                `${API_BASE}/identity`
            );


        if (!response.ok) {

            throw new Error(
                "Identity request failed"
            );
        }


        const data =
            await response.json();


        result.innerHTML =
            identityHTML(data);


        scores.identity =
            Number(
                data.risk_score || 0
            );


        updateScores();


    } catch (error) {

        const demo =
            demoIdentity();


        result.innerHTML =
            identityHTML(demo);


        scores.identity =
            demo.risk_score;


        updateScores();


        showMessage(
            "Backend unavailable. Demo identity data shown."
        );
    }
}


function identityHTML(data) {

    let eventsHTML =
        "";


    (data.events || [])
        .forEach(event => {

            eventsHTML += `

                <div class="reason">

                    <span>
                        ⚠
                    </span>

                    <div>
                        ${escapeHTML(event)}
                    </div>

                </div>

            `;

        });


    return `

        <div class="result-title">

            Identity Risk Assessment

        </div>


        <div class="result-score high">

            ${data.risk_score}

            <small>
                /100
            </small>

        </div>


        <div class="verdict">

            ${escapeHTML(
                data.verdict
            )}

        </div>


        ${eventsHTML}

    `;
}


// ============================================================
// SECURITY REPORT
// ============================================================

async function generateReport() {
    try {

        const response =
            await fetch(
                `${API_BASE}/report`
            );


        if (!response.ok) {

            throw new Error(
                "Report unavailable"
            );
        }


        const data =
            await response.json();


        scores.overall =
            data.overall_score;


        scores.phishing =
            data.phishing_score;


        scores.media =
            data.media_score;


        scores.identity =
            data.identity_score;


        updateScores();


        showMessage(
            "Security report generated."
        );


    } catch (error) {

        updateScores();


        showMessage(
            "Demo security report generated."
        );
    }
}

window.generateReport = generateReport;

// ============================================================
// REPORT
// ============================================================

window.updateReport = function updateReport() {

    document.getElementById(
        "reportScore"
    ).textContent =
        scores.overall;


    document.getElementById(
        "reportPhishing"
    ).textContent =
        scores.phishing;


    document.getElementById(
        "reportMedia"
    ).textContent =
        scores.media;


    document.getElementById(
        "reportIdentity"
    ).textContent =
        scores.identity;


    document.getElementById(
        "reportPhishingBar"
    ).style.width =
        `${scores.phishing}%`;


    document.getElementById(
        "reportMediaBar"
    ).style.width =
        `${scores.media}%`;


    document.getElementById(
        "reportIdentityBar"
    ).style.width =
        `${scores.identity}%`;


    const level =
        document.getElementById(
            "riskLevel"
        );


    if (scores.overall >= 70) {

        level.textContent =
            "HIGH RISK";

        level.style.color =
            "var(--red)";

    } else if (scores.overall >= 40) {

        level.textContent =
            "MEDIUM RISK";

        level.style.color =
            "var(--orange)";

    } else {

        level.textContent =
            "LOW RISK";

        level.style.color =
            "var(--green)";
    }
}


// ============================================================
// LOADING
// ============================================================

function loadingHTML() {

    return `

        <div style="
            text-align:center;
            color:#8995a8;
            padding:20px;
        ">

            ⟳ Analyzing...

        </div>

    `;
}


// ============================================================
// DEMO URL ANALYSIS
// ============================================================

function demoURLAnalysis(url) {

    let risk = 10;

    const reasons = [];

    const lower =
        url.toLowerCase();


    const words = [

        "login",
        "verify",
        "secure",
        "password",
        "account",
        "update",
        "bank",
        "wallet"

    ];


    words.forEach(word => {

        if (lower.includes(word)) {

            risk += 10;

            reasons.push(
                `Suspicious keyword detected: "${word}".`
            );
        }
    });


    if (
        lower.startsWith(
            "http://"
        )
    ) {

        risk += 15;

        reasons.push(
            "Website does not use HTTPS."
        );
    }


    risk =
        Math.min(
            risk,
            99
        );


    let verdict;


    if (risk >= 70) {

        verdict =
            "HIGH RISK - POSSIBLE PHISHING";

    } else if (risk >= 40) {

        verdict =
            "MEDIUM RISK - REVIEW REQUIRED";

    } else {

        verdict =
            "LOW RISK";
    }


    return {

        risk_score: risk,

        verdict: verdict,

        reasons: reasons

    };
}


// ============================================================
// DEMO MESSAGE
// ============================================================

function demoMessageAnalysis(
    message
) {

    const lower =
        message.toLowerCase();


    let risk = 5;

    const reasons = [];


    const patterns = {

        "urgent":
            "Urgency-based social engineering detected.",

        "immediately":
            "Pressure tactics detected.",

        "otp":
            "Message references an authentication code.",

        "password":
            "Message references password credentials.",

        "click here":
            "Suspicious call-to-action detected.",

        "verify your account":
            "Account verification pressure detected.",

        "account suspended":
            "Threat-based account language detected.",

        "prize":
            "Reward-based manipulation detected.",

        "winner":
            "Prize manipulation detected."

    };


    Object.keys(patterns)
        .forEach(pattern => {

            if (
                lower.includes(pattern)
            ) {

                risk += 12;

                reasons.push(
                    patterns[pattern]
                );
            }

        });


    risk =
        Math.min(
            risk,
            99
        );


    let verdict;


    if (risk >= 70) {

        verdict =
            "HIGH RISK - LIKELY SOCIAL ENGINEERING";

    } else if (risk >= 40) {

        verdict =
            "MEDIUM RISK - SUSPICIOUS";

    } else {

        verdict =
            "LOW RISK";
    }


    return {

        risk_score: risk,

        verdict: verdict,

        reasons: reasons

    };
}


// ============================================================
// DEMO DEEPTRUST
// ============================================================

function demoDeepTrust() {

    return {

        risk_score: 64,

        verdict:
            "MEDIUM RISK - AUTHENTICITY REVIEW ADVISED",

        reasons: [

            "Content metadata analysis completed.",

            "Synthetic-media indicators require further review.",

            "Source authenticity confidence is moderate."

        ]

    };
}


// ============================================================
// DEMO IDENTITY
// ============================================================

function demoIdentity() {

    return {

        risk_score: 91,

        verdict:
            "CRITICAL - IDENTITY VERIFICATION REQUIRED",

        events: [

            "Unknown device authentication detected.",

            "Login occurred outside the normal activity window.",

            "Device fingerprint does not match trusted devices.",

            "Location anomaly detected."

        ]

    };
}


// ============================================================
// HTML ESCAPING
// ============================================================

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(text);


    return div.innerHTML;
}


// ============================================================
// TOAST
// ============================================================

function showMessage(message) {

    let toast =
        document.getElementById(
            "cyberToast"
        );


    if (!toast) {

        toast =
            document.createElement(
                "div"
            );


        toast.id =
            "cyberToast";


        toast.style.position =
            "fixed";


        toast.style.bottom =
            "25px";


        toast.style.right =
            "25px";


        toast.style.background =
            "#0b0f17";


        toast.style.border =
            "1px solid #1c2635";


        toast.style.color =
            "#00f5a0";


        toast.style.padding =
            "14px 18px";


        toast.style.borderRadius =
            "10px";


        toast.style.fontSize =
            "11px";


        toast.style.zIndex =
            "9999";


        document.body.appendChild(
            toast
        );
    }


    toast.textContent =
        message;


    setTimeout(
        () => {

            if (toast) {

                toast.remove();

            }

        },
        3500
    );
}


// ============================================================
// START
// ============================================================

function initializeApp() {
    checkBackend();
    updateScores();
 }

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeApp);
 } else {
    initializeApp();
 } 
;
async function scanURLFromBackend(url) {
    try {
        const response = await fetch(`${API_BASE}/scan-url`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                url: url
            })
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const result = await response.json();

        console.log("Phishing scan result:", result);

        return result;

    } catch (error) {
        console.error("Phishing scanner error:", error);
        return null;
    }
  }

window.addEventListener("load", () => {
    checkBackend();
    updateScores();
});