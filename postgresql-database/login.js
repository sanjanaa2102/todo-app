document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const authMessage = document.getElementById("authMessage");

 
  if (localStorage.getItem("token")) {
    window.location.href = "index.html"; 
  }

 
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    const res = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (res.ok) {
    
      localStorage.setItem("token", data.token);
      window.location.href = "index.html"; 
    } else {
      
      authMessage.innerText = data.error || "Login failed";
    }
  });


  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("registerUsername").value;
    const password = document.getElementById("registerPassword").value;

    const res = await fetch("http://localhost:3000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (res.ok) {
      
      authMessage.innerText = "Registration successful! Please log in.";
      registerForm.reset();
    } else {
      
      authMessage.innerText = data.error || "Registration failed";
    }
  });
});
