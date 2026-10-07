const dashboardShell = document.querySelector(".dash-shell");
const greetingEl = document.getElementById("greeting");
const logoutBtn = document.getElementById("logoutBtn");

function redirectToLogin() {
  window.location.replace("./login.html");
}

async function loadDasboard() {
  const token = sessionStorage.getItem("token");

  // No token means the user is not logged in.
  if (!token) {
    redirectToLogin();
    return;
  }

  try {
    // Verify the token with the backend 
    // and retrieve the authenticated user.
    const user = await apiFetch(
      "/api/users/me",
      {
        token,
      }
    );

    // Use authenticated user data instead of 
    // the remembered email from localStorage
    if (greetingEl) {
      greetingEl.textContent =
        `Hello, ${user.first_name}`;
    }

    // Only reveal the dashboard after 
    // authentication succeeds.
    if (dashboardShell) {
      dashboardShell.hidden = false;
    }

  } catch (err) {
    if (err.status === 401) {
      // Token is invalid, expired or belongs 
      // to a user that no longer exists.
      sessionStorage.removeItem("token");

      redirectToLogin();
      return;

    }


    // Don't treat server/network failures as 
    // invalid authentication
    console.error(
      "Unable to load dashboard:",
      err
    );

    if (greetingEl) {
      greetingEl.textContent =
        "Unable to load your account.";
    }

    if (dashboardShell) {
      dashboardShell.hidden = false;
    }
  }
}

logoutBtn?.addEventListener(
  "click",
  () => {
    sessionStorage.removeItem("token");
    redirectToLogin();
  }
);

loadDasboard();