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
          <label class="block font-semibold">{{ grupo[0]?.descricao }}</label>
          <select
            v-model="store.personagem.escolhas_raciais[grupo[0]?.grupo_escolha ?? '']"
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

      <!-- Seleção de Armas (PARTE 3)-->
      <hr class="my-6">
      <h3 class="text-xl font-bold mb-2 pb-2">Seleção de Equipamentos Iniciais</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
        <!-- Arma 1 -->
        <div>
          <h4 class="block text-sm font-bold mb-1">Arma 1</h4>
          <select v-model="personagem.equipamentos.arma1_id" class="w-full border rounded p-2">
            <option :value="null" disabled>Selecione...</option>
            <option v-for="arma in armas1" :key="arma.item_base_id" :value="arma.item_base_id">
              {{ arma.quantidade }} x {{ arma.item_base.nome }}
            </option>
          </select>
          <div class="mt-2 p-3 border rounded bg-gray-50 text-sm min-h-[120px]">
            <template v-if="arma1Selecionada">
              <p v-for="prop in propriedadesArma1" :key="prop.label">
                <strong>{{ prop.label }}:</strong> {{ prop.value }}
              </p>
            </template>
            <p v-else class="text-gray-500">Selecione uma arma para ver os detalhes.</p>
          </div>
        </div>

        <!-- Arma 2 -->
        <div>
          <h4 class="block text-sm font-bold mb-1">Arma 2</h4>
          <select v-model="personagem.equipamentos.arma2_id" class="w-full border rounded p-2">
            <option :value="''" disabled>Selecione...</option>
            <option v-for="arma in armas2" :key="arma.item_base_id" :value="arma.item_base_id">
              {{ arma.quantidade }} x {{ arma.item_base.nome }}
            </option>
          </select>
          <div class="mt-2 p-3 border rounded bg-gray-50 text-sm min-h-[88px]">
            <template v-if="arma2Selecionada">
              <p v-for="prop in propriedadesArma2" :key="prop.label">
                <strong>{{ prop.label }}:</strong> {{ prop.value }}
              </p>
            </template>

            <template v-else>
              <p class="text-gray-500 h-[230px]">Selecione uma arma para ver os atributos.</p>
            </template>
          </div>
        </div>
      </div>


      <!-- Seleção de Armadura (PARTE 4)-->
      <div class="mt-6">
        <h4 class="block text-sm font-bold mb-1">Armadura</h4>
        <select v-model="personagem.equipamentos.armadura_id" class="w-full border rounded p-2">
          <option :value="''" disabled>Selecione...</option>
          <option v-for="arm in armaduras" :key="arm.item_base.id" :value="arm.item_base.id">
            {{ arm.item_base.nome }}
          </option>
        </select>
        <div class="mt-2 p-3 border rounded bg-gray-50 text-sm min-h-[88px]">
          <template v-if="armaduraSelecionada">
            <p v-for="prop in propriedadesArmadura" :key="prop.label">
              <strong>{{ prop.label }}:</strong> {{ prop.value }}
            </p>
          </template>
          <template v-else>
            <p class="text-gray-500">Selecione uma armadura para ver os atributos.</p>
          </template>
        </div>
      </div>

      

      <!-- Navegação (PARTE 5)-->
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
            @click = "clicou()"
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
import { ref, onMounted, watch, computed } from 'vue';
import { useCriacaoPersonagemStore } from '~/stores/criacaoPersonagem';
import { storeToRefs } from 'pinia';
import { useApi } from '~/composables/useApi';

const store = useCriacaoPersonagemStore();

// Usamos storeToRefs para pegar as propriedades mantendo a reatividade
const { personagem, proficiencias} = storeToRefs(store);


const equipamentosIniciais = ref<any[]>([]);
const loadingEquipamentos = ref(false);


// --- PROPRIEDADES COMPUTADAS PARA OS MENUS <select> ---
const armas1 = computed(() => equipamentosIniciais.value.filter(e => e.grupo_escolha === 1));
const armas2 = computed(() => equipamentosIniciais.value.filter(e => e.grupo_escolha === 2));
const armaduras = computed(() => equipamentosIniciais.value.filter(e => e.grupo_escolha === 3));


// --- PROPRIEDADES COMPUTADAS PARA ENCONTRAR O ITEM SELECIONADO NA STORE ---
const arma1Selecionada = computed(() => equipamentosIniciais.value.find(e => e.item_base_id === personagem.value.equipamentos.arma1_id));
const arma2Selecionada = computed(() => equipamentosIniciais.value.find(e => e.item_base_id === personagem.value.equipamentos.arma2_id));
const armaduraSelecionada = computed(() => equipamentosIniciais.value.find(e => e.item_base_id === personagem.value.equipamentos.armadura_id));

// --- PROPRIEDADES COMPUTADAS PARA EXIBIR AS PROPRIEDADES ---
const propriedadesArma1 = computed(() => mapearPropriedades(arma1Selecionada.value));
const propriedadesArma2 = computed(() => mapearPropriedades(arma2Selecionada.value));
const propriedadesArmadura = computed(() => mapearPropriedades(armaduraSelecionada.value));


// Seleções (ids)
const arma1Id = ref<string | number | ''>('');
const arma2Id = ref<string | number | ''>('');
const armaduraId = ref<string | number | ''>('');

