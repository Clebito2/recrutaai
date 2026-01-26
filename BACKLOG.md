# Backlog do Projeto Recruit-AI

## Melhorias de Funcionalidade
- [ ] **Detecção Automática de Nível (Técnico vs Liderança)**: Implementar lógica na IA para identificar automaticamente a senioridade do currículo e ajustar os critérios de avaliação, substituindo o seletor manual removido.
- [ ] **Upload de Áudio**: Permitir upload de arquivos `.mp3`/`.wav` na aba de transcrição e integrar com API de Speech-to-Text (Whisper ou Gemini).
- [ ] **Barra de Progresso**: Adicionar feedback visual de progresso durante o upload e análise de arquivos grandes.

## Administrativo & Infraestrutura
- [ ] **Gestão Dinâmica de Assinaturas**: Criar campos no Firestore (`plan_type`, `lifetime_access`) para gerenciar planos especiais sem necessidade de "hardcode" (substituir a exceção atual do código).
- [ ] **Painel Admin**: Interface para visualizar usuários e alterar planos manualmente.

## Qualidade & Testes
- [ ] **Testes Automatizados**: Criar testes unitários para o parser de arquivos (`api/parse-file`).
- [ ] **Validação de Formatos**: Refinar a validação de arquivos corrompidos ou PDFs encriptados.
