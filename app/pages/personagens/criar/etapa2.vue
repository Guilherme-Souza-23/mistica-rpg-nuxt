<template>
  <div class="container mx-auto">
    <h1 class="text-4xl font-bold mb-6">Criar Novo Personagem</h1>

    <div class="bg-white p-6 rounded-lg shadow-lg">
      <h2 class="text-2xl font-bold mb-2 border-b pb-2">Etapa 2: Atributos e Habilidades</h2>

      <!-- Bônus raciais de escolha (PARTE 1)-->
      <div
        v-if="store.modificadoresDeEscolha.length > 0"
        class="my-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
      >
        <h3 class="font-bold text-lg mb-2">Bônus Raciais de Escolha</h3>
        <p class="text-sm text-gray-600 mb-4">
          Sua raça lhe concede bônus flexíveis. Faça suas escolhas abaixo.
        </p>

        <div
          v-for="(grupo, index) in store.modificadoresDeEscolha"
          :key="index"
          class="mb-2"
        >
          <label class="block font-semibold">{{ grupo[0].descricao }}</label>
          <select
            v-model="store.personagem.escolhas_raciais[grupo[0].grupo_escolha]"
            class="w-full md:w-1/2 p-2 border rounded"
          >
            <option disabled :value="undefined">Selecione um atributo</option>
            <option v-for="mod in grupo" :key="mod.chave" :value="mod.chave">
              {{ mod.chave.charAt(0).toUpperCase() + mod.chave.slice(1) }}
            </option>
          </select>
        </div>
      </div>

      <!-- Distribuição de pontos -->
      <p class="mt-4 mb-4 text-gray-600">
        Distribua 200 pontos entre os atributos (mínimo 30, máximo 50).
        <br />
        <strong
          class="text-sm"
          :class="
            store.pontosDeAtributoRestantes === 0
              ? 'text-green-600'
              : 'text-red-600'
          "
        >
          Pontos restantes: {{ store.pontosDeAtributoRestantes }}
        </strong>
      </p>

      <!-- Atributos principais -->
      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div
          class="text-sm"
          v-for="attr in ['forca', 'destreza', 'constituicao', 'inteligencia', 'carisma']"
          :key="attr"
        >
          <label
            :for="attr"
            class="block font-bold mb-1 capitalize"
          >
            {{ attr }}
            (Mod:
            {{
              store.atributosFinais[attr]
                ? Math.floor(store.atributosFinais[attr] / 4) - 10
                : "..."
            }})
          </label>

          <input
            type="number"
            v-model.number="(store.personagem as any)[attr]"
            :id="attr"
            min="30"
            max="50"
            class="w-full p-2 border rounded"
          />

          <div class="text-sm mt-1 text-gray-600">
            Bônus:
            <span class="text-green-600 font-semibold">
              +{{ store.bonusDeAtributosRaciais[attr] || 0 }}
            </span>
            | Total:
            <span class="font-bold text-black">
              {{ store.atributosFinais[attr] }}
            </span>
          </div>
        </div>

        <!-- Sorte (tratada separadamente) -->
        <div class="text-sm">
          <label for="sorte" class="block font-bold mb-1">Sorte</label>
          <input
            type="number"
            v-model.number="store.personagem.sorte"
            id="sorte"
            min="0"
            class="w-full p-2 border rounded"
          />
          <div class="text-sm mt-1 text-gray-600">
            Bônus:
            <span class="text-green-600 font-semibold">
              +{{ store.bonusDeAtributosRaciais.sorte || 0 }}
            </span>
            | Total:
            <span class="font-bold text-black">
              {{ store.atributosFinais.sorte }}
            </span>
          </div>
        </div>
      </div>

      <!-- Proficiencias (PARTE 2)-->
      <div v-if="proficiencias.length > 0" class="mt-6">
        <h3 class="text-xl font-bold mb-2 border-b pb-2">Proficiências da Classe</h3>

        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-sm">
          <div v-for="(itens, subtipo) in proficienciasPorSubtipo" :key="subtipo">
            <h4 class="font-semibold mb-2">{{ subtipo }}</h4>

            <ul v-if="itens.length" class="list-disc pl-5">
              <li v-for="item in itens" :key="item.id">{{ item.nome }}</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Habilidades (PARTE 3)-->
      <div v-if="habilidades.passivas.length > 0 || habilidades.ativas.length > 0" class="mt-6">
        <h3 class="text-xl font-bold mb-2 border-b pb-2">Habilidades da Classe</h3>

        <!-- Passivas -->
        <div v-if="habilidades.passivas.length > 0" class="mb-4">
          <h4 class="font-semibold mb-2">Passivas</h4>
          <ul class="pl-2">
            <li
              v-for="hab in habilidades.passivas"
              :key="hab.id"
              class="flex items-center space-x-2 mb-2"
            >
              <label class="cursor-pointer">
                <strong>{{ hab.habilidade.nome }}</strong>: {{ hab.habilidade.descricao }}
              </label>
            </li>
          </ul>
        </div>

        <!-- Ativas -->
        <div v-if="habilidades.ativas.length > 0">
          <h4 class="font-semibold mb-2">Ativas</h4>
          <h5 class="italic">Nível 1</h5>

          <div class="grid grid-cols-2 gap-4">
            <!-- Coluna 1: Select -->
            <div>
              <select
                v-model="habilidadeSelecionadaLocal"
                @change="selecionarHabilidade(
                  habilidades.ativas.find(h => h.habilidade.nome === habilidadeSelecionadaLocal)
                )"
                class="border rounded p-2 w-full"
              >
                <option
                  v-for="hab in habilidades.ativas"
                  :key="hab.id"
                  :value="hab.habilidade.nome"
                >
                  {{ hab.habilidade.nome }}
                </option>
              </select>
            </div>

            <!-- Coluna 2: Descrição -->
            <div class="border rounded p-4 bg-gray-50">
              <p v-if="store.habilidadeSelecionada">
                <strong>{{ store.habilidadeSelecionada.habilidade.nome }}</strong><br />
                {{ store.habilidadeSelecionada.habilidade.descricao }}
              </p>
              <p v-else class="text-gray-500 italic">
                Selecione uma habilidade para ver a descrição
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Navegação (PARTE 4)-->
      <hr class="my-6" />
      <div class="flex justify-between items-center">
        <NuxtLink to="/personagens/criar/etapa1">
          <button
            type="button"
            class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg"
          >
            Anterior
          </button>
        </NuxtLink>
        <NuxtLink to="/personagens/criar/etapa3">
          <button
            type="button"
            :disabled="!store.isEtapa2Valida"
            class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400"
          >
            Próximo
          </button>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useCriacaoPersonagemStore } from '~/stores/criacaoPersonagem';
