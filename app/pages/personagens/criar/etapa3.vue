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
                    <strong>{{ hab.nome }}</strong>: {{ hab.descricao }}
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
                    @change="selecionarHabilidade(habilidades.ativas.find(h => h.nome === habilidadeSelecionadaLocal))"
                    class="border rounded p-2 w-full"
                  >
                    <option v-for="hab in habilidades.ativas" :key="hab.id" :value="hab.nome">
                      {{ hab.nome }}
                    </option>
                  </select>
                </div>
                
                <!-- Coluna 2: Descrição -->
                <div class="border rounded p-4 bg-gray-50">
                  <p v-if="store.habilidadeSelecionada">
                    <strong>{{ store.habilidadeSelecionada.nome }}</strong><br />
                    {{ store.habilidadeSelecionada.descricao }}
                  </p>
                  <p v-else class="text-gray-500 italic">
                    Selecione uma habilidade para ver a descrição
                  </p>
                </div>
              </div>
            </div>
          </div>


                <!-- Atributos Secundários (somente exibição) -->
                <div class="bg-white p-4 shadow rounded-lg">
                  <h3 class="text-xl font-bold mb-3">Atributos Secundários</h3>
                  <div class="flex flex-wrap gap-3">
                    <div class="secondary-stat-box" v-for="stat in (secundarios as any)" :key="stat.nome_atributo">
                      <span class="stat-label">{{ stat.nome_atributo }}</span>
                      <span class="stat-value-main">{{ stat.valor_atributo }}</span>
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


const store = useCriacaoPersonagemStore();

// Usamos storeToRefs para pegar as propriedades mantendo a reatividade
const { personagem,} = storeToRefs(store);

const router = useRouter()
const { loadingSubmit, submitError, successMessage, habilidades  } = storeToRefs(store)
const habilidadeSelecionadaLocal = ref<any>(null);
const secundarios = ref<{ nome_atributo: string; valor_atributo: any }[]>([]);

const atributosBase = ref([
  { nome: 'Força', chave: 'forca' },
  { nome: 'Destreza', chave: 'destreza' },
  { nome: 'Constituição', chave: 'constituicao' },
  { nome: 'Inteligência', chave: 'inteligencia' },
  { nome: 'Carisma', chave: 'carisma' }
]);

onMounted(async () => {
  // Se usuário recarregar direto a etapa 3
  if (store.opcoes.pericias.length === 0) {
    await store.buscarOpcoesIniciais();
  }

  if(store.personagem.classe_id){
    try{
      const previa = await store.buscaPreviaPersonagem();
      secundarios.value = Object.entries(previa).map(([key, value]) => ({
        nome_atributo: key,
        valor_atributo: value,
      }));
      console.log("Secundarios: ", secundarios.value);
    } catch(e){
      console.error(e);
    }
  }
})

async function selecionarHabilidade(hab: any) {
  store.habilidadeSelecionada = hab;
  console.log("Habilidade selecionada 2: ", store.habilidadeSelecionada);
  habilidadeSelecionadaLocal.value = hab.nome;
  
}


// ======== Cálculos auxiliares ========
function modAtributo(valor: number) {
  return Math.floor(valor / 4) - 10
}

function getValorPericia(nomeAtributo: string, nomePericia: string) {
  return ((store.personagem.pericias as any)?.[nomeAtributo]?.[nomePericia]) ?? 0
}



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
