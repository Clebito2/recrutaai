/**
 * JSON Schemas for Candidate Analysis
 * Baseado no Padrão de Inteligência em R&S (Live Consultoria / Protocolo Elite)
 */

export const SCHEMA_LIVE_RS = {
    type: "object",
    properties: {
        nome: { type: "string", description: "Nome completo do candidato identificado no CV/entrevista" },
        vaga_titulo: { type: "string", description: "Título da vaga avaliada" },
        familia_vaga: { 
            type: "string", 
            description: "Família de vaga: Comercial/Vendas | Atendimento/CS | Operações/Administrativo | Técnico/Especialista | Liderança/Gestão | Outra" 
        },
        
        // 3.1 Gate check eliminatório
        gate_check: {
            type: "object",
            description: "Verificação eliminatória dos requisitos obrigatórios da vaga",
            properties: {
                status: { type: "string", enum: ["OK", "REPROVADO"] },
                motivo: { type: "string", description: "Se reprovado, citar explicitamente qual requisito obrigatório não foi cumprido. Se OK, 'Requisitos obrigatórios atendidos'." }
            },
            required: ["status", "motivo"]
        },

        // Resumo executivo (leitura de 30 segundos)
        resumo: { 
            type: "string", 
            description: "Resumo de 2 a 3 frases: fit geral, maior força, maior risco e recomendação final" 
        },

        // 1. Trajetória e Diagnóstico Narrativo
        diagnostico_narrativo: { 
            type: "string", 
            description: "Parágrafo narrativo denso sobre trajetória, volumes, ferramentas e momentos de maturidade" 
        },

        // 2. Análise Comportamental e Roteiro STAR
        star_analysis: {
            type: "array",
            description: "Análise STAR exigindo dados quantitativos e ação individual",
            items: {
                type: "object",
                properties: {
                    situacao: { type: "string", description: "Contexto/Desafio da situação" },
                    tarefa: { type: "string", description: "Responsabilidade individual do candidato" },
                    acao: { type: "string", description: "O que ELE fez especificamente (atenção a discursos vagos)" },
                    resultado: { type: "string", description: "Resultado concreto com número, porcentagem ou métrica tangível" },
                    ponto_atencao: { type: "string", description: "Lacuna ou ponto vago identificado na resposta, se houver" }
                },
                required: ["situacao", "tarefa", "acao", "resultado"]
            }
        },

        // 3. Matriz SWOT
        swot: {
            type: "object",
            description: "Matriz SWOT profunda e sem complacência",
            properties: {
                forcas: { type: "array", items: { type: "string" }, description: "Hard skills e diferenciais comprovados por evidência" },
                fraquezas: { type: "array", items: { type: "string" }, description: "Gaps reais técnicos ou comportamentais identificados" },
                oportunidades: { type: "array", items: { type: "string" }, description: "Onde a empresa pode acelerar ou aproveitar o candidato além da vaga" },
                ameacas: { type: "array", items: { type: "string" }, description: "Riscos reais: turnover, assédio de concorrentes, desmotivação" }
            },
            required: ["forcas", "fraquezas", "oportunidades", "ameacas"]
        },

        // 4. Leitura de Temperamento
        temperamento: {
            type: "object",
            description: "Heurística de temperamento (Colérico, Sanguíneo, Melancólico, Fleumático)",
            properties: {
                perfil_estimado: { type: "string", description: "Ex: Sanguíneo-Colérico, Melancólico-Fleumático" },
                leitura_fit: { type: "string", description: "Análise qualitativa de fit com o arquétipo da função" },
                pontos_atencao: { type: "string", description: "Riscos típicos do temperamento (ex: arrogância, desorganização, falta de urgência)" }
            },
            required: ["perfil_estimado", "leitura_fit", "pontos_atencao"]
        },

        // 5. Competências e Evidências Específicas
        competencias: {
            type: "array",
            description: "Competências avaliadas com regras estritas de evidência",
            items: {
                type: "object",
                properties: {
                    nome: { type: "string", description: "Nome da competência (ex: Resiliência, Negociação, Gestão de Conflitos)" },
                    pilar: { type: "string", enum: ["comportamental", "tecnica", "pratica", "alinhamento"] },
                    nota: { type: "number", minimum: 1, maximum: 5, description: "Nota de 1 a 5" },
                    tipo_evidencia: { type: "string", enum: ["explicita", "inferencia"] },
                    evidencia: { type: "string", description: "Trecho literal do material (se explícita) ou justificativa e o que faltaria confirmar (se inferência)" }
                },
                required: ["nome", "pilar", "nota", "tipo_evidencia", "evidencia"]
            }
        },

        // 6. Scorecard Ponderado em 4 Pilares com Auditoria da Conta
        scorecard: {
            type: "object",
            description: "Scorecard em 4 pilares com pesos e conta explícita",
            properties: {
                comportamental: {
                    type: "object",
                    properties: {
                        nota: { type: "number", minimum: 1, maximum: 5 },
                        peso: { type: "number", description: "Percentual (ex: 40)" },
                        sintese: { type: "string" }
                    },
                    required: ["nota", "peso", "sintese"]
                },
                tecnica: {
                    type: "object",
                    properties: {
                        nota: { type: "number", minimum: 1, maximum: 5 },
                        peso: { type: "number", description: "Percentual (ex: 20)" },
                        sintese: { type: "string" }
                    },
                    required: ["nota", "peso", "sintese"]
                },
                pratica: {
                    type: "object",
                    properties: {
                        nota: { type: "number", minimum: 1, maximum: 5 },
                        peso: { type: "number", description: "Percentual (ex: 30)" },
                        sintese: { type: "string" }
                    },
                    required: ["nota", "peso", "sintese"]
                },
                alinhamento: {
                    type: "object",
                    properties: {
                        nota: { type: "number", minimum: 1, maximum: 5 },
                        peso: { type: "number", description: "Percentual (ex: 10)" },
                        sintese: { type: "string" }
                    },
                    required: ["nota", "peso", "sintese"]
                },
                formula_calculo: { 
                    type: "string", 
                    description: "Fórmula matemática explícita: (nota_comp × peso) + (nota_tec × peso) + (nota_prat × peso) + (nota_alin × peso) = SCORE" 
                },
                score_final_100: { type: "number", minimum: 0, maximum: 100, description: "Score final normalizado de 0 a 100" },
                score_final_5: { type: "number", minimum: 1, maximum: 5, description: "Score final na escala de 1 a 5" }
            },
            required: ["comportamental", "tecnica", "pratica", "alinhamento", "formula_calculo", "score_final_100", "score_final_5"]
        },

        // 7. Informações Faltantes (Honestidade Epistêmica)
        informacoes_faltantes: {
            type: "array",
            items: { type: "string" },
            description: "Critérios ou requisitos em que não há dado suficiente para pontuar"
        },

        // 8. Parecer Conclusivo
        recomendacao: { 
            type: "string", 
            enum: ["RECOMENDADO", "RECOMENDADO COM RESSALVAS", "NÃO RECOMENDADO"] 
        },
        justificativa: { 
            type: "string", 
            description: "Parecer conclusivo e assertivo sem inflar confiança" 
        },

        // 9. Plano de Imersão e Teste
        plano_imersao: {
            type: "array",
            description: "Timeline de primeiros dias de integração, testes e rituais",
            items: {
                type: "object",
                properties: {
                    periodo: { type: "string", description: "Ex: 'Dias 1 a 7', 'Dias 8 a 15', 'Dias 16 a 30'" },
                    foco: { type: "string", description: "Objetivo central do período" },
                    acao_validacao: { type: "string", description: "Ação prática ou teste para confirmar fit" }
                },
                required: ["periodo", "foco", "acao_validacao"]
            }
        },

        // Campos de compatibilidade para componentes legados
        perfilNivel: { type: "string" },
        nota_geral: { type: "number" },
        consistencia_dados: { type: "number" },
        red_flags: { type: "array", items: { type: "string" } }
    },
    required: [
        "nome",
        "gate_check",
        "resumo",
        "diagnostico_narrativo",
        "star_analysis",
        "swot",
        "temperamento",
        "competencias",
        "scorecard",
        "informacoes_faltantes",
        "recomendacao",
        "justificativa"
    ]
};

// Aliases para backward compatibility com rotas antigas
export const SCHEMA_TECNICO = SCHEMA_LIVE_RS;
export const SCHEMA_LIDERANCA = SCHEMA_LIVE_RS;
