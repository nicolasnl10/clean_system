# CLAUDE.md

# Sistema de Gestão para Empresa de Limpeza
## Contexto do Projeto

Este projeto é um sistema web integrado com o site institucional de uma empresa de limpeza.

Hoje a operação é manual:

Fluxo atual:
Site -> Email -> Atendimento Manual -> Agendamento Manual -> Execução -> Controle Manual

Objetivo:
Centralizar toda operação em uma única plataforma.

O sistema deverá permitir:

- Captação de leads pelo site
- Gestão de clientes
- Agendamento de limpezas
- Gestão da agenda operacional
- Gestão de funcionários e equipes
- Controle de execução dos serviços
- Automação de notificações
- Dashboard gerencial

Não é um SaaS.
É um sistema proprietário para uma única empresa.

---

# Stack definida

## Frontend
- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui

## Backend
- NestJS
- REST API
- Arquitetura modular

## Banco de Dados
- PostgreSQL

## ORM
- Prisma

---

# Arquitetura de módulos

## Módulos principais

1. Autenticação
2. Clientes
3. Leads
4. Agendamentos
5. Funcionários
6. Equipes
7. Ordens de Serviço
8. Agenda / Escalas
9. Financeiro
10. Notificações
11. Dashboard

---

# Perfis de Usuário

## Admin
Acesso total ao sistema

## Atendimento
- cadastrar clientes
- criar agendamentos
- acompanhar agenda

## Supervisor
- gerenciar equipes
- acompanhar execuções
- validar ordens de serviço

## Funcionário operacional
- visualizar agenda
- iniciar e finalizar serviços
- preencher checklist

---

# Modelagem inicial do banco

## Tabela: users
```sql
id UUID PK
name VARCHAR(120)
email VARCHAR(180) UNIQUE
password_hash VARCHAR
role ENUM(
 admin,
 atendimento,
 supervisor,
 funcionario
)
active BOOLEAN
created_at TIMESTAMP
updated_at TIMESTAMP
```

---

## Tabela: clients
```sql
id UUID PK
name VARCHAR(150)
document VARCHAR(30)
email VARCHAR(180)
phone VARCHAR(30)

customer_type ENUM(
 residencial,
 comercial
)

address_street VARCHAR(200)
address_number VARCHAR(20)
address_complement VARCHAR(100)
neighborhood VARCHAR(100)
city VARCHAR(100)
state VARCHAR(50)
zip_code VARCHAR(20)

notes TEXT

created_at TIMESTAMP
updated_at TIMESTAMP
```

---

## Tabela: leads
```sql
id UUID PK

name VARCHAR(150)
email VARCHAR(180)
phone VARCHAR(30)

service_requested VARCHAR(150)

message TEXT

origin ENUM(
 site,
 whatsapp,
 telefone,
 email
)

status ENUM(
 novo,
 em_contato,
 convertido,
 perdido
)

converted_client_id UUID FK clients.id  -- preenchido quando status = convertido

created_at TIMESTAMP
```

---

## Tabela: employees
```sql
id UUID PK

user_id UUID FK users.id UNIQUE  -- vínculo com login do sistema

name VARCHAR(150)
cpf VARCHAR(20)

email VARCHAR(180)
phone VARCHAR(30)

position VARCHAR(80)

hire_date DATE

status ENUM(
 ativo,
 afastado,
 desligado
)

availability_notes TEXT

created_at TIMESTAMP
updated_at TIMESTAMP
```

---

## Tabela: teams
```sql
id UUID PK
name VARCHAR(100)
supervisor_id UUID FK users.id

created_at TIMESTAMP
```

---

## Tabela: team_members
```sql
id UUID PK
team_id UUID FK teams.id
employee_id UUID FK employees.id
created_at TIMESTAMP
```

---

## Tabela: services
Catálogo de serviços.

```sql
id UUID PK

name VARCHAR(120)

description TEXT

estimated_duration_minutes INTEGER

base_price DECIMAL(10,2)

active BOOLEAN
```

Exemplos:
- limpeza residencial
- limpeza pós obra
- limpeza comercial
- limpeza pesada
- limpeza recorrente

---

## Tabela: appointments
```sql
id UUID PK

client_id UUID FK clients.id

service_id UUID FK services.id

team_id UUID FK teams.id

scheduled_date DATE

start_time TIME
end_time TIME

status ENUM(
 agendado,
 confirmado,
 em_execucao,
 concluido,
 cancelado,
 reagendado
)

frequency ENUM(
 unico,
 semanal,
 quinzenal,
 mensal
)

parent_appointment_id UUID FK appointments.id  -- referência ao agendamento pai em séries recorrentes

notes TEXT

created_by UUID FK users.id

created_at TIMESTAMP
updated_at TIMESTAMP
```

---

## Tabela: service_orders
Cada agendamento gera uma ordem de serviço.

