// Simple guard: redirect to login if no token
(function guardAuth() {
    const token = sessionStorage.getItem("token");
    if (!token) {
        window.location.replace("./index.html");
    }
})();

// Greeting: use remembered email if available 
(function setGreeting(){
  const el = document.getElementById("greeting");
  if (!el) return;

  try {
    const remembered = localStorage.getItem("auth:rememberEmail");
    if (remembered) {
      el.textContent = `Hello there, ${remembered}`;
      return;
    }
  } catch {}
  el.textContent = "Hello there";
})();

document.getElementById("logoutBtn")?.addEventListener("click", () => {
    sessionStorage.removeItem("token");
    window.location.replace("./index.html")
})