// app/stores/criacaoPersonagem.ts
import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'

// --- INTERFACES ---
interface Modificador {
  id: number
  raca_id: number
  tipo: string
  chave: string
  valor: string
  grupo_escolha: number | null
  descricao?: string | null
}
interface SubRaca {
  id: number
  parent_id: number
  nome: string
  descricao: string
  modificadores: Modificador[]
}
interface RacaPrincipal {
  id: number
  nome: string
  descricao: string
  sub_racas: SubRaca[]
  modificadores: Modificador[]
}
interface Classe {
  id: number
  nome: string
  descricao: string
  vida_base: number
}
interface AtributoBase {
  id: number
  nome: string
}
interface Pericia {
  id: number
  nome: string
  atributo_base_id: number
}
interface AtributosSecundarios {
  carga: number,
  jogadasSorte: number,
  velocidade: number,
  percepcao: number,
  vidaMaxima: number,
  recurso: number,
  tenacidade: number,
  defesa: number,
  defesaMagica: number,
}
interface Habilidade {
  id: number
  nome: string
  tipo: 'ativa' | 'passiva',
  descricao: string,
  nivel_adquirido: number
}
interface ItemBase {
  id: number
  nome: string
  subtipo?: {
    id: number
    nome: string
  }
}
interface Proficiencia {
  id: number
  item_base: ItemBase
}


