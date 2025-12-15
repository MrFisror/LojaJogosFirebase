# ⚡ Level Up Store - E-commerce com Firebase

> Projeto acadêmico desenvolvido para a disciplina de Banco de Dados II do curso de Sistemas de Informação - IF Goiano (Campus Urutaí).

![Badge Firebase](https://img.shields.io/badge/firebase-%23039BE5.svg?style=for-the-badge&logo=firebase)
![Badge JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![Badge HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![Badge CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
![Badge Bootstrap](https://img.shields.io/badge/bootstrap-%23563D7C.svg?style=for-the-badge&logo=bootstrap&logoColor=white)

## 💻 Sobre o Projeto

A **Level Up Store** é uma aplicação web que simula uma loja de jogos digitais. O objetivo principal foi implementar um sistema **CRUD completo** (Create, Read, Update, Delete) utilizando um banco de dados **NoSQL (Cloud Firestore)** e sistema de **Autenticação Real**.

Este projeto consiste no desenvolvimento de um site seguindo os requisitos propostos pela professora: (Faça um CRUD em  java, web ou android  utilizando o FIREBASE)

---

## ⚙️ Funcionalidades

### 🔐 Autenticação e Segurança
- **Login/Logout:** Sistema real via Firebase Authentication.
- **Controle de Acesso:**
  - **Visitante:** Pode visualizar jogos, buscar e adicionar ao carrinho.
  - **Cliente:** Acesso identificado ("Olá, Cliente").
  - **Admin:** Acesso exclusivo ao painel de gerenciamento (protegido por verificação de e-mail).

### 🎮 Gerenciamento de Jogos (CRUD)
- **Listagem:** Visualização de todos os jogos disponíveis.
- **Cadastro:** Adição de novos jogos (Título, Preço, Gênero).
- **Edição:** Atualização de dados de jogos existentes.
- **Exclusão:** Remoção de jogos do banco de dados.

### 🔍 Filtros e Ordenação (Banco de Dados II)
- **Busca Visual:** Filtro instantâneo por nome (Client-side).
- **Ordenação no Servidor:** Consultas otimizadas (`Query` e `OrderBy`) para filtrar por:
  - Ordem Alfabética (A-Z).
  - Menor Preço.
  - Gênero.

### 🛒 Carrinho de Compras
- Adição de itens ao carrinho (em memória).
- Cálculo automático do total.
- Remoção de itens e finalização de compra simulada.

---

## 🚀 Tecnologias Utilizadas

- **Front-end:** HTML5, CSS3.
- **Framework CSS:** Bootstrap 5.3 (Responsividade e Modais).
- **Linguagem:** JavaScript (ES6 Modules).
- **Back-end as a Service (BaaS):** Google Firebase.
  - **Firestore:** Banco de Dados NoSQL.
  - **Authentication:** Gestão de usuários.

---

## 📦 Como Rodar o Projeto

Como o projeto utiliza **Módulos JavaScript (`type="module"`)**, ele precisa ser executado através de um servidor HTTP local para evitar erros de CORS.

### Pré-requisitos
- Visual Studio Code (recomendado).
- Extensão **Live Server** instalada no VS Code.

### Passo a Passo
1. Clone este repositório:
```bash
git clone [https://github.com/SEU-USUARIO/Level-Up-Store.git](https://github.com/SEU-USUARIO/Level-Up-Store.git)