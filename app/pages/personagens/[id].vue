<template>
  <div class="container mx-auto p-4">
    <div v-if="estaCarregando" class="text-center p-8">Carregando ficha...</div>
    <div v-else-if="error" class="error-message">Erro ao carregar personagem.</div>

    <div v-else-if="personagem" class="character-sheet bg-white rounded-lg shadow-lg p-4 max-w-4xl mx-auto">
      
      <header class="grid grid-cols-6 gap-x-4 gap-y-2 border-b pb-3 mb-4">
        <div class="flex flex-col">
          <label class="text-xs text-gray-500">Jogador</label>
          <span class="text-base font-semibold">Guilherme</span>
        </div>
        <div class="flex flex-col">
          <label class="text-xs text-gray-500">Personagem</label>
          <span class="text-base font-semibold">{{ personagem.nome }}</span>
        </div>
        <div class="flex flex-col">
          <label class="text-xs text-gray-500">Classe</label>
          <span class="text-base font-semibold">{{ personagem.classe.nome }}</span>
        </div>
        <div class="flex flex-col">
          <label class="text-xs text-gray-500">Raça</label>
          <span class="text-base font-semibold">{{ personagem.raca.nome }}</span>
        </div>
        <div class="flex flex-col">
          <label class="text-xs text-gray-500">Nível</label>
          <span class="text-base font-semibold">{{ personagem.nivel }}</span>
        </div>
        <div class="flex flex-col">
          <label class="text-xs text-gray-500">Experiência</label>
          <span class="text-base font-semibold">{{ personagem.exp }} / 1000</span>
        </div>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div class="stat-box col-span-1">
          <h3 class="text-xl font-bold mb-2">Atributos e Perícias</h3>
          <table class="w-full">
            <tbody>
              <tr v-for="(grupo, chaveAtributo) in periciasAgrupadas" :key="chaveAtributo" class="align-top">
                <td class="pr-2 w-32">
                  <div class="attribute-frame">
                    <div class="attribute-mod-box">
                      
                      <span class="mod-value">{{ personagem[`mod_${chaveAtributo}`] }}</span>
                      <div class="attribute-value-circle">
                        <span class="value-text">{{ personagem[chaveAtributo] }}</span>
                      </div>
                    </div>
                  </div>
                </td>
                
                <td>
                  <table class="w-full text-xs bg-gray-200" style="border-radius: 10px;">
                    <thead >
                      <tr class="h-1"></tr>
                      <tr class=" h-5 w-full">
                        <td class="pr-2 pl-2"><label class="attribute-label">{{ grupo.nomeExibicao }}</label></td>
                      </tr>
                      <tr>
                        <th class="pr-2 pl-2"></th>
                        <th class=" text-center">Valor</th>
                        <th class=" text-center">Mod.</th>
                      </tr>
                    </thead>
                    <tbody>
                      
                      <tr v-for="pericia in grupo.lista" :key="pericia.nome" class="w-full h-4">
                        <td class=" pr-2 pl-2">{{ pericia.nome }}</td>
                        <td class=" w-8 text-center font-semibold">{{ pericia.valor }}</td>
                        <td class=" w-8 text-center">{{ pericia.modificador }}</td>
                      </tr>
                      <tr class="h-2">

                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="stat-box col-span-1">
          <h3 class="text-xl font-bold mb-2">Atributos Secundários</h3>
          <div class="flex flex-wrap justify-center gap-2">
            <div class="secondary-stat-box">
              <span class="stat-label">Vida</span>
              <span class="stat-value-large">{{ personagem.vida_atual }}/{{ personagem.vida_maxima }}</span>
            </div>
            <div class="secondary-stat-box">
              <span class="stat-label">Mana</span>
              <span class="stat-value-large">{{ personagem.mana_atual }}/{{ personagem.inteligencia }}</span>
            </div>
            <div class="secondary-stat-box">
              <span class="stat-label">Esquiva</span>
              <span class="stat-value-main">{{ personagem.esquiva }}</span>
            </div>
            <div class="secondary-stat-box">
              <span class="stat-label">Percepção</span>
              <span class="stat-value-main">{{ personagem.percepcao }}</span>
            </div>
            <div class="secondary-stat-box">
              <span class="stat-label">Tenacidade</span>
              <span class="stat-value-main">{{ personagem.tenacidade }}</span>
            </div>
             <div class="secondary-stat-box">
              <span class="stat-label">Velocidade</span>
              <span class="stat-value-main">{{ personagem.velocidade }}m</span>
            </div>
          </div>
        </div>
        
        <div class="stat-box col-span-1">
            <h3 class="text-xl font-bold mb-2">Inventário</h3>
            <ul v-if="personagem.inventario_itens && personagem.inventario_itens.length > 0" class="inventory-list">
                <li v-for="item in personagem.inventario_itens" :key="item.id">
                {{ item.item_base.nome }} 
                <span :style="{ color: item.raridade.cor_hex }">({{ item.raridade.nome }})</span>
                </li>
            </ul>
            <p v-else class="text-sm italic">Inventário vazio.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import { useApi } from '~/composables/useApi'; // Importa nosso composable

  const route = useRoute();
  const personagem = ref<any>(null); // Para guardar os dados do personagem
  const estaCarregando = ref(true);     // Nossa própria variável para o estado de "carregando"
  const error = ref<string | null>(null);     // Nossa própria variável para o estado de erro

  // Usamos onMounted para chamar a API assim que o componente é carregado na tela
  const periciasAgrupadas = computed(() => {
    if (!personagem.value || !personagem.value.pericias) {
      return {}; // Retorna um objeto vazio se não houver perícias
    }

    const slugify = (text: string) => {
      return text
        .toLowerCase()
        .normalize("NFD") // Separa acentos das letras
        .replace(/[\u0300-\u036f]/g, ""); // Remove os acentos
    };

    // O método reduce transforma o array de perícias em um objeto agrupado
    return personagem.value.pericias.reduce((acc, itemPericia) => {
      const atributoNomeExibicao = itemPericia.pericia.atributo_base;
      const atributoChave = slugify(atributoNomeExibicao);
      const periciaInfo = {
        nome: itemPericia.pericia.nome,
        valor: itemPericia.valor,
        modificador: itemPericia.valor - 10,
      };

      // Se a chave do atributo (ex: 'Força') ainda não existe no nosso objeto, cria um array para ela
      if (!acc[atributoChave]) {
        acc[atributoChave] = {
          nomeExibicao: atributoNomeExibicao, // Guarda o nome bonito para o título
          lista: []
        };
      }

      // Adiciona a perícia atual ao array do seu atributo correspondente
      acc[atributoChave].lista.push(periciaInfo);

      return acc; // Retorna o objeto acumulador para a próxima iteração
    }, {});
  });

  

  onMounted(async () => {
    try {
      const personagemId = route.params.id;
      personagem.value = await useApi(`/personagens/${personagemId}`);
    } catch (err: any) {
      error.value = err.message || 'Falha ao carregar o personagem.';
    } finally {
      estaCarregando.value = false;
      console.log("Personagem carregado:", personagem.value);
      console.log("Pericias agrupadas:", periciasAgrupadas.value);
    }
  });
