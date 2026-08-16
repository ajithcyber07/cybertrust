from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from urllib.parse import urlparse
from datetime import datetime


app = FastAPI(
    title="CyberTrust AI",
    version="1.0"
)


# Allow your HTML/JavaScript frontend
# to communicate with this backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5501",
        "http://localhost:5501",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------
# Request models
# -----------------------------

class URLRequest(BaseModel):
    url: str


class MessageRequest(BaseModel):
    message: str


class DeepTrustRequest(BaseModel):
    sample: str


# -----------------------------
# Home
# -----------------------------

@app.get("/")
def home():
    return {
        "application": "CyberTrust AI",
        "status": "running"
    }


# -----------------------------
# Health check
# -----------------------------

@app.get("/health")
def health():
    return {
        "status": "online",
        "service": "CyberTrust AI",
        "time": datetime.now().isoformat()
    }


# -----------------------------
# Phishing URL Scanner
# -----------------------------

@app.post("/scan-url")
def scan_url(request: URLRequest):

    url = request.url.strip().lower()

    risk = 5
    reasons = []

    if not url:
        return {
            "risk_score": 100,
            "verdict": "INVALID URL",
            "reasons": ["No URL was provided."]
        }

    try:
        parsed = urlparse(url)
        domain = parsed.netloc
    except Exception:
        return {
            "risk_score": 90,
            "verdict": "INVALID URL",
            "reasons": ["URL could not be parsed."]
        }

    # HTTP instead of HTTPS
    if url.startswith("http://"):
        risk += 15
        reasons.append(
            "Website does not use HTTPS."
        )

    # Suspicious words
    keywords = [
        "login",
        "verify",
        "password",
        "account",
        "secure",
        "bank",
        "wallet",
        "payment",
        "signin",
        "credential"
    ]

    for keyword in keywords:

        if keyword in url:
            risk += 7

            reasons.append(
                f"Suspicious keyword detected: {keyword}"
            )

    # IP address instead of domain
    if domain:

        host = domain.split(":")[0]
        parts = host.split(".")

        if (
            len(parts) == 4
            and all(part.isdigit() for part in parts)
        ):
            risk += 25

            reasons.append(
                "URL uses an IP address instead of a domain."
            )

    # @ symbol
    if "@" in url:
        risk += 20

        reasons.append(
            "URL contains an @ symbol."
        )

    # Long URL
    if len(url) > 100:
        risk += 10

        reasons.append(
            "URL is unusually long."
        )

    risk = min(risk, 99)

    if risk >= 75:
        verdict = "CRITICAL RISK - POSSIBLE PHISHING"

    elif risk >= 50:
        verdict = "HIGH RISK - POSSIBLE PHISHING"

    elif risk >= 25:
        verdict = "MEDIUM RISK - REVIEW REQUIRED"

    else:
        verdict = "LOW RISK"

    if not reasons:
        reasons.append(
            "No major phishing indicators detected."
        )

    return {
        "risk_score": risk,
        "verdict": verdict,
        "reasons": reasons,
        "domain": domain
    }


# -----------------------------
# Message Analyzer
# -----------------------------

@app.post("/analyze-message")
def analyze_message(request: MessageRequest):

    message = request.message.strip()
    text = message.lower()

    risk = 5
    reasons = []

    patterns = {

        "urgent":
            (
                12,
                "Urgency-based social engineering detected."
            ),

        "immediately":
            (
                12,
                "Pressure tactics detected."
            ),

        "otp":
            (
                15,
                "Message references an OTP."
            ),

        "password":
            (
                15,
                "Message references password credentials."
            ),

        "click here":
            (
                15,
                "Suspicious call-to-action detected."
            ),

        "verify your account":
            (
                15,
                "Account verification pressure detected."
            ),

        "account suspended":
            (
                15,
                "Threat-based account language detected."
            ),

        "prize":
            (
                15,
                "Reward-based manipulation detected."
            ),

        "winner":
            (
                15,
                "Prize manipulation detected."
            ),

        "send money":
            (
                20,
                "Potential financial manipulation detected."
            )
    }

    for keyword, values in patterns.items():

        points, explanation = values

        if keyword in text:
            risk += points
            reasons.append(explanation)

    if "http://" in text or "https://" in text:
        risk += 10
        reasons.append(
            "Message contains a URL."
        )

    risk = min(risk, 99)

    if risk >= 70:
        verdict = "HIGH RISK - LIKELY SOCIAL ENGINEERING"

    elif risk >= 40:
        verdict = "MEDIUM RISK - SUSPICIOUS MESSAGE"

    else:
        verdict = "LOW RISK"

    if not reasons:
        reasons.append(
            "No major social-engineering indicators detected."
        )

    return {
        "risk_score": risk,
        "verdict": verdict,
        "reasons": reasons
    }



# -----------------------------
# Security Report
# -----------------------------

@app.get("/report")
def report():

    phishing = 82
    media = 64
    identity_score = 91

    overall = round(
        phishing * 0.35
        + media * 0.20
        + identity_score * 0.45
    )

    if overall >= 70:
        level = "HIGH RISK"

    elif overall >= 40:
        level = "MEDIUM RISK"

    else:
        level = "LOW RISK"

    return {

        "overall_score": overall,

        "phishing_score": phishing,

        "media_score": media,

        "identity_score": identity_score,

        "risk_level": level,

        "recommendations": [

            "Enable multi-factor authentication.",

            "Avoid unknown URLs.",

            "Verify suspicious messages.",

            "Review unusual authentication activity.",

            "Validate suspicious media through trusted sources."
        ]
    }


# -----------------------------
# Start server
# -----------------------------

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8000
    )