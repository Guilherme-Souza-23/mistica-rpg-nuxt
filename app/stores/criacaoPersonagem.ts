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
}
interface Pericia {
  id: number
  nome: string
  atributo_base: string
}
interface Habilidade {
  id: number
  nome: string
  habilidade: {
    tipo: 'ativa' | 'passiva',
    id: number,
    nome: string,
    descricao: string,
  }
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
      sorte: 0, // tratado separadamente
      pericias: {} as Record<string, Record<string, number>>,
      escolhas_raciais: {} as Record<string, string>,
      habilidades_ativas: {} as Record<number, number>, // <nivel, id da habilidade>
      personagemCriadoId: null as number | null,
      nivel: 1,
    },
    opcoes: {
      racas: [] as RacaPrincipal[],
      classes: [] as Classe[],
      pericias: [] as Pericia[],
    },
    racaPrincipalSelecionadaId: null as number | null,
    proficiencias: [] as Proficiencia[],

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
      const pontosOk = this.pontosDeAtributoRestantes === 0
      const gruposNecessarios = this.modificadoresDeEscolha.length
      const gruposEscolhidos = Object.keys(state.personagem.escolhas_raciais).length

      // Habilidades ativas: todas as que possuem opções devem ter uma escolhida
      const habilidadesOk = this.habilidades.ativas.every(
        grupo => !!state.personagem.habilidades_ativas[grupo[0].nivel],
      )

      return pontosOk && gruposNecessarios === gruposEscolhidos && habilidadesOk
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
        const chave = mapa[nomeVisivel]
        const pericias = Object.values(state.personagem.pericias[nomeVisivel] || {}) as number[]

        if (pericias.length < 4) return false

        const soma = pericias.reduce((s, v) => s + v, 0)
        if (soma !== this.atributosFinais[chave]) return false
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
          grupos[mod.grupo_escolha].push(mod)
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
          const valor = parseInt(mod.valor.replace('+', ''))
          bonus[mod.chave] = (bonus[mod.chave] || 0) + valor
        }
      })

      // Escolha
      for (const grupo in state.personagem.escolhas_raciais) {
        const chave = state.personagem.escolhas_raciais[grupo]
        const escolhido = todos.find(m => m.grupo_escolha == parseInt(grupo) && m.chave === chave)
        if (escolhido) {
          const valor = parseInt(escolhido.valor.replace('+', ''))
          bonus[chave] = (bonus[chave] || 0) + valor
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
        state.personagem.carisma

      // Sorte é especial → cada ponto custa 10
      const custoSorte = state.personagem.sorte * 10

      return 200 - gastosBase - custoSorte
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
      return state.opcoes.pericias.reduce((acc, p) => {
        const attr = p.atributo_base
        if (!acc[attr]) acc[attr] = []
        acc[attr].push(p)
        return acc
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
        const [classes, racas, pericias] = await Promise.all([
          useApi<Classe[]>('/recursos/classes'),
          useApi<RacaPrincipal[]>('/recursos/racas'),
          useApi<Pericia[]>('/recursos/pericias'),
        ])
        this.opcoes.classes = classes
        this.opcoes.racas = racas
        this.opcoes.pericias = pericias
        this.inicializarPericias()
      } catch (err) {
        console.error('Falha ao buscar opções iniciais:', err)
      }
    },

    async carregarDadosClasse(classeId: number) {
      try {
        const { proficiencias, habilidades } = await useApi<any>(`/recursos/classes/${classeId}`);

        // ✅ Proficiencias
        this.proficiencias = (proficiencias || []) as Proficiencia[];

        // ✅ Habilidades
        this.habilidades.passivas = (habilidades || []).filter(
          (h: Habilidade) => h.habilidade.tipo === 'passiva',
        ).filter((h: Habilidade) => h.nivel_adquirido == 1);

        this.habilidades.ativas = (habilidades || []).filter(
          (h: Habilidade) => h.habilidade.tipo === 'ativa',
        ).filter((h: Habilidade) => h.nivel_adquirido == 1);


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

    inicializarPericias() {
      const mapa: Record<string, string> = {
        'Força': 'forca',
        'Destreza': 'destreza',
        'Constituição': 'constituicao',
        'Inteligência': 'inteligencia',
        'Carisma': 'carisma',
      }

      for (const nome in mapa) {
        const chave = mapa[nome]
        const pericias = this.periciasPorAtributo[nome] || []

        if (pericias.length > 0) {
          const valorBase = Math.floor(
            (this.personagem as any)[chave] / pericias.length,
          )

          if (!this.personagem?.pericias?.[nome]) this.personagem.pericias = this.personagem.pericias || {};
          this.personagem.pericias[nome] = this.personagem.pericias[nome] || {};

          pericias.forEach(p => {
            if (this.personagem.pericias[nome][p.nome] === undefined) {
              this.personagem.pericias[nome][p.nome] = valorBase
            }
          })
        }
      }
    },

    resetarFormulario() {
      this.personagem = {
        nome: '',
        classe_id: null,
        raca_id: null,
        forca: 30,
        destreza: 30,
        constituicao: 30,
        inteligencia: 30,
        carisma: 30,
        sorte: 0,
        pericias: {},
        escolhas_raciais: {},
        habilidades_ativas: {},
        personagemCriadoId: null,
        nivel: 1,
      }
      this.racaPrincipalSelecionadaId = null
      this.proficiencias = []
      this.habilidades = { passivas: [], ativas: [] }
    },
  },
})
