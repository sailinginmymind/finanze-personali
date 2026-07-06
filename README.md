# 💰 Fin.Io – Gestione Finanze Personali

[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=flat-square&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

> **Fin.Io** è un'applicazione PWA per il monitoraggio delle finanze personali.  
> Gestisci entrate e spese, imposta budget, monitora obiettivi di risparmio e visualizza report dettagliati – tutto in un'unica interfaccia moderna e reattiva.

---

## ✨ Funzionalità Principali

| Area | Funzionalità |
|------|--------------|
| **📊 Dashboard** | Riepilogo saldo, grafici entrate/spese, ultime transazioni, insights mensili/annuali, proiezione fine mese |
| **💳 Transazioni** | Aggiunta, modifica, eliminazione, filtri per tipo e categoria, ricerca, caricamento a lotti (infinite scroll) |
| **📂 Categorie** | Gestione personalizzata di categorie di spesa e entrata (colori, emoji, nomi) |
| **💰 Budget** | Imposta limiti mensili per categoria, monitora il progresso con barre di avanzamento |
| **🎯 Obiettivi** | Crea obiettivi di risparmio con scadenza, contributi mensili e monitoraggio del progresso |
| **📤 Esportazione** | Report in CSV e PDF (con emoji, colori, totali e saldo) |
| **🌓 Tema** | Modalità Chiara/Scura con persistenza locale |
| **🔒 Privacy** | Toggle privacy che maschera tutti gli importi con asterischi |
| **📱 PWA** | Installabile su mobile e desktop, funziona offline, notifiche di aggiornamento |
| **🔐 Autenticazione** | Login/Registrazione con Supabase, sessione persistente ("Ricordami") |
| **🔄 Aggiornamenti** | Banner di aggiornamento con changelog integrato |

---

## 🛠️ Tecnologie Utilizzate

| Tecnologia | Descrizione |
|------------|-------------|
| **React 19** | Framework UI con Hooks e Context API |
| **Vite 8** | Build tool ultra-veloce con HMR |
| **TailwindCSS 4** | Styling utility-first e temi dinamici |
| **Supabase** | Backend serverless (Auth, Database, Storage) |
| **Recharts** | Grafici interattivi per dashboard |
| **jsPDF + autoTable** | Generazione PDF con tabelle e styling |
| **html2canvas** | Renderizzazione emoji e layout avanzati in PDF |
| **Vite PWA** | Configurazione PWA con Service Worker e Workbox |
| **React Router 7** | Routing lato client con lazy loading |
| **UUID** | Generazione ID univoci per transazioni e obiettivi |

---

## 🚀 Demo Live

👉 [Fin.Io](https://sailinginmymind.github.io/finanze-personali/)

---

## 📦 Installazione e Setup

### 1. Clona il repository

```bash
git clone https://github.com/tuo-username/finanze-personali.git
cd finanze-personali