export const useCriacaoPersonagemStore = defineStore('criacaoPersonagem', {
  state: () => ({
    personagem: {
      nome: '',
      classe_id: null as number | null,
      raca_id: null as number | null, // ID da Sub-Raça
      forca: 40,
      destreza: 40,
      constituicao: 40,
      inteligencia: 40,
      carisma: 40,
      sorte: 0,
      pericias: {} as Record<string, Record<string, number>>,
      escolhas_raciais: {} as Record<string, string>,
      habilidades_ativas: {} as Record<number, number>, 
      habilidades_passivas: {} as Record<number, number>,
      personagemCriadoId: null as number | null,
      nivel: 1,
      equipamentos: {
        arma1_id: null as number | null,
        arma2_id: null as number | null,
        armadura_id: null as number | null,
      },
      previaSecundarios: {} as AtributosSecundarios,
      atributosSecundarios: {} as AtributosSecundarios
    },
    opcoes: {
      racas: [] as RacaPrincipal[],
      classes: [] as Classe[],
      pericias: [] as Pericia[],
      atributos_base: [] as AtributoBase[],
    },
    racaPrincipalSelecionadaId: null as number | null,
    proficiencias: [] as Proficiencia[],
    classe: [] as Classe[],

    habilidades: {
      passivas: [] as Habilidade[],
      ativas: [] as Habilidade[], // agrupadas por nível
    },
    habilidadeSelecionada: null as Habilidade | null,
    personagemCriadoId: null as number | null,
    loadingSubmit: false,
    submitError: null as string | null,
    successMessage: null as string | null,
  }),


  getters: {
    // -------- VALIDAÇÕES --------
    isEtapa1Valida(state) {
      return (
        state.personagem.nome.trim() &&
        state.personagem.classe_id &&
        state.personagem.raca_id
      )
    },

    isEtapa2Valida(state): boolean {
      // 1. Valida se os pontos de atributo foram distribuídos corretamente
      const pontosOk = this.pontosDeAtributoRestantes === 0;
      console.log("Pontos de Atributo Restantes: ", pontosOk);

      // 2. Valida se todas as escolhas de bônus raciais foram feitas
      const gruposRaciaisNecessarios = this.modificadoresDeEscolha.length;
      const gruposRaciaisEscolhidos = Object.values(state.personagem.escolhas_raciais).filter(v => v).length;
      const escolhasRaciaisOk = gruposRaciaisNecessarios === gruposRaciaisEscolhidos;
      console.log("Escolhas Raciais: ", escolhasRaciaisOk);


      // Retorna true apenas se TODAS as condições forem satisfeitas
      return pontosOk && escolhasRaciaisOk;
    },

    isEtapa3Valida(state): boolean {
      if (!this.isEtapa2Valida) return false

      const mapa: Record<string, string> = {
        'Força': 'forca',
        'Destreza': 'destreza',
        'Constituição': 'constituicao',
        'Inteligência': 'inteligencia',
        'Carisma': 'carisma',
      }

      for (const nomeVisivel of Object.keys(mapa)) {
        const chave = mapa[nomeVisivel] ?? '';
        const pericias = Object.values(state.personagem.pericias[nomeVisivel] || {}) as number[];

        if (pericias.length < 4) return false;

        const soma = pericias.reduce((s, v) => s + v, 0);
        if (soma !== this.atributosFinais[chave]) return false;
      }

      return true
    },

    // -------- RACAS --------
    opcoesSubRaca(state): SubRaca[] {
      if (!state.racaPrincipalSelecionadaId) return []
      const raca = state.opcoes.racas.find(r => r.id === state.racaPrincipalSelecionadaId)
      return raca ? raca.sub_racas : []
    },

    modificadoresDeEscolha(state) {
      if (!state.personagem.raca_id) return []

      const raca = state.opcoes.racas.find(r => r.id === state.racaPrincipalSelecionadaId)
      const subraca = raca?.sub_racas.find(sr => sr.id === state.personagem.raca_id)
      if (!subraca) return []

      const todos = [...(raca?.modificadores || []), ...(subraca.modificadores || [])]
      const grupos: Record<string, Modificador[]> = {}

      todos.forEach(mod => {
        if (mod.tipo === 'bonus_atributo_escolha' && mod.grupo_escolha) {
          if (!grupos[mod.grupo_escolha]) grupos[mod.grupo_escolha] = []
          grupos[mod.grupo_escolha]?.push(mod)
        }
      })

      return Object.values(grupos)
    },

    // -------- ATRIBUTOS --------
    bonusDeAtributosRaciais(state): Record<string, number> {
      const bonus: Record<string, number> = {}
      if (!state.personagem.raca_id) return bonus

      const raca = state.opcoes.racas.find(r => r.id === state.racaPrincipalSelecionadaId)
      const subraca = raca?.sub_racas.find(sr => sr.id === state.personagem.raca_id)
      if (!raca || !subraca) return bonus

      const todos = [...(raca.modificadores || []), ...(subraca.modificadores || [])]

      // Fixos
      todos.forEach(mod => {
        if (mod.tipo === 'bonus_atributo') {
          const valor = parseInt(mod.valor.replace('+', ''));
          bonus[mod.chave] = (bonus[mod.chave] || 0) + valor;
        }
      })

      // Escolha
      for (const grupo in state.personagem.escolhas_raciais) {
        const chave = state.personagem.escolhas_raciais[grupo] ?? '';
        const escolhido = todos.find(m => m.grupo_escolha == parseInt(grupo) && m.chave === chave);
        if (escolhido) {
          const valor = parseInt(escolhido.valor.replace('+', ''));
          bonus[chave] = (bonus[chave] || 0) + valor;
        }
      }

      return bonus
    },

    pontosDeAtributoRestantes(state): number {
      const gastosBase =
        state.personagem.forca +
        state.personagem.destreza +
        state.personagem.constituicao +
        state.personagem.inteligencia +
        state.personagem.carisma;

      // Sorte é especial → cada ponto custa 10
      const custoSorte = state.personagem.sorte * 10;

      return 200 - gastosBase - custoSorte;
    },

    atributosFinais(state): Record<string, number> {
      const bonus = this.bonusDeAtributosRaciais
      return {
        forca: state.personagem.forca + (bonus.forca || 0),
        destreza: state.personagem.destreza + (bonus.destreza || 0),
        constituicao: state.personagem.constituicao + (bonus.constituicao || 0),
        inteligencia: state.personagem.inteligencia + (bonus.inteligencia || 0),
        carisma: state.personagem.carisma + (bonus.carisma || 0),
        sorte: state.personagem.sorte + (bonus.sorte || 0),
      }
    },

    // -------- PERICIAS --------
    periciasPorAtributo(state) {
      const mapaIdParaNome = Object.fromEntries(
        state.opcoes.atributos_base.map(attr => [attr.id, attr.nome])
      );

      return state.opcoes.pericias.reduce((acc, p) => {
        const nomeAttr = mapaIdParaNome[p.atributo_base_id] || 'Desconhecido';
        if (!acc[nomeAttr]) acc[nomeAttr] = [];
        acc[nomeAttr].push(p);
        return acc;
      }, {} as Record<string, Pericia[]>)
    },

    somaPericias(state): Record<string, number> {
      const somas: Record<string, number> = {}
      const mapa = {
        'Força': 'forca',
        'Destreza': 'destreza',
        'Constituição': 'constituicao',
        'Inteligência': 'inteligencia',
        'Carisma': 'carisma',
      }

      for (const nome in mapa) {
        somas[nome] = Object.values(state.personagem.pericias[nome] || {}).reduce(
          (s, v) => s + Number(v || 0),
          0,
        )
      }

      return somas
    },
    
  },

  actions: {
    async buscarOpcoesIniciais() {
      try {
        const [classes, racas, pericias, atributos_base] = await Promise.all([
          useApi<Classe[]>('/classes/ListaClasses'),
          useApi<RacaPrincipal[]>('/recursos/racas'),
          useApi<Pericia[]>('/recursos/pericias'),
          useApi<AtributoBase[]>('/recursos/atributosBase'),
        ])
        this.opcoes.classes = classes;
        this.opcoes.racas = racas;
        this.opcoes.pericias = pericias;
        this.opcoes.atributos_base = atributos_base;
        this.inicializarPericias()
      } catch (err) {
        console.error('Falha ao buscar opções iniciais:', err)
      }
    },

    async carregarDadosClasse(classeId: number) {
      try {
        const { proficiencias, habilidades } = await useApi<any>(`/classes/detalhes/${classeId}`);

        // ✅ Proficiencias
        this.proficiencias = (proficiencias || []) as Proficiencia[];

        // ✅ Habilidades
        this.habilidades.passivas = (habilidades || []).filter(
          (h: Habilidade) => h.tipo === 'passiva' && h.nivel_adquirido == 1
        );

        this.habilidades.ativas = (habilidades || []).filter(
          (h: Habilidade) => h.tipo === 'ativa' && h.nivel_adquirido == 1
        );

      } catch (err) {
        console.error('Erro ao carregar dados da classe:', err);
      }
    },

    async submitPersonagem() {
      this.loadingSubmit = true;
      this.submitError = null;
      this.successMessage = null;
      this.personagemCriadoId = null;

      try {
        const atributosFinais = this.atributosFinais;
        const payload = {
          ...this.personagem,
          ...atributosFinais,
          nivel: this.personagem.nivel,
          habilidades_ativas: this.personagem.habilidades_ativas,
        }

        const response = await useApi<any>('/personagens', 'POST', payload)
        this.successMessage = `Personagem "${response.nome}" criado com sucesso!`
        this.personagemCriadoId = response.id
        this.resetarFormulario()
      } catch (err: any) {
        this.submitError =
          err.response?.status === 422
            ? Object.values(err.response.data.errors).flat().join(' ')
            : err.message || 'Erro desconhecido.'
      } finally {
        this.loadingSubmit = false
      }
    },

    inicializarPericias() : void {
      const mapa: Record<string, string> = {
        'Força': 'forca',
        'Destreza': 'destreza',
        'Constituição': 'constituicao',
        'Inteligência': 'inteligencia',
        'Carisma': 'carisma',
      }

      for (const nome in mapa) {
        const chave = mapa[nome] ?? '';
        const pericias = this.periciasPorAtributo[nome] || []

        if (pericias.length > 0) {
          const valorBase = Math.floor(
            (this.personagem as any)[chave] / pericias.length,
          );

          this.personagem.pericias[nome] ??= {};

          pericias.forEach(p => {
            const periciasNome = this.personagem.pericias[nome] ?? {};
            if (periciasNome[p.nome] === undefined) {
              periciasNome[p.nome] = valorBase;
            }
          });
        }
      }
    },

    resetarFormulario() {
      this.personagem = {
        nome: '',
        classe_id: null,
        raca_id: null,
        forca: 40,
        destreza: 40,
        constituicao: 40,
        inteligencia: 40,
        carisma: 40,
        sorte: 0,
        pericias: {},
        escolhas_raciais: {},
        habilidades_ativas: {},
        habilidades_passivas: {},
        personagemCriadoId: null,
        equipamentos: {
          arma1_id: null,
          arma2_id: null,
          armadura_id: null,
        },
        nivel: 1,
        previaSecundarios: {} as AtributosSecundarios,
        atributosSecundarios: {} as AtributosSecundarios
      }
      this.racaPrincipalSelecionadaId = null
      this.proficiencias = []
      this.habilidades = { passivas: [] as Habilidade[], ativas: [] as Habilidade[] }
    },

    async buscaPreviaPersonagem() {
      try {
        const escolhas_raciais = [this.personagem.escolhas_raciais[1] || '', this.personagem.escolhas_raciais[2] || '']
        const previa: any = await useApi('/personagens/previa', 'GET', null, {
          nome: this.personagem.nome,
          nivel: this.personagem.nivel,
          forca: this.personagem.forca,
          destreza: this.personagem.destreza,
          constituicao: this.personagem.constituicao,
          inteligencia: this.personagem.inteligencia,
          carisma: this.personagem.carisma,
          sorte: this.personagem.sorte,
          classe_id: this.personagem.classe_id,
          subraca_id: this.personagem.raca_id,
          habilidades_id: [this.habilidadeSelecionada?.id ?? null],
          escolhas_raciais: escolhas_raciais ?? [],
        });

        // Atualiza os atributos secundarios previos do personagem
        if(previa) {
          this.personagem.previaSecundarios.carga = previa.carga ?? 10;
          this.personagem.previaSecundarios.jogadasSorte = previa.jogadasSorte ?? 0;
          this.personagem.previaSecundarios.velocidade = previa.velocidade ?? 5;
          this.personagem.previaSecundarios.percepcao = previa.percepcao ?? 13;
          this.personagem.previaSecundarios.vidaMaxima = previa.vidaMaxima ?? 20;
          this.personagem.previaSecundarios.recurso = previa.recurso ?? 5;
          this.personagem.previaSecundarios.tenacidade = previa.tenacidade ?? 0;
          this.personagem.previaSecundarios.defesa = previa.defesa ?? 0;
          this.personagem.previaSecundarios.defesaMagica = previa.defesaMagica ?? 0;
        }

        console.log("Personagem Previa: ", this.personagem.previaSecundarios);
        return previa;
      } 
      catch (err) {
        console.error('Erro ao buscar prévia de personagem:', err);
      }
    },


    imprimeTudo() {
      return null
      console.log('Imprime Tudo: personagem: ', this.personagem);
      console.log('Imprime Tudo: opcoes: ', this.opcoes);
      console.log('Imprime Tudo: racaPrincipalSelecionadaId: ', this.racaPrincipalSelecionadaId);
      console.log('Imprime Tudo: proficiencias: ', this.proficiencias);
      console.log('Imprime Tudo: habilidades: ', this.habilidades);
      console.log('Imprime Tudo: Habilidade selecionada: ', this.habilidadeSelecionada);
      console.log('Imprime Tudo: Personagem criado ID: ', this.personagemCriadoId);
      console.log('Imprime Tudo: Loading Submit: ', this.loadingSubmit);
      console.log('Imprime Tudo: Submit Error: ', this.submitError);
      console.log('Imprime Tudo: classe: ', this.classe);
      console.log('Imprime Tudo: opcoesSubRacas: ', this.opcoesSubRaca);
      console.log('Imprime Tudo: Modificadores de escolha: ', this.modificadoresDeEscolha);
      console.log('Imprime Tudo: pontosDeAtributoRestantes: ', this.bonusDeAtributosRaciais);
      console.log('Imprime Tudo: atributosFinais: ', this.atributosFinais);
      console.log('Imprime Tudo: periciasPorAtributo: ', this.periciasPorAtributo);
      console.log('Imprime Tudo: somaPericias: ', this.somaPericias);
    }
  },
})
