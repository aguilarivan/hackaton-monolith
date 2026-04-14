"use client"

import { useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import {
  BarChart3,
  Plus,
  Trash2,
  Check,
  Pencil,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { BusinessType } from "@/components/hero-input"

type EstadoLinea = "estimado" | "confirmado" | "pagado"

interface LineaFinanciera {
  id: string
  categoria: string
  descripcion: string
  monto: number
  estado: EstadoLinea
}

interface FinancialProjectionSectionProps {
  investment: number
  businessType?: BusinessType
}

const EXPENSE_CATEGORY_KEYS = ["personal", "local", "insumos", "marketing", "servicios", "otros"] as const
const INCOME_CATEGORY_KEYS = ["ventas", "servicios", "delivery", "eventos", "otros"] as const

const ESTADO_SIGUIENTE: Record<EstadoLinea, EstadoLinea> = {
  estimado: "confirmado",
  confirmado: "pagado",
  pagado: "estimado",
}

const ESTADO_COLORS: Record<EstadoLinea, string> = {
  estimado: "border-border bg-card text-muted-foreground",
  confirmado: "border-primary/40 bg-primary/5 text-primary",
  pagado: "border-success/40 bg-success/5 text-success",
}

interface TranslatedCategories {
  personal: string; local: string; insumos: string; marketing: string; servicios: string; otros: string
  ventas: string; delivery: string; eventos: string
}

interface TranslatedExpenses {
  employee: string; rent: string; supplies: string; utilities: string; socialAds: string
  hosting: string; digitalTools: string; digitalAds: string; freelancer: string; accountant: string
}

interface TranslatedIncomes {
  storeSales: string; delivery: string; catering: string
  subscriptions: string; consulting: string; advertising: string
}

function generateGastosIniciales(businessType: BusinessType | undefined, cat: TranslatedCategories, exp: TranslatedExpenses): Omit<LineaFinanciera, "id">[] {
  const fisica: Omit<LineaFinanciera, "id">[] = [
    { categoria: cat.personal,  descripcion: exp.employee,    monto: 350000, estado: "estimado" },
    { categoria: cat.local,     descripcion: exp.rent,        monto: 200000, estado: "estimado" },
    { categoria: cat.insumos,   descripcion: exp.supplies,    monto: 150000, estado: "estimado" },
    { categoria: cat.servicios, descripcion: exp.utilities,   monto: 40000,  estado: "estimado" },
    { categoria: cat.marketing, descripcion: exp.socialAds,   monto: 30000,  estado: "estimado" },
  ]
  const digital: Omit<LineaFinanciera, "id">[] = [
    { categoria: cat.servicios, descripcion: exp.hosting,      monto: 15000,  estado: "estimado" },
    { categoria: cat.servicios, descripcion: exp.digitalTools, monto: 25000,  estado: "estimado" },
    { categoria: cat.marketing, descripcion: exp.digitalAds,   monto: 80000,  estado: "estimado" },
    { categoria: cat.personal,  descripcion: exp.freelancer,   monto: 200000, estado: "estimado" },
    { categoria: cat.otros,     descripcion: exp.accountant,   monto: 40000,  estado: "estimado" },
  ]
  if (businessType === "digital") return digital
  if (businessType === "ambos") return [...fisica, ...digital.slice(2)]
  return fisica
}

function generateIngresosIniciales(businessType: BusinessType | undefined, cat: TranslatedCategories, inc: TranslatedIncomes): Omit<LineaFinanciera, "id">[] {
  const fisica: Omit<LineaFinanciera, "id">[] = [
    { categoria: cat.ventas,    descripcion: inc.storeSales, monto: 500000, estado: "estimado" },
    { categoria: cat.delivery,  descripcion: inc.delivery,   monto: 150000, estado: "estimado" },
    { categoria: cat.eventos,   descripcion: inc.catering,   monto: 80000,  estado: "estimado" },
  ]
  const digital: Omit<LineaFinanciera, "id">[] = [
    { categoria: cat.ventas,    descripcion: inc.subscriptions, monto: 300000, estado: "estimado" },
    { categoria: cat.servicios, descripcion: inc.consulting,    monto: 200000, estado: "estimado" },
    { categoria: cat.otros,     descripcion: inc.advertising,   monto: 80000,  estado: "estimado" },
  ]
  if (businessType === "digital") return digital
  if (businessType === "ambos") return [...fisica, ...digital.slice(1)]
  return fisica
}

let idCounter = 0
const newId = () => `linea-${++idCounter}`

function useLineas(iniciales: Omit<LineaFinanciera, "id">[]) {
  return useState<LineaFinanciera[]>(() =>
    iniciales.map((l) => ({ ...l, id: newId() }))
  )
}

function TablaLineas({
  lineas,
  categorias,
  onToggleEstado,
  onEdit,
  onDelete,
  onAdd,
  editingId,
  editDescripcion,
  editMonto,
  editCategoria,
  setEditDescripcion,
  setEditMonto,
  setEditCategoria,
  onSaveEdit,
  etiquetaAgregar,
  stateLabels,
  changeStatusTitle,
  locale,
}: {
  lineas: LineaFinanciera[]
  categorias: string[]
  onToggleEstado: (id: string) => void
  onEdit: (l: LineaFinanciera) => void
  onDelete: (id: string) => void
  onAdd: () => void
  editingId: string | null
  editDescripcion: string
  editMonto: number
  editCategoria: string
  setEditDescripcion: (v: string) => void
  setEditMonto: (v: number) => void
  setEditCategoria: (v: string) => void
  onSaveEdit: (id: string) => void
  etiquetaAgregar: string
  stateLabels: Record<EstadoLinea, string>
  changeStatusTitle: string
  locale: string
}) {
  const formatArs = (value: number) =>
    new Intl.NumberFormat(locale === "es" ? "es-AR" : "en-US", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(value)

  return (
    <div className="space-y-2">
      {lineas.map((linea) =>
        editingId === linea.id ? (
          <div
            key={linea.id}
            className="flex flex-wrap items-center gap-2 rounded-lg border border-primary/40 bg-card p-3"
          >
            <select
              className="rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground focus:border-primary focus:outline-none"
              value={editCategoria}
              onChange={(e) => setEditCategoria(e.target.value)}
            >
              {categorias.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input
              className="min-w-0 flex-1 rounded-md border border-input bg-background px-2 py-1 text-sm text-foreground focus:border-primary focus:outline-none"
              value={editDescripcion}
              onChange={(e) => setEditDescripcion(e.target.value)}
              placeholder="Descripción"
            />
            <span className="shrink-0 text-xs text-muted-foreground">ARS</span>
            <input
              type="number"
              className="w-32 rounded-md border border-input bg-background px-2 py-1 text-sm font-semibold text-foreground focus:border-primary focus:outline-none"
              value={editMonto}
              onChange={(e) => setEditMonto(Number(e.target.value))}
            />
            <button
              onClick={() => onSaveEdit(linea.id)}
              className="shrink-0 rounded-md bg-primary p-1.5 text-primary-foreground"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div
            key={linea.id}
            className={cn(
              "flex items-center gap-3 rounded-lg border p-3 transition-all",
              linea.estado === "estimado"
                ? "border-border bg-card"
                : linea.estado === "confirmado"
                ? "border-primary/30 bg-primary/5"
                : "border-success/30 bg-success/5"
            )}
          >
            {/* Botón de estado cíclico */}
            <button
              onClick={() => onToggleEstado(linea.id)}
              className={cn(
                "shrink-0 rounded-md border px-2 py-0.5 text-xs font-medium transition-all",
                ESTADO_COLORS[linea.estado]
              )}
              title={changeStatusTitle}
            >
              {stateLabels[linea.estado]}
            </button>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{linea.descripcion}</p>
              <p className="text-xs text-muted-foreground">{linea.categoria}</p>
            </div>
            <p className="shrink-0 text-sm font-semibold text-foreground">
              {formatArs(linea.monto)}
            </p>
            <div className="flex shrink-0 items-center gap-1">
              <button
                onClick={() => onEdit(linea)}
                className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                title="Editar"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onDelete(linea.id)}
                className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                title="Eliminar"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )
      )}
      <button
        onClick={onAdd}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-2.5 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
      >
        <Plus className="h-4 w-4" />
        {etiquetaAgregar}
      </button>
    </div>
  )
}

export function FinancialProjectionSection({
  investment,
  businessType,
}: FinancialProjectionSectionProps) {
  const t = useTranslations("financialSection")
  const locale = useLocale()

  const CATEGORIAS_GASTO = EXPENSE_CATEGORY_KEYS.map((k) => t(`expenseCategories.${k}`))
  const CATEGORIAS_INGRESO = INCOME_CATEGORY_KEYS.map((k) => t(`incomeCategories.${k}`))
  const ESTADO_LABELS: Record<EstadoLinea, string> = {
    estimado: t("stateLabels.estimated"),
    confirmado: t("stateLabels.confirmed"),
    pagado: t("stateLabels.paid"),
  }

  const translatedCat: TranslatedCategories = {
    personal: t("expenseCategories.personal"),
    local: t("expenseCategories.local"),
    insumos: t("expenseCategories.insumos"),
    marketing: t("expenseCategories.marketing"),
    servicios: t("expenseCategories.servicios"),
    otros: t("expenseCategories.otros"),
    ventas: t("incomeCategories.ventas"),
    delivery: t("incomeCategories.delivery"),
    eventos: t("incomeCategories.eventos"),
  }

  const translatedExp: TranslatedExpenses = {
    employee: t("defaultExpenses.employee"),
    rent: t("defaultExpenses.rent"),
    supplies: t("defaultExpenses.supplies"),
    utilities: t("defaultExpenses.utilities"),
    socialAds: t("defaultExpenses.socialAds"),
    hosting: t("defaultExpenses.hosting"),
    digitalTools: t("defaultExpenses.digitalTools"),
    digitalAds: t("defaultExpenses.digitalAds"),
    freelancer: t("defaultExpenses.freelancer"),
    accountant: t("defaultExpenses.accountant"),
  }

  const translatedInc: TranslatedIncomes = {
    storeSales: t("defaultIncomes.storeSales"),
    delivery: t("defaultIncomes.delivery"),
    catering: t("defaultIncomes.catering"),
    subscriptions: t("defaultIncomes.subscriptions"),
    consulting: t("defaultIncomes.consulting"),
    advertising: t("defaultIncomes.advertising"),
  }

  const [gastos, setGastos] = useLineas(generateGastosIniciales(businessType, translatedCat, translatedExp))
  const [ingresos, setIngresos] = useLineas(generateIngresosIniciales(businessType, translatedCat, translatedInc))

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDescripcion, setEditDescripcion] = useState("")
  const [editMonto, setEditMonto] = useState(0)
  const [editCategoria, setEditCategoria] = useState("")
  const [editingSeccion, setEditingSeccion] = useState<"gastos" | "ingresos" | null>(null)

  const formatArs = (value: number) =>
    new Intl.NumberFormat(locale === "es" ? "es-AR" : "en-US", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(value)

  // Totales
  const totalGastos = gastos.reduce((s, l) => s + l.monto, 0)
  const totalIngresos = ingresos.reduce((s, l) => s + l.monto, 0)
  const gastosConfirmados = gastos
    .filter((l) => l.estado === "confirmado" || l.estado === "pagado")
    .reduce((s, l) => s + l.monto, 0)
  const ingresosConfirmados = ingresos
    .filter((l) => l.estado === "confirmado" || l.estado === "pagado")
    .reduce((s, l) => s + l.monto, 0)
  const balanceEstimado = totalIngresos - totalGastos
  const balanceConfirmado = ingresosConfirmados - gastosConfirmados
  const capitalRestante = investment - gastosConfirmados
  const mesesRecupero =
    balanceEstimado > 0 ? Math.ceil(investment / balanceEstimado) : null

  // Handlers
  const toggleEstado = (_lineas: LineaFinanciera[], setLineas: typeof setGastos) =>
    (id: string) =>
      setLineas((prev) =>
        prev.map((l) =>
          l.id === id ? { ...l, estado: ESTADO_SIGUIENTE[l.estado] } : l
        )
      )

  const startEdit =
    (seccion: "gastos" | "ingresos") => (linea: LineaFinanciera) => {
      setEditingSeccion(seccion)
      setEditingId(linea.id)
      setEditDescripcion(linea.descripcion)
      setEditMonto(linea.monto)
      setEditCategoria(linea.categoria)
    }

  const saveEdit =
    (setLineas: typeof setGastos) => (id: string) => {
      setLineas((prev) =>
        prev.map((l) =>
          l.id === id
            ? { ...l, descripcion: editDescripcion, monto: editMonto, categoria: editCategoria }
            : l
        )
      )
      setEditingId(null)
      setEditingSeccion(null)
    }

  const deleteLinea = (setLineas: typeof setGastos) => (id: string) =>
    setLineas((prev) => prev.filter((l) => l.id !== id))

  const addGasto = () =>
    setGastos((prev) => [
      ...prev,
      { id: newId(), categoria: translatedCat.otros, descripcion: t("addExpense"), monto: 0, estado: "estimado" },
    ])

  const addIngreso = () =>
    setIngresos((prev) => [
      ...prev,
      { id: newId(), categoria: translatedCat.ventas, descripcion: t("addIncome"), monto: 0, estado: "estimado" },
    ])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">{t("title")}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {t("subtitle")}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">

          {/* Resumen financiero */}
          <div className="space-y-3">
            {/* Fila 1: inversión + capital */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs text-muted-foreground">{t("initialInvestment")}</p>
                <p className="mt-1 text-xl font-bold text-foreground">{formatArs(investment)}</p>
              </div>
              <div className={cn(
                "rounded-xl border p-4",
                capitalRestante >= 0 ? "border-border bg-card" : "border-destructive/30 bg-destructive/5"
              )}>
                <p className="text-xs text-muted-foreground">{t("availableCapital")}</p>
                <p className={cn("mt-1 text-xl font-bold", capitalRestante >= 0 ? "text-foreground" : "text-destructive")}>
                  {formatArs(capitalRestante)}
                </p>
                {gastosConfirmados > 0 && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("committed", { amount: formatArs(gastosConfirmados) })}
                  </p>
                )}
              </div>
            </div>

            {/* Fila 2: balance estimado + balance real */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className={cn(
                "rounded-xl border p-4",
                balanceEstimado > 0 ? "border-success/30 bg-success/5"
                  : balanceEstimado < 0 ? "border-destructive/30 bg-destructive/5"
                  : "border-border bg-card"
              )}>
                <p className="text-xs text-muted-foreground">{t("estimatedBalance")}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">{t("estimatedBalanceDesc")}</p>
                <div className="mt-2 flex items-center gap-1.5">
                  {balanceEstimado > 0 ? <TrendingUp className="h-4 w-4 text-success" />
                    : balanceEstimado < 0 ? <TrendingDown className="h-4 w-4 text-destructive" />
                    : <Minus className="h-4 w-4 text-muted-foreground" />}
                  <p className={cn("text-xl font-bold",
                    balanceEstimado > 0 ? "text-success" : balanceEstimado < 0 ? "text-destructive" : "text-muted-foreground"
                  )}>
                    {balanceEstimado > 0 ? "+" : ""}{formatArs(balanceEstimado)}
                  </p>
                </div>
              </div>

              <div className={cn(
                "rounded-xl border p-4",
                balanceConfirmado > 0 ? "border-success/30 bg-success/5"
                  : balanceConfirmado < 0 ? "border-destructive/30 bg-destructive/5"
                  : "border-border bg-card"
              )}>
                <p className="text-xs text-muted-foreground">{t("realBalance")}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">{t("realBalanceDesc")}</p>
                <div className="mt-2 flex items-center gap-1.5">
                  {balanceConfirmado > 0 ? <TrendingUp className="h-4 w-4 text-success" />
                    : balanceConfirmado < 0 ? <TrendingDown className="h-4 w-4 text-destructive" />
                    : <Minus className="h-4 w-4 text-muted-foreground" />}
                  <p className={cn("text-xl font-bold",
                    balanceConfirmado > 0 ? "text-success" : balanceConfirmado < 0 ? "text-destructive" : "text-muted-foreground"
                  )}>
                    {balanceConfirmado > 0 ? "+" : ""}{formatArs(balanceConfirmado)}
                  </p>
                </div>
                {ingresosConfirmados === 0 && gastosConfirmados === 0 && (
                  <p className="mt-2 text-[10px] text-muted-foreground italic">
                    {t("confirmToSee")}
                  </p>
                )}
              </div>
            </div>
          </div>

          {mesesRecupero && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-center">
              <p className="text-sm text-foreground">
                {t("recoveryMessage", { investment: formatArs(investment), months: mesesRecupero })}
              </p>
            </div>
          )}

          {/* Ingresos mensuales */}
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold text-foreground">{t("monthlyIncome")}</h4>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t("incomeDesc")}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-lg font-bold text-foreground">{formatArs(totalIngresos)}</p>
                <p className="text-xs text-muted-foreground">{t("totalPerMonth")}</p>
              </div>
            </div>
            <TablaLineas
              lineas={ingresos}
              categorias={CATEGORIAS_INGRESO}
              onToggleEstado={toggleEstado(ingresos, setIngresos)}
              onEdit={startEdit("ingresos")}
              onDelete={deleteLinea(setIngresos)}
              onAdd={addIngreso}
              editingId={editingSeccion === "ingresos" ? editingId : null}
              editDescripcion={editDescripcion}
              editMonto={editMonto}
              editCategoria={editCategoria}
              setEditDescripcion={setEditDescripcion}
              setEditMonto={setEditMonto}
              setEditCategoria={setEditCategoria}
              onSaveEdit={saveEdit(setIngresos)}
              etiquetaAgregar={t("addIncome")}
              stateLabels={ESTADO_LABELS}
              changeStatusTitle={t("changeStatus")}
              locale={locale}
            />
          </div>

          {/* Gastos mensuales */}
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold text-foreground">{t("monthlyExpenses")}</h4>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t("expensesDesc")}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-lg font-bold text-foreground">{formatArs(totalGastos)}</p>
                <p className="text-xs text-muted-foreground">{t("totalPerMonth")}</p>
              </div>
            </div>
            <TablaLineas
              lineas={gastos}
              categorias={CATEGORIAS_GASTO}
              onToggleEstado={toggleEstado(gastos, setGastos)}
              onEdit={startEdit("gastos")}
              onDelete={deleteLinea(setGastos)}
              onAdd={addGasto}
              editingId={editingSeccion === "gastos" ? editingId : null}
              editDescripcion={editDescripcion}
              editMonto={editMonto}
              editCategoria={editCategoria}
              setEditDescripcion={setEditDescripcion}
              setEditMonto={setEditMonto}
              setEditCategoria={setEditCategoria}
              onSaveEdit={saveEdit(setGastos)}
              etiquetaAgregar={t("addExpense")}
              stateLabels={ESTADO_LABELS}
              changeStatusTitle={t("changeStatus")}
              locale={locale}
            />
          </div>

          {/* Referencia de estados */}
          <div className="rounded-lg border border-border bg-secondary/20 p-4">
            <p className="mb-3 text-xs font-semibold text-foreground">{t("statusGuide")}</p>
            <div className="grid gap-2 sm:grid-cols-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="rounded-md border border-border px-2 py-0.5 text-xs font-medium text-muted-foreground">{t("statusEstimated")}</span>
                <span>{t("statusEstimatedDesc")}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-md border border-primary/40 bg-primary/5 px-2 py-0.5 text-xs font-medium text-primary">{t("statusConfirmed")}</span>
                <span>{t("statusConfirmedDesc")}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-md border border-success/40 bg-success/5 px-2 py-0.5 text-xs font-medium text-success">{t("statusPaid")}</span>
                <span>{t("statusPaidDesc")}</span>
              </div>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}
