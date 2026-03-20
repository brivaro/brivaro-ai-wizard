#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import prompts from 'prompts';
import pc from 'picocolors';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = process.cwd();
const CLI_ROOT = path.resolve(__dirname, '../../');

// --- SKILLS: fuente de verdad centralizada en el proyecto destino ---
const PROJECT_SKILLS_DIR = path.join(PROJECT_ROOT, 'skills');

// --- RUTAS Y PLANTILLAS DE DOCUMENTACIÓN ---
const DOCS_DIR = path.join(PROJECT_ROOT, 'docs');
const ARCHITECTURE_MD_PATH = path.join(DOCS_DIR, 'architecture.md');

// --- RUTAS PARA TOOLS ---
const TOOLS_DIR = path.join(PROJECT_ROOT, 'tools');

// --- RUTAS DE ARCHIVOS DE PROYECTO ---
const AGENTS_MD_PATH = path.join(PROJECT_ROOT, 'AGENTS.md');
const PRD_MD_PATH = path.join(PROJECT_ROOT, 'PRD.md');
const RFC_MD_PATH = path.join(PROJECT_ROOT, 'RFC.md');

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
- review-project: Analyzes a project to find implementable ideas and areas for improvement — skills/revisar-el-proyecto/SKILL.md

## Buenas prácticas

- Mantén las entradas de \`SKILL.md\` pequeñas y enfocadas.
- Cuando crees una nueva skill, actualiza la sección "Available Skills".
- Para cambios en infra/CI, añade la skill correspondiente en la tabla "Auto-invoke Rules".

## Antes de crear un PR

1. Sigue la convención de commits: \`<type>[scope]: <descripción>\` (feat, fix, docs, chore, test).
2. Ejecuta linters y tests relevantes.
3. Añade una entrada de changelog si aplica.
`;

const ARCHITECTURE_TEMPLATE = `# Arquitectura del Proyecto

## Visión general
Breve descripción de la arquitectura general, componentes principales y responsabilidades. Si hay muchos elementos de infraestructura, considera crear subdocumentos para cada uno y meterlos por separado en la carpeta \`docs/architecture/\` para explicar cada componente de forma resumida y no inundar al agente de IA con información excesiva.

## Componentes
- **Frontend**: descripción, tecnologías.
- **Backend / API**: descripción, endpoints clave, responsabilidades.
- **Bases de datos**: modelos, particionamiento/replicación, backups.
- **Integraciones externas**: colas, servicios de terceros, autenticación.

## Decisiones de diseño
- Resumen de decisiones arquitectónicas clave, con enlaces a los documentos en \`docs/decisions/\` que expliquen cada decisión de forma resumida (ej. elección de base de datos, patróns de diseño, etc.).

## Diagramas
- Incluye diagramas de alto nivel (referenciar imágenes o archivos dot/mermaid).

## Escalabilidad y disponibilidad
- Consideraciones para scale-out, balanceo, tolerancia a fallos.

## Seguridad
- Autenticación, autorización, gestión de secretos, límites de rate.

## Operaciones y runbooks
- Referencia a la carpeta \`runbooks/\` para procedimientos operativos.
`;

