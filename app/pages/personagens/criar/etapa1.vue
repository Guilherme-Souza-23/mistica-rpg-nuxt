<template>
  <div class="container mx-auto">
    <h1 class="text-4xl font-bold mb-6">Criar Novo Personagem</h1>

    <div v-if="loading">Carregando opções...</div>
  <div v-else-if="error">{{ error.message }}</div>

    <div v-else class="bg-white p-6 rounded-lg shadow-lg">
      <h2 class="text-2xl font-bold mb-4 border-b pb-2">Etapa 1: Identidade</h2>
      <div class="grid grid-cols-4 md:grid-cols-2 gap-6 mt-4">
        
        <div class="row-span-2">
          <div class="mb-4">
            <label for="nome" class="block font-bold mb-1">Nome do Personagem</label>
            <input type="text" v-model="store.personagem.nome" id="nome" class="w-full p-2 border rounded">
          </div>
          <div class="mb-4">
            <label for="classe" class="block font-bold mb-1">Classe</label>
            <select v-model="store.personagem.classe_id" id="classe" class="w-full p-2 border rounded">
              <option disabled :value="null">Selecione uma classe</option>
              <option v-for="c in store.opcoes.classes" :key="c.id" :value="c.id">{{ c.nome }}</option>
            </select>
          </div>
          <div class="mb-4">
            <label for="raca_principal" class="block font-bold mb-1">Raça</label>
            <select v-model="store.racaPrincipalSelecionadaId" @change="store.personagem.raca_id = null" id="raca_principal" class="w-full p-2 border rounded">
              <option disabled :value="null">Selecione uma raça</option>
              <option v-for="r in store.opcoes.racas" :key="r.id" :value="r.id">{{ r.nome }}</option>
            </select>
          </div>
          <div v-if="store.racaPrincipalSelecionadaId" class="mb-4">
            <label for="sub_raca" class="block font-bold mb-1">Sub-raça</label>
            <select v-model="store.personagem.raca_id" id="sub_raca" class="w-full p-2 border rounded">
              <option disabled :value="null">Selecione uma sub-raça</option>
              <option v-for="sr in store.opcoesSubRaca" :key="sr.id" :value="sr.id">{{ sr.nome }}</option>
            </select>
          </div>
        </div>

        <div class=" bg-gray-50 p-4 rounded-lg border h-[150px]">
          <h4 class="font-bold mb-2">Descrição da Classe</h4>
          <div v-if="store.opcoes.classes">
            {{ store.opcoes.classes.find(c => c.id == store.personagem.classe_id)?.descricao }}
          </div>
        </div>

        <div class=" bg-gray-50 p-4 rounded-lg border h-[200px]">
          <h4 class="font-bold mb-2">Bônus de Raça</h4>
          <ul v-if="bonusSubRaca" class="list-disc list-inside text-sm space-y-1">
            <div v-for="(mod, index) in bonusSubRaca" :key="index">
              <li v-if="mod.tipo == 'bonus_atributo'">
                {{ mod.descricao || `Bônus de atributo: ${mod.valor} em ${mod.chave}` }}
              </li>
              <li v-if="mod.tipo == 'magia_inata'">
                {{ mod.descricao || `Magia Inata: ${mod.valor}` }}
              </li>
              <li v-if="mod.tipo == 'heranca'">
                {{ mod.descricao || `Ouro Inicial: ${mod.valor}` }}
              </li>
              <li v-if="mod.tipo == 'resistencia'">
                {{ mod.descricao || `${mod.valor}` }}
              </li>
              <li v-if="mod.tipo == 'habilidade_inata'">
                {{ mod.descricao || `Passiva: ${mod.valor}` }}
              </li>
              <li v-if="mod.tipo == 'bonus_atributo_escolha'">
                {{ mod.descricao || `Passiva: ${mod.valor}` }}
              </li>
            </div>
          </ul>
        </div>
      </div>      
      <div class="flex justify-end mt-6">
        <NuxtLink to="/personagens/criar/etapa2" >
          <button @click="clicou()"  type="button" :disabled="!store.isEtapa1Valida" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400">
            Próximo
          </button>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useCriacaoPersonagemStore } from '~/stores/criacaoPersonagem';

const store = useCriacaoPersonagemStore();
const loading = ref(true);
const error = ref<Error | null>(null);

onMounted(async () => {
   try {
    if (store.opcoes.racas.length === 0) {
      await store.buscarOpcoesIniciais();
    }
  } catch (err: any) {
    error.value = err instanceof Error ? err : new Error('Falha ao buscar opções iniciais.');
  } finally {
    loading.value = false;
  }
});

const bonusSubRaca = computed(() => {
  // Se nenhuma sub-raça foi selecionada, retorna nulo
  if (!store.personagem.raca_id) {
    return null;
  }
  
  // Encontra a raça principal primeiro
  const racaPrincipal = store.opcoes.racas.find(r => r.id === store.racaPrincipalSelecionadaId);
  if (!racaPrincipal) {
    return null;
  }

  // Encontra a sub-raça dentro da raça principal
  const subraca = racaPrincipal?.sub_racas?.find(sr => sr.id === store.personagem.raca_id);
  if (subraca && subraca.modificadores && subraca.modificadores.length > 0) {
    if (subraca.nome == "Humano (Especialista)") {
      return [
      {
        descricao: 'Receba +8 em dois atributos a sua escolha',
        // Adicionamos outras chaves para manter a estrutura do objeto, se necessário
        chave: 'escolha_especialista', 
        valor: '+8',
        tipo: 'bonus_atributo_escolha',
        id: -1, // ID Fixo para a chave do v-for
        raca_id: subraca.id,
        grupo_escolha: 1
      }]
    }
    
  }

  


  // Retorna os modificadores da sub-raça encontrada
  return subraca ? subraca.modificadores : null;
});

function clicou() {
  //store.imprimeTudo();
}

</script>