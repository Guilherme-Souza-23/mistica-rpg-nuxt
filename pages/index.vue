

<template>
  <main class="pagina-inicial container">
    <h1>Bem-vindo à Mística RPG!</h1>
    <p>Sua nova jornada começa aqui.</p>
    <button class="cta-button">Criar Personagem</button>
  </main>
</template>

<script setup lang="ts">
</script>

<style scoped>
.pagina-inicial {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80vh;
  text-align: center;
}

/* h1 e p já herdam o estilo global, mas podemos sobrescrever se quisermos */

h1 {
  /* Usando a variável de cor que definimos! */
  color: var(--cor-primaria);
  text-shadow: 1px 1px 2px var(--cor-secundaria);
}

.cta-button {
  background-color: var(--cor-primaria);
  color: var(--cor-fundo);
  border: none;
  padding: var(--esp-2) var(--esp-4);
  font-family: var(--fonte-corpo);
  font-weight: bold;
  font-size: 1.1rem;
  border-radius: var(--raio-borda);
  cursor: pointer;
  transition: transform 0.2s ease-out;
  box-shadow: var(--sombra-caixa);
}

.cta-button:hover {
  background-color: var(--cor-destaque);
  color: var(--cor-texto-principal);
  transform: translateY(-2px);
}
</style>
