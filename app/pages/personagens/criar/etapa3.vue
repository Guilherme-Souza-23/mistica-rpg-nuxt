<template>
  <div class="container mx-auto">
    <h1 class="text-4xl font-bold mb-6">Criar Novo Personagem</h1>
    <div class="bg-white p-6 rounded-lg shadow-lg">
      <h2 class="text-2xl font-bold mb-2 border-b pb-2">Etapa 2: Atributos e Habilidades</h2>
      <div class="container mx-auto p-4 md:p-6">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-4">

          <!-- COLUNA ESQUERDA: PERÍCIAS (EDITÁVEL) -->
          <div class="col-span-5 bg-white shadow-lg rounded-lg p-4 overflow-y-auto">
            <h2 class="text-2xl font-bold mb-4 text-red-700 border-b pb-2">Atributos e Perícias</h2>

            <table class="w-full">
              <tbody>
                
                <tr v-for="attr in atributosBase" :key="attr.chave" class="align-top">
                  <!-- Quadro do atributo (mod + valor) -->
                  <td class="pr-2 w-28 pt-5">
                    <div class="attribute-frame">
                      <div class="attribute-mod-box">
                        <span class="mod-value">{{ modAtributo((store.atributosFinais as any)[attr.chave]) }}</span>
                        <div class="attribute-value-circle">
                          <span class="value-text">{{ (store.atributosFinais as any)[attr.chave] }}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <!-- Tabela de perícias do atributo -->
                  <td>
                    <table class="w-full text-xs bg-gray-200 rounded-lg overflow-hidden" style="border: 5px solid red">
                      <thead>
                        <tr>
                          <th class="pl-2 text-left w-1/2"><label class="attribute-label">{{ attr.nome }}</label></th>
                          <th class="text-center w-16">Valor</th>
                          <th class="text-center w-16">Mod.</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="pericia in store.periciasPorAtributo[attr.nome]"
                          :key="pericia.id"
                          class="h-7"
                        >
                          <td class="pl-2">{{ pericia.nome }}</td>
                          <td class="text-center font-semibold">
                            <input
                              type="number"
                              min="0"
                              class="w-14 text-center border rounded p-1"
                              v-model.number="(store.personagem.pericias as any)[attr.nome][pericia.nome]"
                            />
                          </td>
                          <td class="text-center">{{ ((store.personagem.pericias?.[attr.nome]?.[pericia.nome]) || 0) - 10 }}</td>
                        </tr>
                      </tbody>
                    </table>

                    <!-- Validação visual opcional (mantida pequena) -->
                    <p v-if="validaPericias(attr) === attr.nome" class="text-red-600 text-xs mt-1">
                      Distribuição inválida para {{ attr.nome }}.
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- COLUNA DIREITA: EQUIPAMENTOS (SELECTS EDITÁVEIS) + PAINÉIS SOMENTE LEITURA -->
          <div class="col-span-7 md:col-span-7 flex flex-col gap-4">

            <!-- Seleção de Armas -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Arma 1 -->
              <div>
                <label class="block text-sm font-bold mb-1">Arma 1</label>
                <select v-model="arma1Id" class="w-full border rounded p-2">
                  <option :value="''" disabled>Selecione...</option>
                  <option v-for="arma in armas1" :key="arma.id" :value="arma.id">
                    {{ arma.quantidade }} x {{ arma.item_base.nome }}
                  </option>
                </select>
                <div class="mt-2 p-3 border rounded bg-gray-50 text-sm min-h-[88px]">
                  <template v-if="arma1?.item_base">
                    <p v-for="prop in propriedadesArma1" :key="prop.label">
                      <strong>{{ prop.label }}:</strong> {{ prop.value }}
                    </p>
                  </template>

                  <template v-else>
                    <p class="text-gray-500">Selecione uma arma para ver os atributos.</p>
                  </template>
                </div>
              </div>

              <!-- Arma 2 -->
              <div>
                <label class="block text-sm font-bold mb-1">Arma 2</label>
                <select v-model="arma2Id" class="w-full border rounded p-2">
                  <option :value="''" disabled>Selecione...</option>
                  <option v-for="arma in armas2" :key="'a2-' + arma.id" :value="arma.id">
                    {{ arma.quantidade }} x {{ arma.item_base.nome }}
                  </option>
                </select>
                <div class="mt-2 p-3 border rounded bg-gray-50 text-sm min-h-[88px]">
                  <template v-if="arma2?.item_base">
                    <p v-for="prop in propriedadesArma2" :key="prop.label">
                      <strong>{{ prop.label }}:</strong> {{ prop.value }}
                    </p>
                  </template>

                  <template v-else>
                    <p class="text-gray-500">Selecione uma arma para ver os atributos.</p>
                  </template>
                </div>
              </div>
            </div>

            <!-- Seleção de Armadura -->
            <div>
              <label class="block text-sm font-bold mb-1">Armadura</label>
              <select v-model="armaduraId" class="w-full border rounded p-2">
                <option :value="''" disabled>Selecione...</option>
                <option v-for="arm in armaduras" :key="arm.id" :value="arm.id">
                  {{ arm.item_base.nome }}
                </option>
              </select>
              <div class="mt-2 p-3 border rounded bg-gray-50 text-sm min-h-[88px]">
                <template v-if="armadura">
                  <p v-for="prop in propriedadesArmadura" :key="prop.label">
                    <strong>{{ prop.label }}:</strong> {{ prop.value }}
                  </p>
                </template>
                <template v-else>
                  <p class="text-gray-500">Selecione uma armadura para ver os atributos.</p>
                </template>
              </div>
            </div>


            <!-- Atributos Secundários (somente exibição) -->
            <div class="bg-white p-4 shadow rounded-lg">
              <h3 class="text-xl font-bold mb-3">Atributos Secundários</h3>
              <div class="flex flex-wrap gap-3">
                <div class="secondary-stat-box" v-for="stat in secundarios" :key="stat.label">
                  <span class="stat-label">{{ stat.label }}</span>
                  <span class="stat-value-main">{{ stat.value }}</span>
                </div>
              </div>
            </div>

            <!-- BARRA DE AÇÕES (AVANÇAR / RECUAR) -->
            <div class="sticky bottom-0 bg-white border-t rounded-b-lg mt-2 py-3 px-2 flex justify-between items-center">
              <NuxtLink to="/personagens/criar/etapa2">
                <button type="button" class="bg-gray-500 hover:bg-gray-600 text-white text-sm font-bold py-2 px-4 rounded-lg">
                  Recuar
                </button>
              </NuxtLink>

              <div class="text-right mr-auto ml-4">
                <p v-if="submitError" class="text-red-500 text-xs">{{ submitError }}</p>
                <p v-if="successMessage" class="text-green-600 text-xs">{{ successMessage }}</p>
              </div>

              <button
                type="button"
                @click="avancar"
                :disabled="!store.isEtapa3Valida || loadingSubmit"
                class="bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2 px-4 rounded-lg disabled:bg-gray-400"
              >
                {{ loadingSubmit ? 'Salvando...' : 'Avançar' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { useApi } from '~/composables/useApi';
import { storeToRefs } from 'pinia'
import { useCriacaoPersonagemStore } from '~/stores/criacaoPersonagem'

const store = useCriacaoPersonagemStore()
const router = useRouter()
const { loadingSubmit, submitError, successMessage } = storeToRefs(store)

const atributosBase = ref([
  { nome: 'Força', chave: 'forca' },
  { nome: 'Destreza', chave: 'destreza' },
  { nome: 'Constituição', chave: 'constituicao' },
  { nome: 'Inteligência', chave: 'inteligencia' },
  { nome: 'Carisma', chave: 'carisma' }
])

// Opções de equipamentos
const armas1 = ref<any[]>([])
const armas2 = ref<any[]>([])
const armaduras = ref<any[]>([])
const resposta = ref<any[]>([])
const propriedadesArma1 = computed(() => mapearPropriedades(arma1.value))
const propriedadesArma2 = computed(() => mapearPropriedades(arma2.value))
const propriedadesArmadura = computed(() => mapearPropriedades(armadura.value))

// Seleções (ids)
const arma1Id = ref<string | number | ''>('')
const arma2Id = ref<string | number | ''>('')
const armaduraId = ref<string | number | ''>('')

// Objetos selecionados (para exibição)
const arma1 = computed(() => armas1.value.find(a => a.id === arma1Id.value))
const arma2 = computed(() => armas2.value.find(a => a.id === arma2Id.value))
const armadura = computed(() => armaduras.value.find(a => a.id === armaduraId.value))


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


onMounted(async () => {
  // Se usuário recarregar direto a etapa 3
  if (store.opcoes.pericias.length === 0) {
    await store.buscarOpcoesIniciais();
  }

  if(store.personagem.classe_id){
    await store.buscaPreviaPersonagem();
  }

  // Buscar equipamentos iniciais por classe
  if (store.personagem.classe_id) {
    const resposta: any = await useApi(`/classes/equipamentosIniciais/${store.personagem.classe_id}`);
    // Assumindo que a API retorna algo como { armas: [...], armaduras: [...] }

    for (const item of resposta.value) {
      if (item.grupo_escolha === 1) {
        armas1.value.push(item);
      } else if (item.grupo_escolha === 2) {
        armas2.value.push(item);
      } else if (item.grupo_escolha === 3) {
        armaduras.value.push(item);
      }
    }
  }
})

// Persistir escolhas no store (ids) para o submit final
watch([arma1Id, arma2Id, armaduraId], ([a1, a2, ar]) => {
  ;(store.personagem as any).equipamentos = { arma1Id: a1 || null, arma2Id: a2 || null, armaduraId: ar || null }
})

// ======== Cálculos auxiliares ========
function modAtributo(valor: number) {
  return Math.floor(valor / 4) - 10
}

function getValorPericia(nomeAtributo: string, nomePericia: string) {
  return ((store.personagem.pericias as any)?.[nomeAtributo]?.[nomePericia]) ?? 0
}

// Atributos secundários (apenas exibição). Ajuste as fórmulas às regras do sistema.
const secundarios = computed(() => {
  const at = store.atributosFinais as any;
  const modInt = modAtributo(at.inteligencia);
  const modCon = modAtributo(at.constituicao);
  const modDes = modAtributo(at.destreza);

  
  const atributosSecundarios: { label: string; value: any }[] = [];

  // Esquiva = máx(Reagir, 10)
  const reagir = (getValorPericia('Destreza', 'Reagir') || 0) - 10;
  const penalidadeEsquiva = armadura.value?.item_base?.propriedades_armadura?.furtividade_resistencia ?? 0;
  const esquivaBase = (10 + reagir);


  const defesaFisica = armadura.value?.item_base?.propriedades_armadura?.defesa ?? 0;
  const defesaMagica = armadura.value?.item_base?.propriedades_armadura?.defesa_magica ?? 0;

  atributosSecundarios.push(
    { label: 'Vida', value:  `${20 + Math.floor(at.constituicao / 4) - 10}` },
    { label: 'Pontos de Fôlego', value:  `${Math.floor(at.constituicao / 4)}` },
    { label: 'Esquiva', value: `${(esquivaBase + penalidadeEsquiva)}` },
    { label: 'Percepção', value: `${13 + modInt}` },
    { label: 'Tenacidade', value: `${Math.floor(modCon / 2)}` },
    { label: 'Defesa Física', value: `${Math.floor(modCon / 2) + defesaFisica}` },
    { label: 'Resistência Mágica', value: `${Math.floor((modCon + modInt) / 2) + defesaMagica}` },
    { label: 'Velocidade', value: `${Math.max(3, 5 + Math.floor(modDes / 2))}m` },
  );

  return atributosSecundarios;
})

// Validação de distribuição (diferença máx 1 entre valores)
function validaPericias(attr: any): string {
  const periciasDoAtributo = store.periciasPorAtributo[attr.nome] || []
  const valores = periciasDoAtributo.map((p: any) => (store.personagem.pericias as any)[attr.nome][p.nome] || 0)
  valores.sort((a: number, b: number) => a - b)
  for (let i = 1; i < valores.length; i++) if (valores[i] - valores[i - 1] > 1) return attr.nome
  return ''
}

// Avançar (última etapa -> submete e vai para a página do personagem)
async function avancar() {
  await store.submitPersonagem()
  if (!store.submitError && store.personagemCriadoId) {
    router.push(`/personagens/${store.personagemCriadoId}`)
  }
}
</script>

<style scoped>
.character-sheet { max-width: 1123px; margin: auto; }
.attribute-frame { display: flex; flex-direction: column; align-items: center; padding-top: 0.5rem; margin-bottom: 2rem; }
.attribute-label { font-weight: bold; color: #4a5568; margin-bottom: 0.25rem; font-size: 0.9rem; text-transform: uppercase; }
.attribute-mod-box { width: 5.5rem; height: 5.5rem; background-color: #f7fafc; border: 2px solid #cbd5e0; border-radius: 0.375rem; display: flex; justify-content: center; align-items: center; position: relative; }
.mod-value { font-size: 1.8rem; font-weight: bold; color: #2d3748; margin-top: -6px; }
.attribute-value-circle { position: absolute; bottom: -1.1rem; width: 2.6rem; height: 2.6rem; background-color: white; border: 3px solid #2d3748; border-radius: 9999px; display: flex; justify-content: center; align-items: center; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); }
.value-text { font-weight: bold; font-size: 1rem; }
.secondary-stat-box { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 6rem; height: 5rem; background-color: #f7fafc; border-radius: 0.5rem; box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1); border: 1px solid #e2e8f0; padding: 0.25rem; }
.stat-label { font-size: 0.65rem; color: #718096; }
.stat-value-main { font-size: 1.125rem; font-weight: bold; text-align: center; }
</style>
