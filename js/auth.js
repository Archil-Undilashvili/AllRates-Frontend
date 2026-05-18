document.addEventListener("DOMContentLoaded", () => {
    const authBtn = document.getElementById("authBtn");
    const apiOrigin = window.ALLRATES_API_ORIGIN
        || (["localhost", "127.0.0.1", ""].includes(window.location.hostname) ? "http://localhost:3000" : "https://allrates-backend-api-production.up.railway.app");
    const API_URL = `${apiOrigin}/api/auth`;

    const modalHTML = `
    <div id="authModal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.7); z-index:10000; justify-content:center; align-items:center; padding:16px; box-sizing:border-box;">
        <div style="background:var(--card-bg,#1e293b); padding:28px; border-radius:14px; width:100%; max-width:420px; box-shadow:0 18px 45px rgba(0,0,0,0.5); position:relative; border:1px solid var(--border,#334155); box-sizing:border-box;">
            <button id="closeAuthModal" type="button" style="position:absolute; top:14px; right:14px; background:none; border:none; font-size:24px; color:var(--text-muted,#94a3b8); cursor:pointer;">&times;</button>

            <div style="display:flex; gap:10px; margin-bottom:20px; border-bottom:1px solid var(--border,#334155); padding-bottom:10px;">
                <button id="tabLogin" type="button" style="flex:1; padding:10px; background:none; border:none; color:var(--primary,#38bdf8); font-weight:700; border-bottom:2px solid var(--primary,#38bdf8); cursor:pointer; font-family:inherit;">ავტორიზაცია</button>
                <button id="tabRegister" type="button" style="flex:1; padding:10px; background:none; border:none; color:var(--text-muted,#94a3b8); font-weight:700; border-bottom:2px solid transparent; cursor:pointer; font-family:inherit;">რეგისტრაცია</button>
            </div>

            <form id="loginForm" style="display:flex; flex-direction:column; gap:14px;">
                <input type="email" id="loginEmail" placeholder="ელ-ფოსტა" required autocomplete="email" style="padding:12px; border-radius:8px; border:1px solid var(--border,#334155); background:var(--bg-color,#0f172a); color:var(--text-main,#f1f5f9); font-family:inherit;">
                <input type="password" id="loginPassword" placeholder="პაროლი" required autocomplete="current-password" style="padding:12px; border-radius:8px; border:1px solid var(--border,#334155); background:var(--bg-color,#0f172a); color:var(--text-main,#f1f5f9); font-family:inherit;">
                <button type="submit" style="padding:12px; border-radius:8px; background:var(--primary,#38bdf8); color:white; font-weight:700; border:none; cursor:pointer; margin-top:6px; font-family:inherit;">შესვლა</button>
            </form>

            <form id="registerForm" style="display:none; flex-direction:column; gap:14px;">
                <input type="text" id="regName" placeholder="სახელი" required autocomplete="name" style="padding:12px; border-radius:8px; border:1px solid var(--border,#334155); background:var(--bg-color,#0f172a); color:var(--text-main,#f1f5f9); font-family:inherit;">
                <input type="email" id="regEmail" placeholder="ელ-ფოსტა" required autocomplete="email" style="padding:12px; border-radius:8px; border:1px solid var(--border,#334155); background:var(--bg-color,#0f172a); color:var(--text-main,#f1f5f9); font-family:inherit;">
                <input type="password" id="regPassword" placeholder="პაროლი (მინ. 6 სიმბოლო)" required autocomplete="new-password" minlength="6" style="padding:12px; border-radius:8px; border:1px solid var(--border,#334155); background:var(--bg-color,#0f172a); color:var(--text-main,#f1f5f9); font-family:inherit;">
                <button type="submit" style="padding:12px; border-radius:8px; background:var(--primary,#38bdf8); color:white; font-weight:700; border:none; cursor:pointer; margin-top:6px; font-family:inherit;">რეგისტრაცია</button>
            </form>

            <form id="verifyForm" style="display:none; flex-direction:column; gap:14px;">
                <p style="color:var(--text-muted,#94a3b8); font-size:14px; text-align:center; margin:0;">კოდი გამოგზავნილია თქვენს ელ-ფოსტაზე</p>
                <input type="text" id="verifyCode" placeholder="6-ნიშნა კოდი" required inputmode="numeric" style="padding:12px; border-radius:8px; border:1px solid var(--border,#334155); background:var(--bg-color,#0f172a); color:var(--text-main,#f1f5f9); text-align:center; font-size:18px; letter-spacing:5px; font-family:inherit;">
                <button type="submit" style="padding:12px; border-radius:8px; background:#10b981; color:white; font-weight:700; border:none; cursor:pointer; margin-top:6px; font-family:inherit;">დადასტურება</button>
            </form>

            <div id="authMessage" style="margin-top:15px; font-size:14px; text-align:center; color:#ef4444; display:none;"></div>
        </div>
    </div>`;

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    const authModal = document.getElementById("authModal");
    const closeAuthModal = document.getElementById("closeAuthModal");
    const tabLogin = document.getElementById("tabLogin");
    const tabRegister = document.getElementById("tabRegister");
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const verifyForm = document.getElementById("verifyForm");
    const authMessage = document.getElementById("authMessage");
    let registeredEmail = "";

    function saveSession(data) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
    }

    function goToUserPage() {
        window.location.href = "/dashboard";
    }

    function clearSession() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    }

    function showMessage(msg, isSuccess = false) {
        if (!msg) {
            authMessage.style.display = "none";
            return;
        }
        authMessage.style.display = "block";
        authMessage.style.color = isSuccess ? "#10b981" : "#ef4444";
        authMessage.textContent = msg;
    }

    function setTab(tab) {
        const isLogin = tab === "login";
        loginForm.style.display = isLogin ? "flex" : "none";
        registerForm.style.display = isLogin ? "none" : "flex";
        verifyForm.style.display = "none";
        tabLogin.style.color = isLogin ? "var(--primary,#38bdf8)" : "var(--text-muted,#94a3b8)";
        tabLogin.style.borderBottomColor = isLogin ? "var(--primary,#38bdf8)" : "transparent";
        tabRegister.style.color = isLogin ? "var(--text-muted,#94a3b8)" : "var(--primary,#38bdf8)";
        tabRegister.style.borderBottomColor = isLogin ? "transparent" : "var(--primary,#38bdf8)";
        showMessage("");
    }

    function updateAuthNav() {
        const user = JSON.parse(localStorage.getItem("user") || "null");
        if (!user || !authBtn) return;

        const personalMenu = document.createElement("div");
        personalMenu.className = "personal-space-menu";
        const displayEmail = user.email || "";
        personalMenu.innerHTML = `
            <button type="button" class="personal-space-trigger" aria-label="მომხმარებლის მენიუ" aria-expanded="false">
                <svg width="25" height="25" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"></circle>
                    <circle cx="12" cy="9" r="3" stroke="currentColor" stroke-width="2"></circle>
                    <path d="M6.8 18.4c1.2-2.5 3-3.8 5.2-3.8s4 1.3 5.2 3.8" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
                </svg>
            </button>
            <div class="personal-space-dropdown" role="menu">
                <div class="profile-menu-head">
                    <div class="profile-avatar" aria-hidden="true">
                        <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"></circle>
                            <circle cx="12" cy="9" r="3" stroke="currentColor" stroke-width="2"></circle>
                            <path d="M6.8 18.4c1.2-2.5 3-3.8 5.2-3.8s4 1.3 5.2 3.8" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
                        </svg>
                    </div>
                    <div>
                        <div class="profile-email">${displayEmail}</div>
                        <div class="profile-name">${user.name || "User"}</div>
                    </div>
                </div>
                <button type="button" class="profile-menu-item profile-email-item">${displayEmail}</button>
                <a href="/create-dashboard" class="profile-menu-item">
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="2"></rect>
                        <path d="M12 8v8M8 12h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
                    </svg>
                    <span>შექმენი დეშბორდი</span>
                </a>
                <button type="button" class="profile-menu-item">
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z" stroke="currentColor" stroke-width="2"></path>
                        <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.04.04a2 2 0 0 1-2.83 2.83l-.04-.04A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 1.55V21a2 2 0 0 1-4 0v-.05A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.88.34l-.04.04a2 2 0 0 1-2.83-2.83l.04-.04A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1H3a2 2 0 0 1 0-4h.05A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.88l-.04-.04a2 2 0 0 1 2.83-2.83l.04.04A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.55V3a2 2 0 0 1 4 0v.05A1.7 1.7 0 0 0 15 4.6a1.7 1.7 0 0 0 1.88-.34l.04-.04a2 2 0 0 1 2.83 2.83l-.04.04A1.7 1.7 0 0 0 19.4 9a1.7 1.7 0 0 0 1.55 1H21a2 2 0 0 1 0 4h-.05A1.7 1.7 0 0 0 19.4 15Z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path>
                    </svg>
                    <span>პარამეტრები</span>
                </button>
                <button type="button" class="profile-menu-item profile-logout">
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M10 6H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
                        <path d="M14 16l4-4-4-4M18 12H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                    </svg>
                    <span>გამოსვლა</span>
                </button>
            </div>
        `;
        authBtn.parentNode.insertBefore(personalMenu, authBtn);

        const menuTrigger = personalMenu.querySelector(".personal-space-trigger");
        const logoutItem = personalMenu.querySelector(".profile-logout");
        menuTrigger.addEventListener("click", (event) => {
            event.stopPropagation();
            const isOpen = personalMenu.classList.toggle("open");
            menuTrigger.setAttribute("aria-expanded", String(isOpen));
        });
        logoutItem.addEventListener("click", () => {
            clearSession();
            window.location.href = "/";
        });

        document.addEventListener("click", (event) => {
            if (!event.target.closest(".personal-space-menu")) {
                personalMenu.classList.remove("open");
                menuTrigger.setAttribute("aria-expanded", "false");
            }
        });

        authBtn.style.display = "none";

        if (user.role === "admin") {
            const adminBtn = document.createElement("a");
            adminBtn.href = "/admin";
            adminBtn.className = "nav-link auth-extra-link";
            adminBtn.textContent = "ადმინ პანელი";
            authBtn.parentNode.insertBefore(adminBtn, personalMenu);
        }
    }

    if (authBtn) {
        authBtn.addEventListener("click", () => {
            const token = localStorage.getItem("token");
            if (token) {
                clearSession();
                window.location.href = "/";
            } else {
                setTab("login");
                authModal.style.display = "flex";
            }
        });
    }

    closeAuthModal.addEventListener("click", () => {
        authModal.style.display = "none";
    });

    authModal.addEventListener("click", (event) => {
        if (event.target === authModal) authModal.style.display = "none";
    });

    tabLogin.addEventListener("click", () => setTab("login"));
    tabRegister.addEventListener("click", () => setTab("register"));

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;

        try {
            const res = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (res.ok) {
                saveSession(data);
                showMessage("წარმატებული ავტორიზაცია!", true);
                setTimeout(goToUserPage, 500);
                return;
            }

            showMessage(data.message || "ავტორიზაცია ვერ მოხერხდა");
            if ((data.message || "").includes("დაადასტუროთ")) {
                registeredEmail = email;
                setTimeout(() => {
                    loginForm.style.display = "none";
                    registerForm.style.display = "none";
                    verifyForm.style.display = "flex";
                    showMessage("შეიყვანეთ იმეილზე გამოგზავნილი კოდი", true);
                }, 800);
            }
        } catch (error) {
            showMessage("სერვერთან კავშირის შეცდომა");
        }
    });

    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const name = document.getElementById("regName").value.trim();
        const email = document.getElementById("regEmail").value.trim();
        const password = document.getElementById("regPassword").value;

        try {
            const res = await fetch(`${API_URL}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password })
            });
            const data = await res.json();

            if (!res.ok) {
                showMessage(data.message || "რეგისტრაცია ვერ მოხერხდა");
                return;
            }

            registeredEmail = email;
            if (data.token && data.user) {
                saveSession(data);
                showMessage("რეგისტრაცია წარმატებულია!", true);
                setTimeout(goToUserPage, 600);
                return;
            }

            showMessage("კოდი გამოგზავნილია ელ-ფოსტაზე", true);
            registerForm.style.display = "none";
            verifyForm.style.display = "flex";
        } catch (error) {
            showMessage("სერვერთან კავშირის შეცდომა");
        }
    });

    verifyForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const code = document.getElementById("verifyCode").value.trim();

        try {
            const res = await fetch(`${API_URL}/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: registeredEmail, code })
            });
            const data = await res.json();

            if (res.ok) {
                showMessage("ვერიფიკაცია წარმატებულია. ახლა შედით სისტემაში.", true);
                setTimeout(() => {
                    setTab("login");
                    document.getElementById("loginEmail").value = registeredEmail;
                }, 1000);
            } else {
                showMessage(data.message || "ვერიფიკაცია ვერ მოხერხდა");
            }
        } catch (error) {
            showMessage("სერვერთან კავშირის შეცდომა");
        }
    });

    updateAuthNav();
});