```sql
id UUID PK

appointment_id UUID FK appointments.id

started_at TIMESTAMP
finished_at TIMESTAMP

status ENUM(
 aberta,
 em_execucao,
 concluida
)

before_photos JSONB  -- array de paths relativos: ["uploads/os/123/before/foto1.jpg"]
after_photos JSONB   -- array de paths relativos: ["uploads/os/123/after/foto1.jpg"]

client_signature TEXT

observations TEXT

created_at TIMESTAMP
```

### Estratégia de armazenamento de fotos
- Fase atual (local): arquivos salvos em `/uploads/os/{service_order_id}/{before|after}/`
- JSONB armazena os paths relativos
- `StorageService` abstrai leitura/escrita — na migração para nuvem, só troca a implementação para S3 sem alterar o restante do sistema

---

## Tabela: service_checklist_templates
Itens padrão por tipo de serviço — pré-populam a OS automaticamente.

```sql
id UUID PK

service_id UUID FK services.id

item_name VARCHAR(150)

order_index INTEGER  -- ordenação dos itens

active BOOLEAN
```

---

## Tabela: service_checklists
```sql
id UUID PK

service_order_id UUID FK service_orders.id

template_item_id UUID FK service_checklist_templates.id  -- referência ao template de origem

item_name VARCHAR(150)

completed BOOLEAN

notes TEXT
```

Exemplos:
- banheiro higienizado
- cozinha limpa
- vidros limpos

---

## Tabela: notifications
```sql
id UUID PK

client_id UUID FK clients.id

appointment_id UUID FK appointments.id  -- agendamento relacionado (opcional)

type ENUM(
 email,
 whatsapp
)

event_type ENUM(
 confirmacao_agendamento,
 lembrete,
 pos_atendimento,
 pesquisa_satisfacao
)

message TEXT

status ENUM(
 pendente,
 enviado,
 erro
)

sent_at TIMESTAMP
created_at TIMESTAMP
```

---

## Tabela: invoices
```sql
id UUID PK

client_id UUID FK clients.id

appointment_id UUID FK appointments.id

amount DECIMAL(10,2)

status ENUM(
 pendente,
 pago,
 vencido
)

due_date DATE
paid_at TIMESTAMP
```

---

# Relacionamentos

Client
- possui muitos appointments
- possui muitos invoices

Appointment
- pertence a um client
- pertence a um service
- possui uma team
- gera service order

Team
- possui vários funcionários

Service Order
- possui checklist
- possui fotos
- pertence a um agendamento

---

# Funcionalidades principais

## CRM
- cadastro de clientes
- histórico
- recorrências
- observações

## Agenda
- calendário operacional
- drag and drop para reagendamento
- conflitos de agenda
- visualização por equipe

## Operação
- ordem de serviço
- checklist
- fotos antes/depois
- assinatura cliente

## Automação
Enviar automático:
- confirmação de agendamento
- lembrete
- pós atendimento
- pesquisa de satisfação

---

# Dashboard KPIs
Mostrar:

- clientes ativos
- serviços agendados hoje
- serviços concluídos
- taxa ocupação agenda
- produtividade por equipe
- faturamento mês
- clientes recorrentes

---

# Regras de negócio importantes

1.
Não permitir dupla alocação de equipe no mesmo horário.

2.
Detectar conflito de agenda.

3.
Serviços recorrentes podem gerar agendamentos automáticos.

4.
Ao concluir ordem de serviço:
- marcar agendamento como concluído
- registrar histórico cliente
- disparar mensagem pós-serviço

5.
Fotos antes/depois obrigatórias em alguns tipos de serviço.

---

# Estrutura esperada do projeto

/apps/web
/apps/api

Frontend separado do backend.

Arquitetura modular.

Seguir:
- Clean code
- SOLID
- DDD light
- Prisma migrations
- DTOs e validações
- documentação via Swagger

---

# Roadmap

Fase 1 (MVP)
- clientes
- agenda
- funcionários
- agendamentos
- ordens de serviço

Fase 2
- automações
- dashboard
- financeiro

Fase 3
- app/PWA equipe campo
- roteirização
- BI avançado

---

# Diretriz para Claude Code

Sempre priorizar:

- código escalável
- tipagem forte
- arquitetura modular
- componentes reutilizáveis
- segurança
- performance
- UX simples e limpa

Ao gerar código:
- considerar produção desde o início
- usar boas práticas NestJS + Next.js
- sugerir melhorias quando fizer sentido
- evitar overengineering

---

# Fluxo de Git

## Regra obrigatória para toda alteração:

1. Criar uma branch nova antes de qualquer implementação
2. Nomear a branch de forma descritiva: `feat/nome-da-feature`, `fix/nome-do-fix`, `chore/nome-da-tarefa`
3. Fazer commit das alterações na branch
4. Fazer push para o GitHub
5. **Aguardar aprovação do usuário** antes de qualquer merge
6. Só realizar o merge quando o usuário confirmar que testou e está tudo OK

## Nunca:
- Fazer merge direto sem aprovação
- Commitar direto na `main` ou `develop`
- Fazer push forçado