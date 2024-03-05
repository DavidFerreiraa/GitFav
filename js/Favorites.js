import { GithubUser } from "./GithubUser.js";

export class Favorites {
    constructor(root){
        this.root = document.querySelector(root);
        this.tbody = this.root.querySelector("table tbody");

        this.load();
    }

    async add(username){
        try {
            const userExists = this.entries.find(entry => {
                return (entry.login).toLowerCase() === username.toLowerCase();
            })

            if (userExists) {
                throw new Error("Usuário já existe");
            }

            const githubUser = await GithubUser.search(username);

            if (!githubUser.login) {
                throw new Error("Usuário não encontrado");
            }

            this.entries = [githubUser, ...this.entries];
            this.update();
            this.save();

        } catch (error) {
            alert(error.message)
        }
    }

    load(){
        this.entries = JSON.parse(localStorage.getItem("@github-favorites:")) || [];
    }

    save() {
        localStorage.setItem("@github-favorites:", JSON.stringify(this.entries))
    }

    delete(user) {
        this.entries = this.entries.filter((entry) => {
            return entry.login !== user.login;
        })
        this.update();
        this.save();
    }
}

export class FavoritesView extends Favorites {
    constructor(root){
        super(root);
        this.update();
        this.onAdd();
    }

    onAdd(){
        const addBtn = this.root.querySelector(".search button");
        const input = this.root.querySelector(".search input");
        addBtn.addEventListener("click", () => {
            this.sendInputValue(input);
        });
        input.onkeypress = (event) => {
            if (event.key == "Enter") {
                this.sendInputValue(input);
            }
        }
    }

    update() {
        this.removeAllTr();
        this.entries.forEach( user => {
            const tr = this.createTr();

            tr.querySelector(".user img").src = `https://github.com/${user.login}.png`;
            tr.querySelector(".user img").alt = `Imagem de ${user.name}`;
            tr.querySelector(".user a").href = `https://github.com/${user.login}`;
            tr.querySelector(".user p").textContent = user.name;
            tr.querySelector(".user span").textContent = user.login;
            tr.querySelector(".repositories").textContent = user.public_repos;
            tr.querySelector(".followers").textContent = user.followers;

            tr.querySelector(".remove").addEventListener("click", () => {
                confirm("Tem certezxa que deseja deletar essa linha?") && this.delete(user);
            })

            this.tbody.append(tr);
        })
    }

    createTr(){
        const tr = document.createElement("tr");

        const content = `
        <td class="user">
            <img />
            <a target="_blank">
                <p></p>
                <span></span>
            </a>
        </td>
        <td class="repositories"></td>
        <td class="followers"></td>
        <td><button class="remove">&times;</button></td>
        `

        tr.innerHTML = content;

        return tr;
    }

    removeAllTr(){
        this.tbody.querySelectorAll("tr").forEach((tr) => {
            tr.remove();
        })
    }

    sendInputValue(input){
        this.add(input.value);
        this.update();
        input.value = "";
    }
}
