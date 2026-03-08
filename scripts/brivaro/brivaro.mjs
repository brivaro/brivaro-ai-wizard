import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import prompts from 'prompts';
import pc from 'picocolors';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../');
const SKILLS_DIR = path.join(REPO_ROOT, 'skills');

// --- RUTAS DE ARCHIVOS DE PROYECTO ---
const AGENTS_MD_PATH = path.join(REPO_ROOT, 'AGENTS.md');
const PRD_MD_PATH = path.join(REPO_ROOT, 'PRD.md');
const RFC_MD_PATH = path.join(REPO_ROOT, 'RFC.md');

// --- TEMPLATES PARA IA ---
const PRD_TEMPLATE = `# Product Requirements Document (PRD)

## 1. Problema
¿Qué problema estamos resolviendo? ¿Quién lo sufre?

## 2. Objetivos
- Objetivo principal: 
- Métricas de éxito:

## 3. Historias de Usuario
- Como [usuario], quiero [acción] para [beneficio].

## 4. Alcance (Out of Scope)
- Qué entra:
- Qué queda fuera (No Goals):

## 5. Diseño y UX
- Diagramas de flujo o flujos de usuario (referencias).
`;

const RFC_TEMPLATE = `# Request for Comments (RFC)

## 1. Resumen
Propuesta técnica para implementar [Nombre de la feature].

## 2. Arquitectura
- Componentes involucrados:
- Cambios en base de datos (Schema):

## 3. Alternativas descartadas
- ¿Por qué esta solución es mejor que X?

## 4. Riesgos y Trade-offs
- Seguridad:
- Performance:
`;

const AGENTS_TEMPLATE = `# AGENTS.md

Contexto, reglas y convenciones de este proyecto para los asistentes de IA.

## Cómo usar esta guía

- Empieza aquí para normas transversales del repositorio.
- Cada componente puede tener su propio \`AGENTS.md\` que sea específica de ese componente. 
- En el \`AGENTS.md\` raíz se listan el resto de los \`AGENTS.md\`, las skills disponibles y las reglas generales.

## Secciones recomendadas

- **How to Use This Guide:** Indica cómo y cuándo seguir estas reglas.
- **Available Skills:** Lista breve de skills comunes y su ruta (por ejemplo: skills/typescript/SKILL.md).
- **Auto-invoke Rules:** Acciones que deben invocar una skill específica antes de modificar código.
- **Project Overview:** Resumen corto de componentes y tecnologías.
- **Commit & PR Guidelines:** Estilo de commits, checklist de PR y requisitos de CI.

## Ejemplo rápido de "Available Skills"

- typescript: patrones de tipos y utilidades — skills/typescript/SKILL.md
- nextjs-15: App Router y Server Actions — skills/nextjs-15/SKILL.md
- ai-sdk-5: mensajería, streaming — skills/ai-sdk-5/SKILL.md

## Buenas prácticas

- Mantén las entradas de \`SKILL.md\` pequeñas y enfocadas.
- Cuando crees una nueva skill, actualiza la sección "Available Skills".
- Para cambios en infra/CI, añade la skill correspondiente en la tabla "Auto-invoke Rules".

## Antes de crear un PR

1. Sigue la convención de commits: \`<type>[scope]: <descripción>\` (feat, fix, docs, chore, test).
2. Ejecuta linters y tests relevantes.
3. Añade una entrada de changelog si aplica.
`;

// --- CONFIGURACIÓN EXACTA DE AGENTES (Solicitada) ---
const AGENTS =[
  { id: 'universal', name: 'Universal (Cursor, Cline, OpenCode, Amp, Kimi, Replit)', dir: '.agents/skills', extra: null },
  { id: 'copilot', name: 'GitHub Copilot', dir: '.github/skills', extra: { src: 'AGENTS.md', dest: '.github/copilot-instructions.md' } },
  { id: 'claude', name: 'Claude Code', dir: '.claude/skills', extra: { src: 'AGENTS.md', dest: 'CLAUDE.md' } },
  { id: 'gemini', name: 'Gemini CLI', dir: '.gemini/skills', extra: { src: 'AGENTS.md', dest: 'GEMINI.md' } },
  { id: 'codex', name: 'Codex (OpenAI)', dir: '.codex/skills', extra: null },
  { id: 'windsurf', name: 'Windsurf', dir: '.windsurf/skills', extra: null },
  { id: 'antigravity', name: 'Antigravity', dir: '.agent/skills', extra: null },
  { id: 'trae', name: 'Trae / Trae CN', dir: '.trae/skills', extra: null },
  { id: 'qwen', name: 'Qwen Code', dir: '.qwen/skills', extra: null },
];

