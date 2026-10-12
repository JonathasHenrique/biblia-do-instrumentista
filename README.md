# 🎸 Bíblia do Instrumentista

[![Versão](https://img.shields.io/github/v/release/JonathasHenrique/biblia-do-instrumentista?style=flat-square&color=10b981&label=Versao)](https://github.com/JonathasHenrique/biblia-do-instrumentista/releases/latest)
[![Licença](https://img.shields.io/badge/Licenca-MIT-blue?style=flat-square)](LICENSE)
[![Plataformas](https://img.shields.io/badge/Plataformas-Linux_%7C_Android_%7C_Web-orange?style=flat-square)](#-plataformas-e-distribui%C3%A7%C3%A3o)
[![Apoiar](https://img.shields.io/badge/Apoiar-Mercado_Pago-009ee3?style=flat-square)](https://link.mercadopago.com.br/johntechdicas)
[![YouTube](https://img.shields.io/badge/YouTube-John_TechDicas-red?style=flat-square)](https://www.youtube.com/@johntechdicas)
[![Node](https://img.shields.io/badge/Node.js-v20+-339933?style=flat-square)](https://nodejs.org)
[![Capacitor](https://img.shields.io/badge/Capacitor-v8.5.2-119eff?style=flat-square)](https://capacitorjs.com)
[![Electron](https://img.shields.io/badge/Electron-v41.7.1-47848f?style=flat-square)](https://www.electronjs.org)

> **O aplicativo definitivo para instrumentistas, ministros de louvor e congregações.**  
> Afinador profissional de alta precisão, hinário da Harpa Cristã com cifras dinâmicas e partituras, e Bíblia Sagrada completa com funcionamento **100% offline**.

### 📥 Download Rápido (Versão Mais Recente)

[![Baixar APK Android](https://img.shields.io/badge/Download-Android_APK_(Latest)-3DDC84?style=for-the-badge&logo=android&logoColor=white)](https://github.com/JonathasHenrique/biblia-do-instrumentista/releases/latest/download/biblia-do-instrumentista.apk)
[![Baixar Linux AppImage](https://img.shields.io/badge/Download-Linux_AppImage_(Latest)-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/JonathasHenrique/biblia-do-instrumentista/releases/latest)
[![Ver Todas as Releases](https://img.shields.io/badge/Ver_Todas-Releases_no_GitHub-24292e?style=for-the-badge&logo=github&logoColor=white)](https://github.com/JonathasHenrique/biblia-do-instrumentista/releases)
[![Apresentação do App](https://img.shields.io/badge/Apresentação-Manual_Completo_(Prints)-d97706?style=for-the-badge&logo=appveyor&logoColor=white)](docs/APRESENTACAO_APP.md)

> 📱 **Apresentação Oficial:** Conheça todos os recursos no [**Guia de Apresentação da Bíblia do Instrumentista**](docs/APRESENTACAO_APP.md) com prints detalhados dos 4 módulos (Afinador, Harpa Cifrada, Bíblia e Metrônomo).

---

## 📋 Sumário

- [Download e Instalação Rápida](#-download-e-instala%C3%A7%C3%A3o-r%C3%A1pida)
- [Apresentação Completa do Aplicativo (Manual com Prints)](docs/APRESENTACAO_APP.md)
- [Visão Geral](#-vis%C3%A3o-geral)
- [Módulos e Funcionalidades](#-m%C3%B3dulos-e-funcionalidades)
  - [1. Afinador Digital de Alta Precisão](#1--afinador-digital-de-alta-precis%C3%A3o)
  - [2. Harpa Cristã Cifrada com Partituras](#2--harpa-crist%C3%A3-cifrada-com-partituras)
  - [3. Bíblia Sagrada ACF / ARC / TB](#3--b%C3%ADblia-sagrada-acf--arc--tb)
  - [4. Metrônomo Digital Preciso](#4--metr%C3%B4nomo-digital-preciso)
  - [5. Design e Experiência do Usuário](#5--design-e-experi%C3%AAncia-do-usu%C3%A1rio)
- [Plataformas e Distribuição](#-plataformas-e-distribui%C3%A7%C3%A3o)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Como Rodar Localmente](#-como-rodar-localmente)
- [Como Compilar para Produção](#-como-compilar-para-produ%C3%A7%C3%A3o)
  - [Linux (AppImage e .deb)](#linux-appimage-e-deb)
  - [Android (APK)](#android-apk)
- [Automação e CI/CD](#-automa%C3%A7%C3%A3o-e-cicd)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Apoie o Projeto](#-apoie-o-projeto)
- [Licença](#-licen%C3%A7a)

---

## 📥 Download e Instalação Rápida

| Plataforma | Pacote / Arquivo | Tamanho | Download Direto | Versão |
| :--- | :--- | :--- | :--- | :--- |
| **Android** (Celular / Tablet) | `biblia-do-instrumentista.apk` | ~9.1 MB | [⬇️ **Baixar APK Direto**](https://github.com/JonathasHenrique/biblia-do-instrumentista/releases/latest/download/biblia-do-instrumentista.apk) | [v1.0.2 (Latest)](https://github.com/JonathasHenrique/biblia-do-instrumentista/releases/latest) |
| **Linux Desktop** (AppImage) | `Biblia.do.Instrumentista-1.0.2.AppImage` | ~118 MB | [⬇️ **Baixar AppImage**](https://github.com/JonathasHenrique/biblia-do-instrumentista/releases/latest) | [v1.0.2 (Latest)](https://github.com/JonathasHenrique/biblia-do-instrumentista/releases/latest) |

> 📌 **Como instalar no Android:**  
> Toque no link de download acima. Quando o arquivo terminar de baixar, abra a notificação e confirme a instalação no seu aparelho. O aplicativo funciona 100% offline.  
>  
> 📌 **Como executar no Linux:**  
> Dê permissão de execução ao arquivo baixado com `chmod +x *.AppImage` ou pelas propriedades do arquivo e clique duas vezes para abrir.  
>  
> 💡 **Histórico e outras versões:** Acesse a página oficial de [**Releases no GitHub**](https://github.com/JonathasHenrique/biblia-do-instrumentista/releases).

---

## 🌟 Visão Geral

A **Bíblia do Instrumentista** foi desenvolvida para atender às necessidades práticas de músicos, instrumentistas e ministérios de louvor: reunir em uma única ferramenta rápida, estável e independente todos os recursos necessários para ensaios, ministrações e momentos devocionais, com funcionamento autônomo e sem depender de sinal de internet.

O aplicativo integra:
1. **Afinador de alta precisão** com detecção de afinação em tempo real e resposta visual clara;
2. **Os 640 hinos da Harpa Cristã** com letras tradicionais, cifras transponíveis e partituras;
3. **Bíblia Sagrada integral** com busca rápida de passagens;
4. **Metrônomo preciso** para estudo rítmico e marcação de tempo.

---

## ✨ Módulos e Funcionalidades

### 1. 🎯 Afinador Digital de Alta Precisão
- **Instrumentos Pré-Configurados**:
  - **Violão (6 Cordas)**: Afinação Standard (E A D G B E), Drop D, DADGAD, Meio Tom Abaixo (Eb Ab Db Gb Bb Eb) e afinações abertas.
  - **Contrabaixo (4 Cordas)**: Standard (E A D G), Drop D e afinações alternativas.
  - **Contrabaixo (5 Cordas)**: Standard com Si grave (B E A D G) e afinação High C (E A D G C).
  - **Modo Cromático Geral**: Reconhecimento automático de qualquer nota em instrumentos acústicos ou elétricos.
- **Detecção via Algoritmo YIN**: Alta velocidade de resposta e filtragem inteligente de ruídos ambientes.
- **Calibração de Diapasão A4**: Ajustável entre **432 Hz**, **440 Hz** (padrão internacional de concerto), **442 Hz** e **444 Hz**.
- **Interface Visual de Medição**:
  - Agulha centesimal graduada de -50 a +50 cents;
  - Exibição de frequência em Hertz (Hz) e nota identificada;
  - Indicador em destaque verde esmeralda ao atingir a afinação ideal;
  - Resposta visual clara para visualização à distância no suporte do instrumento.

### 2. 📖 Harpa Cristã Cifrada com Partituras
- **Catálogo Completo**: Todos os **640 hinos tradicionais** com letras clássicas e numeração consagrada.
- **Transposição Dinâmica de Tom**:
  - Ajuste de tom sem perda harmônica com botões `+1` / `-1` semitons;
  - Preservação da notação musical de sustenidos e bemóis.
- **Dicionário de Acordes Integrado**:
  - Diagramas visuais interativos acionados ao tocar sobre o acorde da cifra;
  - Digitações adaptadas para violão e contrabaixo.
- **Partituras em Notação ABC**:
  - Notação musical em pauta dupla: **Clave de Sol** (melodia e harmonia) e **Clave de Fá** (condução para contrabaixo).
- **Rolagem Automática (Auto-Scroll)**:
  - Velocidade ajustável para leitura contínua durante a execução musical, mantendo as mãos livres no instrumento.
- **Recursos da Versão v1.0.2**:
  - Validação e revisão canônica de todas as letras e harmonias da Harpa Cristã;
  - Inclusão das cifras completas do Hino 6 (*Na Maldição da Cruz*) em Lá bemol ($A\flat$);
  - Correção integral da letra canônica e cifras do Hino 7 (*Cristo Cura, Sim!*) e demais hinos litúrgicos (24, 26, 115, 301, 507, 509, 515, 568 e 577);
  - Painéis de controle retráteis para ampliar o espaço útil de visualização;
  - Menu lateral rápido para localização imediata de hinos por número ou título;
  - **Modo Foco** com interface minimalista para apresentações e ministrações.

### 3. 📜 Bíblia Sagrada (ACF / ARC / TB)
- **Operação 100% Offline**: Textos integrais carregados localmente, garantindo acesso instantâneo sem necessidade de conexão de dados.
- **Versões Incluídas**:
  - **ACF** (Almeida Corrigida Fiel);
  - **ARC** (Almeida Revista e Corrigida);
  - **TB** (Tradução Brasileira).
- **Navegação Prática**:
  - Acesso organizado a todos os livros do Antigo e Novo Testamento;
  - Mecanismo de busca local por palavras e termos-chave;
  - Controle de dimensionamento de texto para leitura confortável em diferentes tamanhos de tela.

### 4. ⏱️ Metrônomo Digital Preciso
- **Variação de Andamento**: Escala contínua de **30 a 250 BPM**.
- **Fórmulas de Compasso**: Compassos binários, ternários e quaternários (`2/4`, `3/4`, `4/4`, `6/8`).
- **Função Tap Tempo**: Cálculo instantâneo do andamento através de toques rítmicos na tela.
- **Geração de Áudio Precisa**: Pulsos sonoros gerados diretamente via Web Audio API, assegurando sincronismo estrito sem desvios de latência.

### 5. 🎨 Design e Experiência do Usuário
- **Identidade Visual Elegante**:
  - Fundo escuro azul-marinho profundo (`#080b12` e `#0f172a`);
  - Acentos em dourado e verde esmeralda de alta legibilidade;
  - Contraste otimizado para palcos e ambientes com pouca luz.
- **Alternador de Tema**: Alternância rápida entre Modo Escuro e Modo Claro.
- **Responsividade Total**: Layout adaptável para smartphones, tablets e computadores.

---

## 💻 Plataformas e Distribuição

| Plataforma | Pacote / Formato | Motor de Execução | Status |
| :--- | :--- | :--- | :--- |
| **Linux Desktop** | `.AppImage` e `.deb` | Electron v41 | ✅ Suportado |
| **Android** | `.apk` (Android 7.0+) | Capacitor v8 | ✅ Suportado |
| **Web / PWA** | Web App Offline | HTML5 / CSS3 / ES Modules | ✅ Suportado |

---

## 📁 Estrutura do Projeto

```
biblia-do-instrumentista/
├── android/                         # Projeto Android gerado via Capacitor
│   ├── app/
│   │   ├── build.gradle
│   │   └── src/main/AndroidManifest.xml
│   └── gradlew
├── assets/                          # Recursos visuais para empacotamento
├── css/                             # Folhas de estilo modulares
│   └── style.css                    # Design system (temas, tokens e componentes)
├── data/                            # Bases de dados locais estruturadas
│   ├── biblia_acf_completa.json     # Texto bíblico ACF
│   ├── biblia_arc.json              # Texto bíblico ARC
│   ├── biblia_tb.json               # Texto bíblico TB
│   ├── harpa_crista_640.json        # 640 hinos da Harpa Cristã
│   ├── scoresData.js                # Notação musical de partituras (ABC)
│   ├── hymnCatalog.js               # Catálogo indexado de hinos
│   ├── bibliaData.js                # Módulo de consulta bíblica
│   └── harpaData.js                 # Módulo de consulta do hinário
├── icons/                           # Ícones em múltiplas resoluções
├── js/                              # Código-fonte da aplicação
│   ├── app.js                       # Controlador principal e roteamento
│   ├── tuner.js                     # Motor de áudio do afinador (YIN)
│   ├── chords.js                    # Biblioteca e desenho de acordes
│   ├── transposer.js                # Lógica de transposição de tonalidades
│   ├── metronome.js                 # Temporização do metrônomo
│   ├── toneSelector.js              # Seleção de afinação e instrumentos
│   └── lib/                         # Bibliotecas auxiliares
├── .github/workflows/
│   └── build.yml                    # Workflow de compilação contínua (CI/CD)
├── capacitor.config.json            # Configurações do Capacitor
├── index.html                       # Estrutura principal da interface
├── main.js                          # Processo principal do Electron
├── manifest.json                    # Manifesto PWA
└── package.json                     # Metadados e scripts de automação
```

---

## 🚀 Como Rodar Localmente

### Pré-requisitos
- **Node.js** (versão 20 ou 22 recomendada)
- **npm** (versão 10 ou superior)

### 1. Clonar e Instalar Dependências
```bash
git clone https://github.com/JonathasHenrique/biblia-do-instrumentista.git
cd biblia-do-instrumentista
npm install
```

### 2. Executar no Modo Desktop (Electron)
```bash
npm start
```

### 3. Executar como Servidor Web Local
```bash
npx serve .
```

---

## 📦 Como Compilar para Produção

### Linux (AppImage e .deb)
```bash
# Gerar AppImage
npm run build:appimage

# Gerar pacote .deb
npm run build:deb

# Gerar ambos simultaneamente
npm run build:linux
```
Os arquivos gerados serão salvos na pasta `dist/`.

---

### Android (APK)
```bash
# Sincronizar arquivos com o projeto Android
npm run build:android

# Abrir no Android Studio
npm run open:android
```

Para compilar o APK diretamente via linha de comando:
```bash
cd android
chmod +x gradlew
./gradlew assembleDebug
```
O APK gerado estará em: `android/app/build/outputs/apk/debug/app-debug.apk`.

---

## 🤖 Automação e CI/CD

O repositório inclui automação completa via **GitHub Actions** (`.github/workflows/build.yml`):
- **Build Linux**: Compila o pacote `.AppImage` no ambiente Ubuntu do runner;
- **Build Android**: Configura o ambiente Java 21 e compila o `.apk`;
- **Publicação Automática**: Ao gerar tags no formato `v*` (ex.: `v1.0.1`), os artefatos são automaticamente disponibilizados como release no repositório.

---

## 🛠️ Tecnologias Utilizadas

- **Interface**: HTML5 semântico, CSS3 moderno (Custom Properties, Flexbox e Grid) e JavaScript puro (ES Modules).
- **Processamento de Áudio**: Web Audio API (`AudioContext`, `AnalyserNode`, `OscillatorNode`) e algoritmo YIN para estimação de frequência fundamental.
- **Empacotamento Desktop**: Electron e `electron-builder`.
- **Empacotamento Mobile**: Capacitor.
- **Partituras**: Renderização vetorial SVG via notação ABC.
- **Armazenamento de Dados**: Bases estruturadas em JSON de alta performance.

---

## ❤️ Apoie o Projeto

A **Bíblia do Instrumentista** é um projeto de código aberto, 100% gratuito e livre de anúncios, desenvolvido de forma independente para abençoar músicos, levitas, instrumentistas e congregações.

Se este aplicativo tem sido útil nos seus ensaios, ministrações ou estudos, você pode apoiar voluntariamente o projeto com qualquer valor para ajudar nos custos de manutenção e publicação:

[![Apoiar via Mercado Pago](https://img.shields.io/badge/Apoiar_via-Mercado_Pago-009ee3?style=for-the-badge&logo=mercadopago&logoColor=white)](https://link.mercadopago.com.br/johntechdicas)

👉 **Link de Apoio:** [link.mercadopago.com.br/johntechdicas](https://link.mercadopago.com.br/johntechdicas) *(Pix ou Cartão)*

📺 Acompanhe tutoriais, novidades e dicas no canal **[John TechDicas no YouTube](https://www.youtube.com/@johntechdicas)**!

---

## 📜 Licença

Distribuído sob a licença **MIT**. Consulte o arquivo `LICENSE` para mais detalhes.