</script>

<style scoped>
/* Adicione ou substitua estas classes no seu bloco <style> */

/* Define uma largura máxima para a ficha, similar a uma folha A4 em paisagem */
.character-sheet {
  max-width: 1123px; /* Largura de A4 em paisagem a 96 DPI */
  margin: auto;
}

/* Reduz o tamanho e margem dos títulos principais */
.stat-box h3 {
  font-family: var(--fonte-titulo);
  color: var(--cor-primaria);
  border-bottom: 1px solid var(--cor-borda);
  padding-bottom: 0.25rem;
  margin-bottom: 0.75rem;
}

/* Layout do frame de atributo (quadrado e círculo) */
.attribute-frame {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 0.5rem;
  margin-bottom: 2rem;
}
.attribute-label {
  font-weight: bold;
  color: #4a5568; /* text-gray-700 */
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
  text-transform: uppercase;
}
.attribute-mod-box {
  width: 6rem; /* 96px */
  height: 6rem; /* 96px */
  background-color: #f7fafc; /* bg-gray-100 */
  border: 2px solid #cbd5e0; /* border-gray-400 */
  border-radius: 0.375rem; /* rounded-md */
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}
.mod-value {
  font-size: 2.25rem; /* text-4xl */
  font-weight: bold;
  color: #2d3748; /* text-gray-800 */
  margin-top: -10px;
}
.attribute-value-circle {
  position: absolute;
  bottom: -1.3rem; /* Sobrepõe a borda */
  width: 3rem; /* 48px */
  height: 3rem; /* 48px */
  background-color: white;
  border: 4px solid #2d3748; /* border-gray-800 */
  border-radius: 9999px; /* rounded-full */
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); /* shadow-md */
}
.value-text {
  font-weight: bold;
  font-size: 1.125rem; /* text-lg */
}

/* Reduz o espaçamento da tabela de perícias */
.skills-table td {
  padding: 2px 4px; /* Padding bem pequeno */
}

/* Estilo para os quadrados de atributos secundários */
.secondary-stat-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 6rem; /* 96px */
  height: 5rem; /* 80px */
  background-color: #f7fafc; /* bg-gray-100 */
  border-radius: 0.5rem; /* rounded-lg */
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1); /* shadow */
  border: 1px solid #e2e8f0; /* border-gray-300 */
  padding: 0.25rem;
}
.stat-label {
  font-size: 0.65rem; /* text-xs */
  color: #718096; /* text-gray-600 */
}
.stat-value-main {
  font-size: 1.875rem; /* text-3xl */
  font-weight: bold;
}
.stat-value-large {
  font-size: 1.125rem; /* text-lg */
  font-weight: bold;
  text-align: center;
}

.inventory-list {
  font-size: 0.9rem;
}
</style>