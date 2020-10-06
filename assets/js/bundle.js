(() => {
    const selector = selector => document.querySelector(selector);
    const create = element => elem = document.createElement(element);

    const fetchSuccess = response => {
        if (!response.ok) throw Error(response?.statusText);
        return response.json();
    }

    const fetchError = error => {
        console.warn(error);
        alert('Ocorreu um erro na comunicação, tente novamente em breve!');
    }

    const app = selector('#app');

    const Login = create('div');
    Login.classList.add('login');

    const Logo = create('img');
    Logo.src = './assets/images/logo.svg';
    Logo.classList.add('logo');

    const Form = create('form');

    Form.onsubmit = async e => {
        e.preventDefault();
        const [email, password] = document.querySelectorAll('input');

        const { url } = await fakeAuthenticate(email.value, password.value);

        location.href = '#users';

        const users = await getDevelopersList(url);
        renderPageUsers(users);
    };

    Form.oninput = e => {
        const [email, password, button] = e.target.parentElement.children;
        (!email.validity.valid || !email.value || password.value.length <= 5)
            ? button.setAttribute('disabled', 'disabled')
            : button.removeAttribute('disabled');
    };

    Form.innerHTML = `
        <input type="email" name="email" id="email" 
            placeholder="Entre com seu e-mail" alt="Entre com seu e-mail" />
        <input type="password" name="password" id="password" minlength="6"
            placeholder="Digite sua senha supersecreta"  alt="Digite sua senha supersecreta" />
        <button name="btnLogin" id="btnLogin" disabled title="Entrar">Entrar</button>`;

    app.appendChild(Logo);
    Login.appendChild(Form);

    async function fakeAuthenticate(email, password) {
        const data = await fetch('http://www.mocky.io/v2/5dba690e3000008c00028eb6')
            .then(fetchSuccess)
            .catch(fetchError);
        const fakeJwtToken = `${btoa(email + password)}.${btoa(data?.url)}.${(new Date()).getTime() + 300000}`;
        if(data?.url) localStorage.setItem('token', fakeJwtToken);
        return data;
    }

    async function getDevelopersList(url) {
        const data = fetch(url)
            .then(fetchSuccess)
            .catch(error => {
                fetchError(error);
                localStorage.removeItem('token');
                location.reload();
            });
        return data;
    }

    function renderPageUsers(users) {
        app.classList.add('logged');
        Login.style.display = 'none';

        const Ul = create('ul');
        Ul.classList.add('container')

        users?.map(user => {            
            const paragraph = create("p");
            paragraph.innerHTML = user.login;
            
            const img = create("img");
            img.setAttribute("src", user.avatar_url);
            img.setAttribute("alt", user.login);
            
            const li = create("li");
            li.setAttribute("title", user.login);
            li.appendChild(img);
            li.appendChild(paragraph);
            Ul.appendChild(li);
        });

        app.appendChild(Ul)
    }

    // init
    (async function () {
        const rawToken = localStorage.getItem("token");
        const token = rawToken ? rawToken.split('.') : null
        if (!token || token[2] < (new Date()).getTime()) {
            localStorage.removeItem('token');
            location.href = '#login';
            app.appendChild(Login);
        } else {
            location.href = '#users';
            const users = await getDevelopersList(atob(token[1]));
            renderPageUsers(users);
        }
    })()
})()