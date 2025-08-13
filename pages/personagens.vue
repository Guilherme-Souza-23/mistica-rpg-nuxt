<script setup lang="ts">
import { ref, onMounted } from 'vue';
import apiClient from '@/services/api'; // Importando nosso serviço de API configurado

// Definindo um "tipo" para o nosso personagem, para o TypeScript nos ajudar
interface Personagem {
  id: number;
  nome: string;
  classe: string;
  nivel: number;
}

// Variáveis reativas: o Vue irá atualizar a tela automaticamente quando elas mudarem
const personagens = ref<Personagem[]>([]);
const loading = ref(true); // Para mostrar uma mensagem de "carregando"
const error = ref<string | null>(null); // Para armazenar mensagens de erro

// onMounted() executa este código assim que o componente é montado na tela
onMounted(async () => {
  try {
    // Faz a chamada GET para a rota /personagens da nossa API
    const response = await apiClient.get('/personagens');
    // Armazena os dados recebidos na nossa variável reativa
    personagens.value = response.data;
  } catch (err) {
    console.error('Erro ao buscar personagens:', err);
    error.value = 'Não foi possível carregar os personagens. A API Laravel está rodando?';
  } finally {
    // Para de mostrar a mensagem de "carregando"
    loading.value = false;
  }
});
</script>

<template>
  <div class="personagens container">
    <h1>Personagens de Mística RPG</h1>

    <div v-if="loading">
      <p>Carregando aventureiros...</p>
    </div>

    <div v-if="error" class="error-message">
      <p>{{ error }}</p>
    </div>

    <div v-if="!loading && !error">
      <ul v-if="personagens.length > 0" class="personagens-lista">
        <li v-for="personagem in personagens" :key="personagem.id" class="personagem-card">
          <h2>{{ personagem.nome }}</h2>
          <p><span>Classe:</span> {{ personagem.classe }}</p>
          <p><span>Nível:</span> {{ personagem.nivel }}</p>
        </li>
      </ul>
      <p v-else>Nenhum personagem encontrado. Use o DBeaver ou o Tinker para criar um!</p>
    </div>
  </div>
</template>

<style scoped>
.personagens-lista {
  list-style-type: none;
  padding: 0;
}
.personagem-card {
  background-color: var(--cor-fundo-sutil);
  border: 1px solid var(--cor-borda);
  border-radius: var(--raio-borda);
  padding: var(--esp-4);
  margin-bottom: var(--esp-3);
  box-shadow: var(--sombra-caixa);
}
.personagem-card h2 {
  margin-top: 0;
  color: var(--cor-secundaria);
}
.personagem-card span {
  font-weight: bold;
}
.error-message {
  color: var(--cor-primaria);
  font-weight: bold;
  background-color: #ffefef;
  border: 1px solid var(--cor-primaria);
  padding: var(--esp-3);
  border-radius: var(--raio-borda);
}
</style>
