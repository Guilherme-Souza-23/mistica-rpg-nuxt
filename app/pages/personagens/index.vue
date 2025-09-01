<template>
  <div class="container">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-4xl font-bold">Personagens</h1>
      <NuxtLink 
        to="/personagens/criar" 
        class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-200"
      >
        Criar Novo Personagem
      </NuxtLink>
    </div>

    <div v-if="pending">
      Carregando lista de personagens...
    </div>
    
    <div v-else-if="error" class="error-message">
      <p>Ocorreu um erro ao buscar os personagens: {{ error.message }}</p>
    </div>

    <div v-else-if="personagens && personagens.data.length > 0" class="overflow-x-auto bg-white rounded-lg shadow">
      <table class="w-full whitespace-nowrap">
        <thead class="bg-gray-100 border-b-2 border-gray-200">
          <tr>
            <th class="p-4 text-left text-sm font-semibold text-gray-600">Nome</th>
            <th class="p-4 text-left text-sm font-semibold text-gray-600">Classe</th>
            <th class="p-4 text-left text-sm font-semibold text-gray-600">Nível</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="personagem in personagens.data" :key="personagem.id" class="hover:bg-gray-50">
            <td class="p-4">
              <NuxtLink :to="`/personagens/${personagem.id}`" class="text-blue-600 hover:underline">
                {{ personagem.nome }}
              </NuxtLink>
            </td>
            <td class="p-4">{{ personagem.classe }}</td>
            <td class="p-4">{{ personagem.nivel }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else>
      <p>Nenhum personagem encontrado. <NuxtLink to="/personagens/criar" class="text-blue-600 hover:underline">Crie o primeiro!</NuxtLink></p>
    </div>

  </div>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useApi } from '~/composables/useApi';

const personagens = ref<any[]>([]);
const pending = ref(true);
const error = ref<Error | null>(null);

onMounted(async () => {
  try {
    pending.value = true;
    personagens.value = await useApi<any[]>('/personagens', 'GET');
  } catch (err: any) {
    error.value = err;
  } finally {
    pending.value = false;
  }
});
</script>

<style scoped>
/* A maior parte do estilo virá do Tailwind CSS que instalamos,
   mas podemos adicionar pequenos ajustes aqui se necessário. */
</style>