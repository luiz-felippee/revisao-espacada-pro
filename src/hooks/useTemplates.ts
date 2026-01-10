import { useMemo } from 'react';

export interface Template {
    id: string;
    type: 'theme' | 'task' | 'goal' | 'project';
    name: string;
    description: string;
    category: string;
    icon: string;
    data: any;
}

// Pre-defined Theme Templates
const THEME_TEMPLATES: Template[] = [
    {
        id: 'theme-matematica',
        type: 'theme',
        name: 'Matemática Discreta',
        description: 'Fundamentos de matemática para computação',
        category: 'Exatas',
        icon: '📐',
        data: {
            suggestedSubthemes: ['Lógica Proposicional', 'Teoria dos Conjuntos', 'Grafos', 'Combinatória'],
            color: '#3b82f6',
        },
    },
    {
        id: 'theme-prog-web',
        type: 'theme',
        name: 'Programação Web',
        description: 'Desenvolvimento web moderno full-stack',
        category: 'Tecnologia',
        icon: '💻',
        data: {
            suggestedSubthemes: ['HTML & CSS', 'JavaScript', 'React', 'Backend & APIs'],
            color: '#8b5cf6',
        },
    },
    {
        id: 'theme-lingua',
        type: 'theme',
        name: 'Língua Estrangeira',
        description: 'Aprendizado de novo idioma',
        category: 'Idiomas',
        icon: '🌍',
        data: {
            suggestedSubthemes: ['Vocabulário', 'Gramática', 'Conversação', 'Escrita'],
            color: '#10b981',
        },
    },
    {
        id: 'theme-fisica',
        type: 'theme',
        name: 'Física Moderna',
        description: 'Mecânica quântica e relatividade',
        category: 'Exatas',
        icon: '⚛️',
        data: {
            suggestedSubthemes: ['Mecânica Quântica', 'Relatividade', 'Física Nuclear', 'Partículas'],
            color: '#f59e0b',
        },
    },
];

// Pre-defined Project Templates
const PROJECT_TEMPLATES: Template[] = [
    {
        id: 'project-produto',
        type: 'project',
        name: 'Lançamento de Produto',
        description: 'Do conceito ao mercado',
        category: 'Profissional',
        icon: '🚀',
        data: {
            category: 'professional',
            milestones: [
                'Pesquisa de Mercado',
                'Design & Prototipagem',
                'Desenvolvimento',
                'Testes & QA',
                'Marketing & Launch',
            ],
        },
    },
    {
        id: 'project-tcc',
        type: 'project',
        name: 'Trabalho de Conclusão (TCC)',
        description: 'Projeto acadêmico estruturado',
        category: 'Acadêmico',
        icon: '🎓',
        data: {
            category: 'academic',
            milestones: [
                'Definição do Tema',
                'Revisão Bibliográfica',
                'Metodologia',
                'Coleta de Dados',
                'Escrita Final',
                'Defesa',
            ],
        },
    },
    {
        id: 'project-pessoal',
        type: 'project',
        name: 'Projeto Pessoal',
        description: 'Organização flexível',
        category: 'Pessoal',
        icon: '🏠',
        data: {
            category: 'personal',
            milestones: [
                'Planejamento',
                'Execução Fase 1',
                'Execução Fase 2',
                'Revisão & Ajustes',
            ],
        },
    },
];

// Pre-defined Task Templates
const TASK_TEMPLATES: Template[] = [
    {
        id: 'task-prova',
        type: 'task',
        name: 'Estudar para Prova',
        description: 'Preparação focada para avaliação',
        category: 'Estudo',
        icon: '📖',
        data: {
            priority: 'high' as const,
            durationMinutes: 120,
            type: 'period' as const,
        },
    },
    {
        id: 'task-exercicios',
        type: 'task',
        name: 'Fazer Exercícios',
        description: 'Prática de exercícios da matéria',
        category: 'Estudo',
        icon: '✍️',
        data: {
            priority: 'medium' as const,
            durationMinutes: 60,
            type: 'recurring' as const,
        },
    },
    {
        id: 'task-revisao',
        type: 'task',
        name: 'Revisar Anotações',
        description: 'Revisão do conteúdo estudado',
        category: 'Estudo',
        icon: '📝',
        data: {
            priority: 'medium' as const,
            durationMinutes: 30,
            type: 'day' as const,
        },
    },
];

// Pre-defined Goal Templates
const GOAL_TEMPLATES: Template[] = [
    {
        id: 'goal-ler',
        type: 'goal',
        name: 'Ler Diariamente',
        description: 'Hábito de leitura consistente',
        category: 'Hábito',
        icon: '📚',
        data: {
            type: 'habit' as const,
            isHabit: true,
            recurrence: [0, 1, 2, 3, 4, 5, 6], // All days
            durationMinutes: 30,
        },
    },
    {
        id: 'goal-curso',
        type: 'goal',
        name: 'Completar Curso Online',
        description: 'Finalizar curso com certificado',
        category: 'Aprendizado',
        icon: '🎓',
        data: {
            type: 'checklist' as const,
            checklist: [
                { id: '1', text: 'Módulo 1', completed: false },
                { id: '2', text: 'Módulo 2', completed: false },
                { id: '3', text: 'Módulo 3', completed: false },
                { id: '4', text: 'Projeto Final', completed: false },
            ],
        },
    },
    {
        id: 'goal-exercicios',
        type: 'goal',
        name: 'Resolver 100 Exercícios',
        description: 'Meta quantitativa de exercícios',
        category: 'Prática',
        icon: '💪',
        data: {
            type: 'simple' as const,
            targetValue: 100,
            currentValue: 0,
            unit: 'exercícios',
        },
    },
];

export const useTemplates = () => {
    const allTemplates = useMemo(() => [
        ...THEME_TEMPLATES,
        ...PROJECT_TEMPLATES,
        ...TASK_TEMPLATES,
        ...GOAL_TEMPLATES,
    ], []);

    const getTemplatesByType = (type: Template['type']) => {
        return allTemplates.filter(t => t.type === type);
    };

    const getTemplateById = (id: string) => {
        return allTemplates.find(t => t.id === id);
    };

    const searchTemplates = (query: string) => {
        const term = query.toLowerCase();
        return allTemplates.filter(t =>
            t.name.toLowerCase().includes(term) ||
            t.description.toLowerCase().includes(term) ||
            t.category.toLowerCase().includes(term)
        );
    };

    return {
        allTemplates,
        themeTemplates: THEME_TEMPLATES,
        projectTemplates: PROJECT_TEMPLATES,
        taskTemplates: TASK_TEMPLATES,
        goalTemplates: GOAL_TEMPLATES,
        getTemplatesByType,
        getTemplateById,
        searchTemplates,
    };
};
