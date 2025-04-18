const sections = document.querySelectorAll("#textToConvert .subsections");
const convertBtn = document.getElementById("convertBtn");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");

let currentIndex = 0;
let isPaused = false;
let isPlaying = false;
let currentUtterance = null;
const synth = window.speechSynthesis;
let voicesReady = false;

// wait for the voices to load
function loadVoices(callback) {
    const voices = synth.getVoices();
    if (voices.length !== 0) {
        voicesReady = true;
        callback();
    } else {
        synth.addEventListener("voiceschanged", () => {
            voicesReady = true;
            callback();
        });
    }
}

function getVoice(index = 4) {
    const voices = synth.getVoices();
    return voices.length > index ? voices[index] : voices[0];
}

// Speak section
function speakSection(index) {
    if (index >= sections.length) {
        stopSpeaking();
        return;
    }

    const section = sections[index];
    const heading = section.querySelector("h2")?.textContent || "";
    const paragraphs = Array.from(section.querySelectorAll("p")).map(p => p.textContent).join(" ");
    const text = (heading + ". " + paragraphs).replace(/\[(\d+)\]/g, "reference $1");

    currentUtterance = new SpeechSynthesisUtterance(text);
    currentUtterance.voice = getVoice();

    currentUtterance.onend = () => {
        if (!isPaused) {
            currentIndex++;
            speakSection(currentIndex);
        }
    };

    synth.speak(currentUtterance);
}

// Play/pause toggle working
convertBtn.addEventListener("click", () => {
    if (isPlaying && !isPaused) {
        synth.pause();
        isPaused = true;
        convertBtn.classList.remove("fa-pause");
        convertBtn.classList.add("fa-play");
    } else if (isPaused) {
        synth.resume();
        isPaused = false;
        convertBtn.classList.remove("fa-play");
        convertBtn.classList.add("fa-pause");
    } else {
        // Playing from current section
        loadVoices(() => {
            isPlaying = true;
            isPaused = false;
            convertBtn.classList.remove("fa-play");
            convertBtn.classList.add("fa-pause");
            speakSection(currentIndex);
        });
    }
});

// Next
nextBtn.addEventListener("click", () => {
    if (currentIndex < sections.length - 1) {
        synth.cancel();
        currentIndex++;
        isPaused = false;
        isPlaying = true;
        convertBtn.classList.remove("fa-play");
        convertBtn.classList.add("fa-pause");
        speakSection(currentIndex);
    }
});

// Previous
prevBtn.addEventListener("click", () => {
    if (currentIndex > 0) {
        synth.cancel();
        currentIndex--;
        isPaused = false;
        isPlaying = true;
        convertBtn.classList.remove("fa-play");
        convertBtn.classList.add("fa-pause");
        speakSection(currentIndex);
    }
});

// Reset
function stopSpeaking() {
    synth.cancel();
    isPlaying = false;
    isPaused = false;
    convertBtn.classList.remove("fa-pause");
    convertBtn.classList.add("fa-play");
}
