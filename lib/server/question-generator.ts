import type { BusinessInputData } from "@/lib/server/flow-store"

export type QuestionOption = {
  value: string
  label: string
}

export type ClarificationQuestion = {
  id: string
  title: string
  helper: string
  options: QuestionOption[]
}

export function generateClarificationQuestions(input: BusinessInputData): ClarificationQuestion[] {
  const lowerIdea = input.idea.toLowerCase()
  const isB2B = /business|corporate|empresa|b2b|saas|software/.test(lowerIdea)
  const isService = /service|servicio|consult|agencia|maintenance|cleaning/.test(lowerIdea)

  return [
    {
      id: "target-audience",
      title: "A quien queres apuntar primero?",
      helper: "Esto impacta el modelo comercial y los canales de venta iniciales.",
      options: [
        { value: "b2b", label: isB2B ? "Empresas (B2B) - recomendado para tu idea" : "Empresas (B2B)" },
        { value: "b2c", label: "Consumidor final (B2C)" },
        { value: "mixed", label: "Mixto, pero empiezo por un nicho" },
        { value: "expand", label: "Quiero ampliar este punto" },
      ],
    },
    {
      id: "execution-time",
      title: "Cuanto tiempo semanal podes dedicar al proyecto?",
      helper: "Con esto ajustamos roadmap y expectativas de traccion.",
      options: [
        { value: "low", label: "Menos de 10 horas" },
        { value: "medium", label: "Entre 10 y 25 horas" },
        { value: "high", label: "Mas de 25 horas" },
        { value: "expand", label: "Quiero ampliar este punto" },
      ],
    },
    {
      id: "advantage",
      title: isService
        ? "Cual seria tu diferencial principal en calidad del servicio?"
        : "Cual seria tu ventaja principal frente a otros?",
      helper: "Permite evaluar barreras de entrada y posicionamiento.",
      options: [
        { value: "price", label: "Precio mas competitivo" },
        { value: "speed", label: "Mejor velocidad o servicio" },
        { value: "specialization", label: "Especializacion en un problema puntual" },
        { value: "expand", label: "Quiero ampliar este punto" },
      ],
    },
  ]
}
