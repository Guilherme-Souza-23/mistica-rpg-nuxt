<template>
  <div>
    <header class="container">
      <nav>
        <NuxtLink to="/index">Início</NuxtLink>
        <NuxtLink to="/sobre">Sobre</NuxtLink>
        <NuxtLink to="/personagens/1">Personagens</NuxtLink>
        <NuxtLink to="/recompensas">Recompensas</NuxtLink>
      </nav>
    </header>

    <main class="container">
      <NuxtPage />
    </main>
  </div>
</template>

<style>
/* Estilos globais para o layout principal.
   Eles usarão as variáveis do seu main.css que já está sendo importado. */

header {
  line-height: 1.5;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--cor-borda);
  margin-bottom: 2rem;
}
nav {
  width: 100%;
  font-size: 1.1rem;
  text-align: center;
  margin-top: 1rem;
}
nav a {
  display: inline-block;
  padding: 0 1rem;
  color: var(--cor-texto-claro);
  text-decoration: none;
}
/* Esta classe é aplicada automaticamente pelo Nuxt ao link da página ativa */
nav a.router-link-exact-active {
  color: var(--cor-primaria);
  font-weight: bold;
}
</style>