function logStep(text) {
  console.log(pc.cyan('ℹ') + ' ' + text);
}

async function main() {
  console.clear();
  console.log(pc.bgCyan(pc.black(pc.bold(' 🤖 SKILLS BRIVARO - Entorno IA '))) + ' ' + pc.dim('v3.0'));
  console.log();

  if (!fs.existsSync(AGENTS_MD_PATH)) {
    fs.writeFileSync(AGENTS_MD_PATH, AGENTS_TEMPLATE);
    logStep(`Se ha creado un ${pc.green('AGENTS.md')} base en la raíz.`);
  }

  if (!fs.existsSync(PRD_MD_PATH)) {
    fs.writeFileSync(PRD_MD_PATH, PRD_TEMPLATE);
    logStep(`Se ha creado un ${pc.green('PRD.md')} base en la raíz.`);
  }

  if (!fs.existsSync(RFC_MD_PATH)) {
    fs.writeFileSync(RFC_MD_PATH, RFC_TEMPLATE);
    logStep(`Se ha creado un ${pc.green('RFC.md')} base en la raíz.`);
  }

  if (!fs.existsSync(SKILLS_DIR)) {
    fs.mkdirSync(SKILLS_DIR, { recursive: true });
    logStep(`Se ha creado la carpeta ${pc.green('skills/')} vacía. Añade skills y vuelve a ejecutar.`);
  }

  const availableSkills = fs.readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory() && fs.existsSync(path.join(SKILLS_DIR, d.name, 'SKILL.md')))
    .map(d => d.name);

  if (availableSkills.length > 0) {
    logStep(`Detectadas ${pc.green(availableSkills.length)} skills disponibles.`);
  }
  console.log();

  const detectedIds = AGENTS.filter(agent => {
    const root = path.join(REPO_ROOT, agent.dir.split('/')[0]);
    return fs.existsSync(root);
  }).map(a => a.id);

  const defaultSelection = [...new Set([...detectedIds, 'universal', 'copilot'])];

  const sortedAgents = [...AGENTS].sort((a, b) => {
    const aSelected = defaultSelection.includes(a.id);
    const bSelected = defaultSelection.includes(b.id);
    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;
    return a.name.localeCompare(b.name);
  });

  // 1. Preguntar IDEs
  const responseAgents = await prompts({
    type: 'multiselect',
    name: 'ids',
    message: 'Selecciona los IDEs / Asistentes:',
    choices: sortedAgents.map(a => ({
      title: a.name,
      description: defaultSelection.includes(a.id) ? 'Detectado' : '',
      value: a.id,
      selected: defaultSelection.includes(a.id)
    })),
    min: 1,
    optionsPerPage: 10,
    instructions: pc.dim('\n  ↑/↓: Mover | Espacio: Marcar | Intro: Confirmar')
  }, {
    onCancel: () => { console.log(pc.red('Operación cancelada.')); process.exit(0); }
  });

  const selectedAgentIds = responseAgents.ids;

  // 2. Preguntar Skills (¡AQUÍ ESTÁ LA BÚSQUEDA EN TIEMPO REAL!)
  let finalSkills =[];
  if (availableSkills.length > 0) {
    let activeSkillsSet = new Set();
    for (const agentId of selectedAgentIds) {
      const agent = AGENTS.find(a => a.id === agentId);
      const agentPath = path.join(REPO_ROOT, agent.dir);
      if (fs.existsSync(agentPath)) {
        try {
          fs.readdirSync(agentPath).filter(name => availableSkills.includes(name)).forEach(s => activeSkillsSet.add(s));
        } catch (e) {}
      }
    }
    
    const activeSkills = Array.from(activeSkillsSet);

    // autocompleteMultiselect: Permite escribir para buscar
    const responseSkills = await prompts({
      type: 'autocompleteMultiselect',
      name: 'skills',
      message: 'Selecciona las Skills a vincular (Escribe para buscar):',
      choices: availableSkills.map(s => ({
        title: s,
        value: s,
        selected: activeSkills.includes(s)
      })),
      optionsPerPage: 12,
      instructions: pc.dim('\n  Teclado: Buscar | Espacio: Marcar | Intro: Confirmar')
    }, {
      onCancel: () => { console.log(pc.red('Operación cancelada.')); process.exit(0); }
    });

    finalSkills = responseSkills.skills ||[];
  }

  console.log();
  process.stdout.write(pc.cyan('Sincronizando el entorno... '));

  try {
    let ops = { links: 0, cleaned: 0, copies: 0 };

    for (const agentId of selectedAgentIds) {
      const agent = AGENTS.find(a => a.id === agentId);
      const destDir = path.join(REPO_ROOT, agent.dir);
      const destRootDir = path.dirname(destDir);

      if (!fs.existsSync(destRootDir)) fs.mkdirSync(destRootDir, { recursive: true });
      if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

      if (agentId === 'copilot') {
        const githubDirs = ['.github/agents', '.github/instructions', '.github/prompts'];
        githubDirs.forEach(dir => {
          const dirPath = path.join(REPO_ROOT, dir);
          if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
        });
      }

      // LIMPIEZA PROFUNDA
      const installedItems = fs.readdirSync(destDir);
      for (const item of installedItems) {
        if (item === '.DS_Store') continue;

        if (!finalSkills.includes(item)) {
          const itemPath = path.join(destDir, item);
          try {
            const stat = fs.lstatSync(itemPath);
            if (stat.isDirectory()) {
              fs.rmSync(itemPath, { recursive: true, force: true });
            } else {
              fs.unlinkSync(itemPath); 
            }
            ops.cleaned++;
          } catch (err) {}
        }
      }

      // INSTALACIÓN
      for (const skill of finalSkills) {
        const src = path.join(SKILLS_DIR, skill);
        const dest = path.join(destDir, skill);

        if (fs.existsSync(dest)) {
          const stats = fs.lstatSync(dest);
          if (stats.isSymbolicLink()) continue; 
          if (stats.isDirectory()) {
            fs.rmSync(dest, { recursive: true, force: true }); 
          }
        }

        try {
          const type = process.platform === 'win32' ? 'junction' : 'dir';
          const relPath = path.relative(destDir, src);
          fs.symlinkSync(relPath, dest, type);
          ops.links++;
        } catch (e) {
          try {
            fs.cpSync(src, dest, { recursive: true });
            ops.copies++;
          } catch (err) {}
        }
      }

      // EXTRAS (AGENTS.md)
      if (agent.extra) {
        const srcFile = path.join(REPO_ROOT, agent.extra.src);
        if (fs.existsSync(srcFile)) {
          const destFile = path.join(REPO_ROOT, agent.extra.dest);
          const destFileDir = path.dirname(destFile);
          if (!fs.existsSync(destFileDir)) fs.mkdirSync(destFileDir, { recursive: true });
          fs.copyFileSync(srcFile, destFile);
        }
      }
    }

    console.log(pc.green('¡Completado!\n'));

    let msg = `✨ Entorno listo. ${pc.bold(ops.links)} skills vinculadas`;
    if (ops.copies > 0) msg += ` y ${ops.copies} copias`;
    if (ops.cleaned > 0) msg += ` (🧹 ${ops.cleaned} residuos eliminados)`;
    
    console.log(pc.green(msg));
    console.log();

  } catch (error) {
    console.log(pc.red('\nError durante la instalación:'));
    console.error(error.message);
  }
}

main();