import { storeToRefs } from 'pinia';

const store = useCriacaoPersonagemStore();
const habilidadeSelecionadaLocal = ref<any>(null);

// Usamos storeToRefs para pegar as propriedades mantendo a reatividade
const { personagem, proficiencias, habilidades } = storeToRefs(store);


watch(() => personagem.value.classe_id, (newClasseId) => {
  if (newClasseId) {
    store.carregarDadosClasse(newClasseId);
  }
});

// onMounted: Carrega os dados da classe quando a página é montada
onMounted(() => {
  if (personagem.value.classe_id) {
    store.carregarDadosClasse(personagem.value.classe_id);
  }
  if (store.habilidadeSelecionada) {
    habilidadeSelecionadaLocal.value = store.habilidadeSelecionada;
  }
  console.log("Habilidades Passivas:", habilidades.value);

});

function selecionarHabilidade(hab: any) {
  store.habilidadeSelecionada = hab;
}

const proficienciasPorSubtipo = computed(() => {
  const grupos: Record<string, ItemBase[]> = {};
  proficiencias.value.forEach((prof) => {
    const subtipoNome = prof.item_base?.subtipo?.nome || "Outros";
    if (!grupos[subtipoNome]) grupos[subtipoNome] = [];
    grupos[subtipoNome].push(prof.item_base);
  });
  return grupos;
});

// watch: Observa a seleção da classe na Etapa 1 e carrega os novos dados
// Isso é útil se o usuário voltar para a Etapa 1 e mudar de classe
watch(() => personagem.value.classe_id, (newClasseId) => {
  if (newClasseId) {
    store.carregarDadosClasse(newClasseId);
  }
});
</script>
