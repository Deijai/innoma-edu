# EduApp - Aplicativo Educacional

Um aplicativo educacional completo desenvolvido com React Native, TypeScript e Expo Router.

## 🚀 Tecnologias Utilizadas

- **React Native** - Framework para desenvolvimento mobile
- **TypeScript** - Linguagem de programação tipada
- **Expo** - Plataforma de desenvolvimento React Native
- **Expo Router** - Sistema de navegação estilo Next.js
- **Zustand** - Gerenciamento de estado
- **AsyncStorage** - Persistência local
- **Firebase** - Autenticação e armazenamento
- **expo-av** - Gravação e reprodução de áudio
- **StyleSheet** - Estilização nativa

## 📱 Funcionalidades

### Autenticação
- Login e cadastro de usuários
- Recuperação de senha
- Suporte a estudantes e professores
- Persistência de sessão

### Páginas Principais
- **Home**: Dashboard com estatísticas e visão geral
- **Tarefas**: Gerenciamento de atividades com prioridades
- **Adicionar Tarefa**: Criação de novas tarefas
- **Sala de Aula**: Visualização de aulas agendadas
- **Adicionar Aula**: Agendamento de novas aulas
- **Chat**: Conversa com bot educacional com suporte a áudio

### Recursos Avançados
- 🌙 Tema escuro/claro com persistência
- 🎵 Gravação e reprodução de áudio no chat
- 📊 Estatísticas de progresso
- 📅 Organização por datas
- 🎨 Interface moderna e responsiva
- 📱 Suporte completo a dispositivos móveis

## 🛠️ Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/eduapp.git
cd eduapp
```

2. Instale as dependências:
```bash
npm install
```

3. Configure o Firebase:
   - Crie um projeto no Firebase Console
   - Adicione as configurações em `config/firebase.ts`
   - Ative Authentication e Firestore

4. Inicie o projeto:
```bash
npm start
```

## 📁 Estrutura do Projeto

```
eduapp/
├── app/                    # Páginas da aplicação
│   ├── (auth)/            # Páginas de autenticação
│   │   ├── login.tsx      # Tela de login
│   │   ├── signup.tsx     # Tela de cadastro
│   │   └── reset-password.tsx
│   ├── (tabs)/            # Páginas principais
│   │   ├── index.tsx      # Home
│   │   ├── tasks.tsx      # Lista de tarefas
│   │   ├── add-task.tsx   # Adicionar tarefa
│   │   ├── classroom.tsx  # Sala de aula
│   │   ├── add-class.tsx  # Adicionar aula
│   │   └── chat.tsx       # Chat com bot
│   ├── _layout.tsx        # Layout principal
│   └── index.tsx          # Splash screen
├── store/                 # Gerenciamento de estado
│   ├── authStore.ts       # Estado de autenticação
│   ├── themeStore.ts      # Tema e preferências
│   └── appStore.ts        # Dados da aplicação
├── types/                 # Tipos TypeScript
│   └── index.ts
├── config/                # Configurações
│   └── firebase.ts        # Configuração Firebase
└── assets/                # Recursos estáticos
```

## 🎯 Contas para Teste

O aplicativo vem com contas pré-configuradas para teste:

**Estudante:**
- Email: joao@student.com
- Senha: 123456

**Professor:**
- Email: maria@teacher.com
- Senha: 123456

## 🔥 Funcionalidades Detalhadas

### Sistema de Tarefas
- Criação, edição e exclusão de tarefas
- Prioridades (Alta, Média, Baixa)
- Categorias (Exercícios, Prova, Trabalho, etc.)
- Datas de vencimento
- Status de conclusão
- Filtros e organização

### Sistema de Aulas
- Agendamento de aulas
- Informações do professor
- Duração e recursos
- Visualização por período
- Status (Agendada, Hoje, Concluída)

### Chat Inteligente
- Mensagens de texto
- Gravação e reprodução de áudio
- Respostas automáticas do bot
- Interface intuitiva
- Histórico de conversas

### Temas
- Modo claro e escuro
- Persistência da preferência
- Transição suave entre temas
- Cores adaptativas

## 📊 Estado da Aplicação

O aplicativo utiliza Zustand para gerenciar três principais stores:

1. **AuthStore**: Autenticação e dados do usuário
2. **ThemeStore**: Tema e preferências visuais
3. **AppStore**: Cursos, tarefas, aulas e mensagens

## 🎨 Design System

O aplicativo segue um design system consistente com:
- Cores primárias e secundárias
- Tipografia hierárquica
- Componentes reutilizáveis
- Espaçamentos padronizados
- Animações suaves

## 🔒 Segurança

- Autenticação via Firebase
- Validação de dados
- Tratamento de erros
- Proteção de rotas
- Armazenamento seguro

## 📚 Próximos Passos

- [ ] Integração completa com Firebase
- [ ] Notificações push
- [ ] Sincronização offline
- [ ] Compartilhamento de recursos
- [ ] Calendário integrado
- [ ] Sistema de notas
- [ ] Relatórios de progresso

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

Desenvolvido com ❤️ por [Seu Nome]

---

**EduApp** - Transformando a educação através da tecnologia! 🚀📚