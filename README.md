# Gerador de Laudos SPT (Em Construção)

Aplicação web para gerar laudos de sondagem SPT (Standard Penetration Test) para engenharia civil.

## Funcionalidades

- Interface amigável para inserção de dados de sondagem
- Gerenciamento de camadas do solo
- Entrada de dados SPT com validação
- Visualização do laudo em tempo real
- Geração de gráficos SPT
- Exportação para PDF
- Salvamento e carregamento de dados
- Backup e restauração de dados
- Sistema de templates para reutilização de formatos comuns

## Requisitos

- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- Conexão com a internet (para carregamento das bibliotecas CDN)

## Instalação

1. Clone este repositório:
   ```
   git clone https://github.com/seu-usuario/gerador-laudos-spt.git
   ```

2. Navegue até o diretório do projeto:
   ```
   cd gerador-laudos-spt
   ```

3. Abra o arquivo `index.html` em seu navegador ou através de um servidor web local.

## Estrutura do Projeto

```
gerador-laudos-spt/
├── index.html               # Página principal
├── styles.css               # Estilos da aplicação
├── js/                      # Diretório de scripts JavaScript
│   ├── app.js               # Arquivo principal da aplicação
│   ├── tabManager.js        # Gerenciamento de abas
│   ├── soilLayerManager.js  # Gerenciamento de camadas do solo
│   ├── sptDataManager.js    # Gerenciamento de dados SPT
│   ├── chartManager.js      # Geração de gráficos
│   ├── reportGenerator.js   # Geração de relatórios
│   ├── pdfGenerator.js      # Geração de PDF
│   ├── dataStorage.js       # Armazenamento de dados
│   ├── templateManager.js   # Gerenciamento de templates
│   └── utils.js             # Funções utilitárias
```

## Como Usar

### 1. Informações Gerais

Preencha os dados básicos do relatório como número do laudo, obra, cliente, etc.

### 2. Camadas do Solo

Adicione as camadas do solo encontradas na sondagem, com suas profundidades e descrições.

### 3. Dados SPT

Informe os valores de golpes para cada profundidade da sondagem.

### 4. Observações

Adicione observações adicionais sobre a sondagem.

### 5. Visualizar Laudo

Veja uma prévia do laudo gerado e exporte para PDF.

### Salvamento e Templates

- Use a opção "Salvar Dados" para manter seus dados atuais no navegador
- Use "Salvar como Template" para criar modelos reutilizáveis
- Use "Exportar Backup" para criar um arquivo de backup completo dos seus dados

## Bibliotecas Utilizadas

- [jsPDF](https://github.com/MrRio/jsPDF) - Geração de PDF
- [html2canvas](https://html2canvas.hertzen.com/) - Captura de HTML para imagens
- [Chart.js](https://www.chartjs.org/) - Geração de gráficos

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para mais detalhes.