// Objetos selecionados (para exibição)
const arma1 = computed(() => armas1.value.find(a => a.id === arma1Id.value));
const arma2 = computed(() => armas2.value.find(a => a.id === arma2Id.value));
const armadura = computed(() => armaduras.value.find(a => a.id === armaduraId.value));



  async function carregarDadosDaClasse() {
  if (personagem.value.classe_id) {
    // Carrega proficiências e habilidades (que serão usadas na Etapa 3)
    loadingEquipamentos.value = true;
    store.carregarDadosClasse(personagem.value.classe_id);
    
    // Carrega os equipamentos iniciais para esta etapa
    try {
      equipamentosIniciais.value = await useApi(`/classes/equipamentosIniciais/${personagem.value.classe_id}`);
    } catch (e) {
      console.error("Falha ao buscar equipamentos iniciais", e);
      equipamentosIniciais.value = [];
    } finally {
      loadingEquipamentos.value = false;
    }
  }
}

  function mapearPropriedades(arma: any) {
    if (!arma?.item_base) {
      return [];
    }


    const item = arma.item_base;
    const propriedades: { label: string; value: any }[] = [];
    propriedades.push({ label: 'Nome', value: item.nome }); 

    // --- Propriedades Comuns ---
    if (item.peso > 0) {
      propriedades.push({ label: 'Peso', value: item.peso });
    }

    // --- Arma Corpo-a-Corpo ---
    if (item.propriedades_arma_cac) {
      const props = item.propriedades_arma_cac;
      if (props.dano) propriedades.push({ label: 'Dano', value: props.dano + ' de dano ' + props.tipo_dano });
      if (props.alcance) propriedades.push({ label: 'Alcance', value: props.alcance });
      if (props.categoria_peso) propriedades.push({ label: 'Categoria de Peso', value: props.categoria_peso });
      if (props.tempo_ataque) propriedades.push({ label: 'Tempo de Ataque', value: props.tempo_ataque });
      if (props.arremesso) propriedades.push({ label: 'Arremesso', value: props.arremesso });
      if (props.versatil) propriedades.push({ label: 'Versátil', value: props.versatil });
      if (props.atributo_ataque) propriedades.push({ label: 'Atributo de Ataque', value: props.atributo_ataque });

      if (props.aparar) propriedades.push({ label: 'Possui', value: 'Aparar' });
      if (props.duas_maos) propriedades.push({ label: 'Possui', value: 'Duas Mãos' });
      if (props.fortitude) propriedades.push({ label: 'Possui', value: 'Fortitude' });
      if (props.destruidor) propriedades.push({ label: 'Possui', value: 'Destruidor' });
      if (props.multi_ataque) propriedades.push({ label: 'Possui', value: 'Multi-Ataque' });
    }

    // --- Arma a distância ---
    if (item.propriedades_arma_distancia) {
      const props = item.propriedades_arma_distancia
      if (props.dano) propriedades.push({ label: 'Dano', value: props.dano + ' de dano ' + props.tipo_dano });
      if (props.alcance_min && props.alcance_max) propriedades.push({ label: 'Alcance', value: (props.alcance_min) + 'm/' + (props.alcance_max) + 'm' });
      if (props.familia_distancia) propriedades.push({ label: 'Tipo', value: props.familia_distancia });
      if (props.tipo_municao) propriedades.push({ label: 'Tipo de munição', value: props.tipo_municao });
      if (props.qtde_municao) propriedades.push({ label: 'Quantidade munição', value: props.qtde_municao });
      if (props.tempo_recarga) propriedades.push({ label: 'Versátil', value: props.tempo_recarga });
      if (props.atributo_ataque) propriedades.push({ label: 'Atributo de Ataque', value: props.atributo_ataque });

      if (props.leve) propriedades.push({ label: 'Categoria de Peso', value: 'Leve' });
      if (props.destruidor) propriedades.push({ label: 'Possui', value: 'Destruidor' });
      if (props.multi_ataque) propriedades.push({ label: 'Possui', value: 'Multi-Ataque' });
    }


    // --- Armaduras ---
    if (item.propriedades_armadura) {
      const props = item.propriedades_armadura;
      if (props.defesa) propriedades.push({ label: 'Defesa Física', value: ('+' + props.defesa )});
      if (props.defesa_magica) propriedades.push({ label: 'Defesa Mágica', value: props.defesa_magica });
      if (props.furtividade_resistencia) propriedades.push({ label: 'Penalidade de Furtividade e Esquiva', value: props.furtividade_resistencia});
    }

    // --- Escudos ---
    if (item.propriedades_escudo) {
      const props = item.propriedades_escudo
      if (props.foco_conjurador) propriedades.push({ label: 'Tipo de Foco', value: props.foco_conjurador })
      if (props.magica_intrinsica) propriedades.push({ label: 'Magia Intrinsica', value: props.magica_intrinsica })
    }

    return propriedades
  }


watch(() => personagem.value.classe_id, (newClasseId) => {
  if (newClasseId) {
    store.carregarDadosClasse(newClasseId);
  }
});

function clicou() {
  store.imprimeTudo();
}


// onMounted: Carrega os dados da classe quando a página é montada
onMounted(carregarDadosDaClasse);
watch(() => personagem.value.classe_id, carregarDadosDaClasse);


const proficienciasPorSubtipo = computed(() => {
  const grupos: Record<string, any> = {};
  proficiencias.value.forEach((prof) => {
    const subtipoNome = prof.item_base?.subtipo?.nome || "Outros";
    if (!grupos[subtipoNome]) grupos[subtipoNome] = [];
    grupos[subtipoNome].push(prof.item_base);
  });
  return grupos;
});


</script>