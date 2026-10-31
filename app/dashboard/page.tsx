
"use client"

import { useEffect, useMemo, useState } from "react"
import type { FormEvent } from "react"
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  ClipboardList,
  Settings,
  Bell,
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  CheckCircle2,
  Clock3,
  CircleAlert,
  CalendarDays,
  UserRound,
  BriefcaseBusiness,
  TrendingUp,
  Menu,
  X,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { Calendar } from "@/components/ui/calendar"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

type Project = {
  id: string
  name: string
  description: string
  members: string
}

type Member = {
  userId: string
  name: string
  email: string
  role: string
  position: string
  birthdate: string
  phone: string
  projectId: string
  isActive: boolean
}

type Task = {
  id: string
  description: string
  projectId: string
  status: string
  priority: string
  userId: string
  dateline: string
}

const initialProjects: Project[] = [
  {
    id: "p1",
    name: "E-commerce Platform",
    description: "Plataforma de comercio electrónico con Next.js",
    members: "María García, Juan Pérez",
  },
  {
    id: "p2",
    name: "Mobile App",
    description: "Aplicación móvil con React Native",
    members: "Ana López",
  },
  {
    id: "p3",
    name: "API Gateway",
    description: "Microservicios con Node.js",
    members: "Carlos Ruiz, Laura Martínez",
  },
]

const initialMembers: Member[] = [
  {
    userId: "u1",
    name: "María García",
    email: "maria@example.com",
    role: "ADMIN",
    position: "Frontend Developer",
    birthdate: "1998-05-12",
    phone: "987654321",
    projectId: "p1",
    isActive: true,
  },
  {
    userId: "u2",
    name: "Juan Pérez",
    email: "juan@example.com",
    role: "USER",
    position: "Backend Developer",
    birthdate: "1997-08-20",
    phone: "987123456",
    projectId: "p1",
    isActive: true,
  },
  {
    userId: "u3",
    name: "Ana López",
    email: "ana@example.com",
    role: "USER",
    position: "UI/UX Designer",
    birthdate: "2000-02-15",
    phone: "986123456",
    projectId: "p2",
    isActive: false,
  },
]

const initialTasks: Task[] = [
  {
    id: "t1",
    description: "Implementar autenticación",
    projectId: "p1",
    status: "En progreso",
    priority: "Alta",
    userId: "u1",
    dateline: "2026-11-15",
  },
  {
    id: "t2",
    description: "Diseñar pantalla de perfil",
    projectId: "p2",
    status: "Pendiente",
    priority: "Media",
    userId: "u3",
    dateline: "2026-11-20",
  },
  {
    id: "t3",
    description: "Configurar CI/CD",
    projectId: "p3",
    status: "Completado",
    priority: "Alta",
    userId: "u2",
    dateline: "2026-11-10",
  },
  {
    id: "t4",
    description: "Optimizar consultas SQL",
    projectId: "p1",
    status: "En progreso",
    priority: "Urgente",
    userId: "u2",
    dateline: "2026-11-12",
  },
  {
    id: "t5",
    description: "Documentar API endpoints",
    projectId: "p3",
    status: "Pendiente",
    priority: "Baja",
    userId: "u1",
    dateline: "2026-11-25",
  },
]

const emptyMember = {
  name: "",
  email: "",
  role: "USER",
  position: "",
  birthdate: "",
  phone: "",
  projectId: "",
  isActive: true,
}

const emptyTask = {
  description: "",
  projectId: "",
  status: "Pendiente",
  priority: "Media",
  userId: "",
  dateline: "",
}

const navigation = [
  { id: "overview", label: "Resumen", icon: LayoutDashboard },
  { id: "projects", label: "Proyectos", icon: FolderKanban },
  { id: "team", label: "Equipo", icon: Users },
  { id: "tasks", label: "Tareas", icon: ClipboardList },
  { id: "settings", label: "Configuración", icon: Settings },
]

const inputClass =
  "h-11 rounded-xl border-slate-200 bg-white shadow-sm focus-visible:ring-2"

const selectClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm shadow-sm outline-none focus:ring-2 focus:ring-indigo-500"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [mobileMenu, setMobileMenu] = useState(false)

  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [tasks, setTasks] = useState<Task[]>(initialTasks)

  const [loaded, setLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const [projectName, setProjectName] = useState("")
  const [projectDescription, setProjectDescription] = useState("")
  const [projectMembers, setProjectMembers] = useState("")
  const [editingProject, setEditingProject] = useState<string | null>(null)

  const [memberForm, setMemberForm] = useState(emptyMember)
  const [editingMember, setEditingMember] = useState<string | null>(null)

  const [taskForm, setTaskForm] = useState(emptyTask)
  const [editingTask, setEditingTask] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()

  const [page, setPage] = useState(1)
  const pageSize = 5

  const [systemName, setSystemName] = useState("Nexus Dashboard")
  const [theme, setTheme] = useState("indigo")
  const [notifications, setNotifications] = useState(true)

  useEffect(() => {
    try {
      const savedProjects = localStorage.getItem("dashboard-projects")
      const savedMembers = localStorage.getItem("dashboard-members")
      const savedTasks = localStorage.getItem("dashboard-tasks")
      const savedSettings = localStorage.getItem("dashboard-settings")

      if (savedProjects) setProjects(JSON.parse(savedProjects))
      if (savedMembers) setMembers(JSON.parse(savedMembers))
      if (savedTasks) setTasks(JSON.parse(savedTasks))

      if (savedSettings) {
        const settings = JSON.parse(savedSettings)
        setSystemName(settings.systemName || "Nexus Dashboard")
        setTheme(settings.theme || "indigo")
        setNotifications(settings.notifications ?? true)
      }
    } catch {
      setMessage("No se pudieron cargar algunos datos guardados.")
    }

    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!loaded) return

    localStorage.setItem("dashboard-projects", JSON.stringify(projects))
    localStorage.setItem("dashboard-members", JSON.stringify(members))
    localStorage.setItem("dashboard-tasks", JSON.stringify(tasks))
  }, [projects, members, tasks, loaded])

  useEffect(() => {
    setPage((current) =>
      Math.min(current, Math.max(1, Math.ceil(tasks.length / pageSize)))
    )
  }, [tasks.length])

  const totalPages = Math.max(1, Math.ceil(tasks.length / pageSize))

  const visibleTasks = useMemo(() => {
    const start = (page - 1) * pageSize
    return tasks.slice(start, start + pageSize)
  }, [tasks, page])

  const completedTasks = tasks.filter(
    (task) => task.status === "Completado"
  ).length

  const pendingTasks = tasks.filter(
    (task) => task.status === "Pendiente"
  ).length

  const inProgressTasks = tasks.filter(
    (task) => task.status === "En progreso"
  ).length

  const activeMembers = members.filter((member) => member.isActive).length

  const themeClasses: Record<string, string> = {
    indigo: "bg-indigo-600 hover:bg-indigo-700",
    emerald: "bg-emerald-600 hover:bg-emerald-700",
    rose: "bg-rose-600 hover:bg-rose-700",
    orange: "bg-orange-600 hover:bg-orange-700",
  }

  const themeText: Record<string, string> = {
    indigo: "text-indigo-600",
    emerald: "text-emerald-600",
    rose: "text-rose-600",
    orange: "text-orange-600",
  }

  const themeSoft: Record<string, string> = {
    indigo: "bg-indigo-50",
    emerald: "bg-emerald-50",
    rose: "bg-rose-50",
    orange: "bg-orange-50",
  }

  const primaryButton = themeClasses[theme] || themeClasses.indigo
  const primaryText = themeText[theme] || themeText.indigo
  const primarySoft = themeSoft[theme] || themeSoft.indigo

  function showMessage(text: string) {
    setMessage(text)
    window.setTimeout(() => setMessage(""), 3500)
  }

  async function simulateRequest() {
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 700))
    setLoading(false)
  }

  function getProjectName(id: string) {
    return projects.find((project) => project.id === id)?.name || "Sin proyecto"
  }

  function getMemberName(id: string) {
    return members.find((member) => member.userId === id)?.name || "Sin asignar"
  }

  function formatDate(date: string) {
    if (!date) return "Sin fecha"
    return new Date(`${date}T12:00:00`).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  async function saveProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!projectName.trim()) {
      showMessage("El nombre del proyecto es obligatorio.")
      return
    }

    await simulateRequest()

    if (editingProject) {
      setProjects((current) =>
        current.map((project) =>
          project.id === editingProject
            ? {
                ...project,
                name: projectName,
                description: projectDescription,
                members: projectMembers,
              }
            : project
        )
      )
      showMessage("Proyecto actualizado correctamente.")
    } else {
      setProjects((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          name: projectName,
          description: projectDescription,
          members: projectMembers,
        },
      ])
      showMessage("Proyecto creado correctamente.")
    }

    setProjectName("")
    setProjectDescription("")
    setProjectMembers("")
    setEditingProject(null)
  }

  function editProject(project: Project) {
    setEditingProject(project.id)
    setProjectName(project.name)
    setProjectDescription(project.description)
    setProjectMembers(project.members)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function deleteProject(id: string) {
    if (!window.confirm("¿Deseas eliminar este proyecto?")) return

    await simulateRequest()

    setProjects((current) => current.filter((project) => project.id !== id))
    setTasks((current) => current.filter((task) => task.projectId !== id))
    setMembers((current) =>
      current.map((member) =>
        member.projectId === id ? { ...member, projectId: "" } : member
      )
    )

    showMessage("Proyecto eliminado correctamente.")
  }

  async function saveMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!memberForm.name.trim() || !memberForm.email.trim()) {
      showMessage("El nombre y correo del miembro son obligatorios.")
      return
    }

    await simulateRequest()

    if (editingMember) {
      setMembers((current) =>
        current.map((member) =>
          member.userId === editingMember
            ? { ...member, ...memberForm }
            : member
        )
      )
      showMessage("Miembro actualizado correctamente.")
    } else {
      setMembers((current) => [
        ...current,
        {
          userId: crypto.randomUUID(),
          ...memberForm,
        },
      ])
      showMessage("Miembro registrado correctamente.")
    }

    setMemberForm(emptyMember)
    setEditingMember(null)
  }

  function editMember(member: Member) {
    setEditingMember(member.userId)
    setMemberForm({
      name: member.name,
      email: member.email,
      role: member.role,
      position: member.position,
      birthdate: member.birthdate,
      phone: member.phone,
      projectId: member.projectId,
      isActive: member.isActive,
    })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function deleteMember(id: string) {
    if (!window.confirm("¿Deseas eliminar este miembro?")) return

    await simulateRequest()

    setMembers((current) => current.filter((member) => member.userId !== id))
    setTasks((current) =>
      current.map((task) =>
        task.userId === id ? { ...task, userId: "" } : task
      )
    )

    showMessage("Miembro eliminado correctamente.")
  }

  async function saveTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!taskForm.description.trim() || !taskForm.projectId) {
      showMessage("Completa la descripción y el proyecto de la tarea.")
      return
    }

    await simulateRequest()

    if (editingTask) {
      setTasks((current) =>
        current.map((task) =>
          task.id === editingTask ? { ...task, ...taskForm } : task
        )
      )
      showMessage("Tarea actualizada correctamente.")
    } else {
      setTasks((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          ...taskForm,
        },
      ])
      showMessage("Tarea creada correctamente.")
    }

    setTaskForm(emptyTask)
    setSelectedDate(undefined)
    setEditingTask(null)
    setPage(1)
  }

  function editTask(task: Task) {
    setEditingTask(task.id)
    setTaskForm({
      description: task.description,
      projectId: task.projectId,
      status: task.status,
      priority: task.priority,
      userId: task.userId,
      dateline: task.dateline,
    })

    setSelectedDate(
      task.dateline ? new Date(`${task.dateline}T12:00:00`) : undefined
    )
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function deleteTask(id: string) {
    if (!window.confirm("¿Deseas eliminar esta tarea?")) return

    await simulateRequest()
    setTasks((current) => current.filter((task) => task.id !== id))
    showMessage("Tarea eliminada correctamente.")
  }

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await simulateRequest()

    localStorage.setItem(
      "dashboard-settings",
      JSON.stringify({ systemName, theme, notifications })
    )

    showMessage("Configuración guardada correctamente.")
  }

  function changeTab(tab: string) {
    setActiveTab(tab)
    setMobileMenu(false)
  }

  if (!loaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <Spinner className="size-9 text-indigo-600" />
      </div>
    )
  }

  const pageTitle =
    navigation.find((item) => item.id === activeTab)?.label || "Resumen"

  return (
    <main className="min-h-screen bg-[#f5f6fa] text-slate-900">
      <div className="flex min-h-screen">

        {/* MENÚ LATERAL */}
        <aside className="hidden w-64 shrink-0 flex-col bg-[#111827] text-white lg:flex">
          <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
            <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-500 shadow-lg shadow-indigo-500/30">
              <LayoutDashboard className="size-5 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight">NEXUS</p>
              <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">
                Project management
              </p>
            </div>
          </div>

          <div className="px-4 py-7">
            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Menú principal
            </p>

            <nav className="space-y-1.5">
              {navigation.map((item) => {
                const Icon = item.icon
                const active = activeTab === item.id

                return (
                  <button
                    key={item.id}
                    onClick={() => changeTab(item.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
                      active
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-950/30"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon className="size-[18px]" />
                    {item.label}
                    {item.id === "tasks" && (
                      <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-xs">
                        {tasks.length}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="mt-auto p-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/15">
                  <CheckCircle2 className="size-4 text-emerald-400" />
                </div>
                <span className="text-sm font-semibold">Sistema activo</span>
              </div>
              <p className="text-xs leading-5 text-slate-400">
                Tu espacio de trabajo está listo para administrar proyectos.
              </p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-full rounded-full bg-emerald-400" />
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3 border-t border-white/10 px-2 pt-5">
              <div className="flex size-10 items-center justify-center rounded-full bg-indigo-500 text-sm font-bold">
                AD
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">Administrador</p>
                <p className="text-xs text-slate-400">Panel de control</p>
              </div>
            </div>
          </div>
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <div className="min-w-0 flex-1">

          {/* BARRA SUPERIOR */}
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-xl md:px-8">
            <div className="flex items-center gap-3">
              <button
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
                onClick={() => setMobileMenu(!mobileMenu)}
                aria-label="Abrir menú"
              >
                {mobileMenu ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
              <div>
                <p className="text-xs text-slate-400">Workspace / {pageTitle}</p>
                <h1 className="text-sm font-bold text-slate-800 md:text-base">
                  {systemName}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-400 sm:flex">
                <Search className="size-4" />
                <span>Panel de administración</span>
              </div>

              <button
                className="relative rounded-xl border border-slate-200 p-2.5 text-slate-500 transition hover:bg-slate-50"
                aria-label="Notificaciones"
              >
                <Bell className="size-[18px]" />
                {notifications && (
                  <span className="absolute right-2 top-2 size-2 rounded-full border-2 border-white bg-rose-500" />
                )}
              </button>

              <div className="flex size-9 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                AD
              </div>
            </div>
          </header>

          {/* MENÚ MÓVIL */}
          {mobileMenu && (
            <div className="border-b border-slate-200 bg-[#111827] p-3 lg:hidden">
              <nav className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => changeTab(item.id)}
                      className={`flex items-center gap-2 rounded-xl px-3 py-3 text-sm ${
                        activeTab === item.id
                          ? "bg-indigo-600 text-white"
                          : "text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      <Icon className="size-4" />
                      {item.label}
                    </button>
                  )
                })}
              </nav>
            </div>
          )}

          <div className="mx-auto max-w-[1500px] space-y-7 p-4 md:p-8">

            {/* BIENVENIDA */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#171d3b] via-[#282b65] to-indigo-700 p-6 text-white shadow-xl shadow-indigo-950/10 md:p-8">
              <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-indigo-100">
                    <span className="size-2 rounded-full bg-emerald-400" />
                    Espacio de trabajo activo
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                    ¡Bienvenido de nuevo!
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-indigo-100/80">
                    Organiza tus proyectos, coordina tu equipo y mantén todas
                    tus tareas bajo control desde un solo lugar.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                    <FolderKanban className="mb-3 size-5 text-indigo-200" />
                    <p className="text-2xl font-bold">{projects.length}</p>
                    <p className="text-xs text-indigo-100/70">Proyectos</p>
                  </div>
                  <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                    <Users className="mb-3 size-5 text-indigo-200" />
                    <p className="text-2xl font-bold">{activeMembers}</p>
                    <p className="text-xs text-indigo-100/70">Miembros activos</p>
                  </div>
                </div>
              </div>
              <div className="absolute -right-16 -top-28 size-72 rounded-full bg-indigo-400/20 blur-3xl" />
              <div className="absolute -bottom-32 right-1/3 size-64 rounded-full bg-blue-400/10 blur-3xl" />
            </section>

            {/* MENSAJES */}
            {message && (
              <Alert className="rounded-xl border-indigo-200 bg-indigo-50">
                <CheckCircle2 className="size-4 text-indigo-600" />
                <AlertTitle className="text-indigo-900">Notificación</AlertTitle>
                <AlertDescription className="text-indigo-700">
                  {message}
                </AlertDescription>
              </Alert>
            )}

            {loading && (
              <Alert className="rounded-xl">
                <Spinner className="size-4" />
                <AlertTitle>Procesando solicitud</AlertTitle>
                <AlertDescription>
                  Simulando conexión con el backend...
                </AlertDescription>
              </Alert>
            )}

            {/* RESUMEN */}
            {activeTab === "overview" && (
              <section className="space-y-6">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-800">
                      Resumen general
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Aquí tienes una vista rápida del rendimiento de tu equipo.
                    </p>
                  </div>
                  <Badge className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-700 hover:bg-emerald-50">
                    <TrendingUp className="mr-1 size-3.5" />
                    Datos actualizados
                  </Badge>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    {
                      label: "Total de proyectos",
                      value: projects.length,
                      icon: FolderKanban,
                      color: "bg-indigo-50 text-indigo-600",
                      detail: "Proyectos registrados",
                    },
                    {
                      label: "Miembros activos",
                      value: activeMembers,
                      icon: Users,
                      color: "bg-emerald-50 text-emerald-600",
                      detail: "Integrantes disponibles",
                    },
                    {
                      label: "Total de tareas",
                      value: tasks.length,
                      icon: ClipboardList,
                      color: "bg-amber-50 text-amber-600",
                      detail: "Tareas registradas",
                    },
                    {
                      label: "Tareas completadas",
                      value: completedTasks,
                      icon: CheckCircle2,
                      color: "bg-sky-50 text-sky-600",
                      detail: "Tareas finalizadas",
                    },
                  ].map((item) => {
                    const Icon = item.icon
                    return (
                      <Card key={item.label} className="rounded-2xl border-slate-200/80 shadow-sm">
                        <CardContent className="flex items-start justify-between p-5">
                          <div>
                            <p className="text-sm font-medium text-slate-500">
                              {item.label}
                            </p>
                            <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                              {item.value}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              {item.detail}
                            </p>
                          </div>
                          <div className={`flex size-11 items-center justify-center rounded-xl ${item.color}`}>
                            <Icon className="size-5" />
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                <div className="grid gap-5 xl:grid-cols-3">
                  <Card className="rounded-2xl border-slate-200/80 shadow-sm xl:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-base">Estado de las tareas</CardTitle>
                      <CardDescription>
                        Distribución de las tareas según su estado actual.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {[
                        {
                          label: "Completadas",
                          count: completedTasks,
                          color: "bg-emerald-500",
                        },
                        {
                          label: "En progreso",
                          count: inProgressTasks,
                          color: "bg-indigo-500",
                        },
                        {
                          label: "Pendientes",
                          count: pendingTasks,
                          color: "bg-amber-500",
                        },
                      ].map((item) => {
                        const percentage = tasks.length
                          ? (item.count / tasks.length) * 100
                          : 0

                        return (
                          <div key={item.label}>
                            <div className="mb-2 flex items-center justify-between text-sm">
                              <span className="font-medium text-slate-700">
                                {item.label}
                              </span>
                              <span className="text-slate-500">
                                {item.count} ({Math.round(percentage)}%)
                              </span>
                            </div>
                            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className={`h-full rounded-full transition-all ${item.color}`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl border-slate-200/80 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-base">Actividad rápida</CardTitle>
                      <CardDescription>Indicadores del equipo</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                          <CheckCircle2 className="size-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold">Completadas</p>
                          <p className="text-xs text-slate-400">Tareas finalizadas</p>
                        </div>
                        <span className="font-bold">{completedTasks}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                          <Clock3 className="size-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold">En progreso</p>
                          <p className="text-xs text-slate-400">Trabajo en curso</p>
                        </div>
                        <span className="font-bold">{inProgressTasks}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                          <CircleAlert className="size-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold">Pendientes</p>
                          <p className="text-xs text-slate-400">Por comenzar</p>
                        </div>
                        <span className="font-bold">{pendingTasks}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="rounded-2xl border-slate-200/80 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-base">Proyectos recientes</CardTitle>
                      <CardDescription>
                        Vista rápida de tus proyectos registrados.
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg"
                      onClick={() => changeTab("projects")}
                    >
                      Ver proyectos
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {projects.slice(0, 4).map((project) => (
                        <div
                          key={project.id}
                          className="flex flex-col justify-between gap-2 rounded-xl border border-slate-100 p-4 sm:flex-row sm:items-center"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`flex size-10 items-center justify-center rounded-xl ${primarySoft} ${primaryText}`}>
                              <BriefcaseBusiness className="size-5" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800">
                                {project.name}
                              </p>
                              <p className="text-xs text-slate-400">
                                {project.description}
                              </p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="w-fit rounded-lg">
                            {tasks.filter((task) => task.projectId === project.id).length} tareas
                          </Badge>
                        </div>
                      ))}
                      {projects.length === 0 && (
                        <p className="py-8 text-center text-sm text-slate-400">
                          Todavía no hay proyectos registrados.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </section>
            )}

            {/* PROYECTOS */}
            {activeTab === "projects" && (
              <section className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Gestión de proyectos</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Crea, organiza y administra los proyectos de tu equipo.
                  </p>
                </div>

                <Card className="rounded-2xl border-slate-200/80 shadow-sm">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`flex size-10 items-center justify-center rounded-xl ${primarySoft} ${primaryText}`}>
                        <Plus className="size-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          {editingProject ? "Editar proyecto" : "Nuevo proyecto"}
                        </CardTitle>
                        <CardDescription>
                          Completa la información del proyecto.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={saveProject} className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Nombre del proyecto</label>
                        <Input
                          className={inputClass}
                          value={projectName}
                          onChange={(e) => setProjectName(e.target.value)}
                          placeholder="Ej. Sistema de ventas"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Miembros del equipo</label>
                        <Input
                          className={inputClass}
                          value={projectMembers}
                          onChange={(e) => setProjectMembers(e.target.value)}
                          placeholder="Ej. María García, Juan Pérez"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium">Descripción</label>
                        <Input
                          className={inputClass}
                          value={projectDescription}
                          onChange={(e) => setProjectDescription(e.target.value)}
                          placeholder="Describe brevemente el proyecto"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2 md:col-span-2">
                        <Button type="submit" disabled={loading} className={`h-11 rounded-xl px-5 ${primaryButton}`}>
                          {loading ? <Spinner className="mr-2 size-4" /> : <Plus className="mr-2 size-4" />}
                          {editingProject ? "Guardar cambios" : "Crear proyecto"}
                        </Button>
                        {editingProject && (
                          <Button
                            type="button"
                            variant="outline"
                            className="h-11 rounded-xl"
                            onClick={() => {
                              setEditingProject(null)
                              setProjectName("")
                              setProjectDescription("")
                              setProjectMembers("")
                            }}
                          >
                            Cancelar
                          </Button>
                        )}
                      </div>
                    </form>
                  </CardContent>
                </Card>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-800">Tus proyectos</h3>
                    <p className="text-sm text-slate-500">{projects.length} proyectos registrados</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {projects.map((project) => (
                    <Card key={project.id} className="overflow-hidden rounded-2xl border-slate-200/80 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                      <div className={`h-1.5 ${primaryButton}`} />
                      <CardHeader>
                        <div className="mb-2 flex items-center justify-between">
                          <div className={`flex size-11 items-center justify-center rounded-xl ${primarySoft} ${primaryText}`}>
                            <FolderKanban className="size-5" />
                          </div>
                          <Badge variant="secondary" className="rounded-lg">
                            {tasks.filter((task) => task.projectId === project.id).length} tareas
                          </Badge>
                        </div>
                        <CardTitle className="text-base">{project.name}</CardTitle>
                        <CardDescription className="min-h-10 leading-5">
                          {project.description || "Sin descripción"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Equipo asignado
                          </p>
                          <p className="text-sm text-slate-600">
                            {project.members || "Sin miembros asignados"}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-lg"
                            onClick={() => editProject(project)}
                          >
                            <Pencil className="mr-1.5 size-3.5" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-lg"
                            onClick={() =>
                              window.alert(
                                `Proyecto: ${project.name}\nDescripción: ${project.description}\nEquipo: ${project.members || "Sin asignar"}`
                              )
                            }
                          >
                            <Eye className="mr-1.5 size-3.5" />
                            Detalles
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="rounded-lg"
                            onClick={() => deleteProject(project.id)}
                          >
                            <Trash2 className="mr-1.5 size-3.5" />
                            Eliminar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {projects.length === 0 && (
                  <Card className="rounded-2xl border-dashed shadow-none">
                    <CardContent className="py-12 text-center text-sm text-slate-400">
                      No hay proyectos. Crea tu primer proyecto usando el formulario.
                    </CardContent>
                  </Card>
                )}
              </section>
            )}

            {/* EQUIPO */}
            {activeTab === "team" && (
              <section className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Gestión del equipo</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Administra los integrantes, sus roles y asignaciones.
                  </p>
                </div>

                <Card className="rounded-2xl border-slate-200/80 shadow-sm">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`flex size-10 items-center justify-center rounded-xl ${primarySoft} ${primaryText}`}>
                        <UserRound className="size-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          {editingMember ? "Editar integrante" : "Registrar integrante"}
                        </CardTitle>
                        <CardDescription>
                          Ingresa los datos personales y laborales.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={saveMember} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Nombre completo</label>
                        <Input className={inputClass} placeholder="Nombre completo" value={memberForm.name} onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Correo electrónico</label>
                        <Input className={inputClass} type="email" placeholder="correo@ejemplo.com" value={memberForm.email} onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Teléfono</label>
                        <Input className={inputClass} placeholder="Número de teléfono" value={memberForm.phone} onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Cargo / posición</label>
                        <Input className={inputClass} placeholder="Ej. Frontend Developer" value={memberForm.position} onChange={(e) => setMemberForm({ ...memberForm, position: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Rol</label>
                        <select className={selectClass} value={memberForm.role} onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}>
                          <option value="USER">Usuario</option>
                          <option value="ADMIN">Administrador</option>
                          <option value="MANAGER">Gerente</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Fecha de nacimiento</label>
                        <Input className={inputClass} type="date" value={memberForm.birthdate} onChange={(e) => setMemberForm({ ...memberForm, birthdate: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Proyecto asignado</label>
                        <select className={selectClass} value={memberForm.projectId} onChange={(e) => setMemberForm({ ...memberForm, projectId: e.target.value })}>
                          <option value="">Sin proyecto</option>
                          {projects.map((project) => (
                            <option key={project.id} value={project.id}>{project.name}</option>
                          ))}
                        </select>
                      </div>
                      <label className="flex h-11 items-center gap-3 rounded-xl border border-slate-200 px-3 text-sm sm:mt-6">
                        <input type="checkbox" className="size-4 accent-indigo-600" checked={memberForm.isActive} onChange={(e) => setMemberForm({ ...memberForm, isActive: e.target.checked })} />
                        Miembro activo
                      </label>
                      <div className="flex flex-wrap items-center gap-2 sm:col-span-2 xl:col-span-3">
                        <Button type="submit" disabled={loading} className={`h-11 rounded-xl px-5 ${primaryButton}`}>
                          {loading ? <Spinner className="mr-2 size-4" /> : <Plus className="mr-2 size-4" />}
                          {editingMember ? "Guardar cambios" : "Registrar miembro"}
                        </Button>
                        {editingMember && (
                          <Button type="button" variant="outline" className="h-11 rounded-xl" onClick={() => { setEditingMember(null); setMemberForm(emptyMember) }}>
                            Cancelar
                          </Button>
                        )}
                      </div>
                    </form>
                  </CardContent>
                </Card>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-800">Integrantes del equipo</h3>
                    <p className="text-sm text-slate-500">{members.length} miembros registrados</p>
                  </div>
                  <Badge className="rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                    {activeMembers} activos
                  </Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {members.map((member) => (
                    <Card key={member.userId} className="rounded-2xl border-slate-200/80 shadow-sm">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${primarySoft} text-base font-bold ${primaryText}`}>
                              {member.name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <h3 className="truncate font-semibold text-slate-800">{member.name}</h3>
                              <p className="truncate text-xs text-slate-400">{member.position || "Sin cargo"}</p>
                            </div>
                          </div>
                          <Badge className={`rounded-lg ${member.isActive ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50" : "bg-slate-100 text-slate-500 hover:bg-slate-100"}`}>
                            {member.isActive ? "Activo" : "Inactivo"}
                          </Badge>
                        </div>
                        <div className="my-4 space-y-2 border-y border-slate-100 py-4 text-sm">
                          <p className="truncate text-slate-500">{member.email}</p>
                          <p className="text-slate-500">Teléfono: {member.phone || "No registrado"}</p>
                          <p className="text-slate-500">Rol: {member.role}</p>
                          <p className="text-slate-500">Proyecto: {getProjectName(member.projectId)}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1 rounded-lg" onClick={() => editMember(member)}>
                            <Pencil className="mr-1.5 size-3.5" />
                            Editar
                          </Button>
                          <Button size="sm" variant="destructive" className="flex-1 rounded-lg" onClick={() => deleteMember(member.userId)}>
                            <Trash2 className="mr-1.5 size-3.5" />
                            Eliminar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* TAREAS */}
            {activeTab === "tasks" && (
              <section className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Gestión de tareas</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Planifica actividades, asigna responsables y controla fechas.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <Card className="rounded-2xl border-slate-200/80 shadow-sm">
                    <CardContent className="flex items-center gap-3 p-4">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                        <Clock3 className="size-5" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Pendientes</p>
                        <p className="text-xl font-bold">{pendingTasks}</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl border-slate-200/80 shadow-sm">
                    <CardContent className="flex items-center gap-3 p-4">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                        <ClipboardList className="size-5" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">En progreso</p>
                        <p className="text-xl font-bold">{inProgressTasks}</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl border-slate-200/80 shadow-sm">
                    <CardContent className="flex items-center gap-3 p-4">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <CheckCircle2 className="size-5" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Completadas</p>
                        <p className="text-xl font-bold">{completedTasks}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="rounded-2xl border-slate-200/80 shadow-sm">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`flex size-10 items-center justify-center rounded-xl ${primarySoft} ${primaryText}`}>
                        <Plus className="size-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          {editingTask ? "Editar tarea" : "Crear nueva tarea"}
                        </CardTitle>
                        <CardDescription>
                          Define la actividad, el responsable y su fecha límite.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={saveTask} className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Descripción</label>
                        <Input className={inputClass} placeholder="Describe la tarea" value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Proyecto</label>
                        <select className={selectClass} value={taskForm.projectId} onChange={(e) => setTaskForm({ ...taskForm, projectId: e.target.value })}>
                          <option value="">Seleccionar proyecto</option>
                          {projects.map((project) => (
                            <option key={project.id} value={project.id}>{project.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Responsable</label>
                        <select className={selectClass} value={taskForm.userId} onChange={(e) => setTaskForm({ ...taskForm, userId: e.target.value })}>
                          <option value="">Sin responsable</option>
                          {members.map((member) => (
                            <option key={member.userId} value={member.userId}>{member.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Estado</label>
                        <select className={selectClass} value={taskForm.status} onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}>
                          <option>Pendiente</option>
                          <option>En progreso</option>
                          <option>Completado</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Prioridad</label>
                        <select className={selectClass} value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}>
                          <option>Baja</option>
                          <option>Media</option>
                          <option>Alta</option>
                          <option>Urgente</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Fecha límite</label>
                        <div className="rounded-xl border border-slate-200 p-3">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => {
                              setSelectedDate(date)
                              setTaskForm({
                                ...taskForm,
                                dateline: date
                                  ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
                                  : "",
                              })
                            }}
                            className="mx-auto"
                          />
                          <p className="mt-2 flex items-center justify-center gap-2 text-xs text-slate-500">
                            <CalendarDays className="size-3.5" />
                            {taskForm.dateline ? formatDate(taskForm.dateline) : "Selecciona una fecha"}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 md:col-span-2">
                        <Button type="submit" disabled={loading} className={`h-11 rounded-xl px-5 ${primaryButton}`}>
                          {loading ? <Spinner className="mr-2 size-4" /> : <Plus className="mr-2 size-4" />}
                          {editingTask ? "Guardar cambios" : "Crear tarea"}
                        </Button>
                        {editingTask && (
                          <Button type="button" variant="outline" className="h-11 rounded-xl" onClick={() => { setEditingTask(null); setTaskForm(emptyTask); setSelectedDate(undefined) }}>
                            Cancelar
                          </Button>
                        )}
                      </div>
                    </form>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border-slate-200/80 shadow-sm">
                  <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <CardTitle className="text-base">Listado de tareas</CardTitle>
                        <CardDescription>
                          Tienes {tasks.length} tareas registradas en el sistema.
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="rounded-lg">
                        Página {page} de {totalPages}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[850px] text-left text-sm">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                            <th className="rounded-l-lg p-4 font-semibold">Descripción</th>
                            <th className="p-4 font-semibold">Proyecto</th>
                            <th className="p-4 font-semibold">Responsable</th>
                            <th className="p-4 font-semibold">Estado</th>
                            <th className="p-4 font-semibold">Prioridad</th>
                            <th className="p-4 font-semibold">Fecha límite</th>
                            <th className="rounded-r-lg p-4 font-semibold">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {visibleTasks.map((task) => (
                            <tr key={task.id} className="border-b border-slate-100 transition hover:bg-slate-50/80">
                              <td className="p-4 font-medium text-slate-800">{task.description}</td>
                              <td className="p-4 text-slate-500">{getProjectName(task.projectId)}</td>
                              <td className="p-4 text-slate-500">{getMemberName(task.userId)}</td>
                              <td className="p-4">
                                <Badge className={`rounded-lg ${
                                  task.status === "Completado"
                                    ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                                    : task.status === "En progreso"
                                      ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-50"
                                      : "bg-amber-50 text-amber-700 hover:bg-amber-50"
                                }`}>
                                  {task.status}
                                </Badge>
                              </td>
                              <td className="p-4">
                                <Badge variant={task.priority === "Urgente" ? "destructive" : "outline"} className="rounded-lg">
                                  {task.priority}
                                </Badge>
                              </td>
                              <td className="p-4 text-slate-500">{formatDate(task.dateline)}</td>
                              <td className="p-4">
                                <div className="flex gap-1.5">
                                  <Button size="icon" variant="outline" className="size-8 rounded-lg" onClick={() => editTask(task)} aria-label="Editar tarea">
                                    <Pencil className="size-3.5" />
                                  </Button>
                                  <Button size="icon" variant="destructive" className="size-8 rounded-lg" onClick={() => deleteTask(task.id)} aria-label="Eliminar tarea">
                                    <Trash2 className="size-3.5" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {visibleTasks.length === 0 && (
                            <tr>
                              <td colSpan={7} className="p-10 text-center text-slate-400">
                                No hay tareas registradas.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-5">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              href="#"
                              onClick={(e) => {
                                e.preventDefault()
                                setPage((current) => Math.max(1, current - 1))
                              }}
                            />
                          </PaginationItem>
                          {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
                            <PaginationItem key={number}>
                              <PaginationLink
                                href="#"
                                isActive={page === number}
                                onClick={(e) => {
                                  e.preventDefault()
                                  setPage(number)
                                }}
                              >
                                {number}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          <PaginationItem>
                            <PaginationNext
                              href="#"
                              onClick={(e) => {
                                e.preventDefault()
                                setPage((current) => Math.min(totalPages, current + 1))
                              }}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  </CardContent>
                </Card>
              </section>
            )}

            {/* CONFIGURACIÓN */}
            {activeTab === "settings" && (
              <section className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Configuración</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Personaliza la apariencia y las preferencias del sistema.
                  </p>
                </div>

                <Card className="max-w-3xl rounded-2xl border-slate-200/80 shadow-sm">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`flex size-10 items-center justify-center rounded-xl ${primarySoft} ${primaryText}`}>
                        <Settings className="size-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Preferencias generales</CardTitle>
                        <CardDescription>
                          Los cambios se guardarán en este navegador.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={saveSettings} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Nombre del sistema</label>
                        <Input className={inputClass} value={systemName} onChange={(e) => setSystemName(e.target.value)} placeholder="Nombre del sistema" />
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-medium">Color principal del sistema</label>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                          {[
                            { value: "indigo", label: "Índigo", color: "bg-indigo-600" },
                            { value: "emerald", label: "Esmeralda", color: "bg-emerald-600" },
                            { value: "rose", label: "Rosa", color: "bg-rose-600" },
                            { value: "orange", label: "Naranja", color: "bg-orange-600" },
                          ].map((item) => (
                            <button
                              key={item.value}
                              type="button"
                              onClick={() => setTheme(item.value)}
                              className={`flex items-center gap-2 rounded-xl border p-3 text-sm transition ${
                                theme === item.value
                                  ? "border-slate-900 bg-slate-50 ring-2 ring-slate-200"
                                  : "border-slate-200 hover:bg-slate-50"
                              }`}
                            >
                              <span className={`size-5 rounded-full ${item.color}`} />
                              {item.label}
                              {theme === item.value && <CheckCircle2 className="ml-auto size-4" />}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                        <div>
                          <p className="text-sm font-semibold">Notificaciones</p>
                          <p className="text-xs text-slate-500">
                            Mostrar el indicador de notificaciones.
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          className="size-5 accent-indigo-600"
                          checked={notifications}
                          onChange={(e) => setNotifications(e.target.checked)}
                        />
                      </div>

                      <Button type="submit" disabled={loading} className={`h-11 rounded-xl px-6 ${primaryButton}`}>
                        {loading && <Spinner className="mr-2 size-4" />}
                        Guardar configuración
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </section>
            )}

            {/* PIE DE PÁGINA */}
            <footer className="flex flex-col justify-between gap-2 border-t border-slate-200 py-5 text-xs text-slate-400 sm:flex-row">
              <p>© 2026 {systemName}. Todos los derechos reservados.</p>
              <p className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-500" />
                Desarrollado con Next.js y shadcn/ui
              </p>
            </footer>
          </div>
        </div>
      </div>
    </main>
  )
}
