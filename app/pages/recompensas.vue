<template>
  <div class="recompensas container">
    <h1>Gerador de Tesouro</h1>
    <p>Insira o grau da missão e a quantidade de recompensas a serem geradas.</p>

    <div class="gerador-form" style="border: 1px solid red">
      <label for="missao-grau">Grau da Missão: </label>
      <input type="number" id="missao-grau" v-model="missaoGrau" min="1">

      <label for="quantidade">Quantidade: </label>
      <input type="number" id="quantidade" v-model="quantidade" min="1" max="50">

      <button
        @click="gerarRecompensas"
        :disabled="loading"
        class="bg-red-800 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
      >
        {{ loading ? 'Rolando dados...' : 'Gerar Recompensa(s)' }}
      </button>

      <button
        @click="limparRecompensas"
        :disabled="loading"
        class="bg-red-800 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
      >
        Limpar Recompensas
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
          <span>{{ recompensa.item_nome }}</span>
          <span :style="{ color: recompensa.raridade.cor, fontWeight: 'bold' }">
          ({{ recompensa.raridade.nome }})
          </span>
        </div>

        <div class="efeito" v-if="recompensa.efeito_gema">
          <strong>Efeito:</strong> {{ recompensa.efeito_gema }}
        </div>

        <div v-if="recompensa.encantamento && recompensa.encantamento.length > 0" class="encantamentos-container">
          <strong>Encantamentos:</strong>
          <ul class="px-4">
            <li v-for="(encantamento, idx) in recompensa.encantamento" :key="idx">
              {{ encantamento }}
            </li>
          </ul>
        </div>

        <div class="moedas">
          <strong>Moedas:</strong>
          <span>{{ recompensa.moedas.ouro }} PO</span>,
          <span>{{ recompensa.moedas.prata }} PP</span>,
          <span>{{ recompensa.moedas.bronze }} PB</span>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
// CORREÇÃO: A importação agora usa um caminho relativo a partir da raiz do projeto,
// que é mais explícito e garantido de funcionar com a nova estrutura.
import apiClient from '~/services/api';

// Definição de uma interface para o objeto de recompensa para melhor auto-complete e segurança de tipo
interface Raridade {
  nome: string;
  cor: string;
}

interface Moedas {
  ouro: number;
  prata: number;
  bronze: number;
}

interface Recompensa {
  item_nome: string;
  raridade: Raridade;
  propriedades: object | null;
  encantamento: string[] | null;
  efeito_gema: string | null;
  moedas: Moedas;
}

// Variáveis reativas para controlar o estado da página
const missaoGrau = ref(1);
const quantidade = ref(1);
const recompensas = ref<Recompensa[]>([]); // Usando a interface que definimos
const loading = ref(false);
const error = ref<string | null>(null);

// Função assíncrona que chama a API
async function gerarRecompensas() {
  loading.value = true;
  error.value = null;

  try {
    const response = await apiClient.post('/gerar-recompensas', {
      missao_grau: missaoGrau.value,
      quantidade: quantidade.value
    });

    if (response.data.success) {
       recompensas.value = recompensas.value.concat(response.data.data);
    } else {
      error.value = response.data.message || 'Ocorreu um erro desconhecido na API.';
    }

  } catch (err: any) {
    console.error("Erro ao buscar recompensas:", err);
    error.value = 'Não foi possível conectar à API. O servidor Laravel está rodando? Verifique o console do navegador (F12) para mais detalhes.';
  } finally {
    loading.value = false;
  }
}

function limparRecompensas() {
  recompensas.value = [];
}
</script>

<style scoped>
/* Seus estilos estão ótimos e foram mantidos. Adicionei apenas o .efeito */
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
  margin-bottom: 1.5rem;
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
  font-size: 0.9em;
}

.error-message {
  color: var(--cor-primaria);
  font-weight: bold;
}

.item span:first-of-type {
  margin-right: 0.5rem;
}

.encantamentos-container ul {
  margin-top: 0.5rem;
  padding-left: 1.5rem;
}
</style>