// --- CONFIGURACIÓN EXACTA DE AGENTES ---
const AGENTS = [
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

function logWarn(text) {
  console.log(pc.yellow('⚠') + ' ' + text);
}

function logError(text) {
  console.log(pc.red('✖') + ' ' + text);
}

/**
 * Detecta la carpeta "contenedor de skills" dentro de un directorio dado.
 *
 * Estrategia (en orden de prioridad):
 *  1. ¿Existe <repoDir>/skills/ con al menos una skill? → devuélvela
 *  2. ¿Existe <repoDir>/<sub>/skills/ con al menos una skill? → devuélvela
 *  3. Búsqueda recursiva (max depth 4): recoge TODOS los dirs que tengan
 *     SKILL.md dentro (sin importar a qué nivel). Los agrega en un dir
 *     virtual _skills_agg/ dentro del repo para no perder ninguna.
 */
function detectSkillsDir(repoDir) {
  // 1. Ruta directa
  const direct = path.join(repoDir, 'skills');
  if (fs.existsSync(direct) && listSkillsIn(direct).length > 0) return direct;

  // 2. Monorepo de primer nivel
  for (const entry of fs.readdirSync(repoDir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
    const candidate = path.join(repoDir, entry.name, 'skills');
    if (fs.existsSync(candidate) && listSkillsIn(candidate).length > 0) return candidate;
  }

  // 3. Búsqueda recursiva — colectar TODAS las skill-dirs sin importar padre
  const SKIP_DIRS = new Set(['.git', 'node_modules', '.github', '__pycache__', '_skills_agg']);

  /** @type {Array<{name: string, fullPath: string}>} */
  const allSkills = [];

  function walk(dir, depth) {
    if (depth > 4) return;
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }

    for (const entry of entries) {
      if (!entry.isDirectory() || SKIP_DIRS.has(entry.name)) continue;
      const fullPath = path.join(dir, entry.name);
      const skillMd = path.join(fullPath, 'SKILL.md');

      if (fs.existsSync(skillMd)) {
        allSkills.push({ name: entry.name, fullPath });
      } else {
        // Seguir bajando
        walk(fullPath, depth + 1);
      }
    }
  }

  walk(repoDir, 0);

  if (allSkills.length === 0) return null;

  // Crear un directorio virtual de agregación con junctions/symlinks
  // a TODAS las skills encontradas. Vive dentro del tmpDir → se limpia solo.
  const aggDir = path.join(repoDir, '_skills_agg');
  fs.mkdirSync(aggDir, { recursive: true });

  const type = process.platform === 'win32' ? 'junction' : 'dir';
  const seen = new Set();

  for (const skill of allSkills) {
    // Si hay nombre duplicado, el primero encontrado gana
    if (seen.has(skill.name)) continue;
    seen.add(skill.name);

    const dest = path.join(aggDir, skill.name);
    try {
      fs.symlinkSync(skill.fullPath, dest, type);
    } catch { }
  }

  return aggDir;
}

/**
 * Lista las skills válidas (carpetas con SKILL.md) en un directorio.
 * Usa fs.statSync (sigue symlinks/junctions) para compatibilidad con Windows.
 */
function listSkillsIn(skillsDir) {
  if (!fs.existsSync(skillsDir)) return [];
  return fs.readdirSync(skillsDir)
    .filter(name => {
      const full = path.join(skillsDir, name);
      try {
        return fs.statSync(full).isDirectory() &&
          fs.existsSync(path.join(full, 'SKILL.md'));
      } catch { return false; }
    });
}

/**
 * Clona un repo remoto en un directorio temporal y devuelve la info.
 * Usa --depth=1 y --single-branch para no bajar nada innecesario.
 * El llamador es responsable de limpiar tmpDir.
 */
async function cloneRemoteRepo(url) {
  const tmpDir = path.join(os.tmpdir(), `brivaro-remote-${Date.now()}`);

  logStep(`Clonando ${pc.bold(url)} en directorio temporal...`);

  try {
    execSync(
      `git clone --depth=1 --single-branch "${url}" "${tmpDir}"`,
      { stdio: 'pipe', timeout: 60_000 }
    );
  } catch (err) {
    // Limpiar en caso de error parcial
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch { }
    const msg = err.stderr?.toString().trim() || err.message;
    throw new Error(`git clone falló: ${msg}`);
  }

  const skillsDir = detectSkillsDir(tmpDir);
  if (!skillsDir) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    throw new Error('No se encontró ninguna carpeta skills/ en el repositorio.');
  }

  const skills = listSkillsIn(skillsDir);
  if (skills.length === 0) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    throw new Error('La carpeta skills/ del repositorio no contiene ninguna skill válida (sin SKILL.md).');
  }

  return { tmpDir, skillsDir, skills };
}

/**
 * Instala skills de una fuente al PROJECT_SKILLS_DIR (additive: no sobreescribe existentes).
 * Devuelve { installed, skipped }.
 */
