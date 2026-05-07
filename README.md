# ImpactHub

ImpactHub est une plateforme de gestion d'église modulaire, moderne et performante, conçue pour connecter, faire grandir et déléguer au sein des communautés ecclésiales.

## 🚀 Caractéristiques

- **Esthétique "Digital Sanctuary"** : Une interface sombre, premium, avec des effets de verre (glassmorphism) et des animations 3D.
- **Architecture Modulaire** : Gestion multi-campus et multi-tenants.
- **Navigation Intelligente** : Bascule fluide entre les rôles Admin, Manager et Responsable, optimisée pour le mobile.
- **Zéro Patterns IA** : Design pur, artisanal, sans icônes ou labels générés par IA.
- **Tableaux de Bord Dédiés** :
  - **Super Admin** : Gestion des campus et des administrateurs.
  - **Manager** : Supervision locale du campus.
  - **Responsable/Pilote** : Gestion des cellules de maison et des modules spécifiques.

## 🛠 Tech Stack

- **Framework** : Next.js 14 (App Router)
- **Styling** : Tailwind CSS
- **Base de données & Auth** : Supabase
- **Animations** : Framer Motion & Three.js
- **Icônes** : Lucide React

## 📦 Installation

1. Clonez le dépôt :
   ```bash
   git clone https://github.com/Katakurisamaa/ImpactHub.git
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

3. Configurez les variables d'environnement dans un fichier `.env.local` :
   ```env
   NEXT_PUBLIC_SUPABASE_URL=votre_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clef
   ```

4. Lancez le serveur de développement :
   ```bash
   npm run dev
   ```

## 🌐 Déploiement

Optimisé pour un déploiement en un clic sur **Vercel**.

---
© 2026 ImpactHub. Propulsé par la vision ICC.
