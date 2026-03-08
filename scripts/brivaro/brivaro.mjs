import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as clack from '@clack/prompts';
import pc from 'picocolors';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Asumiendo que el script está en scripts/brivaro/brivaro.mjs
const REPO_ROOT = path.resolve(__dirname, '../../');
const SKILLS_DIR = path.join(REPO_ROOT, 'skills');
const AGENTS_MD_PATH = path.join(REPO_ROOT, 'AGENTS.md');

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

async function main() {
  process.stdout.write('\x1Bc'); 
  
  clack.intro(pc.bgCyan(pc.black(pc.bold(' 🤖 SKILLS BRIVARO - Entorno IA '))) + ' ' + pc.dim('v2.1 (Auto-Clean)'));

  // 1. Asegurar que existe AGENTS.md
  if (!fs.existsSync(AGENTS_MD_PATH)) {
    fs.writeFileSync(AGENTS_MD_PATH, '# AGENTS.md\n\nEste documento proporciona el contexto, reglas y convenciones de este proyecto para los asistentes de IA.\n');
    clack.note(`Se ha creado un ${pc.green('AGENTS.md')} base en la raíz del proyecto.`, 'Archivo Creado');
  }

  // 2. Asegurar que existe la carpeta skills y leerlas
  if (!fs.existsSync(SKILLS_DIR)) {
    fs.mkdirSync(SKILLS_DIR, { recursive: true });
    clack.note(`Se ha creado la carpeta ${pc.green('skills/')} vacía. Añade skills y vuelve a ejecutar.`, 'Aviso');
  }

  const availableSkills = fs.readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory() && fs.existsSync(path.join(SKILLS_DIR, d.name, 'SKILL.md')))
    .map(d => d.name);

  if (availableSkills.length > 0) {
    clack.note(`Detectadas ${pc.cyan(availableSkills.length)} skills disponibles en la carpeta fuente.`, 'Estado');
  }

  // 3. Detectar IDEs instalados
  const detectedIds = AGENTS.filter(agent => {
    const root = path.join(REPO_ROOT, agent.dir.split('/')[0]);
    return fs.existsSync(root);
  }).map(a => a.id);

  const defaultSelection =[...new Set([...detectedIds, 'universal', 'copilot'])];

  const sortedAgents =[...AGENTS].sort((a, b) => {
    const aSelected = defaultSelection.includes(a.id);
    const bSelected = defaultSelection.includes(b.id);
    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;
    return a.name.localeCompare(b.name);
  });

  // 4. Preguntar IDEs
  const selectedAgentIds = await clack.multiselect({
    message: 'Selecciona las herramientas/IDEs con las que vas a trabajar:',
    options: sortedAgents.map(a => ({
      value: a.id,
      label: a.name,
      hint: defaultSelection.includes(a.id) ? 'Detectado/Recomendado' : ''
    })),
    initialValues: defaultSelection,
    required: true,
    // LA MAGIA: Calculamos el alto de la terminal y dejamos un margen de seguridad de 10 líneas
    maxItems: process.stdout.rows ? Math.max(5, process.stdout.rows - 10) : 10
  });

  if (clack.isCancel(selectedAgentIds) || selectedAgentIds.length === 0) {
    clack.cancel('Operación cancelada.');
    process.exit(0);
  }

  // 5. Preguntar Skills
  let finalSkills =[];
  if (availableSkills.length > 0) {
    const firstAgent = AGENTS.find(a => a.id === selectedAgentIds[0]);
    const firstAgentPath = path.join(REPO_ROOT, firstAgent.dir);
    let activeSkills =[];
    
    if (fs.existsSync(firstAgentPath)) {
      try {
        activeSkills = fs.readdirSync(firstAgentPath).filter(name => availableSkills.includes(name));
      } catch (e) {}
    }
    if (activeSkills.length === 0) activeSkills = availableSkills;

    const selectedSkills = await clack.multiselect({
      message: 'Selecciona las Skills a vincular:',
      options: availableSkills.map(s => ({ value: s, label: s })),
      initialValues: activeSkills,
      required: false,
      // LA MAGIA AQUÍ TAMBIÉN:
      maxItems: process.stdout.rows ? Math.max(5, process.stdout.rows - 10) : 10
    });

    if (clack.isCancel(selectedSkills)) {
      clack.cancel('Operación cancelada.');
      process.exit(0);
    }
    finalSkills = selectedSkills ||[];
  }

  // 6. Instalación y Configuración
  const spinner = clack.spinner();
  spinner.start('Configurando entorno y limpiando archivos residuales...');

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

      // A. LIMPIEZA PROFUNDA: Busca y destruye enlaces rotos, carpetas residuales y skills no seleccionadas
      const installedItems = fs.readdirSync(destDir);
      for (const item of installedItems) {
        // Ignoramos archivos invisibles del sistema como .DS_Store en Mac
        if (item === '.DS_Store') continue;

        // Si el elemento en el destino NO está en nuestra lista de skills final, es residual. A la basura.
        if (!finalSkills.includes(item)) {
          const itemPath = path.join(destDir, item);
          try {
            const stat = fs.lstatSync(itemPath);
            if (stat.isDirectory()) {
              fs.rmSync(itemPath, { recursive: true, force: true });
            } else {
              // fs.unlinkSync borra archivos y symlinks (incluso los rotos)
              fs.unlinkSync(itemPath); 
            }
            ops.cleaned++;
          } catch (err) {
            // Ignoramos si ya se borró de otra forma
          }
        }
      }

      // B. INSTALACIÓN (Symlinks inteligentes / Junctions)
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

      // C. EXTRAS (Mapeo de AGENTS.md)
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

    spinner.stop('¡Entorno de IA configurado y purgado con éxito!');

    let msg = `✨ Todo listo. ${ops.links} skills vinculadas`;
    if (ops.copies > 0) msg += ` y ${ops.copies} copias`;
    if (ops.cleaned > 0) msg += ` (🧹 ${ops.cleaned} residuos eliminados)`;
    
    clack.outro(pc.green(msg));

  } catch (error) {
    spinner.stop('Error durante la instalación.');
    console.error(pc.red(error.message));
  }
}

main();