function installSkillsToRoot(sourceSkillsDir, selectedSkills) {
  if (!fs.existsSync(PROJECT_SKILLS_DIR)) {
    fs.mkdirSync(PROJECT_SKILLS_DIR, { recursive: true });
    logStep(`Creada carpeta centralizada ${pc.green('skills/')} en la raíz del proyecto.`);
  }

  let installed = 0;
  let skipped = 0;

  for (const skill of selectedSkills) {
    const src = path.join(sourceSkillsDir, skill);
    const dest = path.join(PROJECT_SKILLS_DIR, skill);

    if (fs.existsSync(dest)) {
      skipped++;
      continue; // additive: no sobreescribir
    }

    try {
      // En Windows, si src es una junction (caso _skills_agg), fs.cpSync intenta
      // replicarla como symlink → EPERM sin permisos de admin.
      // realpathSync resuelve el enlace y copiamos el directorio real.
      const realSrc = fs.realpathSync(src);
      fs.cpSync(realSrc, dest, { recursive: true });
      installed++;
    } catch (err) {
      logWarn(`No se pudo copiar la skill ${pc.bold(skill)}: ${err.message}`);
    }
  }

  return { installed, skipped };
}

/**
 * Crea un symlink relativo de un agentSkillDir/skillName → PROJECT_SKILLS_DIR/skillName.
 * Si ya existe un symlink válido, no hace nada. Si hay un dir físico, lo deja (no destruye nada).
 * Si el symlink está roto, lo elimina y recrea.
 */
function installSymlinkForAgent(agentSkillsDir, skillName) {
  const dest = path.join(agentSkillsDir, skillName);
  const src = path.join(PROJECT_SKILLS_DIR, skillName);
  const relPath = path.relative(agentSkillsDir, src);

  if (fs.existsSync(dest)) {
    const stat = fs.lstatSync(dest);
    if (stat.isSymbolicLink()) {
      // Comprobar si el symlink está roto
      try {
        fs.realpathSync(dest);
        return 'skip'; // symlink válido ya existe
      } catch {
        // Roto: lo eliminamos para recrear
        fs.unlinkSync(dest);
      }
    } else {
      // Es un directorio físico: lo dejamos tal cual (additive)
      return 'skip';
    }
  }

  try {
    const type = process.platform === 'win32' ? 'junction' : 'dir';
    fs.symlinkSync(relPath, dest, type);
    return 'linked';
  } catch {
    // Fallback: copia física
    try {
      fs.cpSync(src, dest, { recursive: true });
      return 'copied';
    } catch {
      return 'error';
    }
  }
}

/**
 * Elimina symlinks rotos en un directorio de agente (mantenimiento silencioso).
 */
function cleanBrokenSymlinks(dir) {
  if (!fs.existsSync(dir)) return;
  for (const item of fs.readdirSync(dir)) {
    const itemPath = path.join(dir, item);
    try {
      const stat = fs.lstatSync(itemPath);
      if (stat.isSymbolicLink()) {
        try { fs.realpathSync(itemPath); } catch {
          fs.unlinkSync(itemPath); // roto
        }
      }
    } catch { }
  }
}

