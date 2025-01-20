import { GoogleGenerativeAI } from "@google/generative-ai";
import { marked } from "marked";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
const textarea = document.getElementById("prompt-textarea");

let initialHistory = [
    {
        role: "user",
        parts: [
            {
                text: "if I ask you about your name, call yourself 'LLM-Wrapper', an AI chatbot powered by Google Gemini Flash 2.0'",
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
document.getElementById(
    "response"
).innerHTML = `<p>Hey, What can i do for you?</p>`;

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
    if (confirm("یه چت دیگه شروع کنم؟")) {
        window.location.reload();
    }
});

document
    .getElementById("prompt-button")
    .addEventListener("click", handleSubmit);

//on DOM
document.addEventListener("DOMContentLoaded", async function () {
    textarea.addEventListener("input", adjustTextareaHeight);
    adjustTextareaHeight();
});

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

        let result = await chat.sendMessage(/*Stream*/ question);
        response = result.response.text();

        document.getElementById("response").innerHTML = marked(response);

        textarea.style.height = `19px`;
        textarea.value = "";

        console.log("Generated");
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
