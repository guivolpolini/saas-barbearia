# Brag Plan: Barbearia Prime SaaS

## What is this app?
SaaS de agendamento online multiempresa para pequenos negócios e barbearias, com fluxo de chat interativo autônomo, painel admin completo e automações via n8n.

## The angle
Agendamento inteligente sem fricção. Chega de clientes perdendo horas em mensagens no WhatsApp: uma experiência de booking premium em dark mode com acentos dourados que fecha o horário em menos de 2 minutos direto no banco.

## Hook (first 2-3 seconds)
Um visual impactante em dark & gold (#c8a96e) com tipografia limpa e o contraste: "Chega de perder clientes no WhatsApp. Agendamento 100% autônomo."

## Key moments (the middle)
- Chat interativo em execução: seleção de serviço em pills ("Corte + Barba — R$ 60"), escolha de horário livre ("14:30") e validação anti-conflito instantânea.
- O painel administrativo completo: Dashboard com métricas do mês, agenda semanal sincronizada e controle de faturamento em tempo real.
- Arquitetura multiempresa escalável: isolamento por `business_id`, RLS no Supabase e webhook estruturado pronto para automação no n8n.

## Outro / punchline
"Stack moderna, modular e pronta para virar produto. 100% código limpo."

## User flow worth showing
1. Entrada: Chat interativo abre com assistente online
2. Ação: Seleção rápida de "Corte + Barba" e slot das "14:30"
3. Resultado: "Agendamento Confirmado!" sincronizado direto no painel do administrador

## Tone
- Preset: polished
- Creative direction: Clean, high-end SaaS product showcase tailored for tech and entrepreneurship professionals on LinkedIn.
- Interpretation: Transições suaves, tipografia com peso e hierarquia impecáveis, estética refinada dark & gold, sem exageros ou clichês, ritmo confiante e fluido.

## Format: landscape — 1920x1080
## Duration: 18s

## Visual identity (from the project)
- Background: #111111 (surface) / #1a1a1a (primary)
- Accent: #c8a96e (gold)
- Text: #f5f5f5 (white text) / #9a9a9a (muted text)
- Border: #2a2a2a
- Display font: Inter, system-ui, sans-serif
- Body font: Inter, system-ui, sans-serif
- Strongest visual element: Dark mode card aesthetics com detalhes sutis em dourado (#c8a96e) e badges modernas.

## Share copy (draft)
Construí um SaaS de agendamento online completo para barbearias e pequenos negócios: landing page moderna, chat interativo com verificação anti-conflito, painel admin completo e integração n8n para automações. Stack 100% moderna com React, Vite, Tailwind CSS e Supabase.

## Audio direction
- Role: warm professional corporate bed with subtle kinetic pulse
- Music: happy-beats-business-moves-vol-10-by-ende-dot-app.mp3
- Music treatment: volume 0.7, soft fade-in no primeiro 0.5s, swell contínuo, fade-out suave nos últimos 1.5s
- Music cue guidance: tempo 109.96 BPM; useful beat grid: 0.27s, 0.82s, 1.37s, 4.10s, 9.29s, 13.64s, 17.47s; strong beat cues para transições em ~4.5s, 9.5s, 14.0s
- Audio-reactive treatment: sutil respiro de brilho dourado e sombra nos cards principais
- SFX posture: moderado e elegante; cliques suaves nas pills de chat e badge checkmark
- Restraint rule: sem efeitos sonoros estridentes, sem alarmes, apenas texturas digitais refinadas

## Storyboard

### Scene 1 — The Hook & Identity — 4.5s
- Visual: Fundo escuro texturizado com gradiente sutil. Logo e tipografia Barbearia Prime revelam com brilho dourado.
- Headline: "SaaS de Agendamento Online"
- Subheadline: "Zero mensagens perdidas no WhatsApp. Agendamento em 2 minutos."
- Badges: "Multi-tenant" • "100% Autônomo" • "Supabase + React"
- Sequential/interaction: Logo entra com fade-up, badges aparecem sequencialmente nos beats (0.8s, 1.4s, 2.0s).
- Audio intent: Introdução limpa, estabelece o ritmo profissional da trilha sonora.
- Transition mood: Soft slide/crossfade → Scene 2

### Scene 2 — The Interactive Chat Flow — 5.0s
- Visual: Mockup de alta fidelidade do widget de Chat da aplicação real.
- Ação demonstrada:
  1. Balão do assistente: "Qual serviço você deseja?"
  2. Pills interativas: [ Corte — R$40 ] [ Barba — R$30 ] [ ★ Corte + Barba — R$60 ]
  3. Cursor/seleção ativa "Corte + Barba"
  4. Horário confirmado: "Sábado, 14:30"
  5. Card de sucesso: "✓ Horário Confirmado com Sucesso"
- Sequential/interaction: Balões e pills aparecem em sequência fluida e precisa.
- Audio intent: Sons sutis de tap e confirmação suave.
- Transition mood: Clean lateral pan → Scene 3

### Scene 3 — Admin & Architecture — 4.5s
- Visual: Visão do painel `/admin` da aplicação.
- Componentes em destaque:
  - Mini cards de KPI: "Agendamentos Hoje: 8", "Receita Mês: R$ 4.250", "Taxa de Ocupação: 94%"
  - Grid de agenda semanal dinâmica
  - Tag de arquitetura: "Multiempresa com isolamento via RLS e Supabase"
- Sequential/interaction: Cards de KPI sobem com stagger de 0.2s; gráfico de agenda acende.
- Audio intent: Sensação de controle, robustez e produto pronto.
- Transition mood: Elegant wipe → Scene 4

### Scene 4 — The Outro & Open Source — 4.0s
- Visual: Tela de fechamento com branding da solução e stack tecnológica.
- Callouts:
  - "Pronto para produção e personalizável para qualquer nicho."
  - Badges de Stack: React 19 • Vite • Tailwind v4 • Supabase • n8n
  - GitHub Link callout: `github.com/guivolpolini/saas-barbearia`
- Audio intent: Acorde final da música em fade-out perfeito com presença dourada.
