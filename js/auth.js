document.addEventListener("DOMContentLoaded", () => {
    const authBtn = document.getElementById("authBtn");
    const apiOrigin = window.ALLRATES_API_ORIGIN
        || "https://allrates-backend-api-production.up.railway.app";
    const API_URL = `${apiOrigin}/api/auth`;
    const isLocalPreview = ["localhost", "127.0.0.1", ""].includes(window.location.hostname) || window.location.protocol === "file:";

    function getAuthHref(path) {
        if (!isLocalPreview) return path;
        if (path === "/") return "index.html";
        const [pagePath, hash] = path.split("#");
        const localPath = `${pagePath.replace(/^\//, "")}.html`;
        return hash ? `${localPath}#${hash}` : localPath;
    }

    const modalHTML = `
    <div id="authModal" class="auth-modal" aria-hidden="true">
        <div class="auth-card" role="dialog" aria-modal="true" aria-labelledby="authTitle">
            <button id="closeAuthModal" class="auth-close-btn" type="button" aria-label="დახურვა">&times;</button>

            <div class="auth-tabs" aria-label="ავტორიზაციის რეჟიმი">
                <button id="tabLogin" class="auth-tab-btn active" type="button">შესვლა</button>
                <button id="tabRegister" class="auth-tab-btn" type="button">რეგისტრაცია</button>
            </div>

            <h2 id="authTitle" class="auth-title">შესვლა</h2>

            <form id="loginForm" class="auth-form">
                <label class="auth-field">
                    <input type="email" id="loginEmail" placeholder="ელ-ფოსტა" required autocomplete="email">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"></circle><path d="M4 21c1.7-4.2 4.4-6.3 8-6.3s6.3 2.1 8 6.3"></path></svg>
                </label>
                <label class="auth-field">
                    <input type="password" id="loginPassword" placeholder="პაროლი" required autocomplete="current-password">
                    <button class="auth-password-toggle" type="button" data-target="loginPassword" aria-label="პაროლის ჩვენება">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.6-6 9.5-6 9.5 6 9.5 6-3.6 6-9.5 6-9.5-6-9.5-6Z"></path><circle cx="12" cy="12" r="3"></circle><path d="M4 20 20 4"></path></svg>
                    </button>
                </label>
                <div class="auth-options-row">
                    <label class="auth-remember">
                        <input type="checkbox" id="rememberMe" checked>
                        <span>დამიმახსოვრე</span>
                    </label>
                    <button id="forgotPasswordBtn" class="auth-forgot-btn" type="button">დაგავიწყდა პაროლი?</button>
                </div>
                <button type="submit" class="auth-submit-btn">შესვლა</button>
                <p class="auth-switch-copy">არ გაქვს ანგარიში? <button type="button" id="openRegisterFromLogin">რეგისტრაცია</button></p>
            </form>

            <form id="registerForm" class="auth-form" hidden>
                <label class="auth-field">
                    <input type="text" id="regName" placeholder="სახელი" required autocomplete="name">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"></circle><path d="M4 21c1.7-4.2 4.4-6.3 8-6.3s6.3 2.1 8 6.3"></path></svg>
                </label>
                <label class="auth-field">
                    <input type="email" id="regEmail" placeholder="ელ-ფოსტა" required autocomplete="email">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v14H4z"></path><path d="m4 7 8 6 8-6"></path></svg>
                </label>
                <label class="auth-field">
                    <input type="password" id="regPassword" placeholder="პაროლი" required autocomplete="new-password" minlength="6">
                    <button class="auth-password-toggle" type="button" data-target="regPassword" aria-label="პაროლის ჩვენება">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.6-6 9.5-6 9.5 6 9.5 6-3.6 6-9.5 6-9.5-6-9.5-6Z"></path><circle cx="12" cy="12" r="3"></circle><path d="M4 20 20 4"></path></svg>
                    </button>
                </label>
                <button type="submit" class="auth-submit-btn">რეგისტრაცია</button>
                <p class="auth-switch-copy">უკვე გაქვს ანგარიში? <button type="button" id="openLoginFromRegister">შესვლა</button></p>
            </form>

            <form id="verifyForm" class="auth-form auth-verify-form" hidden>
                <p class="auth-helper-text">კოდი გამოგზავნილია თქვენს ელ-ფოსტაზე</p>
                <label class="auth-field">
                    <input type="text" id="verifyCode" placeholder="6-ნიშნა კოდი" required inputmode="numeric">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"></rect><path d="M8 11V8a4 4 0 0 1 8 0v3"></path></svg>
                </label>
                <button type="submit" class="auth-submit-btn">დადასტურება</button>
            </form>

            <div id="authMessage" class="auth-message" aria-live="polite" hidden></div>
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
    const authTitle = document.getElementById("authTitle");
    const openRegisterFromLogin = document.getElementById("openRegisterFromLogin");
    const openLoginFromRegister = document.getElementById("openLoginFromRegister");
    const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");
    let registeredEmail = "";

    function getStoredUser() {
        return JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "null");
    }

    function getStoredToken() {
        return localStorage.getItem("token") || sessionStorage.getItem("token");
    }

    function saveSession(data, remember = true) {
        const targetStorage = remember ? localStorage : sessionStorage;
        const fallbackStorage = remember ? sessionStorage : localStorage;

        fallbackStorage.removeItem("token");
        fallbackStorage.removeItem("user");
        targetStorage.setItem("token", data.token);
        targetStorage.setItem("user", JSON.stringify(data.user));
    }

    function goToUserPage() {
        window.location.href = getAuthHref("/create-dashboard");
    }

    function clearSession() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
    }

    function showMessage(msg, isSuccess = false) {
        if (!msg) {
            authMessage.hidden = true;
            return;
        }
        authMessage.hidden = false;
        authMessage.style.color = isSuccess ? "#10b981" : "#ef4444";
        authMessage.textContent = msg;
    }

    function setTab(tab) {
        const isLogin = tab === "login";
        authTitle.textContent = isLogin ? "შესვლა" : "რეგისტრაცია";
        loginForm.hidden = !isLogin;
        registerForm.hidden = isLogin;
        verifyForm.hidden = true;
        tabLogin.classList.toggle("active", isLogin);
        tabRegister.classList.toggle("active", !isLogin);
        showMessage("");
    }

    function openAuthModal() {
        authModal.style.display = "flex";
        authModal.setAttribute("aria-hidden", "false");
    }

    function closeModal() {
        authModal.style.display = "none";
        authModal.setAttribute("aria-hidden", "true");
    }

    function updateAuthNav() {
        const user = getStoredUser();
        const token = getStoredToken();
        if (!user || !token || !authBtn) return;

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
                <a href="${getAuthHref("/create-dashboard")}" class="profile-menu-item profile-dashboard-link">
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
        const dashboardLink = personalMenu.querySelector(".profile-dashboard-link");
        menuTrigger.addEventListener("click", (event) => {
            event.stopPropagation();
            const isOpen = personalMenu.classList.toggle("open");
            menuTrigger.setAttribute("aria-expanded", String(isOpen));
        });
        dashboardLink.addEventListener("click", (event) => {
            event.preventDefault();
            window.location.href = getAuthHref("/create-dashboard");
        });
        logoutItem.addEventListener("click", () => {
            clearSession();
            window.location.href = getAuthHref("/");
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
            adminBtn.href = getAuthHref("/admin");
            adminBtn.className = "nav-link auth-extra-link";
            adminBtn.textContent = "ადმინ პანელი";
            authBtn.parentNode.insertBefore(adminBtn, personalMenu);
        }
    }

    if (authBtn) {
        authBtn.addEventListener("click", () => {
            const token = getStoredToken();
            if (token) {
                clearSession();
                window.location.href = getAuthHref("/");
            } else {
                setTab("login");
                openAuthModal();
            }
        });
    }

    closeAuthModal.addEventListener("click", closeModal);

    authModal.addEventListener("click", (event) => {
        if (event.target === authModal) closeModal();
    });

    tabLogin.addEventListener("click", () => setTab("login"));
    tabRegister.addEventListener("click", () => setTab("register"));
    openRegisterFromLogin.addEventListener("click", () => setTab("register"));
    openLoginFromRegister.addEventListener("click", () => setTab("login"));
    forgotPasswordBtn.addEventListener("click", () => {
        showMessage("პაროლის აღდგენა მალე დაემატება.", true);
    });

    document.querySelectorAll(".auth-password-toggle").forEach(button => {
        button.addEventListener("click", () => {
            const input = document.getElementById(button.dataset.target);
            if (!input) return;
            input.type = input.type === "password" ? "text" : "password";
            button.classList.toggle("is-visible", input.type === "text");
        });
    });

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
                saveSession(data, document.getElementById("rememberMe").checked);
                showMessage("წარმატებული ავტორიზაცია!", true);
                setTimeout(goToUserPage, 500);
                return;
            }

            showMessage(data.message || "ავტორიზაცია ვერ მოხერხდა");
            if ((data.message || "").includes("დაადასტუროთ")) {
                registeredEmail = email;
                setTimeout(() => {
                    authTitle.textContent = "დადასტურება";
                    loginForm.hidden = true;
                    registerForm.hidden = true;
                    verifyForm.hidden = false;
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
            authTitle.textContent = "დადასტურება";
            registerForm.hidden = true;
            verifyForm.hidden = false;
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
