import { GoogleGenerativeAI } from "@google/generative-ai";
import { marked } from "marked";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = import.meta.env.VITE_SERVER_API_URL;
const IPIFY_TOKEN = import.meta.env.VITE_IPIFY_TOKEN;

const dic = {
    NAME: {
        en: "Rafini ✨️",
        fa: "✨️ رفینی",
    },
    DESC: {
        en: "Gemini Flash 2.0",
        fa: "جمنای فلش ۲",
    },
    INITIAL_RESPONSE: {
        en: "",
        fa: "سلام، چکار میتونم برات بکنم؟",
    },
    CHAT_PLACEHOLDER: {
        en: "Message Rafini",
        fa: "با رفینی گفتگو کن",
    },
    START_NEW_CHAT: {
        en: "Do you want to start a new chat?",
        fa: "یه چت دیگه شروع کنم؟",
    },
    VPN_MODE: {
        en: "VPN mode",
        fa: "مد وی‌پی‌ان",
    },
};

function i18n(obj, lang = ln) {
    console.log(obj[lang]);
    return obj[lang];
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
const textarea = document.getElementById("prompt-textarea");
let onVpn = false;

let initialHistory = [
    {
        role: "user",
        parts: [
            {
                text: "if I ask you about your name, call yourself 'Rafini, an AI chatbot powered by Google Gemini Flash 2.0'",
            },
        ],
    },
    {
        role: "user",
        parts: [
            {
                text: "اگر راجع به اسمت به فارسی سوال شد، تلفظ Rafini به فارسی میشود رَفینی",
            },
        ],
    },
];

let history = [...initialHistory];

let chat = model.startChat({
    history: history,
});

let question = "";
let response = "";
document.getElementById("question-blob").innerHTML = `<p>...</p>`;
document.getElementById("response").innerHTML = `<p>Hey, What can i do for you?</p>`;
document.getElementById("name").innerHTML = i18n(dic.NAME);
document.getElementById("description").innerHTML = i18n(dic.DESC);
document.getElementById("prompt-textarea").placeholder = i18n(
    dic.CHAT_PLACEHOLDER
);

const radios = document.querySelectorAll('input[name="lang"]');

document
    .getElementById("prompt-textarea")
    .addEventListener("keydown", (event) => {
        if (
            event.key === "Enter" &&
            !event.shiftKey &&
            window.innerWidth > 768
        ) {
            event.preventDefault();
            handleSubmit();
        }
    });

document.getElementById("new-button").addEventListener("click", () => {
    if (confirm(i18n(dic.START_NEW_CHAT))) {
        window.location.reload();
    }
});

document
    .getElementById("prompt-button")
    .addEventListener("click", handleSubmit);

//on DOM
document.addEventListener("DOMContentLoaded", async function () {
    onVpn = await isVpn();
    console.log("isOnVpn ? ", onVpn);

    if (onVpn) {
        document.getElementById("description").innerText =
            document.getElementById("description").innerText +
            ` - ${i18n(dic.VPN_MODE)}`;
    }

    textarea.addEventListener("input", adjustTextareaHeight);
    adjustTextareaHeight();

    radios.forEach((radio) => {
        if (radio.id == ln) radio.checked = true;
        radio.addEventListener("change", () => {
            if (radio.checked) {
                ln = radio.value;
                localStorage.setItem(lnKey, ln);
                onLang();
            }
        });
    });
});

function onLang() {
    document.getElementById("response").innerHTML = `<p>${i18n(
        dic.INITIAL_RESPONSE
    )}</p>`;
    document.getElementById("name").innerHTML = i18n(dic.NAME);
    document.getElementById("description").innerHTML = i18n(dic.DESC);
    document.getElementById("prompt-textarea").placeholder = i18n(
        dic.CHAT_PLACEHOLDER
    );
}

//on Submit
function handleSubmit() {
    const userPrompt = document.getElementById("prompt-textarea").value.trim();
    if (userPrompt) {
        question = document.getElementById("prompt-textarea").value;
        document.getElementById(
            "question-blob"
        ).innerHTML = `<p>${question}</p>`;

        GenerateResponse();
    }
}

//on Response
async function GenerateResponse() {
    try {
        document.getElementById("response").innerHTML = `<p>⏳️</p>`;

        console.log("Generating...");
        // Request
        if (!onVpn) {
            console.log("Remote request");
            history.push({
                role: "user",
                parts: [
                    {
                        text: question,
                    },
                ],
            });

            var payload = {
                contents: history,
            };

            fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            })
                .then((response) => response.json())
                .then((data) => {
                    response = data.response;
                    document.getElementById("response").innerHTML =
                        marked(response);

                    textarea.style.height = `19px`;
                    textarea.value = "";

                    history.push({
                        role: "model",
                        parts: [
                            {
                                text: response,
                            },
                        ],
                    });

                    console.log("Generated");
                });
        } //:
        else {
            console.log("Local request");

            let result = await chat.sendMessage(/*Stream*/ question);
            response = result.response.text();

            document.getElementById("response").innerHTML = marked(response);

            textarea.style.height = `19px`;
            textarea.value = "";

            console.log("Generated");
        }
    } catch (error) {
        console.log("error", error);
    }

    document.getElementById("question-blob").innerHTML = `<p>${question}</p>`;
}

//on TextInput
function adjustTextareaHeight() {
    textarea.style.height = "auto";
    const newHeight = Math.min(500, Math.max(19, textarea.scrollHeight - 32));
    textarea.style.height = `${newHeight}px`;
}

//on VPN
async function isVpn() {
    const myApiResponse = await fetch("https://api.ipify.org?format=json");
    const myApi = await myApiResponse.json();

    const response = await fetch(
        `https://vpnapi.io/api/${myApi.ip}?key=${IPIFY_TOKEN}`
    );
    const data = await response.json();

    return data.security?.vpn;
}