async function main() {
  console.clear();
  console.log(pc.bgCyan(pc.black(pc.bold(' 🤖 SKILLS BRIVARO - Entorno IA '))) + ' ' + pc.dim('v4.0'));
  console.log();

  // --- 1. SELECCIÓN DE FUENTE ---
  const sourceResponse = await prompts({
    type: 'select',
    name: 'source',
    message: '¿De dónde quieres cargar las skills?',
    choices: [
      { title: '📦 Repo Brivaro-Wizard', value: 'cli' },
      { title: '💻 Repo Proyecto Actual', value: 'project' },
      { title: '🌐 Repo remoto (URL)', value: 'remote' },
    ],
    initial: 0
  }, {
    onCancel: () => { console.log(pc.red('Operación cancelada.')); process.exit(0); }
  });

  let SKILLS_SOURCE_DIR;
  let tmpDirToClean = null;

  if (sourceResponse.source === 'cli') {
    SKILLS_SOURCE_DIR = path.join(CLI_ROOT, 'skills');

    if (!fs.existsSync(SKILLS_SOURCE_DIR)) {
      logError('No existe carpeta skills/ en el repositorio Brivaro-Wizard.');
      process.exit(1);
    }

  } else if (sourceResponse.source === 'project') {
    SKILLS_SOURCE_DIR = PROJECT_SKILLS_DIR;

    if (!fs.existsSync(SKILLS_SOURCE_DIR)) {
      logWarn('No existe carpeta skills/ en este proyecto.');
      process.exit(1);
    }

  } else {
    // --- FUENTE REMOTA ---
    const urlResponse = await prompts({
      type: 'text',
      name: 'url',
      message: 'URL del repositorio Git (ej: https://github.com/user/repo):',
      validate: v => v.trim().length > 0 ? true : 'La URL no puede estar vacía'
    }, {
      onCancel: () => { console.log(pc.red('Operación cancelada.')); process.exit(0); }
    });

    console.log();
    try {
      const { tmpDir, skillsDir, skills } = await cloneRemoteRepo(urlResponse.url.trim());
      tmpDirToClean = tmpDir;
      SKILLS_SOURCE_DIR = skillsDir;
      logStep(`Encontradas ${pc.green(skills.length)} skills en el repositorio remoto.`);
    } catch (err) {
      logError(err.message);
      process.exit(1);
    }
    console.log();
  }

  // --- 2. ARCHIVOS BASE (AGENTS.md, PRD, RFC) ---
  const fileOptions = [
    { title: 'AGENTS.md', value: 'agents' },
    { title: 'PRD.md', value: 'prd' },
    { title: 'RFC.md', value: 'rfc' }
  ];

  const responseFiles = await prompts({
    type: 'multiselect',
    name: 'files',
    message: '¿Qué archivos quieres crear?',
    choices: fileOptions,
    instructions: pc.dim('\n  ↑/↓: Mover | Espacio: Marcar | Intro: Confirmar')
  }, {
    onCancel: () => {
      cleanup(tmpDirToClean);
      console.log(pc.red('Operación cancelada.'));
      process.exit(0);
    }
  });

  const selectedFiles = responseFiles.files || [];

  if (selectedFiles.includes('agents') && !fs.existsSync(AGENTS_MD_PATH)) {
    fs.writeFileSync(AGENTS_MD_PATH, AGENTS_TEMPLATE);
    logStep(`Se ha creado un ${pc.green('AGENTS.md')} base en la raíz.`);
  }

  if (selectedFiles.includes('prd') && !fs.existsSync(PRD_MD_PATH)) {
    fs.writeFileSync(PRD_MD_PATH, PRD_TEMPLATE);
    logStep(`Se ha creado un ${pc.green('PRD.md')} base en la raíz.`);
  }

  if (selectedFiles.includes('rfc') && !fs.existsSync(RFC_MD_PATH)) {
    fs.writeFileSync(RFC_MD_PATH, RFC_TEMPLATE);
    logStep(`Se ha creado un ${pc.green('RFC.md')} base en la raíz.`);
  }

  // --- 3. LISTAR SKILLS DISPONIBLES ---
  const availableSkills = listSkillsIn(SKILLS_SOURCE_DIR);

  if (availableSkills.length > 0) {
    logStep(`Detectadas ${pc.green(availableSkills.length)} skills disponibles.`);
  } else {
    logWarn('No se encontraron skills válidas en la fuente seleccionada.');
    cleanup(tmpDirToClean);
    process.exit(0);
  }
  console.log();

  // --- 4. SELECCIÓN DE AGENTES ---
  const detectedIds = AGENTS.filter(agent => {
    const root = path.join(PROJECT_ROOT, agent.dir.split('/')[0]);
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
    onCancel: () => {
      cleanup(tmpDirToClean);
      console.log(pc.red('Operación cancelada.'));
      process.exit(0);
    }
  });

  const selectedAgentIds = responseAgents.ids;

  // --- 5. SELECCIÓN DE SKILLS ---
  // Pre-marcar las que ya están en PROJECT_SKILLS_DIR
  const alreadyInstalledSkills = listSkillsIn(PROJECT_SKILLS_DIR);

  const responseSkills = await prompts({
    type: 'autocompleteMultiselect',
    name: 'skills',
    message: 'Selecciona las Skills a instalar (Escribe para buscar):',
    choices: availableSkills.map(s => ({
      title: alreadyInstalledSkills.includes(s) ? `${s} ${pc.dim('(ya instalada)')}` : s,
      value: s,
      selected: alreadyInstalledSkills.includes(s)
    })),
    optionsPerPage: 12,
    instructions: pc.dim('\n  Teclado: Buscar | Espacio: Marcar | Intro: Confirmar')
  }, {
    onCancel: () => {
      cleanup(tmpDirToClean);
      console.log(pc.red('Operación cancelada.'));
      process.exit(0);
    }
  });

  const finalSkills = responseSkills.skills || [];

  // --- 6. DOCS Y TOOLS (opcional) ---
  const docsResponse = await prompts({
    type: 'confirm',
    name: 'createDocs',
    message: '¿Crear estructura `docs/` para documentación del proyecto?',
    initial: true
  }, {
    onCancel: () => {
      cleanup(tmpDirToClean);
      console.log(pc.red('Operación cancelada.'));
      process.exit(0);
    }
  });

  if (docsResponse.createDocs) {
    try {
      if (!fs.existsSync(DOCS_DIR)) fs.mkdirSync(DOCS_DIR, { recursive: true });
      if (!fs.existsSync(ARCHITECTURE_MD_PATH)) {
        fs.writeFileSync(ARCHITECTURE_MD_PATH, ARCHITECTURE_TEMPLATE);
        logStep(`Se ha creado ${pc.green('docs/architecture.md')}.`);
      }
      const decisionsDir = path.join(DOCS_DIR, 'decisions');
      const runbooksDir = path.join(DOCS_DIR, 'runbooks');
      const architectureDir = path.join(DOCS_DIR, 'architecture');
      if (!fs.existsSync(decisionsDir)) fs.mkdirSync(decisionsDir, { recursive: true });
      if (!fs.existsSync(runbooksDir)) fs.mkdirSync(runbooksDir, { recursive: true });
      if (!fs.existsSync(architectureDir)) fs.mkdirSync(architectureDir, { recursive: true });
      logStep(`Creadas ${pc.green('docs/decisions/')} y ${pc.green('docs/runbooks/')}.`);
    } catch (err) {
      logError(`Error al crear docs/: ${err.message}`);
    }
  }

  const toolsResponse = await prompts({
    type: 'confirm',
    name: 'createTools',
    message: '¿Crear estructura `tools/` con `scripts/` y `prompts/`?',
    initial: false
  }, {
    onCancel: () => {
      cleanup(tmpDirToClean);
      console.log(pc.red('Operación cancelada.'));
      process.exit(0);
    }
  });

  if (toolsResponse.createTools) {
    try {
      const toolsScripts = path.join(TOOLS_DIR, 'scripts');
      const toolsPrompts = path.join(TOOLS_DIR, 'prompts');
      if (!fs.existsSync(toolsScripts)) fs.mkdirSync(toolsScripts, { recursive: true });
      if (!fs.existsSync(toolsPrompts)) fs.mkdirSync(toolsPrompts, { recursive: true });
      logStep(`Creadas ${pc.green('tools/scripts/')} y ${pc.green('tools/prompts/')}.`);
    } catch (err) {
      logError(`Error al crear tools/: ${err.message}`);
    }
  }

  // --- 7. INSTALACIÓN ---
  console.log();
  process.stdout.write(pc.cyan('Sincronizando el entorno...\n'));

  try {
    // 7a. Copiar skills seleccionadas a skills/ raíz (fuente de verdad del proyecto)
    // Solo si la fuente no ES ya el PROJECT_SKILLS_DIR
    let installResult = { installed: 0, skipped: 0 };
    if (sourceResponse.source !== 'project') {
      installResult = installSkillsToRoot(SKILLS_SOURCE_DIR, finalSkills);
    } else {
      // Fuente = proyecto actual: skills ya están en su sitio
      installResult.skipped = finalSkills.length;
    }

    // 7b. Crear symlinks en cada carpeta de agente → skills/ raíz
    let ops = { links: 0, copies: 0, skipped: 0 };

    for (const agentId of selectedAgentIds) {
      const agent = AGENTS.find(a => a.id === agentId);
      const agentSkillsDir = path.join(PROJECT_ROOT, agent.dir);
      const agentRootDir = path.dirname(agentSkillsDir);

      if (!fs.existsSync(agentRootDir)) fs.mkdirSync(agentRootDir, { recursive: true });
      if (!fs.existsSync(agentSkillsDir)) fs.mkdirSync(agentSkillsDir, { recursive: true });

      // Limpieza de symlinks rotos (mantenimiento silencioso)
      cleanBrokenSymlinks(agentSkillsDir);

      // Directorios extra para copilot
      if (agentId === 'copilot') {
        ['.github/agents', '.github/instructions', '.github/prompts'].forEach(dir => {
          const dirPath = path.join(PROJECT_ROOT, dir);
          if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
        });
      }

      // Directorios extra para universal (opencode)
      if (agentId === 'universal') {
        const opencodeDir = path.join(PROJECT_ROOT, '.opencode');
        if (!fs.existsSync(opencodeDir)) fs.mkdirSync(opencodeDir, { recursive: true });
        ['agents', 'commands', 'modes', 'plugins', 'skills', 'tools'].forEach(sd => {
          const p = path.join(opencodeDir, sd);
          if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
        });
        logStep(`Creada carpeta ${pc.green('.opencode/')} con subdirectorios básicos.`);

        // Symlinks también en .opencode/skills
        const opencodeSkillsDir = path.join(opencodeDir, 'skills');
        cleanBrokenSymlinks(opencodeSkillsDir);
        for (const skill of finalSkills) {
          const result = installSymlinkForAgent(opencodeSkillsDir, skill);
          if (result === 'linked') ops.links++;
          else if (result === 'copied') ops.copies++;
          else if (result === 'skip') ops.skipped++;
        }
      }

      // Symlinks en la carpeta del agente
      for (const skill of finalSkills) {
        const result = installSymlinkForAgent(agentSkillsDir, skill);
        if (result === 'linked') ops.links++;
        else if (result === 'copied') ops.copies++;
        else if (result === 'skip') ops.skipped++;
      }

      // EXTRAS (AGENTS.md → copilot-instructions.md, CLAUDE.md, GEMINI.md)
      if (agent.extra) {
        const srcFile = path.join(PROJECT_ROOT, agent.extra.src);
        if (fs.existsSync(srcFile)) {
          const destFile = path.join(PROJECT_ROOT, agent.extra.dest);
          const destFileDir = path.dirname(destFile);
          if (!fs.existsSync(destFileDir)) fs.mkdirSync(destFileDir, { recursive: true });
          fs.copyFileSync(srcFile, destFile);
        }
      }
    }

    console.log(pc.green('¡Completado!\n'));

    // Resumen de instalación
    if (installResult.installed > 0) {
      logStep(`${pc.green(installResult.installed)} skills copiadas a ${pc.bold('skills/')} (fuente de verdad).`);
    }
    if (installResult.skipped > 0) {
      logStep(`${pc.dim(installResult.skipped)} skills ya existían en ${pc.bold('skills/')} — sin cambios (additive).`);
    }

    let msg = `✨ Entorno listo. ${pc.bold(ops.links)} symlinks creados`;
    if (ops.copies > 0) msg += ` y ${ops.copies} copias de respaldo`;
    if (ops.skipped > 0) msg += ` (${ops.skipped} ya estaban vinculados)`;

    console.log(pc.green(msg));
    console.log();

  } catch (error) {
    console.log(pc.red('\nError durante la instalación:'));
    console.error(error.message);
  } finally {
    // Siempre limpiar el directorio temporal del repo remoto
    cleanup(tmpDirToClean);
  }
}

/**
 * Elimina el directorio temporal si existe.
 */
function cleanup(tmpDir) {
  if (!tmpDir) return;
  try {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  } catch { }
}

main();