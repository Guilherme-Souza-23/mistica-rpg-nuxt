<template>
  <div>
    <div class="about container">
      <h1>Sobre Mística RPG</h1>
      <div class="content-box">
        <p>Mística RPG é um projeto criado para explorar os limites da imaginação em um mundo de fantasia e aventura.</p>
        <p>Este painel de 'Sobre' demonstra como os estilos globais são aplicados automaticamente. A fonte do título, do parágrafo, as cores e o espaçamento vêm diretamente do nosso arquivo <strong>main.css</strong>, sem que precisemos importar nada aqui!</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.about {
  padding-top: var(--esp-5); /* Usando variável de espaçamento global */
  padding-bottom: var(--esp-5);
}

.content-box {
  background-color: var(--cor-fundo-sutil); /* Usando variável de cor global */
  border: 1px solid var(--cor-borda); /* Usando variável de cor global */
  padding: var(--esp-4); /* Usando variável de espaçamento global */
  border-radius: var(--raio-borda); /* Usando variável global */
}

/* Note que não precisamos definir a fonte ou a cor do h1 e do p,
   eles já herdam o estilo base que definimos no main.css! */
</style>
