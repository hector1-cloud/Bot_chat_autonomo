import { execSync } from 'child_process';
import fs from 'fs';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("❌ Falta la variable GEMINI_API_KEY en los Secrets.");
  process.exit(1);
}

async function runAutoHeal() {
  console.log("🤖 [Agente]: Analizando errores de compilación...");

  // 1. Obtener la salida del error
  let buildOutput = "";
  try {
    execSync("npm run build", { encoding: "utf-8", stdio: "pipe" });
    console.log("✅ No se detectaron errores.");
    return;
  } catch (error) {
    buildOutput = (error.stdout || "") + "\n" + (error.stderr || "");
  }

  // 2. Localizar el archivo con el error
  const fileMatch = buildOutput.match(/([a-zA-Z0-9_\-\/]+\.(ts|js|tsx|jsx)):(\d+):(\d+)/);
  if (!fileMatch) {
    console.error("⚠️ No se pudo identificar la ruta exacta del archivo con el error.");
    process.exit(1);
  }

  const filePath = fileMatch[1];
  console.log(`📌 Archivo afectado: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ El archivo ${filePath} no existe.`);
    process.exit(1);
  }

  const originalCode = fs.readFileSync(filePath, "utf-8");

  // 3. Prompt para el modelo de IA
  const prompt = `
Eres un desarrollador Senior en TypeScript y Node.js.
Ocurrió un error de compilación en el archivo: ${filePath}

DETALLE DEL ERROR:
${buildOutput}

CÓDIGO ORIGINAL (${filePath}):
\`\`\`typescript
${originalCode}
\`\`\`

INSTRUCCIONES:
Devuelve ÚNICAMENTE el código completo corregido.
No agregues explicaciones ni marcas markdown adicionales fuera del bloque de código.
`;

  console.log("🧠 Consultando la corrección al modelo de IA...");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    }
  );

  const data = await response.json();
  let fixedCode = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!fixedCode) {
    console.error("❌ La IA no generó respuesta válida.", JSON.stringify(data));
    process.exit(1);
  }

  // Limpiar envoltorios markdown si existen
  fixedCode = fixedCode.replace(/^```[a-z]*\n/i, "").replace(/\n```$/, "").trim();

  // 4. Sobrescribir archivo
  fs.writeFileSync(filePath, fixedCode, "utf-8");
  console.log(`📝 [Agente]: Archivo sobrescrito con el parche en ${filePath}`);

  // 5. Push automático
  try {
    execSync('git config user.name "Auto-Heal-Bot"');
    execSync('git config user.email "bot@github.com"');
    execSync(`git add ${filePath}`);
    execSync('git commit -m "fix(auto-heal): corrección automática de compilación por Agente IA"');
    execSync('git push origin HEAD');
    console.log("🚀 [Agente]: Cambios enviados al repositorio con éxito.");
  } catch (gitErr) {
    console.error("⚠️ Error durante el git push:", gitErr.message);
  }
}

runAutoHeal();
