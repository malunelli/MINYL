
/* =========================================
   MINYL RECORDS
   JavaScript principal
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    // CHAVES DO LOCALSTORAGE
    const STORAGE_USERS = "minylUsuarios";
    const STORAGE_FAVORITES = "minylFavoritos";
    const STORAGE_ACCOUNTS = "minylContas";


    // =====================================
    // FUNÇÕES GERAIS
    // =====================================

    function getStorage(key, defaultValue = []) {
        try {
            const data = JSON.parse(localStorage.getItem(key));
            return Array.isArray(data) ? data : defaultValue;
        } catch (error) {
            return defaultValue;
        }
    }

    function saveStorage(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    function formatDate(date) {
        return new Date(date).toLocaleString("pt-BR");
    }


    
    // =====================================
    // CADASTRO E LOGIN DE USUÁRIO
    // =====================================

    const registerForm = document.querySelector("#registerForm");
    const loginForm = document.querySelector("#loginForm");

    // CADASTRAR CONTA

    if (registerForm) {

        registerForm.addEventListener("submit", (event) => {

            event.preventDefault();

            const name = registerForm.querySelector('[name="nome"]');
            const email = registerForm.querySelector('[name="email"]');
            const password = registerForm.querySelector('[name="senha"]');
            const confirmPassword = registerForm.querySelector('[name="confirmarSenha"]');

            if (!name || !email || !password || !confirmPassword) {
                alert("Não foi possível localizar todos os campos.");
                return;
            }

            if (password.value !== confirmPassword.value) {
                alert("As senhas não são iguais. Confira e tente novamente.");
                confirmPassword.focus();
                return;
            }

            const accounts = getStorage(STORAGE_ACCOUNTS);

            const normalizedEmail = email.value.trim().toLowerCase();

            const emailExists = accounts.some(
                (account) => account.email === normalizedEmail
            );

            if (emailExists) {
                alert("Este e-mail já possui uma conta cadastrada.");
                email.focus();
                return;
            }

            const newAccount = {
                id: Date.now().toString(),
                nome: name.value.trim(),
                email: normalizedEmail,
                senha: password.value
            };

            accounts.push(newAccount);

            saveStorage(STORAGE_ACCOUNTS, accounts);

            alert("Conta criada com sucesso! Agora você pode fazer login.");

            window.location.href = "login.html";

        });

    }


    // FAZER LOGIN

    if (loginForm) {

        loginForm.addEventListener("submit", (event) => {

            event.preventDefault();

            const email = loginForm.querySelector('[name="email"]');
            const password = loginForm.querySelector('[name="senha"]');

            if (!email || !password) {
                alert("Não foi possível localizar os campos de login.");
                return;
            }

            const accounts = getStorage(STORAGE_ACCOUNTS);

            const normalizedEmail = email.value.trim().toLowerCase();

            const account = accounts.find(
                (item) =>
                    item.email === normalizedEmail &&
                    item.senha === password.value
            );

            if (!account) {
                alert("E-mail ou senha incorretos. Tente novamente.");
                return;
            }

            sessionStorage.setItem(
                "minylUsuarioLogado",
                JSON.stringify({
                    nome: account.nome,
                    email: account.email
                })
            );

            alert("Login realizado! Bem-vindo(a) à MINYL.");

            window.location.href = "index.html";

        });

    }


    // =====================================
    // ÁREA ADMINISTRATIVA
    // CADASTRO, LISTAGEM E EXCLUSÃO
    // =====================================

    const adminForm =
        document.querySelector("#adminForm") ||
        document.querySelector(".admin-form");

    const userList =
        document.querySelector("#userList") ||
        document.querySelector(".user-list");

    const searchInput =
        document.querySelector("#adminSearch") ||
        document.querySelector(".admin-search");

    const deleteAllButton =
        document.querySelector("#deleteAll") ||
        document.querySelector(".delete-all");

    let users = getStorage(STORAGE_USERS);


   
    function updateAdminStats() {
        const contador = document.querySelector(".dashboard-stat strong");

        if (contador) {
            contador.textContent = users.length;
        }
    }



    function renderUsers(list = users) {

        if (!userList) return;

        userList.replaceChildren();

        if (list.length === 0) {

            const emptyMessage = document.createElement("li");

            emptyMessage.textContent = users.length === 0
                ? "Nenhum usuário cadastrado ainda."
                : "Nenhum resultado encontrado.";

            userList.appendChild(emptyMessage);

            updateAdminStats();
            return;
        }


        list.forEach((user) => {

            const item = document.createElement("li");

            const information = document.createElement("div");

            const name = document.createElement("strong");
            name.textContent = user.nome;

            const email = document.createElement("p");
            email.textContent = user.email;

            const date = document.createElement("small");
            date.textContent = "Cadastro: " + formatDate(user.data);

            information.append(name, email, date);


            const deleteButton = document.createElement("button");

            deleteButton.type = "button";
            deleteButton.textContent = "Excluir";

            deleteButton.addEventListener("click", () => {

                const confirmed = confirm(
                    `Deseja excluir o cadastro de ${user.nome}?`
                );

                if (!confirmed) return;

                users = users.filter((item) => item.id !== user.id);

                saveStorage(STORAGE_USERS, users);

                renderUsers();

            });


            item.append(information, deleteButton);

            userList.appendChild(item);

        });

        updateAdminStats();

    }


    if (adminForm) {

        adminForm.addEventListener("submit", (event) => {

            event.preventDefault();

            const nameInput = adminForm.querySelector(
                'input[name="nome"], input[name="name"], input[type="text"]'
            );

            const emailInput = adminForm.querySelector(
                'input[name="email"], input[type="email"]'
            );

            if (!nameInput || !emailInput) {
                alert("Não foi possível localizar os campos de nome e e-mail.");
                return;
            }

            const nome = nameInput.value.trim();
            const email = emailInput.value.trim();

            if (!nome || !email) {
                alert("Preencha o nome e o e-mail.");
                return;
            }

            const emailJaExiste = users.some(
                (user) => user.email.toLowerCase() === email.toLowerCase()
            );

            if (emailJaExiste) {
                alert("Este e-mail já está cadastrado.");
                emailInput.focus();
                return;
            }


            const newUser = {
                id: Date.now().toString(),
                nome: nome,
                email: email,
                data: new Date().toISOString()
            };

            users.push(newUser);

            saveStorage(STORAGE_USERS, users);

            adminForm.reset();

            renderUsers();

            alert("Usuário cadastrado com sucesso!");

        });

    }


    // PESQUISAR USUÁRIOS

    if (searchInput) {

        searchInput.addEventListener("input", () => {

            const search = searchInput.value.trim().toLowerCase();

            const filteredUsers = users.filter((user) => {

                return (
                    user.nome.toLowerCase().includes(search) ||
                    user.email.toLowerCase().includes(search)
                );

            });

            renderUsers(filteredUsers);

        });

    }


    // EXCLUIR TODOS OS USUÁRIOS

    if (deleteAllButton) {

        deleteAllButton.addEventListener("click", () => {

            if (users.length === 0) {
                alert("Não existem usuários para excluir.");
                return;
            }

            const confirmed = confirm(
                "Tem certeza que deseja excluir todos os usuários?"
            );

            if (!confirmed) return;

            users = [];

            saveStorage(STORAGE_USERS, users);

            if (searchInput) {
                searchInput.value = "";
            }

            renderUsers();

            alert("Todos os usuários foram excluídos.");

        });

    }


    // MOSTRAR USUÁRIOS AO ABRIR A PÁGINA

    if (userList) {
        renderUsers();
    }


    // =====================================
    // FAVORITOS
    // =====================================

    function getFavorites() {
        return getStorage(STORAGE_FAVORITES);
    }

    function saveFavorites(favorites) {
        saveStorage(STORAGE_FAVORITES, favorites);
    }


    // ADICIONAR OU REMOVER FAVORITO
    // Os botões dos discos podem usar:
    // data-favorite="nome-do-disco"

    document.querySelectorAll("[data-favorite]").forEach((button) => {

        const album = button.dataset.favorite;

        const favorites = getFavorites();

        const isFavorite = favorites.includes(album);

        button.classList.toggle("is-favorite", isFavorite);

        button.setAttribute("aria-pressed", String(isFavorite));

        if (isFavorite) {
            button.textContent = "♥";
        }


        button.addEventListener("click", () => {

            let currentFavorites = getFavorites();

            if (currentFavorites.includes(album)) {

                currentFavorites = currentFavorites.filter(
                    (item) => item !== album
                );

                button.classList.remove("is-favorite");
                button.textContent = "♡";
                button.setAttribute("aria-pressed", "false");

            } else {

                currentFavorites.push(album);

                button.classList.add("is-favorite");
                button.textContent = "♥";
                button.setAttribute("aria-pressed", "true");

            }

            saveFavorites(currentFavorites);

        });

    });


    
    // =====================================
    // EXIBIR FAVORITOS
    // =====================================

    const favoritesList = document.querySelector("#favoritesList");

    if (favoritesList) {

        const albumArtists = {
            "Abbey Road": "The Beatles",
            "1989": "Taylor Swift",
            "Elis & Tom": "Elis Regina e Tom Jobim",
            "Rumours": "Fleetwood Mac",
            "AM": "Arctic Monkeys",
            "Future Nostalgia": "Dua Lipa",
            "Kind of Blue": "Miles Davis",
            "Clube da Esquina": "Milton Nascimento e Lô Borges"
        };

        function renderFavorites() {

            const favorites = getFavorites();

            favoritesList.replaceChildren();

            if (favorites.length === 0) {

                const empty = document.createElement("div");
                empty.className = "favorites-empty";

                const symbol = document.createElement("span");
                symbol.className = "empty-icon";
                symbol.textContent = "♡";

                const title = document.createElement("h3");
                title.textContent = "Your collection is waiting.";

                const description = document.createElement("p");
                description.textContent =
                    "Você ainda não salvou nenhum disco. Explore nossa loja e encontre músicas para guardar.";

                const link = document.createElement("a");
                link.href = "catalogo.html";
                link.textContent = "Explore the records";

                empty.append(symbol, title, description, link);
                favoritesList.appendChild(empty);

                return;
            }

            favorites.forEach((album) => {

                const card = document.createElement("article");
                card.className = "favorite-card";

                const artwork = document.createElement("div");
                artwork.className = "favorite-artwork";

                const disc = document.createElement("div");
                disc.className = "favorite-vinyl";

                const center = document.createElement("div");
                center.className = "favorite-vinyl-center";

                const centerLabel = document.createElement("span");
                centerLabel.textContent = "M";

                center.appendChild(centerLabel);
                disc.appendChild(center);
                artwork.appendChild(disc);

                const details = document.createElement("div");
                details.className = "favorite-details";

                const label = document.createElement("span");
                label.className = "favorite-label";
                label.textContent = "YOUR SAVED RECORD";

                const name = document.createElement("h3");
                name.textContent = album;

                const artist = document.createElement("p");
                artist.textContent = albumArtists[album] || "MINYL Record Collection";

                const removeButton = document.createElement("button");
                removeButton.type = "button";
                removeButton.className = "favorite-remove";
                removeButton.textContent = "♡ Remove from favorites";

                removeButton.addEventListener("click", () => {

                    const updatedFavorites = getFavorites().filter(
                        (favorite) => favorite !== album
                    );

                    saveFavorites(updatedFavorites);
                    renderFavorites();

                });

                details.append(label, name, artist, removeButton);
                card.append(artwork, details);

                favoritesList.appendChild(card);

            });

        }

        renderFavorites();

    }


    // =====================================
    // CATÁLOGO: FILTRO POR CATEGORIA
    // =====================================

    const categoryButtons = document.querySelectorAll("[data-category-filter]");
    const albumCards = document.querySelectorAll("[data-category]");

    categoryButtons.forEach((button) => {

        button.addEventListener("click", () => {

            const selectedCategory = button.dataset.categoryFilter;

            categoryButtons.forEach((item) => {
                item.classList.remove("active");
            });

            button.classList.add("active");

            albumCards.forEach((card) => {

                const cardCategory = card.dataset.category;

                const shouldShow =
                    selectedCategory === "all" ||
                    cardCategory === selectedCategory;

                card.hidden = !shouldShow;

            });

        });

    });


    // =====================================
    // CATÁLOGO: FAVORITOS PELA URL
    // =====================================

    const params = new URLSearchParams(window.location.search);

    const requestedCategory = params.get("categoria");

    if (requestedCategory && categoryButtons.length > 0) {

        const matchingButton = document.querySelector(
            `[data-category-filter="${requestedCategory}"]`
        );

        if (matchingButton) {
            matchingButton.click();
        }

    }


    // =====================================
    // TESTE MUSICAL
    // =====================================

    const personalityForm = document.querySelector("#personalityForm");

    if (personalityForm) {

        personalityForm.addEventListener("submit", (event) => {

            event.preventDefault();

            const answers = new FormData(personalityForm);
            const values = Array.from(answers.values());

            if (values.length < 5) {
                alert("Responda todas as perguntas antes de continuar.");
                return;
            }

            const resultElement = document.querySelector("#testResult");
            const resultTitle = document.querySelector("#resultTitle");
            const resultDescription = document.querySelector("#resultDescription");
            const testAlbum = document.querySelector("#testAlbum");

            if (!resultElement || !resultTitle || !resultDescription || !testAlbum) {
                return;
            }

            const scores = {};

            values.forEach((answer) => {
                scores[answer] = (scores[answer] || 0) + 1;
            });

            const result = Object.entries(scores).sort(
                (a, b) => b[1] - a[1]
            )[0][0];

            const recommendations = {
                rock: {
                    title: "Rock is your thing!",
                    description: "Você tem personalidade forte, gosta de energia e não tem medo de ser diferente. Seu estilo combina com guitarras marcantes e clássicos inesquecíveis.",
                    album: "Abbey Road — The Beatles"
                },

                pop: {
                    title: "Pop lover!",
                    description: "Você é espontâneo(a), gosta de novidades e sabe aproveitar cada momento. Sua trilha sonora tem refrões contagiantes e muita personalidade.",
                    album: "1989 — Taylor Swift"
                },

                mpb: {
                    title: "Brazilian soul!",
                    description: "Você é uma pessoa sensível, valoriza sentimentos e encontra beleza nos pequenos detalhes. Música para você também é poesia.",
                    album: "Elis & Tom — Elis Regina e Tom Jobim"
                },

                indie: {
                    title: "Indie mood!",
                    description: "Você tem um espírito criativo, gosta de descobrir coisas novas e prefere seguir seu próprio caminho. O diferente chama sua atenção.",
                    album: "AM — Arctic Monkeys"
                },

                jazz: {
                    title: "Smooth sounds!",
                    description: "Você aprecia tranquilidade, sofisticação e momentos especiais. Gosta de músicas que criam uma atmosfera única.",
                    album: "Kind of Blue — Miles Davis"
                }
            };

            const recommendation = recommendations[result];

            if (!recommendation) {
                alert("Não foi possível calcular seu resultado. Tente novamente.");
                return;
            }

            resultTitle.textContent = recommendation.title;
            resultDescription.textContent = recommendation.description;
            testAlbum.textContent = recommendation.album;

            resultElement.style.display = "block";

            resultElement.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        });

    }


    // =====================================
    // BOTÃO DE LIMPAR FORMULÁRIO
    // =====================================

    document.querySelectorAll("[data-clear-form]").forEach((button) => {

        button.addEventListener("click", () => {

            const form = button.closest("form");

            if (form) {
                form.reset();
            }

        });

    });


    // =====================================
    // ANO AUTOMÁTICO NO RODAPÉ
    // =====================================

    document.querySelectorAll("[data-current-year]").forEach((element) => {

        element.textContent = new Date().getFullYear();

    });


    // BUSCA POR DISCO OU ARTISTA

    const albumSearch = document.querySelector("#albumSearch");

    if (albumSearch) {

        albumSearch.addEventListener("input", () => {

            const term = albumSearch.value.trim().toLowerCase();

            document.querySelectorAll(".album-card").forEach((card) => {

                const content = card.textContent.toLowerCase();

                card.hidden = !content.includes(term);

            });

        });

    }


    console.log("MINYL carregada com sucesso! ♫");

});
