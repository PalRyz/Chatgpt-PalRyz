function speakText(text) {
  const synth = window.speechSynthesis;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'id-ID';
  synth.speak(utter);
}
