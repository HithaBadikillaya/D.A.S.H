import fs from "fs";
import path from "path";


// FOLDER PATHS
const USER_TEMPLATE_DIR = path.join(process.cwd(), "templates", "user");
const SYSTEM_TEMPLATE_DIR = path.join(process.cwd(), "templates", "system");

// HELPERS
function ensureDirExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getUserTemplatePath(id) {
  return path.join(USER_TEMPLATE_DIR, `${id}.json`);
}

function readTemplatesFromDir(dir, isSystem = false) {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir).map(file => {
    const fullPath = path.join(dir, file);
    const data = fs.readFileSync(fullPath, "utf-8");

    return {
      ...JSON.parse(data),
      is_system_template: isSystem,
    };
  });
}


// CRUD SERVICES

// Get all templates (system + user)
export function getAllTemplates() {
  const systemTemplates = readTemplatesFromDir(SYSTEM_TEMPLATE_DIR, true);
  const userTemplates = readTemplatesFromDir(USER_TEMPLATE_DIR, false);

  return [...systemTemplates, ...userTemplates];
}

// Get a single user template by ID
export function getTemplateById(id) {
  const filePath = getUserTemplatePath(id);
  if (!fs.existsSync(filePath)) return null;

  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

// Create new user template
export function createTemplate(template) {
  ensureDirExists(USER_TEMPLATE_DIR);

  const filePath = getUserTemplatePath(template.id);
  if (fs.existsSync(filePath)) {
    throw new Error("Template already exists");
  }

  const templateToSave = {
    ...template,
    is_system_template: false, // user templates are always false
  };

  fs.writeFileSync(filePath, JSON.stringify(templateToSave, null, 2));
}

// Update user template
export function updateTemplate(id, updatedData) {
  const filePath = getUserTemplatePath(id);
  if (!fs.existsSync(filePath)) {
    throw new Error("Template not found");
  }

  const existing = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  if (existing.is_system_template) {
    throw new Error("System templates cannot be modified");
  }

  const updated = {
    ...existing,
    ...updatedData,
    id: existing.id, // protect ID
    is_system_template: false,
  };

  fs.writeFileSync(filePath, JSON.stringify(updated, null, 2));
}

// Delete user template
export function deleteTemplate(id) {
  const filePath = getUserTemplatePath(id);
  if (!fs.existsSync(filePath)) {
    throw new Error("Template not found");
  }

  const existing = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  if (existing.is_system_template) {
    throw new Error("System templates cannot be deleted");
  }

  fs.unlinkSync(filePath);
}


// DEBUG LOGS

console.log("USER_TEMPLATE_DIR:", USER_TEMPLATE_DIR);
console.log("SYSTEM_TEMPLATE_DIR:", SYSTEM_TEMPLATE_DIR);
