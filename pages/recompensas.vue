<script setup lang="ts">
  import { ref } from 'vue';
  import apiClient from '@/services/api';

  const missaoGrau = ref(1);
  const quantidade = ref(1); // <-- NOVA VARIÁVEL
  const recompensas = ref<any[]>([]); // <-- MUDOU PARA ARRAY
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function gerarRecompensa() {
    loading.value = true;
    error.value = null;
    recompensas.value = []; // Limpa o array

    try {
      const response = await apiClient.post('/gerar-recompensas', {
        missao_grau: missaoGrau.value,
        quantidade: quantidade.value // <-- ENVIA A QUANTIDADE
      });

      if (response.data.success) {
        recompensas.value = response.data.data;
        console.log("Recompensas geradas:", recompensas.value);
      } else {
        error.value = response.data.message || 'Ocorreu um erro desconhecido.';
      }

    } catch (err: any) {
      // ... o bloco catch continua o mesmo ...
    } finally {
      loading.value = false;
    }
  }
</script>

<template>
  <div class="recompensas container">
    <h1>Gerador de Tesouro</h1>
    <p>Insira o grau da missão e a quantidade de recompensas a serem geradas.</p>

    <div class="gerador-form">
      <label for="missao-grau">Grau da Missão: </label>
      <input type="number" id="missao-grau" v-model="missaoGrau" min="1">

      <label for="quantidade">Quantidade:</label>
      <input type="number" id="quantidade" v-model="quantidade" min="1" max="50">

      <button @click="gerarRecompensa" :disabled="loading">
        {{ loading ? 'Rolando dados...' : 'Gerar Recompensa(s)' }}
      </button>
    </div>

    <div v-if="error" class="error-message">
      <p>{{ error }}</p>
    </div>

    <div v-if="recompensas.length > 0" class="resultados-container">
      <h3>Tesouros Encontrados!</h3>

      <div v-for="(recompensa, index) in recompensas" :key="index" class="resultado-card">
        <div class="item">
          <strong>Item: </strong>
          <span :style="{ color: recompensa.raridade.cor, fontWeight: 'bold' }">
            {{ recompensa.item_nome }} ({{ recompensa.raridade.nome }})
          </span>
        </div>

        <div v-if="recompensa.encantamento && recompensa.encantamento.length > 0" class="encantamentos-container mt-5">

          <strong>Encantamentos:</strong>
          <ul class="px-4">
            <li v-for="(encantamento, index) in recompensa.encantamento" :key="index">
              {{ encantamento }}
            </li>
          </ul>
        </div>
        <div class="encantamento" v-if="recompensa.efeito_item">
          <strong>Efeito: </strong> {{ recompensa.efeito_item }}
        </div>

        <div class="moedas">
          <strong>Moedas: </strong>
          <span>{{ recompensa.moedas.ouro }} PO</span>,
          <span>{{ recompensa.moedas.prata }} PP</span>,
          <span>{{ recompensa.moedas.bronze }} PB</span>
        </div>

        <pre v-if="recompensa.propriedades" class="propriedades"><strong>Propriedades:</strong> {{ recompensa.propriedades }}</pre>
      </div>
    </div>

  </div>
</template>

<style scoped>
.gerador-form {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: var(--cor-fundo-sutil);
  border-radius: var(--raio-borda);
}

.gerador-form input {
  padding: 0.5rem;
  width: 80px;
}

.gerador-form button {
  padding: 0.5rem 1rem;
  font-family: var(--fonte-titulo);
  font-size: 1.1rem;
  cursor: pointer;
}

.resultados-container {
  margin-top: 2rem;
}

.resultado-card {
  border: 1px solid var(--cor-borda);
  background-color: #fff;
  padding: 1.5rem;
  border-radius: var(--raio-borda);
  box-shadow: var(--sombra-caixa);
  margin-bottom: 1.5rem; /* Adiciona um espaço entre os cards */
}

.resultado-card h3 {
  margin-top: 0;
  color: var(--cor-primaria);
}

.resultado-card > div {
  margin-bottom: 0.75rem;
}

.propriedades {
  background-color: #f7f7f7;
  padding: 1rem;
  border-radius: 4px;
  white-space: pre-wrap;
  word-wrap: break-word;
  margin-top: 1rem;
}

.error-message {
  color: var(--cor-primaria);
  font-weight: bold;
}
</style>
